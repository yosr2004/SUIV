import React, { useState, useEffect, useRef } from "react";
import {
  Grid,
  Card,
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  IconButton,
  Badge,
  Snackbar,
  Alert,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
} from "@mui/material";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DoneIcon from "@mui/icons-material/Done";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import MessageIcon from "@mui/icons-material/Message";
import LinkIcon from "@mui/icons-material/Link";
import ArticleIcon from "@mui/icons-material/Article";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import ShareIcon from "@mui/icons-material/Share";
import CloseIcon from "@mui/icons-material/Close";
import { io } from "socket.io-client";
import axios from "axios";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import messageService from "services/messageService";

// Mock des utilisateurs pour le fallback au cas où l'API échoue
const mockUsers = [
  {
    id: 101,
    firstName: "Jean",
    lastName: "Dupont",
    name: "Jean Dupont",
    email: "jean.dupont@example.com",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    isOnline: true,
    isMentor: false,
    title: "Développeur Full Stack",
  },
  {
    id: 102,
    firstName: "Marie",
    lastName: "Martin",
    name: "Marie Martin",
    email: "marie.martin@example.com",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    isOnline: false,
    isMentor: false,
    title: "Designer UX/UI",
  },
  {
    id: 103,
    firstName: "Lucas",
    lastName: "Petit",
    name: "Lucas Petit",
    email: "lucas.petit@example.com",
    avatar: "https://randomuser.me/api/portraits/men/41.jpg",
    isOnline: true,
    isMentor: false,
    title: "Chef de projet IT",
  },
  {
    id: 104,
    firstName: "Sophie",
    lastName: "Leroy",
    name: "Sophie Leroy",
    email: "sophie.leroy@example.com",
    avatar: "https://randomuser.me/api/portraits/women/22.jpg",
    isOnline: true,
    isMentor: false,
    title: "Analyste de données",
  },
  {
    id: 105,
    firstName: "Thomas",
    lastName: "Bernard",
    name: "Thomas Bernard",
    email: "thomas.bernard@example.com",
    avatar: "https://randomuser.me/api/portraits/men/24.jpg",
    isOnline: false,
    isMentor: false,
    title: "Architecte Logiciel",
  },
  {
    id: 106,
    firstName: "Emma",
    lastName: "Dubois",
    name: "Emma Dubois",
    email: "emma.dubois@example.com",
    avatar: "https://randomuser.me/api/portraits/women/29.jpg",
    isOnline: true,
    isMentor: false,
    title: "Product Owner",
  },
  {
    id: 107,
    firstName: "Alexandre",
    lastName: "Moreau",
    name: "Alexandre Moreau",
    email: "alexandre.moreau@example.com",
    avatar: "https://randomuser.me/api/portraits/men/18.jpg",
    isOnline: true,
    isMentor: false,
    title: "Développeur Frontend",
  },
  {
    id: 108,
    firstName: "Camille",
    lastName: "Roux",
    name: "Camille Roux",
    email: "camille.roux@example.com",
    avatar: "https://randomuser.me/api/portraits/women/33.jpg",
    isOnline: false,
    isMentor: false,
    title: "Graphiste",
  },
  {
    id: 109,
    firstName: "Julien",
    lastName: "Fournier",
    name: "Julien Fournier",
    email: "julien.fournier@example.com",
    avatar: "https://randomuser.me/api/portraits/men/56.jpg",
    isOnline: true,
    isMentor: false,
    title: "Développeur Backend",
  },
  {
    id: 110,
    firstName: "Léa",
    lastName: "Vincent",
    name: "Léa Vincent",
    email: "lea.vincent@example.com",
    avatar: "https://randomuser.me/api/portraits/women/65.jpg",
    isOnline: true,
    isMentor: false,
    title: "Marketing Digital",
  },
  {
    id: 111,
    firstName: "Hugo",
    lastName: "Lemaire",
    name: "Hugo Lemaire",
    email: "hugo.lemaire@example.com",
    avatar: "https://randomuser.me/api/portraits/men/71.jpg",
    isOnline: false,
    isMentor: false,
    title: "Analyste Financier",
  },
  {
    id: 112,
    firstName: "Chloé",
    lastName: "Robin",
    name: "Chloé Robin",
    email: "chloe.robin@example.com",
    avatar: "https://randomuser.me/api/portraits/women/75.jpg",
    isOnline: true,
    isMentor: false,
    title: "Responsable RH",
  },
];

// Mentors mock data de la page Network
const mockMentors = [
  {
    id: 1,
    name: "Sarah Johnson",
    firstName: "Sarah",
    lastName: "Johnson",
    title: "Senior Software Architect",
    company: "Tech Solutions Inc.",
    expertise: ["Cloud Architecture", "System Design", "Team Leadership"],
    avatar: "",
    isOnline: true,
    isMentor: true,
  },
  {
    id: 2,
    name: "Michael Chen",
    firstName: "Michael",
    lastName: "Chen",
    title: "Lead Developer",
    company: "Innovation Labs",
    expertise: ["Full Stack Development", "Agile Methodologies", "Mentoring"],
    avatar: "",
    isOnline: false,
    isMentor: true,
  },
  {
    id: 3,
    name: "Laura Sanchez",
    firstName: "Laura",
    lastName: "Sanchez",
    title: "Data Science Expert",
    company: "DataMinds",
    expertise: ["Machine Learning", "Data Analysis", "Python", "R"],
    avatar: "",
    isOnline: true,
    isMentor: true,
  },
  {
    id: 4,
    name: "David Kim",
    firstName: "David",
    lastName: "Kim",
    title: "DevOps Engineer",
    company: "CloudCore",
    expertise: ["Docker", "Kubernetes", "CI/CD", "AWS"],
    avatar: "",
    isOnline: true,
    isMentor: true,
  },
];

// Initialisation du socket avec l'ID utilisateur dans les paramètres de requête
const socket = io("http://localhost:5000", {
  query: {
    userId: localStorage.getItem("user")
      ? JSON.parse(localStorage.getItem("user")).id || JSON.parse(localStorage.getItem("user"))._id
      : null,
  },
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 20000,
  transports: ["websocket"], // Forcer l'utilisation de WebSocket uniquement
});

// Fonction utilitaire pour normaliser les IDs
function getUserId(user) {
  if (!user) return null;
  if (typeof user === "string") return user;
  return user.id || user._id || user.userId;
}

// Debug logger with toggle
const DEBUG = true;
function debugLog(...args) {
  if (DEBUG) console.log("[DEBUG]", ...args);
}

function Messagerie() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState({});
  const [file, setFile] = useState(null);
  const [typingStatus, setTypingStatus] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const [realUsers, setRealUsers] = useState([]);
  const [notification, setNotification] = useState(null);
  const [shareMenuAnchor, setShareMenuAnchor] = useState(null);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [articleDialogOpen, setArticleDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkTitle, setLinkTitle] = useState("");
  const [articleTitle, setArticleTitle] = useState("");
  const [articleContent, setArticleContent] = useState("");
  const [articleUrl, setArticleUrl] = useState("");

  // Obtenir l'utilisateur depuis sessionStorage (compatibilité avec le reste de l'application)
  let currentUser;
  try {
    const userStr = sessionStorage.getItem("user") || localStorage.getItem("user");
    currentUser = userStr ? JSON.parse(userStr) : null;

    // Si l'utilisateur est dans localStorage mais pas dans sessionStorage, le copier
    if (localStorage.getItem("user") && !sessionStorage.getItem("user")) {
      sessionStorage.setItem("user", localStorage.getItem("user"));
    }

    // Si le token est dans localStorage mais pas dans sessionStorage, le copier
    if (localStorage.getItem("token") && !sessionStorage.getItem("authToken")) {
      sessionStorage.setItem("authToken", localStorage.getItem("token"));
    }
  } catch (e) {
    console.error("Erreur lors de la récupération de l'utilisateur:", e);
    currentUser = null;
  }

  // Fonctions pour sauvegarder et récupérer les messages du localStorage
  const saveMessagesToLocalStorage = (messagesData) => {
    if (!currentUser) return;

    try {
      const userId = getUserId(currentUser);
      localStorage.setItem(`messages_${userId}`, JSON.stringify(messagesData));
    } catch (e) {
      console.error("Erreur lors de la sauvegarde des messages:", e);
    }
  };

  const getMessagesFromLocalStorage = () => {
    if (!currentUser) return {};

    try {
      const userId = getUserId(currentUser);
      const storedMessages = localStorage.getItem(`messages_${userId}`);
      if (storedMessages) {
        return JSON.parse(storedMessages);
      }
    } catch (e) {
      console.error("Erreur lors de la récupération des messages:", e);
    }

    return {};
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Charger les messages sauvegardés lors du chargement du composant
  useEffect(() => {
    const savedMessages = getMessagesFromLocalStorage();
    if (Object.keys(savedMessages).length > 0) {
      setMessages(savedMessages);
    }
  }, []);

  // Sauvegarder les messages chaque fois qu'ils changent
  useEffect(() => {
    if (Object.keys(messages).length > 0) {
      saveMessagesToLocalStorage(messages);
    }
  }, [messages]);

  useEffect(() => {
    // Débogage - Afficher l'ID utilisateur actuel
    debugLog("Utilisateur actuel", currentUser);

    // Si l'utilisateur n'est pas connecté, ne pas continuer
    if (!currentUser) {
      setError("Veuillez vous connecter pour utiliser la messagerie");
      setIsLoading(false);
      return;
    }

    // Mettre à jour la requête de socket si nécessaire
    if (currentUser && currentUser.id !== socket.io.opts.query.userId) {
      socket.io.opts.query.userId = currentUser.id || currentUser._id;

      // Reconnecter pour appliquer les nouveaux paramètres
      if (socket.connected) {
        socket.disconnect();
      }
      socket.connect();
    }

    // Nettoyer tous les anciens écouteurs pour éviter les duplications
    socket.off();

    // Écouter les événements de connexion/déconnexion
    socket.on("connect", () => {
      debugLog("Connecté au serveur socket.io, ID socket", socket.id);

      // Une fois connecté, rejoindre le chat avec l'ID utilisateur
      socket.emit("join", {
        userId: getUserId(currentUser),
      });

      // Demander immédiatement la liste des utilisateurs
      socket.emit("getUsers");
    });

    socket.on("disconnect", () => {
      debugLog("Déconnecté du serveur socket.io");
    });

    // Écouter la liste des utilisateurs en ligne
    socket.on("userList", (onlineUsersList) => {
      if (Array.isArray(onlineUsersList)) {
        setOnlineUsers(onlineUsersList.map((user) => user._id || user.id || user.userId));
      }
    });

    // Alternative: écouter l'événement online_users
    socket.on("online_users", (onlineUsersList) => {
      if (Array.isArray(onlineUsersList)) {
        setOnlineUsers(onlineUsersList.map((user) => user.userId || user.id || user._id));
      }
    });

    // Fonction de traitement des messages pour éviter la duplication de code
    const handleIncomingMessage = (data) => {
      debugLog("Message reçu:", data);

      // Normaliser les champs du message
      const normalizedMessage = {
        _id: data._id || data.id || `temp-${Date.now()}`,
        id: data._id || data.id || `temp-${Date.now()}`,
        senderId: data.senderId,
        receiverId: data.receiverId || data.recipientId,
        message: data.content || data.message || "",
        timestamp: data.timestamp || data.createdAt || new Date().toISOString(),
        status: data.status || "delivered",
        seen: data.seen || false,
      };

      // Si c'est un message provenant du même utilisateur, le marquer comme envoyé
      if (normalizedMessage.senderId === getUserId(currentUser)) {
        setMessages((prev) => {
          const prevMessages = prev[normalizedMessage.receiverId] || [];

          // Vérifier si le message existe déjà
          const messageExists = prevMessages.some(
            (msg) => msg._id === normalizedMessage._id || msg.id === normalizedMessage.id
          );

          if (messageExists) {
            // Mettre à jour le statut du message existant
            return {
              ...prev,
              [normalizedMessage.receiverId]: prevMessages.map((msg) => {
                if (msg._id === normalizedMessage._id || msg.id === normalizedMessage.id) {
                  return { ...msg, status: normalizedMessage.status };
                }
                return msg;
              }),
            };
          }

          // Ajouter un nouveau message
          return {
            ...prev,
            [normalizedMessage.receiverId]: [...prevMessages, normalizedMessage],
          };
        });

        return;
      }

      // Message d'un autre utilisateur
      if (selectedUser && normalizedMessage.senderId === getUserId(selectedUser)) {
        setMessages((prev) => {
          const prevMessages = prev[getUserId(selectedUser)] || [];

          // Vérifier si le message existe déjà
          const messageExists = prevMessages.some(
            (msg) => msg._id === normalizedMessage._id || msg.id === normalizedMessage.id
          );

          if (messageExists) {
            return prev;
          }

          // Ajouter le message
          const updatedMessages = {
            ...prev,
            [getUserId(selectedUser)]: [...prevMessages, normalizedMessage],
          };

          return updatedMessages;
        });

        scrollToBottom();

        // Marquer comme lu
        socket.emit("mark_read", {
          messageId: normalizedMessage._id || normalizedMessage.id,
        });
      } else {
        // Message d'un utilisateur non sélectionné
        const sender = users.find((user) => getUserId(user) === normalizedMessage.senderId);

        if (sender) {
          // Stocker le message
          setMessages((prev) => {
            const senderId = getUserId(sender);
            const prevMessages = prev[senderId] || [];

            // Vérifier si le message existe déjà
            const messageExists = prevMessages.some(
              (msg) => msg._id === normalizedMessage._id || msg.id === normalizedMessage.id
            );

            if (messageExists) {
              return prev;
            }

            // Ajouter le message
            return {
              ...prev,
              [senderId]: [...prevMessages, normalizedMessage],
            };
          });

          // Notification
          setNotification({
            message: `Nouveau message de ${sender.firstName} ${sender.lastName}`,
            id: sender.id || sender._id,
          });
        } else {
          // Utilisateur inconnu, essayer de le récupérer
          fetchUsers();
        }
      }
    };

    // Écouter les deux formats possibles de messages
    socket.on("receiveMessage", handleIncomingMessage);
    socket.on("message", handleIncomingMessage);

    // Écouter l'indicateur de frappe
    socket.on("userTyping", (data) => {
      if (data.senderId && selectedUser && data.senderId === getUserId(selectedUser)) {
        setTypingStatus(`${selectedUser.firstName} est en train d'écrire...`);

        // Effacer après un délai
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        const timeout = setTimeout(() => setTypingStatus(null), 3000);
        typingTimeoutRef.current = timeout;
      }
    });

    // Message status updates
    socket.on("messageStatus", (data) => {
      if (data.messageId) {
        setMessages((prev) => {
          const updatedMessages = { ...prev };

          // Parcourir tous les utilisateurs pour trouver le message
          for (const userId in updatedMessages) {
            const userMessages = updatedMessages[userId];
            const messageIndex = userMessages.findIndex(
              (msg) => msg._id === data.messageId || msg.id === data.messageId
            );

            if (messageIndex >= 0) {
              // Mise à jour du statut du message
              userMessages[messageIndex] = {
                ...userMessages[messageIndex],
                status: data.status,
                seen: data.status === "read",
              };
              break;
            }
          }

          return updatedMessages;
        });
      }
    });

    // Tentative pour récupérer les utilisateurs réels de la base de données MongoDB
    const fetchRealUsers = async () => {
      try {
        debugLog("Tentative de récupération des utilisateurs inscrits depuis MongoDB");

        // Faire une requête à l'API qui expose la collection users de MongoDB
        const response = await axios.get("http://localhost:5000/api/signup");
        debugLog("Réponse de MongoDB pour les utilisateurs", response.data);

        if (response.data && Array.isArray(response.data)) {
          // Formater les utilisateurs depuis MongoDB pour l'interface
          const formattedUsers = response.data.map((user) => ({
            id: user._id,
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
            email: user.email || "",
            avatar: user.avatar || "https://randomuser.me/api/portraits/lego/1.jpg", // Avatar par défaut si aucun disponible
            title: user.professional?.title || "Utilisateur",
            isOnline: user.isOnline || false,
            lastSeen: user.lastSeen,
            isMentor: user.roles?.includes("mentor") || false,
          }));

          debugLog("Utilisateurs inscrits formatés", formattedUsers);

          if (formattedUsers.length > 0) {
            setRealUsers(formattedUsers);
            const combinedUsers = [...formattedUsers, ...mockMentors];
            setUsers(combinedUsers);
            setIsLoading(false);
            setError(null);
            return true; // Succès
          } else {
            debugLog("La base de données ne contient pas d'utilisateurs inscrits");
          }
        } else {
          debugLog("Le format des données reçues n'est pas un tableau d'utilisateurs");
        }
        return false; // Échec
      } catch (error) {
        debugLog("Erreur lors de la récupération des utilisateurs inscrits", error);
        return false; // Échec
      }
    };

    const init = async () => {
      // Essayer d'abord de récupérer les utilisateurs réels
      const success = await fetchRealUsers();

      // Si échec, utiliser les données mockées améliorées
      if (!success) {
        debugLog("Utilisation des données mockées améliorées pour la messagerie");
        setRealUsers(mockUsers);
        setIsLoading(false);
        // Mettre à jour la liste combinée
        const combinedUsers = [...mockUsers, ...mockMentors];
        setUsers(combinedUsers);
        setError(
          "Données de démonstration pour la messagerie. Les utilisateurs et mentors sont simulés."
        );
      }
    };

    init();

    return () => {
      // Nettoyer les écouteurs lors du démontage du composant
      socket.off();
    };
  }, [currentUser, selectedUser, users, onlineUsers]);

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    if (value) {
      // Filtrer les utilisateurs et les mentors séparément
      const filteredUsers =
        realUsers.length > 0
          ? realUsers.filter(
              (user) =>
                user.name.toLowerCase().includes(value) ||
                (user.email && user.email.toLowerCase().includes(value)) ||
                (user.title && user.title.toLowerCase().includes(value))
            )
          : mockUsers.filter(
              (user) =>
                user.name.toLowerCase().includes(value) ||
                (user.email && user.email.toLowerCase().includes(value)) ||
                (user.title && user.title.toLowerCase().includes(value))
            );

      const filteredMentors = mockMentors.filter(
        (mentor) =>
          mentor.name.toLowerCase().includes(value) ||
          (mentor.title && mentor.title.toLowerCase().includes(value))
      );

      setUsers([...filteredUsers, ...filteredMentors]);
    } else {
      // Réinitialiser la liste si la recherche est vide
      const baseUsers = realUsers.length > 0 ? realUsers : mockUsers;
      setUsers([...baseUsers, ...mockMentors]);
    }
  };

  useEffect(() => {
    if (selectedUser) {
      // Trouver d'abord la conversation avec cet utilisateur
      axios
        .get(`http://localhost:5000/api/messages/conversations`, {
          headers: {
            Authorization: `Bearer ${
              sessionStorage.getItem("authToken") || localStorage.getItem("token")
            }`,
          },
        })
        .then((res) => {
          if (res.data.success) {
            // Chercher la conversation avec l'utilisateur sélectionné
            const conversation = res.data.conversations.find((conv) =>
              conv.participants.some((p) => p.id === selectedUser.id)
            );

            if (conversation) {
              // Récupérer les messages de cette conversation
              return axios.get(
                `http://localhost:5000/api/messages/conversations/${conversation.id}/messages`,
                {
                  headers: {
                    Authorization: `Bearer ${
                      sessionStorage.getItem("authToken") || localStorage.getItem("token")
                    }`,
                  },
                }
              );
            } else {
              // Pas de conversation existante, retourner un tableau vide
              return { data: { success: true, messages: [] } };
            }
          } else {
            throw new Error("Échec de récupération des conversations");
          }
        })
        .then((res) => {
          if (res.data.success) {
            setMessages((prev) => ({
              ...prev,
              [selectedUser.id]: res.data.messages,
            }));
          } else {
            console.error("Erreur lors de la récupération des messages:", res.data.error);
          }
        })
        .catch((err) => console.error("Erreur lors de la récupération des messages:", err));
    }
  }, [selectedUser]);

  useEffect(() => {
    if (selectedUser) {
      // Simulation d'historique de messages (pour les besoins de la démo)
      if (!messages[selectedUser.id]) {
        const randomMessages = [];

        // Générer un historique aléatoire de 0 à 5 messages
        const historyLength = Math.floor(Math.random() * 6);
        const nowTime = new Date();

        // Messages génériques
        const userMessages = [
          "Bonjour, comment allez-vous ?",
          "J'aurais besoin de votre aide sur un projet.",
          "Pouvez-vous me donner votre avis sur une idée ?",
          "Merci pour votre aide précédente !",
          "Quand seriez-vous disponible pour une réunion ?",
          "Avez-vous vu les dernières mises à jour ?",
          "Je travaille actuellement sur un nouveau projet passionnant.",
        ];

        // Réponses génériques
        const responseMessages = [
          "Bonjour ! Je vais bien, merci. Et vous ?",
          "Bien sûr, en quoi puis-je vous aider ?",
          "Avec plaisir, partagez votre idée.",
          "De rien, n'hésitez pas si besoin !",
          "Je suis disponible la semaine prochaine.",
          "Oui, les changements sont intéressants.",
          "Ça a l'air passionnant, dites-m'en plus !",
        ];

        // Ajouter des messages à l'historique
        for (let i = 0; i < historyLength; i++) {
          // Créer des messages alternés (un de l'utilisateur, un de la réponse)
          const timeOffset = (historyLength - i) * 15 * 60 * 1000; // 15 minutes par message
          const msgTime = new Date(nowTime.getTime() - timeOffset);

          // Message de l'utilisateur actuel
          if (i % 2 === 0) {
            randomMessages.push({
              id: `history-${selectedUser.id}-${i}-a`,
              senderId: currentUser.id,
              receiverId: selectedUser.id,
              message: userMessages[Math.floor(Math.random() * userMessages.length)],
              timestamp: msgTime.toISOString(),
              status: "read",
              seen: true,
            });
          }
          // Réponse du contact
          else {
            randomMessages.push({
              id: `history-${selectedUser.id}-${i}-b`,
              senderId: selectedUser.id,
              receiverId: currentUser.id,
              message: responseMessages[Math.floor(Math.random() * responseMessages.length)],
              timestamp: msgTime.toISOString(),
              status: "read",
              seen: true,
            });
          }
        }

        // Si l'utilisateur est un mentor, ajouter un message de bienvenue spécifique
        if (selectedUser.isMentor && historyLength === 0) {
          randomMessages.push({
            id: `welcome-${selectedUser.id}`,
            senderId: selectedUser.id,
            receiverId: currentUser.id,
            message: `Bonjour ${currentUser.firstName || ""},\n\nJe suis ${
              selectedUser.firstName
            } ${selectedUser.lastName}, ${
              selectedUser.title
            }.\n\nN'hésitez pas à me poser vos questions professionnelles.`,
            timestamp: new Date(nowTime.getTime() - 30 * 60 * 1000).toISOString(),
            status: "read",
            seen: true,
          });
        }

        // Mettre à jour l'état des messages
        setMessages((prev) => ({
          ...prev,
          [selectedUser.id]: randomMessages,
        }));

        // Faire défiler vers le bas après un court délai
        setTimeout(scrollToBottom, 100);
      }
    }
  }, [selectedUser]);

  const handleSend = async (customContent = null) => {
    const messageContent = customContent || message.trim();
    if ((!messageContent && !file) || !selectedUser) return;

    try {
      // Déterminer si le message est un objet JSON (lien ou article)
      let messageObject = messageContent;
      let messageType = "text";
      let displayText = messageContent;

      try {
        if (typeof messageContent === "string" && messageContent.startsWith("{")) {
          const parsedContent = JSON.parse(messageContent);
          if (parsedContent.type === "link") {
            messageType = "link";
            displayText = `🔗 ${parsedContent.title}`;
            messageObject = parsedContent;
          } else if (parsedContent.type === "article") {
            messageType = "article";
            displayText = `📄 ${parsedContent.title}`;
            messageObject = parsedContent;
          }
        }
      } catch (e) {
        // Si le parsing échoue, traiter comme un message texte normal
        messageType = "text";
        displayText = messageContent;
      }

      // Créer un nouvel objet message
      const newMessage = {
        id: Date.now().toString(),
        senderId: getUserId(currentUser),
        receiverId: getUserId(selectedUser),
        message: displayText,
        messageType: messageType,
        messageObject: messageType !== "text" ? messageObject : null,
        timestamp: new Date().toISOString(),
        status: "sent",
        seen: false,
      };

      // Mettre à jour l'interface avec le nouveau message
      setMessages((prev) => {
        const prevMessages = prev[getUserId(selectedUser)] || [];
        return {
          ...prev,
          [getUserId(selectedUser)]: [...prevMessages, newMessage],
        };
      });

      // Émettre le message via socket.io
      socket.emit("sendMessage", {
        senderId: getUserId(currentUser),
        receiverId: getUserId(selectedUser),
        message: displayText,
        content: displayText,
        messageType: messageType,
        messageObject: messageType !== "text" ? messageObject : null,
      });

      // Envoyer via API
      try {
        await axios.post(
          "http://localhost:5000/api/messages",
          {
            senderId: getUserId(currentUser),
            receiverId: getUserId(selectedUser),
            message: displayText,
            content: displayText,
            messageType: messageType,
            messageObject: messageType !== "text" ? JSON.stringify(messageObject) : null,
          },
          {
            headers: {
              Authorization: `Bearer ${
                sessionStorage.getItem("authToken") || localStorage.getItem("token")
              }`,
            },
          }
        );
      } catch (error) {
        console.error("API message non disponible:", error);
      }

      // Réinitialiser le champ de message
      if (!customContent) {
        setMessage("");
      }
      
      scrollToBottom();
    } catch (err) {
      console.error("Erreur lors de l'envoi du message:", err);
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      
      // Si un fichier est sélectionné, préparer l'envoi automatique
      if (selectedUser) {
        // Créer un FormData pour envoyer le fichier
        const formData = new FormData();
        formData.append("file", selected);
        formData.append("senderId", getUserId(currentUser));
        formData.append("receiverId", getUserId(selectedUser));
        
        // Envoyer le fichier immédiatement
        handleSendFile(formData);
      }
    }
  };

  const handleSendFile = async (formData) => {
    try {
      // Message temporaire indiquant l'envoi du fichier
      const tempMessage = {
        id: Date.now().toString(),
        senderId: getUserId(currentUser),
        receiverId: getUserId(selectedUser),
        message: `Envoi du fichier: ${formData.get("file").name}...`,
        timestamp: new Date().toISOString(),
        status: "sending",
        seen: false,
        isFile: true,
      };
      
      // Afficher le message temporaire
      setMessages((prev) => {
        const prevMessages = prev[getUserId(selectedUser)] || [];
        return {
          ...prev,
          [getUserId(selectedUser)]: [...prevMessages, tempMessage],
        };
      });
      
      // Envoyer le fichier au serveur
      const response = await axios.post(
        "http://localhost:5000/api/messages/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${
              sessionStorage.getItem("authToken") || localStorage.getItem("token")
            }`,
          },
        }
      );
      
      // Mettre à jour le message avec l'URL du fichier
      if (response.data && response.data.fileUrl) {
        const fileMessage = {
          id: Date.now().toString(),
          senderId: getUserId(currentUser),
          receiverId: getUserId(selectedUser),
          message: `Fichier: ${formData.get("file").name}`,
          fileUrl: response.data.fileUrl,
          timestamp: new Date().toISOString(),
          status: "sent",
          seen: false,
        };
        
        // Remplacer le message temporaire par le message final
        setMessages((prev) => {
          const prevMessages = prev[getUserId(selectedUser)] || [];
          // Filtrer le message temporaire
          const filteredMessages = prevMessages.filter(msg => !msg.isFile);
          return {
            ...prev,
            [getUserId(selectedUser)]: [...filteredMessages, fileMessage],
          };
        });
        
        // Envoyer l'info du fichier via socket
        socket.emit("sendMessage", {
          senderId: getUserId(currentUser),
          receiverId: getUserId(selectedUser),
          message: `Fichier: ${formData.get("file").name}`,
          fileUrl: response.data.fileUrl,
        });
        
        scrollToBottom();
      }
    } catch (err) {
      console.error("Erreur lors de l'envoi du fichier:", err);
      // Message d'erreur
      setMessages((prev) => {
        const prevMessages = prev[getUserId(selectedUser)] || [];
        // Filtrer les messages temporaires d'envoi de fichier
        const filteredMessages = prevMessages.filter(msg => !msg.isFile);
        return {
          ...prev,
          [getUserId(selectedUser)]: [...filteredMessages],
        };
      });
    } finally {
      setFile(null);
    }
  };

  const handleTyping = (e) => {
    // Envoyer l'événement de frappe seulement si l'utilisateur est en train de taper
    // et s'il y a un utilisateur sélectionné
    if (selectedUser) {
      if (e.key !== "Enter") {
        socket.emit("typing", {
          receiverId: selectedUser.id,
          isTyping: true,
        });

        // Réinitialiser le statut de frappe après un délai
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        const timeout = setTimeout(() => {
          socket.emit("typing", {
            receiverId: selectedUser.id,
            isTyping: false,
          });
        }, 2000);

        typingTimeoutRef.current = timeout;
      } else if (e.key === "Enter" && !e.shiftKey) {
        // Envoyer le message sur Entrée sans Shift
        e.preventDefault();
        handleSend();
      }
    }
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
  };

  const handleBackToUsers = () => {
    setSelectedUser(null);
  };

  const getLastMessagePreview = (userId) => {
    const userMessages = messages[userId] || [];
    if (userMessages.length === 0) return "";
    const lastMsg = userMessages[userMessages.length - 1];
    if (lastMsg.fileUrl && !lastMsg.message) return "Sent a file 📎";
    return lastMsg.message || "";
  };

  const isOnline = (userId) => {
    return onlineUsers.some((id) => id === userId || id === getUserId({ id: userId }));
  };

  const isImageFile = (url) => {
    const ext = url.split(".").pop().toLowerCase();
    return ["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(ext);
  };

  // Fonction pour fermer la notification
  const handleCloseNotification = () => {
    setNotification(null);
  };

  // Fonction pour ouvrir la conversation à partir de la notification
  const handleNotificationClick = () => {
    if (notification) {
      const sender = users.find((user) => user.id === notification.id);
      if (sender) {
        setSelectedUser(sender);
        setNotification(null);
      }
    }
  };

  // Fonction pour tester l'envoi d'un message à un utilisateur spécifique par son ID
  const testMessageToUser = (recipientId) => {
    if (!recipientId || !currentUser) return;

    debugLog("Test d'envoi de message à", recipientId);

    // Créer un message de test
    const testMessage = {
      senderId: getUserId(currentUser),
      receiverId: recipientId,
      message: `Message de test [${new Date().toLocaleTimeString()}]`,
      fileUrl: null,
    };

    // Envoyer via socket.io
    socket.emit("sendMessage", testMessage);

    // Ajouter un message visuel dans l'interface
    setError(`Message de test envoyé à l'utilisateur ID: ${recipientId}`);
    setTimeout(() => setError(null), 3000);
  };

  // Fonction pour afficher l'état de la session
  const debugSocketState = () => {
    const debugInfo = {
      socketConnected: socket.connected,
      socketId: socket.id,
      currentUserId: currentUser ? getUserId(currentUser) : null,
      registeredUserId: socket.io.opts.query.userId,
      onlineUsers: onlineUsers,
      realUsers: realUsers.map((u) => ({ id: getUserId(u), name: u.name })),
      allUsers: users.map((u) => ({ id: getUserId(u), name: u.name })),
    };

    debugLog("État actuel de la session", debugInfo);
    setError(
      `Socket connecté: ${debugInfo.socketConnected}, users: ${debugInfo.allUsers.length}, online: ${debugInfo.onlineUsers.length}`
    );
    setTimeout(() => setError(null), 5000);

    return debugInfo;
  };

  // Style uniforme pour la liste d'utilisateurs
  const userListStyle = {
    maxHeight: "calc(100vh - 210px)",
    overflowY: "auto",
    padding: 0,
  };

  // Fonction pour afficher la bonne icône de statut pour les messages
  const renderMessageStatus = (message) => {
    if (message.senderId !== getUserId(currentUser)) return null;

    if (message.seen || message.status === "read") {
      return <DoneAllIcon style={{ fontSize: "18px", color: "blue" }} />;
    } else if (message.status === "delivered") {
      return <DoneAllIcon style={{ fontSize: "18px", color: "gray" }} />;
    } else {
      return <DoneIcon style={{ fontSize: "18px", color: "gray" }} />;
    }
  };

  // Fonction de gestion du bouton de partage
  const handleShareButtonClick = (event) => {
    setShareMenuAnchor(event.currentTarget);
  };

  // Fermeture du menu de partage
  const handleShareMenuClose = () => {
    setShareMenuAnchor(null);
  };

  // Ouverture du dialogue de partage de lien
  const handleOpenLinkDialog = () => {
    setLinkDialogOpen(true);
    handleShareMenuClose();
  };

  // Ouverture du dialogue d'article
  const handleOpenArticleDialog = () => {
    setArticleDialogOpen(true);
    handleShareMenuClose();
  };

  // Gestion du partage de fichier
  const handleShareFile = () => {
    fileInputRef.current.click();
    handleShareMenuClose();
  };

  // Fermeture des dialogues
  const handleCloseLinkDialog = () => {
    setLinkDialogOpen(false);
    setLinkUrl("");
    setLinkTitle("");
  };

  const handleCloseArticleDialog = () => {
    setArticleDialogOpen(false);
    setArticleTitle("");
    setArticleContent("");
    setArticleUrl("");
  };

  // Envoi d'un lien
  const handleSendLink = () => {
    if (linkUrl.trim()) {
      const linkMessage = {
        type: "link",
        url: linkUrl,
        title: linkTitle || linkUrl,
      };
      handleSend(JSON.stringify(linkMessage));
      handleCloseLinkDialog();
    }
  };

  // Envoi d'un article
  const handleSendArticle = () => {
    if (articleTitle.trim() && (articleContent.trim() || articleUrl.trim())) {
      const articleMessage = {
        type: "article",
        title: articleTitle,
        content: articleContent,
        url: articleUrl,
      };
      handleSend(JSON.stringify(articleMessage));
      handleCloseArticleDialog();
    }
  };

  // Fonction modifiée pour afficher les différents types de messages
  const renderMessage = (msg) => {
    if (msg.fileUrl) {
      // Affichage des fichiers
      if (isImageFile(msg.fileUrl)) {
        return (
          <img
            src={`http://localhost:5000/${msg.fileUrl}`}
            alt="attachment"
            style={{ maxWidth: "70%", borderRadius: "12px", marginBottom: "4px" }}
          />
        );
      } else {
        return (
          <a
            href={`http://localhost:5000/${msg.fileUrl}`}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "inline-block",
              color: "#007bff",
              textDecoration: "underline",
              wordBreak: "break-word",
              fontSize: "14px",
              padding: "6px 10px",
              backgroundColor:
                msg.senderId === getUserId(currentUser) ? "#daf1ff" : "#ffffff",
              borderRadius: "12px",
              maxWidth: "70%",
            }}
          >
            <InsertDriveFileIcon style={{ verticalAlign: "middle", marginRight: "5px" }} />
            {msg.fileUrl.split("/").pop()}
          </a>
        );
      }
    } else if (msg.messageType === "link" || (msg.message && msg.message.startsWith("🔗"))) {
      // Affichage des liens
      let linkData = msg.messageObject;
      if (!linkData && msg.message.startsWith("🔗")) {
        try {
          // Essayer de récupérer les données du lien depuis la base de données
          linkData = { title: msg.message.substring(2).trim(), url: "#" };
        } catch (e) {
          linkData = { title: msg.message, url: "#" };
        }
      }
      
      return (
        <a
          href={linkData?.url || "#"}
          target="_blank"
          rel="noreferrer"
          style={{
            display: "inline-block",
            padding: "10px 15px",
            backgroundColor: msg.senderId === getUserId(currentUser) ? "#daf1ff" : "#ffffff",
            borderRadius: "12px",
            maxWidth: "70%",
            textDecoration: "none",
            color: "inherit",
            border: "1px solid #e0e0e0",
          }}
        >
          <Box display="flex" alignItems="center">
            <LinkIcon style={{ marginRight: "8px", color: "#1976d2" }} />
            <Typography variant="body2">{linkData?.title || msg.message}</Typography>
          </Box>
        </a>
      );
    } else if (msg.messageType === "article" || (msg.message && msg.message.startsWith("📄"))) {
      // Affichage des articles
      let articleData = msg.messageObject;
      if (!articleData && msg.message.startsWith("📄")) {
        try {
          // Essayer de récupérer les données de l'article depuis la base de données
          articleData = { 
            title: msg.message.substring(2).trim(),
            content: "Contenu non disponible",
            url: "#" 
          };
        } catch (e) {
          articleData = { 
            title: msg.message, 
            content: "Contenu non disponible",
            url: "#" 
          };
        }
      }
      
      return (
        <Box
          style={{
            display: "inline-block",
            padding: "10px 15px",
            backgroundColor: msg.senderId === getUserId(currentUser) ? "#daf1ff" : "#ffffff",
            borderRadius: "12px",
            maxWidth: "300px",
            border: "1px solid #e0e0e0",
            textAlign: "left",
          }}
        >
          <Box display="flex" alignItems="center" mb={1}>
            <ArticleIcon style={{ marginRight: "8px", color: "#1976d2" }} />
            <Typography variant="subtitle2" component="div">
              {articleData?.title || msg.message}
            </Typography>
          </Box>
          
          {articleData?.content && (
            <Typography
              variant="body2"
              color="text.secondary"
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                margin: "5px 0",
              }}
            >
              {articleData.content}
            </Typography>
          )}
          
          {articleData?.url && (
            <a 
              href={articleData.url}
              target="_blank"
              rel="noreferrer"
              style={{ color: "#1976d2", fontSize: "12px", textDecoration: "none" }}
            >
              Lire l'article complet
            </a>
          )}
        </Box>
      );
    } else {
      // Message texte standard
      return (
        <Typography
          variant="body2"
          style={{
            display: "inline-block",
            padding: "8px 12px",
            backgroundColor:
              msg.senderId === getUserId(currentUser) ? "#daf1ff" : "#ffffff",
            borderRadius: "12px",
            maxWidth: "70%",
            wordBreak: "break-word",
          }}
        >
          {msg.message}
        </Typography>
      );
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      {/* Notification de nouveaux messages */}
      <Snackbar
        open={notification !== null}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity="info"
          sx={{ width: "100%", cursor: "pointer" }}
          onClick={handleNotificationClick}
        >
          <strong>{notification?.sender}</strong>: {notification?.message}
        </Alert>
      </Snackbar>

      <Grid container spacing={0} style={{ height: "calc(100vh - 80px)" }}>
        {!selectedUser ? (
          <Grid item xs={12}>
            <Card style={{ height: "100%", overflowY: "auto" }}>
              <Box p={2} borderBottom="1px solid #ddd">
                <Typography variant="h6">Messagerie</Typography>
                <TextField
                  placeholder="Rechercher un utilisateur..."
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  size="small"
                  value={searchTerm}
                  onChange={handleSearch}
                />
                {error && (
                  <Box
                    mt={1}
                    p={1.5}
                    bgcolor="#fff3cd"
                    color="#856404"
                    borderRadius={1}
                    border="1px solid #ffeeba"
                  >
                    <Typography variant="body2">{error}</Typography>
                  </Box>
                )}

                {/* Boutons de debug */}
                <Box mt={1} display="flex" gap={1}>
                  <Button
                    variant="outlined"
                    size="small"
                    color="primary"
                    onClick={debugSocketState}
                  >
                    État Session
                  </Button>
                </Box>
              </Box>
              <List style={userListStyle}>
                {isLoading ? (
                  <Box display="flex" justifyContent="center" alignItems="center" p={4}>
                    <Typography>Chargement des utilisateurs...</Typography>
                  </Box>
                ) : users.length > 0 ? (
                  users.map((user) => (
                    <ListItem
                      key={getUserId(user)}
                      button
                      onClick={() => handleSelectUser(user)}
                      secondaryAction={
                        getUserId(user) !== getUserId(currentUser) && (
                          <IconButton
                            edge="end"
                            aria-label="test"
                            onClick={(e) => {
                              e.stopPropagation();
                              testMessageToUser(getUserId(user));
                            }}
                          >
                            <MessageIcon fontSize="small" />
                          </IconButton>
                        )
                      }
                    >
                      <ListItemAvatar>
                        <Badge
                          color="success"
                          variant="dot"
                          overlap="circular"
                          invisible={!onlineUsers.some((id) => id === getUserId(user))}
                          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                        >
                          <Avatar src={user.avatar || undefined}>
                            {!user.avatar && (user.firstName?.[0] || "U")}
                          </Avatar>
                        </Badge>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center">
                            <Typography variant="body1">
                              {user.name || `${user.firstName} ${user.lastName}`}
                            </Typography>
                            {user.isMentor && (
                              <Box
                                ml={1}
                                p={0.5}
                                bgcolor="#e3f2fd"
                                borderRadius={1}
                                height="fit-content"
                              >
                                <Typography variant="caption" color="primary">
                                  Mentor
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        }
                        secondary={
                          <>
                            {user.title && (
                              <Typography variant="body2" color="textSecondary">
                                {user.title}
                              </Typography>
                            )}
                            {user.isMentor && user.expertise && user.expertise.length > 0 && (
                              <Box mt={0.5} display="flex" flexWrap="wrap" gap={0.5}>
                                {user.expertise.slice(0, 2).map((specialty, idx) => (
                                  <Box
                                    key={idx}
                                    bgcolor="#f5f5f5"
                                    px={0.8}
                                    py={0.3}
                                    borderRadius={1}
                                  >
                                    <Typography variant="caption">{specialty}</Typography>
                                  </Box>
                                ))}
                                {user.expertise.length > 2 && (
                                  <Typography variant="caption">
                                    +{user.expertise.length - 2}
                                  </Typography>
                                )}
                              </Box>
                            )}
                            {!user.isMentor && getLastMessagePreview(getUserId(user)) && (
                              <Typography variant="body2" color="textSecondary" noWrap>
                                {getLastMessagePreview(getUserId(user))}
                              </Typography>
                            )}
                          </>
                        }
                      />
                    </ListItem>
                  ))
                ) : (
                  <Box p={3} textAlign="center">
                    <Typography color="textSecondary">Aucun utilisateur trouvé</Typography>
                  </Box>
                )}
              </List>
            </Card>
          </Grid>
        ) : (
          <Grid item xs={12}>
            <Card style={{ height: "100%", display: "flex", flexDirection: "column" }}>
              {/* Top Bar */}
              <Box p={2} borderBottom="1px solid #ddd" display="flex" alignItems="center">
                <IconButton onClick={handleBackToUsers}>
                  <ArrowBackIcon />
                </IconButton>
                <Avatar
                  src={selectedUser.avatar || undefined}
                  sx={{
                    ml: 1,
                    bgcolor: selectedUser.isMentor ? "primary.main" : "grey.500",
                    width: 40,
                    height: 40,
                  }}
                >
                  {!selectedUser.avatar && (selectedUser.firstName?.[0] || "U")}
                </Avatar>
                <Box ml={2} flex={1}>
                  <Typography variant="h6">
                    {selectedUser.name || `${selectedUser.firstName} ${selectedUser.lastName}`}
                    {selectedUser.isMentor && (
                      <Box
                        component="span"
                        ml={1}
                        p={0.5}
                        bgcolor="#e3f2fd"
                        borderRadius={1}
                        display="inline-block"
                        fontSize="0.75rem"
                      >
                        Mentor
                      </Box>
                    )}
                  </Typography>
                  <Box display="flex" alignItems="center">
                    {onlineUsers.some((id) => id === getUserId(selectedUser)) ? (
                      <Typography
                        variant="caption"
                        color="success.main"
                        sx={{ display: "flex", alignItems: "center" }}
                      >
                        <Box
                          component="span"
                          sx={{
                            width: 8,
                            height: 8,
                            bgcolor: "success.main",
                            borderRadius: "50%",
                            display: "inline-block",
                            mr: 0.5,
                          }}
                        />
                        En ligne
                      </Typography>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        Hors ligne
                      </Typography>
                    )}
                    {selectedUser.title && (
                      <Typography variant="caption" color="text.secondary" ml={1}>
                        • {selectedUser.title}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>

              {/* Mentor Info Banner - Displayed only for mentors */}
              {selectedUser.isMentor && (
                <Box
                  p={1.5}
                  bgcolor="primary.light"
                  color="primary.contrastText"
                  borderBottom="1px solid rgba(0, 0, 0, 0.12)"
                >
                  <Typography variant="body2">
                    {selectedUser.expertise && selectedUser.expertise.length > 0 ? (
                      <>Spécialités: {selectedUser.expertise.join(", ")}</>
                    ) : (
                      <>Vous discutez avec un mentor professionnel.</>
                    )}
                  </Typography>
                </Box>
              )}

              {/* Messages */}
              <Box flex={1} p={2} style={{ overflowY: "auto", backgroundColor: "#f4f6f8" }}>
                {(messages[getUserId(selectedUser)] || []).map((msg, i) => (
                  <Box
                    key={i}
                    textAlign={msg.senderId === getUserId(currentUser) ? "right" : "left"}
                    mb={2}
                  >
                    {renderMessage(msg)}
                    <Box mt={0.5}>{renderMessageStatus(msg)}</Box>
                  </Box>
                ))}
                <div ref={messagesEndRef} />
              </Box>

              {/* Typing Indicator */}
              {typingStatus && (
                <Box pl={2} pb={1}>
                  <Typography variant="caption" color="textSecondary">
                    {typingStatus}
                  </Typography>
                </Box>
              )}

              {/* Mentor Help Text - Only for first message to a mentor */}
              {selectedUser &&
                selectedUser.isMentor &&
                (!messages[getUserId(selectedUser)] ||
                  messages[getUserId(selectedUser)].length === 0) && (
                  <Box p={2} bgcolor="#f0f7ff">
                    <Typography variant="body2" color="primary">
                      <strong>Conseil:</strong> Présentez clairement votre question ou besoin
                      professionnel pour aider le mentor à vous répondre efficacement.
                    </Typography>
                  </Box>
                )}

              <Divider />

              {/* Message Input */}
              <Box p={2} display="flex" alignItems="center">
                <TextField
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleTyping}
                  placeholder="Tapez votre message..."
                  variant="outlined"
                  fullWidth
                  size="small"
                />
                <IconButton
                  onClick={handleShareButtonClick}
                  style={{ marginLeft: "8px" }}
                  color="primary"
                >
                  <ShareIcon />
                </IconButton>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleSend()}
                  style={{ marginLeft: "8px" }}
                  disabled={!message.trim()}
                >
                  Envoyer
                </Button>
                
                {/* Menu de partage */}
                <Menu
                  anchorEl={shareMenuAnchor}
                  open={Boolean(shareMenuAnchor)}
                  onClose={handleShareMenuClose}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                >
                  <MenuItem onClick={handleShareFile}>
                    <AttachFileIcon fontSize="small" style={{ marginRight: 8 }} />
                    Partager un fichier
                  </MenuItem>
                  <MenuItem onClick={handleOpenLinkDialog}>
                    <LinkIcon fontSize="small" style={{ marginRight: 8 }} />
                    Partager un lien
                  </MenuItem>
                  <MenuItem onClick={handleOpenArticleDialog}>
                    <ArticleIcon fontSize="small" style={{ marginRight: 8 }} />
                    Partager un article
                  </MenuItem>
                </Menu>
              </Box>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Boîte de dialogue pour ajouter un lien */}
      <Dialog open={linkDialogOpen} onClose={handleCloseLinkDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Partager un lien
          <IconButton
            aria-label="close"
            onClick={handleCloseLinkDialog}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="URL du lien"
            type="url"
            fullWidth
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://example.com"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LinkIcon />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            margin="dense"
            label="Titre du lien (optionnel)"
            type="text"
            fullWidth
            value={linkTitle}
            onChange={(e) => setLinkTitle(e.target.value)}
            placeholder="Titre descriptif du lien"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseLinkDialog}>Annuler</Button>
          <Button onClick={handleSendLink} color="primary" variant="contained" disabled={!linkUrl.trim()}>
            Partager
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Boîte de dialogue pour ajouter un article */}
      <Dialog open={articleDialogOpen} onClose={handleCloseArticleDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Partager un article
          <IconButton
            aria-label="close"
            onClick={handleCloseArticleDialog}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Titre de l'article"
            type="text"
            fullWidth
            value={articleTitle}
            onChange={(e) => setArticleTitle(e.target.value)}
            placeholder="Titre de l'article"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <ArticleIcon />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            margin="dense"
            label="Contenu de l'article (optionnel)"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={articleContent}
            onChange={(e) => setArticleContent(e.target.value)}
            placeholder="Résumé ou contenu de l'article"
          />
          <TextField
            margin="dense"
            label="URL de l'article (optionnel)"
            type="url"
            fullWidth
            value={articleUrl}
            onChange={(e) => setArticleUrl(e.target.value)}
            placeholder="https://example.com/article"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseArticleDialog}>Annuler</Button>
          <Button 
            onClick={handleSendArticle} 
            color="primary" 
            variant="contained" 
            disabled={!articleTitle.trim() || (!articleContent.trim() && !articleUrl.trim())}
          >
            Partager
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}

export default Messagerie;
