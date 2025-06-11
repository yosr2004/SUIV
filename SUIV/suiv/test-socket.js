const { io } = require("socket.io-client");

console.log("Démarrage du test de connexion socket.io...");

// Créer deux clients simulant deux utilisateurs différents
const user1 = io("http://localhost:5000", {
  query: {
    userId: "user1_id_test"
  }
});

const user2 = io("http://localhost:5000", {
  query: {
    userId: "user2_id_test"
  }
});

// Événements pour le premier utilisateur
user1.on("connect", () => {
  console.log("User1 connecté au serveur, socket ID:", user1.id);
  
  // Rejoindre la session de messagerie
  user1.emit("join", { userId: "user1_id_test" });
  
  // Après un délai, envoyer un message à l'utilisateur 2
  setTimeout(() => {
    console.log("User1 envoie un message à User2");
    user1.emit("sendMessage", {
      senderId: "user1_id_test",
      receiverId: "user2_id_test",
      message: "Hello from User1!",
      fileUrl: null
    });
  }, 2000);
});

user1.on("error", (error) => {
  console.error("Erreur User1:", error);
});

user1.on("receiveMessage", (message) => {
  console.log("User1 a reçu un message:", message);
});

// Événements pour le deuxième utilisateur
user2.on("connect", () => {
  console.log("User2 connecté au serveur, socket ID:", user2.id);
  
  // Rejoindre la session de messagerie
  user2.emit("join", { userId: "user2_id_test" });
  
  // Après reception d'un message, envoyer une réponse
  user2.on("receiveMessage", (message) => {
    console.log("User2 a reçu un message:", message);
    
    // Répondre à User1
    setTimeout(() => {
      console.log("User2 répond à User1");
      user2.emit("sendMessage", {
        senderId: "user2_id_test",
        receiverId: "user1_id_test",
        message: "Hello back from User2!",
        fileUrl: null
      });
    }, 1000);
  });
});

user2.on("error", (error) => {
  console.error("Erreur User2:", error);
});

// Écouter les utilisateurs en ligne
user1.on("online_users", (users) => {
  console.log("User1 a reçu la liste des utilisateurs en ligne:", users);
});

user2.on("online_users", (users) => {
  console.log("User2 a reçu la liste des utilisateurs en ligne:", users);
});

// Déconnexion après 10 secondes
setTimeout(() => {
  console.log("Déconnexion des clients...");
  user1.disconnect();
  user2.disconnect();
  console.log("Test terminé.");
  process.exit(0);
}, 10000); 