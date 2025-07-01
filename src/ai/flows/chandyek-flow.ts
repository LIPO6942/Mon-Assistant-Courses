
'use server';
/**
 * @fileOverview An AI flow to suggest recipes based on available ingredients.
 *
 * - suggestChandyekRecipes - A function that handles the recipe suggestion process.
 */

import {ai} from '@/ai/genkit';
import { ChandyekInputSchema, ChandyekOutputSchema, type ChandyekInput, type ChandyekOutput } from '@/ai/types';

export async function suggestChandyekRecipes(input: ChandyekInput): Promise<ChandyekOutput> {
  return chandyekFlow(input);
}

const chandyekSystemPrompt = `
Tu es un moteur de suggestion de recettes.
Ta mission est de générer 3 suggestions de recettes basées sur la liste d'ingrédients fournie.
Ta réponse DOIT être un objet JSON valide, et RIEN D'AUTRE.
N'inclus AUCUN texte, commentaire ou formatage en dehors de l'objet JSON.
L'objet JSON doit respecter le schéma de sortie fourni.
Le tableau 'suggestions' NE DOIT JAMAIS être vide.
Pour chaque suggestion, fournis un 'title' et une 'description'. Dans la description, mentionne les ingrédients supplémentaires nécessaires.

Ingrédients fournis par l'utilisateur : {{{ingredients}}}
`;

const prompt = ai.definePrompt({
  name: 'chandyekPrompt',
  input: {schema: ChandyekInputSchema},
  output: {schema: ChandyekOutputSchema},
  prompt: chandyekSystemPrompt,
});

const chandyekFlow = ai.defineFlow(
  {
    name: 'chandyekFlow',
    inputSchema: ChandyekInputSchema,
    outputSchema: ChandyekOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    
    // VALIDATION STRICTE : Si la sortie est invalide ou si la liste des suggestions est vide, on lève une erreur.
    if (!output || !output.suggestions || output.suggestions.length === 0) {
      console.error('Invalid or empty output from AI:', output);
      throw new Error("L'assistant IA n'a pas pu générer une réponse valide. Veuillez réessayer.");
    }
    
    return output;
  }
);
