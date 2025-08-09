import type { Recipe } from '../types/Recipe';
import { isValidRecipe } from '../types/Recipe';

const STORAGE_KEY = 'recipe-hub-saved-recipes';

export const loadRecipesFromStorage = (): Recipe[] => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      console.warn('localStorage is not available');
      return [];
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    console.log('Raw localStorage data:', stored);
    
    if (!stored) {
      console.log('No data found in localStorage');
      return [];
    }

    const parsed = JSON.parse(stored);
    console.log('Parsed localStorage data:', parsed);
    
    if (!Array.isArray(parsed)) {
      console.warn('Invalid data format in localStorage');
      return [];
    }

    const filtered = parsed.filter(isValidRecipe);
    console.log('Filtered valid recipes:', filtered);
    return filtered;
  } catch (error) {
    console.error('Error loading recipes from localStorage:', error);
    return [];
  }
};

export const saveRecipesToStorage = (recipes: Recipe[]): void => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      console.warn('localStorage is not available');
      return;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
  } catch (error) {
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      console.error('localStorage quota exceeded. Unable to save recipes.');
    } else {
      console.error('Error saving recipes to localStorage:', error);
    }
  }
};

export const clearRecipesFromStorage = (): void => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing recipes from localStorage:', error);
  }
};