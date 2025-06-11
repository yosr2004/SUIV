const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

// Import des routes
const messageRoutes = require('./backend/routes/messageRoutes');
const authRoutes = require('./backend/routes/authRoutes');
const profileRoutes = require('./backend/routes/profileRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Dossier pour les pièces jointes
const uploadDirs = [
  './uploads',
  './uploads/attachments',
  './uploads/avatars'
];

// Créer les dossiers s'ils n'existent pas
uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Dossier créé: ${dir}`);
  }
});

// Servir les fichiers statiques
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes API
app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);
app.use('/messages', messageRoutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000', // URL de votre application React
    methods: ['GET', 'POST'],
  },
});

// Structure de données pour stocker les utilisateurs connectés et les messages
const onlineUsers = new Map();
const messages = [];
const processedMessages = new Map(); // Pour éviter les duplications de messages

// Fonction pour obtenir tous les messages entre deux utilisateurs
function getConversation(user1Id, user2Id) {
  return messages.filter(
    msg => 
      (msg.senderId === user1Id && msg.recipientId === user2Id) ||
      (msg.senderId === user2Id && msg.recipientId === user1Id)
  ).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
}

// Fonction pour diffuser les statuts en ligne
const broadcastOnlineStatus = async () => {
  try {
    // Récupérer tous les utilisateurs en ligne depuis la base de données
    const User = require('./backend/models/user');
    const onlineUsers = await User.find({ isOnline: true })
      .select('_id firstName lastName avatar socketId isOnline lastSeen');
    
    // Créer une liste des utilisateurs en ligne
    const onlineUsersList = onlineUsers.map(user => ({
      userId: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      socketId: user.socketId,
      isOnline: true,
      lastSeen: user.lastSeen
    }));
    
    // Diffuser la liste des utilisateurs en ligne à tous les clients avec tous les formats possibles
    io.emit('userList', onlineUsersList);
    io.emit('online_users', onlineUsersList);
    io.emit('user_status_updated', onlineUsersList);
    
    console.log(`📊 Liste des utilisateurs en ligne diffusée: ${onlineUsersList.length} utilisateurs`);
  } catch (error) {
    console.error('❌ Erreur lors de la diffusion des statuts en ligne:', error);
  }
};

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/suiv_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connexion à MongoDB établie');
})
.catch(err => {
  console.error('Erreur de connexion à MongoDB:', err);
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  
  // Récupérer l'ID utilisateur depuis la requête
  const userId = socket.handshake.query.userId;
  
  // Valider l'ID utilisateur avant de l'utiliser
  const isValidUserId = userId && userId !== "null" && userId !== "undefined" && 
                      mongoose.Types.ObjectId.isValid(userId);
  
  if (isValidUserId) {
    // Enregistrer l'utilisateur comme étant en ligne
    onlineUsers.set(userId, { socketId: socket.id, lastSeen: new Date() });
    
    // Mettre à jour le statut en ligne dans la base de données
    const User = require('./backend/models/user');
    User.findByIdAndUpdate(userId, { 
      isOnline: true, 
      socketId: socket.id,
      lastSeen: new Date()
    }).then(() => {
      // Diffuser les statuts mis à jour une fois que la base de données est mise à jour
      setTimeout(broadcastOnlineStatus, 500);
    }).catch(err => console.error('Erreur lors de la mise à jour du statut utilisateur:', err));
    
    // Diffuser le statut "en ligne" aux autres utilisateurs
    socket.broadcast.emit('user_status', { userId, status: 'online' });
    
    // Envoyer la liste des utilisateurs en ligne au client qui vient de se connecter
    const onlineUsersList = Array.from(onlineUsers.keys()).map(id => ({
      userId: id,
      lastSeen: onlineUsers.get(id).lastSeen,
    }));
    socket.emit('online_users', onlineUsersList);
  } else {
    console.log(`Utilisateur avec ID invalide tenté de se connecter: ${userId}`);
  }
  
  // Gérer les pings pour maintenir la connexion active
  socket.on('ping', ({ userId }) => {
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      // Mettre à jour la correspondance userId <-> socketId
      onlineUsers.set(userId, { socketId: socket.id, lastSeen: new Date() });
    }
  });

  // Écouter les nouveaux messages
  const handleNewMessage = async (messageData) => {
    console.log('New message:', messageData);
    
    try {
      // Générer un ID unique pour déduplication
      const uniqueMessageId = messageData.uniqueId || 
        messageData._id || 
        messageData.id || 
        `${messageData.senderId}-${messageData.receiverId || messageData.recipientId}-${messageData.timestamp || new Date().toISOString()}-${messageData.message || messageData.content || ""}`;
      
      // Vérifier si ce message a déjà été traité
      if (processedMessages.has(uniqueMessageId)) {
        console.log(`Message already processed: ${uniqueMessageId}`);
        return;
      }
      
      // Marquer le message comme traité
      processedMessages.set(uniqueMessageId, Date.now());
      
      // Nettoyer les anciens messages traités
      const now = Date.now();
      for (const [key, timestamp] of processedMessages.entries()) {
        // Supprimer les entrées datant de plus d'une heure
        if (now - timestamp > 3600000) {
          processedMessages.delete(key);
        }
      }
      
      // Normaliser les données pour éviter les problèmes de compatibilité
      const normalizedData = {
        senderId: messageData.senderId,
        receiverId: messageData.receiverId || messageData.recipientId,
        content: messageData.content || messageData.message || "",
        conversationId: messageData.conversationId,
        fileUrl: messageData.fileUrl,
        uniqueId: uniqueMessageId
      };
      
      // Vérifier la validité des IDs
      const validateId = (id) => {
        if (!id || id === "null" || id === "undefined") return false;
        return mongoose.Types.ObjectId.isValid(id);
      };
      
      if (!validateId(normalizedData.senderId) || !validateId(normalizedData.receiverId)) {
        socket.emit("error", { message: "Invalid user ID format" });
        return;
      }
      
      // Si on utilise la nouvelle API, créer un document de message en BDD
      if (normalizedData.conversationId && validateId(normalizedData.conversationId)) {
        const Message = require('./backend/models/message');
        const Conversation = require('./backend/models/conversation');
        
        // S'assurer que content a une valeur
        if (normalizedData.content === undefined || normalizedData.content === null) {
          normalizedData.content = "";
        }
        
        // Créer le message dans la base de données
        const newMessage = new Message({
          senderId: normalizedData.senderId,
          receiverId: normalizedData.receiverId,
          conversationId: normalizedData.conversationId,
          content: normalizedData.content,
          status: 'sent'
        });
        
        const savedMessage = await newMessage.save();
        console.log(`Message saved to database with ID: ${savedMessage._id}`);
        
        // Mettre à jour la conversation avec le dernier message
        await Conversation.findByIdAndUpdate(normalizedData.conversationId, {
          lastMessage: savedMessage._id,
          lastMessageText: normalizedData.content || "Pièce jointe",
          lastMessageTime: new Date()
        });
        
        // Incrémenter le compteur de messages non lus pour le destinataire
        const conversation = await Conversation.findById(normalizedData.conversationId);
        if (conversation) {
          const unreadCountUpdate = {};
          const currentCount = conversation.unreadCount ? (conversation.unreadCount.get(normalizedData.receiverId) || 0) : 0;
          unreadCountUpdate[`unreadCount.${normalizedData.receiverId}`] = currentCount + 1;
          
          await Conversation.findByIdAndUpdate(normalizedData.conversationId, {
            $set: unreadCountUpdate
          });
        }
        
        // Mettre à jour messageData avec l'ID du message en base de données
        messageData.id = savedMessage._id;
      } else {
        // Si conversationId n'est pas fourni, essayer de trouver ou créer une conversation
        try {
          const Conversation = require('./backend/models/conversation');
          const Message = require('./backend/models/message');
          
          // Trouver une conversation existante entre ces utilisateurs
          let conversation = await Conversation.findOne({
            participants: { $all: [normalizedData.senderId, normalizedData.receiverId] },
            type: 'direct'
          });
          
          // Si pas de conversation, en créer une nouvelle
          if (!conversation) {
            conversation = new Conversation({
              participants: [normalizedData.senderId, normalizedData.receiverId],
              type: 'direct',
              lastMessageTime: new Date()
            });
            
            await conversation.save();
            console.log(`New conversation created with ID: ${conversation._id}`);
          }
          
          // S'assurer que content a une valeur
          if (normalizedData.content === undefined || normalizedData.content === null) {
            normalizedData.content = "";
          }
          
          // Créer le message avec la conversationId
          const newMessage = new Message({
            senderId: normalizedData.senderId,
            receiverId: normalizedData.receiverId,
            conversationId: conversation._id,
            content: normalizedData.content,
            status: 'sent'
          });
          
          const savedMessage = await newMessage.save();
          
          // Mettre à jour la conversation
          await Conversation.findByIdAndUpdate(conversation._id, {
            lastMessage: savedMessage._id,
            lastMessageText: normalizedData.content || "Pièce jointe",
            lastMessageTime: new Date()
          });
          
          // Incrémenter le compteur de messages non lus
          const unreadCountUpdate = {};
          const currentCount = conversation.unreadCount ? (conversation.unreadCount.get(normalizedData.receiverId) || 0) : 0;
          unreadCountUpdate[`unreadCount.${normalizedData.receiverId}`] = currentCount + 1;
          
          await Conversation.findByIdAndUpdate(conversation._id, {
            $set: unreadCountUpdate
          });
          
          // Mettre à jour messageData
          messageData.id = savedMessage._id;
          messageData.conversationId = conversation._id;
        } catch (err) {
          console.error('Error handling conversation:', err);
          // Fallback: ancienne méthode - stocker dans le tableau en mémoire
          messages.push(messageData);
        }
      }
      
      // Rechercher le socket du destinataire - plusieurs méthodes
      // 1. D'abord vérifier dans la map en mémoire
      const recipientSocketId = onlineUsers.get(normalizedData.receiverId)?.socketId;
      
      // 2. Sinon vérifier en base de données
      if (!recipientSocketId) {
        try {
          const User = require('./backend/models/user');
          const receiver = await User.findById(normalizedData.receiverId);
          
          if (receiver && receiver.socketId) {
            // Envoyer le message au destinataire avec plusieurs formats pour compatibilité
            io.to(receiver.socketId).emit('message', messageData);
            io.to(receiver.socketId).emit('receiveMessage', messageData);
            console.log(`Message sent to recipient socket (from DB): ${receiver.socketId}`);
          }
        } catch (err) {
          console.error('Error finding recipient:', err);
        }
      }
      
      // Marquer le message comme envoyé
      messageData.delivered = true;
      messageData.status = 'delivered';
      
      // Si le destinataire est en ligne (dans la map), lui envoyer le message
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('message', messageData);
        io.to(recipientSocketId).emit('receiveMessage', messageData);
        console.log(`Message sent to recipient socket (from map): ${recipientSocketId}`);
        
        // Envoyer une confirmation de remise à l'expéditeur
        socket.emit('message_delivered', { 
          messageId: messageData.id,
          recipientId: normalizedData.receiverId,
          timestamp: new Date(),
        });
      }
      
      // Renvoyer le message à l'expéditeur pour confirmation (avec tous les formats possibles)
      socket.emit('message', messageData);
      socket.emit('receiveMessage', messageData);
      socket.emit('messageStatus', {
        messageId: messageData.id,
        status: 'sent',
        recipientId: normalizedData.receiverId,
        timestamp: new Date()
      });
      
    } catch (error) {
      console.error('Erreur lors de la création du message:', error);
      socket.emit('error', { message: 'Error processing message', details: error.message });
    }
  };

  // Enregistrer UN SEUL gestionnaire pour éviter les doublons
  socket.on('sendMessage', handleNewMessage);
  // socket.on('send_message', handleNewMessage); // Commenté pour éviter les doublons
  
  // Écouter les notifications de lecture de message
  socket.on('mark_read', async ({ messageId, conversationId }) => {
    try {
      if (conversationId) {
        // Nouvelle API: mettre à jour dans la base de données
        const Message = require('./backend/models/message');
        const Conversation = require('./backend/models/conversation');
        
        // Marquer les messages comme lus
        await Message.updateMany(
          { conversationId, receiverId: userId, isRead: false },
          { isRead: true, readAt: new Date(), status: 'read' }
        );
        
        // Mettre à jour le compteur de messages non lus
        const unreadCountUpdate = {};
        unreadCountUpdate[`unreadCount.${userId}`] = 0;
        
        await Conversation.findByIdAndUpdate(conversationId, {
          $set: unreadCountUpdate
        });
        
        // Trouver les expéditeurs des messages et les notifier
        const messages = await Message.find({ 
          conversationId, 
          receiverId: userId,
          isRead: true 
        });
        
        const senderIds = [...new Set(messages.map(msg => msg.senderId.toString()))];
        
        senderIds.forEach(senderId => {
          const senderSocketId = onlineUsers.get(senderId)?.socketId;
          if (senderSocketId) {
            io.to(senderSocketId).emit('messages_read', { 
              conversationId,
              readBy: userId,
              timestamp: new Date(),
            });
          }
        });
      } else {
        // Ancienne méthode: mettre à jour dans le tableau en mémoire
        const message = messages.find(msg => msg.id === messageId);
        
        if (message) {
          message.read = true;
          message.status = 'read';
          
          // Informer l'expéditeur que son message a été lu
          const senderSocketId = onlineUsers.get(message.senderId)?.socketId;
          
          if (senderSocketId) {
            io.to(senderSocketId).emit('message_read', { 
              messageId,
              readBy: userId,
              timestamp: new Date(),
            });
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors du marquage des messages comme lus:', error);
    }
  });
  
  // Écouter les demandes de récupération de l'historique des conversations
  socket.on('get_conversation', ({ otherUserId, conversationId }) => {
    if (!userId) return;
    
    if (conversationId) {
      // Nouvelle API: récupérer depuis la base de données
      const Message = require('./backend/models/message');
      
      Message.find({ conversationId })
        .sort({ createdAt: 1 })
        .limit(50)
        .then(messages => {
          socket.emit('conversation_history', { 
            conversationId,
            messages,
          });
        })
        .catch(error => {
          console.error('Erreur lors de la récupération de la conversation:', error);
        });
    } else {
      // Ancienne méthode: récupérer depuis le tableau en mémoire
      const conversation = getConversation(userId, otherUserId);
      socket.emit('conversation_history', { 
        userId: otherUserId,
        messages: conversation,
      });
    }
  });
  
  // Gérer la déconnexion
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    
    if (userId) {
      // Mettre à jour le statut en base de données
      const User = require('./backend/models/user');
      User.findByIdAndUpdate(userId, { 
        isOnline: false,
        lastSeen: new Date(),
        socketId: null // Effacer l'ID de socket
      }).then(() => {
        // Diffuser les statuts mis à jour une fois que la base de données est mise à jour
        setTimeout(broadcastOnlineStatus, 500);
      }).catch(err => console.error('Erreur lors de la mise à jour du statut utilisateur:', err));
      
      // Mettre à jour le dernier moment de connexion
      if (onlineUsers.has(userId)) {
        onlineUsers.set(userId, { 
          ...onlineUsers.get(userId),
          lastSeen: new Date(),
          socketId: null,
        });
        
        // Après un délai, supprimer complètement l'utilisateur de la liste
        setTimeout(() => {
          if (onlineUsers.get(userId)?.socketId === null) {
            onlineUsers.delete(userId);
          }
        }, 60000); // 1 minute
      }
      
      // Diffuser le statut "hors ligne" aux autres utilisateurs
      socket.broadcast.emit('user_status', { 
        userId, 
        status: 'offline',
        lastSeen: new Date(),
      });
    }
  });
});

// Route API de base
app.get('/api', (req, res) => {
  res.json({ message: 'Server is running' });
});

// Gérer les erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Erreur serveur' });
});

// Démarrer le serveur
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 