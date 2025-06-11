// models/Conversation.js
const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  type: {
    type: String,
    enum: ['direct', 'group'],
    default: 'direct'
  },
  name: {
    type: String,
    trim: true,
    default: null // Pour les conversations de groupe
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null
  },
  lastMessageText: {
    type: String,
    default: ''
  },
  lastMessageTime: {
    type: Date
  },
  unreadCount: {
    type: Map,
    of: Number,
    default: {}
  },
  isMentorConversation: {
    type: Boolean,
    default: false
  },
  mentorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  topic: {
    type: String,
    trim: true,
    default: ''
  },
  status: {
    type: String,
    enum: ['active', 'archived', 'blocked'],
    default: 'active'
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

// Index pour les recherches rapides
conversationSchema.index({ participants: 1 });
conversationSchema.index({ isMentorConversation: 1 });
conversationSchema.index({ lastMessageTime: -1 });

// Méthode statique pour trouver une conversation entre deux utilisateurs
conversationSchema.statics.findDirectConversation = async function(userId1, userId2) {
  return this.findOne({
    type: 'direct',
    participants: { $all: [userId1, userId2] }
  }).populate('lastMessage participants');
};

// Méthode statique pour récupérer toutes les conversations d'un utilisateur
conversationSchema.statics.findUserConversations = async function(userId) {
  return this.find({
    participants: userId
  })
  .sort({ lastMessageTime: -1 })
  .populate('participants lastMessage');
};

module.exports = mongoose.model('Conversation', conversationSchema); 