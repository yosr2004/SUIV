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

/**
 * The base box-shadow styles for the Material Dashboard 2 React.
 * You can add new box-shadow using this file.
 * You can customized the box-shadow for the entire Material Dashboard 2 React using thie file.
 */

// Material Dashboard 2 React Base Styles
import colors from "assets/theme/base/colors";

// Material Dashboard 2 React Helper Functions
import boxShadow from "assets/theme/functions/boxShadow";

const { black, white, tabs, coloredShadows } = colors;

const boxShadows = {
  xs: boxShadow([0, 1], [2, 0], black.main, 0.08),
  sm: boxShadow([0, 2], [4, 0], black.main, 0.05),
  md: `${boxShadow([0, 4], [6, -1], black.main, 0.04)}, ${boxShadow(
    [0, 2],
    [4, 0],
    black.main,
    0.03
  )}`,
  lg: `${boxShadow([0, 8], [10, -2], black.main, 0.04)}, ${boxShadow(
    [0, 3],
    [5, -1],
    black.main,
    0.02
  )}`,
  xl: `${boxShadow([0, 12], [15, -3], black.main, 0.05)}, ${boxShadow(
    [0, 5],
    [8, -2],
    black.main,
    0.02
  )}`,
  xxl: boxShadow([0, 16], [20, 0], black.main, 0.03),
  inset: boxShadow([0, 1], [2, 0], black.main, 0.04, "inset"),
  colored: {
    primary: `${boxShadow([0, 3], [10, 0], black.main, 0.08)}, ${boxShadow(
      [0, 4],
      [6, -2],
      coloredShadows.primary,
      0.2
    )}`,
    secondary: `${boxShadow([0, 3], [10, 0], black.main, 0.08)}, ${boxShadow(
      [0, 4],
      [6, -2],
      coloredShadows.secondary,
      0.2
    )}`,
    info: `${boxShadow([0, 3], [10, 0], black.main, 0.08)}, ${boxShadow(
      [0, 4],
      [6, -2],
      coloredShadows.info,
      0.2
    )}`,
    success: `${boxShadow([0, 3], [10, 0], black.main, 0.08)}, ${boxShadow(
      [0, 4],
      [6, -2],
      coloredShadows.success,
      0.2
    )}`,
    warning: `${boxShadow([0, 3], [10, 0], black.main, 0.08)}, ${boxShadow(
      [0, 4],
      [6, -2],
      coloredShadows.warning,
      0.2
    )}`,
    error: `${boxShadow([0, 3], [10, 0], black.main, 0.08)}, ${boxShadow(
      [0, 4],
      [6, -2],
      coloredShadows.error,
      0.2
    )}`,
    light: `${boxShadow([0, 3], [10, 0], black.main, 0.08)}, ${boxShadow(
      [0, 4],
      [6, -2],
      coloredShadows.light,
      0.2
    )}`,
    dark: `${boxShadow([0, 3], [10, 0], black.main, 0.08)}, ${boxShadow(
      [0, 4],
      [6, -2],
      coloredShadows.dark,
      0.2
    )}`,
  },

  navbarBoxShadow: `${boxShadow([0, 0], [1, 1], white.main, 0.9, "inset")}, ${boxShadow(
    [0, 10],
    [15, 0],
    black.main,
    0.03
  )}`,
  sliderBoxShadow: {
    thumb: boxShadow([0, 1], [5, 0], black.main, 0.1),
  },
  tabsBoxShadow: {
    indicator: boxShadow([0, 1], [5, 1], tabs.indicator.boxShadow, 1),
  },
};

export default boxShadows;
