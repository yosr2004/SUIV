/**
 * Service d'IA - Utilise l'API Cohere pour générer des réponses intelligentes et professionnelles
 */

import axios from 'axios';

// Configuration de l'API Cohere
const COHERE_API_URL = 'https://api.cohere.ai/v1/generate';
const COHERE_API_KEY = process.env.REACT_APP_COHERE_API_KEY || 'votre_clé_api_cohere'; // À configurer dans les variables d'environnement

// Catégories de réponses étendues
const RESPONSE_CATEGORIES = {
  GREETING: 'greeting',
  HELP: 'help',
  CAREER: 'career',
  SKILLS: 'skills',
  TRAINING: 'training',
  NETWORKING: 'networking',
  PROJECTS: 'projects',
  INTERVIEW: 'interview',
  RESUME: 'resume',
  PROFESSIONAL_GOALS: 'professional_goals',
  LEADERSHIP: 'leadership',
  WORK_LIFE_BALANCE: 'work_life_balance',
  ENTREPRENEURSHIP: 'entrepreneurship',
  SALARY_NEGOTIATION: 'salary_negotiation',
  CAREER_CHANGE: 'career_change',
  JOB_SEARCH: 'job_search',
  PERSONAL_BRANDING: 'personal_branding',
  INDUSTRY_TRENDS: 'industry_trends',
  SOFT_SKILLS: 'soft_skills',
  TECHNICAL_SKILLS: 'technical_skills',
  MENTORING: 'mentoring',
  GENERAL: 'general',
  UNKNOWN: 'unknown'
};

// Mots-clés pour chaque catégorie
const CATEGORY_KEYWORDS = {
  [RESPONSE_CATEGORIES.GREETING]: ['bonjour', 'salut', 'hello', 'hi', 'hey', 'coucou', 'bonsoir'],
  [RESPONSE_CATEGORIES.HELP]: ['aide', 'help', 'que peux-tu faire', 'comment fonctionne', 'capacités', 'fonctionnalités'],
  [RESPONSE_CATEGORIES.CAREER]: ['carrière', 'évolution', 'progression', 'parcours professionnel', 'avancement'],
  [RESPONSE_CATEGORIES.SKILLS]: ['compétences', 'aptitudes', 'capacités', 'savoir-faire', 'qualifications'],
  [RESPONSE_CATEGORIES.TRAINING]: ['formation', 'apprentissage', 'cours', 'certification', 'diplôme', 'études', 'qualification'],
  [RESPONSE_CATEGORIES.NETWORKING]: ['réseau', 'contacts', 'relations professionnelles', 'linkedin', 'réseautage'],
  [RESPONSE_CATEGORIES.PROJECTS]: ['projets', 'portfolio', 'réalisations', 'accomplissements'],
  [RESPONSE_CATEGORIES.INTERVIEW]: ['entretien', 'interview', 'recrutement', 'embauche', 'questions', 'entrevue'],
  [RESPONSE_CATEGORIES.RESUME]: ['cv', 'curriculum', 'vitae', 'résumé', 'candidature', 'lettre motivation'],
  [RESPONSE_CATEGORIES.PROFESSIONAL_GOALS]: ['objectifs', 'buts', 'ambitions', 'aspirations', 'plan de carrière'],
  [RESPONSE_CATEGORIES.LEADERSHIP]: ['leadership', 'gestion', 'direction', 'management', 'encadrement', 'équipe'],
  [RESPONSE_CATEGORIES.WORK_LIFE_BALANCE]: ['équilibre', 'vie privée', 'bien-être', 'santé mentale', 'stress', 'burnout'],
  [RESPONSE_CATEGORIES.ENTREPRENEURSHIP]: ['entreprendre', 'startup', 'création entreprise', 'business', 'entrepreneur', 'auto-entrepreneur'],
  [RESPONSE_CATEGORIES.SALARY_NEGOTIATION]: ['salaire', 'rémunération', 'négociation', 'augmentation', 'compensation', 'avantages'],
  [RESPONSE_CATEGORIES.CAREER_CHANGE]: ['reconversion', 'changement', 'transition', 'réorientation', 'nouvelle carrière'],
  [RESPONSE_CATEGORIES.JOB_SEARCH]: ['recherche emploi', 'offre', 'poste', 'candidature', 'recruteur'],
  [RESPONSE_CATEGORIES.PERSONAL_BRANDING]: ['marque personnelle', 'image professionnelle', 'présence en ligne', 'réputation'],
  [RESPONSE_CATEGORIES.INDUSTRY_TRENDS]: ['tendances', 'industrie', 'marché', 'secteur', 'évolution secteur'],
  [RESPONSE_CATEGORIES.SOFT_SKILLS]: ['compétences douces', 'savoir-être', 'communication', 'travail équipe'],
  [RESPONSE_CATEGORIES.TECHNICAL_SKILLS]: ['compétences techniques', 'savoir-faire', 'outils', 'logiciels', 'technologies'],
  [RESPONSE_CATEGORIES.MENTORING]: ['mentorat', 'coaching', 'conseil', 'accompagnement', 'développement personnel']
};

/**
 * Calcule un score de correspondance pour chaque catégorie en fonction du message
 * @param {string} message - Le message de l'utilisateur
 * @returns {Object} - Scores pour chaque catégorie
 */
const calculateCategoryScores = (message) => {
  if (!message || typeof message !== 'string') {
    return { [RESPONSE_CATEGORIES.UNKNOWN]: 1 };
  }
  
  const lowerMessage = message.toLowerCase();
  const scores = {};
  
  // Calculer les scores pour chaque catégorie
  Object.entries(CATEGORY_KEYWORDS).forEach(([category, keywords]) => {
    let score = 0;
    keywords.forEach(keyword => {
      if (lowerMessage.includes(keyword)) {
        // Mots exacts ont plus de poids
        if (lowerMessage.split(' ').includes(keyword)) {
          score += 2;
        } else {
          score += 1;
        }
      }
    });
    
    if (score > 0) {
      scores[category] = score;
    }
  });
  
  // Si aucun score, utiliser GENERAL
  if (Object.keys(scores).length === 0) {
    scores[RESPONSE_CATEGORIES.GENERAL] = 1;
  }
  
  return scores;
};

/**
 * Catégorise un message utilisateur basé sur les scores
 * @param {string} message - Le message de l'utilisateur
 * @returns {string} - La catégorie identifiée
 */
const categorizeMessage = (message) => {
  const scores = calculateCategoryScores(message);
  
  // Trouver la catégorie avec le score le plus élevé
  let maxCategory = RESPONSE_CATEGORIES.GENERAL;
  let maxScore = 0;
  
  Object.entries(scores).forEach(([category, score]) => {
    if (score > maxScore) {
      maxScore = score;
      maxCategory = category;
    }
  });
  
  return maxCategory;
};

/**
 * Génère une réponse détaillée en utilisant l'API Cohere
 * @param {string} userMessage - Le message de l'utilisateur
 * @returns {Promise<string>} - La réponse générée
 */
export const generateAIResponse = async (userMessage) => {
  try {
    // Déterminer la catégorie du message
    const category = categorizeMessage(userMessage);
    
    // Créer un contexte personnalisé selon la catégorie
    let contextPrompt = `Tu es un assistant IA professionnel spécialisé dans le développement de carrière et le conseil professionnel.
Tu dois fournir des réponses détaillées, approfondies et structurées en français aux questions sur le développement professionnel.
Tes réponses doivent être d'au moins 3-4 paragraphes avec des exemples concrets, des étapes à suivre et des conseils pratiques.
Utilise des listes à puces (•) quand c'est pertinent pour améliorer la lisibilité.
`;

    // Ajouter des instructions spécifiques selon la catégorie
    switch(category) {
      case RESPONSE_CATEGORIES.CAREER:
        contextPrompt += `Concentre-toi sur les conseils d'évolution de carrière, les étapes de progression, et les opportunités d'avancement.`;
        break;
      case RESPONSE_CATEGORIES.INTERVIEW:
        contextPrompt += `Fournit des conseils détaillés sur la préparation aux entretiens, les questions fréquentes, et les stratégies pour se démarquer.`;
        break;
      case RESPONSE_CATEGORIES.RESUME:
        contextPrompt += `Donne des conseils spécifiques sur la structure du CV, les éléments à inclure/exclure, et comment optimiser pour les ATS.`;
        break;
      case RESPONSE_CATEGORIES.LEADERSHIP:
        contextPrompt += `Partage des stratégies de leadership efficaces, des techniques de gestion d'équipe, et des conseils pour développer ses compétences managériales.`;
        break;
      case RESPONSE_CATEGORIES.SOFT_SKILLS:
        contextPrompt += `Explique l'importance des compétences interpersonnelles spécifiques et comment les développer de manière concrète.`;
        break;
      case RESPONSE_CATEGORIES.TECHNICAL_SKILLS:
        contextPrompt += `Présente les compétences techniques les plus demandées, les ressources pour se former, et comment les mettre en valeur.`;
        break;
      default:
        contextPrompt += `Fournit des conseils professionnels pertinents et applicables immédiatement.`;
    }

    const prompt = `${contextPrompt}

Question de l'utilisateur: ${userMessage}

Réponse détaillée et professionnelle:`;

    // Appel à l'API Cohere avec axios
    const response = await axios.post(
      COHERE_API_URL,
      {
        model: 'command-r-plus',  // Modèle plus avancé si disponible
        prompt: prompt,
        max_tokens: 800,          // Plus de tokens pour des réponses plus longues
        temperature: 0.65,        // Légèrement diminué pour des réponses plus précises
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

    // Extraction de la réponse
    if (response.data && response.data.generations && response.data.generations.length > 0) {
      let aiResponse = response.data.generations[0].text.trim();
      
      // Formater la réponse pour une meilleure lisibilité
      aiResponse = formatResponse(aiResponse, category);
      
      return aiResponse;
    }
    
    throw new Error('Format de réponse inattendu de l\'API Cohere');
    
  } catch (error) {
    console.error('Erreur lors de la génération de réponse via Cohere:', error);
    
    // En cas d'échec, utiliser une réponse de secours améliorée
    return generateFallbackResponse(userMessage);
  }
};

/**
 * Génère une réponse de secours détaillée en cas d'échec de l'API
 * @param {string} userMessage - Le message de l'utilisateur
 * @returns {string} - La réponse de secours
 */
const generateFallbackResponse = (userMessage) => {
  const category = categorizeMessage(userMessage);
  
  // Réponses de secours détaillées selon la catégorie
  const fallbackResponses = {
    [RESPONSE_CATEGORIES.GREETING]: `Bonjour! Je suis votre assistant IA professionnel spécialisé dans le développement de carrière et le conseil professionnel. 

Je peux vous aider avec diverses questions concernant votre parcours professionnel, comme la recherche d'emploi, la préparation aux entretiens, l'amélioration de votre CV, le développement de compétences spécifiques, ou encore des stratégies pour évoluer dans votre carrière.

Comment puis-je vous assister aujourd'hui?`,

    [RESPONSE_CATEGORIES.HELP]: `Je suis votre assistant IA spécialisé dans le développement professionnel et le conseil de carrière. Voici comment je peux vous aider:

• **Développement de carrière** - Conseils sur l'évolution professionnelle, la progression et la planification
• **Compétences professionnelles** - Identification et développement des compétences clés pour votre secteur
• **Recherche d'emploi** - Stratégies de recherche efficaces et conseils pour se démarquer
• **Entretiens d'embauche** - Préparation, réponses aux questions fréquentes et techniques de présentation
• **CV et candidature** - Optimisation de votre CV, lettres de motivation et profil LinkedIn
• **Leadership et management** - Développement de compétences de gestion et de direction d'équipe
• **Équilibre vie-travail** - Stratégies pour maintenir un équilibre sain entre vie professionnelle et personnelle

Quel aspect de votre développement professionnel vous intéresse particulièrement?`,

    [RESPONSE_CATEGORIES.CAREER]: `Le développement de carrière est un processus continu qui nécessite une réflexion stratégique et des actions ciblées. Pour faire progresser votre carrière efficacement, considérez ces approches:

**1. Évaluation et planification stratégique**
• Prenez le temps d'identifier vos forces, faiblesses, valeurs et ce qui vous passionne réellement
• Définissez des objectifs professionnels à court, moyen et long terme avec des jalons mesurables
• Développez un plan d'action détaillé avec des étapes concrètes pour atteindre chaque objectif

**2. Développement continu des compétences**
• Identifiez les compétences essentielles dans votre domaine ou celles recherchées pour votre poste cible
• Investissez dans des formations continues, certifications ou diplômes pertinents
• Recherchez des projets transversaux qui vous permettent d'acquérir de nouvelles compétences

**3. Extension de votre réseau professionnel**
• Cultivez des relations authentiques avec des collègues, mentors et professionnels de votre secteur
• Participez activement à des événements, conférences et groupes professionnels
• Demandez régulièrement des feedbacks et conseils à des personnes que vous respectez

Quels aspects de votre développement de carrière souhaiteriez-vous approfondir davantage?`,

    [RESPONSE_CATEGORIES.INTERVIEW]: `La préparation aux entretiens d'embauche est cruciale pour maximiser vos chances de succès. Voici une approche structurée pour vous y préparer efficacement:

**1. Recherche approfondie préalable**
• Étudiez en détail l'entreprise: sa mission, ses valeurs, ses produits/services, sa culture et son actualité récente
• Analysez le poste: compétences requises, responsabilités et comment votre profil correspond aux besoins
• Renseignez-vous sur vos interlocuteurs si possible pour adapter votre approche

**2. Préparation aux questions classiques et spécifiques**
• Questions sur votre parcours: préparez un récit cohérent de votre expérience axé sur les réalisations pertinentes
• Questions comportementales (méthode STAR): préparez des exemples concrets de situations, actions et résultats
• Questions techniques: révisez les concepts fondamentaux de votre domaine d'expertise

**3. Stratégies pendant l'entretien**
• Communication non-verbale: maintenez un contact visuel approprié, une posture droite et des gestes mesurés
• Écoutez activement et posez des questions pertinentes qui démontrent votre intérêt et votre compréhension du poste
• Apportez des exemples quantifiables de vos réussites passées pour illustrer votre valeur ajoutée

**4. Suivi post-entretien**
• Envoyez un email de remerciement dans les 24 heures, en rappelant votre intérêt et en soulignant un point clé discuté
• Faites un auto-debriefing: notez les questions difficiles pour mieux vous préparer à l'avenir

Souhaitez-vous vous concentrer sur un aspect particulier de la préparation aux entretiens?`,

    [RESPONSE_CATEGORIES.GENERAL]: `Je comprends que vous cherchez des conseils professionnels. Pour vous offrir les informations les plus pertinentes, pourriez-vous préciser davantage votre demande?

Je peux vous aider sur de nombreux sujets liés au développement professionnel, notamment:

• La progression de carrière et la définition d'objectifs
• Le développement de compétences spécifiques (techniques ou relationnelles)
• La recherche d'emploi et la préparation aux entretiens
• L'optimisation de votre CV et votre présence professionnelle en ligne
• Le leadership et la gestion d'équipe
• L'équilibre vie professionnelle/personnelle

Plus votre question sera précise, plus ma réponse pourra être personnalisée et utile pour votre situation particulière.`
  };
  
  // Utiliser la réponse correspondante ou la réponse générale par défaut
  return fallbackResponses[category] || fallbackResponses[RESPONSE_CATEGORIES.GENERAL];
};

/**
 * Formate la réponse pour une meilleure lisibilité et professionnalisme
 * @param {string} response - La réponse à formater
 * @param {string} category - La catégorie de la réponse
 * @returns {string} - La réponse formatée
 */
const formatResponse = (response, category) => {
  // Supprimer les espaces superflus
  response = response.replace(/\n{3,}/g, '\n\n');
  
  // Assurer que la réponse se termine proprement
  if (!response.trim().endsWith('?') && !response.trim().endsWith('.') && !response.trim().endsWith('!')) {
    response += '.';
  }
  
  // Ajouter une structure avec titres si la réponse est longue et n'en contient pas déjà
  if (response.length > 200 && !response.includes('**') && !response.includes('#')) {
    const sections = response.split('\n\n');
    if (sections.length >= 2) {
      // Restructurer avec des titres en gras
      let formattedResponse = '';
      for (let i = 0; i < sections.length; i++) {
        if (i === 0) {
          formattedResponse += sections[i] + '\n\n';
        } else {
          // Détection intelligente de titres potentiels pour la section
          const potentialTitle = getPotentialTitle(sections[i], category);
          formattedResponse += `**${potentialTitle}**\n${sections[i]}\n\n`;
        }
      }
      response = formattedResponse.trim();
    }
  }
  
  // Amélioration des listes
  response = response.replace(/^- /gm, '• ');
  
  // Amélioration des paragraphes courts
  const paragraphs = response.split('\n\n');
  if (paragraphs.some(p => p.length < 50)) {
    response = paragraphs.map(p => {
      if (p.length < 50 && !p.includes('**') && !p.startsWith('•')) {
        return p + (p.endsWith('?') ? '' : ' N\'hésitez pas à me demander plus de détails sur ce point spécifique.');
      }
      return p;
    }).join('\n\n');
  }
  
  // Ajouter une question pour encourager l'interaction continue
  if (!response.includes('?') && !response.toLowerCase().includes('souhaitez-vous')) {
    response += '\n\nY a-t-il un aspect particulier de ce sujet sur lequel vous aimeriez obtenir plus d\'informations?';
  }
  
  return response;
};

/**
 * Génère un titre potentiel pour une section basé sur son contenu
 * @param {string} section - Le contenu de la section
 * @param {string} category - La catégorie du message
 * @returns {string} - Un titre approprié pour la section
 */
const getPotentialTitle = (section, category) => {
  const firstSentence = section.split('.')[0];
  
  // Si la première phrase est courte, l'utiliser comme titre
  if (firstSentence.length < 50) {
    return firstSentence;
  }
  
  // Sinon, créer un titre basé sur des mots-clés de la section ou de la catégorie
  const keywords = {
    [RESPONSE_CATEGORIES.CAREER]: ['Stratégie de carrière', 'Développement professionnel', 'Planification de carrière'],
    [RESPONSE_CATEGORIES.SKILLS]: ['Compétences essentielles', 'Développement des aptitudes', 'Maîtrise technique'],
    [RESPONSE_CATEGORIES.INTERVIEW]: ['Préparation d\'entretien', 'Questions fréquentes', 'Techniques de présentation'],
    [RESPONSE_CATEGORIES.RESUME]: ['Optimisation de CV', 'Présentation professionnelle', 'Mise en valeur de l\'expérience'],
    [RESPONSE_CATEGORIES.LEADERSHIP]: ['Compétences de leadership', 'Gestion d\'équipe', 'Influence et direction'],
    [RESPONSE_CATEGORIES.GENERAL]: ['Points essentiels', 'Conseils pratiques', 'Étapes à suivre']
  };
  
  const titles = keywords[category] || keywords[RESPONSE_CATEGORIES.GENERAL];
  
  // Choisir un titre aléatoire dans la liste correspondant à la catégorie
  return titles[Math.floor(Math.random() * titles.length)];
};

export default {
  generateAIResponse,
  RESPONSE_CATEGORIES
}; 