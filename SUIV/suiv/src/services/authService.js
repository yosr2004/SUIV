import axios from "axios";
import { normalizeStoredUserData } from "../utils/idUtils";

// URL de base de l'API - à remplacer par votre URL réelle
const API_URL = "http://localhost:5000/api";

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
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Normalisation des données utilisateur pour assurer la cohérence des IDs
const normalizeAndStoreUser = (userData) => {
  if (!userData) return null;

  // S'assurer que les champs id et _id sont présents
  const userId = userData._id || userData.id;
  if (userId) {
    const normalizedUser = {
      ...userData,
      id: userId,
      _id: userId,
    };

    // Stocker dans sessionStorage et localStorage
    sessionStorage.setItem("user", JSON.stringify(normalizedUser));
    localStorage.setItem("user", JSON.stringify(normalizedUser));

    return normalizedUser;
  }

  return userData;
};

// Service d'authentification
class AuthService {
  // Connexion utilisateur
  async login(email, password) {
    try {
      console.log("AuthService: Tentative de connexion avec", email);

      // Requête au backend MongoDB
      const response = await apiClient.post("/signin", { email, password });

      console.log("AuthService: Réponse du serveur:", response.data);

      // Normaliser et stocker les données utilisateur
      const normalizedUser = normalizeAndStoreUser(response.data.user);

      // Enregistrer le token en sessionStorage
      sessionStorage.setItem("authToken", response.data.token);

      // Vérifier que le stockage a fonctionné
      const storedUser = JSON.parse(sessionStorage.getItem("user") || "{}");
      console.log("AuthService: Utilisateur stocké avec ID:", storedUser.id);

      return {
        success: true,
        data: {
          ...response.data,
          user: normalizedUser,
        },
      };
    } catch (error) {
      console.error("AuthService: Erreur de connexion:", error.response?.data || error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || "Erreur de connexion",
      };
    }
  }

  // Inscription utilisateur
  async register(userData) {
    try {
      console.log("AuthService: Inscription avec les données:", userData);

      // Requête au backend MongoDB
      const response = await apiClient.post("/signup", userData);

      console.log("AuthService: Réponse du serveur:", response.data);

      // Normaliser et stocker les données utilisateur
      const normalizedUser = normalizeAndStoreUser(response.data.user);

      // Enregistrer le token en sessionStorage
      sessionStorage.setItem("authToken", response.data.token);

      return {
        success: true,
        data: {
          ...response.data,
          user: normalizedUser,
        },
      };
    } catch (error) {
      console.error("AuthService: Erreur d'inscription:", error.response?.data || error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || "Erreur d'inscription",
      };
    }
  }

  // Déconnexion utilisateur
  logout() {
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("user");
    localStorage.removeItem("user");
  }

  // Vérifier si l'utilisateur est connecté
  isAuthenticated() {
    const token = sessionStorage.getItem("authToken");
    return !!token;
  }

  // Obtenir l'utilisateur connecté
  getCurrentUser() {
    try {
      // Vérifier d'abord dans sessionStorage
      let userStr = sessionStorage.getItem("user");
      if (!userStr) {
        // Si pas dans sessionStorage, essayer localStorage
        userStr = localStorage.getItem("user");
        if (!userStr) return null;

        // Si trouvé dans localStorage, synchroniser avec sessionStorage
        sessionStorage.setItem("user", userStr);
      }

      const userData = JSON.parse(userStr);

      // Vérifier et normaliser les IDs au cas où
      return normalizeAndStoreUser(userData);
    } catch (error) {
      console.error("Erreur lors de la récupération de l'utilisateur", error);
      return null;
    }
  }

  // Vérifier la validité du token
  async verifyToken() {
    try {
      const response = await apiClient.get("/profile");
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Erreur lors de la vérification du token:", error);
      return { success: false, error: error.message };
    }
  }

  // Mettre à jour le profil de l'utilisateur
  async updateProfile(profileData) {
    try {
      // Requête au backend
      const response = await apiClient.put("/api/profile", profileData);

      // Mettre à jour l'utilisateur en sessionStorage
      sessionStorage.setItem("user", JSON.stringify(response.data));

      return {
        success: true,
        data: {
          user: response.data,
        },
      };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Erreur lors de la mise à jour du profil",
      };
    }
  }

  // Mettre à jour l'avatar de l'utilisateur
  async updateAvatar(file) {
    try {
      // Requête au backend avec FormData pour l'upload de fichier
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await apiClient.post("/profile/avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Mettre à jour l'utilisateur en sessionStorage
      sessionStorage.setItem("user", JSON.stringify(response.data.user));

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Erreur lors de la mise à jour de l'avatar",
      };
    }
  }

  // Mettre à jour les compétences de l'utilisateur
  async updateSkills(skills) {
    try {
      // Requête au backend
      const response = await apiClient.put("/profile/skills", { skills });

      // Mettre à jour l'utilisateur en sessionStorage
      sessionStorage.setItem("user", JSON.stringify(response.data.user));

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Erreur lors de la mise à jour des compétences",
      };
    }
  }
}

// Exporter une instance singleton du service
const authService = new AuthService();
export default authService;
