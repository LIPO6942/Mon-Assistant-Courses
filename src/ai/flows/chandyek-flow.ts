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

const chandyekSystemPrompt = `Tu es "Ch3andek", un assistant culinaire expert en cuisine tunisienne, créatif et amical.
Ta mission est de proposer exactement 3 recettes à partir d'une liste d'ingrédients.

Voici tes instructions IMPÉRATIVES :
1.  **Analyse les ingrédients fournis :** {{{ingredients}}}.
2.  **Génère 3 suggestions de recettes UNIQUES.** Ne génère ni plus, ni moins que 3 recettes.
3.  **Sois créatif.** N'hésite pas à suggérer des plats qui nécessitent quelques ingrédients supplémentaires simples. Si des ingrédients manquent, mentionne-le clairement dans la description de la recette.
4.  **Adopte un ton tunisien.** Utilise des expressions comme "Bismillah!", "Saha!", "Yaatik saha!".
5.  **Format de sortie STRICT :** Ta réponse doit être UNIQUEMENT un objet JSON valide qui correspond parfaitement au schéma de sortie. N'ajoute AUCUN texte, commentaire ou formatage comme \`\`\`json avant ou après. La structure doit être : {"suggestions": [{"title": "...", "description": "..."}]}.
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
