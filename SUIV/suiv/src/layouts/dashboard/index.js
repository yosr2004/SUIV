// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";

// Dashboard components
import PosteProjects from "layouts/dashboard/components/PosteProjects";
import SkillProgress from "layouts/dashboard/components/SkillProgress";
import PerformanceReports from "layouts/dashboard/components/PerformanceReports";
import Articles from "layouts/dashboard/components/Articles";

// API Services
import { dashboardService } from "services/api";
import { useState, useEffect } from "react";

function Dashboard() {
  const theme = useTheme();
  const isMediumScreen = useMediaQuery(theme.breakpoints.down("lg"));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    skillsAcquired: { count: 32, percentage: 8 },
    evaluation: { score: "4.3/5", percentage: 12 },
    achievements: { count: 8, new: 3 },
    pendingTasks: { count: 5 },
  });

  // Charger les statistiques depuis l'API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await dashboardService.getDashboardStats();
        if (response && response.stats) {
          setStats(response.stats);
        }
        setLoading(false);
      } catch (err) {
        console.error("Erreur lors du chargement des statistiques:", err);
        setError("Impossible de charger les statistiques.");
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading && !stats) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
          <CircularProgress color="info" />
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3} sx={{ background: "#f8fafc" }}>
        {error && (
          <MDBox mb={2}>
            <Alert severity="warning">{error}</Alert>
          </MDBox>
        )}

        <MDBox mb={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={3}>
              <MDBox mb={1.5} height="100%">
                <ComplexStatisticsCard
                  color="dark"
                  icon="school"
                  title="Compétences Acquises"
                  count={stats.skillsAcquired.count}
                  percentage={{
                    color: "success",
                    amount: `+${stats.skillsAcquired.percentage}%`,
                    label: "vs trimestre précédent",
                  }}
                  loading={loading}
                />
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <MDBox mb={1.5} height="100%">
                <ComplexStatisticsCard
                  icon="leaderboard"
                  title="Évaluation Moyenne"
                  count={stats.evaluation.score}
                  percentage={{
                    color: "success",
                    amount: `+${stats.evaluation.percentage}%`,
                    label: "vs dernière évaluation",
                  }}
                  loading={loading}
                />
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <MDBox mb={1.5} height="100%">
                <ComplexStatisticsCard
                  color="success"
                  icon="emoji_events"
                  title="Réalisations"
                  count={stats.achievements.count}
                  percentage={{
                    color: "success",
                    amount: `+${stats.achievements.new}`,
                    label: "nouvelles ce mois",
                  }}
                  loading={loading}
                />
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <MDBox mb={1.5} height="100%">
                <ComplexStatisticsCard
                  color="primary"
                  icon="assignment"
                  title="Tâches en Attente"
                  count={stats.pendingTasks.count}
                  percentage={{
                    color: "success",
                    amount: "",
                    label: "Mise à jour récente",
                  }}
                  loading={loading}
                />
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>

        <MDBox mb={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <SkillProgress />
            </Grid>
          </Grid>
        </MDBox>

        <MDBox mb={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <PerformanceReports />
            </Grid>
          </Grid>
        </MDBox>

        <MDBox mb={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Articles />
            </Grid>
          </Grid>
        </MDBox>

        <MDBox>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <PosteProjects />
            </Grid>
          </Grid>
        </MDBox>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Dashboard;
