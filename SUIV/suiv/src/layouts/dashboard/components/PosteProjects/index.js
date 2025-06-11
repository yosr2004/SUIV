import { useState, useEffect } from "react";

// @mui material components
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import Grid from "@mui/material/Grid";
import Tooltip from "@mui/material/Tooltip";
import CircularProgress from "@mui/material/CircularProgress";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDAvatar from "components/MDAvatar";
import MDProgress from "components/MDProgress";

// Import des images
import logoPoste from "assets/images/small-logos/logo-poste.svg";
import logoIot from "assets/images/small-logos/logo-atlassian.svg";
import logoDigital from "assets/images/small-logos/logo-slack.svg";
import logoMobile from "assets/images/small-logos/logo-spotify.svg";
import logoCrm from "assets/images/small-logos/logo-jira.svg";
import logoAi from "assets/images/small-logos/logo-invision.svg";
import team1 from "assets/images/team-1.jpg";
import team2 from "assets/images/team-2.jpg";
import team3 from "assets/images/team-3.jpg";
import team4 from "assets/images/team-4.jpg";

function PosteProjects() {
  const [menu, setMenu] = useState(null);
  const [loading, setLoading] = useState(false);

  const openMenu = ({ currentTarget }) => setMenu(currentTarget);
  const closeMenu = () => setMenu(null);

  // Composant pour afficher les avatars des membres de l'équipe
  const avatars = (members) =>
    members.map(([image, name]) => (
      <Tooltip key={name} title={name} placeholder="bottom">
        <MDAvatar
          src={image}
          alt="name"
          size="xs"
          sx={{
            border: ({ borders: { borderWidth }, palette: { white } }) =>
              `${borderWidth[2]} solid ${white.main}`,
            cursor: "pointer",
            position: "relative",
            "&:not(:first-of-type)": {
              ml: -1.25,
            },
            "&:hover, &:focus": {
              zIndex: "10",
            },
          }}
        />
      </Tooltip>
    ));

  // Composant pour afficher le nom du projet avec son logo
  const Project = ({ image, name }) => (
    <MDBox display="flex" alignItems="center" lineHeight={1}>
      <MDAvatar src={image} name={name} size="sm" />
      <MDTypography variant="button" fontWeight="medium" ml={1} lineHeight={1}>
        {name}
      </MDTypography>
    </MDBox>
  );

  const renderMenu = (
    <Menu
      id="simple-menu"
      anchorEl={menu}
      anchorOrigin={{
        vertical: "top",
        horizontal: "left",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={Boolean(menu)}
      onClose={closeMenu}
    >
      <MenuItem onClick={closeMenu}>Voir détails</MenuItem>
      <MenuItem onClick={closeMenu}>Générer rapport</MenuItem>
      <MenuItem onClick={closeMenu}>Contacter l'équipe</MenuItem>
    </Menu>
  );

  // Tableau de données des projets
  const projects = [
    {
      project: <Project image={logoPoste} name="Refonte du système de suivi colis" />,
      members: [
        [team1, "Aala Abidi"],
        [team2, "Amra Zouaoui"],
        [team3, "Nour Jaballah"],
        [team4, "Rania Marzouki"],
      ],
      completion: 75,
    },
    {
      project: <Project image={logoIot} name="IoT pour le suivi des véhicules" />,
      members: [
        [team2, "Amra Zouaoui"],
        [team4, "Rania Marzouki"],
      ],
      completion: 35,
    },
    {
      project: <Project image={logoDigital} name="Transformation digitale des bureaux" />,
      members: [
        [team1, "Aala Abidi"],
        [team3, "Nour Jaballah"],
      ],
      completion: 100,
    },
    {
      project: <Project image={logoMobile} name="Application mobile de services postaux" />,
      members: [
        [team4, "Rania Marzouki"],
        [team3, "Nour Jaballah"],
        [team2, "Amra Zouaoui"],
        [team1, "Aala Abidi"],
      ],
      completion: 90,
    },
    {
      project: <Project image={logoCrm} name="CRM pour service client" />,
      members: [[team4, "Rania Marzouki"]],
      completion: 25,
    },
    {
      project: <Project image={logoAi} name="IA pour optimisation logistique" />,
      members: [
        [team1, "Aala Abidi"],
        [team4, "Rania Marzouki"],
      ],
      completion: 40,
    },
  ];

  return (
    <Card>
      <MDBox display="flex" justifyContent="space-between" alignItems="center" p={3}>
        <MDBox>
          <MDTypography variant="h6" gutterBottom>
            Projets de la Poste Tunisienne
          </MDTypography>
          <MDBox display="flex" alignItems="center" lineHeight={0}>
            <Icon
              sx={{
                fontWeight: "bold",
                color: ({ palette: { success } }) => success.main,
                mt: -0.5,
              }}
            >
              check_circle
            </Icon>
            <MDTypography variant="button" fontWeight="regular" color="text">
              &nbsp;<strong>2 projets terminés</strong> ce trimestre
            </MDTypography>
          </MDBox>
        </MDBox>
        <MDBox color="text" px={2}>
          <Icon sx={{ cursor: "pointer", fontWeight: "bold" }} fontSize="small" onClick={openMenu}>
            more_vert
          </Icon>
        </MDBox>
        {renderMenu}
      </MDBox>

      {loading ? (
        <MDBox display="flex" justifyContent="center" p={3}>
          <CircularProgress color="info" />
        </MDBox>
      ) : (
        <MDBox p={3}>
          <Grid container spacing={3}>
            {projects.map((project, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <MDBox
                  p={3}
                  sx={{
                    boxShadow: "0 2px 8px 0 rgba(0,0,0,0.05)",
                    borderRadius: 2,
                    transition: "transform 0.2s",
                    "&:hover": {
                      transform: "translateY(-5px)",
                      boxShadow: "0 8px 20px 0 rgba(0,0,0,0.1)",
                    },
                  }}
                >
                  <MDBox mb={2}>{project.project}</MDBox>
                  <MDBox mb={1}>
                    <MDTypography variant="caption" color="text" fontWeight="medium">
                      Équipe:
                    </MDTypography>
                    <MDBox display="flex" py={1}>
                      {avatars(project.members)}
                    </MDBox>
                  </MDBox>
                  <MDBox mb={2} display="flex" alignItems="center">
                    <MDTypography variant="caption" color="text" fontWeight="medium" mr={1}>
                      Progression:
                    </MDTypography>
                    <MDTypography variant="button" fontWeight="bold">
                      {project.completion}%
                    </MDTypography>
                  </MDBox>
                  <MDProgress
                    value={project.completion}
                    color={project.completion === 100 ? "success" : "info"}
                    variant="gradient"
                    label={false}
                  />
                </MDBox>
              </Grid>
            ))}
          </Grid>
        </MDBox>
      )}
    </Card>
  );
}

export default PosteProjects;
