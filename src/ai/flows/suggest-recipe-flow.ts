
'use server';
/**
 * @fileOverview An AI-powered recipe suggestion flow.
 *
 * - suggestRecipes - A function that suggests recipes based on a list of ingredients.
 */

import { ai } from '@/ai/genkit';
import {
  SuggestRecipeInputSchema,
  SuggestRecipesOutputSchema,
  type SuggestRecipeInput,
  type SuggestRecipeOutput,
} from '@/ai/types';

export async function suggestRecipes(input: SuggestRecipeInput): Promise<SuggestRecipeOutput[]> {
  const result = await suggestRecipesFlow(input);
  return result.recipes;
}

const prompt = ai.definePrompt({
  name: 'suggestRecipesPrompt',
  model: 'googleai/gemini-1.5-flash',
  input: { schema: SuggestRecipeInputSchema },
  output: { schema: SuggestRecipesOutputSchema },
  prompt: `Tu es un chef cuisinier créatif et expérimenté. Ta mission est de proposer des recettes délicieuses et variées à partir d'une liste d'ingrédients fournie par l'utilisateur.

Ingrédients disponibles :
{{#each ingredients}}
- {{{this}}}
{{/each}}

Génère 3 recettes différentes en utilisant certains de ces ingrédients. N'hésite pas à inclure des ingrédients supplémentaires qui pourraient être nécessaires.

Pour chaque recette, tu dois fournir les informations suivantes de manière structurée :
1.  **title** : Un nom de recette accrocheur.
2.  **description** : Une courte phrase pour donner envie.
3.  **country** : Le pays d'origine de la recette.
4.  **ingredients** : La liste complète des ingrédients, y compris ceux que l'utilisateur n'a pas, avec leur quantité et leur unité.
5.  **preparation** : Les instructions de préparation détaillées, étape par étape.
6.  **calories** : Une estimation des calories pour le plat.

Assure-toi que la sortie est un objet JSON valide qui respecte le schéma défini.`,
});

const suggestRecipesFlow = ai.defineFlow(
  {
    name: 'suggestRecipesFlow',
    inputSchema: SuggestRecipeInputSchema,
    outputSchema: SuggestRecipesOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output || !output.recipes) {
      throw new Error("L'IA n'a pas pu générer de recettes valides. Veuillez réessayer.");
    }
    return output;
  }
);
