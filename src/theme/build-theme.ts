/**
 * Theme factory - single source of truth for the pool-app palette.
 *
 * Brand direction for this round: deep editorial blue + creamy off-white.
 * Light mode reads like calm cream paper with deep blue ink, dark mode
 * leans into a high-end editorial feel with cream accents on navy. The
 * tokens stay centralised so the realtime, stats and predictive sections
 * resolve their accents straight from the theme.
 */

import { alpha, createTheme, type Theme } from '@mui/material/styles';
import type { ColorMode } from '../hooks/use-color-mode';

/**
 * Reusable accent tokens shared across sections.
 *
 * Exposed as a const map so charts (Recharts) and ad-hoc overlays can
 * reach for the same hues that drive the MUI palette, without having to
 * re-create a Theme instance just to read a colour.
 */
export const ACCENT_TOKENS = {
  deepBlue: '#0E2A4E',
  deepBlueDark: '#07182B',
  deepBlueSoft: '#2C5282',
  ink: '#0B1B33',
  cream: '#F4ECDF',
  creamPaper: '#FBF5E9',
  creamAccent: '#E8D5B5',
  terracotta: '#C9663C',
  forest: '#2F6F4F',
  amber: '#C97D2B',
  deepRed: '#9B2C2C',
  slateMuted: '#4B5A75',
  navyDeep: '#0A1428',
  navyPaper: '#11203A',
  blueLight: '#7AB0E0',
  blueGlow: '#B7D4EE',
  creamText: '#EDE3D2',
  slateLight: '#9AAFCB',
} as const;

const SERIF_STACK =
  '"Source Serif Pro", "Playfair Display", "Cormorant Garamond", Georgia, "Times New Roman", serif';

const SANS_STACK =
  '"Inter", "Roboto", "Helvetica Neue", system-ui, -apple-system, "Segoe UI", sans-serif';

/**
 * Build the MUI theme for the requested colour mode.
 *
 * The two modes share the same structural choices (radius, typography
 * scale, component overrides) and only diverge on palette and a couple
 * of mode-specific component touches (gradient buttons in light mode,
 * subtle blur on cards in dark mode).
 */
export const buildTheme = (mode: ColorMode): Theme => {
  const isLight = mode === 'light';

  const primaryMain = isLight ? ACCENT_TOKENS.deepBlue : ACCENT_TOKENS.blueLight;
  const primaryLight = isLight
    ? ACCENT_TOKENS.deepBlueSoft
    : ACCENT_TOKENS.blueGlow;
  const primaryDark = isLight
    ? ACCENT_TOKENS.deepBlueDark
    : ACCENT_TOKENS.deepBlueSoft;

  const secondaryMain = isLight
    ? ACCENT_TOKENS.terracotta
    : ACCENT_TOKENS.creamAccent;

  const backgroundDefault = isLight
    ? ACCENT_TOKENS.cream
    : ACCENT_TOKENS.navyDeep;
  const backgroundPaper = isLight
    ? ACCENT_TOKENS.creamPaper
    : ACCENT_TOKENS.navyPaper;

  const textPrimary = isLight ? ACCENT_TOKENS.ink : ACCENT_TOKENS.creamText;
  const textSecondary = isLight
    ? ACCENT_TOKENS.slateMuted
    : ACCENT_TOKENS.slateLight;

  const dividerColor = isLight
    ? alpha(ACCENT_TOKENS.ink, 0.08)
    : alpha(ACCENT_TOKENS.creamText, 0.1);

  return createTheme({
    palette: {
      mode,
      primary: {
        main: primaryMain,
        light: primaryLight,
        dark: primaryDark,
        contrastText: isLight ? ACCENT_TOKENS.creamPaper : ACCENT_TOKENS.ink,
      },
      secondary: {
        main: secondaryMain,
        contrastText: isLight ? '#FFFFFF' : ACCENT_TOKENS.navyDeep,
      },
      success: {
        main: ACCENT_TOKENS.forest,
        light: '#5B9E7C',
        dark: '#1F4E37',
      },
      warning: {
        main: ACCENT_TOKENS.amber,
      },
      error: {
        main: ACCENT_TOKENS.deepRed,
      },
      background: {
        default: backgroundDefault,
        paper: backgroundPaper,
      },
      text: {
        primary: textPrimary,
        secondary: textSecondary,
      },
      divider: dividerColor,
    },
    typography: {
      fontFamily: SANS_STACK,
      h1: {
        fontFamily: SERIF_STACK,
        fontWeight: 700,
        letterSpacing: '-0.02em',
      },
      h2: {
        fontFamily: SERIF_STACK,
        fontWeight: 700,
        letterSpacing: '-0.015em',
      },
      h3: {
        fontFamily: SERIF_STACK,
        fontWeight: 700,
        letterSpacing: '-0.012em',
      },
      h4: {
        fontWeight: 700,
        letterSpacing: '-0.01em',
      },
      h5: {
        fontWeight: 600,
      },
      h6: {
        fontWeight: 600,
      },
      subtitle1: {
        fontWeight: 500,
        letterSpacing: '0.02em',
      },
      button: {
        fontWeight: 600,
        letterSpacing: '0.02em',
      },
    },
    shape: {
      borderRadius: 14,
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: 'none',
            borderBottom: `1px solid ${dividerColor}`,
            backgroundImage: 'none',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            transition: 'transform 220ms ease, box-shadow 220ms ease',
            ...(isLight
              ? {}
              : {
                  backdropFilter: 'blur(6px)',
                  WebkitBackdropFilter: 'blur(6px)',
                }),
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
          },
          contained: isLight
            ? {
                backgroundImage: `linear-gradient(135deg, ${primaryMain} 0%, ${primaryDark} 100%)`,
              }
            : undefined,
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            fontWeight: 600,
            minHeight: 44,
            letterSpacing: '0.04em',
            textTransform: 'none',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 600,
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: dividerColor,
          },
        },
      },
    },
  });
};
