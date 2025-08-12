import { useState, useEffect, useCallback } from 'react';
import type { Recipe } from '../types/Recipe';
import { validateRecipe } from '../types/Recipe';
import { 
  loadRecipesFromDatabase, 
  saveRecipeToDatabase, 
  updateRecipeInDatabase, 
  deleteRecipeFromDatabase 
} from '../utils/recipeDatabase';

type RecipeHookReturn = {
  recipes: Recipe[];
  loading: boolean;
  error: string | null;
  addRecipe: (recipe: Recipe) => Promise<void>;
  updateRecipe: (id: string, recipe: Partial<Recipe>) => Promise<void>;
  deleteRecipe: (id: string) => Promise<void>;
  refreshRecipes: () => Promise<void>;
};

export const useRecipes = (): RecipeHookReturn => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRecipes = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const loadedRecipes = await loadRecipesFromDatabase();
      setRecipes(loadedRecipes);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load recipes';
      setError(errorMessage);
      console.error('Error loading recipes:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addRecipe = useCallback(async (recipe: Recipe) => {
    try {
      // Validate recipe with Zod
      const validatedRecipe = validateRecipe(recipe);
      const savedRecipe = await saveRecipeToDatabase(validatedRecipe);
      setRecipes(prev => [savedRecipe, ...prev]);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add recipe';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const updateRecipe = useCallback(async (id: string, updatedData: Partial<Recipe>) => {
    try {
      const updatedRecipe = await updateRecipeInDatabase(id, updatedData);
      setRecipes(prev => prev.map(recipe => 
        recipe.id === id ? updatedRecipe : recipe
      ));
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update recipe';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const deleteRecipe = useCallback(async (id: string) => {
    try {
      await deleteRecipeFromDatabase(id);
      setRecipes(prev => prev.filter(recipe => recipe.id !== id));
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete recipe';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const refreshRecipes = useCallback(async () => {
    await loadRecipes();
  }, [loadRecipes]);

  // Load recipes on mount
  useEffect(() => {
    loadRecipes();
  }, [loadRecipes]);

  return {
    recipes,
    loading,
    error,
    addRecipe,
    updateRecipe,
    deleteRecipe,
    refreshRecipes
  };
};