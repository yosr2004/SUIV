/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

// Material Dashboard 2 React Base Styles
import colors from "assets/theme/base/colors";
import borders from "assets/theme/base/borders";
import boxShadows from "assets/theme/base/boxShadows";

// Material Dashboard 2 React Helper Function
import rgba from "assets/theme/functions/rgba";

const { black, white, grey } = colors;
const { borderWidth, borderRadius } = borders;
const { sm } = boxShadows;

const card = {
  styleOverrides: {
    root: {
      display: "flex",
      flexDirection: "column",
      position: "relative",
      minWidth: 0,
      wordWrap: "break-word",
      backgroundColor: white.main,
      backgroundClip: "border-box",
      border: `${borderWidth[0]} solid ${rgba(grey[200], 0.8)}`,
      borderRadius: borderRadius.lg,
      boxShadow: sm,
      overflow: "hidden",
      transition: "box-shadow 0.2s ease-in-out, transform 0.2s ease-in-out",
      
      "&:hover": {
        boxShadow: boxShadows.md,
        transform: "translateY(-2px)",
      },
    },
  },
};

export default card;
