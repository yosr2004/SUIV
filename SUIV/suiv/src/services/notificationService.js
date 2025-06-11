import axios from "axios";

// URL de base de l'API
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

/**
 * Service pour gérer les notifications de l'application
 */

/**
 * Récupère les messages récents pour l'utilisateur connecté
 * @returns {Promise} Une promesse contenant les données des messages
 */
export const fetchUserMessages = async () => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("Utilisateur non authentifié");
    }

    const response = await axios.get(`${API_URL}/messages/recent`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des messages:", error);
    throw error;
  }
};

/**
 * Récupère les recommandations personnalisées pour l'utilisateur connecté
 * @returns {Promise} Une promesse contenant les données des recommandations
 */
export const fetchUserRecommendations = async () => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("Utilisateur non authentifié");
    }

    const response = await axios.get(`${API_URL}/recommendations/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des recommandations:", error);
    throw error;
  }
};

/**
 * Marquer un message comme lu
 * @param {string} messageId L'identifiant du message
 * @returns {Promise} Une promesse avec la confirmation de l'opération
 */
export const markMessageAsRead = async (messageId) => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("Utilisateur non authentifié");
    }

    const response = await axios.patch(
      `${API_URL}/messages/${messageId}/read`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Erreur lors du marquage du message comme lu:", error);
    throw error;
  }
};

/**
 * Marquer une recommandation comme lue
 * @param {string} recommendationId L'identifiant de la recommandation
 * @returns {Promise} Une promesse avec la confirmation de l'opération
 */
export const markRecommendationAsRead = async (recommendationId) => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("Utilisateur non authentifié");
    }

    const response = await axios.patch(
      `${API_URL}/recommendations/${recommendationId}/read`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Erreur lors du marquage de la recommandation comme lue:", error);
    throw error;
  }
};

/**
 * Supprimer un message
 * @param {string} messageId L'identifiant du message
 * @returns {Promise} Une promesse avec la confirmation de l'opération
 */
export const deleteMessage = async (messageId) => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("Utilisateur non authentifié");
    }

    const response = await axios.delete(`${API_URL}/messages/${messageId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Erreur lors de la suppression du message:", error);
    throw error;
  }
};

/**
 * Supprimer une recommandation
 * @param {string} recommendationId L'identifiant de la recommandation
 * @returns {Promise} Une promesse avec la confirmation de l'opération
 */
export const deleteRecommendation = async (recommendationId) => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("Utilisateur non authentifié");
    }

    const response = await axios.delete(`${API_URL}/recommendations/${recommendationId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Erreur lors de la suppression de la recommandation:", error);
    throw error;
  }
};

/**
 * Récupérer toutes les notifications
 * @returns {Promise} Une promesse contenant les données des notifications
 */
export const fetchNotifications = async () => {
  try {
    const token = sessionStorage.getItem('authToken') || localStorage.getItem('token');
    
    if (!token) {
      return { success: false, error: "Utilisateur non authentifié" };
    }
    
    const response = await axios.get(`${API_URL}/notifications`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des notifications:", error);
    return { 
      success: false, 
      error: error.response?.data?.message || "Erreur lors de la récupération des notifications" 
    };
  }
};

/**
 * Marquer une notification comme lue
 * @param {string} notificationId L'identifiant de la notification
 * @returns {Promise} Une promesse avec la confirmation de l'opération
 */
export const markAsRead = async (notificationId) => {
  try {
    const token = sessionStorage.getItem('authToken') || localStorage.getItem('token');
    
    if (!token) {
      return { success: false, error: "Utilisateur non authentifié" };
    }
    
    const response = await axios.patch(
      `${API_URL}/notifications/${notificationId}/read`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error("Erreur lors du marquage de la notification:", error);
    return { 
      success: false, 
      error: error.response?.data?.message || "Erreur lors du marquage de la notification" 
    };
  }
};

/**
 * Supprimer une notification
 * @param {string} notificationId L'identifiant de la notification
 * @returns {Promise} Une promesse avec la confirmation de l'opération
 */
export const deleteNotification = async (notificationId) => {
  try {
    const token = sessionStorage.getItem('authToken') || localStorage.getItem('token');
    
    if (!token) {
      return { success: false, error: "Utilisateur non authentifié" };
    }
    
    const response = await axios.delete(`${API_URL}/notifications/${notificationId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la suppression de la notification:", error);
    return { 
      success: false, 
      error: error.response?.data?.message || "Erreur lors de la suppression de la notification" 
    };
  }
};

/**
 * Demander l'autorisation et s'abonner aux notifications push
 * @returns {Promise} Une promesse contenant la confirmation de l'opération
 */
export const subscribeToPushNotifications = async () => {
  try {
    // Vérifier si le service worker et les notifications push sont supportés
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return { success: false, error: "Les notifications push ne sont pas supportées par votre navigateur" };
    }

    // Demander la permission de recevoir des notifications
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return { success: false, error: "L'autorisation pour les notifications a été refusée" };
    }

    // Enregistrer le service worker s'il n'est pas déjà enregistré
    const serviceWorkerRegistration = await navigator.serviceWorker.ready;

    // S'abonner aux notifications push
    const subscription = await serviceWorkerRegistration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(process.env.REACT_APP_VAPID_PUBLIC_KEY || '')
    });

    // Envoyer l'abonnement au serveur
    const token = sessionStorage.getItem('authToken') || localStorage.getItem('token');
    const response = await axios.post(
      `${API_URL}/notifications/subscribe`,
      { subscription },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return { success: true, subscription };
  } catch (error) {
    console.error("Erreur lors de l'abonnement aux notifications push:", error);
    return { 
      success: false, 
      error: error.message || "Erreur lors de l'abonnement aux notifications push" 
    };
  }
};

/**
 * Se désabonner des notifications push
 * @returns {Promise} Une promesse contenant la confirmation de l'opération
 */
export const unsubscribeFromPushNotifications = async () => {
  try {
    // Vérifier si le service worker est supporté
    if (!('serviceWorker' in navigator)) {
      return { success: false, error: "Les notifications push ne sont pas supportées par votre navigateur" };
    }

    // Obtenir l'enregistrement du service worker
    const serviceWorkerRegistration = await navigator.serviceWorker.ready;
    
    // Obtenir l'abonnement actuel
    const subscription = await serviceWorkerRegistration.pushManager.getSubscription();
    
    if (!subscription) {
      return { success: true, message: "Aucun abonnement aux notifications push trouvé" };
    }
    
    // Se désabonner
    await subscription.unsubscribe();
    
    // Informer le serveur
    const token = sessionStorage.getItem('authToken') || localStorage.getItem('token');
    await axios.post(
      `${API_URL}/notifications/unsubscribe`,
      { subscription: subscription.toJSON() },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return { success: true, message: "Désabonnement des notifications push réussi" };
  } catch (error) {
    console.error("Erreur lors du désabonnement des notifications push:", error);
    return { 
      success: false, 
      error: error.message || "Erreur lors du désabonnement des notifications push" 
    };
  }
};

/**
 * Vérifier si l'utilisateur est déjà abonné aux notifications push
 * @returns {Promise} Une promesse contenant les données de l'abonnement
 */
export const checkPushNotificationSubscription = async () => {
  try {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return { success: false, isSubscribed: false };
    }

    const serviceWorkerRegistration = await navigator.serviceWorker.ready;
    const subscription = await serviceWorkerRegistration.pushManager.getSubscription();
    
    return { 
      success: true, 
      isSubscribed: !!subscription,
      subscription: subscription ? subscription.toJSON() : null
    };
  } catch (error) {
    console.error("Erreur lors de la vérification de l'abonnement aux notifications push:", error);
    return { success: false, isSubscribed: false, error: error.message };
  }
};

/**
 * Simuler des données pour le développement local
 * @returns {Object} Les données des notifications simulées
 */
export const getMockNotifications = () => {
  return {
    success: true,
    notifications: [
      {
        id: '1',
        title: 'Nouveau message',
        message: 'Vous avez reçu un nouveau message de John Doe',
        type: 'message',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        read: false,
        senderId: '101'
      },
      {
        id: '2',
        title: 'Opportunité de formation',
        message: 'Une nouvelle formation sur React est disponible',
        type: 'opportunity',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        read: true,
        url: '/training/react'
      },
      {
        id: '3',
        title: 'Rappel: Réunion',
        message: 'Vous avez une réunion dans 30 minutes',
        type: 'reminder',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
        read: false
      },
      {
        id: '4',
        title: 'Nouvelle connexion',
        message: 'Marie Martin a accepté votre demande de connexion',
        type: 'network',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        read: true,
        userId: '102'
      },
      {
        id: '5',
        title: 'Conseil professionnel',
        message: 'Améliorez votre profil en ajoutant vos compétences principales',
        type: 'tip',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
        read: false
      }
    ]
  };
};

// Fonction utilitaire pour convertir une clé VAPID base64 en Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  
  return outputArray;
}

export default {
  fetchUserMessages,
  fetchUserRecommendations,
  markMessageAsRead,
  markRecommendationAsRead,
  deleteMessage,
  deleteRecommendation,
  fetchNotifications,
  markAsRead,
  deleteNotification,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  checkPushNotificationSubscription,
  getMockNotifications
};
