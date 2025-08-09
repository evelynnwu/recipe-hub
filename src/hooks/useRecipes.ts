import { useState, useEffect, useCallback } from 'react';
import type { Recipe } from '../types/Recipe';
import { validateRecipe } from '../types/Recipe';
import { loadRecipesFromStorage, saveRecipesToStorage } from '../utils/recipeStorage';
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

export const useRecipes = (useDatabase: boolean = true): RecipeHookReturn => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRecipes = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      let loadedRecipes: Recipe[];
      
      if (useDatabase) {
        loadedRecipes = await loadRecipesFromDatabase();
      } else {
        loadedRecipes = loadRecipesFromStorage();
      }
      
      setRecipes(loadedRecipes);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load recipes';
      setError(errorMessage);
      console.error('Error loading recipes:', err);
      
      // Fallback to localStorage if database fails
      if (useDatabase) {
        try {
          const fallbackRecipes = loadRecipesFromStorage();
          setRecipes(fallbackRecipes);
          setError(`Database unavailable, loaded ${fallbackRecipes.length} recipes from local storage`);
        } catch (fallbackErr) {
          console.error('Fallback to localStorage also failed:', fallbackErr);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [useDatabase]);

  const addRecipe = useCallback(async (recipe: Recipe) => {
    try {
      // Validate recipe with Zod
      const validatedRecipe = validateRecipe(recipe);
      
      if (useDatabase) {
        const savedRecipe = await saveRecipeToDatabase(validatedRecipe);
        setRecipes(prev => [savedRecipe, ...prev]);
      } else {
        const newRecipes = [validatedRecipe, ...recipes];
        setRecipes(newRecipes);
        saveRecipesToStorage(newRecipes);
      }
      
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add recipe';
      setError(errorMessage);
      throw err;
    }
  }, [useDatabase, recipes]);

  const updateRecipe = useCallback(async (id: string, updatedData: Partial<Recipe>) => {
    try {
      if (useDatabase) {
        const updatedRecipe = await updateRecipeInDatabase(id, updatedData);
        setRecipes(prev => prev.map(recipe => 
          recipe.id === id ? updatedRecipe : recipe
        ));
      } else {
        const updatedRecipes = recipes.map(recipe => 
          recipe.id === id ? { ...recipe, ...updatedData } : recipe
        );
        setRecipes(updatedRecipes);
        saveRecipesToStorage(updatedRecipes);
      }
      
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update recipe';
      setError(errorMessage);
      throw err;
    }
  }, [useDatabase, recipes]);

  const deleteRecipe = useCallback(async (id: string) => {
    try {
      if (useDatabase) {
        await deleteRecipeFromDatabase(id);
      }
      
      const filteredRecipes = recipes.filter(recipe => recipe.id !== id);
      setRecipes(filteredRecipes);
      
      if (!useDatabase) {
        saveRecipesToStorage(filteredRecipes);
      }
      
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete recipe';
      setError(errorMessage);
      throw err;
    }
  }, [useDatabase, recipes]);

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