require('dotenv').config();
console.log("Variables d'environnement chargées:", {
  COHERE_API_KEY: process.env.COHERE_API_KEY ? "Définie" : "Non définie",
  CO_API_KEY: process.env.CO_API_KEY ? "Définie" : "Non définie"
});
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const User = require("./models/user"); // Import the User model
const Message = require("./models/message"); // Import the Message model
const connectDB = require('./config/db');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Servir les fichiers statiques
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database connection
connectDB();

// Routes
const authRoutes = require("./routes/authRoutes");
app.use("/api", authRoutes);

// Importer les routes d'IA
const aiRoutes = require('./routes/aiRoutes');

// Importer les routes de profil
const profileRoutes = require('./routes/profileRoutes');
app.use("/api/profile", profileRoutes);

// Socket.IO logic
const users = {}; // Store userId => socketId

io.on("connection", (socket) => {
  console.log("🟢 New client connected:", socket.id);
  
  // Récupérer l'ID utilisateur depuis la requête
  const userId = socket.handshake.query.userId;
  
  if (userId) {
    // Stocker la correspondance ID utilisateur <-> socket
    users[userId] = socket.id;
    console.log(`📝 Utilisateur ${userId} associé au socket ${socket.id}`);
    
    // Mettre à jour la liste des utilisateurs en ligne pour tous les clients
    broadcastOnlineUsers();
  }

  // Handle user join
  socket.on("join", async ({ userId }) => {
    if (userId && userId !== "null" && userId !== "undefined") {
      // Mettre à jour la correspondance userId <-> socketId
      users[userId] = socket.id;
      console.log(`📝 Utilisateur ${userId} (join) associé au socket ${socket.id}`);
      
      try {
        // Validate userId before database operations
        const isValidId = mongoose.Types.ObjectId.isValid(userId);
        if (!isValidId) {
          console.log(`⚠️ ID utilisateur invalide: ${userId}`);
          socket.emit("error", { message: "Invalid user ID format" });
          return;
        }

        // Update user's online status and set the socketId
        await User.findByIdAndUpdate(userId, {
          isOnline: true,
          socketId: socket.id,
          lastSeen: new Date()
        });

        // Notify frontend about the updated user list
        broadcastOnlineUsers();
        console.log("📢 User joined:", userId);
      } catch (error) {
        console.error("❌ Error updating user status:", error);
      }
    } else {
      console.log(`⚠️ ID utilisateur manquant ou invalide: ${userId}`);
    }
  });

  // Fonction pour diffuser la liste des utilisateurs en ligne
  async function broadcastOnlineUsers() {
    try {
      const onlineUsers = await User.find({ isOnline: true })
                               .select('_id firstName lastName avatar socketId isOnline');
      
      // Émettre avec tous les formats d'événements pour compatibilité
      io.emit("userList", onlineUsers);
      io.emit("online_users", onlineUsers);
      
      console.log(`📊 Liste des utilisateurs en ligne mise à jour: ${onlineUsers.length} utilisateurs`);
    } catch (error) {
      console.error("❌ Error getting online users:", error);
    }
  }

  // Handle sending messages
  socket.on("sendMessage", async (messageData) => {
    console.log("📨 Message reçu:", messageData);
    
    try {
      // Normaliser les champs pour éviter les problèmes de compatibilité
      const normalizedData = {
        senderId: messageData.senderId,
        receiverId: messageData.receiverId || messageData.recipientId,
        content: messageData.content || messageData.message || "",
        fileUrl: messageData.fileUrl
      };
      
      // Vérifier les champs obligatoires
      if (!normalizedData.senderId || !normalizedData.receiverId) {
        socket.emit("error", { message: "senderId and receiverId are required" });
        return;
      }
      
      try {
        // Sauvegarder le message dans la base de données
        const newMessage = new Message({
          senderId: normalizedData.senderId,
          receiverId: normalizedData.receiverId,
          content: normalizedData.content,
          fileUrl: normalizedData.fileUrl
        });

        const savedMessage = await newMessage.save();
        console.log(`💾 Message enregistré en BDD: ${savedMessage._id}`);
        
        // Préparation du message à envoyer
        const messageToSend = {
          ...savedMessage._doc,
          id: savedMessage._id
        };

        // Envoyer le message au destinataire
        const receiverSocketId = users[normalizedData.receiverId];
        if (receiverSocketId) {
          console.log(`📤 Message envoyé à socket ${receiverSocketId}`);
          io.to(receiverSocketId).emit("receiveMessage", messageToSend);
          io.to(receiverSocketId).emit("message", messageToSend);
        } else {
          console.log(`⚠️ Destinataire hors ligne, message en attente: ${normalizedData.receiverId}`);
        }

        // Renvoyer le message à l'expéditeur avec confirmation
        socket.emit("receiveMessage", messageToSend);
        socket.emit("messageStatus", {
          messageId: savedMessage._id,
          status: "sent"
        });
        
      } catch (dbError) {
        console.error("❌ Erreur de sauvegarde en BDD:", dbError);
        socket.emit("error", { message: "Error saving message" });
      }
    } catch (error) {
      console.error("❌ Erreur générale:", error);
      socket.emit("error", { message: "Server error processing message" });
    }
  });

  // Mark messages as read
  socket.on("mark_read", async ({ messageId }) => {
    try {
      if (messageId) {
        await Message.findByIdAndUpdate(messageId, { isRead: true });
        io.emit("messageStatus", {
          messageId: messageId,
          status: "read"
        });
      }
    } catch (error) {
      console.error("❌ Error marking message as read:", error);
    }
  });

  // Handle user disconnect
  socket.on("disconnect", async () => {
    // Find the user based on socketId and update the status
    for (const userId in users) {
      if (users[userId] === socket.id) {
        // Set the user to offline and update their last seen timestamp
        await User.findByIdAndUpdate(userId, {
          isOnline: false,
          lastSeen: new Date(),
          socketId: null
        });

        // Remove from memory
        delete users[userId];

        // Update the online users list
        broadcastOnlineUsers();
        
        console.log("🔴 Client disconnected:", socket.id);
        break;
      }
    }
  });

  // Typing indicator
  socket.on("typing", ({ receiverId }) => {
    const receiverSocketId = users[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("userTyping", { 
        senderId: socket.handshake.query.userId 
      });
    }
  });
});

// Start the server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

app.use("/api/messages", require("./routes/uploads/messageRoutes"));
app.use("/uploads", express.static("uploads")); // To serve files

app.get('/api/messages/:senderId/:receiverId', async (req, res) => {
  const { senderId, receiverId } = req.params;
  const messages = await Message.find({
    $or: [
      { senderId, receiverId },
      { senderId: receiverId, receiverId: senderId }
    ]
  }).sort({ createdAt: 1 });
  res.json(messages);
});

// Ajouter les routes d'IA
app.use('/api/ai', aiRoutes);
