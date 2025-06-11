const jwt = require('jsonwebtoken');
const config = require('../config/config');
const User = require('../models/user');

const auth = async (req, res, next) => {
  try {
    // Récupérer le token du header Authorization
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error('No token provided');
    }

    // Vérifier le token
    const decoded = jwt.verify(token, config.JWT_SECRET);
    
    // Trouver l'utilisateur
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      throw new Error('User not found');
    }

    // Ajouter l'utilisateur à la requête
    req.user = user;
    req.token = token;
    
    next();
  } catch (error) {
    res.status(401).json({ 
      error: 'Please authenticate.',
      details: error.message 
    });
  }
};

module.exports = auth; 