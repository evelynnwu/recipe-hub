import { useState, useEffect, useCallback } from 'react';
import { loadRecipesFromStorage, saveRecipesToStorage } from '../utils/recipeStorage';
import type { Recipe } from '../types/Recipe';

export const usePersistedRecipes = () => {
  const [recipes, setRecipes] = useState<Recipe[]>(() => {
    const loaded = loadRecipesFromStorage();
    console.log('Initial load from localStorage:', loaded);
    return loaded;
  });

  console.log('Current recipes state:', recipes);

  const setValue = useCallback((value: Recipe[] | ((prevValue: Recipe[]) => Recipe[])) => {
    try {
      const valueToStore = value instanceof Function ? value(recipes) : value;
      console.log('Setting recipes:', valueToStore);
      setRecipes(valueToStore);
      saveRecipesToStorage(valueToStore);
    } catch (error) {
      console.error('Error setting recipes:', error);
    }
  }, [recipes]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'recipe-hub-saved-recipes' && e.newValue !== null) {
        try {
          const newRecipes = JSON.parse(e.newValue);
          if (Array.isArray(newRecipes)) {
            setRecipes(newRecipes);
          }
        } catch (error) {
          console.error('Error parsing storage event:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return [recipes, setValue] as const;
};