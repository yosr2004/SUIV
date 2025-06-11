import React, { createContext, useContext, useState, useEffect } from "react";
import socketService from "../services/socketService";
import { getUserId, isSameUser } from "../utils/idUtils";

// Créer le contexte
const ChatContext = createContext();

// Hook personnalisé pour utiliser le contexte
export const useChat = () => useContext(ChatContext);

// Fournisseur du contexte
export const ChatProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [conversations, setConversations] = useState({});
  const [activeConversation, setActiveConversation] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Effet pour configurer les gestionnaires d'événements socket
  useEffect(() => {
    // Gestionnaire pour les changements de statut de connexion
    socketService.onStatusChange(setConnectionStatus);

    // Gestionnaire pour les nouveaux messages
    socketService.onMessage((messageData) => {
      // Ajout du message à la conversation correspondante
      setConversations((prevConversations) => {
        // Utiliser l'utilitaire getUserId pour normaliser les IDs
        const currentUserId = getUserId(currentUser);
        const senderId = getUserId(messageData.senderId || messageData);
        const recipientId = getUserId(
          messageData.recipientId || messageData.receiverId || messageData
        );

        // Déterminer l'ID de conversation à utiliser
        const conversationId = messageData.senderId === currentUserId ? recipientId : senderId;

        const conversation = prevConversations[conversationId] || { messages: [] };

        // Normaliser l'ID du message pour éviter les doublons
        const messageId = messageData._id || messageData.id || Date.now().toString();

        // Éviter les doublons de messages
        if (!conversation.messages.some((msg) => (msg._id || msg.id) === messageId)) {
          conversation.messages = [...conversation.messages, messageData].sort(
            (a, b) => new Date(a.timestamp || a.createdAt) - new Date(b.timestamp || b.createdAt)
          );
        }

        // Marquer comme non lu si ce n'est pas l'utilisateur actuel qui a envoyé le message
        // et que ce n'est pas la conversation active
        const isUnread =
          !isSameUser(senderId, currentUserId) && activeConversation !== conversationId;

        if (isUnread) {
          conversation.unreadCount = (conversation.unreadCount || 0) + 1;
          setUnreadCount((prev) => prev + 1);
        }

        // Si le message est envoyé par l'utilisateur actuel, le marquer comme envoyé
        if (isSameUser(senderId, currentUserId)) {
          messageData.delivered = true;
        }

        return {
          ...prevConversations,
          [conversationId]: conversation,
        };
      });

      // Si le message est entrant et pas de l'utilisateur actuel, envoyer une confirmation de réception
      if (!isSameUser(messageData.senderId, currentUser)) {
        const messageId = messageData._id || messageData.id;
        if (messageId) {
          socketService.markMessageAsRead(messageId);
        }
      }
    });

    return () => {
      // Déconnexion du service socket lors du démontage du composant
      socketService.disconnect();
    };
  }, [currentUser, activeConversation]);

  // Connexion au service socket
  const connect = (user) => {
    setCurrentUser(user);
    socketService.connect(getUserId(user));
  };

  // Envoi d'un nouveau message
  const sendMessage = (recipientId, content, conversationId = null) => {
    if (!socketService.isConnected()) {
      return { success: false, error: "Not connected" };
    }

    const result = socketService.sendMessage(recipientId, content, conversationId);

    if (result.success && result.messageData) {
      // Ajouter le message à la conversation immédiatement
      setConversations((prevConversations) => {
        const conversation = prevConversations[recipientId] || { messages: [] };
        conversation.messages = [...conversation.messages, result.messageData].sort(
          (a, b) => new Date(a.timestamp || a.createdAt) - new Date(b.timestamp || b.createdAt)
        );

        return {
          ...prevConversations,
          [recipientId]: conversation,
        };
      });
    }

    return result;
  };

  // Sélection d'une conversation active
  const selectConversation = (conversationId) => {
    setActiveConversation(conversationId);

    // Marquer tous les messages comme lus
    if (conversations[conversationId]) {
      const unreadMessages = conversations[conversationId].messages.filter(
        (msg) => !msg.read && !isSameUser(msg.senderId, currentUser)
      );

      // Mettre à jour le compteur d'éléments non lus
      setUnreadCount((prev) =>
        Math.max(0, prev - (conversations[conversationId].unreadCount || 0))
      );

      // Réinitialiser le compteur pour cette conversation
      setConversations((prev) => ({
        ...prev,
        [conversationId]: {
          ...prev[conversationId],
          unreadCount: 0,
        },
      }));

      // Marquer les messages comme lus sur le serveur
      unreadMessages.forEach((msg) => {
        const messageId = msg._id || msg.id;
        if (messageId) {
          socketService.markMessageAsRead(messageId);
        }
      });
    }
  };

  // Valeurs exposées par le contexte
  const contextValue = {
    currentUser,
    conversations,
    activeConversation,
    connectionStatus,
    unreadCount,
    connect,
    sendMessage,
    selectConversation,
  };

  return <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>;
};

export default ChatContext;
