/**
 * Script de test et débogage pour Socket.IO
 * Simule deux utilisateurs qui échangent des messages
 */

// Vérifier si on est dans Node.js ou dans un environnement de navigateur
const isNode = typeof window === 'undefined';

// Fonction d'assistance pour les logs
const log = (msg, data) => {
  console.log(`[${new Date().toISOString()}] ${msg}`, data || '');
};

// Fonction principale
async function main() {
  log('Démarrage du script de test Socket.IO...');
  
  // Importer socket.io-client de manière compatible avec Node.js et le navigateur
  const io = isNode ? require('socket.io-client').io : window.io;
  
  if (!io) {
    log('ERREUR: Socket.IO client non disponible!');
    return;
  }
  
  // Identifiants des utilisateurs de test
  const user1Id = 'test_user_1_' + Date.now();
  const user2Id = 'test_user_2_' + Date.now();
  
  log(`Création des utilisateurs de test: ${user1Id} et ${user2Id}`);
  
  // Options de connexion
  const socketOptions = {
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 20000,
    transports: ['websocket', 'polling']
  };
  
  // Créer les connexions
  const socket1 = io('http://localhost:5000', {
    ...socketOptions,
    query: { userId: user1Id }
  });
  
  const socket2 = io('http://localhost:5000', {
    ...socketOptions,
    query: { userId: user2Id }
  });
  
  // Configuration des événements pour le premier utilisateur
  socket1.on('connect', () => {
    log(`Socket 1 connecté: ${socket1.id}`);
    socket1.emit('join', { userId: user1Id });
    
    log('Socket 1 émet "join" avec userId ' + user1Id);
  });
  
  socket1.on('error', (err) => {
    log('Erreur socket 1:', err);
  });
  
  socket1.on('disconnect', (reason) => {
    log(`Socket 1 déconnecté: ${reason}`);
  });
  
  socket1.on('userList', (users) => {
    log('Socket 1 a reçu userList:', users);
  });
  
  socket1.on('online_users', (users) => {
    log('Socket 1 a reçu online_users:', users);
  });
  
  socket1.on('receiveMessage', (message) => {
    log('Socket 1 a reçu un message:', message);
    
    // Répondre au message
    setTimeout(() => {
      log('Socket 1 répond au message');
      socket1.emit('sendMessage', {
        senderId: user1Id,
        receiverId: user2Id,
        message: `Réponse du socket 1 (${new Date().toLocaleTimeString()})`,
        fileUrl: null
      });
    }, 1000);
  });
  
  // Configuration des événements pour le deuxième utilisateur
  socket2.on('connect', () => {
    log(`Socket 2 connecté: ${socket2.id}`);
    socket2.emit('join', { userId: user2Id });
    
    log('Socket 2 émet "join" avec userId ' + user2Id);
    
    // Envoyer un message après un court délai
    setTimeout(() => {
      log('Socket 2 envoie un message à Socket 1');
      socket2.emit('sendMessage', {
        senderId: user2Id,
        receiverId: user1Id,
        message: `Message de test depuis Socket 2 (${new Date().toLocaleTimeString()})`,
        fileUrl: null
      });
    }, 3000);
  });
  
  socket2.on('error', (err) => {
    log('Erreur socket 2:', err);
  });
  
  socket2.on('disconnect', (reason) => {
    log(`Socket 2 déconnecté: ${reason}`);
  });
  
  socket2.on('userList', (users) => {
    log('Socket 2 a reçu userList:', users);
  });
  
  socket2.on('online_users', (users) => {
    log('Socket 2 a reçu online_users:', users);
  });
  
  socket2.on('receiveMessage', (message) => {
    log('Socket 2 a reçu un message:', message);
  });
  
  // Attendre que les tests soient terminés (15 secondes)
  setTimeout(() => {
    log('Fin du test, déconnexion des sockets...');
    socket1.disconnect();
    socket2.disconnect();
    
    if (isNode) {
      process.exit(0);
    }
  }, 15000);
}

// Lancer le script
if (isNode) {
  main();
} else {
  window.runSocketTest = main;
} 