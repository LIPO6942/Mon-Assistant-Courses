'use server';

/**
 * @fileOverview Suggests a list of ingredients based on a recipe name.
 *
 * - suggestIngredients - A function that suggests ingredients for a recipe.
 * - SuggestIngredientsInput - The input type for the suggestIngredients function.
 * - SuggestIngredientsOutput - The return type for the suggestIngredients function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestIngredientsInputSchema = z.object({
  recipeName: z.string().describe('The name of the recipe to suggest ingredients for.'),
});
export type SuggestIngredientsInput = z.infer<typeof SuggestIngredientsInputSchema>;

const SuggestIngredientsOutputSchema = z.object({
  ingredients: z
    .array(z.string())
    .describe('A list of ingredients suggested for the recipe.'),
});
export type SuggestIngredientsOutput = z.infer<typeof SuggestIngredientsOutputSchema>;

export async function suggestIngredients(input: SuggestIngredientsInput): Promise<SuggestIngredientsOutput> {
  return suggestIngredientsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestIngredientsPrompt',
  input: {schema: SuggestIngredientsInputSchema},
  output: {schema: SuggestIngredientsOutputSchema},
  prompt: `Suggest a list of ingredients for the following recipe:\n\nRecipe Name: {{{recipeName}}}\n\nIngredients:`,
});

const suggestIngredientsFlow = ai.defineFlow(
  {
    name: 'suggestIngredientsFlow',
    inputSchema: SuggestIngredientsInputSchema,
    outputSchema: SuggestIngredientsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
