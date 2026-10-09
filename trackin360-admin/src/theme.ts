import { createTheme, type PaletteMode } from '@mui/material/styles'

export const createAppTheme = (mode: PaletteMode) =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: '#1b63f2',
        light: '#5f8cff',
        dark: '#0f4ad8',
      },
      secondary: {
        main: '#14b8a6',
      },
      success: {
        main: '#1fbf75',
      },
      warning: {
        main: '#f59e0b',
      },
      error: {
        main: '#ef4444',
      },
      background: {
        default: mode === 'light' ? '#f3f6fb' : '#111827',
        paper: mode === 'light' ? '#ffffff' : '#172132',
      },
      text: {
        primary: mode === 'light' ? '#0f172a' : '#e5eefc',
        secondary: mode === 'light' ? '#475569' : '#b7c4db',
      },
    },
    shape: {
      borderRadius: 16,
    },
    typography: {
      fontFamily: 'Inter, Roboto, Arial, sans-serif',
      h3: {
        fontWeight: 700,
      },
      h4: {
        fontWeight: 700,
      },
      h5: {
        fontWeight: 700,
      },
      button: {
        textTransform: 'none',
        fontWeight: 600,
      },
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: '0 12px 30px rgba(15, 23, 42, 0.08)',
            border: '1px solid rgba(148, 163, 184, 0.14)',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: 'none',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
    },
  })
