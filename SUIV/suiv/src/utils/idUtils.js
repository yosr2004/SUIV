/**
 * Utilitaires pour gérer les différents formats d'identifiants d'utilisateurs
 * et assurer la compatibilité entre les différentes parties de l'application
 */

/**
 * Obtient l'ID utilisateur dans un format cohérent, quelle que soit la source
 * @param {Object} user - Objet utilisateur qui peut contenir id ou _id
 * @returns {String} L'identifiant utilisateur normalisé
 */
export const getUserId = (user) => {
  if (!user) return null;

  // Si l'utilisateur est une chaîne, supposer que c'est déjà un ID
  if (typeof user === "string") return user;

  // Préférer _id (format MongoDB) s'il existe
  if (user._id) return user._id;

  // Sinon utiliser id
  if (user.id) return user.id;

  // En dernier recours, essayer de trouver quelque chose qui ressemble à un ID
  for (const key in user) {
    if (key.toLowerCase().includes("id") && typeof user[key] === "string") {
      return user[key];
    }
  }

  // Si rien n'est trouvé, retourner null
  return null;
};

/**
 * Convertit un tableau d'utilisateurs pour assurer un format cohérent des IDs
 * @param {Array} users - Tableau d'objets utilisateur
 * @returns {Array} Tableau d'objets utilisateur avec IDs normalisés
 */
export const normalizeUserIds = (users) => {
  if (!Array.isArray(users)) return [];

  return users
    .map((user) => {
      if (!user) return null;

      const id = getUserId(user);

      return {
        ...user,
        id,
        _id: id, // Inclure les deux formats pour compatibilité
      };
    })
    .filter((user) => user !== null);
};

/**
 * Détermine si deux identifiants utilisateur font référence au même utilisateur,
 * quelle que soit leur format
 * @param {String|Object} user1 - Premier utilisateur ou ID
 * @param {String|Object} user2 - Deuxième utilisateur ou ID
 * @returns {Boolean} true si les deux font référence au même utilisateur
 */
export const isSameUser = (user1, user2) => {
  const id1 = getUserId(user1);
  const id2 = getUserId(user2);

  if (!id1 || !id2) return false;

  return id1 === id2;
};

/**
 * Normalise la donnée utilisateur dans le localStorage pour assurer la consistance des IDs
 * Cette fonction est utile pour s'assurer que les deux formats id et _id sont disponibles
 */
export const normalizeStoredUserData = () => {
  try {
    // Récupérer l'utilisateur depuis localStorage
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return false;

    const userData = JSON.parse(storedUser);
    if (!userData) return false;

    // Récupérer l'ID dans le format disponible
    const userId = getUserId(userData);
    if (!userId) return false;

    // S'assurer que les deux formats sont présents
    const updatedUserData = {
      ...userData,
      id: userId,
      _id: userId,
    };

    // Sauvegarder les données normalisées
    localStorage.setItem("user", JSON.stringify(updatedUserData));
    return true;
  } catch (error) {
    console.error("Erreur lors de la normalisation des données utilisateur:", error);
    return false;
  }
};

export default {
  getUserId,
  normalizeUserIds,
  isSameUser,
  normalizeStoredUserData,
};
