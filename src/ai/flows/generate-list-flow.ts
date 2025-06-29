
'use server';
/**
 * @fileOverview An AI flow to generate a shopping list from a user prompt.
 *
 * - generateShoppingList - A function that handles the shopping list generation.
 */

import {ai} from '@/ai/genkit';
import { 
  categories,
  GenerateShoppingListInputSchema, 
  GenerateShoppingListOutputSchema,
  type GenerateShoppingListInput,
  type GenerateShoppingListOutput
} from '@/ai/types';

export async function generateShoppingList(input: GenerateShoppingListInput): Promise<GenerateShoppingListOutput> {
  return generateShoppingListFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateShoppingListPrompt',
  model: 'googleai/gemini-1.5-flash-latest',
  input: {schema: GenerateShoppingListInputSchema},
  output: {schema: GenerateShoppingListOutputSchema},
  prompt: `Tu es un assistant de courses intelligent. Ta tâche est de créer une liste de courses détaillée à partir de la demande de l'utilisateur.

  Pour chaque article, tu dois déterminer son nom, le classer dans l'une des catégories suivantes, et fournir une estimation de son prix en Dinar Tunisien (DT).
  ${categories.map(c => `- ${c}`).join('\n')}

  Assure-toi de ne renvoyer que les articles nécessaires pour la demande. Sois concis et précis.

  Demande de l'utilisateur : {{{prompt}}}
  `,
});

const generateShoppingListFlow = ai.defineFlow(
  {
    name: 'generateShoppingListFlow',
    inputSchema: GenerateShoppingListInputSchema,
    outputSchema: GenerateShoppingListOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    
    if (!output) {
      console.error("Erreur : La réponse de l'IA était vide.");
      throw new Error("La réponse du service IA était vide ou mal formée. Cela peut être dû à un problème avec la clé API ou aux filtres de sécurité du contenu de l'IA.");
    }

    return output;
  }
);
