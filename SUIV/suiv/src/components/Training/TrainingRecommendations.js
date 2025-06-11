import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Grid,
  Button,
  Chip,
  Rating,
  IconButton,
  Tooltip,
  CircularProgress,
  TextField,
  MenuItem,
  Alert,
  Autocomplete,
  Tabs,
  Tab,
} from "@mui/material";
import {
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Share as ShareIcon,
  Search as SearchIcon,
  TrendingUp as TrendingUpIcon,
} from "@mui/icons-material";
import MDBox from "components/MDBox";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import aiService from "../../services/aiservice";
import QuizAssessment from "./QuizAssessment";
import { Link } from "react-router-dom";
import axios from "axios";

// Liste des compétences disponibles
const availableSkills = [
  "JavaScript",
  "React",
  "Angular",
  "Vue.js",
  "Node.js",
  "Python",
  "Django",
  "Flask",
  "SQL",
  "MongoDB",
  "AWS",
  "Azure",
  "Docker",
  "Kubernetes",
  "CI/CD",
  "Git",
  "Machine Learning",
  "Data Science",
  "UX/UI Design",
  "Product Management",
  "Agile",
  "Scrum",
  "DevOps",
];

function TrainingRecommendations() {
  const [courses, setCourses] = useState([]);
  const [savedCourses, setSavedCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [skillLevel, setSkillLevel] = useState("intermédiaire");
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentSkill, setCurrentSkill] = useState("");
  const [trendingSkills, setTrendingSkills] = useState([
    { name: "React", growth: "+25%" },
    { name: "Cloud Computing", growth: "+30%" },
    { name: "Data Science", growth: "+40%" },
  ]);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    // Charger les cours sauvegardés depuis le stockage local
    const saved = localStorage.getItem("savedCourses");
    if (saved) {
      setSavedCourses(JSON.parse(saved));
    }

    // Au lieu de charger des cours par défaut, montrer un message pour encourager
    // l'utilisateur à sélectionner des compétences pour des recommandations d'IA
  }, []);

  const toggleSaveCourse = (courseId) => {
    setSavedCourses((prev) => {
      const newSaved = prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId];

      // Sauvegarder dans le stockage local
      localStorage.setItem("savedCourses", JSON.stringify(newSaved));
      return newSaved;
    });
  };

  const handleShare = (course) => {
    // Implémentation du partage (pourrait utiliser l'API Web Share)
    if (navigator.share) {
      navigator.share({
        title: course.title,
        text: `Je te recommande ce cours: ${course.title}`,
        url: course.url || window.location.href,
      });
    } else {
      // Fallback pour les navigateurs qui ne supportent pas l'API Web Share
      navigator.clipboard
        .writeText(course.url || window.location.href)
        .then(() => {
          alert(`Lien copié: ${course.title}`);
        })
        .catch((err) => {
          console.error("Erreur lors de la copie du lien:", err);
        });
    }
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      return;
    }

    setLoading(true);

    // Utiliser l'IA pour rechercher des cours
    const searchSkills = [searchQuery];
    setSelectedSkills(searchSkills);

    aiService
      .getTrainingRecommendations(searchSkills, skillLevel)
      .then((result) => {
        if (result.success && result.data) {
          const formattedCourses = result.data.map((course, index) => ({
            id: `search-${Date.now()}-${index}`,
            title: course.title,
            provider: course.provider,
            description: course.description,
            image: "https://example.com/course.jpg",
            rating: course.rating || 4.5,
            price: course.price || "Gratuit",
            skills: [searchQuery],
            duration: course.duration,
            level: course.level,
            students: Math.floor(Math.random() * 10000) + 1000,
            lastUpdated: new Date().toISOString().split("T")[0],
            aiRecommended: true,
            url: course.url,
          }));

          setCourses(formattedCourses);
        } else {
          setError(result.error || "Aucun cours trouvé pour cette recherche.");
          setCourses([]);
        }
      })
      .catch((err) => {
        console.error("Erreur de recherche:", err);
        setError("Une erreur est survenue lors de la recherche.");
        setCourses([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const getAIRecommendations = async () => {
    if (selectedSkills.length === 0) {
      setError("Veuillez sélectionner au moins une compétence pour obtenir des recommandations.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await aiService.getTrainingRecommendations(selectedSkills, skillLevel);

      if (result.success && result.data) {
        // Formatter les cours reçus
        const formattedCourses = result.data.map((course, index) => ({
          id: `ai-${Date.now()}-${index}`,
          title: course.title || `Cours de ${selectedSkills[0]}`,
          provider: course.provider || "Formation en ligne",
          description: course.description || `Formation en ${selectedSkills[0]}`,
          image: course.image || "https://example.com/ai-recommended.jpg",
          rating: parseFloat(course.rating) || 4.5,
          price: course.price || "Gratuit",
          skills: [...selectedSkills],
          duration: course.duration || "20 heures",
          level: course.level || skillLevel,
          students: course.students || Math.floor(Math.random() * 10000) + 1000,
          lastUpdated: new Date().toISOString().split("T")[0],
          aiRecommended: !course.isDefault,
          defaultRecommendation: course.isDefault || false,
          url:
            course.url ||
            `https://www.google.com/search?q=${encodeURIComponent(selectedSkills[0])}+formation`,
        }));

        setCourses(formattedCourses);

        if (formattedCourses.some((course) => course.defaultRecommendation)) {
          setError(
            "Les recommandations par défaut sont affichées car l'IA n'a pas pu générer de recommandations personnalisées. Vous pouvez réessayer ou modifier vos critères."
          );
        }
      } else {
        setError(
          result.error || "Impossible de récupérer des recommandations pour ces compétences."
        );
        createDefaultCourses();
      }
    } catch (err) {
      console.error("Erreur lors de la récupération des recommandations:", err);
      setError("Une erreur est survenue lors de la récupération des recommandations.");
      createDefaultCourses();
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour créer des cours par défaut
  const createDefaultCourses = () => {
    const mainSkill = selectedSkills.length > 0 ? selectedSkills[0] : "programmation";

    const defaultCourses = [
      {
        id: `fallback-${Date.now()}-0`,
        title: `Formation complète ${mainSkill}`,
        provider: "Udemy",
        description: `Un cours complet pour apprendre ${mainSkill} depuis les bases jusqu'aux techniques avancées.`,
        image: "https://example.com/default-course.jpg",
        rating: 4.5,
        price: "À partir de €29.99",
        skills: [mainSkill],
        duration: "25 heures",
        level: skillLevel,
        students: 5000,
        lastUpdated: new Date().toISOString().split("T")[0],
        aiRecommended: false,
        defaultRecommendation: true,
        url: `https://www.udemy.com/courses/search/?q=${encodeURIComponent(mainSkill)}`,
      },
      {
        id: `fallback-${Date.now()}-1`,
        title: `${mainSkill} pour les professionnels`,
        provider: "Coursera",
        description: `Formation intensive sur ${mainSkill} avec certification reconnue mondialement.`,
        image: "https://example.com/default-course.jpg",
        rating: 4.7,
        price: "Gratuit (certification payante)",
        skills: [mainSkill],
        duration: "40 heures",
        level: skillLevel,
        students: 8500,
        lastUpdated: new Date().toISOString().split("T")[0],
        aiRecommended: false,
        defaultRecommendation: true,
        url: `https://www.coursera.org/search?query=${encodeURIComponent(mainSkill)}`,
      },
      {
        id: `fallback-${Date.now()}-2`,
        title: `${mainSkill} par la pratique`,
        provider: "OpenClassrooms",
        description: `Apprenez ${mainSkill} avec des projets pratiques et un accompagnement personnalisé.`,
        image: "https://example.com/default-course.jpg",
        rating: 4.6,
        price: "Accès gratuit",
        skills: [mainSkill],
        duration: "30 heures",
        level: skillLevel,
        students: 7200,
        lastUpdated: new Date().toISOString().split("T")[0],
        aiRecommended: false,
        defaultRecommendation: true,
        url: `https://openclassrooms.com/fr/search?query=${encodeURIComponent(mainSkill)}`,
      },
    ];

    setCourses(defaultCourses);
  };

  const handleChangeTab = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox p={3}>
        <Typography variant="h4" gutterBottom>
          Formation et Évaluation de Compétences
        </Typography>

        <Tabs
          value={activeTab}
          onChange={handleChangeTab}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          sx={{ mb: 3 }}
        >
          <Tab label="Recommandations de Cours" />
          <Tab label="Quiz d'Autoévaluation" />
        </Tabs>

        {activeTab === 0 ? (
          <>
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Obtenez des recommandations personnalisées avec l'IA
                </Typography>

                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={5}>
                    <Autocomplete
                      multiple
                      options={availableSkills}
                      value={selectedSkills}
                      onChange={(event, newValue) => setSelectedSkills(newValue)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Sélectionnez vos compétences"
                          placeholder="Compétences"
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      select
                      fullWidth
                      label="Niveau de compétence"
                      value={skillLevel}
                      onChange={(e) => setSkillLevel(e.target.value)}
                    >
                      <MenuItem value="débutant">Débutant</MenuItem>
                      <MenuItem value="intermédiaire">Intermédiaire</MenuItem>
                      <MenuItem value="avancé">Avancé</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={getAIRecommendations}
                      disabled={loading}
                      fullWidth
                      startIcon={
                        loading ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : (
                          <TrendingUpIcon />
                        )
                      }
                    >
                      {loading ? "Analyse en cours..." : "Obtenir des recommandations IA"}
                    </Button>
                  </Grid>
                </Grid>

                {error && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                  </Alert>
                )}

                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Compétences en tendance:
                  </Typography>
                  <Box>
                    {trendingSkills.map((skill) => (
                      <Chip
                        key={skill.name}
                        label={`${skill.name} (${skill.growth})`}
                        color="primary"
                        variant="outlined"
                        onClick={() => {
                          setSelectedSkills([skill.name]);
                          getAIRecommendations();
                        }}
                        sx={{ mr: 1, mb: 1 }}
                      />
                    ))}
                  </Box>
                </Box>
              </CardContent>
            </Card>

            <Box sx={{ mb: 3, display: "flex" }}>
              <TextField
                fullWidth
                label="Rechercher des cours"
                variant="outlined"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ mr: 2 }}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleSearch}
                disabled={loading}
                startIcon={<SearchIcon />}
              >
                Rechercher
              </Button>
            </Box>

            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", my: 5 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Grid container spacing={3}>
                {courses.length > 0 ? (
                  courses.map((course) => (
                    <Grid item xs={12} md={6} lg={4} key={course.id}>
                      <Card
                        sx={
                          course.aiRecommended
                            ? {
                                border: "2px solid #3f51b5",
                                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                              }
                            : {}
                        }
                      >
                        <CardMedia
                          component="div"
                          sx={{
                            height: 140,
                            backgroundColor: course.defaultRecommendation
                              ? "grey.200"
                              : "primary.light",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: course.defaultRecommendation ? "text.secondary" : "white",
                          }}
                        >
                          <Typography variant="h6">{course.provider}</Typography>
                        </CardMedia>
                        <CardContent>
                          {course.aiRecommended && (
                            <Chip
                              label="Recommandé par IA"
                              color="primary"
                              size="small"
                              sx={{ mb: 1 }}
                            />
                          )}
                          {course.defaultRecommendation && (
                            <Chip
                              label="Suggestion standard"
                              color="default"
                              size="small"
                              variant="outlined"
                              sx={{ mb: 1 }}
                            />
                          )}
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                            }}
                          >
                            <Typography variant="h6" gutterBottom>
                              {course.title}
                            </Typography>
                            <Box>
                              <IconButton
                                onClick={() => toggleSaveCourse(course.id)}
                                color={savedCourses.includes(course.id) ? "primary" : "default"}
                                size="small"
                              >
                                {savedCourses.includes(course.id) ? (
                                  <BookmarkIcon />
                                ) : (
                                  <BookmarkBorderIcon />
                                )}
                              </IconButton>
                              <IconButton onClick={() => handleShare(course)} size="small">
                                <ShareIcon />
                              </IconButton>
                            </Box>
                          </Box>

                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            {course.provider} • {course.duration} • {course.level}
                          </Typography>

                          <Typography variant="body2" color="text.secondary" paragraph>
                            {course.description}
                          </Typography>

                          <Box sx={{ mb: 2, display: "flex", alignItems: "center" }}>
                            <Rating value={course.rating} precision={0.1} readOnly size="small" />
                            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                              {course.rating} ({course.students?.toLocaleString()} étudiants)
                            </Typography>
                          </Box>

                          <Box sx={{ mb: 2 }}>
                            {course.skills.map((skill) => (
                              <Chip
                                key={skill}
                                label={skill}
                                size="small"
                                sx={{ mr: 1, mb: 1 }}
                                onClick={() => {
                                  setSelectedSkills([skill]);
                                  getAIRecommendations();
                                }}
                              />
                            ))}
                          </Box>

                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              mt: 2,
                            }}
                          >
                            <Typography variant="h6" color="primary">
                              {course.price}
                            </Typography>
                            <Button
                              variant="contained"
                              color="primary"
                              component="a"
                              href={course.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              S'inscrire
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))
                ) : (
                  <Grid item xs={12}>
                    <Alert severity="info">
                      Sélectionnez des compétences ci-dessus et cliquez sur "Obtenir des
                      recommandations IA" pour découvrir des formations adaptées à votre profil.
                    </Alert>
                  </Grid>
                )}
              </Grid>
            )}
          </>
        ) : (
          <QuizAssessment />
        )}
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default TrainingRecommendations;
