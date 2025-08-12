import { supabase } from '../lib/supabase';
import type { Recipe } from '../types/Recipe';
import {RecipeSchema, validateRecipe} from '../types/Recipe';

// Database table name
const RECIPES_TABLE = 'recipes';

// Transform recipe for database storage
const transformRecipeForDB = (recipe: Recipe) => {
  // Validate recipe before sending to database
  const validatedRecipe = validateRecipe(recipe);
  
  return {
    title: validatedRecipe.title,
    ingredients: validatedRecipe.ingredients, // Supabase handles JSON automatically
    instructions: validatedRecipe.instructions,
    prep_time: validatedRecipe.prep_time,
    cook_time: validatedRecipe.cook_time || null,
    image: validatedRecipe.image || null,
    success: validatedRecipe.success
  };
};

// Transform and validate recipe from database
const transformRecipeFromDB = (dbRecipe: any): Recipe => {
  try {
    // Log the raw data to debug validation issues
    console.log('Raw database recipe:', JSON.stringify(dbRecipe, null, 2));
    
    // Use Zod to validate and transform the data from database
    return validateRecipe({
      id: String(dbRecipe.id), // Ensure ID is always a string
      title: dbRecipe.title,
      ingredients: Array.isArray(dbRecipe.ingredients) ? dbRecipe.ingredients : [],
      instructions: dbRecipe.instructions,
      prep_time: Number(dbRecipe.prep_time), // Ensure prep_time is a number
      cook_time: dbRecipe.cook_time || undefined, // Handle null values properly
      image: dbRecipe.image || undefined, // Handle null values properly
      success: Boolean(dbRecipe.success) // Ensure success is a boolean
    });
  } catch (error) {
    console.error('Invalid recipe data from database:', error);
    console.error('Failed recipe data:', JSON.stringify(dbRecipe, null, 2));
    throw new Error('Invalid recipe data received from database');
  }
};

export const loadRecipesFromDatabase = async (): Promise<Recipe[]> => {
  try {
    const { data, error } = await supabase
      .from(RECIPES_TABLE)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading recipes from database:', error);
      throw new Error(`Database error: ${error.message}`);
    }

    if (!data) return [];

    // Validate and transform all recipes
    const validRecipes: Recipe[] = [];
    for (const dbRecipe of data) {
      try {
        validRecipes.push(transformRecipeFromDB(dbRecipe));
      } catch (error) {
        console.warn('Skipping invalid recipe:', dbRecipe.id, error);
      }
    }

    return validRecipes;
  } catch (error) {
    console.error('Error loading recipes from database:', error);
    throw error;
  }
};

export const saveRecipeToDatabase = async (recipe: Recipe): Promise<Recipe> => {
  try {
    const recipeData = transformRecipeForDB(recipe);
    
    const { data, error } = await supabase
      .from(RECIPES_TABLE)
      .insert([recipeData])
      .select()
      .single();

    if (error) {
      console.error('Error saving recipe to database:', error);
      throw new Error(`Database error: ${error.message}`);
    }

    if (!data) {
      throw new Error('No data returned from database');
    }

    return transformRecipeFromDB(data);
  } catch (error) {
    console.error('Error saving recipe to database:', error);
    throw error;
  }
};

export const updateRecipeInDatabase = async (id: string, recipe: Partial<Recipe>): Promise<Recipe> => {
  try {
    // Validate the partial recipe data
    const partialSchema = RecipeSchema.partial();
    const validatedPartial = partialSchema.parse(recipe);
    
    const { data, error } = await supabase
      .from(RECIPES_TABLE)
      .update(validatedPartial)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating recipe in database:', error);
      throw new Error(`Database error: ${error.message}`);
    }

    if (!data) {
      throw new Error('Recipe not found');
    }

    return transformRecipeFromDB(data);
  } catch (error) {
    console.error('Error updating recipe in database:', error);
    throw error;
  }
};

export const deleteRecipeFromDatabase = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from(RECIPES_TABLE)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting recipe from database:', error);
      throw new Error(`Database error: ${error.message}`);
    }
  } catch (error) {
    console.error('Error deleting recipe from database:', error);
    throw error;
  }
};

export const getRecipeById = async (id: string): Promise<Recipe | null> => {
  try {
    const { data, error } = await supabase
      .from(RECIPES_TABLE)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Recipe not found
      }
      console.error('Error getting recipe by ID:', error);
      throw new Error(`Database error: ${error.message}`);
    }

    return data ? transformRecipeFromDB(data) : null;
  } catch (error) {
    console.error('Error getting recipe by ID:', error);
    throw error;
  }
};