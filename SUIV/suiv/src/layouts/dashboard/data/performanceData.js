/**
 * Données de performance et d'évaluation pour le tableau de bord
 */

export default {
  progressOverTime: {
    labels: ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep"],
    datasets: { label: "Score de progression", data: [65, 68, 70, 72, 75, 78, 80, 83, 85] },
  },
  skillsPerQuarter: {
    labels: ["T1", "T2", "T3", "T4"],
    datasets: [
      {
        label: "Compétences techniques",
        data: [3, 4, 5, 6],
      },
      {
        label: "Compétences relationnelles",
        data: [2, 3, 4, 5],
      },
      {
        label: "Connaissances du domaine",
        data: [1, 2, 4, 3],
      },
    ],
  },
  evaluationScores: {
    labels: [
      "Collaboration d'équipe",
      "Qualité du code",
      "Résolution de problèmes",
      "Communication",
      "Initiative",
    ],
    datasets: {
      label: "Évaluation du manager",
      data: [4.2, 4.5, 4.3, 4.0, 4.7],
    },
  },
};
