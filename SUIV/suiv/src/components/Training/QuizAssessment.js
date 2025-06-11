import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  TextField,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  InputLabel,
} from "@mui/material";
import {
  Check as CheckIcon,
  Close as CloseIcon,
  Help as HelpIcon,
  Refresh as RefreshIcon,
  Psychology as PsychologyIcon,
  EmojiEvents as EmojiEventsIcon,
} from "@mui/icons-material";
import MDBox from "components/MDBox";
import quizData from "../../data/quizData";
import aiService from "../../services/aiservice";

const specialties = [
  "Développement Web Frontend",
  "Développement Web Backend",
  "Développement Mobile",
  "DevOps",
  "Sécurité Informatique",
  "Science des Données",
  "Intelligence Artificielle",
  "Cloud Computing",
  "Administration Système",
  "Réseau Informatique",
];

const difficultyLevels = ["Débutant", "Intermédiaire", "Avancé"];

function QuizAssessment() {
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [difficulty, setDifficulty] = useState("Intermédiaire");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [explanationDialog, setExplanationDialog] = useState({
    open: false,
    question: "",
    explanation: "",
  });
  const [isAIAnalysis, setIsAIAnalysis] = useState(false);

  const generateQuiz = () => {
    if (!selectedSpecialty) {
      setError("Veuillez sélectionner une spécialité.");
      return;
    }

    setLoading(true);
    setError("");
    setQuestions([]);
    setUserAnswers([]);
    setQuizStarted(false);
    setQuizFinished(false);
    setAnalysisResult(null);

    try {
      // Chercher les quiz disponibles pour cette spécialité
      const specialtyQuizzes = Object.entries(quizData).find(
        ([key, _]) =>
          key.toLowerCase().includes(selectedSpecialty.toLowerCase()) ||
          selectedSpecialty.toLowerCase().includes(key.toLowerCase())
      );

      if (specialtyQuizzes && specialtyQuizzes[1][difficulty]) {
        const questions = specialtyQuizzes[1][difficulty];
        setQuestions(questions);
        setUserAnswers(new Array(questions.length).fill(""));
        setQuizStarted(true);
      } else {
        // Si aucun quiz n'est trouvé pour cette spécialité/difficulté spécifique
        // Essayer de trouver des quiz pour cette spécialité avec n'importe quelle difficulté
        if (specialtyQuizzes) {
          const availableDifficulties = Object.keys(specialtyQuizzes[1]);
          if (availableDifficulties.length > 0) {
            const fallbackDifficulty = availableDifficulties[0];
            const questions = specialtyQuizzes[1][fallbackDifficulty];
            setQuestions(questions);
            setUserAnswers(new Array(questions.length).fill(""));
            setQuizStarted(true);
            setError(
              `Quiz de niveau "${fallbackDifficulty}" chargé (niveau "${difficulty}" non disponible).`
            );
          }
        } else {
          // Créer des questions génériques si aucun quiz n'est trouvé
          const genericQuestions = [
            {
              question: `Qu'est-ce qui caractérise ${selectedSpecialty}?`,
              options: [
                "C'est une technologie récente",
                "C'est un domaine en pleine évolution",
                "C'est une approche méthodologique",
                "C'est un ensemble de bonnes pratiques",
              ],
              correctAnswer: "C'est un domaine en pleine évolution",
              explanation: `Cette question porte sur les caractéristiques fondamentales de ${selectedSpecialty}.`,
            },
            {
              question: `Quelle est la meilleure pratique en ${selectedSpecialty}?`,
              options: [
                "L'optimisation précoce",
                "Suivre les standards",
                "L'innovation constante",
                "La documentation exhaustive",
              ],
              correctAnswer: "Suivre les standards",
              explanation: `Suivre les standards établis est généralement une bonne pratique dans ${selectedSpecialty}.`,
            },
            {
              question: `Quel outil est le plus utilisé en ${selectedSpecialty}?`,
              options: [
                "Des frameworks spécialisés",
                "Des outils de collaboration",
                "Des plateformes intégrées",
                "Des solutions open-source",
              ],
              correctAnswer: "Des solutions open-source",
              explanation: `Dans ${selectedSpecialty}, les solutions open-source sont souvent privilégiées pour leur flexibilité et leur communauté active.`,
            },
            {
              question: `Quelle compétence est essentielle pour ${selectedSpecialty}?`,
              options: [
                "La pensée analytique",
                "La créativité",
                "La rigueur méthodologique",
                "L'apprentissage continu",
              ],
              correctAnswer: "L'apprentissage continu",
              explanation: `Dans ${selectedSpecialty}, l'apprentissage continu est crucial car les technologies et méthodes évoluent rapidement.`,
            },
            {
              question: `Quel défi est souvent rencontré en ${selectedSpecialty}?`,
              options: [
                "La complexité technique",
                "Le manque de ressources",
                "L'évolution rapide des standards",
                "La résistance au changement",
              ],
              correctAnswer: "L'évolution rapide des standards",
              explanation: `${selectedSpecialty} évolue rapidement, ce qui rend difficile de rester à jour avec les derniers standards et meilleures pratiques.`,
            },
          ];
          setQuestions(genericQuestions);
          setUserAnswers(new Array(genericQuestions.length).fill(""));
          setQuizStarted(true);
          setError(
            `Quiz générique chargé pour ${selectedSpecialty} (spécialité non trouvée dans notre base de données).`
          );
        }
      }
    } catch (error) {
      console.error("Erreur lors de la génération du quiz:", error);
      setError("Une erreur est survenue lors de la génération du quiz.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (answer) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = answer;
    setUserAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      finishQuiz();
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const finishQuiz = () => {
    if (userAnswers.some((answer) => answer === "")) {
      if (
        !window.confirm(
          "Certaines questions n'ont pas été répondues. Voulez-vous vraiment terminer le quiz?"
        )
      ) {
        return;
      }
    }
    setQuizFinished(true);
    analyzeQuizResults();
  };

  const analyzeQuizResults = async () => {
    setAnalyzing(true);
    try {
      const quizData = questions.map((question, index) => ({
        question: question.question,
        options: question.options,
        correctAnswer: question.correctAnswer,
        userAnswer: userAnswers[index],
      }));

      // Calculer quelques statistiques de base
      const correctCount = quizData.filter((q) => q.userAnswer === q.correctAnswer).length;
      const scorePercentage = Math.round((correctCount / quizData.length) * 100);

      // Afficher ces statistiques immédiatement pour une meilleure UX
      console.log(`Score: ${scorePercentage}% (${correctCount}/${quizData.length} correctes)`);

      // Essayer d'obtenir une analyse détaillée depuis l'IA
      try {
        const result = await aiService.analyzeQuizResults(selectedSpecialty, difficulty, quizData);

        if (result.success && result.data) {
          setAnalysisResult(result.data);
          setIsAIAnalysis(true);
        } else {
          // Si l'appel à l'API échoue, créer une analyse basique
          generateBasicAnalysis(quizData, scorePercentage, correctCount);
          setIsAIAnalysis(false);
        }
      } catch (apiError) {
        console.error("Erreur API lors de l'analyse des résultats:", apiError);
        // Générer une analyse basique en cas d'échec
        generateBasicAnalysis(quizData, scorePercentage, correctCount);
        setIsAIAnalysis(false);
      }
    } catch (error) {
      console.error("Erreur lors de l'analyse des résultats:", error);
      setError("Une erreur est survenue lors de l'analyse des résultats.");
      // Générer une analyse minimale
      setAnalysisResult({
        summary: "Une erreur est survenue lors de l'analyse détaillée de vos résultats.",
        strengths: ["Les résultats n'ont pas pu être analysés en détail."],
        improvements: ["Essayez de relancer l'analyse ou contactez le support."],
        recommendations: [
          {
            title: "Continuer l'apprentissage",
            description: "Continuez à explorer les ressources disponibles sur ce sujet.",
          },
        ],
      });
      setIsAIAnalysis(false);
    } finally {
      setAnalyzing(false);
    }
  };

  // Fonction pour générer une analyse basique en cas d'échec de l'API
  const generateBasicAnalysis = (quizData, scorePercentage, correctCount) => {
    // Extraire les questions correctes et incorrectes
    const correctQuestions = quizData.filter((q) => q.userAnswer === q.correctAnswer);
    const incorrectQuestions = quizData.filter((q) => q.userAnswer !== q.correctAnswer);

    let summary = "";
    let strengths = [];
    let improvements = [];
    let recommendations = [];

    // Générer un résumé basé sur le score
    if (scorePercentage >= 80) {
      summary = `Excellent travail! Vous avez obtenu un score de ${scorePercentage}% avec ${correctCount} réponses correctes sur ${quizData.length}.`;
      strengths.push("Vous avez une très bonne compréhension des concepts testés.");

      if (scorePercentage < 100) {
        improvements.push("Vous pourriez encore approfondir certains concepts spécifiques.");
        recommendations.push({
          title: "Passer au niveau supérieur",
          description: "Essayez le quiz de niveau avancé pour vous challenger davantage.",
        });
      } else {
        strengths.push("Maîtrise parfaite du sujet au niveau actuel.");
        recommendations.push({
          title: "Explorer des sujets connexes",
          description: `Maintenant que vous maîtrisez ${selectedSpecialty}, vous pourriez explorer des domaines connexes pour élargir vos connaissances.`,
        });
      }
    } else if (scorePercentage >= 60) {
      summary = `Bon travail! Vous avez obtenu un score de ${scorePercentage}% avec ${correctCount} réponses correctes sur ${quizData.length}.`;
      strengths.push("Vous avez une bonne compréhension des concepts de base.");
      improvements.push("Certains concepts plus avancés nécessitent encore du travail.");
      recommendations.push({
        title: "Renforcer les connaissances intermédiaires",
        description:
          "Concentrez-vous sur les sujets où vous avez fait des erreurs pour solidifier vos connaissances.",
      });
    } else if (scorePercentage >= 40) {
      summary = `Vous avez obtenu un score de ${scorePercentage}% avec ${correctCount} réponses correctes sur ${quizData.length}. Il y a de la place pour l'amélioration.`;
      strengths.push("Vous avez des connaissances de base dans certains domaines.");
      improvements.push("Vous pourriez bénéficier d'une révision des concepts fondamentaux.");
      recommendations.push({
        title: "Revoir les fondamentaux",
        description: `Reprenez les bases de ${selectedSpecialty} avant de passer à des concepts plus avancés.`,
      });
    } else {
      summary = `Vous avez obtenu un score de ${scorePercentage}% avec ${correctCount} réponses correctes sur ${quizData.length}. Ne vous découragez pas!`;
      strengths.push("Vous avez fait le premier pas en évaluant vos connaissances.");
      improvements.push("Une étude plus approfondie des concepts de base est recommandée.");
      recommendations.push({
        title: "Commencer par les bases",
        description: `Cherchez des tutoriels d'introduction à ${selectedSpecialty} pour établir une base solide.`,
      });
    }

    // Ajouter des recommandations basées sur les questions incorrectes
    if (incorrectQuestions.length > 0) {
      // Exemple de recommandation basée sur le nombre de questions incorrectes
      recommendations.push({
        title: "Axer sur les domaines à améliorer",
        description: `Concentrez-vous sur les ${incorrectQuestions.length} questions que vous avez manquées pour améliorer votre score.`,
      });
    }

    setAnalysisResult({
      summary,
      strengths,
      improvements,
      recommendations,
    });
  };

  const resetQuiz = () => {
    setQuizStarted(false);
    setQuizFinished(false);
    setQuestions([]);
    setUserAnswers([]);
    setCurrentQuestionIndex(0);
    setAnalysisResult(null);
  };

  const calculateScore = () => {
    let correctAnswers = 0;
    questions.forEach((question, index) => {
      if (userAnswers[index] === question.correctAnswer) {
        correctAnswers++;
      }
    });
    return Math.round((correctAnswers / questions.length) * 100);
  };

  const handleOpenExplanation = (question, explanation) => {
    setExplanationDialog({
      open: true,
      question,
      explanation,
    });
  };

  const handleCloseExplanation = () => {
    setExplanationDialog({
      ...explanationDialog,
      open: false,
    });
  };

  return (
    <MDBox>
      <Typography variant="h4" gutterBottom>
        Quiz d'Autoévaluation Tech
      </Typography>

      {!quizStarted ? (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Testez vos connaissances dans votre domaine de spécialité
            </Typography>
            <Typography variant="body2" paragraph>
              Ce quiz adaptatif généré par IA vous permet d'évaluer vos compétences et d'identifier
              vos points forts et vos axes d'amélioration.
            </Typography>

            <Grid container spacing={3} sx={{ mt: 2 }}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="specialty-select-label">Spécialité</InputLabel>
                  <Select
                    labelId="specialty-select-label"
                    value={selectedSpecialty}
                    label="Spécialité"
                    onChange={(e) => setSelectedSpecialty(e.target.value)}
                  >
                    {specialties.map((specialty) => (
                      <MenuItem key={specialty} value={specialty}>
                        {specialty}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="difficulty-select-label">Niveau de difficulté</InputLabel>
                  <Select
                    labelId="difficulty-select-label"
                    value={difficulty}
                    label="Niveau de difficulté"
                    onChange={(e) => setDifficulty(e.target.value)}
                  >
                    {difficultyLevels.map((level) => (
                      <MenuItem key={level} value={level}>
                        {level}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {error && (
              <Alert severity="error" sx={{ mt: 3 }}>
                {error}
              </Alert>
            )}

            <Box sx={{ mt: 4, textAlign: "center" }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={generateQuiz}
                disabled={loading || !selectedSpecialty}
                startIcon={
                  loading ? <CircularProgress size={20} color="inherit" /> : <PsychologyIcon />
                }
              >
                {loading ? "Génération en cours..." : "Démarrer le Quiz"}
              </Button>
            </Box>
          </CardContent>
        </Card>
      ) : !quizFinished ? (
        <>
          <Box sx={{ mb: 3 }}>
            <Stepper activeStep={currentQuestionIndex} alternativeLabel>
              {questions.map((_, index) => (
                <Step key={index}>
                  <StepLabel></StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>

          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Question {currentQuestionIndex + 1} sur {questions.length}
              </Typography>
              <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                {questions[currentQuestionIndex]?.question}
              </Typography>

              <FormControl component="fieldset" sx={{ width: "100%" }}>
                <RadioGroup
                  value={userAnswers[currentQuestionIndex]}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                >
                  {questions[currentQuestionIndex]?.options.map((option, optionIndex) => (
                    <FormControlLabel
                      key={optionIndex}
                      value={option}
                      control={<Radio />}
                      label={option}
                      sx={{
                        mb: 1,
                        p: 1,
                        border: "1px solid #e0e0e0",
                        borderRadius: 1,
                        width: "100%",
                        "&:hover": {
                          backgroundColor: "#f5f5f5",
                        },
                      }}
                    />
                  ))}
                </RadioGroup>
              </FormControl>

              <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
                <Button
                  variant="outlined"
                  onClick={prevQuestion}
                  disabled={currentQuestionIndex === 0}
                >
                  Précédent
                </Button>
                {currentQuestionIndex < questions.length - 1 ? (
                  <Button variant="contained" onClick={nextQuestion}>
                    Suivant
                  </Button>
                ) : (
                  <Button variant="contained" color="primary" onClick={finishQuiz}>
                    Terminer le Quiz
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: "100%" }}>
                <CardContent>
                  <Box sx={{ textAlign: "center", mb: 2 }}>
                    <EmojiEventsIcon color="primary" sx={{ fontSize: 50 }} />
                    <Typography variant="h4" gutterBottom>
                      {calculateScore()}%
                    </Typography>
                    <Typography variant="body1">
                      {questions.filter((q, idx) => userAnswers[idx] === q.correctAnswer).length}{" "}
                      correctes sur {questions.length} questions
                    </Typography>
                  </Box>

                  <Box sx={{ mt: 4 }}>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<RefreshIcon />}
                      onClick={resetQuiz}
                      sx={{ mb: 2 }}
                    >
                      Nouveau Quiz
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Analyse détaillée
                  </Typography>

                  {analyzing ? (
                    <Box sx={{ display: "flex", justifyContent: "center", my: 5 }}>
                      <CircularProgress />
                    </Box>
                  ) : analysisResult ? (
                    <>
                      {isAIAnalysis && (
                        <Chip
                          label="Analyse générée par IA"
                          color="primary"
                          icon={<PsychologyIcon />}
                          size="small"
                          sx={{ mb: 2 }}
                        />
                      )}
                      <Alert severity="info" sx={{ mb: 3 }}>
                        {analysisResult.summary}
                      </Alert>

                      <Typography variant="subtitle1" gutterBottom>
                        Points forts:
                      </Typography>
                      <List dense>
                        {analysisResult.strengths.map((strength, index) => (
                          <ListItem key={index}>
                            <ListItemText primary={strength} />
                          </ListItem>
                        ))}
                      </List>

                      <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                        Points à améliorer:
                      </Typography>
                      <List dense>
                        {analysisResult.improvements.map((improvement, index) => (
                          <ListItem key={index}>
                            <ListItemText primary={improvement} />
                          </ListItem>
                        ))}
                      </List>

                      <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                        Recommandations de formation:
                      </Typography>
                      <List dense>
                        {analysisResult.recommendations.map((recommendation, index) => (
                          <ListItem key={index}>
                            <ListItemText
                              primary={recommendation.title}
                              secondary={recommendation.description}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </>
                  ) : (
                    <Typography>Analyse en cours...</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Revue des questions
                  </Typography>
                  <List>
                    {questions.map((question, index) => (
                      <React.Fragment key={index}>
                        <ListItem>
                          <Box sx={{ width: "100%" }}>
                            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                              {userAnswers[index] === question.correctAnswer ? (
                                <Chip
                                  icon={<CheckIcon />}
                                  label="Correct"
                                  color="success"
                                  size="small"
                                  sx={{ mr: 1 }}
                                />
                              ) : (
                                <Chip
                                  icon={<CloseIcon />}
                                  label="Incorrect"
                                  color="error"
                                  size="small"
                                  sx={{ mr: 1 }}
                                />
                              )}
                              <Typography variant="body1" component="span">
                                {index + 1}. {question.question}
                              </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                              Votre réponse: {userAnswers[index] || "Non répondu"}
                            </Typography>
                            <Typography
                              variant="body2"
                              color={
                                userAnswers[index] === question.correctAnswer
                                  ? "success.main"
                                  : "error.main"
                              }
                            >
                              Réponse correcte: {question.correctAnswer}
                            </Typography>
                            <Box sx={{ textAlign: "right" }}>
                              <Button
                                size="small"
                                startIcon={<HelpIcon />}
                                onClick={() =>
                                  handleOpenExplanation(question.question, question.explanation)
                                }
                              >
                                Explication
                              </Button>
                            </Box>
                          </Box>
                        </ListItem>
                        {index < questions.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Dialog
            open={explanationDialog.open}
            onClose={handleCloseExplanation}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>Explication</DialogTitle>
            <DialogContent>
              <Typography variant="subtitle1" gutterBottom>
                {explanationDialog.question}
              </Typography>
              <Typography variant="body1">{explanationDialog.explanation}</Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseExplanation}>Fermer</Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </MDBox>
  );
}

export default QuizAssessment;
