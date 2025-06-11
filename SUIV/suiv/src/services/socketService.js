import { io } from 'socket.io-client';

// URL du serveur socket, à remplacer par votre URL en production
const SOCKET_SERVER_URL = 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.messageCallbacks = [];
    this.statusCallbacks = [];
    this.userId = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.pingInterval = null;
  }
  
  // Initialise la connexion socket
  connect(userId) {
    // Déconnexion si déjà connecté
    if (this.socket) {
      this.disconnect();
    }
    
    // Vérifier que l'ID utilisateur est valide
    if (!userId || userId === "null" || userId === "undefined") {
      console.error("ID utilisateur invalide:", userId);
      
      // Tenter de récupérer l'ID depuis localStorage
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          userId = userData._id || userData.id;
          console.log("ID utilisateur récupéré depuis localStorage:", userId);
        } catch (e) {
          console.error("Erreur lors de la récupération de l'utilisateur:", e);
          return { success: false, error: 'Invalid user ID' };
        }
      }
      
      // Si toujours pas d'ID valide, impossible de se connecter
      if (!userId || userId === "null" || userId === "undefined") {
        console.error("Impossible de se connecter sans ID utilisateur valide");
        return { success: false, error: 'Invalid user ID' };
      }
    }
    
    // Stocker l'ID utilisateur pour l'utiliser dans les messages
    this.userId = userId;
    this.reconnectAttempts = 0;
    
    // Connexion au serveur socket avec l'ID de l'utilisateur
    this.socket = io(SOCKET_SERVER_URL, {
      query: { userId },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    
    // Gestion des événements de connexion
    this.socket.on('connect', () => {
      console.log('Socket connected with userId:', userId);
      this.connected = true;
      this.notifyStatusChange(true);
      
      // Rejoindre explicitement avec userId
      this.socket.emit('join', { userId });
    });
    
    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts > this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
        this.socket.disconnect();
      }
    });
    
    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
      this.connected = false;
      this.notifyStatusChange(false);
    });
    
    // Écoute des messages entrants - supporter tous les formats possibles
    this.socket.on('message', (data) => {
      console.log('Message received (message):', data);
      this.notifyMessageReceived(data);
    });
    
    this.socket.on('receiveMessage', (data) => {
      console.log('Message received (receiveMessage):', data);
      this.notifyMessageReceived(data);
    });
    
    // Écouter les événements de statut utilisateur
    this.socket.on('userList', (users) => {
      console.log('User list received:', users);
      // Déclencher un événement personnalisé pour informer l'application des utilisateurs en ligne
      document.dispatchEvent(new CustomEvent('onlineUsersUpdated', { detail: users }));
    });
    
    this.socket.on('user_status', (statusData) => {
      console.log('User status update:', statusData);
      // Déclencher un événement personnalisé pour informer l'application du changement de statut
      document.dispatchEvent(new CustomEvent('userStatusChanged', { detail: statusData }));
    });
    
    this.socket.on('online_users', (users) => {
      console.log('Online users list received:', users);
      // Déclencher un événement personnalisé pour informer l'application des utilisateurs en ligne
      document.dispatchEvent(new CustomEvent('onlineUsersList', { detail: users }));
    });
    
    // Écoute des confirmations de messages
    this.socket.on('message_delivered', (data) => {
      console.log('Message delivered:', data);
      this.notifyMessageDelivered(data);
    });
    
    this.socket.on('messageStatus', (data) => {
      console.log('Message status update:', data);
      this.notifyMessageDelivered(data);
    });

    // Ping périodique pour maintenir la connexion active
    this.pingInterval = setInterval(() => {
      if (this.connected && this.socket) {
        this.socket.emit('ping', { userId: this.userId });
      }
    }, 30000); // Ping toutes les 30 secondes
    
    return this;
  }
  
  // Déconnexion du serveur socket
  disconnect() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }
  
  // Envoi d'un message
  sendMessage(recipientId, message, conversationId = null) {
    if (!this.connected || !this.socket) {
      console.error("Tentative d'envoi sans connexion active");
      return { success: false, error: 'Not connected' };
    }
    
    // Vérifier que les ID sont valides
    if (!this.userId || this.userId === "null" || this.userId === "undefined") {
      console.error("ID expéditeur invalide:", this.userId);
      return { success: false, error: 'Invalid sender ID' };
    }
    
    if (!recipientId || recipientId === "null" || recipientId === "undefined") {
      console.error("ID destinataire invalide:", recipientId);
      return { success: false, error: 'Invalid recipient ID' };
    }
    
    const messageData = {
      id: Date.now().toString(),
      senderId: this.userId, // Utiliser l'ID utilisateur stocké plutôt que l'ID de socket
      receiverId: recipientId,
      recipientId: recipientId, // Ajouter les deux formats pour compatibilité
      content: message,        // Format frontend
      message: message,        // Format backend
      timestamp: new Date().toISOString(),
      delivered: false,
      read: false,
    };
    
    // Ajouter conversationId s'il est fourni
    if (conversationId && conversationId !== "null" && conversationId !== "undefined") {
      messageData.conversationId = conversationId;
    }
    
    // Émettre l'événement avec les deux formats possibles pour assurer la compatibilité
    console.log('Sending message:', messageData);
    
    // Émettre avec les deux noms d'événements possibles
    this.socket.emit('sendMessage', messageData);
    this.socket.emit('send_message', messageData);
    
    // Tentative d'auto-réception pour forcer l'affichage local
    setTimeout(() => {
      // Si le message n'a pas été confirmé dans un délai, l'ajouter localement
      this.notifyMessageReceived({...messageData, isMine: true});
    }, 1000);
    
    return { success: true, messageData };
  }
  
  // Confirmation de lecture d'un message
  markMessageAsRead(messageId, conversationId = null) {
    if (!this.connected || !this.socket) {
      return false;
    }
    
    this.socket.emit('mark_read', { messageId, conversationId });
    this.socket.emit('markMessageAsRead', { messageId, conversationId });
    return true;
  }
  
  // S'abonner aux notifications de nouveaux messages
  onMessage(callback) {
    if (typeof callback === 'function') {
      this.messageCallbacks.push(callback);
    }
    return this;
  }
  
  // S'abonner aux changements de statut de connexion
  onStatusChange(callback) {
    if (typeof callback === 'function') {
      this.statusCallbacks.push(callback);
    }
    return this;
  }
  
  // Notification aux abonnés d'un nouveau message
  notifyMessageReceived(data) {
    console.log('Notifying subscribers of new message:', data);
    if (this.messageCallbacks.length === 0) {
      console.warn('No message callbacks registered');
    }
    
    try {
      // Normaliser le message avant de le transmettre
      const normalizedMessage = {
        id: data._id || data.id || Date.now().toString(),
        _id: data._id || data.id || Date.now().toString(),
        senderId: data.senderId,
        receiverId: data.receiverId || data.recipientId,
        message: data.message || data.content || "",
        content: data.content || data.message || "",
        fileUrl: data.fileUrl,
        timestamp: data.timestamp || data.createdAt || new Date().toISOString(),
        createdAt: data.createdAt || data.timestamp || new Date().toISOString(),
        status: data.status || (data.delivered ? 'delivered' : 'sent'),
        seen: data.seen || data.isRead || false,
        read: data.read || data.isRead || false,
        delivered: data.delivered || data.status === 'delivered' || false,
        isMine: data.isMine || data.senderId === this.userId
      };
      
      // Notifier tous les abonnés
      this.messageCallbacks.forEach(callback => {
        try {
          if (typeof callback === 'function') {
            callback(normalizedMessage);
          } else {
            console.warn('Invalid message callback type:', typeof callback);
          }
        } catch (callbackError) {
          console.error('Error in message callback:', callbackError);
        }
      });
    } catch (error) {
      console.error('Error normalizing message in notifyMessageReceived:', error);
    }
  }
  
  // Notification aux abonnés d'un message livré
  notifyMessageDelivered(data) {
    console.log('Notifying subscribers of message delivery:', data);
    try {
      // Normaliser les données de statut
      const statusData = {
        messageId: data.messageId || data.id || data._id,
        status: data.status || 'delivered',
        recipientId: data.recipientId || data.receiverId,
        timestamp: data.timestamp || new Date().toISOString()
      };
      
      this.messageCallbacks.forEach(callback => {
        try {
          if (typeof callback === 'function') {
            callback(statusData);
          } else if (callback && typeof callback.messageDelivered === 'function') {
            callback.messageDelivered(statusData);
          } else {
            console.warn('No valid delivery callback found');
          }
        } catch (callbackError) {
          console.error('Error in message delivery callback:', callbackError);
        }
      });
    } catch (error) {
      console.error('Error in notifyMessageDelivered:', error);
    }
  }
  
  // Notification aux abonnés d'un changement de statut
  notifyStatusChange(isConnected) {
    this.statusCallbacks.forEach(callback => callback(isConnected));
  }
  
  // Vérifier si connecté
  isConnected() {
    return this.connected;
  }
  
  // Forcer une reconnexion
  reconnect() {
    if (!this.userId) {
      return { success: false, error: 'No user ID stored' };
    }
    
    this.disconnect();
    return this.connect(this.userId);
  }
}

// Exportation d'une instance singleton du service
const socketService = new SocketService();
export default socketService; 