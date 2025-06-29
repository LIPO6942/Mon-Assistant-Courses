'use server';
/**
 * @fileOverview Flow pour suggérer une recette créative.
 *
 * - suggestRecipe - Suggère une recette aléatoire mais délicieuse.
 * - SuggestRecipeOutput - Le type de retour pour la fonction.
 */

import { ai } from '@/ai/genkit';
import { SuggestRecipeOutputSchema, SuggestRecipeOutput } from '@/ai/types';
import { z } from 'zod';

export async function suggestRecipe(): Promise<SuggestRecipeOutput> {
  return suggestRecipeFlow({});
}

const suggestRecipePrompt = ai.definePrompt({
  name: 'suggestRecipePrompt',
  output: { schema: SuggestRecipeOutputSchema },
  prompt: `Tu es un chef cuisinier de renommée mondiale, créatif et audacieux.
  
  Suggère une recette originale et délicieuse. Elle peut provenir de n'importe quel pays.
  Fournis un titre accrocheur, une brève description alléchante, son pays d'origine, et la liste précise des ingrédients avec quantités et unités.
  
  Assure-toi que la recette est intéressante mais réalisable pour un cuisinier amateur.
  Ne renvoie que du JSON.`,
});

const suggestRecipeFlow = ai.defineFlow(
  {
    name: 'suggestRecipeFlow',
    inputSchema: z.object({}),
    outputSchema: SuggestRecipeOutputSchema,
  },
  async () => {
    const { output } = await suggestRecipePrompt();
    return output!;
  }
);
