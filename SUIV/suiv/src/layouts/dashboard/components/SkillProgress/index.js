import { useState, useEffect } from "react";

// @mui material components
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import LinearProgress from "@mui/material/LinearProgress";
import Tooltip from "@mui/material/Tooltip";
import CircularProgress from "@mui/material/CircularProgress";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDBadge from "components/MDBadge";

// Material Dashboard 2 React examples
import ReportsBarChart from "examples/Charts/BarCharts/ReportsBarChart";

// Data et services
import skillProgressData from "layouts/dashboard/data/skillProgressData";
import { dashboardService } from "services/api";

function SkillProgress() {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [skillData, setSkillData] = useState(skillProgressData);
  const [improvement, setImprovement] = useState(12);

  // Charger les données depuis l'API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await dashboardService.getSkillProgress();
        setSkillData(data.skills || skillProgressData);
        setImprovement(data.improvement || 12);
        setLoading(false);
      } catch (err) {
        console.error("Erreur lors du chargement des données de compétences:", err);
        setError("Impossible de charger les données. Utilisation des données par défaut.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const { technical, soft, domain } = skillData;

  // Function to get data for current tab
  const getCurrentTabData = () => {
    switch (activeTab) {
      case 0:
        return technical;
      case 1:
        return soft;
      case 2:
        return domain;
      default:
        return technical;
    }
  };

  // Define colors for different skill levels
  const getColorForValue = (value) => {
    if (value >= 80) return "success";
    if (value >= 65) return "info";
    if (value >= 50) return "warning";
    return "error";
  };

  const currentData = getCurrentTabData();

  if (loading) {
    return (
      <Card
        sx={{
          overflow: "visible",
          height: "100%",
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
    <Card sx={{ overflow: "visible" }}>
      <MDBox p={3} pb={0} sx={{ position: "relative" }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <MDTypography variant="h6" fontWeight="medium">
              Progression des Compétences
            </MDTypography>
          </Grid>
          <Grid item>
            <MDBadge
              variant="contained"
              color="success"
              badgeContent={`+${improvement}%`}
              container
            />
          </Grid>
        </Grid>
        <MDBox mt={1} mb={2}>
          <MDTypography variant="button" color="text" fontWeight="regular">
            <MDTypography display="inline" variant="body2" verticalAlign="middle">
              <Icon sx={{ color: ({ palette: { success } }) => success.main, fontSize: "1.1rem" }}>
                trending_up
              </Icon>
            </MDTypography>
            &nbsp;
            <MDTypography variant="button" color="text" fontWeight="medium">
              Amélioration depuis la dernière évaluation
            </MDTypography>
          </MDTypography>
        </MDBox>

        {error && (
          <MDBox mt={1} mb={2}>
            <MDTypography variant="caption" color="error">
              {error}
            </MDTypography>
          </MDBox>
        )}

        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          textColor="primary"
          indicatorColor="primary"
          sx={{
            mb: 0,
            "& .MuiTabs-indicator": {
              height: 3,
              borderRadius: 1.5,
            },
            "& .MuiTab-root": {
              fontWeight: "bold",
              transition: "all 0.2s",
              "&.Mui-selected": {
                fontWeight: "bold",
                transition: "all 0.2s",
              },
            },
          }}
        >
          <Tab label="Technique" icon={<Icon>code</Icon>} iconPosition="start" />
          <Tab label="Relationnel" icon={<Icon>people</Icon>} iconPosition="start" />
          <Tab label="Domaine" icon={<Icon>business</Icon>} iconPosition="start" />
        </Tabs>
      </MDBox>

      <MDBox px={3} pb={3}>
        <Box sx={{ height: 225, mt: 3 }}>
          <ReportsBarChart
            color={activeTab === 0 ? "info" : activeTab === 1 ? "success" : "warning"}
            title={
              activeTab === 0
                ? "Compétences techniques"
                : activeTab === 1
                ? "Compétences relationnelles"
                : "Connaissances du domaine"
            }
            description="Niveau de compétence sur une échelle de 0 à 100"
            date="Mis à jour il y a 1 semaine"
            chart={getCurrentTabData()}
          />
        </Box>

        <MDBox mt={4}>
          <Grid container spacing={3}>
            {currentData.labels.map((skill, index) => (
              <Grid item xs={12} key={skill}>
                <MDBox mb={1} display="flex" justifyContent="space-between" alignItems="center">
                  <MDTypography variant="button" fontWeight="medium">
                    {skill}
                  </MDTypography>
                  <MDTypography
                    variant="button"
                    fontWeight="medium"
                    color={getColorForValue(currentData.datasets.data[index])}
                  >
                    {currentData.datasets.data[index]}%
                  </MDTypography>
                </MDBox>
                <Tooltip title={`${currentData.datasets.data[index]}% de maîtrise`} placement="top">
                  <LinearProgress
                    variant="determinate"
                    value={currentData.datasets.data[index]}
                    color={getColorForValue(currentData.datasets.data[index])}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: "rgba(0,0,0,0.05)",
                    }}
                  />
                </Tooltip>
              </Grid>
            ))}
          </Grid>
        </MDBox>
      </MDBox>
    </Card>
  );
}

export default SkillProgress;
