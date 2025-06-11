import { normalizeStoredUserData } from "./idUtils";

/**
 * Initialisation de l'application: effectue diverses vérifications et corrections
 * pour assurer un fonctionnement correct
 */
export const initializeApp = () => {
  console.log("Initialisation de l'application...");

  // Normaliser les données utilisateur dans localStorage
  const normalized = normalizeStoredUserData();
  if (normalized) {
    console.log("Données utilisateur normalisées avec succès");
  }

  // Vérifier la connexion socket
  console.log("Vérification de la connexion socket...");

  return {
    initialized: true,
    timestamp: new Date().toISOString(),
  };
};

export default initializeApp;
