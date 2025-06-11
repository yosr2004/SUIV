import React from "react";
import {
  Box,
  Button,
  IconButton,
  useMediaQuery,
  Menu,
  MenuItem,
  Tooltip,
  Avatar,
} from "@mui/material";
import { Logout as LogoutIcon, AccountCircle } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function NavbarLogout() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate("/authentication/sign-in");
  };

  const handleProfile = () => {
    handleMenuClose();
    navigate("/my-profile");
  };

  // Si l'utilisateur n'est pas connecté, ne rien afficher
  if (!currentUser) return null;

  // Version mobile : icône avec menu dropdown
  if (isMobile) {
    return (
      <>
        <Tooltip title="Compte">
          <IconButton onClick={handleMenuOpen} color="inherit">
            {currentUser.avatar ? (
              <Avatar src={currentUser.avatar} sx={{ width: 32, height: 32 }} />
            ) : (
              <AccountCircle />
            )}
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
        >
          <MenuItem onClick={handleProfile}>Mon profil</MenuItem>
          <MenuItem onClick={handleLogout}>
            <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
            Déconnexion
          </MenuItem>
        </Menu>
      </>
    );
  }

  // Version desktop : bouton + avatar
  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      {currentUser.avatar ? (
        <Tooltip title={`${currentUser.firstName} ${currentUser.lastName}`}>
          <Avatar
            src={currentUser.avatar}
            alt={currentUser.firstName}
            sx={{ width: 32, height: 32, mr: 1, cursor: "pointer" }}
            onClick={handleProfile}
          />
        </Tooltip>
      ) : (
        <Tooltip title={`${currentUser.firstName} ${currentUser.lastName}`}>
          <IconButton onClick={handleProfile} color="inherit" sx={{ mr: 1 }}>
            <AccountCircle />
          </IconButton>
        </Tooltip>
      )}
      <Button
        variant="outlined"
        color="inherit"
        onClick={handleLogout}
        startIcon={<LogoutIcon />}
        size="small"
      >
        Déconnexion
      </Button>
    </Box>
  );
}

export default NavbarLogout;
