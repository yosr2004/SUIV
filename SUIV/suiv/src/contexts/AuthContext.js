import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import authService from "../services/authService";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Créer le contexte
const AuthContext = createContext();

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuth = () => useContext(AuthContext);

// Fournisseur du contexte
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Récupérer l'utilisateur courant
  const getCurrentUser = useCallback(async () => {
    setLoading(true);
    try {
      // Vérifier si le token est valide
      const user = authService.getCurrentUser();
      if (user) {
        console.log("AuthContext: Vérification du token d'authentification...");
        // Vérifier la validité du token sur le serveur
        const result = await authService.verifyToken();
        if (result.success) {
          console.log("AuthContext: Token valide, mise à jour des données utilisateur");

          // Vérifier si les skills existent dans les données retournées
          if (!result.data.skills) {
            console.log("AuthContext: Les certifications sont manquantes dans la réponse serveur");

            // Conservation des skills existants de l'utilisateur courant si disponibles
            if (currentUser && Array.isArray(currentUser.skills)) {
              console.log("AuthContext: Conservation des certifications existantes");
              result.data.skills = currentUser.skills;
            } else {
              // Recherche dans le sessionStorage
              const storedUser = JSON.parse(sessionStorage.getItem("user") || "{}");
              if (storedUser && Array.isArray(storedUser.skills)) {
                console.log("AuthContext: Utilisation des certifications du sessionStorage");
                result.data.skills = storedUser.skills;
              } else {
                console.log("AuthContext: Initialisation d'un tableau de certifications vide");
                result.data.skills = [];
              }
            }
          }

          // Vérifier si les données ont changé avant de mettre à jour l'état
          const shouldUpdate = JSON.stringify(currentUser) !== JSON.stringify(result.data);

          if (shouldUpdate) {
            // Mettre à jour les informations utilisateur avec les données les plus récentes du serveur
            setCurrentUser(result.data);

            // Mettre à jour le stockage session avec les données récentes
            sessionStorage.setItem("user", JSON.stringify(result.data));

            // Vérification post-mise à jour
            const storedUserAfter = JSON.parse(sessionStorage.getItem("user") || "{}");
            console.log(
              "AuthContext: Vérification post-mise à jour des certifications:",
              storedUserAfter.skills ? storedUserAfter.skills.length : 0
            );
          } else {
            console.log(
              "AuthContext: Aucun changement dans les données utilisateur, pas de mise à jour"
            );
          }
        } else {
          // Si le token n'est pas valide, déconnecter l'utilisateur
          console.log("Token invalide, déconnexion...");
          authService.logout();
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
    } catch (err) {
      console.error("Erreur lors de la récupération de l'utilisateur", err);
      authService.logout();
      setCurrentUser(null);
      setError("Session expirée. Veuillez vous reconnecter.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Vérifier l'authentification au démarrage de l'application
  useEffect(() => {
    getCurrentUser();
  }, [getCurrentUser]);

  // Connexion utilisateur
  const login = async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      console.log("AuthContext: Tentative de connexion avec", email);
      const result = await authService.login(email, password);

      console.log("AuthContext: Résultat de la connexion:", result);

      if (result.success) {
        setCurrentUser(result.data.user);
        toast.success(`Bienvenue, ${result.data.user.firstName} !`);
        return { success: true };
      } else {
        const errorMsg = result.error || "Erreur de connexion";
        console.error("AuthContext: Erreur de connexion:", errorMsg);
        setError(errorMsg);
        toast.error(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      console.error("AuthContext: Exception lors de la connexion:", err);
      const errorMessage = err.message || "Erreur de connexion";
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Inscription utilisateur
  const register = async (userData) => {
    setLoading(true);
    setError(null);

    try {
      const result = await authService.register(userData);

      if (result.success) {
        setCurrentUser(result.data.user);
        toast.success(`Bienvenue, ${result.data.user.firstName} !`);
        return { success: true };
      } else {
        const errorMsg = result.error || "Erreur d'inscription";
        setError(errorMsg);
        toast.error(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      const errorMessage = err.message || "Erreur d'inscription";
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Déconnexion utilisateur
  const logout = () => {
    authService.logout();
    setCurrentUser(null);
    toast.info("Vous avez été déconnecté");
  };

  // Mise à jour du profil
  const updateProfile = async (profileData) => {
    setLoading(true);
    setError(null);

    try {
      const result = await authService.updateProfile(profileData);

      if (result.success) {
        setCurrentUser(result.data.user);
        toast.success("Profil mis à jour avec succès");
        return { success: true };
      } else {
        const errorMsg = result.error || "Erreur lors de la mise à jour du profil";
        setError(errorMsg);
        toast.error(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      const errorMessage = err.message || "Erreur lors de la mise à jour du profil";
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Mise à jour de l'avatar
  const updateAvatar = async (file) => {
    setLoading(true);
    setError(null);

    try {
      const result = await authService.updateAvatar(file);

      if (result.success) {
        setCurrentUser(result.data.user);
        toast.success("Avatar mis à jour avec succès");
        return { success: true };
      } else {
        const errorMsg = result.error || "Erreur lors de la mise à jour de l'avatar";
        setError(errorMsg);
        toast.error(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      const errorMessage = err.message || "Erreur lors de la mise à jour de l'avatar";
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Mise à jour des compétences
  const updateSkills = async (skills) => {
    setLoading(true);
    setError(null);

    try {
      const result = await authService.updateSkills(skills);

      if (result.success) {
        setCurrentUser(result.data.user);
        toast.success("Compétences mises à jour avec succès");
        return { success: true };
      } else {
        const errorMsg = result.error || "Erreur lors de la mise à jour des compétences";
        setError(errorMsg);
        toast.error(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      const errorMessage = err.message || "Erreur lors de la mise à jour des compétences";
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour directement les données utilisateur (sans appel API)
  const updateUserData = (userData) => {
    try {
      console.log("Mise à jour des données utilisateur:", userData);
      // Récupérer l'utilisateur actuel
      const current = sessionStorage.getItem("user");
      if (!current) return false;

      const currentUser = JSON.parse(current);

      // Traitement spécial pour les objets imbriqués comme contact
      let updatedUser = { ...currentUser };

      // Mise à jour avec deep merge pour objets imbriqués
      Object.keys(userData).forEach((key) => {
        if (typeof userData[key] === "object" && userData[key] !== null) {
          // Créer l'objet s'il n'existe pas
          if (!updatedUser[key]) updatedUser[key] = {};

          // Fusion profonde
          updatedUser[key] = {
            ...updatedUser[key],
            ...userData[key],
          };

          console.log(`Fusion profonde pour ${key}:`, updatedUser[key]);
        } else {
          // Assignation simple pour les valeurs primitives
          updatedUser[key] = userData[key];
        }
      });

      // Sauvegarder dans le sessionStorage
      sessionStorage.setItem("user", JSON.stringify(updatedUser));

      // Mettre à jour l'état
      setCurrentUser(updatedUser);
      console.log("Données utilisateur mises à jour:", updatedUser);

      // Vérifier spécifiquement les données de contact
      if (userData.contact) {
        console.log("Vérification des données de contact mises à jour:", updatedUser.contact);
      }

      return true;
    } catch (error) {
      console.error("Erreur lors de la mise à jour directe des données utilisateur:", error);
      return false;
    }
  };

  // Valeurs exposées par le contexte
  const contextValue = {
    currentUser,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    updateAvatar,
    updateSkills,
    updateUserData,
    getCurrentUser,
    isAuthenticated: !!currentUser,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export default AuthContext;
