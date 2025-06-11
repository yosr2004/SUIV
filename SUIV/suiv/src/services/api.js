import axios from "axios";

// URL de base de l'API
const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Déterminer si nous utilisons des mocks ou de vraies API
const USE_MOCKS = process.env.REACT_APP_USE_MOCKS === "true" || true;

// Instance axios avec configuration de base
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Intercepteur pour ajouter le token d'authentification
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Données mockées pour simuler les réponses API
const mockData = {
  skills: {
    skills: {
      technical: {
        labels: ["React", "JavaScript", "Node.js", "HTML/CSS", "SQL"],
        datasets: {
          label: "Compétences",
          data: [85, 78, 72, 90, 65],
        },
      },
      soft: {
        labels: [
          "Communication",
          "Travail d'équipe",
          "Résolution de problèmes",
          "Autonomie",
          "Leadership",
        ],
        datasets: {
          label: "Compétences",
          data: [82, 88, 75, 92, 70],
        },
      },
      domain: {
        labels: ["Web Frontend", "Architecture", "Cloud", "Sécurité", "UX/UI"],
        datasets: {
          label: "Connaissances",
          data: [80, 65, 75, 60, 85],
        },
      },
    },
    improvement: 15,
  },

  performance: {
    performanceData: {
      progressOverTime: {
        labels: ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct"],
        datasets: {
          label: "Performance",
          data: [70, 72, 75, 74, 80, 82, 83, 85, 88, 90],
        },
      },
      skillsPerQuarter: {
        labels: ["Q1", "Q2", "Q3", "Q4"],
        datasets: {
          label: "Nouvelles compétences",
          data: [5, 8, 12, 7],
        },
      },
      evaluationScores: {
        labels: ["Technique", "Communication", "Leadership", "Travail d'équipe", "Innovation"],
        datasets: {
          label: "Évaluation",
          data: [4.2, 4.5, 3.8, 4.7, 4.0],
        },
      },
    },
    feedback: {
      avatar: "https://randomuser.me/api/portraits/men/41.jpg",
      name: "Thomas Martin",
      role: "Chef d'équipe",
      date: "Il y a 1 semaine",
      text: "Excellente progression ce trimestre. Vos compétences techniques se sont considérablement améliorées et votre contribution aux projets d'équipe a été remarquable. Continuez à travailler sur vos compétences en leadership.",
      badges: [
        { label: "Excellence technique", color: "success" },
        { label: "Collaboration efficace", color: "info" },
      ],
    },
  },

  notifications: {
    notifications: [
      {
        id: 1,
        title: "Nouvelle certification disponible",
        dateTime: "Aujourd'hui",
        description: "La certification AWS Solutions Architect est maintenant disponible pour vous",
        color: "success",
        icon: "school",
        badges: [{ color: "success", label: "Nouveau" }],
      },
      {
        id: 2,
        title: "Échéance projet approchante",
        dateTime: "Dans 2 jours",
        description: "Finalisez la documentation technique pour la revue d'architecture",
        color: "warning",
        icon: "assignment",
      },
      {
        id: 3,
        title: "Session de mentorat planifiée",
        dateTime: "Vendredi, 15h00",
        description: "Session avec Laurent Dubois, Expert DevOps",
        color: "primary",
        icon: "calendar_today",
        badges: [{ color: "primary", label: "Réunion" }],
      },
      {
        id: 4,
        title: "Évaluation trimestrielle",
        dateTime: "Semaine prochaine",
        description: "Préparez-vous pour l'évaluation trimestrielle avec votre manager",
        color: "info",
        icon: "assessment",
      },
    ],
    unreadCount: 3,
  },

  articles: {
    articles: [
      {
        id: 1,
        title: "Les tendances DevOps à surveiller en 2024",
        category: "DevOps",
        date: "5 février 2024",
        author: "Julie Dubois",
        image:
          "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-1.2.1&auto=format&fit=crop&w=2070&q=80",
        excerpt:
          "Découvrez les pratiques DevOps les plus innovantes et comment elles transforment le développement logiciel moderne...",
        readTime: "6 min de lecture",
        url: "https://www.lemagit.fr/conseil/DevOps-et-cloud-comment-les-entreprises-sadaptent-en-2024",
      },
      {
        id: 2,
        title: "Maîtriser React 18 : Les nouvelles fonctionnalités essentielles",
        category: "Développement Frontend",
        date: "20 janvier 2024",
        author: "Marc Lambert",
        image:
          "https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-1.2.1&auto=format&fit=crop&w=2070&q=80",
        excerpt:
          "React 18 apporte des améliorations significatives en termes de performance et de nouvelles API. Voici comment en tirer parti...",
        readTime: "8 min de lecture",
        url: "https://fr.reactjs.org/blog/2022/03/29/react-v18.html",
      },
      {
        id: 3,
        title: "Intelligence artificielle : Applications pratiques pour les développeurs",
        category: "IA & Machine Learning",
        date: "12 février 2024",
        author: "Sophie Mercier",
        image:
          "https://images.unsplash.com/photo-1677442135968-6cc4e364fca8?ixlib=rb-1.2.1&auto=format&fit=crop&w=2070&q=80",
        excerpt:
          "Comment intégrer des fonctionnalités d'IA dans vos applications sans être un expert en data science...",
        readTime: "10 min de lecture",
        url: "https://www.journaldunet.com/solutions/dsi/1516039-les-developpeurs-face-a-l-intelligence-artificielle/",
      },
      {
        id: 4,
        title: "Sécurité des API : Meilleures pratiques pour 2024",
        category: "Cybersécurité",
        date: "8 février 2024",
        author: "Alexandre Petit",
        image:
          "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?ixlib=rb-1.2.1&auto=format&fit=crop&w=2070&q=80",
        excerpt:
          "Protégez vos API contre les menaces émergentes avec ces techniques de sécurité éprouvées...",
        readTime: "7 min de lecture",
        url: "https://www.zdnet.fr/pratique/comment-securiser-vos-api-les-bonnes-pratiques-39958040.htm",
      },
    ],
  },

  dashboardStats: {
    stats: {
      skillsAcquired: { count: 38, percentage: 12 },
      evaluation: { score: "4.5/5", percentage: 15 },
      achievements: { count: 12, new: 4 },
      pendingTasks: { count: 3 },
    },
  },
};

// Fonction pour retourner des données mockées avec délai simulé
const getMockData = (dataKey) => {
  return new Promise((resolve) => {
    // Simuler un délai réseau (entre 300ms et 800ms)
    const delay = Math.floor(Math.random() * 500) + 300;
    setTimeout(() => {
      resolve(mockData[dataKey]);
    }, delay);
  });
};

// Services pour le tableau de bord
const dashboardService = {
  // Récupérer les données de progression des compétences
  getSkillProgress: async () => {
    try {
      if (USE_MOCKS) {
        return await getMockData("skills");
      }
      const response = await apiClient.get("/user/skills");
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération des compétences:", error);
      throw error;
    }
  },

  // Récupérer les données de performance
  getPerformanceData: async (params) => {
    try {
      if (USE_MOCKS) {
        return await getMockData("performance");
      }
      const response = await apiClient.get("/user/performance", { params });
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération des données de performance:", error);
      throw error;
    }
  },

  // Récupérer les notifications
  getNotifications: async () => {
    try {
      if (USE_MOCKS) {
        return await getMockData("notifications");
      }
      const response = await apiClient.get("/user/notifications");
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération des notifications:", error);
      throw error;
    }
  },

  // Récupérer les statistiques du tableau de bord
  getDashboardStats: async () => {
    try {
      if (USE_MOCKS) {
        return await getMockData("dashboardStats");
      }
      const response = await apiClient.get("/user/dashboard-stats");
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques:", error);
      throw error;
    }
  },

  // Récupérer les articles recommandés
  getRecommendedArticles: async () => {
    try {
      if (USE_MOCKS) {
        return await getMockData("articles");
      }
      const response = await apiClient.get("/content/articles");
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération des articles:", error);
      throw error;
    }
  },
};

export { dashboardService };
