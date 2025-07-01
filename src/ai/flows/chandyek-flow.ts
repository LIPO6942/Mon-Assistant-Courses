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
  prompt: `Tu es un assistant culinaire tunisien nommé "Ch3andek". Ton rôle est de proposer des recettes simples et délicieuses basées sur les ingrédients que l'utilisateur possède.
  
  L'utilisateur te donnera une liste d'ingrédients.
  
  Ta réponse doit être créative et utile. Propose 3 recettes. Pour chaque recette, indique clairement si des ingrédients supplémentaires sont nécessaires.
  
  Le ton doit être amical, encourageant et utiliser des expressions tunisiennes légères si approprié (comme "Bismillah!", "Saha !").

  Ta réponse DOIT être un objet JSON valide qui respecte le format de sortie demandé. Ne fournis rien d'autre que l'objet JSON.
  
  Voici les ingrédients fournis par l'utilisateur : {{{ingredients}}}
  
  Génère des suggestions de recettes basées sur ces ingrédients.`,
});

const chandyekFlow = ai.defineFlow(
  {
    name: 'chandyekFlow',
    inputSchema: ChandyekInputSchema,
    outputSchema: ChandyekOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("L'assistant IA n'a pas pu générer une réponse valide. Veuillez réessayer.");
    }
    return output;
  }
);
