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
import typography from "assets/theme/base/typography";
import borders from "assets/theme/base/borders";

// Material Dashboard 2 React Helper Functions
import pxToRem from "assets/theme/functions/pxToRem";

const { fontWeightMedium, size } = typography;
const { borderRadius } = borders;

const root = {
  display: "inline-flex",
  justifyContent: "center",
  alignItems: "center",
  fontSize: size.sm,
  fontWeight: fontWeightMedium,
  borderRadius: borderRadius.md,
  padding: `${pxToRem(8)} ${pxToRem(20)}`,
  lineHeight: 1.5,
  textAlign: "center",
  textTransform: "none",
  letterSpacing: "0.02em",
  userSelect: "none",
  backgroundSize: "100% !important",
  transition: "all 200ms ease-in-out",
  boxShadow: "none",

  "&:hover": {
    transform: "translateY(-1px)",
  },

  "&:active": {
    transform: "translateY(0)",
  },

  "&:disabled": {
    pointerEvents: "none",
    opacity: 0.65,
  },

  "& .material-icons": {
    fontSize: pxToRem(16),
    marginTop: pxToRem(-1),
    marginRight: pxToRem(4),
  },
};

export default root;
