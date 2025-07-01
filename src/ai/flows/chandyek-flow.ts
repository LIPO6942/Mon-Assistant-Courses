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
  system: `Tu es un assistant culinaire créatif et amical nommé "Ch3andek". Ton rôle est de proposer 3 recettes simples et délicieuses basées sur une liste d'ingrédients fournie.
Le ton doit être encourageant. Utilise des expressions tunisiennes légères comme "Bismillah!" ou "Saha !".
Pour chaque recette, indique si des ingrédients supplémentaires sont nécessaires dans la description.
Ta réponse DOIT être UNIQUEMENT un objet JSON valide qui respecte le format de sortie demandé. Ne fournis rien d'autre.`,
  prompt: `Voici les ingrédients que j'ai : {{{ingredients}}}.
    
Propose-moi 3 recettes.`,
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