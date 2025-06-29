
import {z} from 'zod';

export const categories = [
  'Fruits et Légumes',
  'Viandes et Poissons',
  'Produits Laitiers',
  'Boulangerie',
  'Épicerie',
  'Boissons',
  'Maison',
  'Autre',
] as const;

export const GenerateShoppingListInputSchema = z.object({
  prompt: z.string().describe('The user request, like "ingredients for a cake"'),
});
export type GenerateShoppingListInput = z.infer<typeof GenerateShoppingListInputSchema>;

export const GenerateShoppingListOutputSchema = z.object({
    items: z.array(z.object({
        name: z.string().describe("The name of the shopping item."),
        category: z.enum(categories).describe("The category of the item.")
    })).describe("The array of generated shopping list items.")
});
export type GenerateShoppingListOutput = z.infer<typeof GenerateShoppingListOutputSchema>;

export const SuggestRecipeOutputSchema = z.object({
  title: z.string().describe("The name of the recipe."),
  description: z.string().describe("A short, enticing description of the dish."),
  country: z.string().describe("The country of origin of the recipe."),
  ingredients: z.array(z.object({
    name: z.string().describe("The name of the ingredient."),
    quantity: z.number().describe("The numeric quantity of the ingredient."),
    unit: z.string().describe("The unit of measurement (e.g., 'g', 'ml', 'pcs').")
  })).describe("The array of ingredients for the recipe.")
});
export type SuggestRecipeOutput = z.infer<typeof SuggestRecipeOutputSchema>;
