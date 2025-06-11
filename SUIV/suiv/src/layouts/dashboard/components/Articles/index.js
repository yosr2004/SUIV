// @mui material components
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Import articles data et services
import articlesData from "layouts/dashboard/data/articlesData";
import { dashboardService } from "services/api";
import { useState, useEffect } from "react";

function Articles() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [articles, setArticles] = useState([]);

  // Charger les articles depuis l'API
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const response = await dashboardService.getRecommendedArticles();
        setArticles(response.articles || []);
        setLoading(false);
      } catch (err) {
        console.error("Erreur lors du chargement des articles:", err);
        setError("Impossible de charger les articles. Affichage des articles par défaut.");
        setArticles(articlesData);
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  // Si l'API ne retourne pas de données, utiliser les données par défaut
  const displayArticles = articles.length > 0 ? articles : articlesData;

  return (
    <Card>
      <MDBox p={3}>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <MDTypography variant="h6" fontWeight="medium">
              Articles Recommandés
            </MDTypography>
          </Grid>
          <Grid item>
            <Chip
              label="Ressources d'apprentissage"
              color="primary"
              size="small"
              sx={{ borderRadius: "6px" }}
            />
          </Grid>
        </Grid>
        <MDBox mt={1} mb={2}>
          <MDTypography variant="button" color="text" fontWeight="regular">
            Articles sélectionnés pour vous aider à développer vos compétences et votre carrière
          </MDTypography>
        </MDBox>

        {error && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <MDBox display="flex" justifyContent="center" alignItems="center" height="300px">
            <CircularProgress color="info" />
          </MDBox>
        ) : (
          <Grid container spacing={3}>
            {displayArticles.map((article) => (
              <Grid item xs={12} md={6} key={article.id}>
                <MDBox
                  sx={{
                    borderRadius: "lg",
                    overflow: "hidden",
                    transition: "transform 300ms ease, box-shadow 300ms ease",
                    "&:hover": {
                      transform: "translateY(-5px)",
                      boxShadow: "0 12px 20px -10px rgba(0,0,0,0.2)",
                    },
                  }}
                >
                  <Card sx={{ boxShadow: "sm" }}>
                    <MDBox
                      position="relative"
                      sx={{
                        height: "200px",
                        overflow: "hidden",
                      }}
                    >
                      <MDBox
                        component="img"
                        src={article.image}
                        alt={article.title}
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          objectPosition: "center",
                        }}
                      />
                      <Box
                        sx={{
                          position: "absolute",
                          top: "12px",
                          left: "12px",
                          zIndex: 2,
                        }}
                      >
                        <Chip
                          label={article.category}
                          color="primary"
                          size="small"
                          sx={{
                            backgroundColor: "rgba(255, 255, 255, 0.9)",
                            color: "#000",
                            fontWeight: "bold",
                            fontSize: "0.675rem",
                          }}
                        />
                      </Box>
                    </MDBox>
                    <MDBox p={3}>
                      <MDTypography
                        variant="h5"
                        fontWeight="medium"
                        textTransform="capitalize"
                        lineHeight={1.2}
                        mb={1.5}
                        sx={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {article.title}
                      </MDTypography>
                      <MDTypography
                        variant="body2"
                        color="text"
                        mb={2}
                        sx={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {article.excerpt}
                      </MDTypography>
                      <MDBox display="flex" alignItems="center" justifyContent="space-between">
                        <MDBox display="flex" alignItems="center">
                          <Avatar
                            sx={{
                              width: 30,
                              height: 30,
                              backgroundColor: ({ palette: { info } }) => info.main,
                            }}
                          >
                            {article.author.charAt(0)}
                          </Avatar>
                          <MDBox ml={1}>
                            <MDTypography variant="button" fontWeight="medium">
                              {article.author}
                            </MDTypography>
                            <MDTypography variant="caption" color="text" display="block">
                              {article.date}
                            </MDTypography>
                          </MDBox>
                        </MDBox>
                        <MDTypography
                          variant="caption"
                          color="text"
                          display="flex"
                          alignItems="center"
                        >
                          <Icon fontSize="small" sx={{ mr: 0.5 }}>
                            schedule
                          </Icon>
                          {article.readTime}
                        </MDTypography>
                      </MDBox>
                      <Divider sx={{ my: 2 }} />
                      <MDBox display="flex" justifyContent="space-between" alignItems="center">
                        <MDButton
                          variant="text"
                          color="info"
                          component={Link}
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Lire plus
                        </MDButton>
                        <MDButton variant="text" color="dark">
                          <Icon>bookmark_border</Icon>
                        </MDButton>
                      </MDBox>
                    </MDBox>
                  </Card>
                </MDBox>
              </Grid>
            ))}

            {displayArticles.length === 0 && !loading && (
              <Grid item xs={12}>
                <MDBox textAlign="center" py={4}>
                  <Icon color="text.secondary" sx={{ fontSize: 60, opacity: 0.5 }}>
                    article
                  </Icon>
                  <MDTypography variant="h6" color="text.secondary" mt={1}>
                    Aucun article disponible
                  </MDTypography>
                </MDBox>
              </Grid>
            )}
          </Grid>
        )}
      </MDBox>
    </Card>
  );
}

export default Articles;
