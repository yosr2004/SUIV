const nodemailer = require('nodemailer');
const config = require('../config/config');

// Configurer le transporteur d'email (à adapter selon votre service d'email)
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Email de vérification
const sendVerificationEmail = async (email, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Vérifiez votre adresse email',
    html: `
      <h1>Vérification de votre compte</h1>
      <p>Merci de vous être inscrit ! Pour activer votre compte, veuillez cliquer sur le lien ci-dessous :</p>
      <a href="${verificationUrl}">Vérifier mon email</a>
      <p>Ce lien expirera dans 24 heures.</p>
      <p>Si vous n'avez pas créé de compte, vous pouvez ignorer cet email.</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email de vérification envoyé');
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email de vérification:', error);
    throw error;
  }
};

// Email de réinitialisation du mot de passe
const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Réinitialisation de votre mot de passe',
    html: `
      <h1>Réinitialisation du mot de passe</h1>
      <p>Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le lien ci-dessous pour procéder :</p>
      <a href="${resetUrl}">Réinitialiser mon mot de passe</a>
      <p>Ce lien expirera dans 1 heure.</p>
      <p>Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email de réinitialisation envoyé');
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email de réinitialisation:', error);
    throw error;
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail
}; 