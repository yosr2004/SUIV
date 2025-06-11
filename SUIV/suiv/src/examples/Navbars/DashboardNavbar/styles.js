function navbar(theme, ownerState) {
  const { palette, boxShadows, functions, transitions, breakpoints, borders } = theme;
  const { transparentNavbar, absolute, light, darkMode } = ownerState;

  const { dark, white, text, transparent, background } = palette;
  const { navbarBoxShadow } = boxShadows;
  const { rgba, pxToRem } = functions;
  const { borderRadius } = borders;

  return {
    boxShadow: transparentNavbar || absolute ? "none" : navbarBoxShadow,
    backdropFilter: transparentNavbar || absolute ? "none" : `saturate(150%) blur(${pxToRem(20)})`,
    backgroundColor:
      transparentNavbar || absolute
        ? `${transparent.main} !important`
        : rgba(darkMode ? background.default : white.main, 0.95),

    color: () => {
      let color;

      if (light) {
        color = white.main;
      } else if (transparentNavbar) {
        color = text.main;
      } else {
        color = dark.main;
      }

      return color;
    },
    top: absolute ? 0 : pxToRem(12),
    minHeight: pxToRem(70),
    display: "grid",
    alignItems: "center",
    borderRadius: borderRadius.lg,
    paddingTop: pxToRem(6),
    paddingBottom: pxToRem(6),
    paddingRight: absolute ? pxToRem(8) : 0,
    paddingLeft: absolute ? pxToRem(16) : 0,
    border: `1px solid ${rgba(darkMode ? text.main : dark.main, 0.05)}`,

    "& > *": {
      transition: transitions.create("all", {
        easing: transitions.easing.easeInOut,
        duration: transitions.duration.standard,
      }),
    },

    "& .MuiToolbar-root": {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",

      [breakpoints.up("sm")]: {
        minHeight: "auto",
        padding: `${pxToRem(4)} ${pxToRem(16)}`,
      },
    },
  };
}

const navbarContainer = ({ breakpoints }) => ({
  flexDirection: "column",
  alignItems: "flex-start",
  justifyContent: "space-between",
  pt: 0.5,
  pb: 0.5,

  [breakpoints.up("md")]: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: "0",
    paddingBottom: "0",
  },
});

const navbarRow = ({ breakpoints }, { isMini }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",

  [breakpoints.up("md")]: {
    justifyContent: isMini ? "space-between" : "stretch",
    width: isMini ? "100%" : "max-content",
  },

  [breakpoints.up("xl")]: {
    justifyContent: "stretch !important",
    width: "max-content !important",
  },
});

const navbarIconButton = ({ typography: { size }, breakpoints, palette, borders, transitions }) => ({
  px: 1,
  borderRadius: borders.borderRadius.md,
  transition: transitions.create(["background-color"], {
    easing: transitions.easing.easeInOut,
    duration: transitions.duration.shorter,
  }),

  "&:hover": {
    backgroundColor: palette.grey[200],
  },

  "& .material-icons, .material-icons-round": {
    fontSize: `${size.lg} !important`,
  },

  "& .MuiTypography-root": {
    display: "none",

    [breakpoints.up("sm")]: {
      display: "inline-block",
      lineHeight: 1.2,
      ml: 0.5,
    },
  },
});

const navbarMobileMenu = ({ breakpoints, palette, borders, transitions }) => ({
  display: "inline-block",
  lineHeight: 0,
  borderRadius: borders.borderRadius.md,
  transition: transitions.create(["background-color"], {
    easing: transitions.easing.easeInOut,
    duration: transitions.duration.shorter,
  }),

  "&:hover": {
    backgroundColor: palette.grey[200],
  },

  [breakpoints.up("xl")]: {
    display: "none",
  },
});

export { navbar, navbarContainer, navbarRow, navbarIconButton, navbarMobileMenu };
