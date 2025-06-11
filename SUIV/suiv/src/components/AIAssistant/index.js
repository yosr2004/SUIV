/**
 * AIAssistant - Un assistant IA professionnel et détaillé
 */

import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";

// @mui material components
import {
  Card,
  Grid,
  Icon,
  TextField,
  IconButton,
  Divider,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Box,
  CircularProgress,
  Chip,
  Tooltip,
  Menu,
  MenuItem,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Fade,
  Badge,
  InputAdornment,
  Drawer,
  AppBar,
  Toolbar,
  useMediaQuery,
  useTheme,
  FormControlLabel,
  Switch,
} from "@mui/material";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Icons
import SendIcon from "@mui/icons-material/Send";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import PersonIcon from "@mui/icons-material/Person";
import InsertEmoticonIcon from "@mui/icons-material/InsertEmoticon";
import WorkIcon from "@mui/icons-material/Work";
import SchoolIcon from "@mui/icons-material/School";
import HelpIcon from "@mui/icons-material/Help";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import AssignmentIcon from "@mui/icons-material/Assignment";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import RefreshIcon from "@mui/icons-material/Refresh";
import SaveIcon from "@mui/icons-material/Save";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import SettingsIcon from "@mui/icons-material/Settings";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import MicIcon from "@mui/icons-material/Mic";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CloseIcon from "@mui/icons-material/Close";
import ChatIcon from "@mui/icons-material/Chat";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import HistoryIcon from "@mui/icons-material/History";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import BuildIcon from "@mui/icons-material/Build";
import MenuIcon from "@mui/icons-material/Menu";

// AI Service
import AIService, { generateAIResponse } from "./AIService";

// Suggestions de questions rapides améliorées
const quickSuggestions = [
  {
    text: "Comment développer ma carrière?",
    icon: <WorkIcon fontSize="small" />,
    category: "career",
  },
  {
    text: "Quelles compétences améliorer?",
    icon: <SchoolIcon fontSize="small" />,
    category: "skills",
  },
  {
    text: "Conseils entretien d'embauche?",
    icon: <BusinessCenterIcon fontSize="small" />,
    category: "interview",
  },
  {
    text: "Comment optimiser mon CV?",
    icon: <AssignmentIcon fontSize="small" />,
    category: "resume",
  },
  {
    text: "Développer mon leadership?",
    icon: <TrendingUpIcon fontSize="small" />,
    category: "leadership",
  },
  {
    text: "Améliorer équilibre travail-vie?",
    icon: <InsertEmoticonIcon fontSize="small" />,
    category: "work_life_balance",
  },
  {
    text: "Tendances du marché du travail?",
    icon: <BuildIcon fontSize="small" />,
    category: "industry_trends",
  },
  { text: "Que peut faire cet assistant?", icon: <HelpIcon fontSize="small" />, category: "help" },
];

// Catégories pour organiser les sujets
const categories = [
  { id: "career", name: "Carrière", icon: <WorkIcon /> },
  { id: "skills", name: "Compétences", icon: <SchoolIcon /> },
  { id: "interview", name: "Entretiens", icon: <BusinessCenterIcon /> },
  { id: "resume", name: "CV & Candidature", icon: <AssignmentIcon /> },
  { id: "leadership", name: "Leadership", icon: <TrendingUpIcon /> },
  { id: "work_life_balance", name: "Équilibre Pro", icon: <InsertEmoticonIcon /> },
  { id: "industry_trends", name: "Tendances", icon: <BuildIcon /> },
];

// Clé pour le stockage local des conversations
const STORAGE_KEY = "ai_assistant_conversation";
const SETTINGS_KEY = "ai_assistant_settings";

// Paramètres par défaut
const DEFAULT_SETTINGS = {
  responseLength: "detailed", // 'concise', 'detailed', 'extensive'
  theme: "light", // 'light', 'dark', 'system'
  fontSize: "medium", // 'small', 'medium', 'large'
  useMarkdown: true, // true/false
  showTimestamps: true, // true/false
  autoScroll: true, // true/false
};

function AIAssistant() {
  // Chargement initial des messages depuis le stockage local
  const loadStoredMessages = () => {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      if (storedData) {
        return JSON.parse(storedData);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des messages:", error);
    }

    // Message par défaut si aucun historique n'est trouvé
    return [
      {
        id: 1,
        text: "Bonjour, je suis votre assistant IA professionnel. Comment puis-je vous aider dans votre développement de carrière aujourd'hui? N'hésitez pas à me poser des questions détaillées pour obtenir des réponses complètes et structurées.",
        sender: "ai",
        timestamp: new Date().toISOString(),
        category: "greeting",
      },
    ];
  };

  // Chargement des paramètres depuis le stockage local
  const loadSettings = () => {
    try {
      const storedSettings = localStorage.getItem(SETTINGS_KEY);
      if (storedSettings) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(storedSettings) };
      }
    } catch (error) {
      console.error("Erreur lors du chargement des paramètres:", error);
    }

    return DEFAULT_SETTINGS;
  };

  const [messages, setMessages] = useState(loadStoredMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState(loadSettings);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [messageHistory, setMessageHistory] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState("default");
  const [conversations, setConversations] = useState({
    default: { name: "Conversation principale", messages: messages },
  });
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [sendingEnabled, setSendingEnabled] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);

  const messagesEndRef = useRef(null);
  const textFieldRef = useRef(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  // Enregistrer les messages dans localStorage quand ils changent
  useEffect(() => {
    if (!initialLoadComplete) {
      setInitialLoadComplete(true);
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));

      // Mettre à jour la conversation courante
      setConversations((prev) => ({
        ...prev,
        [currentConversationId]: {
          ...prev[currentConversationId],
          messages: messages,
        },
      }));
    } catch (error) {
      console.error("Erreur lors de l'enregistrement des messages:", error);
    }
  }, [messages]);

  // Enregistrer les paramètres quand ils changent
  useEffect(() => {
    if (!initialLoadComplete) return;

    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error("Erreur lors de l'enregistrement des paramètres:", error);
    }
  }, [settings]);

  // Cette fonction gère l'envoi d'un message à l'IA et la réception d'une réponse
  const handleSendMessage = async () => {
    if (input.trim() === "" || !sendingEnabled) return;

    const currentInput = input;

    setSendingEnabled(false); // Désactiver temporairement l'envoi

    // Ajouter le message de l'utilisateur
    const userMessage = {
      id: Date.now(),
      text: currentInput,
      sender: "user",
      timestamp: new Date().toISOString(),
      category: selectedCategory || "general",
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput("");
    setIsLoading(true);

    // Ajouter l'indicateur de "typing" après un court délai
    const typingTimer = setTimeout(() => {
      setIsTyping(true);
    }, 500);
    setTypingTimeout(typingTimer);

    try {
      // Utiliser notre service AI pour générer une réponse
      const aiResponseData = await generateAIResponse(currentInput, settings.responseLength);

      // Si le timeout de typing est toujours actif, l'annuler
      if (typingTimeout) {
        clearTimeout(typingTimeout);
        setTypingTimeout(null);
      }

      // Désactiver l'indicateur de "typing"
      setIsTyping(false);

      // Extraire le texte et la catégorie détectée
      const aiResponseText =
        typeof aiResponseData === "string" ? aiResponseData : aiResponseData.text || aiResponseData;

      const responseCategory =
        typeof aiResponseData === "object" && aiResponseData.category
          ? aiResponseData.category
          : "general";

      // Ajouter la réponse de l'IA
      const aiResponse = {
        id: Date.now() + 1,
        text: aiResponseText,
        sender: "ai",
        timestamp: new Date().toISOString(),
        category: responseCategory,
      };

      setMessages((prevMessages) => [...prevMessages, aiResponse]);

      // Ajouter à l'historique pour référence rapide
      const historyItem = {
        id: Date.now(),
        question: currentInput.length > 30 ? currentInput.substring(0, 30) + "..." : currentInput,
        answer:
          aiResponseText.length > 30 ? aiResponseText.substring(0, 30) + "..." : aiResponseText,
        timestamp: new Date().toISOString(),
        category: responseCategory,
      };

      setMessageHistory((prev) => [historyItem, ...prev].slice(0, 10)); // Garder les 10 dernières questions
    } catch (error) {
      console.error("Erreur lors de la génération de la réponse IA:", error);

      // Si le timeout de typing est toujours actif, l'annuler
      if (typingTimeout) {
        clearTimeout(typingTimeout);
        setTypingTimeout(null);
      }

      // Désactiver l'indicateur de "typing"
      setIsTyping(false);

      // Message d'erreur si le service échoue
      const errorResponse = {
        id: Date.now() + 1,
        text: "Désolé, je rencontre des difficultés à traiter votre demande. Pourriez-vous réessayer avec une formulation différente?",
        sender: "ai",
        timestamp: new Date().toISOString(),
        category: "error",
      };

      setMessages((prevMessages) => [...prevMessages, errorResponse]);

      // Afficher une notification d'erreur
      showSnackbar("Erreur de communication avec l'assistant IA", "error");
    } finally {
      setIsLoading(false);
      setSendingEnabled(true); // Réactiver l'envoi
    }
  };

  // Faire défiler automatiquement jusqu'au dernier message
  useEffect(() => {
    if (settings.autoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  // Gérer la soumission avec la touche Entrée
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Gérer le clic sur une suggestion rapide
  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion.text);
    setSelectedCategory(suggestion.category || null);

    // Focus sur le champ de texte
    textFieldRef.current?.focus();

    // Option: envoyer automatiquement la suggestion
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };

  // Formater le texte des messages avec retours à la ligne et markdown
  const formatMessageText = (text) => {
    if (!text) return <div></div>;

    // Formattage avancé selon si le markdown est activé
    if (settings.useMarkdown) {
      // Gestion du markdown enrichi
      const formattedText = text.split("\n").map((line, i) => {
        // Titres markdown
        if (line.match(/^#+\s/)) {
          const level = line.match(/^(#+)\s/)[1].length;
          const title = line.replace(/^#+\s/, "");

          if (level === 1)
            return `<h3 style="margin-top:10px;margin-bottom:8px;font-weight:600;">${title}</h3>`;
          else if (level === 2)
            return `<h4 style="margin-top:8px;margin-bottom:6px;font-weight:600;">${title}</h4>`;
          else return `<h5 style="margin-top:6px;margin-bottom:4px;font-weight:600;">${title}</h5>`;
        }

        // Formatage du texte en gras
        if (line.match(/\*\*.*\*\*/g)) {
          line = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
        }

        // Formatage du texte en italique
        if (line.match(/\*(.*?)\*/g)) {
          line = line.replace(/\*(.*?)\*/g, "<em>$1</em>");
        }

        // Listes à puces
        if (line.trim().startsWith("•") || line.trim().startsWith("-")) {
          return `<li style="margin-left: 20px;margin-bottom:4px;">${line
            .trim()
            .substring(1)
            .trim()}</li>`;
        }

        // Listes numérotées
        if (line.match(/^\d+\./)) {
          return `<li style="margin-left: 20px;list-style-type:decimal;margin-bottom:4px;">${line
            .substring(line.indexOf(".") + 1)
            .trim()}</li>`;
        }

        // Citations
        if (line.trim().startsWith(">")) {
          return `<blockquote style="border-left:3px solid #ccc;padding-left:10px;margin-left:10px;color:#666;">${line
            .substring(1)
            .trim()}</blockquote>`;
        }

        return line;
      });

      // Convertir les tableaux en HTML
      const processedText = formattedText.join("\n");

      // Appliquer les styles selon la taille de police choisie
      const fontSizeStyle = getFontSizeStyle(settings.fontSize);

      // Créer un HTML sécurisé avec la taille appropriée
      return (
        <div
          style={{ fontSize: fontSizeStyle }}
          dangerouslySetInnerHTML={{
            __html: processedText.replace(/\n/g, "<br />"),
          }}
        />
      );
    } else {
      // Formatage basique sans markdown
      return (
        <div style={{ whiteSpace: "pre-wrap", fontSize: getFontSizeStyle(settings.fontSize) }}>
          {text}
        </div>
      );
    }
  };

  // Obtenir la taille de police basée sur les paramètres
  const getFontSizeStyle = (size) => {
    switch (size) {
      case "small":
        return "0.875rem";
      case "large":
        return "1.125rem";
      default:
        return "1rem";
    }
  };

  // Ouvrir le menu contextuel pour un message
  const handleMessageMenuOpen = (event, message) => {
    setSelectedMessage(message);
    setMenuAnchorEl(event.currentTarget);
  };

  // Fermer le menu contextuel
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  // Copier le texte d'un message dans le presse-papier
  const handleCopyMessage = () => {
    if (selectedMessage) {
      navigator.clipboard
        .writeText(selectedMessage.text)
        .then(() => {
          showSnackbar("Message copié dans le presse-papiers", "success");
        })
        .catch((err) => {
          showSnackbar("Erreur lors de la copie du message", "error");
          console.error("Erreur de copie:", err);
        });
    }
    handleMenuClose();
  };

  // Afficher une notification
  const showSnackbar = (message, severity = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  // Fermer la notification
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // Exporter la conversation au format texte
  const exportConversation = () => {
    // Formater la conversation
    const conversationText = messages
      .map((msg) => {
        const sender = msg.sender === "user" ? "Vous" : "Assistant IA";
        const date = new Date(msg.timestamp).toLocaleString();
        return `${sender} (${date}):\n${msg.text}\n`;
      })
      .join("\n---\n\n");

    // Créer un blob avec le texte formaté
    const blob = new Blob([conversationText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    // Créer un lien de téléchargement et cliquer dessus
    const a = document.createElement("a");
    a.href = url;
    a.download = `conversation-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();

    // Nettoyer
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    handleMenuClose();
    showSnackbar("Conversation exportée avec succès", "success");
  };

  // Effacer toute la conversation
  const handleClearConversation = () => {
    setClearDialogOpen(true);
    handleMenuClose();
  };

  // Confirmer l'effacement de la conversation
  const confirmClearConversation = () => {
    const welcomeMessage = {
      id: Date.now(),
      text: "Bonjour, je suis votre assistant IA professionnel. Comment puis-je vous aider dans votre développement de carrière aujourd'hui?",
      sender: "ai",
      timestamp: new Date().toISOString(),
    };

    setMessages([welcomeMessage]);
    setClearDialogOpen(false);
    showSnackbar("Conversation effacée", "info");
  };

  // Formater la date pour l'affichage
  const formatDate = (timestamp) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch (e) {
      return "";
    }
  };

  // Gérer l'ouverture du tiroir de navigation
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  // Gérer l'ouverture des paramètres
  const toggleSettings = () => {
    setSettingsOpen(!settingsOpen);
  };

  // Mettre à jour un paramètre
  const updateSetting = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <MDBox pt={3} pb={3}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
              overflow: "visible",
            }}
          >
            <MDBox
              mx={2}
              mt={-3}
              py={3}
              px={2}
              variant="gradient"
              bgColor="info"
              borderRadius="lg"
              coloredShadow="info"
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Box display="flex" alignItems="center">
                <IconButton
                  color="white"
                  onClick={toggleDrawer}
                  sx={{ mr: 1, display: { xs: "inline-flex", md: "none" } }}
                >
                  <MenuIcon />
                </IconButton>
                <MDTypography variant="h6" color="white" display="flex" alignItems="center">
                  <SmartToyIcon sx={{ mr: 1 }} /> Assistant IA Professionnel
                </MDTypography>
              </Box>

              <Box>
                <Tooltip title="Paramètres">
                  <IconButton color="white" onClick={toggleSettings} sx={{ mr: 1 }}>
                    <SettingsIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Options de conversation">
                  <IconButton color="white" onClick={(e) => handleMessageMenuOpen(e, null)}>
                    <MoreVertIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </MDBox>

            <MDBox display="flex" sx={{ height: { xs: "auto", md: "650px" } }}>
              {/* Panneau latéral pour catégories et historique - visible sur desktop */}
              <Drawer
                variant={isMobile ? "temporary" : "permanent"}
                open={isMobile ? drawerOpen : true}
                onClose={toggleDrawer}
                sx={{
                  width: 240,
                  flexShrink: 0,
                  "& .MuiDrawer-paper": {
                    width: 240,
                    boxSizing: "border-box",
                    position: isMobile ? "fixed" : "relative",
                    height: isMobile ? "100%" : "auto",
                    borderRight: "1px solid rgba(0,0,0,0.08)",
                  },
                  display: { xs: "block", md: "block" },
                }}
              >
                <Box sx={{ p: 2, borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
                  <MDTypography variant="h6" fontWeight="medium">
                    <ChatIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                    Assistant IA
                  </MDTypography>
                </Box>

                <Box sx={{ p: 2 }}>
                  <MDTypography variant="subtitle2" color="text" gutterBottom>
                    <FolderOutlinedIcon
                      sx={{ fontSize: 16, verticalAlign: "middle", mr: 1, opacity: 0.7 }}
                    />
                    Catégories
                  </MDTypography>
                  <List dense>
                    {categories.map((category) => (
                      <ListItem
                        key={category.id}
                        button
                        selected={selectedCategory === category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        sx={{
                          borderRadius: 1,
                          mb: 0.5,
                          "&.Mui-selected": {
                            backgroundColor: "primary.light",
                            color: "primary.contrastText",
                            "&:hover": {
                              backgroundColor: "primary.light",
                            },
                          },
                        }}
                      >
                        <ListItemAvatar sx={{ minWidth: 36 }}>
                          <Avatar
                            sx={{
                              width: 24,
                              height: 24,
                              bgcolor:
                                selectedCategory === category.id ? "primary.dark" : "grey.100",
                              color: selectedCategory === category.id ? "white" : "text.secondary",
                            }}
                          >
                            {React.cloneElement(category.icon, { style: { fontSize: 16 } })}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={category.name}
                          primaryTypographyProps={{
                            variant: "body2",
                            fontWeight: selectedCategory === category.id ? "medium" : "regular",
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>

                <Divider />

                <Box sx={{ p: 2 }}>
                  <MDTypography variant="subtitle2" color="text" gutterBottom>
                    <HistoryIcon
                      sx={{ fontSize: 16, verticalAlign: "middle", mr: 1, opacity: 0.7 }}
                    />
                    Historique récent
                  </MDTypography>
                  <List dense>
                    {messageHistory.length > 0 ? (
                      messageHistory.map((item) => (
                        <ListItem
                          key={item.id}
                          button
                          sx={{
                            borderRadius: 1,
                            mb: 0.5,
                            "&:hover": {
                              backgroundColor: "rgba(0, 0, 0, 0.04)",
                            },
                          }}
                          onClick={() => {
                            setInput(item.question);
                            textFieldRef.current?.focus();
                          }}
                        >
                          <ListItemText
                            primary={item.question}
                            secondary={new Date(item.timestamp).toLocaleString()}
                            primaryTypographyProps={{ variant: "body2", noWrap: true }}
                            secondaryTypographyProps={{ variant: "caption", noWrap: true }}
                          />
                        </ListItem>
                      ))
                    ) : (
                      <ListItem>
                        <ListItemText
                          primary="Aucun historique"
                          primaryTypographyProps={{
                            variant: "body2",
                            color: "text.secondary",
                            fontStyle: "italic",
                          }}
                        />
                      </ListItem>
                    )}
                  </List>
                </Box>
              </Drawer>

              <MDBox p={3} sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
                {/* Zone des suggestions rapides */}
                <MDBox
                  mb={3}
                  display="flex"
                  flexWrap="wrap"
                  gap={1}
                  sx={{ pb: 2, borderBottom: "1px dashed rgba(0,0,0,0.1)" }}
                >
                  {quickSuggestions.map((suggestion, index) => (
                    <Chip
                      key={index}
                      icon={suggestion.icon}
                      label={suggestion.text}
                      onClick={() => handleSuggestionClick(suggestion)}
                      variant="outlined"
                      color="info"
                      sx={{
                        m: 0.5,
                        transition: "all 0.3s",
                        borderRadius: "16px",
                        "&:hover": {
                          boxShadow: 2,
                          bgcolor: "info.light",
                          color: "white",
                          transform: "translateY(-2px)",
                        },
                      }}
                    />
                  ))}
                </MDBox>

                {/* Zone des messages */}
                <Paper
                  elevation={0}
                  sx={{
                    height: "100%",
                    maxHeight: { xs: "400px", md: "450px" },
                    overflow: "auto",
                    bgcolor: "background.default",
                    p: 2,
                    mb: 2,
                    borderRadius: 2,
                    boxShadow: "inset 0 0 5px rgba(0,0,0,0.05)",
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <List sx={{ width: "100%" }}>
                    {messages.map((message) => (
                      <Fade key={message.id} in={true} timeout={500}>
                        <ListItem
                          alignItems="flex-start"
                          sx={{
                            justifyContent: message.sender === "user" ? "flex-end" : "flex-start",
                            mb: 2,
                            padding: 0,
                          }}
                        >
                          <Paper
                            elevation={1}
                            sx={{
                              p: 2,
                              borderRadius: 2,
                              maxWidth: "85%",
                              bgcolor: message.sender === "user" ? "primary.light" : "grey.100",
                              boxShadow:
                                message.sender === "user"
                                  ? "0 4px 12px rgba(76, 175, 80, 0.15)"
                                  : "0 4px 12px rgba(0, 0, 0, 0.08)",
                              position: "relative",
                              "&:hover .message-actions": {
                                opacity: 1,
                              },
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                mb: 1,
                                justifyContent: "space-between",
                              }}
                            >
                              <Box sx={{ display: "flex", alignItems: "center" }}>
                                <ListItemAvatar sx={{ minWidth: "40px" }}>
                                  <Avatar
                                    sx={{
                                      bgcolor:
                                        message.sender === "user" ? "primary.main" : "info.main",
                                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                                    }}
                                  >
                                    {message.sender === "user" ? <PersonIcon /> : <SmartToyIcon />}
                                  </Avatar>
                                </ListItemAvatar>
                                <MDTypography
                                  variant="subtitle2"
                                  color={message.sender === "user" ? "white" : "dark"}
                                >
                                  {message.sender === "user" ? "Vous" : "Assistant IA"}
                                </MDTypography>
                              </Box>
                              <Box
                                className="message-actions"
                                sx={{ opacity: 0, transition: "opacity 0.2s" }}
                              >
                                <Tooltip title="Options du message">
                                  <IconButton
                                    size="small"
                                    onClick={(e) => handleMessageMenuOpen(e, message)}
                                    sx={{
                                      color: message.sender === "user" ? "white" : "text.secondary",
                                    }}
                                  >
                                    <MoreVertIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </Box>
                            <MDTypography
                              variant="body2"
                              color={message.sender === "user" ? "white" : "dark"}
                              sx={{ pl: 5 }}
                            >
                              {formatMessageText(message.text)}
                            </MDTypography>
                            {settings.showTimestamps && message.timestamp && (
                              <MDTypography
                                variant="caption"
                                color={message.sender === "user" ? "white" : "text.secondary"}
                                sx={{ display: "block", textAlign: "right", mt: 1, opacity: 0.7 }}
                              >
                                {formatDate(message.timestamp)}
                              </MDTypography>
                            )}
                          </Paper>
                        </ListItem>
                      </Fade>
                    ))}
                    <div ref={messagesEndRef} />

                    {/* Indicateur de typing */}
                    {isTyping && (
                      <Fade in={true} timeout={500}>
                        <ListItem alignItems="flex-start" sx={{ padding: 0 }}>
                          <Paper
                            elevation={1}
                            sx={{
                              p: 2,
                              borderRadius: 2,
                              maxWidth: "85%",
                              bgcolor: "grey.100",
                              boxShadow: 1,
                            }}
                          >
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <ListItemAvatar sx={{ minWidth: "40px" }}>
                                <Avatar sx={{ bgcolor: "info.main" }}>
                                  <SmartToyIcon />
                                </Avatar>
                              </ListItemAvatar>
                              <Box sx={{ display: "flex", alignItems: "center", pl: 1 }}>
                                <Box
                                  sx={{
                                    width: "8px",
                                    height: "8px",
                                    bgcolor: "info.main",
                                    borderRadius: "50%",
                                    mr: 0.5,
                                    animation: "pulse 1s infinite",
                                    "@keyframes pulse": {
                                      "0%": { opacity: 0.4 },
                                      "50%": { opacity: 1 },
                                      "100%": { opacity: 0.4 },
                                    },
                                  }}
                                />
                                <Box
                                  sx={{
                                    width: "8px",
                                    height: "8px",
                                    bgcolor: "info.main",
                                    borderRadius: "50%",
                                    mr: 0.5,
                                    animation: "pulse 1s infinite 0.2s",
                                    "@keyframes pulse": {
                                      "0%": { opacity: 0.4 },
                                      "50%": { opacity: 1 },
                                      "100%": { opacity: 0.4 },
                                    },
                                  }}
                                />
                                <Box
                                  sx={{
                                    width: "8px",
                                    height: "8px",
                                    bgcolor: "info.main",
                                    borderRadius: "50%",
                                    animation: "pulse 1s infinite 0.4s",
                                    "@keyframes pulse": {
                                      "0%": { opacity: 0.4 },
                                      "50%": { opacity: 1 },
                                      "100%": { opacity: 0.4 },
                                    },
                                  }}
                                />
                              </Box>
                            </Box>
                          </Paper>
                        </ListItem>
                      </Fade>
                    )}

                    {/* Indicateur de chargement (deprecated, using typing dots now) */}
                    {isLoading && !isTyping && (
                      <ListItem alignItems="flex-start" sx={{ padding: 0 }}>
                        <Paper
                          elevation={1}
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            maxWidth: "85%",
                            bgcolor: "grey.100",
                            boxShadow: 1,
                          }}
                        >
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <ListItemAvatar sx={{ minWidth: "40px" }}>
                              <Avatar sx={{ bgcolor: "info.main" }}>
                                <SmartToyIcon />
                              </Avatar>
                            </ListItemAvatar>
                            <CircularProgress size={20} color="info" />
                          </Box>
                        </Paper>
                      </ListItem>
                    )}
                  </List>
                </Paper>

                {/* Zone de saisie */}
                <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                  <TextField
                    fullWidth
                    placeholder="Posez une question détaillée pour obtenir une réponse approfondie..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    variant="outlined"
                    multiline
                    maxRows={4}
                    inputRef={textFieldRef}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            {/* Boutons de formatage (optionnels) */}
                            {settings.useMarkdown && (
                              <>
                                <Tooltip title="Texte en gras">
                                  <IconButton
                                    size="small"
                                    onClick={() => setInput((prev) => `${prev}**texte en gras**`)}
                                    sx={{ color: "text.secondary" }}
                                  >
                                    <FormatBoldIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Liste à puces">
                                  <IconButton
                                    size="small"
                                    onClick={() =>
                                      setInput((prev) => `${prev}\n- élément de liste`)
                                    }
                                    sx={{ color: "text.secondary" }}
                                  >
                                    <FormatListBulletedIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </>
                            )}
                          </Box>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      mr: 1,
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 3,
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: "info.main",
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: "info.main",
                          borderWidth: 2,
                        },
                      },
                    }}
                  />
                  <MDButton
                    variant="contained"
                    color="info"
                    onClick={handleSendMessage}
                    disabled={input.trim() === "" || isLoading || !sendingEnabled}
                    circular
                    sx={{
                      minWidth: "56px",
                      height: "56px",
                      boxShadow: 3,
                      transition: "all 0.3s",
                      "&:hover": {
                        transform: "scale(1.08)",
                        boxShadow: 4,
                      },
                      "&:active": {
                        transform: "scale(0.95)",
                      },
                    }}
                  >
                    <SendIcon />
                  </MDButton>
                </Box>
              </MDBox>
            </MDBox>
          </Card>
        </Grid>
      </Grid>

      {/* Dialogue des paramètres */}
      <Dialog open={settingsOpen} onClose={toggleSettings} fullWidth maxWidth="xs">
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">Paramètres de l'assistant</Typography>
            <IconButton onClick={toggleSettings} size="small">
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Niveau de détail des réponses
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
              <Button
                variant={settings.responseLength === "concise" ? "contained" : "outlined"}
                color="primary"
                size="small"
                onClick={() => updateSetting("responseLength", "concise")}
                sx={{ flexGrow: 1, mr: 1 }}
              >
                Concis
              </Button>
              <Button
                variant={settings.responseLength === "detailed" ? "contained" : "outlined"}
                color="primary"
                size="small"
                onClick={() => updateSetting("responseLength", "detailed")}
                sx={{ flexGrow: 1, mr: 1 }}
              >
                Détaillé
              </Button>
              <Button
                variant={settings.responseLength === "extensive" ? "contained" : "outlined"}
                color="primary"
                size="small"
                onClick={() => updateSetting("responseLength", "extensive")}
                sx={{ flexGrow: 1 }}
              >
                Approfondi
              </Button>
            </Box>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Taille du texte
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
              <Button
                variant={settings.fontSize === "small" ? "contained" : "outlined"}
                color="primary"
                size="small"
                onClick={() => updateSetting("fontSize", "small")}
                sx={{ flexGrow: 1, mr: 1 }}
              >
                Petit
              </Button>
              <Button
                variant={settings.fontSize === "medium" ? "contained" : "outlined"}
                color="primary"
                size="small"
                onClick={() => updateSetting("fontSize", "medium")}
                sx={{ flexGrow: 1, mr: 1 }}
              >
                Moyen
              </Button>
              <Button
                variant={settings.fontSize === "large" ? "contained" : "outlined"}
                color="primary"
                size="small"
                onClick={() => updateSetting("fontSize", "large")}
                sx={{ flexGrow: 1 }}
              >
                Grand
              </Button>
            </Box>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Options d'affichage
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", mt: 1 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.useMarkdown}
                    onChange={(e) => updateSetting("useMarkdown", e.target.checked)}
                    color="primary"
                  />
                }
                label="Activer le formatage markdown"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.showTimestamps}
                    onChange={(e) => updateSetting("showTimestamps", e.target.checked)}
                    color="primary"
                  />
                }
                label="Afficher l'horodatage des messages"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.autoScroll}
                    onChange={(e) => updateSetting("autoScroll", e.target.checked)}
                    color="primary"
                  />
                }
                label="Défilement automatique"
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={toggleSettings} color="primary">
            Fermer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Menu contextuel pour les messages */}
      <Menu anchorEl={menuAnchorEl} open={Boolean(menuAnchorEl)} onClose={handleMenuClose}>
        {selectedMessage && (
          <MenuItem onClick={handleCopyMessage}>
            <ContentCopyIcon fontSize="small" sx={{ mr: 1 }} />
            Copier le message
          </MenuItem>
        )}
        {!selectedMessage && (
          <MenuItem onClick={exportConversation}>
            <DownloadIcon fontSize="small" sx={{ mr: 1 }} />
            Exporter la conversation
          </MenuItem>
        )}
        {!selectedMessage && (
          <MenuItem onClick={handleClearConversation}>
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
            Effacer la conversation
          </MenuItem>
        )}
      </Menu>

      {/* Snackbar pour les notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* Dialogue de confirmation pour effacer la conversation */}
      <Dialog open={clearDialogOpen} onClose={() => setClearDialogOpen(false)}>
        <DialogTitle>Effacer la conversation</DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir effacer toute cette conversation ? Cette action est
            irréversible.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClearDialogOpen(false)}>Annuler</Button>
          <Button onClick={confirmClearConversation} color="error" variant="contained">
            Effacer
          </Button>
        </DialogActions>
      </Dialog>
    </MDBox>
  );
}

export default AIAssistant;
