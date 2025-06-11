import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { CircularProgress, Box } from "@mui/material";

// Composant qui protège les routes en vérifiant si l'utilisateur est authentifié
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, getCurrentUser } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Essayer de récupérer l'utilisateur courant si ce n'est pas déjà fait
    if (!isAuthenticated && !loading) {
      getCurrentUser();
    }
  }, [isAuthenticated, loading, getCurrentUser]);

  // Afficher un indicateur de chargement pendant la vérification de l'authentification
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Rediriger vers la page de connexion si l'utilisateur n'est pas authentifié
  if (!isAuthenticated) {
    // Stocker l'URL actuelle pour rediriger l'utilisateur après la connexion
    return <Navigate to="/authentication/sign-in" state={{ from: location }} replace />;
  }

  // Si l'utilisateur est authentifié, afficher le contenu protégé
  return children;
}

export default ProtectedRoute;
