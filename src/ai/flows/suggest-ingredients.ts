'use server';
/**
 * @fileOverview Suggests a recipe based on a list of ingredients.
 *
 * - suggestRecipe - A function that suggests a recipe.
 * - SuggestRecipeInput - The input type for the suggestRecipe function.
 * - SuggestRecipeOutput - The return type for the suggestRecipe function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestRecipeInputSchema = z.object({
  ingredients: z.array(z.string()).describe('The list of available ingredients.'),
});
export type SuggestRecipeInput = z.infer<typeof SuggestRecipeInputSchema>;

const SuggestRecipeOutputSchema = z.object({
  recipeName: z.string().describe('The name of the suggested recipe.'),
  instructions: z.array(z.string()).describe('The cooking instructions for the recipe, as a list of steps.'),
  missingIngredients: z.array(z.string()).describe('A list of common ingredients that might be needed for the recipe but are not in the provided list.'),
});
export type SuggestRecipeOutput = z.infer<typeof SuggestRecipeOutputSchema>;

export async function suggestRecipe(input: SuggestRecipeInput): Promise<SuggestRecipeOutput> {
  return suggestRecipeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestRecipePrompt',
  input: {schema: SuggestRecipeInputSchema},
  output: {schema: SuggestRecipeOutputSchema},
  prompt: `You are a creative chef. Based on the ingredients provided, suggest a simple and delicious recipe.

If the provided list is empty or doesn't make sense for a recipe, invent a simple one like "Omelette" or "Pasta with butter".

Also, list a few common additional ingredients that would complement the recipe but are not on the list.

Your response must be in French.

Ingredients available:
{{#if ingredients.length}}
{{#each ingredients}}
- {{{this}}}
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
