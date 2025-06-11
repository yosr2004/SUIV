const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const User = require('../models/user');
const Message = require('../models/message');
const Conversation = require('../models/conversation');
const multer = require('multer');
const path = require('path');

// Configuration de multer pour les pièces jointes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/attachments');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    // Vérifier les types de fichiers autorisés
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|ppt|pptx|txt|zip/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Format de fichier non supporté!'));
  }
});

// Obtenir toutes les conversations d'un utilisateur
router.get('/conversations', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Trouver toutes les conversations de l'utilisateur
    const conversations = await Conversation.find({
      participants: userId
    })
    .sort({ lastMessageTime: -1 })
    .populate({
      path: 'participants', 
      select: 'firstName lastName avatar isOnline lastSeen roles mentorProfile.isActive'
    })
    .populate({
      path: 'lastMessage',
      select: 'content createdAt status'
    });
    
    // Formater les données pour le frontend
    const formattedConversations = conversations.map(conv => {
      // Trouver l'autre participant (dans le cas d'une conversation directe)
      const otherParticipant = conv.type === 'direct'
        ? conv.participants.find(p => !p._id.equals(userId))
        : null;
        
      return {
        id: conv._id,
        type: conv.type,
        name: conv.type === 'direct' 
          ? `${otherParticipant?.firstName} ${otherParticipant?.lastName}` 
          : conv.name,
        avatar: conv.type === 'direct' ? otherParticipant?.avatar : null,
        isMentor: otherParticipant?.roles?.includes('mentor') || false,
        isActive: conv.status === 'active',
        lastMessage: conv.lastMessageText,
        lastMessageTime: conv.lastMessageTime,
        unreadCount: conv.unreadCount.get(userId.toString()) || 0,
        participants: conv.participants.map(p => ({
          id: p._id,
          name: `${p.firstName} ${p.lastName}`,
          avatar: p.avatar,
          isOnline: p.isOnline,
          lastSeen: p.lastSeen,
          isMentor: p.roles?.includes('mentor') || false
        })),
        topic: conv.topic
      };
    });
    
    res.json({ success: true, conversations: formattedConversations });
  } catch (error) {
    console.error('Erreur lors de la récupération des conversations:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur serveur lors de la récupération des conversations' 
    });
  }
});

// Obtenir les messages d'une conversation
router.get('/conversations/:conversationId/messages', auth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;
    const { page = 1, limit = 20 } = req.query;
    
    // Vérifier si l'utilisateur fait partie de la conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId
    });
    
    if (!conversation) {
      return res.status(403).json({ 
        success: false, 
        error: 'Accès non autorisé à cette conversation' 
      });
    }
    
    // Récupérer les messages avec pagination
    const messages = await Message.find({ conversationId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('senderId', 'firstName lastName avatar')
      .lean();
    
    // Compter le total des messages pour la pagination
    const totalMessages = await Message.countDocuments({ conversationId });
    
    // Marquer les messages non lus comme lus
    if (messages.length > 0) {
      await Message.updateMany({
        conversationId,
        receiverId: userId,
        isRead: false
      }, {
        isRead: true,
        readAt: new Date(),
        status: 'read'
      });
      
      // Mettre à jour le compteur de messages non lus
      const unreadCountUpdate = {};
      unreadCountUpdate[`unreadCount.${userId}`] = 0;
      
      await Conversation.findByIdAndUpdate(conversationId, {
        $set: unreadCountUpdate
      });
    }
    
    res.json({ 
      success: true, 
      messages: messages.reverse(), // Renvoyer dans l'ordre chronologique
      pagination: {
        totalMessages,
        totalPages: Math.ceil(totalMessages / limit),
        currentPage: Number(page),
        hasMore: page * limit < totalMessages
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des messages:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur serveur lors de la récupération des messages' 
    });
  }
});

// Créer une nouvelle conversation
router.post('/conversations', auth, async (req, res) => {
  try {
    const { participantId, message, topic, isMentorConversation } = req.body;
    const userId = req.user._id;
    
    // Vérifier si l'autre utilisateur existe
    const participant = await User.findById(participantId);
    if (!participant) {
      return res.status(404).json({ success: false, error: 'Utilisateur non trouvé' });
    }
    
    // Vérifier si une conversation existe déjà entre ces utilisateurs
    let conversation = await Conversation.findDirectConversation(userId, participantId);
    
    if (!conversation) {
      // Créer une nouvelle conversation
      conversation = new Conversation({
        participants: [userId, participantId],
        type: 'direct',
        topic: topic || '',
        isMentorConversation: isMentorConversation || false,
        mentorId: participant.roles?.includes('mentor') ? participantId : 
                 (req.user.roles?.includes('mentor') ? userId : null),
        lastMessageTime: new Date()
      });
      
      await conversation.save();
    }
    
    // Si un message initial est fourni, l'ajouter
    if (message) {
      const newMessage = new Message({
        conversationId: conversation._id,
        senderId: userId,
        receiverId: participantId,
        content: message,
        status: 'sent'
      });
      
      await newMessage.save();
      
      // Mettre à jour la conversation avec le dernier message
      conversation.lastMessage = newMessage._id;
      conversation.lastMessageText = message;
      conversation.lastMessageTime = new Date();
      
      // Incrémenter le compteur de messages non lus pour le destinataire
      const unreadCountUpdate = {};
      unreadCountUpdate[`unreadCount.${participantId}`] = 1;
      
      conversation.set(unreadCountUpdate);
      await conversation.save();
    }
    
    res.json({ 
      success: true, 
      conversation: {
        id: conversation._id,
        participants: [userId, participantId],
        topic: conversation.topic,
        isMentorConversation: conversation.isMentorConversation
      }
    });
  } catch (error) {
    console.error('Erreur lors de la création de la conversation:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur serveur lors de la création de la conversation' 
    });
  }
});

// Envoyer un message
router.post('/conversations/:conversationId/messages', auth, upload.array('attachments', 5), async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content } = req.body;
    const files = req.files || [];
    const userId = req.user._id;
    
    // Vérifier si l'utilisateur fait partie de la conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId
    });
    
    if (!conversation) {
      return res.status(403).json({ 
        success: false, 
        error: 'Accès non autorisé à cette conversation' 
      });
    }
    
    // Trouver le destinataire (l'autre participant)
    const receiverId = conversation.participants.find(p => !p.equals(userId));
    
    if (!receiverId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Impossible de déterminer le destinataire' 
      });
    }
    
    // Préparer les pièces jointes
    const attachments = files.map(file => ({
      url: `/uploads/attachments/${file.filename}`,
      name: file.originalname,
      size: file.size,
      mimeType: file.mimetype
    }));
    
    // Créer le nouveau message
    const newMessage = new Message({
      conversationId,
      senderId: userId,
      receiverId,
      content: content || '',
      attachments: attachments.length > 0 ? attachments : undefined,
      status: 'sent'
    });
    
    await newMessage.save();
    
    // Mettre à jour la conversation avec le dernier message
    const unreadCountUpdate = {};
    // Incrémenter le compteur pour le destinataire
    const currentCount = conversation.unreadCount.get(receiverId.toString()) || 0;
    unreadCountUpdate[`unreadCount.${receiverId}`] = currentCount + 1;
    
    await Conversation.findByIdAndUpdate(conversationId, {
      $set: {
        lastMessage: newMessage._id,
        lastMessageText: content || 'Pièce jointe',
        lastMessageTime: new Date(),
        ...unreadCountUpdate
      }
    });
    
    // Formatter la réponse
    const messageWithSender = await Message.findById(newMessage._id)
      .populate('senderId', 'firstName lastName avatar');
    
    res.json({ 
      success: true, 
      message: messageWithSender 
    });
  } catch (error) {
    console.error('Erreur lors de l\'envoi du message:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur serveur lors de l\'envoi du message' 
    });
  }
});

// Marquer les messages comme lus
router.put('/conversations/:conversationId/read', auth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;
    
    // Vérifier si l'utilisateur fait partie de la conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId
    });
    
    if (!conversation) {
      return res.status(403).json({ 
        success: false, 
        error: 'Accès non autorisé à cette conversation' 
      });
    }
    
    // Marquer tous les messages reçus comme lus
    await Message.updateMany({
      conversationId,
      receiverId: userId,
      isRead: false
    }, {
      isRead: true,
      readAt: new Date(),
      status: 'read'
    });
    
    // Mettre à jour le compteur de messages non lus
    const unreadCountUpdate = {};
    unreadCountUpdate[`unreadCount.${userId}`] = 0;
    
    await Conversation.findByIdAndUpdate(conversationId, {
      $set: unreadCountUpdate
    });
    
    res.json({ 
      success: true, 
      message: 'Messages marqués comme lus' 
    });
  } catch (error) {
    console.error('Erreur lors du marquage des messages comme lus:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur serveur lors du marquage des messages comme lus' 
    });
  }
});

// Obtenir la liste des mentors disponibles pour discuter
router.get('/mentors', auth, async (req, res) => {
  try {
    const { searchQuery, specialty, availability } = req.query;
    
    // Construire la requête pour filtrer les mentors
    const query = {
      'roles': 'mentor',
      'mentorProfile.isActive': true
    };
    
    // Ajouter la recherche par nom ou spécialité si un terme est fourni
    if (searchQuery && searchQuery.trim() !== '') {
      const searchRegex = new RegExp(searchQuery.trim(), 'i');
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { 'mentorProfile.specialties': searchRegex },
        { 'professional.title': searchRegex },
      ];
    }
    
    // Ajouter des filtres supplémentaires si nécessaire
    if (specialty) {
      query['mentorProfile.specialties'] = specialty;
    }
    
    // Rechercher les mentors
    const mentors = await User.find(query)
      .select('firstName lastName avatar mentorProfile.specialties mentorProfile.yearsOfExperience mentorProfile.rating mentorProfile.reviewCount mentorProfile.hourlyRate isOnline lastSeen professional.title bio')
      .sort({ 'mentorProfile.rating': -1 })
      .limit(50);
    
    // Formater pour le frontend
    const formattedMentors = mentors.map(mentor => ({
      id: mentor._id,
      firstName: mentor.firstName,
      lastName: mentor.lastName,
      name: `${mentor.firstName} ${mentor.lastName}`,
      avatar: mentor.avatar,
      specialties: mentor.mentorProfile?.specialties || [],
      title: mentor.professional?.title || '',
      bio: mentor.bio || '',
      experience: mentor.mentorProfile?.yearsOfExperience || 0,
      rating: mentor.mentorProfile?.rating || 0,
      reviewCount: mentor.mentorProfile?.reviewCount || 0,
      hourlyRate: mentor.mentorProfile?.hourlyRate || 0,
      isOnline: mentor.isOnline,
      lastSeen: mentor.lastSeen,
      isMentor: true
    }));
    
    res.json({
      success: true,
      mentors: formattedMentors
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des mentors:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur serveur lors de la récupération des mentors' 
    });
  }
});

// Obtenir la liste des utilisateurs disponibles pour la messagerie
router.get('/users', auth, async (req, res) => {
  try {
    const { searchQuery } = req.query;
    const userId = req.user._id;
    
    // Construire la requête pour filtrer les utilisateurs (exclure l'utilisateur actuel)
    const query = {
      _id: { $ne: userId }
    };
    
    // Ajouter la recherche par nom si un terme est fourni
    if (searchQuery && searchQuery.trim() !== '') {
      const searchRegex = new RegExp(searchQuery.trim(), 'i');
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { 'professional.title': searchRegex },
      ];
    }
    
    // Rechercher les utilisateurs
    const users = await User.find(query)
      .select('firstName lastName avatar professional.title isOnline lastSeen roles')
      .sort({ firstName: 1, lastName: 1 })
      .limit(50);
    
    // Formater pour le frontend
    const formattedUsers = users.map(user => ({
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      name: `${user.firstName} ${user.lastName}`,
      avatar: user.avatar,
      title: user.professional?.title || '',
      isOnline: user.isOnline,
      lastSeen: user.lastSeen,
      isMentor: user.roles.includes('mentor')
    }));
    
    res.json({
      success: true,
      users: formattedUsers
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur serveur lors de la récupération des utilisateurs' 
    });
  }
});

// Archiver une conversation
router.put('/conversations/:conversationId/archive', auth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;
    
    // Vérifier si l'utilisateur fait partie de la conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId
    });
    
    if (!conversation) {
      return res.status(403).json({ 
        success: false, 
        error: 'Accès non autorisé à cette conversation' 
      });
    }
    
    // Archiver la conversation
    conversation.status = 'archived';
    await conversation.save();
    
    res.json({ 
      success: true, 
      message: 'Conversation archivée avec succès' 
    });
  } catch (error) {
    console.error('Erreur lors de l\'archivage de la conversation:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur serveur lors de l\'archivage de la conversation' 
    });
  }
});

module.exports = router; 