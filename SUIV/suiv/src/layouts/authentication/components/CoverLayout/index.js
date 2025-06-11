
// prop-types is a library for typechecking of props
import PropTypes from "prop-types";

// @mui material components
import Grid from "@mui/material/Grid";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
// import MDTypography from "components/MDTypography";

// Material Dashboard 2 React example components
import PageLayout from "examples/LayoutContainers/PageLayout";

// Authentication layout components
import Footer from "layouts/authentication/components/Footer";

function CoverLayout({ coverHeight, image, children }) {
  return (
    <PageLayout>
      <MDBox
        width="calc(100% - 2rem)"
        minHeight={coverHeight}
        borderRadius="xl"
        mx={2}
        my={2}
        pt={6}
        pb={28}
        sx={{
          background: ({ palette: { info, white } }) => 
            `linear-gradient(135deg, ${info.main} 0%, ${white.main} 30%, ${info.dark} 60%, ${info.light} 80%, ${white.main} 100%)`,
          backgroundSize: "200% 200%",
          animation: "gradientAnimation 15s ease infinite",
          "@keyframes gradientAnimation": {
            "0%": {
              backgroundPosition: "0% 50%"
            },
            "50%": {
              backgroundPosition: "100% 50%"
            },
            "100%": {
              backgroundPosition: "0% 50%"
            }
          },
          boxShadow: "0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23), inset 0 0 80px rgba(0,0,0,0.1)",
          overflow: "hidden",
          position: "relative",
          zIndex: 0,
          "&::before": {
            content: '""',
            position: "absolute",
            top: "0",
            left: "0",
            right: "0",
            bottom: "0",
            background: "radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.15) 100%)",
            zIndex: 1
          },
          "&::after": {
            content: '""',
            position: "absolute",
            width: "200%",
            height: "200%",
            background: "radial-gradient(ellipse at center, rgba(255,255,255,0.5) 0%, transparent 70%)",
            top: "-50%",
            left: "-50%",
            opacity: 0.6,
            transform: "rotate(30deg)",
            zIndex: 2
          }
        }}
      />
      <MDBox mt={{ xs: -20, lg: -18 }} px={1} width="calc(100% - 2rem)" mx="auto">
        <Grid container spacing={1} justifyContent="center">
          <Grid item xs={11} sm={9} md={5} lg={4} xl={3}>
            {children}
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </PageLayout>
  );
}

// Setting default props for the CoverLayout
CoverLayout.defaultProps = {
  coverHeight: "35vh",
};

// Typechecking props for the CoverLayout
CoverLayout.propTypes = {
  coverHeight: PropTypes.string,
  image: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default CoverLayout;
