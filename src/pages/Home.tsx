import React, { useState } from 'react';
import { Box, TextField, Button, Alert, CircularProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import RecipeCard from '../components/RecipeCard';
import { useRecipes } from '../hooks/useRecipes';
import type { Recipe } from '../types/Recipe';
import { validateRecipe } from '../types/Recipe';
import { RecipeGrid } from '../components/ui/feature-section-with-grid';

export const Home: React.FC = () => {
  const [url, setUrl] = useState('');
  const [parsedRecipe, setParsedRecipe] = useState<Recipe | null>(null);
  const [parseLoading, setParseLoading] = useState(false);
  const [parseError, setParseError] = useState('');
  const theme = useTheme();

  const { 
    recipes: savedRecipes, 
    loading: recipesLoading, 
    error: recipesError, 
    addRecipe, 
    updateRecipe,
    deleteRecipe 
  } = useRecipes();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setParseLoading(true);
    setParseError('');
    setParsedRecipe(null);

    try {
      const response = await fetch('https://recipe-hub-8anv.onrender.com/api/parse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.trim() })
      });

      const data = await response.json();
      
      if (data.success) {
        try {
          const validatedRecipe = validateRecipe({ 
            ...data, 
            id: Date.now().toString() 
          });
          setParsedRecipe(validatedRecipe);
          setUrl('');
        } catch (validationError) {
          console.error('Recipe validation failed:', validationError);
          setParseError('Received invalid recipe data from server');
        }
      } else {
        setParseError(data.error || 'Failed to parse recipe');
      }
    } catch (err) {
      setParseError('Failed to connect to server');
    } finally {
      setParseLoading(false);
    }
  };

  const handleSaveRecipe = async () => {
    if (parsedRecipe) {
      try {
        await addRecipe(parsedRecipe);
        setParsedRecipe(null);
      } catch (error) {
        console.error('Failed to save recipe:', error);
        setParseError('Failed to save recipe to database');
      }
    }
  };

  return (
    <>
      {/* Compact Parse Form */}
      <Box component="form" onSubmit={handleSubmit} sx={{ mb: 1 }}>
        <Box sx={{ display: 'flex', gap: 2, maxWidth: 600, mx: 'auto', pt: 5}}>
          <TextField
            fullWidth
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter recipe URL here..."
            disabled={parseLoading}
            variant="outlined"
            size="small"
          />
          <Button
            type="submit"
            variant="contained"
            disabled={parseLoading || !url.trim()}
            sx={{ 
              minWidth: 120,
              backgroundColor: theme.palette.secondary.main,
              '&:hover': {
                backgroundColor: theme.palette.secondary.dark,
              }
            }}
          >
            {parseLoading ? 'Parsing...' : 'Parse'}
          </Button>
        </Box>
      </Box>

      {/* Error Display */}
      {parseError && (
        <Alert severity="error" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
          {parseError}
        </Alert>
      )}
      
      {/* Database Error Display */}
      {recipesError && (
        <Alert severity="warning" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
          {recipesError}
        </Alert>
      )}

      {/* Loading Indicator */}
      {recipesLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Parsed Recipe Preview with Save Button */}
      {parsedRecipe && (
        <Box sx={{ 
          mb: 1,
          maxWidth: { xs: '100%', sm: '50%', lg: '33.333%' },
          mx: 'auto',
          px: 2
        }}>
          <RecipeCard recipe={parsedRecipe} />
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Button
              variant="contained"
              onClick={handleSaveRecipe}
              sx={{
                backgroundColor: theme.palette.secondary.main,
                '&:hover': {
                  backgroundColor: theme.palette.secondary.dark,
                }
              }}
            >
              Save to Collection
            </Button>
          </Box>
        </Box>
      )}

      {/* Recipe Grid */}
      <RecipeGrid 
        recipes={savedRecipes} 
        onDeleteRecipe={(id) => deleteRecipe(id)}
        onUpdateRecipe={updateRecipe}
      />
    </>
  );
};