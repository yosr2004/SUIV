import React, { useState, useEffect } from "react";
import { Box, Container, Paper, Tabs, Tab, Alert, Snackbar, Fade, Button } from "@mui/material";
import {
  Person as PersonIcon,
  Login as LoginIcon,
  Description as DescriptionIcon,
} from "@mui/icons-material";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../../contexts/AuthContext";
import ProfileCard from "./ProfileCard";
import AuthForms from "./AuthForms";
import MDBox from "components/MDBox";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import CVAnalyzer from "./CVAnalyzer.js";

function ProfileManager() {
  const { currentUser, error, loading } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [notification, setNotification] = useState({ open: false, message: "", type: "success" });
  const [showCVAnalyzer, setShowCVAnalyzer] = useState(false);

  // Effet pour afficher une notification lors de la connexion/déconnexion
  useEffect(() => {
    if (currentUser) {
      toast.success(`sauvegardé !`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  }, [currentUser]);

  // Effet pour afficher une notification d'erreur
  useEffect(() => {
    if (error) {
      toast.error(error, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  }, [error]);

  // Gérer le changement d'onglet
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Gérer les notifications
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  // Gérer le succès de l'authentification
  const handleAuthSuccess = () => {
    setNotification({
      open: true,
      message: "Connexion réussie !",
      type: "success",
    });
  };

  // Fonction pour basculer entre profil et analyseur de CV
  const toggleCVAnalyzer = () => {
    setShowCVAnalyzer(!showCVAnalyzer);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox p={3}>
        <ToastContainer />

        {/* Notification */}
        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          TransitionComponent={Fade}
        >
          <Alert
            onClose={handleCloseNotification}
            severity={notification.type}
            variant="filled"
            sx={{ width: "100%" }}
          >
            {notification.message}
          </Alert>
        </Snackbar>

        {/* Contenu principal */}
        <Fade in={true} timeout={500}>
          <div>
            {currentUser ? (
              // Si l'utilisateur est connecté
              <>
                {/* Bouton pour basculer entre profil et analyseur de CV */}
                <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
                  <Button
                    variant={showCVAnalyzer ? "outlined" : "contained"}
                    color="primary"
                    startIcon={showCVAnalyzer ? <PersonIcon /> : <DescriptionIcon />}
                    onClick={toggleCVAnalyzer}
                    size="medium"
                    sx={{
                      borderRadius: 2,
                      px: 3,
                      py: 1,
                      boxShadow: showCVAnalyzer ? 0 : 2,
                      fontWeight: "medium",
                    }}
                  >
                    {showCVAnalyzer ? "Retour au profil" : "Analyser mon CV avec IA"}
                  </Button>
                </Box>

                {/* Afficher soit le profil, soit l'analyseur de CV */}
                {showCVAnalyzer ? <CVAnalyzer /> : <ProfileCard />}
              </>
            ) : (
              // Si l'utilisateur n'est pas connecté, affichez le formulaire d'authentification
              <AuthForms onSuccess={handleAuthSuccess} />
            )}
          </div>
        </Fade>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default ProfileManager;
