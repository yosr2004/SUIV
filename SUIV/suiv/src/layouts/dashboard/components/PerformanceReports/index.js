import { useState, useEffect } from "react";

// @mui material components
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDAvatar from "components/MDAvatar";
import MDButton from "components/MDButton";

// Material Dashboard 2 React examples
import ReportsLineChart from "examples/Charts/LineCharts/ReportsLineChart";
import ReportsBarChart from "examples/Charts/BarCharts/ReportsBarChart";

// Data et services
import performanceData from "layouts/dashboard/data/performanceData";
import { dashboardService } from "services/api";

function PerformanceReports() {
  const [activeTab, setActiveTab] = useState(0);
  const [timeframe, setTimeframe] = useState("yearly");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(performanceData);
  const [feedback, setFeedback] = useState({
    avatar: "https://randomuser.me/api/portraits/men/41.jpg",
    name: "Michel Durand",
    role: "Chef d'équipe",
    date: "Il y a 2 semaines",
    text: "Excellente progression dans le développement des compétences techniques. Votre leadership dans le dernier projet était remarquable, et vos capacités de résolution de problèmes se sont grandement améliorées.",
    badges: [
      { label: "Communication forte", color: "success" },
      { label: "Croissance technique", color: "info" },
    ],
  });

  // Charger les données depuis l'API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await dashboardService.getPerformanceData();
        setData(response.performanceData || performanceData);
        if (response.feedback) {
          setFeedback(response.feedback);
        }
        setLoading(false);
      } catch (err) {
        console.error("Erreur lors du chargement des données de performance:", err);
        setError("Impossible de charger les données. Utilisation des données par défaut.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Effet pour mettre à jour les données lors du changement de période
  useEffect(() => {
    const updateTimeframeData = async () => {
      try {
        setLoading(true);
        const response = await dashboardService.getPerformanceData({ timeframe });
        setData(response.performanceData || data);
        setLoading(false);
      } catch (err) {
        console.error(`Erreur lors du chargement des données ${timeframe}:`, err);
        setLoading(false);
      }
    };

    // Ne pas exécuter lors du premier chargement
    if (!loading) {
      updateTimeframeData();
    }
  }, [timeframe]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleTimeframeChange = (event) => {
    setTimeframe(event.target.value);
  };

  const { progressOverTime, skillsPerQuarter, evaluationScores } = data;

  // Define icons for tabs
  const tabIcons = ["trending_up", "bar_chart", "grade"];

  if (loading && !data) {
    return (
      <Card
        sx={{
          overflow: "visible",
          minHeight: "400px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress color="info" />
      </Card>
    );
  }

  return (
    <Card
      sx={{
        overflow: "visible",
        background: "linear-gradient(to right, #f5f7fa, #ffffff)",
        boxShadow: "0 4px 20px 0 rgba(0, 0, 0, 0.05)",
      }}
    >
      <MDBox p={3} pb={0}>
        {error && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container justifyContent="space-between" alignItems="center" mb={2}>
          <Grid item>
            <MDTypography variant="h6" fontWeight="medium">
              Rapports de Performance et d'Évaluation
            </MDTypography>
            <MDBox display="flex" alignItems="center">
              <Icon sx={{ color: ({ palette: { success } }) => success.main, fontSize: "1.1rem" }}>
                trending_up
              </Icon>
              <MDTypography variant="button" color="text" fontWeight="regular" ml={0.5}>
                Amélioration constante des scores d'évaluation
              </MDTypography>
            </MDBox>
          </Grid>
          <Grid item>
            <FormControl sx={{ minWidth: 120 }} size="small">
              {loading && timeframe !== "yearly" ? (
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  <MDTypography variant="caption">Chargement...</MDTypography>
                </Box>
              ) : (
                <Select
                  value={timeframe}
                  onChange={handleTimeframeChange}
                  displayEmpty
                  sx={{
                    height: "40px",
                    borderRadius: "8px",
                    fontSize: "0.75rem",
                  }}
                >
                  <MenuItem value="monthly">Mensuel</MenuItem>
                  <MenuItem value="quarterly">Trimestriel</MenuItem>
                  <MenuItem value="yearly">Annuel</MenuItem>
                </Select>
              )}
            </FormControl>
          </Grid>
        </Grid>

        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          textColor="primary"
          indicatorColor="primary"
          sx={{
            mb: 0,
            borderBottom: "1px solid #eee",
            "& .MuiTabs-indicator": {
              height: 3,
              borderRadius: 1.5,
            },
            "& .MuiTab-root": {
              minHeight: "60px",
              fontWeight: "bold",
              transition: "all 0.2s",
              "&.Mui-selected": {
                fontWeight: "bold",
                transition: "all 0.2s",
              },
            },
          }}
        >
          {["Progression dans le temps", "Compétences par trimestre", "Scores d'évaluation"].map(
            (label, index) => (
              <Tab
                key={label}
                label={label}
                icon={<Icon>{tabIcons[index]}</Icon>}
                iconPosition="start"
                sx={{
                  "& .MuiTab-iconWrapper": {
                    mr: 1,
                    transition: "all 0.2s",
                  },
                }}
              />
            )
          )}
        </Tabs>
      </MDBox>

      <MDBox px={3} pb={3}>
        <Box sx={{ height: 300, mt: 3, position: "relative" }}>
          {loading && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "rgba(255,255,255,0.7)",
                zIndex: 2,
              }}
            >
              <CircularProgress color="info" />
            </Box>
          )}
          {activeTab === 0 && (
            <ReportsLineChart
              color="success"
              title="Progression dans le temps"
              description="Score de performance en hausse continue"
              date="Mis à jour il y a 2 semaines"
              chart={progressOverTime}
            />
          )}
          {activeTab === 1 && (
            <ReportsBarChart
              color="info"
              title="Compétences acquises par trimestre"
              description="Nouvelles compétences ajoutées à votre portfolio"
              date="Mis à jour mensuellement"
              chart={skillsPerQuarter}
            />
          )}
          {activeTab === 2 && (
            <ReportsBarChart
              color="warning"
              title="Scores d'évaluation"
              description="Notes d'évaluation du manager (sur 5)"
              date="Dernière période d'évaluation"
              chart={evaluationScores}
            />
          )}
        </Box>

        {activeTab === 2 && (
          <MDBox mt={4}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <MDTypography variant="button" fontWeight="bold" color="text">
                  Commentaires récents
                </MDTypography>
              </Grid>
              <Grid item xs={12}>
                <MDBox
                  p={2}
                  borderRadius="lg"
                  bgColor="white"
                  boxShadow="0 2px 12px 0 rgba(0,0,0,0.05)"
                >
                  <Grid container spacing={2}>
                    <Grid item>
                      <MDAvatar
                        src={feedback.avatar}
                        alt="Manager"
                        size="md"
                        sx={{ border: "2px solid white" }}
                      />
                    </Grid>
                    <Grid item xs>
                      <MDBox>
                        <MDTypography variant="button" fontWeight="medium">
                          {feedback.name}
                        </MDTypography>
                        <MDTypography variant="caption" color="text" display="block">
                          {feedback.role} • {feedback.date}
                        </MDTypography>
                        <MDBox mt={1}>
                          <MDTypography variant="body2" color="text">
                            {feedback.text}
                          </MDTypography>
                        </MDBox>
                        <MDBox mt={2} display="flex" gap={1}>
                          {feedback.badges &&
                            feedback.badges.map((badge, index) => (
                              <Chip
                                key={index}
                                label={badge.label}
                                size="small"
                                color={badge.color}
                                sx={{ borderRadius: "6px" }}
                              />
                            ))}
                        </MDBox>
                      </MDBox>
                    </Grid>
                  </Grid>
                </MDBox>
              </Grid>
            </Grid>
          </MDBox>
        )}
      </MDBox>
    </Card>
  );
}

export default PerformanceReports;
