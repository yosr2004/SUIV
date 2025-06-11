import { useState, useEffect, useMemo } from "react";

// react-router components
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

// @mui material components
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Icon from "@mui/material/Icon";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";

// Material Dashboard 2 React example components
import Sidenav from "examples/Sidenav";
import Configurator from "examples/Configurator";

// Material Dashboard 2 React themes
import theme from "assets/theme";

// Material Dashboard 2 React Dark Mode themes
import themeDark from "assets/theme-dark";

// Material Dashboard 2 React routes
import routes from "routes";

// Material Dashboard 2 React contexts
import { useMaterialUIController, setMiniSidenav, setOpenConfigurator } from "context";
import { AuthProvider } from "contexts/AuthContext";
import { ChatProvider } from "contexts/ChatContext";

// Authentication components
import ProtectedRoute from "components/ProtectedRoute";
import NavbarLogout from "components/NavbarLogout";
import SignIn from "layouts/authentication/sign-in";
import SignUp from "layouts/authentication/sign-up";

// React Toastify
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Initialization
import { initializeApp } from "utils/initApp";

// Images
import brandWhite from "assets/images/custom-logos/logo-white.svg";
import brandDark from "assets/images/custom-logos/logo-white.svg";

export default function App() {
  const [controller, dispatch] = useMaterialUIController();
  const {
    miniSidenav,
    direction,
    layout,
    openConfigurator,
    sidenavColor,
    transparentSidenav,
    whiteSidenav,
    darkMode,
  } = controller;
  const [onMouseEnter, setOnMouseEnter] = useState(false);
  const { pathname } = useLocation();

  // Initialize app on first render
  useEffect(() => {
    const initResult = initializeApp();
    console.log("App initialized:", initResult);
  }, []);

  // Open sidenav when mouse enter on mini sidenav
  const handleOnMouseEnter = () => {
    if (miniSidenav && !onMouseEnter) {
      setMiniSidenav(dispatch, false);
      setOnMouseEnter(true);
    }
  };

  // Close sidenav when mouse leave mini sidenav
  const handleOnMouseLeave = () => {
    if (onMouseEnter) {
      setMiniSidenav(dispatch, true);
      setOnMouseEnter(false);
    }
  };

  // Change the openConfigurator state
  const handleConfiguratorOpen = () => setOpenConfigurator(dispatch, !openConfigurator);

  // Setting page scroll to 0 when changing the route
  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
  }, [pathname]);

  // Méthode pour générer les routes protégées et non protégées
  const getRoutes = (allRoutes) => {
    return allRoutes.map((route) => {
      if (route.collapse) {
        return getRoutes(route.collapse);
      }

      if (route.route) {
        // Routes d'authentification (non protégées)
        if (route.route.includes("/authentication/")) {
          return <Route exact path={route.route} element={route.component} key={route.key} />;
        }

        // Toutes les autres routes (protégées)
        return (
          <Route
            exact
            path={route.route}
            element={<ProtectedRoute>{route.component}</ProtectedRoute>}
            key={route.key}
          />
        );
      }

      return null;
    });
  };

  const configsButton = (
    <MDBox
      display="flex"
      justifyContent="center"
      alignItems="center"
      width="3.25rem"
      height="3.25rem"
      bgColor="white"
      shadow="sm"
      borderRadius="50%"
      position="fixed"
      right="2rem"
      bottom="2rem"
      zIndex={99}
      color="dark"
      sx={{ cursor: "pointer" }}
      onClick={handleConfiguratorOpen}
    >
      <Icon fontSize="small" color="inherit">
        settings
      </Icon>
    </MDBox>
  );

  // Composant de la barre de navigation personnalisée avec bouton de déconnexion
  const EnhancedSidenav = (props) => <Sidenav {...props} navbarLogout={<NavbarLogout />} />;

  // Enveloppez l'application avec les contextes globaux
  return (
    <AuthProvider>
      <ChatProvider>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />

        <ThemeProvider theme={darkMode ? themeDark : theme}>
          <CssBaseline />
          {layout === "dashboard" && (
            <>
              <EnhancedSidenav
                color={sidenavColor}
                brand={(transparentSidenav && !darkMode) || whiteSidenav ? brandDark : brandWhite}
                brandName="SUIV"
                routes={routes}
                onMouseEnter={handleOnMouseEnter}
                onMouseLeave={handleOnMouseLeave}
              />
              <Configurator />
              {configsButton}
            </>
          )}
          {layout === "vr" && <Configurator />}
          <Routes>
            {getRoutes(routes)}
            <Route path="/authentication/sign-in" element={<SignIn />} />
            <Route path="/authentication/sign-up" element={<SignUp />} />
            <Route path="*" element={<Navigate to="/authentication/sign-in" />} />
          </Routes>
        </ThemeProvider>
      </ChatProvider>
    </AuthProvider>
  );
}
