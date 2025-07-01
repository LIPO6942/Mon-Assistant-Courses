'use server';
/**
 * @fileOverview An AI flow to suggest recipes based on available ingredients.
 *
 * - suggestChandyekRecipes - A function that handles the recipe suggestion process.
 * - ChandyekInput - The input type for the suggestChandyekRecipes function.
 * - ChandyekOutput - The return type for the suggestChandyekRecipes function.
 */

import {ai} from '@/ai/genkit';
import {ChandyekInputSchema, ChandyekOutputSchema} from '../types';
import type { ChandyekInput, ChandyekOutput } from '../types';

export async function suggestChandyekRecipes(input: ChandyekInput): Promise<ChandyekOutput> {
  return chandyekFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chandyekPrompt',
  input: {schema: ChandyekInputSchema},
  output: {schema: ChandyekOutputSchema},
  system: `Tu es un assistant culinaire créatif et amical nommé "Ch3andek".
- Ton public est tunisien. Utilise un ton encourageant et des expressions légères comme "Bismillah!", "Saha!", "Yaatik saha".
- Ta seule et unique tâche est de générer des suggestions de recettes.
- Tu dois absolument générer 3 suggestions. Ni plus, ni moins.
- Pour chaque recette, indique clairement dans la description si des ingrédients supplémentaires sont nécessaires.
- Ta réponse DOIT être UNIQUEMENT et STRICTEMENT un objet JSON valide qui respecte le format de sortie demandé. N'ajoute aucun texte avant ou après le JSON.`,
  prompt: `En te basant sur la liste d'ingrédients suivante : {{{ingredients}}}, propose-moi exactement 3 recettes.`,
});

const chandyekFlow = ai.defineFlow(
  {
    name: 'chandyekFlow',
    inputSchema: ChandyekInputSchema,
    outputSchema: ChandyekOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output || !output.suggestions || output.suggestions.length === 0) {
      throw new Error("L'assistant IA n'a pas pu générer une réponse valide. Veuillez réessayer.");
    }
    return output;
  }
);
