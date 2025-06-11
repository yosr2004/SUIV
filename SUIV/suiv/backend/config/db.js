const mongoose = require('mongoose');
const config = require('./config');

const connectDB = async () => {
  try {
    // Utiliser la base de données configurée dans config.js ou par défaut userSignup
    const dbURI = config.MONGODB_URI || 'mongodb://localhost:27017/userSignup';
    
    await mongoose.connect(dbURI, { 
      useNewUrlParser: true, 
      useUnifiedTopology: true 
    });
    console.log(`✅ Connected to MongoDB (${dbURI.split('/').pop()})`);
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
