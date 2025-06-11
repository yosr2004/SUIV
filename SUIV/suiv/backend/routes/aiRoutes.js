const express = require('express');
const router = express.Router();
const axios = require('axios');
const { CohereClient } = require("cohere-ai");
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Profile = require('../models/profile');

// Si vous avez pdf-parse et textract installés
const pdfParse = require('pdf-parse');
const textract = require('textract');

// Utiliser la clé API Cohere depuis les variables d'environnement
const COHERE_API_KEY = process.env.CO_API_KEY || process.env.COHERE_API_KEY;

// Initialiser le client Cohere
const cohereClient = new CohereClient({
  token: COHERE_API_KEY,
});

console.log("Cohere API Key configurée:", COHERE_API_KEY ? "Oui" : "Non");

// Fonction pour nettoyer et extraire JSON valide du texte
function extractValidJSON(text) {
  if (typeof text !== 'string') return text;
  
  // Look for JSON inside markdown code blocks first
  const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/;
  const codeBlockMatch = text.match(codeBlockRegex);
  if (codeBlockMatch && codeBlockMatch[1]) {
    try {
      const jsonFromCodeBlock = JSON.parse(codeBlockMatch[1].trim());
      console.log("JSON successfully extracted from code block");
      return jsonFromCodeBlock;
    } catch (e) {
      console.log("Failed to parse JSON from code block, trying other methods");
      // Continue with other methods if this fails
    }
  }
  
  // Trouver le premier caractère JSON valide ([ ou {)
  const jsonStartIndex = text.search(/[\[\{]/);
  if (jsonStartIndex === -1) return null;
  
  // Extraire tout à partir de ce caractère
  const jsonText = text.substring(jsonStartIndex);
  
  // Essayer différentes sous-chaînes jusqu'à trouver un JSON valide
  for (let endIndex = jsonText.length; endIndex > 0; endIndex--) {
    try {
      const candidate = jsonText.substring(0, endIndex);
      // Vérifier si c'est un JSON valide et complet
      const parsed = JSON.parse(candidate);
      return parsed;
    } catch (e) {
      // Continuer avec une sous-chaîne plus courte
      continue;
    }
  }
  
  // Essayer avec des regex pour trouver un objet ou tableau JSON
  try {
    const arrayMatch = text.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      return JSON.parse(arrayMatch[0]);
    }
    
    const objectMatch = text.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      return JSON.parse(objectMatch[0]);
    }
  } catch (e) {
    console.error("Échec de l'extraction regex:", e);
  }
  
  // Pas de JSON valide trouvé
  return null;
}

// Fonction pour interroger Cohere
async function queryCohere(prompt) {
  try {
    console.log("Appel à Cohere avec prompt:", prompt.substring(0, 50) + "...");
    
    const response = await cohereClient.generate({
      model: 'command',
      prompt: prompt + "\n\nRÉPONDS UNIQUEMENT AVEC UN JSON VALIDE, SANS TEXTE EXPLICATIF, SANS MARKDOWN, ET SANS BACKTICKS.",
      maxTokens: 1000,
      temperature: 0.3,
      k: 0,
      stopSequences: [],
      returnLikelihoods: 'NONE'
    });
    
    if (!response || !response.generations || !response.generations[0]) {
      throw new Error("Réponse invalide de l'API Cohere");
    }
    
    console.log("Réponse reçue de Cohere");
    const text = response.generations[0].text.trim();
    
    // Log la réponse pour déboguer
    if (text.length > 500) {
      console.log("Aperçu de la réponse:", text.substring(0, 500) + "...");
    } else {
      console.log("Réponse complète:", text);
    }
    
    // Extraire le JSON valide de la réponse
    const parsedData = extractValidJSON(text);
    
    if (parsedData) {
      return parsedData;
    } else {
      console.error("Pas de JSON valide trouvé dans la réponse");
      return { rawText: text };
    }
  } catch (error) {
    console.error('Erreur lors de la requête Cohere:', error.message);
    return { error: true, message: error.message };
  }
}

// Alternative avec axios si le SDK pose problème
async function queryCohereWithAxios(prompt) {
  try {
    console.log("Appel à Cohere API avec prompt:", prompt.substring(0, 50) + "...");
    
    const response = await axios.post(
      'https://api.cohere.ai/v1/generate',
      {
        model: 'command',
        prompt: prompt,
        max_tokens: 1000,
        temperature: 0.7,
        k: 0,
        stop_sequences: [],
        return_likelihoods: 'NONE'
      },
      {
        headers: {
          'Authorization': `Bearer ${COHERE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log("Réponse reçue de Cohere");
    return response.data.generations[0].text.trim();
  } catch (error) {
    console.error('Erreur détaillée Cohere:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Message d\'erreur:', error.message);
    }
    throw new Error(`Erreur lors de la communication avec l'IA: ${error.message}`);
  }
}

// Configuration pour stocker les fichiers téléchargés
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
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
  fileFilter: function (req, file, cb) {
    // Accepter PDF, DOC, DOCX
    if (file.mimetype === 'application/pdf' || 
        file.mimetype === 'application/msword' || 
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      cb(null, true);
    } else {
      cb(new Error('Format de fichier non supporté. Veuillez utiliser PDF, DOC ou DOCX.'));
    }
  }
});

// Fonction simplifiée pour extraire le texte d'un fichier
// Pour une implémentation complète, installez pdf-parse et textract
async function extractTextFromFile(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  
  try {
    if (extension === '.pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      return data.text;
    } else if (extension === '.docx' || extension === '.doc') {
      return new Promise((resolve, reject) => {
        textract.fromFileWithPath(filePath, function(error, text) {
          if (error) {
            reject(error);
          } else {
            resolve(text);
          }
        });
      });
    } else {
      return "Impossible d'extraire le contenu du fichier au format " + extension;
    }
  } catch (error) {
    console.error("Erreur d'extraction de texte:", error);
    throw new Error("Extraction de texte échouée: " + error.message);
  }
}

// Route pour analyser un CV avec Cohere
router.post('/analyze-cv', upload.single('cv'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier CV fourni' });
    }

    const filePath = req.file.path;
    console.log(`CV reçu: ${req.file.originalname}, sauvegardé à ${filePath}`);

    // Variable pour stocker l'ID de l'utilisateur s'il est authentifié
    let userId = null;
    if (req.header('Authorization')) {
      try {
        // Extraire le token du header Authorization
        const token = req.header('Authorization').replace('Bearer ', '');
        // Vérifier et décoder le token
        const decoded = require('jsonwebtoken').verify(token, require('../config/config').JWT_SECRET);
        userId = decoded.id;
        console.log("Utilisateur authentifié:", userId);
      } catch (error) {
        console.log("Token d'authentification invalide:", error.message);
      }
    }

    // Extraire le texte du CV
    let extractedText;
    try {
      extractedText = await extractTextFromFile(filePath);
      console.log(`Texte extrait: ${extractedText.substring(0, 100)}...`);
    } catch (error) {
      console.error("Erreur lors de l'extraction du texte:", error);
      extractedText = "Contenu du CV non disponible. Utilisation de l'exemple.";
    }

    // Utiliser Cohere pour analyser le texte du CV
    const prompt = `Tu es un expert en ressources humaines et recrutement.
    
    Analyze the following CV/resume text and extract relevant information. Then provide an assessment in French using JSON format.

    CV TEXT:
    ${extractedText.substring(0, 3000)} 
    ${extractedText.length > 3000 ? '... [truncated for length]' : ''}

    Respond with a JSON object in the following format. ALL FIELDS MUST BE IN FRENCH:
    {
      "overallScore": a numerical score from 0-100 representing the CV quality,
      "summary": "a one-sentence summary assessment of the CV in French",
      "skills": {
        "technical": [{"name": "skill name in French", "level": "skill level in French (débutant/intermédiaire/expert)"}],
        "soft": ["soft skill 1 in French", "soft skill 2 in French"]
      },
      "education": {
        "level": "highest education level detected in French",
        "relevance": numerical rating from 1-5
      },
      "experience": {
        "years": estimated years of experience,
        "relevance": numerical rating from 1-5
      },
      "strengths": ["strength 1 in French", "strength 2 in French", "strength 3 in French"],
      "improvements": ["improvement suggestion 1 in French", "improvement suggestion 2 in French"],
      "recommendations": [
        {
          "title": "recommendation title in French",
          "description": "detailed description in French"
        }
      ]
    }
    
    IMPORTANT: All text in the JSON must be in French. Respond ONLY with the JSON, with NO additional text.`;

    try {
      // Appeler l'API Cohere
      const aiResponse = await queryCohere(prompt);
      console.log("Réponse AI reçue", typeof aiResponse === 'object' ? '(objet JSON)' : '(texte)');
      
      // Variable pour stocker l'analyse finale
      let cvAnalysisResult = null;
      
      // Extraire le JSON de la réponse
      try {
        // 1. Vérifier si la réponse est déjà un objet
        if (typeof aiResponse === 'object') {
          cvAnalysisResult = aiResponse;
        } else if (typeof aiResponse === 'string') {
          // 2. Rechercher un objet JSON complet
          const jsonMatch = aiResponse.match(/\{[\s\S]*?\}/);
          if (jsonMatch) {
            try {
              cvAnalysisResult = JSON.parse(jsonMatch[0]);
            } catch (jsonError) {
              console.error("Erreur lors du parsing de l'objet JSON:", jsonError);
            }
          }
        }
        
        // Si l'utilisateur est authentifié, sauvegarder l'analyse dans son profil
        if (userId && cvAnalysisResult) {
          try {
            // Formater l'analyse pour la structure du profil
            const profileAnalysis = {
              overallScore: cvAnalysisResult.overallScore || 0,
              summary: cvAnalysisResult.summary || "",
              technicalSkills: cvAnalysisResult.skills?.technical?.map(skill => ({
                name: skill.name || skill,
                level: skill.level || "intermédiaire"
              })) || [],
              softSkills: cvAnalysisResult.skills?.soft || [],
              strengths: cvAnalysisResult.strengths || [],
              improvements: cvAnalysisResult.improvements || [],
              lastAnalysisDate: new Date()
            };
            
            // Sauvegarder l'information du fichier CV
            const cvFileInfo = {
              filename: req.file.filename,
              originalName: req.file.originalname,
              path: req.file.path,
              mimetype: req.file.mimetype,
              size: req.file.size,
              uploadDate: new Date()
            };
            
            // Trouver ou créer un profil pour l'utilisateur
            let profile = await Profile.findOne({ user: userId });
            
            if (!profile) {
              // Créer un nouveau profil
              profile = new Profile({
                user: userId,
                cvFiles: [cvFileInfo],
                cvAnalysis: profileAnalysis
              });
            } else {
              // Mettre à jour le profil existant
              profile.cvFiles.push(cvFileInfo);
              profile.cvAnalysis = profileAnalysis;
            }
            
            await profile.save();
            console.log("Analyse CV et fichier sauvegardés dans le profil de l'utilisateur");
          } catch (profileError) {
            console.error("Erreur lors de la sauvegarde dans le profil:", profileError);
          }
        }
        
        // Ne pas supprimer le fichier si sauvegardé dans le profil
        if (!userId) {
          // Nettoyer le fichier après l'analyse
          fs.unlink(filePath, (err) => {
            if (err) console.error(`Erreur lors de la suppression du fichier: ${err.message}`);
          });
        }
        
        if (cvAnalysisResult) {
          return res.json(cvAnalysisResult);
        }
      } catch (parseError) {
        console.error("Erreur lors de l'analyse du CV:", parseError);
      }
      
      // Créez un objet par défaut si on n'a pas pu extraire un JSON valide
      const defaultResponse = {
        overallScore: 50,
        summary: "Réponse incomplète",
        skills: {
          technical: [],
          soft: []
        },
        education: {
          level: "Niveau inconnu",
          relevance: 3
        },
        experience: {
          years: 0,
          relevance: 3
        },
        strengths: [],
        improvements: [],
        recommendations: []
      };
      
      return res.json(defaultResponse);
    } catch (error) {
      console.error("Erreur lors de l'appel à l'IA:", error);
      
      // Nettoyer le fichier en cas d'erreur
      if (filePath) {
        fs.unlink(filePath, (err) => {
          if (err) console.error(`Erreur lors de la suppression du fichier: ${err.message}`);
        });
      }
      
      return res.status(500).json({
        message: "Erreur lors de l'analyse du CV par l'IA",
        error: error.message
      });
    }
  } catch (error) {
    console.error("Erreur lors de l'analyse du CV:", error);
    return res.status(500).json({ 
      message: "Erreur lors de l'analyse du CV", 
      error: error.message 
    });
  }
});

// Analyser une compétence
router.get('/market-trends/:skill', async (req, res) => {
  try {
    const skill = req.params.skill;
    console.log("Analyse demandée pour:", skill);
    
    if (!skill) {
      return res.status(400).json({ message: 'Le paramètre "skill" est requis' });
    }
    
    const prompt = `Tu es un expert en analyse du marché du travail et des compétences professionnelles.
    
    Analyze the skill "${skill}" in the current job market.
    
    Provide the following information in JSON format:
    {
      "skill": "${skill}",
      "demand": "market demand level (high, medium, low)",
      "growth": "expected growth percentage",
      "salary": "average salary for this skill",
      "skills": ["list of 3-5 related skills"],
      "industries": ["sectors looking for this skill"]
    }
    
    ATTENTION: TRÈS IMPORTANT:
    1. Réponds UNIQUEMENT avec le JSON brut
    2. N'ajoute PAS de texte explicatif avant ou après le JSON
    3. N'utilise PAS de backticks (\`\`\`)
    4. N'utilise PAS de balises 'json'
    5. Assure-toi que le JSON est parfaitement valide`;
    
    const aiResponse = await queryCohere(prompt);
    console.log("Réponse brute:", typeof aiResponse === 'string' ? aiResponse.substring(0, 100) + "..." : "Non-string response");
    
    // Extraire le JSON de la réponse
    try {
      // Vérifier si la réponse est déjà un objet JSON
      if (typeof aiResponse === 'object' && !Array.isArray(aiResponse)) {
        return res.json(aiResponse);
      }
      
      // Si c'est une chaîne, essayez de la parser
      if (typeof aiResponse === 'string') {
        try {
          // Essayer de parse directement
          const parsedJSON = JSON.parse(aiResponse);
          return res.json(parsedJSON);
        } catch (parseError) {
          console.log("Erreur de parsing direct, tentative d'extraction de JSON");
          
          // Essayer de trouver un objet JSON dans la réponse
          const jsonMatch = aiResponse.match(/\{[\s\S]*?\}/);
          if (jsonMatch) {
            try {
              const jsonResponse = JSON.parse(jsonMatch[0]);
              return res.json(jsonResponse);
            } catch (innerError) {
              console.error("Erreur lors du parsing du premier match JSON:", innerError);
            }
          }
        }
      }
      
      // Si on arrive ici, créer une réponse manuellement
      console.log("Création manuelle de l'analyse basée sur la réponse texte");
      
      // Extraire des informations de base du texte
      let skill = req.query.skill || req.params.skill || '';
      const demand = (typeof aiResponse === 'string' && 
        (aiResponse.includes("high demand") || aiResponse.includes("forte demande")))
        ? "high" 
        : (typeof aiResponse === 'string' && 
          (aiResponse.includes("low demand") || aiResponse.includes("faible demande")))
          ? "low"
          : "medium";
      
      const salaryMatch = typeof aiResponse === 'string' ? 
        aiResponse.match(/\$\d+,\d+|\d+\s*€|\d+\s*euros/i) : null;
      const salary = salaryMatch ? salaryMatch[0] : "Variable selon l'expérience";
      
      return res.json({
        skill: skill,
        demand: demand,
        growth: "10-15% (estimation)",
        salary: salary,
        skills: ["Analyse basée sur le texte"],
        industries: ["Technologie", "Développement web"],
        note: "Données extraites du texte, non-JSON",
        fromAI: true
      });
    } catch (error) {
      console.error("Erreur complète:", error);
      return res.status(500).json({ 
        message: "Erreur lors de l'analyse de la compétence", 
        error: error.message 
      });
    }
  } catch (error) {
    console.error("Erreur d'analyse de compétence:", error);
    return res.status(500).json({ 
      message: "Erreur lors de l'analyse de la compétence", 
      error: error.message 
    });
  }
});

// Analyser une compétence (version compatible avec les paramètres de requête)
router.get('/market-trends', async (req, res) => {
  try {
    const { skill } = req.query;
    console.log("Analyse demandée pour (param):", skill);
    
    if (!skill) {
      return res.status(400).json({ message: 'Le paramètre "skill" est requis' });
    }
    
    const prompt = `Tu es un expert en analyse du marché du travail et des compétences professionnelles.
    
    Analyze the skill "${skill}" in the current job market.
    
    Provide the following information in JSON format:
    {
      "skill": "${skill}",
      "demand": "market demand level (high, medium, low)",
      "growth": "expected growth percentage",
      "salary": "average salary for this skill",
      "skills": ["list of 3-5 related skills"],
      "industries": ["sectors looking for this skill"]
    }
    
    Respond ONLY with the JSON, with NO additional text.`;
    
    const aiResponse = await queryCohere(prompt);
    console.log("Réponse brute:", typeof aiResponse === 'string' ? aiResponse.substring(0, 100) + "..." : "Non-string response");
    
    // Extraire le JSON de la réponse
    try {
      // Vérifier si la réponse est déjà un objet JSON
      if (typeof aiResponse === 'object' && !Array.isArray(aiResponse)) {
        return res.json(aiResponse);
      }
      
      // Si c'est une chaîne, essayez de la parser
      if (typeof aiResponse === 'string') {
        try {
          // Essayer de parse directement
          const parsedJSON = JSON.parse(aiResponse);
          return res.json(parsedJSON);
        } catch (parseError) {
          console.log("Erreur de parsing direct, tentative d'extraction de JSON");
          
          // Essayer de trouver un objet JSON dans la réponse
          const jsonMatch = aiResponse.match(/\{[\s\S]*?\}/);
          if (jsonMatch) {
            try {
              const jsonResponse = JSON.parse(jsonMatch[0]);
              return res.json(jsonResponse);
            } catch (innerError) {
              console.error("Erreur lors du parsing du premier match JSON:", innerError);
            }
          }
        }
      }
      
      // Si on arrive ici, créer une réponse manuellement
      console.log("Création manuelle de l'analyse basée sur la réponse texte");
      
      // Extraire des informations de base du texte
      let skill = req.query.skill || req.params.skill || '';
      const demand = (typeof aiResponse === 'string' && 
        (aiResponse.includes("high demand") || aiResponse.includes("forte demande")))
        ? "high" 
        : (typeof aiResponse === 'string' && 
          (aiResponse.includes("low demand") || aiResponse.includes("faible demande")))
          ? "low"
          : "medium";
      
      const salaryMatch = typeof aiResponse === 'string' ? 
        aiResponse.match(/\$\d+,\d+|\d+\s*€|\d+\s*euros/i) : null;
      const salary = salaryMatch ? salaryMatch[0] : "Variable selon l'expérience";
      
      return res.json({
        skill: skill,
        demand: demand,
        growth: "10-15% (estimation)",
        salary: salary,
        skills: ["Analyse basée sur le texte"],
        industries: ["Technologie", "Développement web"],
        note: "Données extraites du texte, non-JSON",
        fromAI: true
      });
    } catch (error) {
      console.error("Erreur complète:", error);
      return res.status(500).json({ 
        message: "Erreur lors de l'analyse de la compétence", 
        error: error.message 
      });
    }
  } catch (error) {
    console.error("Erreur d'analyse de compétence:", error);
    return res.status(500).json({ 
      message: "Erreur lors de l'analyse de la compétence", 
      error: error.message 
    });
  }
});

// Recommandations de formations
router.post('/training-recommendations', async (req, res) => {
  try {
    const { skills, level } = req.body;
    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      return res.status(400).json({ message: 'Le paramètre "skills" doit être un tableau non vide' });
    }
    
    console.log(`Demande de recommandations pour: ${skills.join(', ')} (niveau: ${level || 'non spécifié'})`);
    
    // Première approche: Essayer d'utiliser l'IA
    try {
      const prompt = `Tu es un conseiller expert en formation professionnelle.

Recommande exactement 3 cours réels pour quelqu'un ayant un niveau ${level || 'intermédiaire'} dans ces compétences: ${skills.join(', ')}.

Les cours doivent être disponibles en ligne sur des plateformes comme Udemy, Coursera, edX, OpenClassrooms.

RETOURNE LE RÉSULTAT EXACTEMENT DANS CE FORMAT DE TABLEAU JSON:
[
  {
    "title": "titre du cours exact en français",
    "provider": "nom de la plateforme (Udemy, Coursera, etc.)",
    "description": "description détaillée en français",
    "duration": "durée approximative",
    "level": "niveau (débutant, intermédiaire, avancé)",
    "rating": 4.5,
    "price": "prix en euros (ou Gratuit)",
    "url": "lien direct vers le cours"
  },
  {
    "title": "titre du deuxième cours en français",
    "provider": "nom de la plateforme (Udemy, Coursera, etc.)",
    "description": "description détaillée en français",
    "duration": "durée approximative",
    "level": "niveau (débutant, intermédiaire, avancé)",
    "rating": 4.7,
    "price": "prix en euros (ou Gratuit)",
    "url": "lien direct vers le cours"
  },
  {
    "title": "titre du troisième cours en français",
    "provider": "nom de la plateforme (Udemy, Coursera, etc.)",
    "description": "description détaillée en français",
    "duration": "durée approximative",
    "level": "niveau (débutant, intermédiaire, avancé)",
    "rating": 4.6,
    "price": "prix en euros (ou Gratuit)",
    "url": "lien direct vers le cours"
  }
]

ATTENTION: TRÈS IMPORTANT:
1. Réponds UNIQUEMENT avec le tableau JSON brut
2. N'ajoute PAS de texte explicatif avant ou après le JSON
3. N'utilise PAS de backticks (\`\`\`)
4. N'utilise PAS de balises 'json'
5. Assure-toi que le JSON est parfaitement valide`;

      const aiResponse = await queryCohere(prompt);
      
      // Vérifier si la réponse est utilisable
      if (Array.isArray(aiResponse) && aiResponse.length > 0) {
        console.log("Réponse AI valide (tableau) reçue");
        
        // Valider et corriger les données de chaque cours
        const validatedCourses = aiResponse.map(course => {
          // Assurer que le niveau est dans un format standard
          let normalizedLevel = course.level?.toLowerCase() || level || 'intermédiaire';
          if (normalizedLevel.includes('débutant') || normalizedLevel.includes('beginner')) {
            normalizedLevel = 'débutant';
          } else if (normalizedLevel.includes('avancé') || normalizedLevel.includes('advanced')) {
            normalizedLevel = 'avancé';
          } else {
            normalizedLevel = 'intermédiaire';
          }
          
          // Assurer que le rating est un nombre
          const rating = typeof course.rating === 'number' ? course.rating : 
            (parseFloat(course.rating) || 4.5);
          
          return {
            ...course,
            level: normalizedLevel,
            rating: rating,
            aiRecommended: true,
            isDefault: false
          };
        });
        
        return res.json(validatedCourses);
      }
      
      // Si c'est tout autre type d'objet
      console.log("La réponse AI n'est pas utilisable, passage au fallback");
      throw new Error("Format de réponse AI non utilisable");
      
    } catch (aiError) {
      console.warn("Utilisation du fallback:", aiError.message);
      
      // En cas d'échec de l'IA, utiliser les cours préconfigurés
      const mainSkill = skills[0].toLowerCase();
      
      // Récupérer les cours prédéfinis pour cette compétence
      const coursesDatabase = getPreConfiguredCourses();
      const matchedCourses = coursesDatabase[mainSkill] || coursesDatabase['default'];
      
      // Filtrer par niveau si spécifié
      let filteredCourses = matchedCourses;
      if (level) {
        const levelLower = level.toLowerCase();
        const matchingLevelCourses = matchedCourses.filter(course => 
          course.level.toLowerCase() === levelLower);
        
        // Si des cours du niveau demandé sont trouvés, les utiliser
        if (matchingLevelCourses.length > 0) {
          filteredCourses = matchingLevelCourses;
        }
      }
      
      // Limiter à 3 cours maximum
      const courses = filteredCourses.slice(0, 3);
      
      // Marquer comme prédéfinis
      courses.forEach(course => {
        course.isDefault = true;
        course.aiRecommended = false;
      });
      
      return res.json(courses);
    }
  } catch (error) {
    console.error("Erreur globale de recommandation:", error);
    
    // Même en cas d'erreur, fournir des recommandations de base
    const mainSkill = req.body?.skills?.[0] || 'programmation';
    const level = req.body?.level || 'intermédiaire';
    
    const defaultCourses = [
      {
        title: `Formation ${mainSkill} pour niveau ${level}`,
        provider: "Udemy",
        description: `Ce cours vous apprendra les bases de ${mainSkill} avec une approche pratique adaptée aux ${level}s.`,
        duration: "20 heures",
        level: level,
        rating: 4.5,
        price: "€59.99",
        url: `https://www.udemy.com/courses/search/?q=${encodeURIComponent(mainSkill)}`,
        isDefault: true,
        aiRecommended: false
      },
      {
        title: `${mainSkill} de A à Z`,
        provider: "Coursera",
        description: `Une formation complète pour maîtriser ${mainSkill} à votre rythme, avec des exercices adaptés au niveau ${level}.`,
        duration: "30 heures",
        level: level,
        rating: 4.7,
        price: "Gratuit (certification payante)",
        url: `https://www.coursera.org/search?query=${encodeURIComponent(mainSkill)}`,
        isDefault: true,
        aiRecommended: false
      },
      {
        title: `Maîtrisez ${mainSkill} en 2024`,
        provider: "OpenClassrooms",
        description: `Apprenez ${mainSkill} avec des projets concrets et un accompagnement personnalisé pour les ${level}s.`,
        duration: "25 heures",
        level: level,
        rating: 4.6,
        price: "Accès gratuit",
        url: `https://openclassrooms.com/fr/search?query=${encodeURIComponent(mainSkill)}`,
        isDefault: true,
        aiRecommended: false
      }
    ];
    
    return res.json(defaultCourses);
  }
});

// Base de données de cours préconfigurés
function getPreConfiguredCourses() {
  return {
    'javascript': [
      {
        title: "JavaScript Moderne - De Zéro à Expert",
        provider: "Udemy",
        description: "Maîtrisez JavaScript avec des exercices pratiques et des projets concrets. Inclut les dernières fonctionnalités d'ES6+, l'asynchrone, et bien plus.",
        duration: "40 heures",
        level: "débutant",
        rating: 4.8,
        price: "€59.99",
        url: "https://www.udemy.com/course/the-complete-javascript-course/",
        skills: ["JavaScript", "ES6", "Web Development"]
      },
      {
        title: "JavaScript Avancé - Patrons de Conception",
        provider: "Pluralsight",
        description: "Apprenez les modèles de conception essentiels en JavaScript pour écrire un code plus propre, plus maintenable et plus robuste.",
        duration: "25 heures",
        level: "intermédiaire",
        rating: 4.7,
        price: "€29.99/mois",
        url: "https://www.pluralsight.com/courses/javascript-advanced-design-patterns",
        skills: ["JavaScript", "Design Patterns", "Architecture"]
      },
      {
        title: "JavaScript Performance et Optimisation",
        provider: "Frontend Masters",
        description: "Optimisez vos applications JavaScript pour des performances maximales. Analyse de bundle, lazy loading et stratégies de mise en cache.",
        duration: "15 heures",
        level: "avancé",
        rating: 4.9,
        price: "€39/mois",
        url: "https://frontendmasters.com/courses/web-performance/",
        skills: ["JavaScript", "Web Performance", "Optimization"]
      }
    ],
    'react': [
      {
        title: "React - La Formation Complète (Hooks, Redux, Firebase)",
        provider: "Udemy",
        description: "Apprenez à construire des applications React modernes avec Hooks, Context API, Redux et Firebase.",
        duration: "35 heures",
        level: "débutant",
        rating: 4.6,
        price: "€49.99",
        url: "https://www.udemy.com/course/react-the-complete-guide-incl-redux/",
        skills: ["React", "Redux", "JavaScript"]
      },
      {
        title: "Architecture React pour Applications Professionnelles",
        provider: "Frontend Masters",
        description: "Structurez vos applications React pour une maintenabilité maximale. Patterns de conception, tests automatisés et organisation de code.",
        duration: "22 heures",
        level: "intermédiaire",
        rating: 4.8,
        price: "€39/mois",
        url: "https://frontendmasters.com/courses/react-architecture/",
        skills: ["React", "Architecture", "Testing"]
      },
      {
        title: "React Performance Avancée",
        provider: "Egghead.io",
        description: "Techniques avancées d'optimisation de performance pour les applications React complexes. Memo, useMemo, useCallback et plus.",
        duration: "18 heures",
        level: "avancé",
        rating: 4.9,
        price: "€25/mois",
        url: "https://egghead.io/courses/bulletproof-react",
        skills: ["React", "Performance", "Optimization"]
      }
    ],
    'python': [
      {
        title: "Python 3 - Des bases à l'expertise",
        provider: "Udemy",
        description: "Formation complète en Python 3 couvrant depuis les bases jusqu'aux fonctionnalités avancées avec des exercices pratiques.",
        duration: "45 heures",
        level: "débutant",
        rating: 4.7,
        price: "€59.99",
        url: "https://www.udemy.com/course/complete-python-bootcamp/",
        skills: ["Python", "Programming", "Data Structures"]
      },
      {
        title: "Python pour la Science des Données",
        provider: "DataCamp",
        description: "Maîtrisez l'analyse de données avec Python, Pandas, NumPy et Matplotlib. Visualisations et manipulation de données.",
        duration: "30 heures",
        level: "intermédiaire",
        rating: 4.8,
        price: "€25/mois",
        url: "https://www.datacamp.com/courses/data-science-with-python",
        skills: ["Python", "Data Science", "Pandas"]
      },
      {
        title: "Machine Learning avec Python",
        provider: "Coursera",
        description: "Apprenez les algorithmes de machine learning et leur implémentation en Python avec scikit-learn et TensorFlow.",
        duration: "40 heures",
        level: "avancé",
        rating: 4.9,
        price: "Gratuit (certificat payant)",
        url: "https://www.coursera.org/learn/machine-learning-with-python",
        skills: ["Python", "Machine Learning", "TensorFlow"]
      }
    ],
    'default': [
      {
        title: "Développement Web Complet - Front-end et Back-end",
        provider: "Udemy",
        description: "Formation complète en développement web couvrant HTML, CSS, JavaScript, Node.js, et les bases de données.",
        duration: "50 heures",
        level: "débutant",
        rating: 4.7,
        price: "€59.99",
        url: "https://www.udemy.com/course/the-web-developer-bootcamp/",
        skills: ["HTML", "CSS", "JavaScript", "Node.js"]
      },
      {
        title: "CS50 - Introduction à l'informatique",
        provider: "edX (Harvard)",
        description: "Cours d'introduction à l'informatique de Harvard couvrant les algorithmes, les structures de données, et la programmation.",
        duration: "80 heures",
        level: "intermédiaire",
        rating: 4.9,
        price: "Gratuit (certificat payant)",
        url: "https://www.edx.org/course/cs50s-introduction-to-computer-science",
        skills: ["Computer Science", "Programming", "Algorithms"]
      },
      {
        title: "Design Patterns Fondamentaux en Programmation",
        provider: "Pluralsight",
        description: "Apprenez les patterns de conception essentiels pour résoudre des problèmes courants de programmation et améliorer votre code.",
        duration: "25 heures",
        level: "avancé",
        rating: 4.6,
        price: "€29.99/mois",
        url: "https://www.pluralsight.com/courses/patterns-library",
        skills: ["Software Design", "Design Patterns", "Architecture"]
      }
    ]
  };
}

// Recommandations de vidéos YouTube
router.get('/youtube-recommendations', async (req, res) => {
  try {
    const { skill } = req.query;
    if (!skill) {
      return res.status(400).json({ message: 'Le paramètre "skill" est requis' });
    }
    
    console.log(`Demande de vidéos YouTube pour: ${skill}`);
    
    // Tenter d'abord une recommandation via l'IA
    try {
      const prompt = `Tu es un expert en ressources éducatives.
    
Recommande exactement 3 vidéos YouTube réelles pour apprendre la compétence "${skill}".

Les vidéos doivent être instructives, bien notées et disponibles actuellement sur YouTube.

RETOURNE LE RÉSULTAT EXACTEMENT DANS CE FORMAT DE TABLEAU JSON:
[
  {
    "title": "titre de la vidéo en français",
    "channel": "nom de la chaîne",
    "views": "nombre approximatif de vues",
    "length": "durée approximative",
    "url": "lien YouTube valide"
  },
  {
    "title": "titre de la deuxième vidéo",
    "channel": "nom de la chaîne",
    "views": "nombre approximatif de vues",
    "length": "durée approximative",
    "url": "lien YouTube valide"
  },
  {
    "title": "titre de la troisième vidéo",
    "channel": "nom de la chaîne",
    "views": "nombre approximatif de vues",
    "length": "durée approximative",
    "url": "lien YouTube valide"
  }
]

ATTENTION: TRÈS IMPORTANT:
1. Réponds UNIQUEMENT avec le tableau JSON brut
2. N'ajoute PAS de texte explicatif avant ou après le JSON
3. N'utilise PAS de backticks (\`\`\`)
4. N'utilise PAS de balises 'json'
5. Assure-toi que le JSON est parfaitement valide`;
    
    const aiResponse = await queryCohere(prompt);
      
      // Vérifier si la réponse est utilisable comme tableau
      if (Array.isArray(aiResponse) && aiResponse.length > 0) {
        console.log("Réponse AI valide (tableau) pour les vidéos YouTube");
        
        // Vérifier et valider chaque URL
        const validatedVideos = aiResponse.map(video => {
          // S'assurer que l'URL est valide
          let validUrl = video.url || '';
          if (!validUrl.includes('youtube.com')) {
            validUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(video.title || skill)}`;
          }
          
          return {
            ...video,
            url: validUrl,
            isRecommended: true
          };
        });
        
        return res.json(validatedVideos);
      }
      
      // Si on arrive ici, l'IA n'a pas retourné un tableau utilisable
      console.log("Échec des recommandations AI, passage au fallback");
      throw new Error("Format de réponse AI non utilisable pour les vidéos");
      
    } catch (aiError) {
      console.warn("Utilisation du fallback pour les vidéos:", aiError.message);
      
      // Utiliser les vidéos préconfigurées comme fallback
      const skillLower = skill.toLowerCase();
      const videosBySkill = getDefaultYoutubeVideos();
      const matchingVideos = videosBySkill[skillLower] || videosBySkill['default'];
      
      // Retourner les vidéos avec l'indication qu'elles sont des valeurs par défaut
      const videos = matchingVideos.map(video => ({
        ...video,
        isDefault: true,
        isRecommended: false
      }));
      
      return res.json(videos);
    }
  } catch (error) {
    console.error("Erreur globale de recommandation vidéo:", error);
    
    // Fallback même en cas d'erreur
    const encodedSkill = encodeURIComponent(req.query.skill || 'programmation');
    const defaultVideos = [
      {
        title: `Tutoriel pour débutants en ${skill}`,
        channel: "Tech Academy",
        views: "1.2M vues",
        length: "15:30",
        url: `https://www.youtube.com/results?search_query=${encodedSkill}+tutoriel`,
        isDefault: true,
        isRecommended: false
      },
      {
        title: `Cours complet ${skill} 2024`,
        channel: "Pro Coder",
        views: "850K vues",
        length: "1:22:15",
        url: `https://www.youtube.com/results?search_query=${encodedSkill}+cours`,
        isDefault: true,
        isRecommended: false
      },
      {
        title: `Astuces avancées ${skill}`,
        channel: "Code Masters",
        views: "450K vues",
        length: "28:45",
        url: `https://www.youtube.com/results?search_query=${encodedSkill}+astuces`,
        isDefault: true,
        isRecommended: false
      }
    ];
    
    return res.json(defaultVideos);
  }
});

// Fonction pour obtenir des vidéos YouTube préconfigurées
function getDefaultYoutubeVideos() {
  return {
    'javascript': [
      {
        title: "Apprendre JavaScript en 2024 - Guide Complet",
        channel: "Grafikart.fr",
        views: "1.5M vues",
        length: "2:42:15",
        url: "https://www.youtube.com/watch?v=9OJLxDxyNg4",
        isRecommended: true
      },
      {
        title: "Cours JavaScript pour les débutants | Formation complète (2024)",
        channel: "FromScratch",
        views: "987K vues",
        length: "3:22:10",
        url: "https://www.youtube.com/watch?v=CB8JPjpP4XQ",
        isRecommended: true
      },
      {
        title: "JavaScript pour les débutants - Les Bases",
        channel: "Le Designer du Web",
        views: "750K vues",
        length: "1:13:45",
        url: "https://www.youtube.com/watch?v=PIU_2SQd3wY",
        isRecommended: true
      }
    ],
    'react': [
      {
        title: "React Tutorial pour Débutants - Crash Course 2024",
        channel: "Lior Chamla",
        views: "985K vues",
        length: "1:28:30",
        url: "https://www.youtube.com/watch?v=K3D2rjAUQ3o",
        isRecommended: true
      },
      {
        title: "Apprendre React en 1 vidéo",
        channel: "Grafikart.fr",
        views: "1.2M vues",
        length: "2:18:25",
        url: "https://www.youtube.com/watch?v=f0X1Tl8aHtA",
        isRecommended: true
      },
      {
        title: "React Hooks Tutorial - Applications React Modernes",
        channel: "From Scratch",
        views: "687K vues",
        length: "1:45:30",
        url: "https://www.youtube.com/watch?v=iw4x99JR-XQ",
        isRecommended: true
      }
    ],
    'python': [
      {
        title: "Apprendre Python - Cours Complet pour Débutants",
        channel: "Graven - Développement",
        views: "3.2M vues",
        length: "6:11:25",
        url: "https://www.youtube.com/watch?v=LamjAFnybo0",
        isRecommended: true
      },
      {
        title: "Python pour les Débutants - Formation Complète [2024]",
        channel: "Docstring",
        views: "1.5M vues",
        length: "3:45:12",
        url: "https://www.youtube.com/watch?v=oUJolR5bX6g",
        isRecommended: true
      },
      {
        title: "Python Crash Course - Fondamentaux et Projets",
        channel: "FormationVidéo",
        views: "920K vues",
        length: "2:22:40",
        url: "https://www.youtube.com/watch?v=V_AsIC7uGf4",
        isRecommended: true
      }
    ],
    'html': [
      {
        title: "Cours HTML Complet pour Débutants",
        channel: "Le Designer du Web",
        views: "2.1M vues",
        length: "1:38:22",
        url: "https://www.youtube.com/watch?v=qsbkZ7gIKnc",
        isRecommended: true
      },
      {
        title: "HTML & CSS - Formation Complète pour Débutants [2024]",
        channel: "Grafikart.fr",
        views: "1.8M vues",
        length: "4:15:30",
        url: "https://www.youtube.com/watch?v=8FqZZrbnwkM",
        isRecommended: true
      },
      {
        title: "HTML Crash Course pour les développeurs",
        channel: "Lior Chamla",
        views: "950K vues",
        length: "1:12:45",
        url: "https://www.youtube.com/watch?v=UB1O30fR-EE",
        isRecommended: true
      }
    ],
    'css': [
      {
        title: "CSS Moderne - Flexbox, Grid et Responsive Design",
        channel: "Grafikart.fr",
        views: "1.7M vues",
        length: "2:28:15",
        url: "https://www.youtube.com/watch?v=1PnVor36_40",
        isRecommended: true
      },
      {
        title: "CSS pour Débutants - Guide Complet [2024]",
        channel: "Le Designer du Web",
        views: "1.3M vues",
        length: "3:12:30",
        url: "https://www.youtube.com/watch?v=1Rs2ND1ryYc",
        isRecommended: true
      },
      {
        title: "CSS Grid et Flexbox - Cours Complet",
        channel: "FromScratch",
        views: "780K vues",
        length: "1:45:20",
        url: "https://www.youtube.com/watch?v=tXIhdp5R7sc",
        isRecommended: true
      }
    ],
    'default': [
      {
        title: "Comment apprendre à coder en 2024 - Guide pour débutants",
        channel: "Graven - Développement",
        views: "2.5M vues",
        length: "42:15",
        url: "https://www.youtube.com/watch?v=sBws8MSXN7A",
        isRecommended: true
      },
      {
        title: "Devenir Développeur Web en 2024 - Parcours Complet",
        channel: "Grafikart.fr",
        views: "1.8M vues",
        length: "1:22:10",
        url: "https://www.youtube.com/watch?v=2eWX9SL1Jj4",
        isRecommended: true
      },
      {
        title: "Programmation pour Débutants - Par où commencer?",
        channel: "FromScratch",
        views: "1.2M vues",
        length: "28:45",
        url: "https://www.youtube.com/watch?v=VfGW0Qiy2I0",
        isRecommended: true
      }
    ]
  };
}

// Route de test pour l'API Cohere
router.get('/test', async (req, res) => {
  try {
    const response = await queryCohere("Dites simplement 'L'API Cohere fonctionne correctement.'");
    res.json({ success: true, message: response });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Route pour générer un quiz
router.post('/generate-quiz', async (req, res) => {
  try {
    const { specialty, difficulty } = req.body;
    
    if (!specialty) {
      return res.status(400).json({ message: 'La spécialité est requise' });
    }
    
    console.log(`Génération de quiz pour: ${specialty}, niveau: ${difficulty || 'Intermédiaire'}`);
    
    // Utilisez directement les quiz par défaut
    const defaultQuiz = getDefaultQuiz(specialty, difficulty || 'Intermédiaire');
    console.log(`Quiz généré avec succès: ${defaultQuiz.length} questions`);
    
    return res.json(defaultQuiz);
  } catch (error) {
    console.error("Erreur de génération de quiz:", error);
    return res.status(500).json({ 
      message: "Erreur lors de la génération du quiz", 
      error: error.message 
    });
  }
});

// Route pour analyser les résultats du quiz
router.post('/analyze-quiz', async (req, res) => {
  try {
    const { specialty, difficulty, quizData } = req.body;
    
    if (!quizData || !Array.isArray(quizData) || quizData.length === 0) {
      return res.status(400).json({ 
        message: 'Les données du quiz sont requises et doivent contenir au moins une question' 
      });
    }
    
    // Calculer le score
    let correctCount = 0;
    quizData.forEach(item => {
      if (item.userAnswer === item.correctAnswer) {
        correctCount++;
      }
    });
    
    const score = Math.round((correctCount / quizData.length) * 100);
    
    // Identifier les questions correctes et incorrectes
    const correctQuestions = quizData.filter(q => q.userAnswer === q.correctAnswer).map(q => q.question);
    const incorrectQuestions = quizData.filter(q => q.userAnswer !== q.correctAnswer).map(q => q.question);
    
    // Construire un prompt détaillé pour l'analyse par l'IA
    let prompt = `Tu es un expert en formation et évaluation dans le domaine de ${specialty}. Analyse les résultats suivants d'un quiz de niveau "${difficulty}".

Score: ${score}% (${correctCount}/${quizData.length} correctes)

Questions correctement répondues:
${correctQuestions.map((q, i) => `${i+1}. ${q}`).join('\n')}

Questions incorrectement répondues:
${incorrectQuestions.map((q, i) => `${i+1}. ${q}`).join('\n')}

Basé sur ces réponses, j'aimerais que tu fournisses une analyse détaillée et personnalisée qui inclut:

1. Un résumé du niveau de compétence actuel (2-3 phrases)
2. Les points forts identifiés (3-5 points)
3. Les axes d'amélioration spécifiques (3-5 points)
4. Des recommandations concrètes pour progresser (2-3 recommandations avec titre et description)

Veille à être:
- Précis dans ton analyse des compétences techniques spécifiques à ${specialty}
- Encourageant et constructif, même si le score est bas
- Pédagogique en expliquant pourquoi certains concepts sont importants
- Spécifique dans tes recommandations (ressources, approches, priorités)

Organise ta réponse au format JSON suivant:
{
  "summary": "résumé du niveau de compétence actuel",
  "strengths": ["point fort 1", "point fort 2", "point fort 3"],
  "improvements": ["axe d'amélioration 1", "axe d'amélioration 2", "axe d'amélioration 3"],
  "recommendations": [
    {
      "title": "titre de la recommandation 1",
      "description": "description détaillée avec conseils concrets"
    },
    {
      "title": "titre de la recommandation 2",
      "description": "description détaillée avec conseils concrets"
    }
  ]
}

ATTENTION: TRÈS IMPORTANT:
1. Réponds UNIQUEMENT avec le JSON brut
2. N'ajoute PAS de texte explicatif avant ou après le JSON
3. N'utilise PAS de backticks (\`\`\`)
4. N'utilise PAS de balises 'json'
5. Assure-toi que le JSON est parfaitement valide`;

    try {
      // Appeler l'API Cohere avec un timeout pour éviter les blocages
      const aiResponsePromise = queryCohere(prompt);
      
      // Ajouter un timeout de 10 secondes pour éviter d'attendre indéfiniment
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout dépassé lors de l\'appel à l\'IA')), 10000)
      );
      
      const aiResponse = await Promise.race([aiResponsePromise, timeoutPromise]);
      
      // Extraire le JSON de la réponse
      try {
        // Essayer différentes stratégies de parsing
        
        // 1. Vérifier si la réponse est déjà un objet
        if (typeof aiResponse === 'object') {
          return res.json(aiResponse);
        }
        
        // 2. Rechercher un objet JSON complet
        const jsonMatch = aiResponse.match(/\{[\s\S]*?\}/);
        if (jsonMatch) {
          try {
            const jsonResponse = JSON.parse(jsonMatch[0]);
            return res.json(jsonResponse);
          } catch (jsonError) {
            console.error("Erreur lors du parsing de l'objet JSON:", jsonError);
            // Continuer avec d'autres approches
          }
        }
        
        // 3. Analyser la réponse texte pour extraire des informations
        // Code de fallback existant
      } catch (parseError) {
        console.error("Erreur lors de l'analyse du quiz:", parseError);
        
        // Créer une analyse formatée en cas d'erreur de parsing
        return res.json({
          summary: `Vous avez obtenu un score de ${score}% (${correctCount}/${quizData.length}) dans ce quiz sur ${specialty}.`,
          strengths: score > 50 
            ? ["Vous avez démontré une bonne compréhension des concepts clés", "Vos connaissances de base sont solides"]
            : ["Vous avez commencé à explorer ce domaine", "Vous êtes sur la bonne voie pour progresser"],
          improvements: score < 70
            ? ["Approfondir les concepts fondamentaux", "Pratiquer davantage pour renforcer vos connaissances"]
            : ["Passer à des concepts plus avancés", "Explorer des cas d'utilisation plus complexes"],
          recommendations: [
            {
              title: "Apprentissage ciblé",
              description: `Pour progresser en ${specialty}, concentrez-vous sur les concepts que vous n'avez pas maîtrisés dans ce quiz.`
            },
            {
              title: "Pratique régulière",
              description: "La théorie ne suffit pas, mettez en pratique vos connaissances avec des projets concrets."
            }
          ]
        });
      }
    } catch (error) {
      console.error("Erreur lors de l'appel à l'IA:", error);
      
      // Fournir une analyse de secours en cas d'erreur avec l'API
      return res.json({
        summary: `Votre score de ${score}% (${correctCount}/${quizData.length}) dans ce quiz de ${specialty} montre ${score > 70 ? 'une bonne maîtrise' : 'qu\'il y a encore des points à améliorer'}.`,
        strengths: [
          correctCount > 0 ? `Vous avez bien répondu à ${correctCount} questions` : "Vous avez fait le premier pas en évaluant vos connaissances",
          score > 50 ? "Vous avez une compréhension des concepts fondamentaux" : "Vous êtes engagé dans un processus d'apprentissage"
        ],
        improvements: [
          incorrectQuestions.length > 0 ? `Revoir les ${incorrectQuestions.length} concepts sur lesquels vous avez fait des erreurs` : "Continuer à approfondir vos connaissances",
          "Pratiquer régulièrement pour renforcer votre compréhension"
        ],
        recommendations: [
          {
            title: "Plan d'étude personnalisé",
            description: `En fonction de votre score de ${score}%, nous vous recommandons de ${score < 50 ? 'commencer par les bases' : score < 80 ? 'renforcer les concepts intermédiaires' : 'explorer des sujets avancés'} dans le domaine de ${specialty}.`
          },
          {
            title: "Ressources adaptées",
            description: `Recherchez des tutoriels et cours de niveau ${score < 50 ? 'débutant' : score < 80 ? 'intermédiaire' : 'avancé'} pour continuer votre progression.`
          }
        ]
      });
    }
  } catch (error) {
    console.error("Erreur globale d'analyse de quiz:", error);
    return res.status(500).json({ 
      message: "Erreur lors de l'analyse des résultats", 
      error: error.message 
    });
  }
});

// Dans aiRoutes.js - Ajoutez cette fonction pour générer des quiz par défaut

function getDefaultQuiz(specialty, difficulty) {
  // Quiz pour le Développement Web Frontend
  const frontendQuizzes = {
    "Débutant": [
      {
        question: "Quelle balise HTML est utilisée pour créer un lien hypertexte?",
        options: ["<link>", "<a>", "<href>", "<url>"],
        correctAnswer: "<a>",
        explanation: "La balise <a> (anchor) est utilisée pour créer des liens hypertextes en HTML."
      },
      {
        question: "Quelle propriété CSS est utilisée pour changer la couleur du texte?",
        options: ["text-color", "font-color", "color", "text-style"],
        correctAnswer: "color",
        explanation: "La propriété 'color' est utilisée pour définir la couleur du texte en CSS."
      },
      {
        question: "Quel type de langage est JavaScript?",
        options: ["Langage de balisage", "Langage de programmation", "Langage de feuilles de style", "Langage de base de données"],
        correctAnswer: "Langage de programmation",
        explanation: "JavaScript est un langage de programmation qui permet d'implémenter des fonctionnalités complexes sur les pages web."
      },
      {
        question: "Quelle est la signification de CSS?",
        options: ["Computer Style Sheets", "Creative Style System", "Cascading Style Sheets", "Colorful Style Sheets"],
        correctAnswer: "Cascading Style Sheets",
        explanation: "CSS signifie Cascading Style Sheets, ou feuilles de style en cascade en français."
      },
      {
        question: "Quel attribut HTML est utilisé pour définir des styles en ligne?",
        options: ["class", "style", "font", "css"],
        correctAnswer: "style",
        explanation: "L'attribut 'style' est utilisé pour appliquer des styles CSS directement à un élément HTML."
      }
    ],
    "Intermédiaire": [
      {
        question: "Quelle méthode JavaScript est utilisée pour sélectionner un élément par son ID?",
        options: ["document.query()", "document.getElementById()", "document.findElement()", "document.selectById()"],
        correctAnswer: "document.getElementById()",
        explanation: "document.getElementById() est la méthode standard pour sélectionner un élément HTML par son attribut ID."
      },
      {
        question: "Quelle propriété CSS est utilisée pour créer une grille?",
        options: ["grid-template", "display: grid", "grid-system", "flex-grid"],
        correctAnswer: "display: grid",
        explanation: "La propriété 'display: grid' est utilisée pour définir un conteneur comme une grille CSS."
      },
      {
        question: "Quel hook React est utilisé pour gérer l'état d'un composant fonctionnel?",
        options: ["useEffect()", "useState()", "useContext()", "useReducer()"],
        correctAnswer: "useState()",
        explanation: "useState() est le hook React utilisé pour ajouter et gérer l'état local dans les composants fonctionnels."
      },
      {
        question: "Quelle propriété CSS permet de créer des animations?",
        options: ["transform", "transition", "animation", "motion"],
        correctAnswer: "animation",
        explanation: "La propriété 'animation' en CSS est utilisée pour créer des animations complexes."
      },
      {
        question: "Quel format de données est couramment utilisé pour échanger des données entre un client et un serveur?",
        options: ["HTML", "CSS", "JSON", "SQL"],
        correctAnswer: "JSON",
        explanation: "JSON (JavaScript Object Notation) est un format léger d'échange de données largement utilisé dans les applications web."
      }
    ],
    "Avancé": [
      {
        question: "Quelle est la différence entre 'let', 'const' et 'var' en JavaScript?",
        options: [
          "Ils sont identiques, juste des noms différents", 
          "'let' et 'const' ont une portée de bloc, 'var' a une portée de fonction", 
          "'var' est le plus récent", 
          "'const' peut être réassigné contrairement à 'let'"
        ],
        correctAnswer: "'let' et 'const' ont une portée de bloc, 'var' a une portée de fonction",
        explanation: "'let' et 'const' ont été introduits en ES6 avec une portée de bloc, tandis que 'var' a une portée de fonction. De plus, 'const' ne peut pas être réassigné."
      },
      {
        question: "Qu'est-ce que le 'Virtual DOM' dans React?",
        options: [
          "Une version simplifiée du DOM", 
          "Une représentation en mémoire du DOM réel", 
          "Un nouveau standard de W3C", 
          "Une alternative à HTML"
        ],
        correctAnswer: "Une représentation en mémoire du DOM réel",
        explanation: "Le Virtual DOM est une représentation légère en mémoire du DOM réel. React l'utilise pour améliorer les performances en minimisant les manipulations directes du DOM."
      },
      {
        question: "Qu'est-ce que la programmation fonctionnelle en JavaScript?",
        options: [
          "Une programmation avec beaucoup de fonctions", 
          "Un paradigme qui traite le calcul comme l'évaluation de fonctions mathématiques", 
          "Une façon d'organiser les fichiers JavaScript", 
          "Un modèle ancien de programmation JavaScript"
        ],
        correctAnswer: "Un paradigme qui traite le calcul comme l'évaluation de fonctions mathématiques",
        explanation: "La programmation fonctionnelle est un paradigme où les programmes sont construits en appliquant et composant des fonctions, évitant les changements d'état et les données mutables."
      },
      {
        question: "Quelle technique permet d'optimiser le chargement des images dans une application web?",
        options: [
          "Lazy loading", 
          "Fast loading", 
          "Quick loading", 
          "Eager loading"
        ],
        correctAnswer: "Lazy loading",
        explanation: "Le lazy loading est une technique qui retarde le chargement des images non visibles jusqu'à ce qu'elles soient sur le point d'entrer dans la viewport."
      },
      {
        question: "Qu'est-ce qu'un 'Higher-Order Component' en React?",
        options: [
          "Un composant avec un style avancé", 
          "Un composant qui prend en entrée un composant et retourne un nouveau composant", 
          "Un composant qui utilise des hooks avancés", 
          "Un composant avec plus de méthodes de cycle de vie"
        ],
        correctAnswer: "Un composant qui prend en entrée un composant et retourne un nouveau composant",
        explanation: "Un HOC est une fonction qui prend un composant et retourne un nouveau composant avec des fonctionnalités supplémentaires, permettant la réutilisation de logique."
      }
    ]
  };

  // Quiz pour le Développement Web Backend
  const backendQuizzes = {
    "Débutant": [
      {
        question: "Quel langage est souvent utilisé côté serveur?",
        options: ["HTML", "CSS", "JavaScript", "PHP"],
        correctAnswer: "PHP",
        explanation: "PHP est un langage de script largement utilisé pour le développement côté serveur et la création de pages web dynamiques."
      },
      {
        question: "Qu'est-ce qu'une API REST?",
        options: ["Une interface graphique", "Un style d'architecture pour les systèmes web", "Un protocole de sécurité", "Un format de base de données"],
        correctAnswer: "Un style d'architecture pour les systèmes web",
        explanation: "REST (Representational State Transfer) est un style d'architecture qui définit un ensemble de contraintes pour créer des services web."
      },
      {
        question: "Quel format de données est souvent utilisé pour la communication entre serveurs?",
        options: ["HTML", "XML", "CSV", "JSON"],
        correctAnswer: "JSON",
        explanation: "JSON est un format léger d'échange de données largement utilisé pour la communication entre serveurs et applications."
      },
      {
        question: "Qu'est-ce qu'une route dans une application web?",
        options: ["Un chemin de fichier", "Un chemin URL associé à une fonction", "Une connexion de base de données", "Un protocole de sécurité"],
        correctAnswer: "Un chemin URL associé à une fonction",
        explanation: "Une route dans une application web associe un chemin URL à une fonction ou méthode qui sera exécutée lorsque ce chemin est visité."
      },
      {
        question: "Quelle méthode HTTP est généralement utilisée pour récupérer des données?",
        options: ["GET", "POST", "PUT", "DELETE"],
        correctAnswer: "GET",
        explanation: "La méthode HTTP GET est utilisée pour demander des données d'une ressource spécifiée, sans modifier l'état du serveur."
      }
    ],
    "Intermédiaire": [
      // Questions pour le niveau intermédiaire
    ],
    "Avancé": [
      // Questions pour le niveau avancé
    ]
  };

  // Quiz pour DevOps
  const devopsQuizzes = {
    "Débutant": [
      {
        question: "Qu'est-ce que Docker?",
        options: [
          "Un langage de programmation", 
          "Une plateforme de conteneurisation", 
          "Une alternative à Docker", 
          "Un outil de base de données"
        ],
        correctAnswer: "Une plateforme de conteneurisation",
        explanation: "Docker est une plateforme qui permet de développer, expédier et exécuter des applications dans des conteneurs isolés."
      },
      // Autres questions
    ],
    "Intermédiaire": [
      // Questions pour le niveau intermédiaire
    ],
    "Avancé": [
      // Questions pour le niveau avancé
    ]
  };

  // Mappings des spécialités aux quiz
  const quizzesBySpecialty = {
    "Développement Web Frontend": frontendQuizzes,
    "Développement Web Backend": backendQuizzes,
    "DevOps": devopsQuizzes,
    // Ajoutez d'autres spécialités
  };

  // Trouver le quiz approprié
  for (const [key, quizzes] of Object.entries(quizzesBySpecialty)) {
    if (specialty.toLowerCase().includes(key.toLowerCase()) || 
        key.toLowerCase().includes(specialty.toLowerCase())) {
      // Si la spécialité correspond, retourner le quiz du niveau demandé
      // ou le quiz intermédiaire par défaut
      return quizzes[difficulty] || quizzes["Intermédiaire"] || [];
    }
  }

  // Quiz par défaut si aucune correspondance n'est trouvée
  return [
    {
      question: `Qu'est-ce qui caractérise ${specialty}?`,
      options: ["Option A", "Option B", "Option C", "Option D"],
      correctAnswer: "Option A",
      explanation: `Cette question porte sur les caractéristiques fondamentales de ${specialty}.`
    },
    {
      question: `Quelle est la meilleure pratique en ${specialty}?`,
      options: ["Option A", "Option B", "Option C", "Option D"],
      correctAnswer: "Option B",
      explanation: `Cette question porte sur les meilleures pratiques en ${specialty}.`
    },
    {
      question: `Quel outil est le plus utilisé en ${specialty}?`,
      options: ["Option A", "Option B", "Option C", "Option D"],
      correctAnswer: "Option C",
      explanation: `Cette question porte sur les outils populaires en ${specialty}.`
    },
    {
      question: `Quelle compétence est essentielle pour ${specialty}?`,
      options: ["Option A", "Option B", "Option C", "Option D"],
      correctAnswer: "Option D",
      explanation: `Cette question porte sur les compétences clés en ${specialty}.`
    },
    {
      question: `Quel défi est souvent rencontré en ${specialty}?`,
      options: ["Option A", "Option B", "Option C", "Option D"],
      correctAnswer: "Option A",
      explanation: `Cette question porte sur les défis courants en ${specialty}.`
    }
  ];
}

module.exports = router;
