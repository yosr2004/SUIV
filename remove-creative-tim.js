const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Fonction pour lire un fichier de manière synchrone
function readFileSync(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Erreur lors de la lecture du fichier ${filePath}:`, error);
    return null;
  }
}

// Fonction pour écrire dans un fichier de manière synchrone
function writeFileSync(filePath, content) {
  try {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Mise à jour réussie: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`❌ Erreur lors de l'écriture dans le fichier ${filePath}:`, error);
    return false;
  }
}

// Fonction pour mettre à jour package.json
function updatePackageJson() {
  const packageJsonPath = path.join(__dirname, 'SUIV', 'suiv', 'package.json');
  const content = readFileSync(packageJsonPath);
  
  if (!content) return false;
  
  const packageJson = JSON.parse(content);
  
  // Mettre à jour les informations de base
  packageJson.name = "suiv-project";
  packageJson.author = "SUIV Team";
  packageJson.description = "SUIV - Plateforme de développement professionnel et gestion de carrière";
  
  // Supprimer les références à Creative Tim dans repository et bugs
  if (packageJson.repository && packageJson.repository.url) {
    packageJson.repository.url = "git+https://github.com/suiv-team/suiv.git";
  }
  
  if (packageJson.bugs && packageJson.bugs.url) {
    packageJson.bugs.url = "https://github.com/suiv-team/suiv/issues";
  }
  
  // Écrire les changements
  return writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
}

// Fonction pour mettre à jour README.md
function updateReadme() {
  const readmePath = path.join(__dirname, 'SUIV', 'suiv', 'README.md');
  
  // Nouveau contenu du README
  const newReadme = `# SUIV - Plateforme de Développement Professionnel et Gestion de Carrière

## Description
SUIV est une plateforme complète qui aide les utilisateurs à gérer leur développement professionnel, suivre leurs compétences, et recevoir des recommandations personnalisées pour leur carrière grâce à l'intelligence artificielle.

## Fonctionnalités principales
- Système d'authentification complet
- Gestion de profil professionnel détaillé
- Évaluation et suivi des compétences
- Messagerie en temps réel entre utilisateurs
- Système de mentorat
- Assistant IA pour recommandations personnalisées
- Analyse de CV et conseils de carrière

## Technologies utilisées
- Frontend: React, Material UI
- Backend: Node.js, Express
- Base de données: MongoDB
- Temps réel: Socket.IO
- IA: API Cohere

## Installation

\`\`\`bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm start
\`\`\`

## Structure du projet
- /backend - Code du serveur Node.js et API
- /src - Code source React
- /public - Fichiers statiques

## Licence
Tous droits réservés.
`;
  
  return writeFileSync(readmePath, newReadme);
}

// Fonction pour supprimer les commentaires Creative Tim dans les fichiers JS/JSX
function removeCreativeTimComments() {
  const rootDir = path.join(__dirname, 'SUIV', 'suiv', 'src');
  
  // Expression régulière pour trouver les commentaires Creative Tim
  const creativeTimRegex = /\/\*[\s\S]*?Product Page[\s\S]*?Creative Tim[\s\S]*?\*\//g;
  
  // Trouver tous les fichiers JS et JSX récursivement
  const findCommand = process.platform === 'win32' 
    ? `dir /s /b "${rootDir}\\*.js" "${rootDir}\\*.jsx"`
    : `find "${rootDir}" -type f \\( -name "*.js" -o -name "*.jsx" \\)`;
  
  try {
    const files = execSync(findCommand, { encoding: 'utf8' })
      .trim()
      .split('\n')
      .filter(Boolean);
    
    let updatedCount = 0;
    
    for (const filePath of files) {
      const content = readFileSync(filePath);
      if (!content) continue;
      
      // Supprimer les commentaires Creative Tim
      const newContent = content.replace(creativeTimRegex, '');
      
      // Si le contenu a changé, écrire le nouveau contenu
      if (content !== newContent) {
        if (writeFileSync(filePath, newContent)) {
          updatedCount++;
        }
      }
    }
    
    console.log(`✅ ${updatedCount} fichiers ont été mis à jour pour supprimer les commentaires Creative Tim.`);
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de la recherche ou mise à jour des fichiers:', error);
    return false;
  }
}

// Exécuter les fonctions
console.log('🔄 Suppression des références à Creative Tim...');

const packageJsonUpdated = updatePackageJson();
console.log(packageJsonUpdated 
  ? '✅ package.json mis à jour avec succès.' 
  : '❌ Échec de la mise à jour de package.json.');

const readmeUpdated = updateReadme();
console.log(readmeUpdated 
  ? '✅ README.md mis à jour avec succès.' 
  : '❌ Échec de la mise à jour de README.md.');

const commentsRemoved = removeCreativeTimComments();
console.log(commentsRemoved 
  ? '✅ Commentaires Creative Tim supprimés avec succès.' 
  : '❌ Échec de la suppression des commentaires Creative Tim.');

console.log('🏁 Opération terminée.'); 