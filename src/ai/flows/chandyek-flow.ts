
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

const chandyekSystemPrompt = `
Tu es un expert culinaire. Ta seule mission est de générer 3 suggestions de recettes à partir d'une liste d'ingrédients fournie par l'utilisateur.

## Contexte
Ingrédients disponibles : {{{ingredients}}}

## Instructions
1.  Génère **exactement 3** suggestions de recettes uniques et créatives.
2.  Pour chaque recette, écris une description courte et utile. Si des ingrédients manquent pour la recette, tu dois le mentionner clairement dans la description. Adopte un ton amical et encourageant, avec des expressions tunisiennes comme "Bismillah!" ou "Saha!".
3.  Ta réponse doit être **uniquement et exclusivement** un objet JSON valide.
4.  N'ajoute **aucun** texte, salutation, commentaire, ou formatage (comme \`\`\`json) en dehors de l'objet JSON lui-même.
5.  La structure du JSON doit suivre ce format et le tableau ne doit jamais être vide : \`{"suggestions": [{"title": "Nom de la recette", "description": "Description de la recette"}]}\`
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
    if (!output || !output.suggestions || output.suggestions.length === 0) {
      console.error('Invalid or empty output from AI:', output);
      throw new Error("L'assistant IA n'a pas pu générer une réponse valide. Veuillez réessayer.");
    }
    return output;
  }
);
