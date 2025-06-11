import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

// @mui material components
import Card from "@mui/material/Card";
import Switch from "@mui/material/Switch";
import Grid from "@mui/material/Grid";
import MuiLink from "@mui/material/Link";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";

// @mui icons
import FacebookIcon from "@mui/icons-material/Facebook";
import GitHubIcon from "@mui/icons-material/GitHub";
import GoogleIcon from "@mui/icons-material/Google";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

// Authentication layout components
import BasicLayout from "layouts/authentication/components/BasicLayout";

// Contexte d'authentification
import { useAuth } from "contexts/AuthContext";
import authService from "services/authService";

function Basic() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [localError, setLocalError] = useState("");

  // Utiliser le contexte d'authentification
  const { login, loading, error, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Déterminer la redirection après connexion
  const from = location.state?.from?.pathname || "/dashboard";

  // Rediriger si déjà authentifié
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  // Définir l'email/mot de passe de démo pour faciliter les tests
  const setDemoCredentials = () => {
    setEmail("demo@example.com");
    setPassword("password");
  };

  const handleSetRememberMe = () => setRememberMe(!rememberMe);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLocalError("");
    setSuccessMessage("");

    // Validation simple
    if (!email.trim() || !password.trim()) {
      setLocalError("Veuillez remplir tous les champs");
      return;
    }

    try {
      // Log pour débogage
      console.log("Tentative de connexion avec:", { email, password });
      console.log("Mode développement:", process.env.NODE_ENV);
      console.log("Use Backend:", process.env.REACT_APP_USE_BACKEND);

      // Tentative de connexion
      const result = await login(email, password);

      console.log("Résultat de connexion:", result);

      if (result && result.success) {
        setSuccessMessage("Connexion réussie ! Redirection en cours...");
        toast.success("Connexion réussie !");
        // La redirection sera gérée par useEffect
      } else {
        setLocalError(result?.error || "Erreur de connexion");
        toast.error(result?.error || "Erreur de connexion");
      }
    } catch (err) {
      console.error("Erreur lors de la connexion:", err);
      setLocalError(err.message || "Erreur de connexion");
      toast.error(err.message || "Erreur de connexion");
    }
  };

  return (
    <BasicLayout image="">
      <Card>
        <MDBox
          variant="gradient"
          bgColor="info"
          borderRadius="lg"
          coloredShadow="info"
          mx={2}
          mt={-3}
          p={2}
          mb={1}
          textAlign="center"
        >
          <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
            Connexion
          </MDTypography>
          <Grid container spacing={3} justifyContent="center" sx={{ mt: 1, mb: 2 }}>
            <Grid item xs={2}>
              <MDTypography component={MuiLink} href="#" variant="body1" color="white">
                <FacebookIcon color="inherit" />
              </MDTypography>
            </Grid>
            <Grid item xs={2}>
              <MDTypography component={MuiLink} href="#" variant="body1" color="white">
                <GitHubIcon color="inherit" />
              </MDTypography>
            </Grid>
            <Grid item xs={2}>
              <MDTypography component={MuiLink} href="#" variant="body1" color="white">
                <GoogleIcon color="inherit" />
              </MDTypography>
            </Grid>
          </Grid>
        </MDBox>
        <MDBox pt={4} pb={3} px={3}>
          <MDBox component="form" role="form" onSubmit={handleSignIn}>


            <MDBox mb={2}>
              <MDInput
                type="email"
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                required
                variant="outlined"
                sx={{ zIndex: 5, position: "relative", backgroundColor: "rgba(255, 255, 255, 0.8)" }}
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="password"
                label="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                required
                variant="outlined"
                sx={{ zIndex: 5, position: "relative", backgroundColor: "rgba(255, 255, 255, 0.8)" }}
              />
            </MDBox>
            {(error || localError) && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error || localError}
              </Alert>
            )}
            {successMessage && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {successMessage}
              </Alert>
            )}
            <MDBox display="flex" alignItems="center" ml={-1}>
              <Switch checked={rememberMe} onChange={handleSetRememberMe} />
              <MDTypography
                variant="button"
                fontWeight="regular"
                color="text"
                onClick={handleSetRememberMe}
                sx={{ cursor: "pointer", userSelect: "none", ml: -1 }}
              >
                &nbsp;&nbsp;Se souvenir de moi
              </MDTypography>
            </MDBox>
            <MDBox mt={4} mb={1}>
              <MDButton variant="gradient" color="info" fullWidth type="submit" disabled={loading}>
                {loading ? <CircularProgress size={24} color="inherit" /> : "Se connecter"}
              </MDButton>
            </MDBox>
            <MDBox mt={3} mb={1} textAlign="center">
              <MDTypography variant="button" color="text">
                Vous n'avez pas de compte ?{" "}
                <MDTypography
                  component={Link}
                  to="/authentication/sign-up"
                  variant="button"
                  color="info"
                  fontWeight="medium"
                  textGradient
                >
                  S'inscrire
                </MDTypography>
              </MDTypography>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>
    </BasicLayout>
  );
}

export default Basic;
