
import { useState, useEffect, useCallback } from "react";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";

// @mui icons
import EmailIcon from "@mui/icons-material/Email";
import RecommendIcon from "@mui/icons-material/Recommend";
import PersonIcon from "@mui/icons-material/Person";
import WorkIcon from "@mui/icons-material/Work";
import SchoolIcon from "@mui/icons-material/School";
import DeleteIcon from "@mui/icons-material/Delete";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import RefreshIcon from "@mui/icons-material/Refresh";
import VisibilityIcon from "@mui/icons-material/Visibility";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDAlert from "components/MDAlert";
import MDButton from "components/MDButton";
import MDSnackbar from "components/MDSnackbar";
import MDAvatar from "components/MDAvatar";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// Notification Service
import {
  fetchUserMessages,
  fetchUserRecommendations,
  markMessageAsRead,
  markRecommendationAsRead,
  deleteMessage,
  deleteRecommendation,
} from "services/notificationService";

// Authentication Context for user info
import { useAuth } from "contexts/AuthContext";

// Fonction pour formater la date relative en français sans utiliser date-fns
const formatRelativeDate = (dateString) => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    
    if (diffMinutes < 1) {
      return "À l'instant";
    } else if (diffMinutes < 60) {
      return `Il y a ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
    } else if (diffHours < 24) {
      return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
    } else if (diffDays < 30) {
      return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    } else {
      // Format: JJ/MM/AAAA
      return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    }
  } catch (error) {
    console.error("Erreur lors du formatage de la date:", error);
    return "Date inconnue";
  }
};

function Notifications() {
  const [successSB, setSuccessSB] = useState(false);
  const [infoSB, setInfoSB] = useState(false);
  const [warningSB, setWarningSB] = useState(false);
  const [errorSB, setErrorSB] = useState(false);
  const [messageSB, setMessageSB] = useState(false);
  const [recommendationSB, setRecommendationSB] = useState(false);

  // État pour les notifications
  const [messageNotifications, setMessageNotifications] = useState([]);
  const [recommendationNotifications, setRecommendationNotifications] = useState([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [errorMessages, setErrorMessages] = useState(null);
  const [errorRecommendations, setErrorRecommendations] = useState(null);

  // Obtenir les informations de l'utilisateur connecté
  const { currentUser } = useAuth();

  // Fonction pour associer l'icône appropriée au type de recommandation
  const getRecommendationIcon = (type) => {
    switch (type) {
      case "cours":
      case "formation":
        return <SchoolIcon />;
      case "emploi":
      case "opportunité":
        return <WorkIcon />;
      case "mentor":
      case "professionnel":
        return <PersonIcon />;
      default:
        return <RecommendIcon />;
    }
  };

  // Chargement des messages
  const loadMessages = useCallback(async () => {
    if (!currentUser) return;

    setIsLoadingMessages(true);
    setErrorMessages(null);

    try {
      const data = await fetchUserMessages();
      // Transformer les données pour correspondre à notre format
      const formattedMessages = data.map((msg) => ({
        id: msg._id,
        sender: msg.sender ? `${msg.sender.firstName} ${msg.sender.lastName}` : "Système",
        senderId: msg.sender ? msg.sender._id : null,
        content: msg.content,
        time: formatRelativeDate(msg.createdAt),
        timestamp: msg.createdAt,
        read: msg.read,
        avatar: msg.sender?.profileImage || null,
      }));

      setMessageNotifications(formattedMessages);
    } catch (error) {
      console.error("Erreur lors du chargement des messages:", error);
      setErrorMessages("Impossible de charger les messages. Veuillez réessayer plus tard.");
    } finally {
      setIsLoadingMessages(false);
    }
  }, [currentUser]);

  // Chargement des recommandations
  const loadRecommendations = useCallback(async () => {
    if (!currentUser) return;

    setIsLoadingRecommendations(true);
    setErrorRecommendations(null);

    try {
      const data = await fetchUserRecommendations();
      // Transformer les données pour correspondre à notre format
      const formattedRecommendations = data.map((rec) => ({
        id: rec._id,
        title: rec.title,
        description: rec.description,
        type: rec.type || "général",
        time: formatRelativeDate(rec.createdAt),
        timestamp: rec.createdAt,
        read: rec.read,
        url: rec.url || null,
        icon: getRecommendationIcon(rec.type),
      }));

      setRecommendationNotifications(formattedRecommendations);
    } catch (error) {
      console.error("Erreur lors du chargement des recommandations:", error);
      setErrorRecommendations(
        "Impossible de charger les recommandations. Veuillez réessayer plus tard."
      );
    } finally {
      setIsLoadingRecommendations(false);
    }
  }, [currentUser]);

  // Chargement initial des données et configuration de la mise à jour périodique
  useEffect(() => {
    // Chargement initial
    loadMessages();
    loadRecommendations();

    // Configuration de la mise à jour périodique si les notifications sont activées
    let messagesInterval;
    let recommendationsInterval;

    if (notificationsEnabled && currentUser) {
      messagesInterval = setInterval(() => {
        loadMessages();
      }, 60000); // Vérifier toutes les minutes

      recommendationsInterval = setInterval(() => {
        loadRecommendations();
      }, 120000); // Vérifier toutes les 2 minutes
    }

    // Nettoyage des intervalles
    return () => {
      if (messagesInterval) clearInterval(messagesInterval);
      if (recommendationsInterval) clearInterval(recommendationsInterval);
    };
  }, [notificationsEnabled, currentUser, loadMessages, loadRecommendations]);

  // Mise à jour du statut des notifications lorsqu'un nouveau message ou recommandation arrive
  useEffect(() => {
    const checkForNewNotifications = () => {
      // Vérifier s'il y a de nouveaux messages non lus depuis la dernière vérification
      const hasUnreadMessages = messageNotifications.some((msg) => !msg.read);
      if (hasUnreadMessages) {
        setMessageSB(true);
      }

      // Vérifier s'il y a de nouvelles recommandations non lues depuis la dernière vérification
      const hasUnreadRecommendations = recommendationNotifications.some((rec) => !rec.read);
      if (hasUnreadRecommendations) {
        setRecommendationSB(true);
      }
    };

    checkForNewNotifications();
  }, [messageNotifications, recommendationNotifications]);

  // Gérer la suppression d'une notification
  const handleDeleteNotification = async (id, type) => {
    try {
      if (type === "message") {
        await deleteMessage(id);
        setMessageNotifications((prev) => prev.filter((notification) => notification.id !== id));
        showMessage("Message supprimé avec succès", "success");
      } else {
        await deleteRecommendation(id);
        setRecommendationNotifications((prev) =>
          prev.filter((notification) => notification.id !== id)
        );
        showMessage("Recommandation supprimée avec succès", "success");
      }
    } catch (error) {
      console.error(
        `Erreur lors de la suppression de la ${type === "message" ? "message" : "recommandation"}:`,
        error
      );
      showMessage(`Erreur lors de la suppression. Veuillez réessayer.`, "error");
    }
  };

  // Marquer une notification comme lue
  const handleMarkAsRead = async (id, type) => {
    try {
      if (type === "message") {
        await markMessageAsRead(id);
        setMessageNotifications((prev) =>
          prev.map((notification) =>
            notification.id === id ? { ...notification, read: true } : notification
          )
        );
      } else {
        await markRecommendationAsRead(id);
        setRecommendationNotifications((prev) =>
          prev.map((notification) =>
            notification.id === id ? { ...notification, read: true } : notification
          )
        );
      }
    } catch (error) {
      console.error(`Erreur lors du marquage comme lu:`, error);
      showMessage("Erreur lors de la mise à jour. Veuillez réessayer.", "error");
    }
  };

  // Marquer toutes les notifications comme lues
  const handleMarkAllAsRead = async (type) => {
    try {
      if (type === "message") {
        const promises = messageNotifications
          .filter((notification) => !notification.read)
          .map((notification) => markMessageAsRead(notification.id));

        await Promise.all(promises);

        setMessageNotifications((prev) =>
          prev.map((notification) => ({ ...notification, read: true }))
        );

        showMessage("Tous les messages marqués comme lus", "success");
      } else {
        const promises = recommendationNotifications
          .filter((notification) => !notification.read)
          .map((notification) => markRecommendationAsRead(notification.id));

        await Promise.all(promises);

        setRecommendationNotifications((prev) =>
          prev.map((notification) => ({ ...notification, read: true }))
        );

        showMessage("Toutes les recommandations marquées comme lues", "success");
      }
    } catch (error) {
      console.error(`Erreur lors du marquage en masse:`, error);
      showMessage("Erreur lors de la mise à jour. Veuillez réessayer.", "error");
    }
  };

  // Fonction pour rafraîchir manuellement les données
  const handleRefresh = (type) => {
    if (type === "message") {
      loadMessages();
    } else {
      loadRecommendations();
    }
  };

  // Fonction utilitaire pour afficher un message
  const showMessage = (message, severity = "info") => {
    switch (severity) {
      case "success":
        setSuccessSB(true);
        break;
      case "info":
        setInfoSB(true);
        break;
      case "warning":
        setWarningSB(true);
        break;
      case "error":
        setErrorSB(true);
        break;
      default:
        setInfoSB(true);
    }
  };

  const openSuccessSB = () => setSuccessSB(true);
  const closeSuccessSB = () => setSuccessSB(false);
  const openInfoSB = () => setInfoSB(true);
  const closeInfoSB = () => setInfoSB(false);
  const openWarningSB = () => setWarningSB(true);
  const closeWarningSB = () => setWarningSB(false);
  const openErrorSB = () => setErrorSB(true);
  const closeErrorSB = () => setErrorSB(false);
  const closeMessageSB = () => setMessageSB(false);
  const closeRecommendationSB = () => setRecommendationSB(false);

  // Calculer le nombre de notifications non lues
  const unreadMessages = messageNotifications.filter((msg) => !msg.read).length;
  const unreadRecommendations = recommendationNotifications.filter((rec) => !rec.read).length;

  const renderSuccessSB = (
    <MDSnackbar
      color="success"
      icon="check"
      title="Succès"
      content="Opération effectuée avec succès"
      dateTime="maintenant"
      open={successSB}
      onClose={closeSuccessSB}
      close={closeSuccessSB}
      bgWhite
    />
  );

  const renderInfoSB = (
    <MDSnackbar
      icon="notifications"
      title="Information"
      content="Nouvelle information disponible"
      dateTime="maintenant"
      open={infoSB}
      onClose={closeInfoSB}
      close={closeInfoSB}
    />
  );

  const renderWarningSB = (
    <MDSnackbar
      color="warning"
      icon="star"
      title="Attention"
      content="Une action nécessite votre attention"
      dateTime="maintenant"
      open={warningSB}
      onClose={closeWarningSB}
      close={closeWarningSB}
      bgWhite
    />
  );

  const renderErrorSB = (
    <MDSnackbar
      color="error"
      icon="warning"
      title="Erreur"
      content="Une erreur s'est produite"
      dateTime="maintenant"
      open={errorSB}
      onClose={closeErrorSB}
      close={closeErrorSB}
      bgWhite
    />
  );

  // Notifications pour les nouveaux messages
  const renderMessageSB = (
    <MDSnackbar
      color="info"
      icon={<EmailIcon />}
      title="Nouveau Message"
      content="Vous avez reçu de nouveaux messages"
      dateTime="À l'instant"
      open={messageSB}
      onClose={closeMessageSB}
      close={closeMessageSB}
    />
  );

  // Notifications pour les recommandations
  const renderRecommendationSB = (
    <MDSnackbar
      color="success"
      icon={<RecommendIcon />}
      title="Nouvelle Recommandation"
      content="De nouvelles recommandations sont disponibles pour vous"
      dateTime="À l'instant"
      open={recommendationSB}
      onClose={closeRecommendationSB}
      close={closeRecommendationSB}
      bgWhite
    />
  );

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox mt={6} mb={3}>
        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12} lg={10}>
            <Card>
              <MDBox p={2} display="flex" justifyContent="space-between" alignItems="center">
                <MDTypography variant="h5">Centre de Notifications</MDTypography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationsEnabled}
                      onChange={() => setNotificationsEnabled(!notificationsEnabled)}
                      color="primary"
                    />
                  }
                  label="Activer les notifications"
                />
              </MDBox>
            </Card>
          </Grid>

          {/* Section pour les notifications de messages */}
          <Grid item xs={12} lg={5}>
            <Card>
              <MDBox p={2} display="flex" justifyContent="space-between" alignItems="center">
                <MDBox display="flex" alignItems="center">
                  <Badge badgeContent={unreadMessages} color="error" sx={{ mr: 2 }}>
                    <EmailIcon color="action" />
                  </Badge>
                  <MDTypography variant="h6">Messages</MDTypography>
                </MDBox>
                <MDBox>
                  <IconButton
                    color="info"
                    onClick={() => handleRefresh("message")}
                    disabled={isLoadingMessages}
                    sx={{ mr: 1 }}
                  >
                    {isLoadingMessages ? (
                      <CircularProgress size={20} color="info" />
                    ) : (
                      <RefreshIcon />
                    )}
                  </IconButton>
                  <MDButton
                    variant="outlined"
                    color="info"
                    size="small"
                    onClick={() => handleMarkAllAsRead("message")}
                    disabled={!messageNotifications.some((msg) => !msg.read)}
                  >
                    Tout marquer comme lu
                  </MDButton>
                </MDBox>
              </MDBox>
              <Divider />
              <MDBox p={2}>
                {errorMessages && (
                  <MDAlert color="error" dismissible>
                    <MDTypography variant="body2" color="white">
                      {errorMessages}
                    </MDTypography>
                  </MDAlert>
                )}

                {isLoadingMessages && messageNotifications.length === 0 ? (
                  <MDBox display="flex" justifyContent="center" alignItems="center" p={4}>
                    <CircularProgress color="info" />
                  </MDBox>
                ) : (
                  <List sx={{ width: "100%", maxHeight: 400, overflow: "auto" }}>
                    {messageNotifications.length > 0 ? (
                      messageNotifications.map((notification) => (
                        <ListItem
                          key={notification.id}
                          secondaryAction={
                            <MDBox>
                              {!notification.read && (
                                <IconButton
                                  edge="end"
                                  aria-label="mark-read"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMarkAsRead(notification.id, "message");
                                  }}
                                  sx={{ mr: 1 }}
                                >
                                  <VisibilityIcon />
                                </IconButton>
                              )}
                              <IconButton
                                edge="end"
                                aria-label="delete"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteNotification(notification.id, "message");
                                }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </MDBox>
                          }
                          sx={{
                            mb: 1,
                            bgcolor: notification.read ? "transparent" : "rgba(0, 0, 255, 0.05)",
                            borderRadius: "8px",
                            "&:hover": { bgcolor: "rgba(0, 0, 255, 0.1)" },
                          }}
                          onClick={() => handleMarkAsRead(notification.id, "message")}
                        >
                          <ListItemAvatar>
                            <Avatar src={notification.avatar}>
                              <PersonIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <MDTypography
                                variant="button"
                                fontWeight={notification.read ? "regular" : "bold"}
                              >
                                {notification.sender}
                              </MDTypography>
                            }
                            secondary={
                              <>
                                <MDTypography variant="caption" display="block" color="text">
                                  {notification.content}
                                </MDTypography>
                                <MDTypography variant="caption" color="info">
                                  {notification.time}
                                </MDTypography>
                              </>
                            }
                          />
                        </ListItem>
                      ))
                    ) : (
                      <MDTypography variant="body2" color="text" textAlign="center" p={2}>
                        {isLoadingMessages
                          ? "Chargement des messages..."
                          : "Aucun message à afficher"}
                      </MDTypography>
                    )}
                  </List>
                )}
              </MDBox>
            </Card>
          </Grid>

          {/* Section pour les recommandations */}
          <Grid item xs={12} lg={5}>
            <Card>
              <MDBox p={2} display="flex" justifyContent="space-between" alignItems="center">
                <MDBox display="flex" alignItems="center">
                  <Badge badgeContent={unreadRecommendations} color="error" sx={{ mr: 2 }}>
                    <RecommendIcon color="action" />
                  </Badge>
                  <MDTypography variant="h6">Recommandations</MDTypography>
                </MDBox>
                <MDBox>
                  <IconButton
                    color="success"
                    onClick={() => handleRefresh("recommendation")}
                    disabled={isLoadingRecommendations}
                    sx={{ mr: 1 }}
                  >
                    {isLoadingRecommendations ? (
                      <CircularProgress size={20} color="success" />
                    ) : (
                      <RefreshIcon />
                    )}
                  </IconButton>
                  <MDButton
                    variant="outlined"
                    color="success"
                    size="small"
                    onClick={() => handleMarkAllAsRead("recommendation")}
                    disabled={!recommendationNotifications.some((rec) => !rec.read)}
                  >
                    Tout marquer comme lu
                  </MDButton>
                </MDBox>
              </MDBox>
              <Divider />
              <MDBox p={2}>
                {errorRecommendations && (
                  <MDAlert color="error" dismissible>
                    <MDTypography variant="body2" color="white">
                      {errorRecommendations}
                    </MDTypography>
                  </MDAlert>
                )}

                {isLoadingRecommendations && recommendationNotifications.length === 0 ? (
                  <MDBox display="flex" justifyContent="center" alignItems="center" p={4}>
                    <CircularProgress color="success" />
                  </MDBox>
                ) : (
                  <List sx={{ width: "100%", maxHeight: 400, overflow: "auto" }}>
                    {recommendationNotifications.length > 0 ? (
                      recommendationNotifications.map((notification) => (
                        <ListItem
                          key={notification.id}
                          secondaryAction={
                            <MDBox>
                              {!notification.read && (
                                <IconButton
                                  edge="end"
                                  aria-label="mark-read"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMarkAsRead(notification.id, "recommendation");
                                  }}
                                  sx={{ mr: 1 }}
                                >
                                  <VisibilityIcon />
                                </IconButton>
                              )}
                              <IconButton
                                edge="end"
                                aria-label="delete"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteNotification(notification.id, "recommendation");
                                }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </MDBox>
                          }
                          sx={{
                            mb: 1,
                            bgcolor: notification.read ? "transparent" : "rgba(0, 128, 0, 0.05)",
                            borderRadius: "8px",
                            "&:hover": { bgcolor: "rgba(0, 128, 0, 0.1)" },
                          }}
                          onClick={() => handleMarkAsRead(notification.id, "recommendation")}
                        >
                          <ListItemAvatar>
                            <Avatar
                              sx={{
                                bgcolor:
                                  notification.type === "cours"
                                    ? "info.main"
                                    : notification.type === "emploi"
                                    ? "success.main"
                                    : "warning.main",
                              }}
                            >
                              {notification.icon}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <MDTypography
                                variant="button"
                                fontWeight={notification.read ? "regular" : "bold"}
                              >
                                {notification.title}
                              </MDTypography>
                            }
                            secondary={
                              <>
                                <MDTypography variant="caption" display="block" color="text">
                                  {notification.description}
                                </MDTypography>
                                <MDTypography variant="caption" color="success">
                                  {notification.time}
                                </MDTypography>
                              </>
                            }
                          />
                        </ListItem>
                      ))
                    ) : (
                      <MDTypography variant="body2" color="text" textAlign="center" p={2}>
                        {isLoadingRecommendations
                          ? "Chargement des recommandations..."
                          : "Aucune recommandation à afficher"}
                      </MDTypography>
                    )}
                  </List>
                )}
              </MDBox>
            </Card>
          </Grid>

          {/* Section pour les rappels de développement professionnel */}
          <Grid item xs={12} lg={10}>
            <Card>
              <MDBox p={2} display="flex" justifyContent="space-between" alignItems="center">
                <MDBox display="flex" alignItems="center">
                  <Badge color="primary" sx={{ mr: 2 }}>
                    <SchoolIcon color="primary" />
                  </Badge>
                  <MDTypography variant="h6">Rappels et notifications pour encourager le développement professionnel</MDTypography>
                </MDBox>
              </MDBox>
              <Divider />
              <MDBox p={3}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Card sx={{ bgcolor: 'rgba(0, 0, 255, 0.05)', height: '100%' }}>
                      <MDBox p={2}>
                        <MDBox display="flex" alignItems="center" mb={2}>
                          <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                            <SchoolIcon />
                          </Avatar>
                          <MDTypography variant="h6">Formation continue</MDTypography>
                        </MDBox>
                        <MDTypography variant="body2" color="text" mb={2}>
                          Avez-vous exploré de nouvelles compétences ce mois-ci? Les professionnels qui consacrent 5 heures par semaine à l'apprentissage progressent 25% plus vite dans leur carrière.
                        </MDTypography>
                        <MDButton variant="outlined" color="info" size="small" fullWidth>
                          Voir les formations recommandées
                        </MDButton>
                      </MDBox>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Card sx={{ bgcolor: 'rgba(0, 128, 0, 0.05)', height: '100%' }}>
                      <MDBox p={2}>
                        <MDBox display="flex" alignItems="center" mb={2}>
                          <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                            <WorkIcon />
                          </Avatar>
                          <MDTypography variant="h6">Objectifs professionnels</MDTypography>
                        </MDBox>
                        <MDTypography variant="body2" color="text" mb={2}>
                          Il est temps de faire le point sur vos objectifs trimestriels. Mettre à jour régulièrement vos objectifs augmente de 80% vos chances de les atteindre.
                        </MDTypography>
                        <MDButton variant="outlined" color="success" size="small" fullWidth>
                          Mettre à jour mes objectifs
                        </MDButton>
                      </MDBox>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Card sx={{ bgcolor: 'rgba(255, 153, 0, 0.05)', height: '100%' }}>
                      <MDBox p={2}>
                        <MDBox display="flex" alignItems="center" mb={2}>
                          <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                            <PersonIcon />
                          </Avatar>
                          <MDTypography variant="h6">Réseautage professionnel</MDTypography>
                        </MDBox>
                        <MDTypography variant="body2" color="text" mb={2}>
                          Votre dernier contact avec votre réseau remonte à 3 semaines. Maintenir des interactions régulières est crucial pour le développement de carrière.
                        </MDTypography>
                        <MDButton variant="outlined" color="warning" size="small" fullWidth>
                          Explorer mon réseau
                        </MDButton>
                      </MDBox>
                    </Card>
                  </Grid>
                </Grid>
                
                <MDBox mt={3}>
                  <MDTypography variant="subtitle2" color="text" fontWeight="regular">
                    Ces rappels sont personnalisés en fonction de votre activité récente et de vos objectifs professionnels. Ils visent à vous encourager dans votre développement de carrière.
                  </MDTypography>
                </MDBox>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      {renderMessageSB}
      {renderRecommendationSB}
      <Footer />
    </DashboardLayout>
  );
}

export default Notifications;
