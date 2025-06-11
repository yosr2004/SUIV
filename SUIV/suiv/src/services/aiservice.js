import axios from "axios";

// URL de base de l'API IA - à remplacer par votre URL réelle
const AI_API_URL = "http://localhost:5000/api/ai";

// Service d'IA pour les analyses et recommandations
class AIService {
  // Analyser une compétence spécifique
  async analyzeSkill(skillName) {
    try {
      const response = await axios.post(`${AI_API_URL}/analyze-skill`, {
        skill: skillName,
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Erreur lors de l'analyse de compétence:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || "Erreur d'analyse",
      };
    }
  }

  // Obtenir des recommandations de formation
  async getTrainingRecommendations(skills, level) {
    try {
      console.log(`Demande de recommandations pour: ${skills.join(", ")} (niveau: ${level})`);

      // Vérifier les entrées
      if (!skills || !Array.isArray(skills) || skills.length === 0) {
        console.error("Erreur: Compétences manquantes ou format invalide");
        return {
          success: false,
          error: "Veuillez spécifier au moins une compétence",
        };
      }

      // Faire la requête
      const response = await axios.post(
        `${AI_API_URL}/training-recommendations`,
        {
          skills,
          level,
        },
        {
          timeout: 30000, // Timeout plus long (30 secondes)
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      console.log("Réponse reçue:", response.status);

      // Si pas de données dans la réponse
      if (!response.data) {
        console.error("Réponse vide reçue");
        return {
          success: false,
          error: "Aucune donnée reçue du serveur",
        };
      }

      // Log pour debug
      console.log("Type de réponse:", typeof response.data);
      if (typeof response.data === "object") {
        console.log(
          "Structure:",
          Array.isArray(response.data)
            ? `Tableau de ${response.data.length} éléments`
            : `Objet avec propriétés: ${Object.keys(response.data).join(", ")}`
        );
      }

      // Traiter les différents formats de réponse
      if (Array.isArray(response.data)) {
        // 1. Si c'est déjà un tableau, parfait
        return {
          success: true,
          data: response.data,
        };
      } else if (response.data.error) {
        // 2. Si l'API indique une erreur
        console.error("Erreur renvoyée par l'API:", response.data.error);
        return {
          success: false,
          error: response.data.message || "Erreur retournée par l'API",
        };
      } else if (typeof response.data === "object") {
        // 3. Chercher un tableau dans les propriétés de l'objet
        const possibleArrayFields = ["courses", "data", "recommendations", "results"];
        for (const field of possibleArrayFields) {
          if (response.data[field] && Array.isArray(response.data[field])) {
            return {
              success: true,
              data: response.data[field],
            };
          }
        }

        // 4. Si c'est un objet unique qui semble être un cours
        if (response.data.title && (response.data.provider || response.data.description)) {
          return {
            success: true,
            data: [response.data], // Convertir en tableau
          };
        }

        // 5. Si on a un objet qui n'est pas clairement identifiable comme un cours
        console.warn("Format de réponse non standard:", response.data);
        // Tenter de transformer l'objet en tableau de toute façon
        return {
          success: true,
          data: [response.data],
        };
      }

      // Si on arrive ici, on a un format non géré
      console.error("Format de réponse non supporté:", typeof response.data);
      return {
        success: false,
        error: "Format de réponse non reconnu",
      };
    } catch (error) {
      console.error("Erreur détaillée lors de la récupération des recommandations:", error);

      // Logging détaillé pour faciliter le débogage
      if (error.response) {
        // La requête a été faite et le serveur a répondu avec un code d'erreur
        console.error("Statut HTTP:", error.response.status);
        console.error("En-têtes:", error.response.headers);
        console.error("Données:", error.response.data);
      } else if (error.request) {
        // La requête a été faite mais aucune réponse n'a été reçue
        console.error("Requête sans réponse:", error.request);
      } else {
        // Une erreur s'est produite lors de la configuration de la requête
        console.error("Erreur de configuration:", error.message);
      }

      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Erreur de récupération des recommandations",
      };
    }
  }

  // Obtenir les tendances du marché
  async getMarketTrends(skill) {
    try {
      const response = await axios.get(`${AI_API_URL}/market-trends`, {
        params: { skill },
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Erreur lors de la récupération des tendances du marché:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || "Erreur de données",
      };
    }
  }

  // Générer un plan de développement personnalisé
  async generateDevelopmentPlan(userSkills) {
    try {
      const response = await axios.post(`${AI_API_URL}/development-plan`, {
        skills: userSkills,
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Erreur lors de la génération du plan de développement:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || "Erreur de génération",
      };
    }
  }

  // Générer un quiz
  async generateQuiz(specialty, difficulty) {
    try {
      const response = await axios.post(`${AI_API_URL}/generate-quiz`, {
        specialty,
        difficulty,
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Erreur lors de la génération du quiz:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || "Erreur de génération du quiz",
      };
    }
  }

  // Analyser les résultats du quiz
  async analyzeQuizResults(specialty, difficulty, quizData) {
    try {
      const response = await axios.post(`${AI_API_URL}/analyze-quiz`, {
        specialty,
        difficulty,
        quizData,
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Erreur lors de l'analyse des résultats du quiz:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || "Erreur d'analyse des résultats",
      };
    }
  }

  // Analyser un CV
  async analyzeCV(formData) {
    try {
      const response = await axios.post(`${AI_API_URL}/analyze-cv`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Erreur lors de l'analyse du CV:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || "Erreur d'analyse du CV",
      };
    }
  }
}

// Exporter une instance singleton du service
const aiService = new AIService();
export default aiService;
