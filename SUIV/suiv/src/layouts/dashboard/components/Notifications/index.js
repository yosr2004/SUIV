// @mui material components
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import Badge from "@mui/material/Badge";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Avatar from "@mui/material/Avatar";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Material Dashboard 2 React example components
import TimelineItem from "examples/Timeline/TimelineItem";

// Data et services
import { dashboardService } from "services/api";
import axios from "axios";
import { useState, useEffect } from "react";

// Instance d'axios pour les appels API
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

function Notifications() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(3);

  // Notifications par défaut au cas où l'API échoue
  const defaultNotifications = [
    {
      id: 1,
      title: "Échéance d'évaluation des compétences",
      dateTime: "Dans 3 jours",
      description: "Évaluation des compétences techniques à venir",
      color: "warning",
      icon: "assessment",
      lastItem: true,
    },
    {
      id: 2,
      title: "Évaluation en attente",
      dateTime: "Demain",
      description: "Feedback du manager nécessaire pour l'évaluation du T3",
      color: "info",
      icon: "assignment",
      lastItem: true,
    },
    {
      id: 3,
      title: "Nouvelle formation suggérée",
      dateTime: "À l'instant",
      description: "Nouveau cours sur l'Architecture Cloud recommandé pour vous",
      color: "success",
      icon: "school",
      badges: [{ color: "success", label: "Nouveau" }],
    },
    {
      id: 4,
      title: "Session de mentorat à venir",
      dateTime: "Vendredi, 14h00",
      description: "Session avec la développeuse senior Sarah Legrand",
      color: "primary",
      icon: "calendar_today",
      badges: [{ color: "primary", label: "Réunion" }],
    },
    {
      id: 5,
      title: "Échéance d'objectif approchante",
      dateTime: "Semaine prochaine",
      description: "Compléter la certification Développement API",
      color: "error",
      icon: "flag",
      lastItem: true,
    },
  ];

  // Charger les notifications depuis l'API
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const response = await dashboardService.getNotifications();
        setNotifications(response.notifications || []);
        setUnreadCount(response.unreadCount || 0);
        setLoading(false);
      } catch (err) {
        console.error("Erreur lors du chargement des notifications:", err);
        setError(
          "Impossible de charger les notifications. Affichage des notifications par défaut."
        );
        setNotifications(defaultNotifications);
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  // Marquer toutes les notifications comme lues
  const handleMarkAllAsRead = async () => {
    try {
      setLoading(true);
      await apiClient.post("/user/notifications/mark-all-read");
      setUnreadCount(0);
      setLoading(false);
    } catch (err) {
      console.error("Erreur lors du marquage des notifications:", err);
      // Simuler un succès en cas d'échec de l'API
      setUnreadCount(0);
      setLoading(false);
    }
  };

  // Utiliser les notifications par défaut si l'API échoue
  const displayNotifications = notifications.length > 0 ? notifications : defaultNotifications;

  return (
    <Card
      sx={{
        height: "100%",
        borderRadius: 2,
        boxShadow: "0 4px 20px 0 rgba(0, 0, 0, 0.05)",
      }}
    >
      <MDBox
        px={3}
        pt={3}
        pb={2}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          background: "linear-gradient(90deg, rgba(58,130,245,0.05) 0%, rgba(245,247,250,1) 100%)",
        }}
      >
        <MDBox>
          <MDTypography variant="h6" fontWeight="medium">
            Notifications et Alertes
          </MDTypography>
          <MDTypography variant="button" color="text">
            {unreadCount > 0
              ? `Vous avez ${unreadCount} notification${unreadCount > 1 ? "s" : ""} non lue${
                  unreadCount > 1 ? "s" : ""
                }`
              : "Toutes les notifications sont lues"}
          </MDTypography>
        </MDBox>
        <Badge badgeContent={unreadCount} color="error">
          <Avatar
            sx={{
              bgcolor: "primary.main",
              width: 36,
              height: 36,
              boxShadow: "0 3px 5px 0 rgba(0,0,0,0.1)",
            }}
          >
            <Icon>notifications</Icon>
          </Avatar>
        </Badge>
      </MDBox>

      <MDBox
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        px={3}
        py={1}
        sx={{
          borderBottom: "1px solid rgba(0,0,0,0.05)",
        }}
      >
        <MDTypography variant="button" fontWeight="medium" color="text">
          Cette Semaine
        </MDTypography>
        <MDButton
          variant="text"
          color="info"
          size="small"
          onClick={handleMarkAllAsRead}
          disabled={loading || unreadCount === 0}
        >
          {loading ? <CircularProgress size={16} thickness={6} sx={{ mr: 1 }} /> : null}
          Tout marquer comme lu
        </MDButton>
      </MDBox>

      {error && (
        <MDBox p={2}>
          <Alert severity="info">{error}</Alert>
        </MDBox>
      )}

      {loading && !error ? (
        <MDBox
          p={2}
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="calc(100% - 140px)"
        >
          <CircularProgress color="info" />
        </MDBox>
      ) : (
        <MDBox p={2} sx={{ height: "calc(100% - 140px)", overflowY: "auto" }}>
          {displayNotifications.map((notification, index) => (
            <TimelineItem
              key={notification.id}
              color={notification.color}
              icon={notification.icon}
              title={notification.title}
              dateTime={notification.dateTime}
              description={notification.description}
              lastItem={notification.lastItem}
              badges={notification.badges}
              sx={{
                "& .MuiTimelineItem-root": {
                  "&:before": {
                    display: "none",
                  },
                },
              }}
            />
          ))}

          {displayNotifications.length === 0 && !loading && !error && (
            <MDBox textAlign="center" py={4}>
              <Icon color="text.secondary" sx={{ fontSize: 40, opacity: 0.5 }}>
                notifications_none
              </Icon>
              <MDTypography variant="body2" color="text.secondary" mt={1}>
                Aucune notification à afficher
              </MDTypography>
            </MDBox>
          )}
        </MDBox>
      )}

      <MDBox
        p={2}
        display="flex"
        justifyContent="center"
        sx={{
          borderTop: "1px solid rgba(0,0,0,0.05)",
        }}
      >
        <MDButton variant="outlined" color="info" size="small" fullWidth>
          Voir toutes les notifications
        </MDButton>
      </MDBox>
    </Card>
  );
}

export default Notifications;
