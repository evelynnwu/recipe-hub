export interface Recipe {
  title: string;
  ingredients: string[];
  instructions: string;
  prep_time: number;
  cook_time?: string;
  image?: string;
  success: boolean;
  id?: string;
}