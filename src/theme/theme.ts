import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  typography: {
    fontFamily: '"Inter", "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
    h1: {
      fontFamily: '"Inter", "Georgia", serif',
      fontWeight: 700,
    },
    h2: {
      fontFamily: '"Playfair Display", "Georgia", serif',
      fontWeight: 600,
    },
    h3: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 500,
    },
    h4: {
      fontFamily: '"Open Sans", sans-serif',
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
      main: '#F7F7F7', // Green for food/recipe theme
      contrastText: '#FFFFFF' ,
    },
    secondary: {
      main: '#FA6C25', // Orange accent
      contrastText: '#FFFFFF'
    },
    background: {
      default: '#FAFAFA',
      paper: '#FFFFFF',
    },
  },
  spacing: 8,
});