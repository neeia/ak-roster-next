import { createTheme, darken, lighten } from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Theme {
    status: {
      danger: string;
    };
  }
  // allow configuration using `createTheme`
  interface ThemeOptions {
    status?: {
      danger?: string;
    };
  }
  //Typescript - allow changing breakpoints
  interface BreakpointOverrides {
    xs: true;
    sm: true;
    md: true;
    lg: true;
    xl: true;
    xxl: true; // +xxl
  }
}

const neutral = {
  50: "#F2F2F2",
  100: "#E3E3E3",
  200: "#C7C7C7",
  300: "#ADADAD",
  400: "#919191",
  500: "#707070",
  600: "#505050",
  700: "#303030",
  800: "#212121",
  900: "#121212",
  950: "#0D0D0D",
};
const neutral_light = {
  950: "#F2F2F2",
  900: "#E3E3E3",
  800: "#C7C7C7",
  700: "#ADADAD",
  600: "#919191",
  500: "#707070",
  400: "#505050",
  300: "#303030",
  200: "#212121",
  100: "#121212",
  50: "#0D0D0D",
};
export const DISCORD_BLURPLE = "#5865F2";
export const REDDIT_ORANGERED = "#FF4500";
export const YOUTUBE_RED = "#FF0000";
export const TWITCH_PURPLE = "#9146FF";
export const GITHUB_LIGHT = "#FAFBFC";
export const GITHUB_DARK = "#24292E";
export const KOFI_BLUE = "#29ABE0";

export const brand: Record<string, string> = {
  DEFAULT: "#FFD440",
  "/data": "#FFD440",
  "/network": "#FF8FD1",
  "/tools": "#E399FF",
  "/community": "#949DF9",
  // "0": "#FF6E40",
};

const appTheme = (brandColor: string, light = false) => {
  const _neutral = light ? neutral_light : neutral;

  return createTheme({
    breakpoints: {
      values: {
        xs: 0,
        sm: 640,
        md: 900,
        lg: 1200,
        xl: 1536, 
        xxl: 2560,
      },
    },
    palette: {
      mode: "dark",
      primary: {
        main: brandColor,
      },
      secondary: {
        main: _neutral[700],
      },
      text: {
        primary: _neutral[50],
        secondary: _neutral[200],
      },
      background: {
        default: _neutral[800],
        paper: _neutral[900],
        light: _neutral[700],
      },
      grey: _neutral,
    },
    components: {
      MuiAlert: {
        defaultProps: {
          variant: "outlined",
        },
      },
      MuiButtonBase: {
        styleOverrides: {
          root: {
            fontFamily: `"Lato", sans-serif`,
            "&.Mui-disabled": {
              color: "inherit",
              opacity: "0.38",
            },
            "&:not(._):not(._):not(.MuiButton-outlined)": {
              border: "none",
              margin: 0,
              "&.Mui-selected:not(.no-underline)": {
                borderBottomStyle: "solid",
                borderBottomWidth: "0.25rem",
                borderBottomColor: brandColor,
                backgroundColor: `${brandColor}28`,
                color: brandColor,
              },
            },
          },
        },
      },
      MuiButton: {
        defaultProps: {
          variant: "neutral",
        },
        styleOverrides: {
          root: {
            textTransform: "none",
            minWidth: 0,
          },
        },
        variants: [
          {
            props: { variant: "neutral" },
            style: {
              color: _neutral[50],
              backgroundColor: _neutral[700],
              "&:hover": {
                background: lighten(_neutral[700], 0.1),
              },
              transition: "background-color 0.1s",
            },
          },
        ],
      },
      MuiDialog: {
        defaultProps: {
          scroll: "body",
          PaperProps: {
            elevation: 1,
            sx: {
              width: "100%",
              marginX: 0,
            },
          },
        },
      },
      MuiDialogTitle: {
        defaultProps: {
          variant: "h2",
        },
        styleOverrides: {
          root: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: 32,
            gap: 16,
          },
        },
      },
      MuiDialogContent: {
        styleOverrides: {
          root: {
            padding: 16,
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            paddingRight: "32px",
            paddingLeft: "16px",
          },
        },
      },
      MuiToggleButtonGroup: {
        defaultProps: {
          color: "primary",
        },
      },
      MuiToggleButton: {
        styleOverrides: {
          root: {
            padding: 8,
            color: _neutral[50],
            backgroundColor: _neutral[700],
            "&:hover": {
              background: lighten(_neutral[700], 0.1),
            },
            transition: "background-color 0.1s",
            "&:not(._):not(._):not(._)": {
              border: "none",
              margin: 0,
            },
          },
        },
      },
      MuiLink: {
        defaultProps: {
          color: "inherit",
          underline: "hover",
          fontFamily: `"Lato", sans-serif`,
        },
        styleOverrides: {
          root: {
            "&[aria-disabled='true']": {
              color: _neutral[300],
              opacity: 0.8,
              pointerEvents: "none",
            },
          },
        },
      },
      MuiPaper: {
        defaultProps: {
          elevation: 0,
        },
      },
    },
    typography: {
      allVariants: {
        fontFamily: `"Lato", sans-serif`,
      },
      caption: {
        margin: 0,
        fontWeight: 400,
        fontSize: "0.875rem",
        lineHeight: 1.66,
      },
      caption2: {
        margin: 0,
        fontWeight: 400,
        fontSize: "0.675rem",
        lineHeight: 1.66,
      },
      caption3: {
        margin: 0,
        fontWeight: 400,
        fontSize: "0.6rem",
      },
      h1: {
        fontSize: "4rem",
      },
      h2: {
        fontSize: "2rem",
        fontWeight: "normal",
      },
      h3: {
        fontSize: "1rem",
        lineHeight: 1,
        fontWeight: "normal",
        color: _neutral[200],
        marginLeft: "8px",
      },
      h4: {
        fontSize: "0.875rem",
        lineHeight: 1,
        fontWeight: "normal",
        color: _neutral[200],
        marginLeft: "8px",
      },
      h6: {
        fontWeight: "normal",
        fontSize: "0.875rem",
      },
    },
  });
};

export default appTheme;

declare module "@mui/material/styles" {
  interface TypeBackground {
    light: string;
  }

  interface TypographyVariants {
    caption2: React.CSSProperties;
    caption3: React.CSSProperties;
  }

  // allow configuration using `createTheme`
  interface TypographyVariantsOptions {
    caption2?: React.CSSProperties;
    caption3?: React.CSSProperties;
  }
}

declare module "@mui/material/Button" {
  interface ButtonPropsVariantOverrides {
    neutral: true;
  }
}

// Update the Typography's variant prop options
declare module "@mui/material/Typography" {
  interface TypographyPropsVariantOverrides {
    caption2: true;
    caption3: true;
  }
}

export const interactive = {
  transition: "filter 0.1s, background-color 0.1s",
  ":hover": { filter: "brightness(110%)" },
};

export const focused = {
  boxShadow: "inset 0px 0px 0px 2px white",
};

export const skillBackground = {
  backgroundImage: "url(/img/rank/bg.png)",
  backgroundSize: "contain",
  backgroundRepeat: "no-repeat",
};
