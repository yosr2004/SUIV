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
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
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
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/messages', messageRoutes);

// Route de débogage pour tester la configuration
app.get('/api/debug', (req, res) => {
  res.json({
    success: true,
    message: 'Serveur en mode débogage prêt',
    timestamp: new Date().toISOString()
  });
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000', // URL de votre application React
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Structure de données pour stocker les utilisateurs connectés et les messages
const onlineUsers = new Map();
const messages = [];

// Fonction pour obtenir tous les messages entre deux utilisateurs
function getConversation(user1Id, user2Id) {
  return messages.filter(
    msg => 
      (msg.senderId === user1Id && msg.receiverId === user2Id) ||
      (msg.senderId === user2Id && msg.receiverId === user1Id)
  ).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
}

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/suiv_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connexion à MongoDB établie');
})
.catch(err => {
  console.error('❌ Erreur de connexion à MongoDB:', err);
});

// Middleware pour les logs de débogages
io.use((socket, next) => {
  const userId = socket.handshake.query.userId;
  console.log(`🔍 Authentification socket pour user: ${userId}, socket: ${socket.id}`);
  next();
});

io.on('connection', (socket) => {
  console.log(`🟢 Utilisateur connecté: ${socket.id}`);
  
  // Récupérer l'ID utilisateur depuis la requête
  const userId = socket.handshake.query.userId;
  
  if (userId) {
    console.log(`👤 Identifiant utilisateur reçu: ${userId}`);
    
    // Enregistrer l'utilisateur comme étant en ligne
    onlineUsers.set(userId, { socketId: socket.id, lastSeen: new Date() });
    console.log(`📊 Utilisateurs connectés: ${onlineUsers.size}`);
    console.log(`🗺️ Map des utilisateurs:`, Array.from(onlineUsers.entries()));
    
    // Diffuser le statut "en ligne" aux autres utilisateurs
    socket.broadcast.emit('user_status', { userId, status: 'online' });
    
    // Envoyer la liste des utilisateurs en ligne au client qui vient de se connecter
    const onlineUsersList = Array.from(onlineUsers.keys()).map(id => ({
      userId: id,
      lastSeen: onlineUsers.get(id).lastSeen,
    }));
    console.log(`📤 Envoi de la liste des utilisateurs en ligne:`, onlineUsersList);
    socket.emit('online_users', onlineUsersList);
    
    try {
      // Mettre à jour le statut en ligne dans la base de données 
      const User = require('./backend/models/user');
      User.findByIdAndUpdate(userId, { 
        isOnline: true, 
        socketId: socket.id,
        lastSeen: new Date()
      })
      .then(() => {
        console.log(`✓ Statut utilisateur ${userId} mis à jour dans la base de données`);
        
        // Renvoyer une liste complète des utilisateurs (pour le test)
        return User.find({}).select('_id firstName lastName email avatar isOnline');
      })
      .then(users => {
        console.log(`📋 Liste complète des utilisateurs (${users.length})`);
        socket.emit('userList', users);
      })
      .catch(err => console.error('❌ Erreur lors de la mise à jour du statut utilisateur:', err));
    } catch (error) {
      console.error('❌ Erreur lors de l\'accès au modèle User:', error);
    }
  } else {
    console.warn('⚠️ Socket connecté sans ID utilisateur');
  }

  // Écouter les nouveaux messages
  socket.on('sendMessage', async (messageData) => {
    console.log('📨 Nouveau message reçu:', messageData);
    
    try {
      // Si l'utilisateur n'est pas défini, utiliser celui de la socket
      if (!messageData.senderId && userId) {
        messageData.senderId = userId;
        console.log(`🔄 ID expéditeur automatiquement défini à ${userId}`);
      }
      
      let recipientSocketId = null;
      
      // Vérifier si le destinataire est en ligne
      if (messageData.receiverId) {
        const recipient = onlineUsers.get(messageData.receiverId);
        if (recipient) {
          recipientSocketId = recipient.socketId;
          console.log(`🔍 Destinataire trouvé: ${messageData.receiverId} => socket ${recipientSocketId}`);
        } else {
          console.log(`🔍 Destinataire hors ligne: ${messageData.receiverId}`);
        }
      }
      
      try {
        // Créer le message dans la base de données
        const Message = require('./backend/models/message');
        const newMessage = new Message({
          senderId: messageData.senderId,
          receiverId: messageData.receiverId,
          message: messageData.message,
          fileUrl: messageData.fileUrl || null
        });
        
        const savedMessage = await newMessage.save();
        console.log(`💾 Message enregistré en BDD avec ID: ${savedMessage._id}`);
        
        // Update messageData with database ID
        messageData._id = savedMessage._id;
        messageData.createdAt = savedMessage.createdAt;
      } catch (dbError) {
        console.error('❌ Erreur lors de l\'enregistrement du message en BDD:', dbError);
        // Fallback: store in memory array
        messages.push(messageData);
        console.log('⚠️ Message stocké uniquement en mémoire');
      }
      
      // Marquer le message comme envoyé
      messageData.status = 'sent';
      
      // Si le destinataire est en ligne, lui envoyer le message
      if (recipientSocketId) {
        console.log(`📤 Envoi du message à ${recipientSocketId}`);
        io.to(recipientSocketId).emit('receiveMessage', messageData);
        
        // Confirmer la livraison à l'expéditeur
        socket.emit('messageStatus', { 
          messageId: messageData._id || messageData.id,
          status: 'delivered',
          userId: messageData.receiverId,
          timestamp: new Date(),
        });
        
        console.log('✓ Message transmis et confirmation envoyée');
      } else {
        console.log('⚠️ Destinataire hors ligne, le message sera remis à sa prochaine connexion');
      }
      
      // Renvoyer le message à l'expéditeur pour confirmation (remplace les anciens événements message_delivered)
      console.log('📤 Confirmation du message à l\'expéditeur');
      socket.emit('receiveMessage', { ...messageData, isMine: true });
      
    } catch (error) {
      console.error('❌ Erreur lors de la gestion du message:', error);
      socket.emit('error', { message: 'Erreur lors de l\'envoi du message' });
    }
  });
  
  // Écouter les demandes de récupération des messages
  socket.on('getMessages', ({ senderId, receiverId }) => {
    console.log(`🔍 Recherche des messages entre ${senderId} et ${receiverId}`);
    
    if (!senderId || !receiverId) {
      console.warn('⚠️ Identifiants manquants pour la récupération des messages');
      socket.emit('error', { message: 'Identifiants manquants' });
      return;
    }
    
    try {
      // Récupérer les messages depuis l'array en mémoire
      const conversation = getConversation(senderId, receiverId);
      console.log(`📋 ${conversation.length} messages trouvés en mémoire`);
      
      // Essayer aussi de récupérer depuis la base de données
      const Message = require('./backend/models/message');
      
      Message.find({
        $or: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId }
        ]
      })
      .sort({ createdAt: 1 })
      .then(dbMessages => {
        console.log(`📋 ${dbMessages.length} messages trouvés en base de données`);
        
        // Envoyer les messages de la base de données s'il y en a, sinon envoyer ceux en mémoire
        const messagesToSend = dbMessages.length > 0 ? dbMessages : conversation;
        socket.emit('messages', messagesToSend);
      })
      .catch(err => {
        console.error('❌ Erreur lors de la récupération des messages depuis la BDD:', err);
        // Fallback: envoyer les messages en mémoire
        socket.emit('messages', conversation);
      });
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des messages:', error);
      socket.emit('error', { message: 'Erreur lors de la récupération des messages' });
      // Fallback: envoyer un tableau vide
      socket.emit('messages', []);
    }
  });
  
  // Écouter les notifications de lecture de message
  socket.on('markMessageAsRead', async ({ messageId }) => {
    console.log(`📖 Marquage du message ${messageId} comme lu`);
    
    try {
      // Mise à jour en BDD si possible
      try {
        const Message = require('./backend/models/message');
        const message = await Message.findByIdAndUpdate(
          messageId,
          { isRead: true, readAt: new Date(), status: 'read' },
          { new: true }
        );
        
        if (message) {
          console.log(`✓ Message ${messageId} marqué comme lu en BDD`);
          
          // Notifier l'expéditeur que son message a été lu
          const senderSocketId = onlineUsers.get(message.senderId)?.socketId;
          
          if (senderSocketId) {
            console.log(`📤 Notification de lecture envoyée à ${senderSocketId}`);
            io.to(senderSocketId).emit('messageStatus', { 
              messageId,
              status: 'read',
              userId: message.receiverId,
              timestamp: new Date(),
            });
          }
        } else {
          console.log(`⚠️ Message ${messageId} non trouvé en BDD`);
        }
      } catch (dbError) {
        console.error('❌ Erreur lors de la mise à jour du message en BDD:', dbError);
        
        // Fallback: mise à jour en mémoire
        const message = messages.find(msg => msg.id === messageId || msg._id === messageId);
        
        if (message) {
          message.read = true;
          message.status = 'read';
          
          // Informer l'expéditeur que son message a été lu
          const senderSocketId = onlineUsers.get(message.senderId)?.socketId;
          
          if (senderSocketId) {
            console.log(`📤 Notification de lecture envoyée à ${senderSocketId} (memory)`);
            io.to(senderSocketId).emit('messageStatus', { 
              messageId,
              status: 'read',
              userId: message.receiverId,
              timestamp: new Date(),
            });
          }
        }
      }
    } catch (error) {
      console.error('❌ Erreur lors du marquage des messages comme lus:', error);
    }
  });
  
  // Notification de frappe
  socket.on('typing', ({ receiverId, isTyping }) => {
    console.log(`⌨️ ${userId} est en train de taper pour ${receiverId}: ${isTyping}`);
    
    const receiverSocketId = onlineUsers.get(receiverId)?.socketId;
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('userTyping', { 
        userId, 
        isTyping 
      });
    }
  });
  
  // Gérer la déconnexion
  socket.on('disconnect', () => {
    console.log(`🔴 Déconnexion du socket ${socket.id}`);
    
    if (userId) {
      console.log(`🚶 Utilisateur ${userId} déconnecté`);
      
      // Mettre à jour le statut en base de données
      try {
        const User = require('./backend/models/user');
        User.findByIdAndUpdate(userId, { 
          isOnline: false,
          lastSeen: new Date()
        })
        .then(() => console.log(`✓ Statut utilisateur ${userId} mis à jour en BDD (hors ligne)`))
        .catch(err => console.error('❌ Erreur lors de la mise à jour du statut utilisateur:', err));
      } catch (error) {
        console.error('❌ Erreur lors de l\'accès au modèle User:', error);
      }
      
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
            console.log(`🧹 Utilisateur ${userId} retiré de la liste des utilisateurs en ligne`);
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

// Route de test simple
app.get('/', (req, res) => {
  res.send('Serveur de messagerie en mode debug - API fonctionnelle');
});

// Démarrer le serveur
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📡 Socket.IO activé et prêt à recevoir des connexions`);
  console.log(`⏱️ ${new Date().toLocaleString()}\n`);
}); 