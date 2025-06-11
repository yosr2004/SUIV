/* eslint-disable react/prop-types */
/* eslint-disable react/function-component-definition */

// @mui material components
import Tooltip from "@mui/material/Tooltip";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDAvatar from "components/MDAvatar";
import MDProgress from "components/MDProgress";

// Images
import logoPoste from "assets/images/small-logos/logo-poste.svg"; // Note: Vous devrez ajouter ce logo
import logoIot from "assets/images/small-logos/logo-atlassian.svg";
import logoDigital from "assets/images/small-logos/logo-slack.svg";
import logoMobile from "assets/images/small-logos/logo-spotify.svg";
import logoCrm from "assets/images/small-logos/logo-jira.svg";
import logoAi from "assets/images/small-logos/logo-invision.svg";
import team1 from "assets/images/team-1.jpg";
import team2 from "assets/images/team-2.jpg";
import team3 from "assets/images/team-3.jpg";
import team4 from "assets/images/team-4.jpg";

export default function data() {
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

  const Company = ({ image, name }) => (
    <MDBox display="flex" alignItems="center" lineHeight={1}>
      <MDAvatar src={image} name={name} size="sm" />
      <MDTypography variant="button" fontWeight="medium" ml={1} lineHeight={1}>
        {name}
      </MDTypography>
    </MDBox>
  );

  return {
    columns: [
      { Header: "projet", accessor: "companies", width: "45%", align: "left" },
      { Header: "équipe", accessor: "members", width: "10%", align: "left" },
      { Header: "budget", accessor: "budget", align: "center" },
      { Header: "progression", accessor: "completion", align: "center" },
    ],

    rows: [
      {
        companies: <Company image={logoPoste} name="Refonte du système de suivi colis" />,
        members: (
          <MDBox display="flex" py={1}>
            {avatars([
              [team1, "Mohamed Aziz"],
              [team2, "Leila Ben Ali"],
              [team3, "Karim Chouik"],
              [team4, "Ines Majdoub"],
            ])}
          </MDBox>
        ),
        budget: (
          <MDTypography variant="caption" color="text" fontWeight="medium">
            250 000 DT
          </MDTypography>
        ),
        completion: (
          <MDBox width="8rem" textAlign="left">
            <MDProgress value={75} color="info" variant="gradient" label={false} />
          </MDBox>
        ),
      },
      {
        companies: <Company image={logoIot} name="IoT pour le suivi des véhicules" />,
        members: (
          <MDBox display="flex" py={1}>
            {avatars([
              [team2, "Leila Ben Ali"],
              [team4, "Ines Majdoub"],
            ])}
          </MDBox>
        ),
        budget: (
          <MDTypography variant="caption" color="text" fontWeight="medium">
            120 000 DT
          </MDTypography>
        ),
        completion: (
          <MDBox width="8rem" textAlign="left">
            <MDProgress value={35} color="info" variant="gradient" label={false} />
          </MDBox>
        ),
      },
      {
        companies: <Company image={logoDigital} name="Transformation digitale des bureaux" />,
        members: (
          <MDBox display="flex" py={1}>
            {avatars([
              [team1, "Mohamed Aziz"],
              [team3, "Karim Chouik"],
            ])}
          </MDBox>
        ),
        budget: (
          <MDTypography variant="caption" color="text" fontWeight="medium">
            310 000 DT
          </MDTypography>
        ),
        completion: (
          <MDBox width="8rem" textAlign="left">
            <MDProgress value={100} color="success" variant="gradient" label={false} />
          </MDBox>
        ),
      },
      {
        companies: <Company image={logoMobile} name="Application mobile de services postaux" />,
        members: (
          <MDBox display="flex" py={1}>
            {avatars([
              [team4, "Ines Majdoub"],
              [team3, "Karim Chouik"],
              [team2, "Leila Ben Ali"],
              [team1, "Mohamed Aziz"],
            ])}
          </MDBox>
        ),
        budget: (
          <MDTypography variant="caption" color="text" fontWeight="medium">
            180 000 DT
          </MDTypography>
        ),
        completion: (
          <MDBox width="8rem" textAlign="left">
            <MDProgress value={90} color="success" variant="gradient" label={false} />
          </MDBox>
        ),
      },
      {
        companies: <Company image={logoCrm} name="CRM pour service client" />,
        members: (
          <MDBox display="flex" py={1}>
            {avatars([[team4, "Ines Majdoub"]])}
          </MDBox>
        ),
        budget: (
          <MDTypography variant="caption" color="text" fontWeight="medium">
            85 000 DT
          </MDTypography>
        ),
        completion: (
          <MDBox width="8rem" textAlign="left">
            <MDProgress value={25} color="info" variant="gradient" label={false} />
          </MDBox>
        ),
      },
      {
        companies: <Company image={logoAi} name="IA pour optimisation logistique" />,
        members: (
          <MDBox display="flex" py={1}>
            {avatars([
              [team1, "Mohamed Aziz"],
              [team4, "Ines Majdoub"],
            ])}
          </MDBox>
        ),
        budget: (
          <MDTypography variant="caption" color="text" fontWeight="medium">
            175 000 DT
          </MDTypography>
        ),
        completion: (
          <MDBox width="8rem" textAlign="left">
            <MDProgress value={40} color="info" variant="gradient" label={false} />
          </MDBox>
        ),
      },
    ],
  };
}
