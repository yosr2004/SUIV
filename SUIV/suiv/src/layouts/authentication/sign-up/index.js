import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";

import Card from "@mui/material/Card";
import Checkbox from "@mui/material/Checkbox";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

import CoverLayout from "layouts/authentication/components/CoverLayout";

// Importer le contexte d'authentification
import { useAuth } from "contexts/AuthContext";

function SignupPage() {
  const navigate = useNavigate();
  const { register, error, loading } = useAuth();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.includes("@")) newErrors.email = "Valid email is required";
    if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    if (!formData.terms) newErrors.terms = "You must agree to the terms";
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formErrors = validate();
    setErrors(formErrors);

    if (Object.keys(formErrors).length > 0) {
      setIsSubmitting(false);
      return;
    }

    try {
      // Utiliser la fonction register du contexte d'authentification
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
      };

      const result = await register(userData);

      if (result.success) {
        toast.success("Inscription réussie !");
        navigate("/dashboard");
      } else {
        toast.error(result.error || "Erreur lors de l'inscription");
      }
    } catch (err) {
      console.error("Erreur d'inscription:", err);
      toast.error(err.message || "Erreur lors de l'inscription");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CoverLayout image="">
      <Card>
        <MDBox
          variant="gradient"
          bgColor="info"
          borderRadius="lg"
          coloredShadow="success"
          mx={2}
          mt={-3}
          p={3}
          mb={1}
          textAlign="center"
        >
          <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
            Rejoignez-nous aujourd'hui
          </MDTypography>
          <MDTypography display="block" variant="button" color="white" my={1}>
            Entrez vos informations pour vous inscrire
          </MDTypography>
        </MDBox>
        <MDBox pt={4} pb={3} px={3} sx={{ position: "relative", zIndex: 10 }}>
          <MDBox component="form" role="form" onSubmit={handleSubmit}>

            <MDBox mb={2}>
              <MDInput
                type="text"
                name="firstName"
                label="Prénom"
                variant="outlined"
                fullWidth
                value={formData.firstName}
                onChange={handleChange}
                error={!!errors.firstName}
                helperText={errors.firstName}
                sx={{ zIndex: 5, position: "relative", backgroundColor: "rgba(255, 255, 255, 0.8)" }}
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="text"
                name="lastName"
                label="Nom"
                variant="outlined"
                fullWidth
                value={formData.lastName}
                onChange={handleChange}
                error={!!errors.lastName}
                helperText={errors.lastName}
                sx={{ zIndex: 5, position: "relative", backgroundColor: "rgba(255, 255, 255, 0.8)" }}
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="email"
                name="email"
                label="Email"
                variant="outlined"
                fullWidth
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
                sx={{ zIndex: 5, position: "relative", backgroundColor: "rgba(255, 255, 255, 0.8)" }}
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="password"
                name="password"
                label="Mot de passe"
                variant="outlined"
                fullWidth
                value={formData.password}
                onChange={handleChange}
                error={!!errors.password}
                helperText={errors.password}
                sx={{ zIndex: 5, position: "relative", backgroundColor: "rgba(255, 255, 255, 0.8)" }}
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="password"
                name="confirmPassword"
                label="Confirmer le mot de passe"
                variant="outlined"
                fullWidth
                value={formData.confirmPassword}
                onChange={handleChange}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
                sx={{ zIndex: 5, position: "relative", backgroundColor: "rgba(255, 255, 255, 0.8)" }}
              />
            </MDBox>
            <MDBox display="flex" alignItems="center" ml={-1}>
              <Checkbox
                name="terms"
                checked={formData.terms}
                onChange={handleChange}
                inputProps={{ "aria-label": "Accepter les conditions d'utilisation" }}
              />
              <MDTypography
                variant="button"
                fontWeight="regular"
                color="text"
                sx={{ cursor: "pointer", userSelect: "none", ml: -1 }}
                onClick={() => setFormData({ ...formData, terms: !formData.terms })}
              >
                &nbsp;&nbsp;J'accepte les&nbsp;
              </MDTypography>
              <MDTypography
                component="a"
                href="#"
                variant="button"
                fontWeight="bold"
                color="info"
                textGradient
              >
                Conditions d'utilisation
              </MDTypography>
              {errors.terms && (
                <MDTypography variant="caption" color="error" sx={{ ml: 2 }}>
                  {errors.terms}
                </MDTypography>
              )}
            </MDBox>
            {error && (
              <MDBox mt={2}>
                <MDTypography variant="caption" color="error">
                  {error}
                </MDTypography>
              </MDBox>
            )}
            <MDBox mt={4} mb={1}>
              <MDButton
                variant="gradient"
                color="info"
                fullWidth
                type="submit"
                disabled={isSubmitting || loading}
              >
                {isSubmitting || loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "S'inscrire"
                )}
              </MDButton>
            </MDBox>
            <MDBox mt={3} mb={1} textAlign="center">
              <MDTypography variant="button" color="text">
                Vous avez déjà un compte?{" "}
                <MDTypography
                  component={Link}
                  to="/authentication/sign-in"
                  variant="button"
                  color="info"
                  fontWeight="medium"
                  textGradient
                >
                  Connectez-vous
                </MDTypography>
              </MDTypography>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>
    </CoverLayout>
  );
}

export default SignupPage;
