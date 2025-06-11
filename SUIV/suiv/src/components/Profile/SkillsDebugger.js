import React, { useEffect, useState } from "react";
import { Box, Typography, Paper, CircularProgress, Button, Divider, Alert } from "@mui/material";
import { useAuth } from "../../contexts/AuthContext";
import { Settings as SettingsIcon, BugReport as BugIcon } from "@mui/icons-material";

const SkillsDebugger = () => {
  const { currentUser } = useAuth();
  const [diagnosticResult, setDiagnosticResult] = useState(null);

  useEffect(() => {
    // Exécuter le diagnostic
    runDiagnostics();
  }, [currentUser]);

  const runDiagnostics = () => {
    try {
      // Vérifier l'état actuel du sessionStorage
      const user = sessionStorage.getItem("user");
      const parsedUser = user ? JSON.parse(user) : null;

      console.log("==== DÉBOGAGE CERTIFICATIONS ====");
      console.log("État actuel du currentUser:", currentUser);
      console.log("Certifications dans currentUser:", currentUser?.skills);
      console.log("User dans sessionStorage:", parsedUser);
      console.log("Certifications dans sessionStorage:", parsedUser?.skills);
      console.log("================================");

      // Vérifier si les certifications existent dans les deux emplacements
      const currentUserHasSkills = currentUser && Array.isArray(currentUser.skills);
      const sessionHasSkills = parsedUser && Array.isArray(parsedUser.skills);

      // Comparer les longueurs
      const currentUserSkillsCount = currentUserHasSkills ? currentUser.skills.length : 0;
      const sessionSkillsCount = sessionHasSkills ? parsedUser.skills.length : 0;

      // Stocker le résultat du diagnostic
      setDiagnosticResult({
        currentUserHasSkills,
        sessionHasSkills,
        currentUserSkillsCount,
        sessionSkillsCount,
        severity: "info",
      });
    } catch (error) {
      console.error("Erreur lors du diagnostic des certifications:", error);
      setDiagnosticResult({
        error: error.message,
        severity: "error",
      });
    }
  };

  if (!currentUser) {
    return <CircularProgress />;
  }

  return (
    <Paper
      sx={{
        p: 2,
        mb: 2,
        bgcolor: "#f8f9fa",
        borderRadius: 2,
        border: "1px solid #e0e0e0",
        transform: "translateZ(0)",
        backfaceVisibility: "hidden",
        willChange: "transform",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
        <BugIcon sx={{ mr: 1 }} color="primary" />
        <Typography variant="h6" gutterBottom>
          Informations sur les Certifications
        </Typography>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {diagnosticResult && (
        <>
          <Alert severity={diagnosticResult.severity} sx={{ mb: 2 }}>
            Informations sur l'état des certifications
          </Alert>

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2">État des certifications:</Typography>
            <Typography variant="body2">
              • React State:{" "}
              {diagnosticResult.currentUserHasSkills
                ? `${diagnosticResult.currentUserSkillsCount} certification(s)`
                : "Aucune certification"}
            </Typography>
            <Typography variant="body2">
              • Session Storage:{" "}
              {diagnosticResult.sessionHasSkills
                ? `${diagnosticResult.sessionSkillsCount} certification(s)`
                : "Aucune certification"}
            </Typography>
          </Box>

          <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
            <Button
              variant="outlined"
              color="primary"
              size="small"
              onClick={runDiagnostics}
              startIcon={<SettingsIcon />}
            >
              Actualiser
            </Button>
          </Box>
        </>
      )}
    </Paper>
  );
};

export default SkillsDebugger;
