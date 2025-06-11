/**
 * Script de test pour vérifier les correctifs de socket.io
 * Ce script simule la communication entre deux utilisateurs
 * avec les formats de données corrigés
 */

const { io } = require("socket.io-client");
const fs = require('fs');
const path = require('path');

// Configuration du journal
const LOG_FILE = path.join(__dirname, 'socket-test-log.txt');
fs.writeFileSync(LOG_FILE, `Test Socket.IO commencé le ${new Date().toISOString()}\n`, { flag: 'w' });

const log = (message) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  console.log(logMessage.trim());
  fs.appendFileSync(LOG_FILE, logMessage);
};

// Générer des IDs de test uniques
const user1Id = 'test_user_1_' + Date.now();
const user2Id = 'test_user_2_' + Date.now();

log(`Création d'utilisateurs de test avec IDs: ${user1Id} et ${user2Id}`);

// Configuration de Socket.IO
const socketOptions = {
  reconnection: true,
  reconnectionAttempts: 3,
  reconnectionDelay: 1000,
  timeout: 10000,
  transports: ['websocket', 'polling']
};

// Créer les clients socket
const socket1 = io("http://localhost:5000", {
  ...socketOptions,
  query: { userId: user1Id }
});

const socket2 = io("http://localhost:5000", {
  ...socketOptions,
  query: { userId: user2Id }
});

// Tests à effectuer
const tests = [
  // Test 1: Émission de l'événement 'join'
  () => {
    log("Test 1: Émission des événements 'join'");
    socket1.emit('join', { userId: user1Id });
    socket2.emit('join', { userId: user2Id });
  },
  
  // Test 2: Envoi d'un message avec format 'sendMessage'
  () => {
    log("Test 2: Envoi d'un message avec format 'sendMessage'");
    socket1.emit('sendMessage', {
      senderId: user1Id,
      receiverId: user2Id,
      message: "Test message using 'sendMessage' event",
      timestamp: new Date().toISOString()
    });
  },
  
  // Test 3: Envoi d'un message avec format 'send_message'
  () => {
    log("Test 3: Envoi d'un message avec format 'send_message'");
    socket2.emit('send_message', {
      senderId: user2Id,
      recipientId: user1Id, // Utiliser recipientId au lieu de receiverId
      content: "Test message using 'send_message' event and 'content' field",
      timestamp: new Date().toISOString()
    });
  },
  
  // Test 4: Message sans conversationId
  () => {
    log("Test 4: Envoi d'un message sans conversationId");
    socket1.emit('sendMessage', {
      senderId: user1Id,
      receiverId: user2Id,
      content: "Message without conversationId",
      timestamp: new Date().toISOString()
    });
  }
];

// Configurer les écouteurs d'événements pour le premier utilisateur
socket1.on('connect', () => {
  log(`Socket 1 connecté: ID=${socket1.id}`);
});

socket1.on('error', (err) => {
  log(`Erreur Socket 1: ${JSON.stringify(err)}`);
});

socket1.on('message', (data) => {
  log(`Socket 1 a reçu un message (event: message): ${JSON.stringify(data)}`);
});

socket1.on('receiveMessage', (data) => {
  log(`Socket 1 a reçu un message (event: receiveMessage): ${JSON.stringify(data)}`);
});

socket1.on('disconnect', (reason) => {
  log(`Socket 1 déconnecté: ${reason}`);
});

// Configurer les écouteurs d'événements pour le deuxième utilisateur
socket2.on('connect', () => {
  log(`Socket 2 connecté: ID=${socket2.id}`);
});

socket2.on('error', (err) => {
  log(`Erreur Socket 2: ${JSON.stringify(err)}`);
});

socket2.on('message', (data) => {
  log(`Socket 2 a reçu un message (event: message): ${JSON.stringify(data)}`);
});

socket2.on('receiveMessage', (data) => {
  log(`Socket 2 a reçu un message (event: receiveMessage): ${JSON.stringify(data)}`);
});

socket2.on('disconnect', (reason) => {
  log(`Socket 2 déconnecté: ${reason}`);
});

// Exécuter les tests séquentiellement
let testIndex = 0;

const runNextTest = () => {
  if (testIndex < tests.length) {
    setTimeout(() => {
      tests[testIndex]();
      testIndex++;
      runNextTest();
    }, 2000); // 2s d'intervalle entre les tests
  } else {
    // Tous les tests sont terminés
    setTimeout(() => {
      log("Tests terminés, déconnexion des sockets...");
      socket1.disconnect();
      socket2.disconnect();
      setTimeout(() => {
        log(`Log enregistré dans ${LOG_FILE}`);
        process.exit(0);
      }, 1000);
    }, 3000); // Attendre 3s après le dernier test
  }
};

// Démarrer les tests une fois que les deux sockets sont connectés
let connectedSockets = 0;
const startTestsWhenReady = () => {
  connectedSockets++;
  if (connectedSockets === 2) {
    log("Les deux sockets sont connectés, démarrage des tests...");
    setTimeout(runNextTest, 1000);
  }
};

socket1.on('connect', startTestsWhenReady);
socket2.on('connect', startTestsWhenReady);

// Gérer les erreurs de connexion
const handleConnectionError = (socketNum) => {
  log(`Erreur de connexion du socket ${socketNum}, arrêt des tests`);
  process.exit(1);
};

setTimeout(() => {
  if (connectedSockets < 2) {
    log("Délai de connexion dépassé, certains sockets ne sont pas connectés");
    process.exit(1);
  }
}, 10000); // 10s de timeout maximal pour les connexions

// Afficher le statut final et terminer
process.on('exit', () => {
  log("Script de test terminé");
}); 