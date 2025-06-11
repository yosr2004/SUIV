const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const profileSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Informations personnelles
  personalInfo: {
    phoneNumber: { type: String },
    address: { type: String },
    city: { type: String },
    postalCode: { type: String },
    country: { type: String },
    birthDate: { type: Date },
    linkedin: { type: String },
    github: { type: String },
    website: { type: String },
    bio: { type: String }
  },
  // Informations professionnelles (ajout pour correspondre au frontend)
  professional: {
    title: { type: String },
    company: { type: String },
    experience: { type: Number, default: 0 },
    location: { type: String }
  },
  // Informations de réseaux sociaux (ajout pour correspondre au frontend)
  social: {
    linkedin: { type: String },
    github: { type: String },
    twitter: { type: String }
  },
  // Compétences
  skills: [{
    name: { type: String, required: true },
    level: { 
      type: Number,  // Changé de String à Number pour correspondre au frontend (niveau 1-5)
      min: 1,
      max: 5,
      default: 3
    },
    yearOfExperience: { type: Number }
  }],
  // Expériences professionnelles
  experiences: [{
    company: { type: String, required: true },
    position: { type: String, required: true },
    location: { type: String },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    current: { type: Boolean, default: false },
    description: { type: String }
  }],
  // Formation
  education: [{
    institution: { type: String, required: true },
    degree: { type: String, required: true },
    field: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
    current: { type: Boolean, default: false },
    description: { type: String }
  }],
  // Langues
  languages: [{
    name: { type: String, required: true },
    level: { 
      type: String, 
      enum: ['débutant', 'intermédiaire', 'avancé', 'bilingue', 'langue maternelle'],
      default: 'intermédiaire'
    }
  }],
  // CV téléchargés
  cvFiles: [{
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    path: { type: String, required: true },
    mimetype: { type: String, required: true },
    size: { type: Number, required: true },
    uploadDate: { type: Date, default: Date.now }
  }],
  // Analyse du CV (stocke les résultats d'analyse de l'IA)
  cvAnalysis: {
    overallScore: { type: Number },
    summary: { type: String },
    technicalSkills: [{ 
      name: { type: String },
      level: { type: String }
    }],
    softSkills: [{ type: String }],
    strengths: [{ type: String }],
    improvements: [{ type: String }],
    lastAnalysisDate: { type: Date }
  },
  // Paramètres de visibilité du profil
  visibility: {
    isPublic: { type: Boolean, default: false },
    showEmail: { type: Boolean, default: false },
    showPhone: { type: Boolean, default: false }
  },
  completionPercentage: { 
    type: Number, 
    default: 0 
  }
}, {
  timestamps: true
});

// Méthode pour calculer le pourcentage de complétion du profil
profileSchema.methods.calculateCompletionPercentage = function() {
  let totalFields = 0;
  let completedFields = 0;
  
  // Vérifier les informations personnelles
  const personalInfoFields = Object.keys(this.personalInfo || {}).length;
  totalFields += 6; // Considérer les champs principaux seulement
  completedFields += Math.min(personalInfoFields, 6);
  
  // Vérifier les compétences
  totalFields += 1;
  completedFields += this.skills && this.skills.length > 0 ? 1 : 0;
  
  // Vérifier les expériences
  totalFields += 1;
  completedFields += this.experiences && this.experiences.length > 0 ? 1 : 0;
  
  // Vérifier l'éducation
  totalFields += 1;
  completedFields += this.education && this.education.length > 0 ? 1 : 0;
  
  // Vérifier les langues
  totalFields += 1;
  completedFields += this.languages && this.languages.length > 0 ? 1 : 0;
  
  // Vérifier le CV
  totalFields += 1;
  completedFields += this.cvFiles && this.cvFiles.length > 0 ? 1 : 0;
  
  // Calculer le pourcentage
  return Math.round((completedFields / totalFields) * 100);
};

// Mettre à jour le pourcentage de complétion avant sauvegarde
profileSchema.pre('save', function(next) {
  this.completionPercentage = this.calculateCompletionPercentage();
  next();
});

const Profile = mongoose.model('Profile', profileSchema, 'profiles');

module.exports = Profile; 