import {z} from 'zod';

export const categories = [
  'Fruits et Légumes',
  'Viandes et Poissons',
  'Produits Laitiers & Oeufs',
  'Boulangerie & Pâtisserie',
  'Épicerie Salée',
  'Épicerie Sucrée',
  'Boissons',
  'Surgelés',
  'Maison',
  'Autre',
] as const;
export type Category = typeof categories[number];

export const GenerateShoppingListInputSchema = z.object({
  prompt: z.string().describe('The user request, like "ingredients for a cake"'),
});
export type GenerateShoppingListInput = z.infer<typeof GenerateShoppingListInputSchema>;

export const GenerateShoppingListOutputSchema = z.object({
    items: z.array(z.object({
        name: z.string().describe("The name of the shopping item."),
        category: z.enum(categories).describe("The category of the item."),
        price: z.number().describe("An estimated price for the item in the local currency."),
        unit: z.string().describe("The unit of measurement (e.g., 'kg', 'L', 'pcs').")
    })).describe("The array of generated shopping list items.")
});
export type GenerateShoppingListOutput = z.infer<typeof GenerateShoppingListOutputSchema>;


export const SuggestRecipeInputSchema = z.object({
  ingredients: z.array(z.string()).describe("The list of ingredients the user has."),
});
export type SuggestRecipeInput = z.infer<typeof SuggestRecipeInputSchema>;

export const SuggestRecipeOutputSchema = z.object({
  title: z.string().describe("The name of the recipe."),
  description: z.string().describe("A short, enticing description of the dish."),
  country: z.string().describe("The country of origin of the recipe."),
  ingredients: z.array(z.object({
    name: z.string().describe("The name of the ingredient."),
    quantity: z.number().describe("The numeric quantity of the ingredient."),
    unit: z.string().describe("The unit of measurement (e.g., 'g', 'ml', 'pcs').")
  })).describe("The array of ingredients for the recipe."),
  preparation: z.string().describe("The detailed, step-by-step preparation instructions for the recipe."),
  calories: z.number().describe("The estimated total calories for the dish."),
});
export type SuggestRecipeOutput = z.infer<typeof SuggestRecipeOutputSchema>;

export const SuggestRecipesOutputSchema = z.object({
  recipes: z.array(SuggestRecipeOutputSchema),
});
export type SuggestRecipesOutput = z.infer<typeof SuggestRecipesOutputSchema>;


// Types for Nutritional Guide
export const NutritionalGuideInputSchema = z.object({
  condition: z.string().describe('The health condition or dietary restriction selected by the user (e.g., "Cholestérol élevé", "Carence en Fer").'),
  query: z.string().describe('The user\'s question about a meal, ingredient, or type of dish (e.g., "un plat de riz", "poulet", "salade").'),
});
export type NutritionalGuideInput = z.infer<typeof NutritionalGuideInputSchema>;

export const NutritionalGuideOutputSchema = z.object({
  advice: z.string().describe("Provide detailed, personalized nutritional advice in Markdown format. The advice should be proactive and easy to understand. Structure it with headings, bold text, and lists. Include sections for 'Aliments à privilégier', 'Aliments à limiter/éviter', 'Substitutions saines', 'Associations bénéfiques', and 'Modes de cuisson' where applicable."),
});
export type NutritionalGuideOutput = z.infer<typeof NutritionalGuideOutputSchema>;
