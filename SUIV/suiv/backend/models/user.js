const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config/config');

const userSchema = new mongoose.Schema({
  firstName: { 
    type: String, 
    required: true,
    trim: true 
  },
  lastName: { 
    type: String, 
    required: true,
    trim: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true 
  },
  password: { 
    type: String, 
    required: true,
    minlength: 6 
  },
  // Biographie de l'utilisateur
  bio: {
    type: String,
    default: ''
  },
  // Informations de contact
  contact: {
    phoneNumber: { type: String, default: '' },
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    postalCode: { type: String, default: '' },
    country: { type: String, default: '' }
  },
  // Informations professionnelles
  professional: {
    title: { type: String },
    company: { type: String },
    experience: { type: Number, default: 0 },
    location: { type: String }
  },
  // Informations de réseaux sociaux
  social: {
    linkedin: { type: String },
    github: { type: String },
    twitter: { type: String }
  },
  // Compétences
  skills: [{
    name: { type: String, required: true },
    level: { 
      type: Number,
      min: 1,
      max: 5,
      default: 3
    }
  }],
  // Avatar de l'utilisateur
  avatar: {
    type: String,
    default: ''
  },
  // Rôles d'utilisateur
  roles: {
    type: [String],
    enum: ['user', 'mentor', 'admin'],
    default: ['user']
  },
  // Profil spécifique au mentor
  mentorProfile: {
    isActive: { type: Boolean, default: false },
    specialties: [String],
    bio: { type: String },
    yearsOfExperience: { type: Number },
    hourlyRate: { type: Number },
    availability: {
      monday: [{ start: String, end: String }],
      tuesday: [{ start: String, end: String }],
      wednesday: [{ start: String, end: String }],
      thursday: [{ start: String, end: String }],
      friday: [{ start: String, end: String }],
      saturday: [{ start: String, end: String }],
      sunday: [{ start: String, end: String }]
    },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    verified: { type: Boolean, default: false },
    featured: { type: Boolean, default: false }
  },
  isOnline: { 
    type: Boolean, 
    default: false 
  },
  socketId: { 
    type: String, 
    default: null 
  },
  lastSeen: { 
    type: Date, 
    default: null 
  },
  isEmailVerified: { 
    type: Boolean, 
    default: true 
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  lastPasswordChange: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

// Hash le mot de passe avant de sauvegarder
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(config.PASSWORD_SALT_ROUNDS);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Méthode pour comparer les mots de passe
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

const User = mongoose.model('User', userSchema);

module.exports = User;
