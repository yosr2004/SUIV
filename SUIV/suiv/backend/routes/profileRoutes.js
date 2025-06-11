const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const Profile = require('../models/profile');
const User = require('../models/user');

// Configuration pour stocker les fichiers CV
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/cv');
    // Créer le répertoire s'il n'existe pas
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExt = path.extname(file.originalname);
    cb(null, `cv-${req.user.id}-${uniqueSuffix}${fileExt}`);
  }
});

// Configuration du filtre pour limiter les types de fichiers acceptés
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Type de fichier non supporté. Seuls les formats PDF, DOC et DOCX sont acceptés.'), false);
  }
};

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
  fileFilter: fileFilter
});

// Configuration pour stocker les avatars
const avatarStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/avatars');
    // Créer le répertoire s'il n'existe pas
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExt = path.extname(file.originalname);
    cb(null, `avatar-${req.user.id}-${uniqueSuffix}${fileExt}`);
  }
});

const avatarUpload = multer({ 
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (req, file, cb) => {
    // Accepter uniquement les images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Seules les images sont acceptées'), false);
    }
  }
});

// Obtenir le profil actuel de l'utilisateur connecté
router.get('/me', auth, async (req, res) => {
  try {
    let profile = await Profile.findOne({ user: req.user.id }).populate('user', ['firstName', 'lastName', 'email']);
    
    if (!profile) {
      return res.status(404).json({ message: 'Aucun profil trouvé pour cet utilisateur' });
    }
    
    res.json(profile);
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// Créer ou mettre à jour un profil
router.post('/', auth, async (req, res) => {
  const {
    personalInfo,
    skills,
    experiences,
    education,
    languages,
    visibility
  } = req.body;

  // Construire l'objet profil
  const profileFields = {};
  profileFields.user = req.user.id;
  
  if (personalInfo) profileFields.personalInfo = personalInfo;
  if (skills) profileFields.skills = skills;
  if (experiences) profileFields.experiences = experiences;
  if (education) profileFields.education = education;
  if (languages) profileFields.languages = languages;
  if (visibility) profileFields.visibility = visibility;

  try {
    // Vérifier si le profil existe déjà
    let profile = await Profile.findOne({ user: req.user.id });

    if (profile) {
      // Mettre à jour le profil existant
      profile = await Profile.findOneAndUpdate(
        { user: req.user.id },
        { $set: profileFields },
        { new: true }
      );
      
      return res.json(profile);
    }

    // Créer un nouveau profil
    profile = new Profile(profileFields);
    await profile.save();
    
    res.json(profile);
  } catch (error) {
    console.error('Erreur lors de la création/mise à jour du profil:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// Télécharger un CV
router.post('/upload-cv', auth, upload.single('cv'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier CV fourni' });
    }

    const fileData = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      mimetype: req.file.mimetype,
      size: req.file.size,
      uploadDate: Date.now()
    };

    // Trouver le profil de l'utilisateur
    let profile = await Profile.findOne({ user: req.user.id });

    if (!profile) {
      // Créer un nouveau profil si aucun n'existe
      profile = new Profile({
        user: req.user.id,
        cvFiles: [fileData]
      });
    } else {
      // Ajouter le nouveau CV à la liste
      profile.cvFiles.push(fileData);
    }

    await profile.save();
    
    res.json({ 
      message: 'CV téléchargé avec succès', 
      file: fileData 
    });
  } catch (error) {
    console.error('Erreur lors du téléchargement du CV:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// Supprimer un CV
router.delete('/cv/:fileId', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    
    if (!profile) {
      return res.status(404).json({ message: 'Profil non trouvé' });
    }
    
    // Trouver l'index du CV à supprimer
    const cvIndex = profile.cvFiles.findIndex(cv => cv._id.toString() === req.params.fileId);
    
    if (cvIndex === -1) {
      return res.status(404).json({ message: 'CV non trouvé' });
    }
    
    // Supprimer le fichier du système de fichiers
    const filePath = profile.cvFiles[cvIndex].path;
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    // Supprimer l'entrée de la base de données
    profile.cvFiles.splice(cvIndex, 1);
    await profile.save();
    
    res.json({ message: 'CV supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du CV:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// Mettre à jour l'analyse du CV
router.post('/cv-analysis', auth, async (req, res) => {
  try {
    const { analysis } = req.body;
    
    if (!analysis) {
      return res.status(400).json({ message: 'Aucune analyse fournie' });
    }
    
    // Ajouter la date d'analyse
    analysis.lastAnalysisDate = Date.now();
    
    // Trouver et mettre à jour le profil
    const profile = await Profile.findOneAndUpdate(
      { user: req.user.id },
      { $set: { cvAnalysis: analysis } },
      { new: true, upsert: true }
    );
    
    res.json(profile);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'analyse du CV:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// Ajouter une nouvelle expérience
router.put('/experience', auth, async (req, res) => {
  const {
    company,
    position,
    location,
    startDate,
    endDate,
    current,
    description
  } = req.body;

  const newExp = {
    company,
    position,
    location,
    startDate,
    endDate,
    current,
    description
  };

  try {
    const profile = await Profile.findOne({ user: req.user.id });
    
    if (!profile) {
      return res.status(404).json({ message: 'Profil non trouvé' });
    }
    
    profile.experiences.unshift(newExp);
    await profile.save();
    
    res.json(profile);
  } catch (error) {
    console.error('Erreur lors de l\'ajout d\'une expérience:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// Modifier une expérience existante
router.put('/experience/:expId', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    
    if (!profile) {
      return res.status(404).json({ message: 'Profil non trouvé' });
    }
    
    // Trouver l'index de l'expérience à modifier
    const expIndex = profile.experiences.findIndex(exp => exp._id.toString() === req.params.expId);
    
    if (expIndex === -1) {
      return res.status(404).json({ message: 'Expérience non trouvée' });
    }
    
    // Mettre à jour l'expérience
    profile.experiences[expIndex] = {
      ...profile.experiences[expIndex].toObject(),
      ...req.body
    };
    
    await profile.save();
    
    res.json(profile);
  } catch (error) {
    console.error('Erreur lors de la modification d\'une expérience:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// Supprimer une expérience
router.delete('/experience/:expId', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    
    if (!profile) {
      return res.status(404).json({ message: 'Profil non trouvé' });
    }
    
    // Trouver l'index de l'expérience à supprimer
    const expIndex = profile.experiences.findIndex(exp => exp._id.toString() === req.params.expId);
    
    if (expIndex === -1) {
      return res.status(404).json({ message: 'Expérience non trouvée' });
    }
    
    // Supprimer l'expérience
    profile.experiences.splice(expIndex, 1);
    await profile.save();
    
    res.json(profile);
  } catch (error) {
    console.error('Erreur lors de la suppression d\'une expérience:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// Routes similaires pour education, skills, languages
// (Vous pouvez les implémenter de manière similaire aux routes d'expérience)

// Ajouter ou mettre à jour les compétences
router.put('/skills', auth, async (req, res) => {
  try {
    const { skills } = req.body;
    console.log('Mise à jour des compétences pour l\'utilisateur:', req.user.id);
    console.log('Données reçues:', skills);
    
    if (!skills || !Array.isArray(skills)) {
      return res.status(400).json({ message: 'Données de compétences invalides' });
    }
    
    // Trouver le profil de l'utilisateur
    let profile = await Profile.findOne({ user: req.user.id });
    
    if (!profile) {
      // Créer un nouveau profil si aucun n'existe
      profile = new Profile({
        user: req.user.id,
        skills: skills
      });
      await profile.save();
      console.log('Nouveau profil créé avec compétences');
    } else {
      // Mettre à jour les compétences existantes
      profile.skills = skills;
      await profile.save();
      console.log('Compétences mises à jour dans le profil existant');
    }
    
    // Mettre à jour également les compétences dans le modèle utilisateur
    const user = await User.findById(req.user.id);
    if (user) {
      user.skills = skills;
      await user.save();
      console.log('Compétences mises à jour dans le modèle utilisateur');
    }
    
    // Retourner le profil et l'utilisateur mis à jour (sans le mot de passe)
    const updatedUser = await User.findById(req.user.id).select('-password');
    
    res.json({
      profile,
      user: updatedUser
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour des compétences:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// Ajouter ou mettre à jour les informations professionnelles
router.put('/professional', auth, async (req, res) => {
  try {
    const professionalInfo = req.body;
    
    if (!professionalInfo) {
      return res.status(400).json({ message: 'Données professionnelles invalides' });
    }
    
    // Trouver le profil de l'utilisateur
    let profile = await Profile.findOne({ user: req.user.id });
    
    if (!profile) {
      // Créer un nouveau profil si aucun n'existe
      profile = new Profile({
        user: req.user.id,
        professional: professionalInfo
      });
      await profile.save();
    } else {
      // Mettre à jour les informations professionnelles
      profile.professional = professionalInfo;
      await profile.save();
    }
    
    // Récupérer le user pour mettre à jour ses infos
    const user = await User.findById(req.user.id);
    if (user) {
      if (!user.professional) user.professional = {};
      user.professional = {
        ...user.professional,
        ...professionalInfo
      };
      await user.save();
    }
    
    res.json(profile);
  } catch (error) {
    console.error('Erreur lors de la mise à jour des informations professionnelles:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// Ajouter ou mettre à jour les informations sociales
router.put('/social', auth, async (req, res) => {
  try {
    const socialInfo = req.body;
    
    if (!socialInfo) {
      return res.status(400).json({ message: 'Données sociales invalides' });
    }
    
    // Trouver le profil de l'utilisateur
    let profile = await Profile.findOne({ user: req.user.id });
    
    if (!profile) {
      // Créer un nouveau profil si aucun n'existe
      profile = new Profile({
        user: req.user.id,
        social: socialInfo
      });
      await profile.save();
    } else {
      // Mettre à jour les informations sociales
      profile.social = socialInfo;
      await profile.save();
    }
    
    // Mettre à jour les informations sociales dans le User aussi
    const user = await User.findById(req.user.id);
    if (user) {
      if (!user.social) user.social = {};
      user.social = {
        ...user.social,
        ...socialInfo
      };
      await user.save();
    }
    
    res.json(profile);
  } catch (error) {
    console.error('Erreur lors de la mise à jour des informations sociales:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// Mettre à jour les informations personnelles de base
router.put('/basic-info', auth, async (req, res) => {
  try {
    const { firstName, lastName, bio } = req.body;
    
    // Trouver l'utilisateur et mettre à jour ses informations de base
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (bio !== undefined) user.bio = bio;
    
    await user.save();
    
    // Mettre également à jour ces informations dans le profil s'il existe
    let profile = await Profile.findOne({ user: req.user.id });
    if (profile) {
      if (!profile.personalInfo) profile.personalInfo = {};
      if (bio !== undefined) profile.personalInfo.bio = bio;
      await profile.save();
    }
    
    res.json({ success: true, user });
  } catch (error) {
    console.error('Erreur lors de la mise à jour des informations de base:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// Mettre à jour les informations personnelles
router.put('/personal-info', auth, async (req, res) => {
  try {
    console.log('Requête de mise à jour des informations personnelles reçue:', req.body);
    const { personalInfo } = req.body;
    
    if (!personalInfo) {
      console.log('Données personnelles manquantes ou invalides');
      return res.status(400).json({ message: 'Données personnelles invalides' });
    }
    
    console.log('Recherche du profil pour l\'utilisateur:', req.user.id);
    // Trouver le profil de l'utilisateur
    let profile = await Profile.findOne({ user: req.user.id });
    
    if (!profile) {
      console.log('Aucun profil trouvé, création d\'un nouveau profil');
      // Créer un nouveau profil si aucun n'existe
      profile = new Profile({
        user: req.user.id,
        personalInfo: personalInfo
      });
      await profile.save();
      console.log('Nouveau profil créé avec les informations personnelles');
    } else {
      console.log('Profil existant trouvé, mise à jour des informations personnelles');
      // Mettre à jour les informations personnelles
      profile.personalInfo = {
        ...profile.personalInfo,
        ...personalInfo
      };
      await profile.save();
      console.log('Profil mis à jour avec les nouvelles informations personnelles');
    }
    
    console.log('Mise à jour des informations de contact dans l\'utilisateur');
    // Mettre à jour les informations de contact dans le User aussi
    const user = await User.findById(req.user.id);
    if (user) {
      if (!user.contact) user.contact = {};
      user.contact = {
        ...user.contact,
        phoneNumber: personalInfo.phoneNumber || '',
        address: personalInfo.address || '',
        city: personalInfo.city || '',
        postalCode: personalInfo.postalCode || '',
        country: personalInfo.country || ''
      };
      await user.save();
      console.log('Utilisateur mis à jour avec les nouvelles informations de contact');
    } else {
      console.log('Utilisateur non trouvé pour la mise à jour des contacts');
    }
    
    // Retourner l'utilisateur mis à jour
    const updatedUser = await User.findById(req.user.id).select('-password');
    console.log('Réponse envoyée avec succès');
    res.json({
      success: true,
      profile,
      user: updatedUser
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour des informations personnelles:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// Supprimer le profil et l'utilisateur
router.delete('/', auth, async (req, res) => {
  try {
    // Supprimer les fichiers CV associés
    const profile = await Profile.findOne({ user: req.user.id });
    
    if (profile) {
      // Supprimer les fichiers physiques
      profile.cvFiles.forEach(cv => {
        if (fs.existsSync(cv.path)) {
          fs.unlinkSync(cv.path);
        }
      });
      
      // Supprimer le profil
      await Profile.findOneAndRemove({ user: req.user.id });
    }
    
    // Supprimer l'utilisateur
    await User.findOneAndRemove({ _id: req.user.id });
    
    res.json({ message: 'Utilisateur et profil supprimés avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du profil:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// Mettre à jour l'avatar de l'utilisateur
router.post('/avatar', auth, avatarUpload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier avatar fourni' });
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    // Mettre à jour l'avatar dans le modèle utilisateur
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Supprimer l'ancien avatar s'il existe
    if (user.avatar && user.avatar.startsWith('/uploads/')) {
      const oldAvatarPath = path.join(__dirname, '..', user.avatar);
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }

    user.avatar = avatarUrl;
    await user.save();

    res.json({ 
      success: true,
      avatar: avatarUrl,
      message: 'Avatar mis à jour avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'avatar:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

module.exports = router; 