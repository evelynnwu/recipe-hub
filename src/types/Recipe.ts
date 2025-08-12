import { z } from 'zod';

// Zod schema for Recipe validation
export const RecipeSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  ingredients: z.array(z.string().min(1, "Ingredient cannot be empty")).min(1, "At least one ingredient is required"),
  instructions: z.string().min(1, "Instructions are required"),
  prep_time: z.union([z.number(), z.string().transform(Number)]).optional(),
  cook_time: z.union([z.number(), z.string().transform(Number)]).optional(),
  image: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  success: z.boolean().default(true)
}).passthrough(); // Allow extra fields to pass through

// Infer TypeScript type from Zod schema
export type Recipe = z.infer<typeof RecipeSchema>;

// Helper functions for validation
export const validateRecipe = (data: unknown): Recipe => {
  return RecipeSchema.parse(data);
};

export const isValidRecipe = (data: unknown): data is Recipe => {
  return RecipeSchema.safeParse(data).success;
};