const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/user');
const Profile = require('./models/profile');

// Se connecter à MongoDB
const testDatabase = async () => {
  try {
    // Connexion à la base de données
    await connectDB();
    
    console.log('🔍 Testing database models...');
    
    // Vérifier les modèles User et Profile
    console.log('📑 User schema:', Object.keys(User.schema.paths).join(', '));
    console.log('📑 Profile schema:', Object.keys(Profile.schema.paths).join(', '));
    
    // Compter les utilisateurs et les profils
    const userCount = await User.countDocuments();
    const profileCount = await Profile.countDocuments();
    
    console.log(`👤 Number of users in database: ${userCount}`);
    console.log(`👥 Number of profiles in database: ${profileCount}`);
    
    // Lister les 5 premiers utilisateurs
    if (userCount > 0) {
      console.log('📋 Sample users:');
      const users = await User.find().limit(5);
      users.forEach((user, index) => {
        console.log(`  User ${index + 1}: ${user.firstName} ${user.lastName} (${user.email})`);
      });
    }
    
    // Lister les 5 premiers profils
    if (profileCount > 0) {
      console.log('📋 Sample profiles:');
      const profiles = await Profile.find().limit(5).populate('user', 'firstName lastName email');
      profiles.forEach((profile, index) => {
        const userName = profile.user ? `${profile.user.firstName} ${profile.user.lastName}` : 'Unknown';
        console.log(`  Profile ${index + 1}: ${userName}`);
        console.log(`    Skills: ${profile.skills ? profile.skills.length : 0}`);
        console.log(`    Professional: ${profile.professional ? 'Yes' : 'No'}`);
        console.log(`    Social: ${profile.social ? 'Yes' : 'No'}`);
      });
    }
    
    console.log('✅ Database connection and models test completed successfully');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    // Fermer la connexion
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Exécuter le test
testDatabase(); 