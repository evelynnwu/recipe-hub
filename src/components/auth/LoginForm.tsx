import React, { useState } from 'react';
import { Box, Button, Typography, Paper, Alert, CircularProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useAuth } from '../../contexts/AuthContext';
import savedRecipeDemo from '../../assets/savedRecipeDemo.png';

export const LoginForm: React.FC = () => {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const theme = useTheme();

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError('');
      await signInWithGoogle();
    } catch (err) {
      setError('Failed to sign in with Google. Please try again.');
      console.error('Sign in error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh' }}>
        {/* Login Section */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          pb: 4,
          px: 2
        }}
      >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          maxWidth: 400,
          width: '100%',
          textAlign: 'center'
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome to Recipe Hub!
        </Typography>

        <Typography variant="body1" color="text.primary" sx={{ mb: 3 }}>
          Just sign in with Google to save and manage your personal recipe collection!
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Button
          variant="contained"
          size="large"
          fullWidth
          onClick={handleGoogleSignIn}
          disabled={loading}
          sx={{
            py: 1.5,
            backgroundColor: theme.palette.primary.dark,
            '&:hover': {
              backgroundColor: theme.palette.primary.dark,
            },
            '&:disabled': {
              backgroundColor: theme.palette.action.disabledBackground,
            }
          }}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Signing in...' : 'Sign in with Google'}
        </Button>

        <Typography variant="caption" sx={{ mt: 2, display: 'block' }}>
          Your recipes will be private and only visible to you
        </Typography>
      </Paper>
      </Box>

      {/* Demo Image Section */}
      <Box sx={{ width: '100%', mb: 4, display: 'flex', justifyContent: 'center', px: 2 }}>
        <Box 
          sx={{
            maxWidth: '900px',
            width: '100%',
            backgroundColor: '#2d2d30',
            borderRadius: '12px',
            padding: '20px 20px 30px 20px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
          }}
        >
          {/* Desktop top bar */}
          <Box 
            sx={{
              display: 'flex',
              alignItems: 'center',
              mb: 2,
              gap: 1
            }}
          >
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ff5f57' }} />
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ffbd2e' }} />
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#28ca42' }} />
          </Box>
          
          {/* Screen content */}
          <Box 
            sx={{
              backgroundColor: 'white',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: 'inset 0 0 10px rgba(0,0,0,0.1)'
            }}
          >
            <img 
              src={savedRecipeDemo}
              alt="Recipe Hub Demo"
              style={{
                width: '100%',
                height: 'auto',
                display: 'block'
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* Description Banner */}
      <Box 
        sx={{
          backgroundColor: theme.palette.primary.light,
          py: 4,
          mb: 4
        }}
      >
        <Box sx={{ maxWidth: 800, mx: 'auto', px: 3, textAlign: 'center' }}>
          <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
            Your Personal Recipe Collection
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
            Recipe Hub helps you save and organize recipes from anywhere on the web. 
            Simply paste a recipe URL, and we'll automatically extract the ingredients, 
            instructions, and cooking times for you.
          </Typography>
          <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
            Build your personal collection, edit recipes to your liking, and easily 
            manage multiple recipes with our intuitive selection tools. Your recipes 
            are private and synced across all your devices.
          </Typography>
        </Box>
      </Box>


    </Box>
  );
};