import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Card,
  CardContent,
  Grid,
  Chip,
  CircularProgress,
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Stack,
} from "@mui/material";
import {
  Upload as UploadIcon,
  Article as ArticleIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  CheckCircle as CheckCircleIcon,
  BarChart as BarChartIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Psychology as PsychologyIcon,
} from "@mui/icons-material";
import MDBox from "components/MDBox";
import axios from "axios";

const CVAnalyzer = () => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      if (
        selectedFile.type === "application/pdf" ||
        selectedFile.type === "application/msword" ||
        selectedFile.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        setFile(selectedFile);
        setFileName(selectedFile.name);
        setError("");
      } else {
        setError("Formats acceptés: PDF, DOC, DOCX");
        setFile(null);
        setFileName("");
      }
    }
  };

  // Fonction pour simuler l'analyse (pour les tests)
  const simulateAnalysis = () => {
    setLoading(true);

    setTimeout(() => {
      setResults({
        overallScore: 78,
        summary:
          "CV solide avec de bonnes compétences techniques mais pourrait améliorer la présentation.",
        skills: {
          technical: [
            { name: "JavaScript", level: "expert" },
            { name: "React", level: "intermediate" },
            { name: "Node.js", level: "intermediate" },
            { name: "HTML/CSS", level: "expert" },
            { name: "SQL", level: "beginner" },
          ],
          soft: ["Communication", "Travail d'équipe", "Résolution de problèmes", "Organisation"],
        },
        education: {
          level: "Master en Informatique",
          relevance: 4,
        },
        experience: {
          years: 3,
          relevance: 4,
        },
        strengths: [
          "Forte expérience en développement frontend",
          "Bonnes compétences en JavaScript et frameworks modernes",
          "Formation académique solide",
        ],
        improvements: [
          "Ajouter plus de détails sur les projets réalisés",
          "Inclure des métriques et résultats quantifiables",
          "Améliorer la mise en page du CV",
        ],
        recommendations: [
          {
            title: "Enrichir votre portfolio avec des projets GitHub",
            description:
              "Ajoutez des liens vers vos projets open source ou personnels pour démontrer vos compétences pratiques.",
          },
          {
            title: "Développer vos compétences en backend",
            description:
              "Renforcer vos connaissances en Node.js et bases de données pour devenir un développeur full-stack plus complet.",
          },
          {
            title: "Certifications recommandées",
            description:
              "Envisagez d'obtenir une certification AWS ou Azure pour améliorer votre profil.",
          },
        ],
      });
      setLoading(false);
    }, 2000);
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError("Veuillez sélectionner un fichier");
      return;
    }

    /* Commentez cette ligne pour utiliser l'API réelle
    simulateAnalysis();
    */

    // Décommentez ce bloc pour utiliser l'API réelle
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("cv", file);

    try {
      const response = await axios.post("http://localhost:5000/api/ai/analyze-cv", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setResults(response.data);
    } catch (error) {
      console.error("Error analyzing CV:", error);
      setError("Erreur lors de l'analyse du CV. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  // Helper pour afficher les étoiles de notation
  const renderRating = (rating) => {
    return (
      <Box display="flex" alignItems="center">
        {[...Array(5)].map((_, i) =>
          i < rating ? (
            <StarIcon key={i} color="primary" fontSize="small" />
          ) : (
            <StarBorderIcon key={i} color="primary" fontSize="small" />
          )
        )}
        <Typography variant="body2" ml={1}>
          ({rating}/5)
        </Typography>
      </Box>
    );
  };

  return (
    <MDBox>
      <Typography variant="h5" fontWeight="medium" mb={2}>
        Analyse de CV
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="body1" mb={2}>
            Téléchargez votre CV pour une analyse automatique par intelligence artificielle. Nous
            extrairons automatiquement vos compétences, expériences, et formations pour vous fournir
            des recommandations personnalisées.
          </Typography>

          <Box
            sx={{
              border: "2px dashed #ccc",
              borderRadius: 2,
              p: 3,
              textAlign: "center",
              backgroundColor: "#f8f9fa",
              mb: 3,
            }}
          >
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              style={{ display: "none" }}
              id="cv-upload"
            />
            <label htmlFor="cv-upload">
              <Button
                variant="contained"
                component="span"
                startIcon={<UploadIcon />}
                sx={{ mb: 2 }}
              >
                Sélectionner un CV
              </Button>
            </label>

            {fileName && (
              <Box mt={1}>
                <Typography variant="body2" color="primary">
                  <ArticleIcon fontSize="small" sx={{ verticalAlign: "middle", mr: 1 }} />
                  {fileName}
                </Typography>
              </Box>
            )}

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </Box>

          <Button
            variant="contained"
            color="primary"
            fullWidth
            disabled={!file || loading}
            onClick={handleAnalyze}
            startIcon={
              loading ? <CircularProgress size={20} color="inherit" /> : <PsychologyIcon />
            }
            sx={{
              py: 1.5,
              fontSize: "1.1rem",
              borderRadius: 2,
              background: "linear-gradient(45deg, #4776E6 0%, #8E54E9 100%)",
              boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
              "&:hover": {
                background: "linear-gradient(45deg, #3e68cc 0%, #7a46cb 100%)",
                boxShadow: "0 6px 15px rgba(0,0,0,0.2)",
              },
            }}
          >
            {loading ? "Analyse en cours..." : "Analyser mon CV avec Intelligence Artificielle"}
          </Button>
        </CardContent>
      </Card>

      {loading && (
        <Box sx={{ width: "100%", mt: 2, mb: 2 }}>
          <LinearProgress />
          <Typography variant="body2" color="text.secondary" align="center" mt={1}>
            L'analyse peut prendre jusqu'à 30 secondes...
          </Typography>
        </Box>
      )}

      {results && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" mb={2} display="flex" alignItems="center">
                  <PsychologyIcon sx={{ mr: 1 }} />
                  Évaluation générale
                </Typography>

                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Box sx={{ position: "relative", display: "inline-flex", mr: 2 }}>
                    <CircularProgress
                      variant="determinate"
                      value={results.overallScore || 0}
                      size={80}
                      thickness={4}
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
                      <Typography variant="h6" component="div" color="text.secondary">
                        {results.overallScore || 0}%
                      </Typography>
                    </Box>
                  </Box>
                  <Box>
                    <Typography variant="body1" fontWeight="medium">
                      {results.summary || "Analyse complétée"}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" color="text.secondary" mb={1}>
                  Forces:
                </Typography>
                <List dense disablePadding>
                  {results.strengths && results.strengths.map((strength, index) => (
                    <ListItem key={index} disablePadding sx={{ py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 30 }}>
                        <CheckCircleIcon color="success" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={strength} />
                    </ListItem>
                  ))}
                </List>

                <Typography variant="subtitle2" color="text.secondary" mt={2} mb={1}>
                  Pistes d'amélioration:
                </Typography>
                <List dense disablePadding>
                  {results.improvements && results.improvements.map((improvement, index) => (
                    <ListItem key={index} disablePadding sx={{ py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 30 }}>
                        <BarChartIcon color="warning" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={improvement} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" mb={2} display="flex" alignItems="center">
                  <WorkIcon sx={{ mr: 1 }} />
                  Compétences identifiées
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" mb={1}>
                    Compétences techniques:
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {results.skills && results.skills.technical && results.skills.technical.map((skill, index) => (
                      <Chip
                        key={index}
                        label={skill.name}
                        color="primary"
                        variant="outlined"
                        size="small"
                        sx={{ mb: 1 }}
                      />
                    ))}
                  </Stack>
                </Box>

                <Box>
                  <Typography variant="subtitle2" mb={1}>
                    Soft skills:
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {results.skills && results.skills.soft && results.skills.soft.map((skill, index) => (
                      <Chip
                        key={index}
                        label={skill}
                        color="secondary"
                        variant="outlined"
                        size="small"
                        sx={{ mb: 1 }}
                      />
                    ))}
                  </Stack>
                </Box>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" mb={2} display="flex" alignItems="center">
                  <SchoolIcon sx={{ mr: 1 }} />
                  Formation et expérience
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" mb={1}>
                    Niveau d'éducation:
                  </Typography>
                  <Typography variant="body1">{results.education && results.education.level}</Typography>
                  {results.education && results.education.relevance && (
                    <Box mt={1}>
                      <Typography variant="body2" color="text.secondary">
                        Pertinence par rapport au profil:
                      </Typography>
                      {renderRating(results.education.relevance)}
                    </Box>
                  )}
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box>
                  <Typography variant="subtitle2" mb={1}>
                    Expérience professionnelle:
                  </Typography>
                  <Typography variant="body1">
                    {results.experience && results.experience.years} années d'expérience
                  </Typography>
                  {results.experience && results.experience.relevance && (
                    <Box mt={1}>
                      <Typography variant="body2" color="text.secondary">
                        Pertinence par rapport au profil:
                      </Typography>
                      {renderRating(results.experience.relevance)}
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" mb={2}>
                  Recommandations personnalisées
                </Typography>

                <List>
                  {results.recommendations && results.recommendations.map((recommendation, index) => (
                    <ListItem key={index} sx={{ py: 1 }}>
                      <ListItemIcon>
                        <StarIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={recommendation.title}
                        secondary={recommendation.description}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </MDBox>
  );
};

export default CVAnalyzer;
