
'use server';
/**
 * @fileOverview An AI flow to suggest recipes based on available ingredients.
 *
 * - suggestChandyekRecipes - A function that handles the recipe suggestion process.
 */

import {ai} from '@/ai/genkit';
import { ChandyekInputSchema, ChandyekOutputSchema, type ChandyekInput, type ChandyekOutput } from '@/ai/types';

export async function suggestChandyekRecipes(input: ChandyekInput): Promise<ChandyekOutput> {
  // Le flow va maintenant lever une erreur si la validation Zod échoue (par ex, si la liste est vide)
  // L'erreur sera attrapée par le bloc try/catch dans KitchenAssistantPage.tsx
  return chandyekFlow(input);
}

const chandyekSystemPrompt = `
Tu es un assistant de cuisine efficace.
Ta seule mission est de générer une liste de suggestions de recettes à partir d'une liste d'ingrédients.
- Ta réponse DOIT être un objet JSON valide et rien d'autre.
- N'inclus aucun texte, commentaire ou formatage en dehors de l'objet JSON.
- L'objet JSON doit respecter le schéma de sortie fourni.
- Le tableau 'suggestions' DOIT contenir au moins 1 recette.
- Pour chaque suggestion, fournis un 'title' et une 'description'.
- Dans la 'description', mentionne brièvement les ingrédients importants qui pourraient manquer.

Voici les ingrédients fournis par l'utilisateur :
{{{ingredients}}}
`;

const prompt = ai.definePrompt({
  name: 'chandyekPrompt',
  input: {schema: ChandyekInputSchema},
  output: {schema: ChandyekOutputSchema},
  prompt: chandyekSystemPrompt,
  config: {
    temperature: 0.4, 
  }
});

const chandyekFlow = ai.defineFlow(
  {
    name: 'chandyekFlow',
    inputSchema: ChandyekInputSchema,
    outputSchema: ChandyekOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    
    // La validation est maintenant gérée par le schéma de sortie de Genkit/Zod.
    // Si la sortie est invalide (par exemple, un tableau de suggestions vide),
    // une erreur sera automatiquement levée ici et propagée au client.
    if (!output) {
      // Cette erreur ne devrait se produire que si le modèle renvoie quelque chose de complètement vide ou non-JSON.
      throw new Error("L'assistant IA n'a renvoyé aucune réponse. Veuillez réessayer.");
    }
    
    return output;
  }
);
