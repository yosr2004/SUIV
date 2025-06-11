/**
 * Données de progression des compétences pour le tableau de bord
 */

export default {
  technical: {
    labels: ["Programmation", "Base de données", "DevOps", "Sécurité", "Développement API"],
    datasets: { label: "Compétences techniques", data: [85, 70, 65, 75, 80] },
  },
  soft: {
    labels: [
      "Communication",
      "Travail d'équipe",
      "Leadership",
      "Résolution de problèmes",
      "Adaptabilité",
    ],
    datasets: { label: "Compétences relationnelles", data: [75, 85, 65, 90, 80] },
  },
  domain: {
    labels: [
      "Connaissance du secteur",
      "Sens des affaires",
      "Conception produit",
      "Principes UX",
      "Tendances du marché",
    ],
    datasets: { label: "Connaissances du domaine", data: [60, 70, 80, 75, 65] },
  },
};
