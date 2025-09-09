import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Box, Typography, CircularProgress, Alert, Button } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { loadFriendRecipes } from '../utils/recipeDatabase';
import { getUserProfile, type UserProfile } from '../utils/friendsDatabase';
import { RecipeGrid } from '../components/ui/feature-section-with-grid';
import type { Recipe } from '../types/Recipe';

export const FriendRecipes: React.FC = () => {
  const { friendId } = useParams<{ friendId: string }>();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [friendProfile, setFriendProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      if (!friendId) {
        setError('Friend ID not provided');
        setLoading(false);
        return;
      }

      try {
        const [friendRecipes, profile] = await Promise.all([
          loadFriendRecipes(friendId),
          getUserProfile(friendId)
        ]);
        
        setRecipes(friendRecipes);
        setFriendProfile(profile);
      } catch (err) {
        setError('Failed to load friend\'s recipes');
        console.error('Error loading friend recipes:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [friendId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ py: 4 }}>
        <Button
          component={Link}
          to="/friends"
          startIcon={<ArrowBack />}
          sx={{ mb: 3 }}
        >
          Back to Friends
        </Button>
        <Alert severity="error" sx={{ maxWidth: 600, mx: 'auto' }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 4 }}>
      <Button
        component={Link}
        to="/friends"
        startIcon={<ArrowBack />}
        sx={{ mb: 3 }}
      >
        Back to Friends
      </Button>

      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" sx={{ mb: 2 }}>
          {friendProfile?.display_name || friendProfile?.email || 'Friend'}'s Recipe Collection
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {recipes.length} recipe{recipes.length !== 1 ? 's' : ''} shared
        </Typography>
      </Box>

      <RecipeGrid 
        recipes={recipes}
        onDeleteRecipe={() => {}} // Friends' recipes can't be deleted
        onUpdateRecipe={undefined} // Friends' recipes can't be edited
      />
    </Box>
  );
};