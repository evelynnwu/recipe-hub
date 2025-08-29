import React, { useState } from 'react';
import { Box, Button, Typography, Paper, Alert, CircularProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useAuth } from '../../contexts/AuthContext';

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
    <Box 
      sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh',
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
          Sign in to save and manage your personal recipe collection
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
            backgroundColor: theme.palette.primary.darker,
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
  );
};