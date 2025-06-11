import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Rating,
  Grid,
  Button,
  TextField,
  Chip,
  LinearProgress,
  CircularProgress,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Link,
  Tabs,
  Tab,
  Divider,
  Avatar,
} from "@mui/material";
import {
  Save as SaveIcon,
  Add as AddIcon,
  Assessment as AssessmentIcon,
  School as SchoolIcon,
  Launch as LaunchIcon,
  Videocam as VideocamIcon,
  YouTube as YouTubeIcon,
  WifiOff as WifiOffIcon,
} from "@mui/icons-material";
import MDBox from "components/MDBox";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// API URL
const API_URL = "http://localhost:5000/api/ai";

// Données simulées pour les analyses et recommandations d'IA
const simulatedAIData = {
  // Les données pour JavaScript
  JavaScript: {
    demand: "Très Élevée",
    growth: "+22%",
    averageSalary: "€55,000",
    relatedSkills: ["React", "Node.js", "TypeScript"],
    recommendedCourses: [
      {
        id: 1,
        title: "JavaScript Moderne pour le Développement Web",
        provider: "Udemy",
        rating: 4.7,
        url: "https://www.udemy.com/course/javascript-the-complete-guide-2020-beginner-advanced/",
      },
      {
        id: 2,
        title: "Formation JavaScript Avancée",
        provider: "Coursera",
        rating: 4.5,
        url: "https://www.coursera.org/learn/javascript",
      },
    ],
  },
  // Les données pour Python
  Python: {
    demand: "Très Élevée",
    growth: "+25%",
    averageSalary: "€60,000",
    relatedSkills: ["Django", "Flask", "Machine Learning"],
    recommendedCourses: [
      {
        id: 3,
        title: "Python pour la Science des Données",
        provider: "DataCamp",
        rating: 4.8,
        url: "https://www.datacamp.com/courses/intro-to-python-for-data-science",
      },
      {
        id: 4,
        title: "Développement Web avec Django",
        provider: "Udemy",
        rating: 4.6,
        url: "https://www.udemy.com/course/django-python-web-development/",
      },
    ],
  },
  // Les données pour React
  React: {
    demand: "Élevée",
    growth: "+20%",
    averageSalary: "€58,000",
    relatedSkills: ["JavaScript", "Redux", "HTML/CSS"],
    recommendedCourses: [
      {
        id: 5,
        title: "React - Le Guide Complet",
        provider: "Udemy",
        rating: 4.9,
        url: "https://www.udemy.com/course/react-the-complete-guide-incl-redux/",
      },
      {
        id: 6,
        title: "Applications React en Production",
        provider: "Frontend Masters",
        rating: 4.7,
        url: "https://frontendmasters.com/courses/complete-react-v7/",
      },
    ],
  },
  // Les données pour Node.js
  "Node.js": {
    demand: "Élevée",
    growth: "+18%",
    averageSalary: "€54,000",
    relatedSkills: ["Express.js", "MongoDB", "JavaScript"],
    recommendedCourses: [
      {
        id: 7,
        title: "Node.js, Express et MongoDB",
        provider: "Udemy",
        rating: 4.8,
        url: "https://www.udemy.com/course/nodejs-express-mongodb-bootcamp/",
      },
      {
        id: 8,
        title: "API REST avec Node.js",
        provider: "Pluralsight",
        rating: 4.6,
        url: "https://www.pluralsight.com/courses/nodejs-restful-api",
      },
    ],
  },
  // Les données pour SQL
  SQL: {
    demand: "Élevée",
    growth: "+15%",
    averageSalary: "€52,000",
    relatedSkills: ["Database Design", "PostgreSQL", "MySQL"],
    recommendedCourses: [
      {
        id: 9,
        title: "SQL Bootcamp",
        provider: "Udemy",
        rating: 4.7,
        url: "https://www.udemy.com/course/the-complete-sql-bootcamp/",
      },
      {
        id: 10,
        title: "SQL pour l'Analyse de Données",
        provider: "Coursera",
        rating: 4.5,
        url: "https://www.coursera.org/learn/sql-for-data-science",
      },
    ],
  },
  // Les données pour Communication
  Communication: {
    demand: "Très Élevée",
    growth: "+10%",
    averageSalary: "Varie selon le domaine",
    relatedSkills: ["Présentation", "Écoute Active", "Négociation"],
    recommendedCourses: [
      {
        id: 11,
        title: "Communication Efficace au Travail",
        provider: "LinkedIn Learning",
        rating: 4.6,
        url: "https://www.linkedin.com/learning/communication-foundations-4/",
      },
      {
        id: 12,
        title: "L'Art de la Communication",
        provider: "Coursera",
        rating: 4.8,
        url: "https://www.coursera.org/learn/effective-communication",
      },
    ],
  },
  // Les données pour Leadership
  Leadership: {
    demand: "Élevée",
    growth: "+12%",
    averageSalary: "Varie selon le niveau",
    relatedSkills: ["Gestion d'Équipe", "Délégation", "Motivation"],
    recommendedCourses: [
      {
        id: 13,
        title: "Leadership et Management",
        provider: "Coursera",
        rating: 4.7,
        url: "https://www.coursera.org/specializations/leadership-management",
      },
      {
        id: 14,
        title: "Développer son Leadership",
        provider: "Udemy",
        rating: 4.5,
        url: "https://www.udemy.com/course/leadership-management-team-building/",
      },
    ],
  },
  // Les données pour Problem Solving
  "Problem Solving": {
    demand: "Très Élevée",
    growth: "+15%",
    averageSalary: "Varie selon le domaine",
    relatedSkills: ["Pensée Critique", "Créativité", "Prise de Décision"],
    recommendedCourses: [
      {
        id: 15,
        title: "Résolution Créative de Problèmes",
        provider: "Coursera",
        rating: 4.8,
        url: "https://www.coursera.org/learn/creative-problem-solving",
      },
      {
        id: 16,
        title: "Pensée Critique et Analytique",
        provider: "edX",
        rating: 4.6,
        url: "https://www.edx.org/course/critical-thinking-for-problem-solving",
      },
    ],
  },
  // Les données pour Teamwork
  Teamwork: {
    demand: "Élevée",
    growth: "+8%",
    averageSalary: "Varie selon le domaine",
    relatedSkills: ["Collaboration", "Communication", "Adaptabilité"],
    recommendedCourses: [
      {
        id: 17,
        title: "Construire des Équipes Efficaces",
        provider: "LinkedIn Learning",
        rating: 4.5,
        url: "https://www.linkedin.com/learning/building-effective-teams/",
      },
      {
        id: 18,
        title: "Collaboration en Équipe Virtuelle",
        provider: "Coursera",
        rating: 4.7,
        url: "https://www.coursera.org/learn/virtual-teams",
      },
    ],
  },
  // Les données pour les langues
  English: {
    demand: "Très Élevée",
    growth: "+5%",
    averageSalary: "Bonus de 5-15%",
    relatedSkills: ["Communication Interculturelle", "Rédaction", "Présentation"],
    recommendedCourses: [
      {
        id: 19,
        title: "Business English",
        provider: "Coursera",
        rating: 4.8,
        url: "https://www.coursera.org/specializations/business-english",
      },
      {
        id: 20,
        title: "Anglais Professionnel",
        provider: "Babbel",
        rating: 4.6,
        url: "https://www.babbel.com/learn-english",
      },
    ],
  },
  French: {
    demand: "Modérée",
    growth: "+3%",
    averageSalary: "Bonus de 3-10%",
    relatedSkills: ["Communication Interculturelle", "Traduction", "Relations Internationales"],
    recommendedCourses: [
      {
        id: 21,
        title: "Français des Affaires",
        provider: "Alliance Française",
        rating: 4.7,
        url: "https://www.alliancefr.org/en/learn-french/business-french",
      },
      {
        id: 22,
        title: "Français Intermédiaire",
        provider: "Duolingo",
        rating: 4.5,
        url: "https://www.duolingo.com/course/fr/en/Learn-French",
      },
    ],
  },
  Spanish: {
    demand: "Modérée à Élevée",
    growth: "+7%",
    averageSalary: "Bonus de 3-12%",
    relatedSkills: [
      "Communication Interculturelle",
      "Marché Latino-Américain",
      "Relations Internationales",
    ],
    recommendedCourses: [
      {
        id: 23,
        title: "Espagnol des Affaires",
        provider: "Rosetta Stone",
        rating: 4.6,
        url: "https://www.rosettastone.com/learn-spanish/",
      },
      {
        id: 24,
        title: "Espagnol Conversationnel",
        provider: "Busuu",
        rating: 4.7,
        url: "https://www.busuu.com/learn-spanish",
      },
    ],
  },
  German: {
    demand: "Modérée à Élevée",
    growth: "+6%",
    averageSalary: "Bonus de 4-15%",
    relatedSkills: [
      "Communication Interculturelle",
      "Marché Allemand",
      "Relations Internationales",
    ],
    recommendedCourses: [
      {
        id: 25,
        title: "Allemand des Affaires",
        provider: "Goethe-Institut",
        rating: 4.8,
        url: "https://www.goethe.de/en/spr/kup/kur/wir.html",
      },
      {
        id: 26,
        title: "Allemand Professionnel",
        provider: "Babbel",
        rating: 4.5,
        url: "https://www.babbel.com/learn-german",
      },
    ],
  },
};

// Données par défaut pour les autres compétences
const defaultAnalysis = {
  demand: "Modérée",
  growth: "+5%",
  averageSalary: "Varie selon l'expérience",
  relatedSkills: ["Apprentissage Continu", "Adaptabilité"],
  recommendedCourses: [
    {
      id: 100,
      title: "Apprentissage de Nouvelles Compétences",
      provider: "LinkedIn Learning",
      rating: 4.5,
      url: "https://www.linkedin.com/learning/",
    },
    {
      id: 101,
      title: "Formations Professionnelles",
      provider: "Udemy",
      rating: 4.6,
      url: "https://www.udemy.com/",
    },
  ],
};

const skillCategories = [
  {
    name: "Technical Skills",
    skills: ["JavaScript", "React", "Node.js", "Python", "SQL"],
  },
  {
    name: "Soft Skills",
    skills: ["Communication", "Leadership", "Problem Solving", "Teamwork"],
  },
  {
    name: "Languages",
    skills: ["English", "French", "Spanish", "German"],
  },
];

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

function SkillsAssessment() {
  const [skillRatings, setSkillRatings] = useState({});
  const [newSkill, setNewSkill] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Technical Skills");
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: "", type: "success" });
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [recommendedCourses, setRecommendedCourses] = useState([]);
  const [recommendedVideos, setRecommendedVideos] = useState([]);
  const [analysisError, setAnalysisError] = useState("");
  const [dataSource, setDataSource] = useState("loading"); // Valeurs possibles: 'loading', 'ai', 'fallback'

  // Simuler le chargement de données sauvegardées
  useEffect(() => {
    // Dans une application réelle, vous chargeriez ces données depuis votre API
    const savedRatings = localStorage.getItem("skillRatings");
    if (savedRatings) {
      setSkillRatings(JSON.parse(savedRatings));
    }
  }, []);

  const handleRatingChange = (skill, newValue) => {
    setSkillRatings((prev) => ({
      ...prev,
      [skill]: newValue,
    }));
  };

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      const category = skillCategories.find((cat) => cat.name === selectedCategory);
      if (category && !category.skills.includes(newSkill)) {
        category.skills.push(newSkill);
        setNewSkill("");
        setNotification({
          open: true,
          message: `Compétence "${newSkill}" ajoutée avec succès !`,
          type: "success",
        });
      }
    }
  };

  const handleSaveRatings = () => {
    setSaving(true);
    // Simuler une sauvegarde API
    setTimeout(() => {
      // Dans une application réelle, vous enverriez ces données à votre API
      localStorage.setItem("skillRatings", JSON.stringify(skillRatings));
      setSaving(false);
      setNotification({
        open: true,
        message: "Évaluations de compétences sauvegardées avec succès !",
        type: "success",
      });
    }, 1000);
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleAnalyzeSkill = async (skill) => {
    console.log("Analyse demandée pour la compétence:", skill);
    setSelectedSkill(skill);
    setLoadingAnalysis(true);
    setAnalysisOpen(true);
    setAnalysisData(null);
    setRecommendedCourses([]);
    setRecommendedVideos([]);
    setAnalysisError("");
    setTabValue(0); // Reset to first tab
    setDataSource("loading"); // Indique le chargement initial

    try {
      // Obtenir les tendances du marché
      const marketResponse = await axios.get(`${API_URL}/market-trends`, {
        params: {
          skill,
          _t: Date.now(), // Timestamp pour éviter le cache
        },
        timeout: 15000, // Timeout étendu
      });

      // Vérifier que la réponse est valide
      if (marketResponse?.data) {
        console.log("Réponse reçue pour l'analyse:", marketResponse.data);
        setAnalysisData(marketResponse.data);
        setDataSource("ai");

        // Obtenir des recommandations de cours
        try {
          const coursesResponse = await axios.post(
            `${API_URL}/training-recommendations`,
            {
              skills: [skill],
              level: getSkillLevel(skillRatings[skill] || 3).toLowerCase(),
            },
            { timeout: 15000 }
          );

          if (Array.isArray(coursesResponse?.data)) {
            setRecommendedCourses(
              coursesResponse.data.map((course) => ({
                ...course,
                source: "ai",
                verified: true,
              }))
            );
          }
        } catch (courseError) {
          console.error("Erreur lors de la récupération des cours:", courseError);
          // Utiliser des cours par défaut si erreur
          setRecommendedCourses([
            {
              title: `Formation en ${skill}`,
              provider: "Udemy",
              description: `Apprenez ${skill} de façon professionnelle`,
              duration: "20 heures",
              level: getSkillLevel(skillRatings[skill] || 3),
              rating: 4.5,
              url: `https://www.udemy.com/courses/search/?q=${skill}`,
              source: "fallback",
              verified: false,
            },
          ]);
        }

        // Obtenir des recommandations de vidéos YouTube
        try {
          const videosResponse = await axios.get(`${API_URL}/youtube-recommendations`, {
            params: { skill },
            timeout: 15000,
          });

          if (Array.isArray(videosResponse?.data)) {
            setRecommendedVideos(
              videosResponse.data.map((video) => ({
                ...video,
                source: "ai",
                verified: true,
              }))
            );
          }
        } catch (videoError) {
          console.error("Erreur lors de la récupération des vidéos:", videoError);
          // Utiliser des vidéos par défaut si erreur
          setRecommendedVideos([
            {
              title: `Tutoriel ${skill} pour débutants`,
              channel: "Tech Learning",
              views: "100K+",
              length: "45:00",
              url: `https://www.youtube.com/results?search_query=${skill}+tutoriel`,
              source: "fallback",
              verified: false,
            },
          ]);
        }
      }
    } catch (error) {
      console.error("Erreur globale lors de l'analyse:", error);
      setAnalysisError(
        "Erreur lors de la récupération des données. Utilisation du mode hors-ligne."
      );
      setDataSource("fallback");

      // Utiliser des données fictives pour que l'interface reste utilisable
      setAnalysisData({
        demand: "Données non disponibles",
        growth: "Données non disponibles",
        salary: "Données non disponibles",
        skills: ["Apprentissage autodidacte"],
        industries: [],
        source: "fallback",
        verified: false,
      });

      setRecommendedCourses([
        {
          title: `Formation en ${skill}`,
          provider: "Mode hors-ligne",
          description: "Les recommandations précises nécessitent une connexion à l'API.",
          url: `https://www.google.com/search?q=cours+${skill}`,
          source: "fallback",
          verified: false,
        },
      ]);

      setRecommendedVideos([
        {
          title: `Tutoriels ${skill}`,
          channel: "Mode hors-ligne",
          views: "N/A",
          length: "N/A",
          url: `https://www.youtube.com/results?search_query=${skill}+tutoriel`,
          source: "fallback",
          verified: false,
        },
      ]);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const handleCloseAnalysis = () => {
    setAnalysisOpen(false);
    setSelectedSkill(null);
  };

  const getSkillLevel = (rating) => {
    if (!rating) return "Non évalué";
    if (rating <= 1) return "Débutant";
    if (rating <= 2) return "Élémentaire";
    if (rating <= 3) return "Intermédiaire";
    if (rating <= 4) return "Avancé";
    return "Expert";
  };

  // Calculer le score global basé sur les compétences techniques
  const calculateOverallScore = () => {
    const technicalSkills =
      skillCategories.find((cat) => cat.name === "Technical Skills")?.skills || [];
    let sum = 0;
    let count = 0;

    technicalSkills.forEach((skill) => {
      if (skillRatings[skill]) {
        sum += skillRatings[skill];
        count++;
      }
    });

    return count ? Math.round((sum / count) * 20) : 0; // Score sur 100
  };

  // Obtenir les données d'analyse en format présentable
  const getFormattedAnalysisData = () => {
    if (!analysisData) return null;

    // Essaie de formater les données de différentes façons selon le format retourné par l'API
    const demand = analysisData.demand || analysisData.demande;
    const growth = analysisData.growth || analysisData.croissance;
    const salary = analysisData.averageSalary || analysisData.salaire || analysisData.salaireMoyen;
    const skills = analysisData.relatedSkills || analysisData.competencesAssociees || [];
    const industries = analysisData.industries || analysisData.secteurs || [];

    return {
      demand: demand || "Non disponible",
      growth: growth || "Non disponible",
      salary: salary || "Variable selon l'expérience",
      skills: Array.isArray(skills) ? skills : [],
      industries: Array.isArray(industries) ? industries : [],
    };
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox p={3}>
        <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h4" gutterBottom>
            Auto-évaluation des compétences
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={handleSaveRatings}
            disabled={saving}
          >
            {saving ? "Sauvegarde..." : "Sauvegarder mon évaluation"}
          </Button>
        </Box>

        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Score global
                </Typography>
                <Box
                  sx={{
                    position: "relative",
                    display: "inline-flex",
                    width: "100%",
                    justifyContent: "center",
                    mb: 2,
                  }}
                >
                  <CircularProgress
                    variant="determinate"
                    value={calculateOverallScore()}
                    size={100}
                    thickness={5}
                    color="success"
                  />
                  <Box
                    sx={{
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0,
                      position: "absolute",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography variant="h4" component="div" color="text.secondary">
                      {calculateOverallScore()}%
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Votre score est basé sur vos auto-évaluations des compétences techniques.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Ajouter une nouvelle compétence
                </Typography>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={5}>
                    <TextField
                      fullWidth
                      label="Nom de la compétence"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      select
                      label="Catégorie"
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      SelectProps={{
                        native: true,
                      }}
                    >
                      {skillCategories.map((category) => (
                        <option key={category.name} value={category.name}>
                          {category.name}
                        </option>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<AddIcon />}
                      onClick={handleAddSkill}
                      fullWidth
                    >
                      Ajouter
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {skillCategories.map((category) => (
          <Card key={category.name} sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {category.name}
              </Typography>
              <Grid container spacing={2}>
                {category.skills.map((skill) => (
                  <Grid item xs={12} sm={6} md={4} key={skill}>
                    <Card variant="outlined" sx={{ p: 2 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          mb: 1,
                        }}
                      >
                        <Typography component="legend">{skill}</Typography>
                        <Button
                          size="small"
                          color="primary"
                          onClick={() => handleAnalyzeSkill(skill)}
                          startIcon={<AssessmentIcon />}
                        >
                          Analyser
                        </Button>
                      </Box>
                      <Rating
                        name={`rating-${skill}`}
                        value={skillRatings[skill] || 0}
                        onChange={(event, newValue) => {
                          handleRatingChange(skill, newValue);
                        }}
                        size="large"
                        sx={{ mb: 1 }}
                      />
                      <Box sx={{ width: "100%" }}>
                        <LinearProgress
                          variant="determinate"
                          value={(skillRatings[skill] || 0) * 20}
                          sx={{ height: 8, borderRadius: 5 }}
                        />
                      </Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mt: 1, display: "block" }}
                      >
                        Niveau: {getSkillLevel(skillRatings[skill])}
                      </Typography>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        ))}

        {/* Notification */}
        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
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

        {/* Dialogue d'analyse de compétence */}
        <Dialog open={analysisOpen} onClose={handleCloseAnalysis} maxWidth="md" fullWidth>
          <DialogTitle>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Typography variant="h6">Analyse: {selectedSkill}</Typography>
              {dataSource === "ai" ? (
                <Chip
                  label="Généré par IA"
                  color="primary"
                  size="small"
                  icon={<AssessmentIcon />}
                  sx={{ bgcolor: "#4caf50" }}
                />
              ) : dataSource === "fallback" ? (
                <Chip
                  label="Mode hors-ligne"
                  color="default"
                  size="small"
                  icon={<WifiOffIcon />}
                  sx={{ bgcolor: "#ff9800" }}
                />
              ) : (
                <Chip
                  label="Chargement..."
                  color="default"
                  size="small"
                  sx={{ bgcolor: "#2196f3" }}
                />
              )}
            </Box>
          </DialogTitle>

          <DialogContent dividers>
            {loadingAnalysis ? (
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", my: 5 }}>
                <CircularProgress />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  L'IA analyse la compétence {selectedSkill}...
                </Typography>
              </Box>
            ) : analysisError ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                {analysisError}
              </Alert>
            ) : (
              <>
                <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                  <Tabs value={tabValue} onChange={handleTabChange} aria-label="analysis tabs">
                    <Tab label="Tendances du marché" {...a11yProps(0)} />
                    <Tab label="Formations" {...a11yProps(1)} />
                    <Tab label="Vidéos YouTube" {...a11yProps(2)} />
                  </Tabs>
                </Box>

                <TabPanel value={tabValue} index={0}>
                  {getFormattedAnalysisData() ? (
                    <Box>
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                          <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle1" fontWeight="bold">
                              Demande sur le marché
                            </Typography>
                            <Typography variant="body1">
                              {getFormattedAnalysisData().demand}
                            </Typography>
                          </Box>

                          <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle1" fontWeight="bold">
                              Croissance
                            </Typography>
                            <Typography variant="body1">
                              {getFormattedAnalysisData().growth}
                            </Typography>
                          </Box>

                          <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle1" fontWeight="bold">
                              Salaire moyen
                            </Typography>
                            <Typography variant="body1">
                              {getFormattedAnalysisData().salary}
                            </Typography>
                          </Box>
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle1" fontWeight="bold">
                              Compétences associées
                            </Typography>
                            <Box sx={{ mt: 1 }}>
                              {getFormattedAnalysisData().skills.map((skill, index) => (
                                <Chip
                                  key={index}
                                  label={skill}
                                  size="small"
                                  sx={{ mr: 1, mb: 1 }}
                                />
                              ))}
                            </Box>
                          </Box>

                          {getFormattedAnalysisData().industries.length > 0 && (
                            <Box>
                              <Typography variant="subtitle1" fontWeight="bold">
                                Industries concernées
                              </Typography>
                              <Box sx={{ mt: 1 }}>
                                {getFormattedAnalysisData().industries.map((industry, index) => (
                                  <Chip
                                    key={index}
                                    label={industry}
                                    size="small"
                                    color="secondary"
                                    variant="outlined"
                                    sx={{ mr: 1, mb: 1 }}
                                  />
                                ))}
                              </Box>
                            </Box>
                          )}
                        </Grid>
                      </Grid>
                    </Box>
                  ) : (
                    <Alert severity="info">
                      Données d'analyse non disponibles pour cette compétence.
                    </Alert>
                  )}
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                  <Box sx={{ mb: 2 }}>
                    {dataSource === "ai" ? (
                      <Alert severity="success" sx={{ mb: 2 }}>
                        Ces recommandations ont été générées par l'IA spécifiquement pour{" "}
                        {selectedSkill}.
                      </Alert>
                    ) : dataSource === "fallback" ? (
                      <Alert severity="warning" sx={{ mb: 2 }}>
                        Mode hors-ligne: Ces recommandations sont génériques et non personnalisées.
                      </Alert>
                    ) : null}

                    {recommendedCourses.length > 0 ? (
                      <Grid container spacing={2}>
                        {recommendedCourses.map((course, index) => (
                          <Grid item xs={12} key={index}>
                            <Card variant="outlined" sx={{ mb: 2 }}>
                              <CardContent>
                                <Typography variant="h6">{course.title}</Typography>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                  {course.provider} • {course.duration || "Durée variable"} •{" "}
                                  {course.level || "Tous niveaux"}
                                </Typography>

                                {course.description && (
                                  <Typography variant="body2" paragraph>
                                    {course.description}
                                  </Typography>
                                )}

                                <Box
                                  sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    mt: 1,
                                  }}
                                >
                                  <Box>
                                    {course.rating && (
                                      <Box sx={{ display: "flex", alignItems: "center" }}>
                                        <Rating value={course.rating} readOnly size="small" />
                                        <Typography variant="body2" sx={{ ml: 1 }}>
                                          {course.rating}
                                        </Typography>
                                      </Box>
                                    )}
                                  </Box>

                                  <Button
                                    variant="outlined"
                                    color="primary"
                                    startIcon={<LaunchIcon />}
                                    component="a"
                                    href={
                                      course.url ||
                                      `https://www.google.com/search?q=${course.title} ${course.provider}`
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    Accéder au cours
                                  </Button>
                                </Box>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    ) : (
                      <Alert severity="info">
                        Aucune formation n'a été recommandée pour cette compétence.
                      </Alert>
                    )}
                  </Box>
                </TabPanel>

                <TabPanel value={tabValue} index={2}>
                  {recommendedVideos.length > 0 ? (
                    <Grid container spacing={3}>
                      {recommendedVideos.map((video, index) => (
                        <Grid item xs={12} key={index}>
                          <Card variant="outlined" sx={{ mb: 2 }}>
                            <Box
                              sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" } }}
                            >
                              <Box
                                sx={{
                                  width: { xs: "100%", sm: 180 },
                                  height: { xs: 180, sm: 120 },
                                  bgcolor: "grey.200",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <YouTubeIcon sx={{ fontSize: 60, color: "red" }} />
                              </Box>

                              <CardContent sx={{ flex: "1 0 auto" }}>
                                <Typography variant="h6" component="div">
                                  {video.title}
                                </Typography>
                                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                                  <Avatar
                                    sx={{
                                      width: 24,
                                      height: 24,
                                      mr: 1,
                                      bgcolor: "grey.400",
                                      fontSize: "0.8rem",
                                    }}
                                  >
                                    {video.channel ? video.channel.charAt(0) : "YT"}
                                  </Avatar>
                                  <Typography variant="subtitle2" color="text.secondary">
                                    {video.channel}
                                  </Typography>
                                </Box>
                                <Typography variant="body2" color="text.secondary">
                                  {video.views || "—"} vues • Durée: {video.length || "—"}
                                </Typography>
                                <Button
                                  variant="contained"
                                  color="error"
                                  size="small"
                                  startIcon={<YouTubeIcon />}
                                  sx={{ mt: 2 }}
                                  component="a"
                                  href={
                                    video.url ||
                                    `https://www.youtube.com/results?search_query=${selectedSkill}+tutorial`
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  Regarder
                                </Button>
                              </CardContent>
                            </Box>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Alert severity="info">
                      Aucune vidéo n'a été recommandée pour cette compétence.
                    </Alert>
                  )}
                </TabPanel>
              </>
            )}
          </DialogContent>

          <DialogActions>
            <Button onClick={handleCloseAnalysis}>Fermer</Button>
          </DialogActions>
        </Dialog>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default SkillsAssessment;
