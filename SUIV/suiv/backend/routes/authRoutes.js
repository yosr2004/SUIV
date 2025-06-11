const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../config/config');
const User = require('../models/user');
const auth = require('../middleware/auth');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/emailService');

const router = express.Router();

// Inscription
router.post('/signup', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Créer un nouvel utilisateur (sans token de vérification)
    const user = new User({
      firstName,
      lastName,
      email,
      password,
      isEmailVerified: true,
      isOnline: false
    });

    await user.save();
    console.log('Nouvel utilisateur créé:', user._id);

    // Générer le JWT
    const token = jwt.sign(
      { id: user._id },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRES_IN }
    );

    res.status(201).json({
      message: 'User created successfully.',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isEmailVerified: true
      },
      token
    });
  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).json({ message: 'Server error. Try again later.' });
  }
});

// Connexion (sans vérification d'email)
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Tentative de connexion pour:', email);

    // Trouver l'utilisateur
    console.log('Recherche de l\'utilisateur avec l\'email:', email);
    const user = await User.findOne({ email });
    console.log('Utilisateur trouvé:', user);
    if (!user) {
      console.log('Utilisateur non trouvé:', email);
      return res.status(400).json({ message: 'User not found' });
    }

    // Vérifier le mot de passe
    const isMatch = await user.comparePassword(password);
    console.log('Mot de passe correspondant:', isMatch);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    // Générer le JWT
    const token = jwt.sign(
      { id: user._id },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRES_IN }
    );

    res.json({
      message: 'Sign-in successful',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isEmailVerified: user.isEmailVerified
      },
      token
    });
  } catch (error) {
    console.error('Error during signin:', error);
    res.status(500).json({ message: 'Server error. Try again later.' });
  }
});

// Vérification de l'email
router.get('/verify-email/:token', async (req, res) => {
  try {
    const user = await User.findOne({
      emailVerificationToken: req.params.token,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        message: 'Invalid or expired verification token' 
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Error during email verification:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Demande de réinitialisation du mot de passe
router.post('/forgot-password', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 heure
    await user.save();

    await sendPasswordResetEmail(user.email, resetToken);

    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error('Error during password reset request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Réinitialisation du mot de passe
router.post('/reset-password/:token', async (req, res) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        message: 'Invalid or expired reset token' 
      });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.lastPasswordChange = Date.now();
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Error during password reset:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Route protégée pour obtenir le profil utilisateur
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Déconnexion
router.post('/logout', auth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, {
      isOnline: false,
      lastSeen: Date.now()
    });
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Obtenir tous les utilisateurs (route protégée)
router.get('/users', auth, async (req, res) => {
  try {
    const users = await User.find({})
      .select('firstName lastName email isOnline lastSeen')
      .sort('-createdAt');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Obtenir tous les utilisateurs inscrits (sans authentification, pour la messagerie)
router.get('/signup', async (req, res) => {
  try {
    console.log('GET /api/signup - Récupération de tous les utilisateurs inscrits');
    
    // Rechercher tous les utilisateurs dans la collection
    const users = await User.find({})
      .select('firstName lastName email avatar isOnline lastSeen roles professional') 
      .sort('-createdAt');
      
    console.log(`Nombre d'utilisateurs trouvés: ${users.length}`);
    
    // Retourner les utilisateurs sans filtrage
    res.json(users);
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
