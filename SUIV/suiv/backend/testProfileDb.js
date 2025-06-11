require('dotenv').config();
const mongoose = require('mongoose');
const Profile = require('./models/profile');
const User = require('./models/user');
const fs = require('fs');
const path = require('path');

// Se connecter à MongoDB
mongoose.connect('mongodb://localhost:27017/profiles-db', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB (profiles-db)'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Fonction pour créer un profil de test
async function createTestProfile() {
  try {
    // Vérifier si l'utilisateur de test existe
    let testUser = await User.findOne({ email: 'test@example.com' });
    
    if (!testUser) {
      console.log('Creating test user...');
      testUser = new User({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'password123',
        isEmailVerified: true
      });
      await testUser.save();
      console.log('Test user created with ID:', testUser._id);
    }
    
    // Vérifier si le profil existe déjà
    let profile = await Profile.findOne({ user: testUser._id });
    
    if (profile) {
      console.log('Profile already exists for test user');
      console.log('Profile data:', JSON.stringify(profile, null, 2));
      return profile;
    }
    
    // Créer un profil de test
    profile = new Profile({
      user: testUser._id,
      personalInfo: {
        phoneNumber: '+33612345678',
        address: '123 Rue de Test',
        city: 'Paris',
        postalCode: '75001',
        country: 'France',
        birthDate: new Date('1990-01-01'),
        linkedin: 'https://linkedin.com/in/testuser',
        github: 'https://github.com/testuser',
        website: 'https://testuser.com',
        bio: 'Je suis un utilisateur de test pour vérifier le fonctionnement du système de profil.'
      },
      skills: [
        {
          name: 'JavaScript',
          level: 'avancé',
          yearOfExperience: 5
        },
        {
          name: 'React',
          level: 'intermédiaire',
          yearOfExperience: 3
        },
        {
          name: 'Node.js',
          level: 'intermédiaire',
          yearOfExperience: 2
        }
      ],
      experiences: [
        {
          company: 'Test Company',
          position: 'Développeur Frontend',
          location: 'Paris, France',
          startDate: new Date('2020-01-01'),
          endDate: new Date('2022-12-31'),
          current: false,
          description: 'Développement d\'applications web avec React et TypeScript.'
        },
        {
          company: 'Current Company',
          position: 'Développeur Full Stack',
          location: 'Remote',
          startDate: new Date('2023-01-01'),
          current: true,
          description: 'Développement d\'applications web avec la stack MERN.'
        }
      ],
      education: [
        {
          institution: 'Université de Test',
          degree: 'Master',
          field: 'Informatique',
          startDate: new Date('2015-09-01'),
          endDate: new Date('2017-06-30'),
          description: 'Spécialisation en développement web et applications mobiles.'
        }
      ],
      languages: [
        {
          name: 'Français',
          level: 'langue maternelle'
        },
        {
          name: 'Anglais',
          level: 'avancé'
        }
      ],
      visibility: {
        isPublic: true,
        showEmail: true,
        showPhone: false
      }
    });
    
    await profile.save();
    console.log('Test profile created successfully!');
    console.log('Profile data:', JSON.stringify(profile, null, 2));
    return profile;
  } catch (error) {
    console.error('Error creating test profile:', error);
  }
}

// Fonction pour simuler l'upload d'un CV fictif
async function simulateCVUpload(userId) {
  try {
    const profile = await Profile.findOne({ user: userId });
    
    if (!profile) {
      console.error('Profile not found for user:', userId);
      return;
    }
    
    // Créer un dossier uploads/cv s'il n'existe pas
    const uploadDir = path.join(__dirname, 'uploads/cv');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    // Créer un fichier texte fictif comme CV
    const filename = `cv-${userId}-${Date.now()}.txt`;
    const filePath = path.join(uploadDir, filename);
    
    // Écrire du contenu dans le fichier
    fs.writeFileSync(filePath, 'Ceci est un CV de test pour simuler un upload de fichier.');
    
    // Ajouter l'entrée de fichier au profil
    const fileData = {
      filename: filename,
      originalName: 'cv_test.txt',
      path: filePath,
      mimetype: 'text/plain',
      size: fs.statSync(filePath).size,
      uploadDate: new Date()
    };
    
    profile.cvFiles.push(fileData);
    await profile.save();
    
    console.log('CV test file added to profile');
    console.log('CV data:', fileData);
    
    // Simuler une analyse de CV
    await simulateCVAnalysis(userId);
  } catch (error) {
    console.error('Error simulating CV upload:', error);
  }
}

// Simuler une analyse de CV
async function simulateCVAnalysis(userId) {
  try {
    const profile = await Profile.findOne({ user: userId });
    
    if (!profile) {
      console.error('Profile not found for user:', userId);
      return;
    }
    
    // Créer une analyse fictive
    const analysis = {
      overallScore: 75,
      summary: "CV bien structuré montrant une bonne expérience en développement web",
      technicalSkills: [
        { name: "JavaScript", level: "avancé" },
        { name: "React", level: "intermédiaire" },
        { name: "HTML/CSS", level: "expert" },
        { name: "Node.js", level: "débutant" }
      ],
      softSkills: [
        "Communication",
        "Travail d'équipe",
        "Résolution de problèmes"
      ],
      strengths: [
        "Bonne expérience en développement frontend",
        "Projets variés et pertinents",
        "Formation technique solide"
      ],
      improvements: [
        "Pourrait ajouter plus de détails sur les projets réalisés",
        "Quantifier les résultats et impacts des projets"
      ],
      lastAnalysisDate: new Date()
    };
    
    profile.cvAnalysis = analysis;
    await profile.save();
    
    console.log('CV analysis added to profile');
  } catch (error) {
    console.error('Error simulating CV analysis:', error);
  }
}

// Exécuter les tests
async function runTests() {
  try {
    const profile = await createTestProfile();
    
    if (profile) {
      await simulateCVUpload(profile.user);
    }
    
    console.log('All tests completed. Check MongoDB for results!');
    process.exit(0);
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

// Lancer les tests
runTests(); 