import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Divider,
  IconButton,
  InputAdornment,
  Alert,
  Slide,
  CircularProgress,
  Link,
  Paper,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Person,
  Email,
  Lock,
  LoginOutlined,
  PersonAddOutlined,
} from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthContext";
import MDBox from "components/MDBox";

// Animation de transition pour les formulaires
const SlideTransition = (props) => {
  return <Slide direction="left" {...props} />;
};

function AuthForms({ onSuccess }) {
  // État pour basculer entre connexion et inscription
  const [isLogin, setIsLogin] = useState(true);

  // État pour afficher/masquer le mot de passe
  const [showPassword, setShowPassword] = useState(false);

  // États pour le formulaire de connexion
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // États pour le formulaire d'inscription
  const [registerFirstName, setRegisterFirstName] = useState("");
  const [registerLastName, setRegisterLastName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");

  // État pour les erreurs de formulaire
  const [formErrors, setFormErrors] = useState({});

  // Contexte d'authentification
  const { login, register, loading, error } = useAuth();

  // Basculer l'affichage du mot de passe
  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  // Basculer entre connexion et inscription
  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    // Réinitialiser les erreurs lors du changement de mode
    setFormErrors({});
  };

  // Valider le formulaire de connexion
  const validateLoginForm = () => {
    const errors = {};

    if (!loginEmail.trim()) {
      errors.loginEmail = "L'email est requis";
    } else if (!/\S+@\S+\.\S+/.test(loginEmail)) {
      errors.loginEmail = "Email invalide";
    }

    if (!loginPassword) {
      errors.loginPassword = "Le mot de passe est requis";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Valider le formulaire d'inscription
  const validateRegisterForm = () => {
    const errors = {};

    if (!registerFirstName.trim()) {
      errors.registerFirstName = "Le prénom est requis";
    }

    if (!registerLastName.trim()) {
      errors.registerLastName = "Le nom est requis";
    }

    if (!registerEmail.trim()) {
      errors.registerEmail = "L'email est requis";
    } else if (!/\S+@\S+\.\S+/.test(registerEmail)) {
      errors.registerEmail = "Email invalide";
    }

    if (!registerPassword) {
      errors.registerPassword = "Le mot de passe est requis";
    } else if (registerPassword.length < 6) {
      errors.registerPassword = "Le mot de passe doit contenir au moins 6 caractères";
    }

    if (registerPassword !== registerConfirmPassword) {
      errors.registerConfirmPassword = "Les mots de passe ne correspondent pas";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Gérer la soumission du formulaire de connexion
  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    if (!validateLoginForm()) {
      return;
    }

    const result = await login(loginEmail, loginPassword);

    if (result.success && onSuccess) {
      onSuccess();
    }
  };

  // Gérer la soumission du formulaire d'inscription
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    if (!validateRegisterForm()) {
      return;
    }

    const userData = {
      firstName: registerFirstName,
      lastName: registerLastName,
      email: registerEmail,
      password: registerPassword,
    };

    const result = await register(userData);

    if (result.success && onSuccess) {
      onSuccess();
    }
  };

  // Formulaire de connexion
  const loginForm = (
    <form onSubmit={handleLoginSubmit}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="medium" color="text.primary" align="center">
          Connexion
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" mt={1}>
          Connectez-vous pour accéder à votre espace personnel
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <TextField
        fullWidth
        label="Email"
        variant="outlined"
        value={loginEmail}
        onChange={(e) => setLoginEmail(e.target.value)}
        error={!!formErrors.loginEmail}
        helperText={formErrors.loginEmail}
        margin="normal"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Email color="primary" />
            </InputAdornment>
          ),
        }}
      />

      <TextField
        fullWidth
        label="Mot de passe"
        variant="outlined"
        type={showPassword ? "text" : "password"}
        value={loginPassword}
        onChange={(e) => setLoginPassword(e.target.value)}
        error={!!formErrors.loginPassword}
        helperText={formErrors.loginPassword}
        margin="normal"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Lock color="primary" />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={handleTogglePassword}
                edge="end"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <Box sx={{ textAlign: "right", mb: 2, mt: 1 }}>
        <Link href="#" variant="body2" color="primary" underline="hover">
          Mot de passe oublié ?
        </Link>
      </Box>

      <Button
        type="submit"
        fullWidth
        variant="contained"
        size="large"
        sx={{ mb: 2, height: "48px" }}
        disabled={loading}
        startIcon={<LoginOutlined />}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : "Se connecter"}
      </Button>

      <Divider sx={{ my: 3 }}>
        <Typography variant="body2" color="text.secondary">
          OU
        </Typography>
      </Divider>

      <Box sx={{ textAlign: "center" }}>
        <Typography variant="body2" color="text.secondary">
          Vous n'avez pas de compte ?{" "}
          <Link
            component="button"
            variant="body2"
            color="primary"
            underline="hover"
            onClick={toggleAuthMode}
          >
            Inscrivez-vous
          </Link>
        </Typography>
      </Box>
    </form>
  );

  // Formulaire d'inscription
  const registerForm = (
    <form onSubmit={handleRegisterSubmit}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="medium" color="text.primary" align="center">
          Inscription
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" mt={1}>
          Créez un compte pour accéder à toutes les fonctionnalités
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: "flex", gap: 2, mb: 1 }}>
        <TextField
          fullWidth
          label="Prénom"
          variant="outlined"
          value={registerFirstName}
          onChange={(e) => setRegisterFirstName(e.target.value)}
          error={!!formErrors.registerFirstName}
          helperText={formErrors.registerFirstName}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Person color="primary" />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          fullWidth
          label="Nom"
          variant="outlined"
          value={registerLastName}
          onChange={(e) => setRegisterLastName(e.target.value)}
          error={!!formErrors.registerLastName}
          helperText={formErrors.registerLastName}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Person color="primary" />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <TextField
        fullWidth
        label="Email"
        variant="outlined"
        value={registerEmail}
        onChange={(e) => setRegisterEmail(e.target.value)}
        error={!!formErrors.registerEmail}
        helperText={formErrors.registerEmail}
        margin="normal"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Email color="primary" />
            </InputAdornment>
          ),
        }}
      />

      <TextField
        fullWidth
        label="Mot de passe"
        variant="outlined"
        type={showPassword ? "text" : "password"}
        value={registerPassword}
        onChange={(e) => setRegisterPassword(e.target.value)}
        error={!!formErrors.registerPassword}
        helperText={formErrors.registerPassword}
        margin="normal"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Lock color="primary" />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={handleTogglePassword}
                edge="end"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <TextField
        fullWidth
        label="Confirmer le mot de passe"
        variant="outlined"
        type={showPassword ? "text" : "password"}
        value={registerConfirmPassword}
        onChange={(e) => setRegisterConfirmPassword(e.target.value)}
        error={!!formErrors.registerConfirmPassword}
        helperText={formErrors.registerConfirmPassword}
        margin="normal"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Lock color="primary" />
            </InputAdornment>
          ),
        }}
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        size="large"
        sx={{ mb: 2, mt: 3, height: "48px" }}
        disabled={loading}
        startIcon={<PersonAddOutlined />}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : "S'inscrire"}
      </Button>

      <Divider sx={{ my: 3 }}>
        <Typography variant="body2" color="text.secondary">
          OU
        </Typography>
      </Divider>

      <Box sx={{ textAlign: "center" }}>
        <Typography variant="body2" color="text.secondary">
          Vous avez déjà un compte ?{" "}
          <Link
            component="button"
            variant="body2"
            color="primary"
            underline="hover"
            onClick={toggleAuthMode}
          >
            Connectez-vous
          </Link>
        </Typography>
      </Box>
    </form>
  );

  return (
    <MDBox
      height="100%"
      width="100%"
      display="flex"
      justifyContent="center"
      alignItems="center"
      p={3}
    >
      <Box sx={{ position: "relative", width: 450, maxWidth: "100%", overflow: "hidden" }}>
        <Box
          sx={{
            position: "absolute",
            width: "200%",
            display: "flex",
            transition: "transform 0.5s ease-in-out",
            transform: isLogin ? "translateX(0)" : "translateX(-50%)",
          }}
        >
          <Box sx={{ width: "50%", p: 1 }}>
            <Card
              sx={{
                boxShadow: "0 8px 40px -12px rgba(0,0,0,0.1)",
                borderRadius: 2,
                overflow: "hidden",
                position: "relative",
              }}
            >
              <Box
                sx={{
                  height: "8px",
                  width: "100%",
                  background: "linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)",
                }}
              />
              <CardContent sx={{ p: 4 }}>{loginForm}</CardContent>
            </Card>
          </Box>

          <Box sx={{ width: "50%", p: 1 }}>
            <Card
              sx={{
                boxShadow: "0 8px 40px -12px rgba(0,0,0,0.1)",
                borderRadius: 2,
                overflow: "hidden",
                position: "relative",
              }}
            >
              <Box
                sx={{
                  height: "8px",
                  width: "100%",
                  background: "linear-gradient(90deg, #8E54E9 0%, #4776E6 100%)",
                }}
              />
              <CardContent sx={{ p: 4 }}>{registerForm}</CardContent>
            </Card>
          </Box>
        </Box>
      </Box>
    </MDBox>
  );
}

export default AuthForms;
