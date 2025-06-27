
'use server';
/**
 * @fileOverview Suggests a recipe based on a list of ingredients.
 *
 * - suggestRecipe - A function that suggests a recipe.
 * - SuggestRecipeInput - The input type for the suggestRecipe function.
 * - SuggestRecipeOutput - The return type for the suggestRecipe function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const IngredientWithPriceSchema = z.object({
  name: z.string(),
  price: z.number().nullable(),
});

const SuggestRecipeInputSchema = z.object({
  ingredients: z.array(IngredientWithPriceSchema).describe('The list of available ingredients with their prices.'),
});
export type SuggestRecipeInput = z.infer<typeof SuggestRecipeInputSchema>;

const SuggestRecipeOutputSchema = z.object({
  recipeName: z.string().describe('The name of the suggested recipe.'),
  instructions: z.array(z.string()).describe('The cooking instructions for the recipe, as a list of steps.'),
  missingIngredients: z.array(z.string()).describe('A list of common ingredients that might be needed for the recipe but are not in the provided list.'),
  usedIngredients: z.array(z.string()).describe('List of ingredients from the input that are used in this recipe.'),
  estimatedCost: z.number().describe("The estimated total cost of the recipe based on the provided ingredients' prices, in Tunisian Dinars (TND)."),
  nutritionalAnalysis: z.object({
    calories: z.string().describe('Estimated calories per serving.'),
    protein: z.string().describe('Estimated protein per serving (in grams).'),
    carbs: z.string().describe('Estimated carbohydrates per serving (in grams).'),
    fat: z.string().describe('Estimated fat per serving (in grams).'),
  }).describe('A brief nutritional analysis of the dish per serving.'),
});
export type SuggestRecipeOutput = z.infer<typeof SuggestRecipeOutputSchema>;

export async function suggestRecipe(input: SuggestRecipeInput): Promise<SuggestRecipeOutput> {
  return suggestRecipeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestRecipePrompt',
  input: {schema: SuggestRecipeInputSchema},
  output: {schema: SuggestRecipeOutputSchema},
  prompt: `You are a creative chef specializing in Tunisian cuisine. Based on the ingredients provided (with their prices in Tunisian Dinars - TND), suggest a simple and delicious recipe.

Your response must be in French.

Your tasks:
1. Suggest a recipe name and step-by-step instructions.
2. If the provided list is empty or doesn't make sense for a recipe, invent a simple one like "Omelette" or "Pâtes au beurre".
3. List a few common additional ingredients that would complement the recipe but are not on the list.
4. Identify which of the provided ingredients are used in your suggested recipe and list their exact names in the \`usedIngredients\` field.
5. Calculate the \`estimatedCost\` of the recipe by summing the prices of ONLY the ingredients listed in \`usedIngredients\`. If a price is null, treat it as 0. The cost should be a single number.
6. Provide a brief \`nutritionalAnalysis\` for the dish per serving (calories, protein, carbohydrates, fat).

Ingredients available (Name, Price in TND):
{{#if ingredients.length}}
{{#each ingredients}}
- {{this.name}}{{#if this.price}} ({{this.price}} TND){{/if}}
{{/each}}
{{else}}
None
{{/if}}
`,
});

const suggestRecipeFlow = ai.defineFlow(
  {
    name: 'suggestRecipeFlow',
    inputSchema: SuggestRecipeInputSchema,
    outputSchema: SuggestRecipeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
