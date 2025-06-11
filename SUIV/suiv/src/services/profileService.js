import axios from "axios";

// URL de base de l'API
const API_URL = "http://localhost:5000/api";

// Configuration avancée pour le débogage
const DEBUG = true;

// Fonction de log conditionnelle
const debugLog = (...args) => {
  if (DEBUG) {
    console.log("[ProfileService Debug]", ...args);
  }
};

// Timeout pour les requêtes API (en millisecondes)
const API_TIMEOUT = 10000;

// Création d'une instance axios avec une configuration de base
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// Intercepteur pour ajouter le token d'authentification aux requêtes
apiClient.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("authToken");
  debugLog(`Requête vers ${config.url}`, config);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    debugLog("⚠️ Attention: Token d'authentification non trouvé");
  }
  return config;
});

// Intercepteur pour logger les réponses
apiClient.interceptors.response.use(
  (response) => {
    debugLog(`Réponse de ${response.config.url}`, response.status, response.data);
    return response;
  },
  (error) => {
    debugLog("Erreur API", error.message);
    if (error.response) {
      debugLog("Détails de l'erreur:", error.response.status, error.response.data);
    }
    return Promise.reject(error);
  }
);

// Fonction utilitaire pour synchroniser l'utilisateur
const syncUserWithSession = (userData) => {
  // Récupérer l'utilisateur actuel du sessionStorage
  const currentUserStr = sessionStorage.getItem("user");
  if (!currentUserStr) {
    console.warn("Pas d'utilisateur en session pour synchroniser");
    return;
  }

  const currentUser = JSON.parse(currentUserStr);

  // Logging spécifique pour les mises à jour de contact
  if (userData.contact) {
    console.log("Synchro - Avant mise à jour contact:", currentUser.contact);
    console.log("Synchro - Données de contact à synchroniser:", userData.contact);
  }

  // Mise à jour avec les nouvelles données
  const updatedUser = { ...currentUser, ...userData };

  // Enregistrer dans le sessionStorage
  sessionStorage.setItem("user", JSON.stringify(updatedUser));

  // Logging post-mise à jour pour le contact
  if (userData.contact) {
    console.log("Synchro - Après mise à jour contact:", updatedUser.contact);
    // Vérification de la sauvegarde immédiate
    const checkUser = JSON.parse(sessionStorage.getItem("user"));
    console.log("Synchro - Vérification en session:", checkUser.contact);
  }

  debugLog("Utilisateur synchronisé avec la session:", updatedUser);
  return updatedUser;
};

// Service de profil
class ProfileService {
  // Récupérer le profil de l'utilisateur
  async getProfile() {
    try {
      const response = await apiClient.get("/profile/me");
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Erreur lors de la récupération du profil:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Erreur lors de la récupération du profil",
      };
    }
  }

  // Créer ou mettre à jour le profil de l'utilisateur
  async updateProfile(profileData) {
    try {
      console.log("Mise à jour du profil avec les données:", profileData);
      const response = await apiClient.post("/profile", profileData);
      console.log("Réponse du serveur pour la mise à jour du profil:", response.data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Erreur lors de la mise à jour du profil",
      };
    }
  }

  // Ajouter une expérience professionnelle
  async addExperience(experienceData) {
    try {
      const response = await apiClient.put("/profile/experience", experienceData);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Erreur lors de l'ajout d'une expérience:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Erreur lors de l'ajout d'une expérience",
      };
    }
  }

  // Ajouter une formation
  async addEducation(educationData) {
    try {
      const response = await apiClient.put("/profile/education", educationData);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Erreur lors de l'ajout d'une formation:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Erreur lors de l'ajout d'une formation",
      };
    }
  }

  // Mettre à jour les compétences de l'utilisateur
  async updateSkills(skills) {
    try {
      // D'abord, vérifier si un profil existe déjà
      let profile;
      try {
        const profileResponse = await this.getProfile();
        profile = profileResponse.data;
      } catch (err) {
        // Si le profil n'existe pas, créons-en un
        console.log("Aucun profil existant, création d'un nouveau profil avec les compétences");
        const createResponse = await this.updateProfile({ skills });
        return {
          success: true,
          data: createResponse.data,
        };
      }

      console.log("Mise à jour des compétences:", skills);
      const response = await apiClient.put("/profile/skills", { skills });
      console.log("Réponse du serveur pour la mise à jour des compétences:", response.data);

      // Vérifier que la réponse contient les données utilisateur
      if (response.data && response.data.user) {
        console.log("Synchronisation des données utilisateur avec sessionStorage");

        // Synchroniser avec le sessionStorage
        // Mettre à jour l'utilisateur complet, pas seulement les compétences
        const updatedUser = syncUserWithSession(response.data.user);
        console.log("Utilisateur mis à jour en session:", updatedUser);
      } else {
        console.warn("La réponse ne contient pas de données utilisateur");
        // Synchroniser uniquement les compétences
        syncUserWithSession({ skills });
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Erreur lors de la mise à jour des compétences:", error);
      // Si l'erreur indique que le profil n'existe pas, créons-en un
      if (error.response?.status === 404) {
        try {
          console.log("Le profil n'existe pas, tentative de création...");
          const createResponse = await this.updateProfile({ skills });
          return {
            success: true,
            data: createResponse.data,
          };
        } catch (createError) {
          console.error("Erreur lors de la création du profil:", createError);
          return {
            success: false,
            error:
              createError.response?.data?.message ||
              createError.message ||
              "Erreur lors de la création du profil",
          };
        }
      }
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Erreur lors de la mise à jour des compétences",
      };
    }
  }

  // Mettre à jour l'avatar de l'utilisateur
  async updateAvatar(file) {
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      debugLog("Envoi de l'avatar au serveur...");
      const response = await apiClient.post("/profile/avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      debugLog("Réponse du serveur pour l'avatar:", response.data);

      // Synchroniser avec le sessionStorage si la réponse contient l'URL de l'avatar
      if (response.data && response.data.avatar) {
        syncUserWithSession({ avatar: response.data.avatar });
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'avatar:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Erreur lors de la mise à jour de l'avatar",
      };
    }
  }

  // Télécharger un CV
  async uploadCV(file) {
    try {
      const formData = new FormData();
      formData.append("cv", file);

      const response = await apiClient.post("/profile/upload-cv", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Erreur lors du téléchargement du CV:", error);
      return {
        success: false,
        error:
          error.response?.data?.message || error.message || "Erreur lors du téléchargement du CV",
      };
    }
  }

  // Mettre à jour les informations professionnelles
  async updateProfessionalInfo(professionalData) {
    try {
      console.log("Mise à jour des informations professionnelles:", professionalData);
      const response = await apiClient.put("/profile/professional", professionalData);
      console.log("Réponse du serveur pour les informations professionnelles:", response.data);

      // Synchroniser avec le sessionStorage
      if (response.data) {
        syncUserWithSession({ professional: professionalData });
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Erreur lors de la mise à jour des informations professionnelles:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Erreur lors de la mise à jour des informations professionnelles",
      };
    }
  }

  // Mettre à jour les informations sociales
  async updateSocialInfo(socialData) {
    try {
      console.log("Mise à jour des informations sociales:", socialData);
      const response = await apiClient.put("/profile/social", socialData);
      console.log("Réponse du serveur pour les informations sociales:", response.data);

      // Synchroniser avec le sessionStorage
      if (response.data) {
        syncUserWithSession({ social: socialData });
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Erreur lors de la mise à jour des informations sociales:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Erreur lors de la mise à jour des informations sociales",
      };
    }
  }

  // Mettre à jour les informations de base (nom, prénom, bio)
  async updateBasicInfo(basicData) {
    try {
      console.log("Mise à jour des informations de base:", basicData);
      const response = await apiClient.put("/profile/basic-info", basicData);
      console.log("Réponse du serveur pour les informations de base:", response.data);

      // Synchroniser avec le sessionStorage
      if (response.data && response.data.user) {
        syncUserWithSession(basicData);
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Erreur lors de la mise à jour des informations de base:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Erreur lors de la mise à jour des informations de base",
      };
    }
  }

  // Mettre à jour les informations de contact
  async updateContactInfo(contactData) {
    try {
      console.log("Mise à jour des informations de contact:", contactData);

      // Vérification et normalisation des données
      if (!contactData) {
        contactData = {};
        console.warn("Données de contact manquantes, utilisation de valeurs par défaut");
      }

      // Préparer les données pour le backend (convertir au format attendu par le backend)
      const personalInfo = {
        phoneNumber: contactData.phoneNumber || "",
        address: contactData.address || "",
        city: contactData.city || "",
        postalCode: contactData.postalCode || "",
        country: contactData.country || "",
      };

      debugLog("Envoi des informations de contact au serveur:", personalInfo);

      // Utiliser le endpoint personalInfo pour mettre à jour ces données
      const response = await apiClient.put("/profile/personal-info", { personalInfo });
      debugLog("Réponse du serveur pour les informations de contact:", response.data);

      // Synchroniser avec le sessionStorage
      if (response.data) {
        syncUserWithSession({ contact: contactData });
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Erreur lors de la mise à jour des informations de contact:", error);
      // Authentification invalide
      if (error.response?.status === 401) {
        return {
          success: false,
          error: "Veuillez vous reconnecter pour mettre à jour vos informations",
        };
      }
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Erreur lors de la mise à jour des informations de contact",
      };
    }
  }
}

// Exporter une instance singleton du service
const profileService = new ProfileService();
export default profileService;
