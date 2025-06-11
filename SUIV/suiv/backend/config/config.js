require('dotenv').config();

module.exports = {
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
  SESSION_SECRET: process.env.SESSION_SECRET || 'session-secret-key',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/userSignup',
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  // Paramètres de sécurité
  JWT_EXPIRES_IN: '24h',
  SESSION_COOKIE_MAX_AGE: 24 * 60 * 60 * 1000, // 24 heures
  PASSWORD_SALT_ROUNDS: 10,
}; 