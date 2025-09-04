import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  typography: {
    fontFamily: '"Montserrat", "Inter", "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
    h1: {
      fontFamily: '"Inter", "Georgia", serif',
      fontWeight: 700,
    },
    h2: {
      fontFamily: '"Inter", "Georgia", serif',
      fontWeight: 600,
    },
    h3: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 700,
    },
    h4: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 400,
    },
    body1: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 400,
    },
    body2: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 400,
    },
    button: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 500,
      textTransform: 'none',
    },
  },
  palette: {
    primary: {
      main: '#CCD4C7', // Green for food/recipe theme
      dark: '#8fa383',
      contrastText: '#FFFFFF' ,
    },
    secondary: {
      main: '#e67740', // Orange accent
      light: '#faad87',
      contrastText: '#FFFFFF'
    },
    background: {
      default: '#FAFAFA',
      paper: '#FFFFFF',
    },
  },
  spacing: 8,
});