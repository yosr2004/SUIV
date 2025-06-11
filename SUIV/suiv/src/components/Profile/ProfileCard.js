import React, { useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Typography,
  Box,
  Grid,
  Divider,
  Button,
  IconButton,
  Chip,
  LinearProgress,
  Tooltip,
  TextField,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fade,
  Badge,
  Paper,
  Alert,
} from "@mui/material";
import {
  Edit as EditIcon,
  Save as SaveIcon,
  CameraAlt as CameraIcon,
  Delete as DeleteIcon,
  LinkedIn as LinkedInIcon,
  GitHub as GitHubIcon,
  Twitter as TwitterIcon,
  LocationOn as LocationIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  BarChart as BarChartIcon,
  Add as AddIcon,
  Close as CloseIcon,
  PhotoCamera as PhotoCameraIcon,
  Description as DescriptionIcon,
  Lightbulb as LightbulbIcon,
  Link as LinkIcon,
  FormatListBulleted as ListIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  Refresh as RefreshIcon,
  Sync as SyncIcon,
} from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthContext";
import profileService from "../../services/profileService";
import MDBox from "components/MDBox";
import { toast } from "react-toastify";
import SkillsDebugger from "./SkillsDebugger";

// Fonction utilitaire pour choisir une couleur pour une compétence en fonction de son niveau
const getSkillColor = (level) => {
  const colors = ["error", "warning", "info", "success", "primary"];
  return colors[Math.min(level - 1, colors.length - 1)];
};

function ProfileCard() {
  const { currentUser, loading, getCurrentUser } = useAuth();

  // État pour stocker le profil
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // État pour forcer le re-rendu
  const [refreshKey, setRefreshKey] = useState(0);

  // États d'édition
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState({});

  // État pour les compétences
  const [skillDialogOpen, setSkillDialogOpen] = useState(false);
  const [newSkill, setNewSkill] = useState({ name: "", level: 3 });

  // États de chargement des actions
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingSkill, setSavingSkill] = useState(false);
  const [deletingSkill, setDeletingSkill] = useState("");

  // Référence pour l'input de fichier caché
  const fileInputRef = useRef(null);

  // Récupérer le profil lors du chargement
  useEffect(() => {
    if (currentUser) {
      const fetchProfile = async () => {
        setProfileLoading(true);
        try {
          console.log("Récupération du profil utilisateur...");
          console.log("État actuel de currentUser:", currentUser);
          console.log("Informations de contact dans currentUser:", currentUser.contact);
          console.log("Certifications dans currentUser:", currentUser.skills);
          const response = await profileService.getProfile();
          console.log("Réponse du profil:", response);
          if (response.success) {
            setProfile(response.data);
            console.log("Données de contact disponibles:", {
              currentUserContact: currentUser.contact,
              profilePersonalInfo: response.data.personalInfo,
            });
            // Synchroniser les données du profil avec les valeurs éditables si besoin
            if (isEditing) {
              initEditValues(response.data);
            }
          } else {
            // Si le profil n'existe pas encore, créons-en un
            console.log("Création d'un nouveau profil...");
            const createResponse = await profileService.updateProfile({});
            if (createResponse.success) {
              setProfile(createResponse.data);
            }
          }
        } catch (error) {
          console.error("Erreur lors de la récupération du profil:", error);
        } finally {
          setProfileLoading(false);
        }
      };

      fetchProfile();
    }
  }, [currentUser, isEditing, refreshKey]);

  // Effet pour vérifier la disponibilité des informations de contact
  useEffect(() => {
    if (currentUser) {
      console.log("Vérification des informations de contact après mise à jour:", {
        contact: currentUser.contact,
        contactExists: !!currentUser.contact,
        phoneNumber: currentUser.contact?.phoneNumber,
        address: currentUser.contact?.address,
      });
      console.log("Vérification des certifications après mise à jour:", {
        skills: currentUser.skills,
        skillsExist: !!currentUser.skills,
        skillsCount: currentUser.skills?.length || 0,
      });
    }
  }, [currentUser, refreshKey]);

  // Initialiser les valeurs d'édition à partir de l'utilisateur actuel
  const initEditValues = (profileData = null) => {
    if (!currentUser) return;

    console.log("Initialisation des valeurs d'édition avec:", { currentUser, profile });

    // Utiliser soit les données du profil passées en paramètre, soit le profil actuel, soit un objet vide
    const data = profileData || profile || {};
    const user = currentUser; // Pour plus de clarté

    setEditValues({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      bio: user.bio || "",
      email: user.email || "",
      professional: {
        title: user.professional?.title || "",
        company: user.professional?.company || "",
        experience: user.professional?.experience || 0,
        location: user.professional?.location || "",
      },
      contact: {
        phoneNumber: user.contact?.phoneNumber || data.personalInfo?.phoneNumber || "",
        address: user.contact?.address || data.personalInfo?.address || "",
        city: user.contact?.city || data.personalInfo?.city || "",
        postalCode: user.contact?.postalCode || data.personalInfo?.postalCode || "",
        country: user.contact?.country || data.personalInfo?.country || "",
      },
      social: {
        linkedin: user.social?.linkedin || "",
        github: user.social?.github || "",
        twitter: user.social?.twitter || "",
      },
    });

    console.log("Valeurs d'édition initialisées:", editValues);
  };

  // Mettre à jour les valeurs d'édition lors d'un changement de champ
  const handleChange = (field, value) => {
    setEditValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Mettre à jour les valeurs d'édition imbriquées (professional, social)
  const handleNestedChange = (parent, field, value) => {
    setEditValues((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value,
      },
    }));
  };

  // Gérer le début de l'édition
  const handleEditStart = () => {
    initEditValues();
    setIsEditing(true);
  };

  // Gérer la sauvegarde des modifications
  const handleSave = async () => {
    setSavingProfile(true);
    try {
      console.log("============= DÉBUT SAUVEGARDE PROFILE =============");
      // Séparer les données en différentes catégories pour les envoyer aux endpoints appropriés
      const basicInfo = {
        firstName: editValues.firstName,
        lastName: editValues.lastName,
        bio: editValues.bio,
      };

      const professionalInfo = editValues.professional;
      const socialInfo = editValues.social;
      const contactInfo = editValues.contact;

      console.log("Données de base à sauvegarder:", basicInfo);
      console.log("Données professionnelles à sauvegarder:", professionalInfo);
      console.log("Données sociales à sauvegarder:", socialInfo);
      console.log("Données de contact à sauvegarder:", contactInfo);

      // Variable pour suivre le succès de chaque opération
      let basicResult = { success: false };
      let profResult = { success: false };
      let socialResult = { success: false };
      let contactResult = { success: false };

      // Sauvegarder les informations de base
      try {
        console.log("Envoi des informations de base...");
        basicResult = await profileService.updateBasicInfo(basicInfo);
        console.log("Résultat de la sauvegarde des informations de base:", basicResult);
      } catch (error) {
        console.error("Erreur lors de la sauvegarde des informations de base:", error);
        basicResult = { success: false, error: error.message };
      }

      // Sauvegarder les informations professionnelles
      try {
        console.log("Envoi des informations professionnelles...");
        profResult = await profileService.updateProfessionalInfo(professionalInfo);
        console.log("Résultat de la sauvegarde des informations professionnelles:", profResult);
      } catch (error) {
        console.error("Erreur lors de la sauvegarde des informations professionnelles:", error);
        profResult = { success: false, error: error.message };
      }

      // Sauvegarder les informations sociales
      try {
        console.log("Envoi des informations sociales...");
        socialResult = await profileService.updateSocialInfo(socialInfo);
        console.log("Résultat de la sauvegarde des informations sociales:", socialResult);
      } catch (error) {
        console.error("Erreur lors de la sauvegarde des informations sociales:", error);
        socialResult = { success: false, error: error.message };
      }

      // Sauvegarder les informations de contact
      try {
        console.log("Envoi des informations de contact...");
        if (typeof profileService.updateContactInfo !== "function") {
          console.error("La méthode updateContactInfo n'existe pas dans le service!");
          contactResult = { success: false, error: "Méthode de contact non disponible" };
        } else {
          console.log("Données de contact envoyées:", contactInfo);
          contactResult = await profileService.updateContactInfo(contactInfo);
          console.log("Résultat de la sauvegarde des informations de contact:", contactResult);
          // Vérification des données mises à jour
          if (contactResult.success && contactResult.data) {
            console.log("Contact mis à jour dans la réponse:", contactResult.data.user?.contact);

            // Force une mise à jour du contexte utilisateur immédiatement après
            // la mise à jour des informations de contact
            console.log("Forçage de la mise à jour du contexte utilisateur...");
            await getCurrentUser();
          }
        }
      } catch (error) {
        console.error("Erreur lors de la sauvegarde des informations de contact:", error);
        contactResult = { success: false, error: error.message };
      }

      console.log("Résultats combinés:", {
        basic: basicResult.success,
        prof: profResult.success,
        social: socialResult.success,
        contact: contactResult.success,
      });

      // Considérer comme un succès si les informations de base sont sauvegardées (même si d'autres parties échouent)
      if (basicResult.success) {
        setIsEditing(false);
        toast.success("Profil mis à jour avec succès !", { position: "top-right" });

        // Rafraîchir le profil complet
        console.log("Récupération du profil mis à jour...");
        try {
          const refreshResponse = await profileService.getProfile();
          console.log("Profil rafraîchi:", refreshResponse.data);

          if (refreshResponse.success) {
            setProfile(refreshResponse.data);
            console.log("État du profil mis à jour dans le composant");
          }
        } catch (refreshError) {
          console.error("Erreur lors du rafraîchissement du profil:", refreshError);
        }

        // Forcer la mise à jour du contexte d'authentification
        getCurrentUser();
      } else {
        // Identifier l'erreur spécifique pour l'afficher
        let errorMessage = "Erreur lors de la mise à jour du profil";
        if (!basicResult.success)
          errorMessage = basicResult.error || "Erreur avec les informations de base";
        else if (!profResult.success)
          errorMessage = profResult.error || "Erreur avec les informations professionnelles";
        else if (!socialResult.success)
          errorMessage = socialResult.error || "Erreur avec les informations sociales";
        else if (!contactResult.success)
          errorMessage = contactResult.error || "Erreur avec les informations de contact";

        toast.error(errorMessage, { position: "top-right" });
        console.error("Échec de la sauvegarde:", errorMessage);
      }
      console.log("============= FIN SAUVEGARDE PROFILE =============");
    } catch (error) {
      console.error("Erreur globale lors de la sauvegarde du profil:", error);
      toast.error("Erreur lors de la mise à jour du profil: " + error.message, {
        position: "top-right",
      });
    } finally {
      setSavingProfile(false);
    }
  };

  // Gérer l'annulation de l'édition
  const handleCancel = () => {
    setIsEditing(false);
  };

  // Gérer le changement d'avatar
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        console.log("Envoi du nouvel avatar...");
        const result = await profileService.updateAvatar(file);
        console.log("Résultat de la mise à jour de l'avatar:", result);

        if (result.success) {
          // Forcer la mise à jour du contexte d'authentification
          getCurrentUser();
          toast.success("Avatar mis à jour avec succès", { position: "top-right" });
        } else {
          toast.error("Erreur lors de la mise à jour de l'avatar", { position: "top-right" });
        }
      } catch (error) {
        console.error("Erreur lors de la mise à jour de l'avatar:", error);
        toast.error("Erreur lors de la mise à jour de l'avatar", { position: "top-right" });
      }
    }
  };

  // Déclencher le sélecteur de fichier pour l'avatar
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // Gérer l'ouverture du dialogue de compétence
  const handleOpenSkillDialog = () => {
    setNewSkill({ name: "", level: 3 });
    setSkillDialogOpen(true);
  };

  // Gérer la fermeture du dialogue de compétence
  const handleCloseSkillDialog = () => {
    setSkillDialogOpen(false);
  };

  // Gérer la sauvegarde d'une nouvelle compétence
  const handleSaveSkill = async () => {
    if (!newSkill.name.trim()) return;

    setSavingSkill(true);
    try {
      console.log("État actuel des certifications:", currentUser.skills);
      const updatedSkills = [...(currentUser.skills || [])];

      // Vérifier si la compétence existe déjà
      const existingIndex = updatedSkills.findIndex(
        (skill) => skill.name.toLowerCase() === newSkill.name.toLowerCase()
      );

      if (existingIndex >= 0) {
        // Mettre à jour la compétence existante
        updatedSkills[existingIndex] = newSkill;
      } else {
        // Ajouter une nouvelle compétence
        updatedSkills.push(newSkill);
      }

      console.log("Envoi des certifications mises à jour:", updatedSkills);

      // Utiliser le service standard pour mettre à jour les compétences
      const result = await profileService.updateSkills(updatedSkills);
      console.log("Résultat de la mise à jour des certifications:", result);

      if (result.success) {
        setSkillDialogOpen(false);

        // Forcer la mise à jour du contexte d'authentification
        console.log("Mise à jour du contexte utilisateur...");
        await getCurrentUser();

        // Forcer un re-rendu supplémentaire
        setRefreshKey((prev) => prev + 1);

        toast.success("Certification ajoutée avec succès !", { position: "top-right" });
      } else {
        toast.error("Erreur lors de l'ajout de la certification: " + result.message, {
          position: "top-right",
        });
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout de la certification:", error);
      toast.error("Erreur lors de l'ajout de la certification", { position: "top-right" });
    } finally {
      setSavingSkill(false);
    }
  };

  // Gérer la suppression d'une compétence
  const handleDeleteSkill = async (skillName) => {
    setDeletingSkill(skillName);
    try {
      const updatedSkills = (currentUser.skills || []).filter((skill) => skill.name !== skillName);

      // Utiliser le service standard pour mettre à jour les compétences
      const result = await profileService.updateSkills(updatedSkills);

      if (result.success) {
        // Forcer la mise à jour du contexte d'authentification
        await getCurrentUser();

        // Forcer un re-rendu du composant
        setRefreshKey((prevKey) => prevKey + 1);

        toast.success("Certification supprimée avec succès", { position: "top-right" });
      } else {
        toast.error("Erreur lors de la suppression de la certification: " + result.message, {
          position: "top-right",
        });
      }
    } catch (error) {
      console.error("Erreur lors de la suppression de la certification:", error);
      toast.error("Erreur lors de la suppression de la certification", { position: "top-right" });
    } finally {
      setDeletingSkill("");
    }
  };

  // Rendu conditionnel si l'utilisateur n'est pas connecté
  if (!currentUser) {
    return (
      <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
        <CardContent>
          <Typography variant="body1" align="center" color="text.secondary">
            Veuillez vous connecter pour voir votre profil
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <MDBox p={3}>
      <Fade in={true} timeout={800}>
        <Card
          sx={{
            boxShadow: 3,
            borderRadius: 2,
            overflow: "visible",
            transform: "translateZ(0)",
            backfaceVisibility: "hidden",
            willChange: "transform",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          {/* Bannière et avatar */}
          <Box
            sx={{
              height: 150,
              width: "100%",
              background: "linear-gradient(45deg, #4776E6 0%, #8E54E9 100%)",
              position: "relative",
              willChange: "transform",
              transform: "translateZ(0)",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                bottom: -50,
                left: 50,
                zIndex: 2,
              }}
            >
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                badgeContent={
                  <IconButton
                    sx={{
                      bgcolor: "background.paper",
                      "&:hover": { bgcolor: "action.hover" },
                    }}
                    size="small"
                    onClick={triggerFileInput}
                  >
                    <CameraIcon fontSize="small" />
                  </IconButton>
                }
              >
                <Avatar
                  src={currentUser.avatar}
                  alt={`${currentUser.firstName} ${currentUser.lastName}`}
                  sx={{ width: 100, height: 100, border: 3, borderColor: "white" }}
                >
                  {currentUser.firstName?.[0] || ""}
                  {currentUser.lastName?.[0] || ""}
                </Avatar>
              </Badge>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                accept="image/*"
                onChange={handleAvatarChange}
              />
            </Box>

            {!isEditing ? (
              <IconButton
                color="inherit"
                sx={{ position: "absolute", top: 10, right: 10, color: "white" }}
                onClick={handleEditStart}
              >
                <EditIcon />
              </IconButton>
            ) : (
              <Box sx={{ position: "absolute", top: 10, right: 10 }}>
                <IconButton color="inherit" sx={{ color: "white", mr: 1 }} onClick={handleCancel}>
                  <CloseIcon />
                </IconButton>
                <IconButton
                  color="inherit"
                  sx={{ color: "white" }}
                  onClick={handleSave}
                  disabled={loading || savingProfile}
                >
                  {savingProfile ? <CircularProgress size={24} color="inherit" /> : <SaveIcon />}
                </IconButton>
              </Box>
            )}
          </Box>

          <CardContent sx={{ pt: 6 }}>
            <Grid container spacing={3}>
              {/* Informations personnelles */}
              <Grid item xs={12} md={12}>
                <Box sx={{ mb: 2 }}>
                  {isEditing ? (
                    <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                      <TextField
                        label="Prénom"
                        value={editValues.firstName}
                        onChange={(e) => handleChange("firstName", e.target.value)}
                        fullWidth
                      />
                      <TextField
                        label="Nom"
                        value={editValues.lastName}
                        onChange={(e) => handleChange("lastName", e.target.value)}
                        fullWidth
                      />
                    </Box>
                  ) : (
                    <Typography variant="h4" fontWeight="medium">
                      {currentUser.firstName} {currentUser.lastName}
                    </Typography>
                  )}

                  {isEditing ? (
                    <Box sx={{ mt: 2 }}>
                      <TextField
                        label="Titre professionnel"
                        value={editValues.professional?.title || ""}
                        onChange={(e) =>
                          handleNestedChange("professional", "title", e.target.value)
                        }
                        fullWidth
                        margin="dense"
                      />
                    </Box>
                  ) : (
                    <Typography variant="h6" color="primary" gutterBottom>
                      {currentUser.professional?.title || "Pas de titre spécifié"}
                    </Typography>
                  )}

                  {isEditing ? (
                    <TextField
                      label="Bio"
                      value={editValues.bio || ""}
                      onChange={(e) => handleChange("bio", e.target.value)}
                      multiline
                      rows={3}
                      fullWidth
                      margin="normal"
                    />
                  ) : (
                    <Typography variant="body1" color="text.secondary" paragraph>
                      {currentUser.bio || "Aucune biographie spécifiée."}
                    </Typography>
                  )}
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", mb: 1, flexWrap: "wrap" }}>
                  <Box sx={{ display: "flex", alignItems: "center", mr: 3, mb: 1 }}>
                    <WorkIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
                    {isEditing ? (
                      <TextField
                        label="Entreprise"
                        value={editValues.professional?.company || ""}
                        onChange={(e) =>
                          handleNestedChange("professional", "company", e.target.value)
                        }
                        size="small"
                        sx={{ width: 200 }}
                      />
                    ) : (
                      <Typography variant="body2">
                        {currentUser.professional?.company || "Non spécifié"}
                      </Typography>
                    )}
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", mr: 3, mb: 1 }}>
                    <LocationIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
                    {isEditing ? (
                      <TextField
                        label="Localisation"
                        value={editValues.professional?.location || ""}
                        onChange={(e) =>
                          handleNestedChange("professional", "location", e.target.value)
                        }
                        size="small"
                        sx={{ width: 200 }}
                      />
                    ) : (
                      <Typography variant="body2">
                        {currentUser.professional?.location || "Non spécifié"}
                      </Typography>
                    )}
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <SchoolIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
                    {isEditing ? (
                      <TextField
                        label="Années d'expérience"
                        type="number"
                        inputProps={{ min: 0 }}
                        value={editValues.professional?.experience || 0}
                        onChange={(e) =>
                          handleNestedChange(
                            "professional",
                            "experience",
                            parseInt(e.target.value, 10) || 0
                          )
                        }
                        size="small"
                        sx={{ width: 150 }}
                      />
                    ) : (
                      <Typography variant="body2">
                        {currentUser.professional?.experience || 0} ans d'expérience
                      </Typography>
                    )}
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Réseaux sociaux */}
                <Box sx={{ display: "flex", alignItems: "center", mb: 2, flexWrap: "wrap" }}>
                  {isEditing ? (
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          label="LinkedIn"
                          value={editValues.social?.linkedin || ""}
                          onChange={(e) => handleNestedChange("social", "linkedin", e.target.value)}
                          fullWidth
                          size="small"
                          InputProps={{
                            startAdornment: <LinkedInIcon color="primary" sx={{ mr: 1 }} />,
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          label="GitHub"
                          value={editValues.social?.github || ""}
                          onChange={(e) => handleNestedChange("social", "github", e.target.value)}
                          fullWidth
                          size="small"
                          InputProps={{
                            startAdornment: <GitHubIcon color="primary" sx={{ mr: 1 }} />,
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          label="Twitter"
                          value={editValues.social?.twitter || ""}
                          onChange={(e) => handleNestedChange("social", "twitter", e.target.value)}
                          fullWidth
                          size="small"
                          InputProps={{
                            startAdornment: <TwitterIcon color="primary" sx={{ mr: 1 }} />,
                          }}
                        />
                      </Grid>
                    </Grid>
                  ) : (
                    <>
                      {currentUser.social?.linkedin && (
                        <IconButton
                          color="primary"
                          component="a"
                          href={currentUser.social.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ mr: 1 }}
                        >
                          <LinkedInIcon />
                        </IconButton>
                      )}
                      {currentUser.social?.github && (
                        <IconButton
                          color="primary"
                          component="a"
                          href={currentUser.social.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ mr: 1 }}
                        >
                          <GitHubIcon />
                        </IconButton>
                      )}
                      {currentUser.social?.twitter && (
                        <IconButton
                          color="primary"
                          component="a"
                          href={currentUser.social.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ mr: 1 }}
                        >
                          <TwitterIcon />
                        </IconButton>
                      )}
                    </>
                  )}
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Certifications */}
                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6">
                      <BarChartIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                      Certifications
                    </Typography>
                    <Box>
                      <Button
                        startIcon={<AddIcon />}
                        color="primary"
                        onClick={handleOpenSkillDialog}
                        size="small"
                        variant="contained"
                        sx={{ borderRadius: 2 }}
                      >
                        Ajouter
                      </Button>
                    </Box>
                  </Box>

                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {Array.isArray(currentUser.skills) && currentUser.skills.length > 0 ? (
                      currentUser.skills.map((skill) => (
                        <Chip
                          key={skill.name}
                          label={
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              {skill.name}
                              <Box sx={{ ml: 1, width: 50 }}>
                                <LinearProgress
                                  variant="determinate"
                                  value={(skill.level / 5) * 100}
                                  color={getSkillColor(skill.level)}
                                />
                              </Box>
                            </Box>
                          }
                          onDelete={() => handleDeleteSkill(skill.name)}
                          deleteIcon={
                            deletingSkill === skill.name ? (
                              <CircularProgress size={16} />
                            ) : (
                              <DeleteIcon />
                            )
                          }
                          disabled={deletingSkill === skill.name}
                          sx={{ py: 2, pr: 1, borderRadius: 2 }}
                        />
                      ))
                    ) : profileLoading ? (
                      <CircularProgress size={20} />
                    ) : (
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          Aucune certification trouvée dans l'utilisateur actuel
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>

                {isEditing ? (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Informations de contact
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Email"
                          value={editValues.email}
                          onChange={(e) => handleChange("email", e.target.value)}
                          fullWidth
                          margin="dense"
                          disabled
                          helperText="L'email ne peut pas être modifié"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Téléphone"
                          value={editValues.contact?.phoneNumber || ""}
                          onChange={(e) =>
                            handleNestedChange("contact", "phoneNumber", e.target.value)
                          }
                          fullWidth
                          margin="dense"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Adresse"
                          value={editValues.contact?.address || ""}
                          onChange={(e) => handleNestedChange("contact", "address", e.target.value)}
                          fullWidth
                          margin="dense"
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          label="Ville"
                          value={editValues.contact?.city || ""}
                          onChange={(e) => handleNestedChange("contact", "city", e.target.value)}
                          fullWidth
                          margin="dense"
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          label="Code postal"
                          value={editValues.contact?.postalCode || ""}
                          onChange={(e) =>
                            handleNestedChange("contact", "postalCode", e.target.value)
                          }
                          fullWidth
                          margin="dense"
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          label="Pays"
                          value={editValues.contact?.country || ""}
                          onChange={(e) => handleNestedChange("contact", "country", e.target.value)}
                          fullWidth
                          margin="dense"
                        />
                      </Grid>
                    </Grid>
                  </Box>
                ) : (
                  <Box sx={{ mt: 3 }}>
                    {/* Section de débogage */}
                    <SkillsDebugger />

                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h6" color="primary" gutterBottom>
                      Informations de contact
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                          <IconButton size="small" color="primary" sx={{ mr: 1, p: 0 }}>
                            <EmailIcon fontSize="small" />
                          </IconButton>
                          <Typography variant="body2">
                            {currentUser.email || "Email non spécifié"}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                          <IconButton size="small" color="primary" sx={{ mr: 1, p: 0 }}>
                            <PhoneIcon fontSize="small" />
                          </IconButton>
                          <Typography variant="body2">
                            {(currentUser.contact && currentUser.contact.phoneNumber) ||
                              (profile &&
                                profile.personalInfo &&
                                profile.personalInfo.phoneNumber) ||
                              "Téléphone non spécifié"}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12}>
                        <Box sx={{ display: "flex", alignItems: "flex-start", mb: 1 }}>
                          <IconButton size="small" color="primary" sx={{ mr: 1, p: 0, mt: 0.5 }}>
                            <HomeIcon fontSize="small" />
                          </IconButton>
                          <Typography variant="body2">
                            {currentUser.contact && currentUser.contact.address ? (
                              <>
                                {currentUser.contact.address}
                                <br />
                                {currentUser.contact.postalCode || ""}{" "}
                                {currentUser.contact.city || ""}
                                <br />
                                {currentUser.contact.country || ""}
                              </>
                            ) : profile && profile.personalInfo && profile.personalInfo.address ? (
                              <>
                                {profile.personalInfo.address}
                                <br />
                                {profile.personalInfo.postalCode || ""}{" "}
                                {profile.personalInfo.city || ""}
                                <br />
                                {profile.personalInfo.country || ""}
                              </>
                            ) : (
                              "Adresse non spécifiée"
                            )}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                )}
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Fade>

      {/* Dialogue pour ajouter/modifier une certification */}
      <Dialog
        open={skillDialogOpen}
        onClose={handleCloseSkillDialog}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: 3,
          },
        }}
      >
        <DialogTitle
          sx={{
            background: "linear-gradient(45deg, #4776E6 0%, #8E54E9 100%)",
            color: "white",
            borderRadius: "8px 8px 0 0",
          }}
        >
          Ajouter une certification
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <TextField
            fullWidth
            label="Nom de la certification"
            value={newSkill.name}
            onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
            margin="normal"
            variant="outlined"
            autoFocus
            placeholder="Ex: AWS Solutions Architect, Google Cloud Professional, etc."
            helperText="Entrez le nom exact de votre certification"
            InputProps={{
              sx: { borderRadius: 2 },
            }}
          />
          <Box sx={{ mt: 3 }}>
            <Typography gutterBottom>Niveau de maîtrise:</Typography>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mr: 1, minWidth: 60 }}>
                Débutant
              </Typography>
              <LinearProgress
                variant="determinate"
                value={(newSkill.level / 5) * 100}
                color={getSkillColor(newSkill.level)}
                sx={{ flexGrow: 1, height: 10, borderRadius: 5 }}
              />
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ ml: 1, minWidth: 60, textAlign: "right" }}
              >
                Expert
              </Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
              {[1, 2, 3, 4, 5].map((level) => (
                <Button
                  key={level}
                  variant={newSkill.level === level ? "contained" : "outlined"}
                  color={getSkillColor(level)}
                  onClick={() => setNewSkill({ ...newSkill, level })}
                  size="medium"
                  sx={{
                    minWidth: 50,
                    borderRadius: 2,
                    p: 1,
                  }}
                >
                  {level}
                </Button>
              ))}
            </Box>
          </Box>

          <Box sx={{ mt: 3, p: 2, bgcolor: "background.default", borderRadius: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Description des niveaux:
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <b>1:</b> Découverte - Connaissance basique des concepts
              <br />
              <b>2:</b> Fondamentaux - Certification introductive
              <br />
              <b>3:</b> Intermédiaire - Certification professionnelle
              <br />
              <b>4:</b> Avancé - Certification spécialisée
              <br />
              <b>5:</b> Expert - Certification expert/formateur
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseSkillDialog} sx={{ borderRadius: 2 }}>
            Annuler
          </Button>
          <Button
            onClick={handleSaveSkill}
            color="primary"
            disabled={!newSkill.name.trim() || savingSkill}
            variant="contained"
            startIcon={savingSkill ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            sx={{ borderRadius: 2 }}
          >
            {savingSkill ? "Enregistrement..." : "Enregistrer la certification"}
          </Button>
        </DialogActions>
      </Dialog>
    </MDBox>
  );
}

export default ProfileCard;
