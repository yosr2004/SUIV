import axios from "axios";

// Configuration de l'URL de base de l'API
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// Timeout pour les requêtes API (en millisecondes)
const API_TIMEOUT = 10000;

// Afficher les logs de debug uniquement en développement
const debugLog = (message, data) => {
  if (process.env.NODE_ENV === "development") {
    console.log(`MessageService: ${message}`, data);
  }
};

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

class MessageService {
  // Récupérer toutes les conversations de l'utilisateur
  async getConversations() {
    try {
      debugLog("Récupération des conversations");
      const response = await apiClient.get("/messages/conversations");
      debugLog("Conversations récupérées", response.data);
      return response.data;
    } catch (error) {
      debugLog("Erreur lors de la récupération des conversations", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Erreur lors de la récupération des conversations",
      };
    }
  }

  // Récupérer les messages d'une conversation
  async getMessages(conversationId, page = 1, limit = 20) {
    try {
      debugLog(`Récupération des messages pour la conversation ${conversationId}`);
      const response = await apiClient.get(`/messages/conversations/${conversationId}/messages`, {
        params: { page, limit },
      });
      debugLog("Messages récupérés", response.data);
      return response.data;
    } catch (error) {
      debugLog("Erreur lors de la récupération des messages", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Erreur lors de la récupération des messages",
      };
    }
  }

  // Envoyer un message
  async sendMessage(conversationId, formData) {
    try {
      debugLog(`Envoi d'un message dans la conversation ${conversationId}`, formData);

      const response = await apiClient.post(
        `/messages/conversations/${conversationId}/messages`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      debugLog("Message envoyé", response.data);
      return response.data;
    } catch (error) {
      debugLog("Erreur lors de l'envoi du message", error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || "Erreur lors de l'envoi du message",
      };
    }
  }

  // Marquer les messages comme lus
  async markMessagesAsRead(conversationId) {
    try {
      debugLog(`Marquage des messages comme lus pour la conversation ${conversationId}`);
      const response = await apiClient.put(`/messages/conversations/${conversationId}/read`);
      debugLog("Messages marqués comme lus", response.data);
      return response.data;
    } catch (error) {
      debugLog("Erreur lors du marquage des messages comme lus", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Erreur lors du marquage des messages comme lus",
      };
    }
  }

  // Récupérer la liste des utilisateurs pour la messagerie
  async getUsers(searchQuery = "") {
    try {
      debugLog("Récupération des utilisateurs", { searchQuery });
      const response = await apiClient.get("/messages/users", {
        params: { searchQuery },
      });
      debugLog("Utilisateurs récupérés", response.data);
      return response.data;
    } catch (error) {
      debugLog("Erreur lors de la récupération des utilisateurs", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Erreur lors de la récupération des utilisateurs",
      };
    }
  }

  // Récupérer la liste des mentors disponibles
  async getMentors(filters = {}) {
    try {
      debugLog("Récupération des mentors", filters);
      const response = await apiClient.get("/messages/mentors", { params: filters });
      debugLog("Mentors récupérés", response.data);
      return response.data;
    } catch (error) {
      debugLog("Erreur lors de la récupération des mentors", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Erreur lors de la récupération des mentors",
      };
    }
  }

  // Créer une nouvelle conversation
  async createConversation(participantId, message, topic, isMentorConversation = false) {
    try {
      debugLog("Création d'une nouvelle conversation", {
        participantId,
        message,
        topic,
        isMentorConversation,
      });

      const response = await apiClient.post("/messages/conversations", {
        participantId,
        message,
        topic,
        isMentorConversation,
      });

      debugLog("Conversation créée", response.data);
      return response.data;
    } catch (error) {
      debugLog("Erreur lors de la création de la conversation", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Erreur lors de la création de la conversation",
      };
    }
  }

  // Archiver une conversation
  async archiveConversation(conversationId) {
    try {
      debugLog(`Archivage de la conversation ${conversationId}`);
      const response = await apiClient.put(`/messages/conversations/${conversationId}/archive`);
      debugLog("Conversation archivée", response.data);
      return response.data;
    } catch (error) {
      debugLog("Erreur lors de l'archivage de la conversation", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Erreur lors de l'archivage de la conversation",
      };
    }
  }
}

export default new MessageService();
