'use server';
/**
 * @fileOverview Flow pour générer une liste de courses intelligente.
 *
 * - generateShoppingList - Génère une liste de courses à partir d'une description.
 * - GenerateShoppingListInput - Le type d'entrée pour la fonction.
 * - GenerateShoppingListOutput - Le type de retour pour la fonction.
 */

import { ai } from '@/ai/genkit';
import { GenerateShoppingListInputSchema, GenerateShoppingListOutputSchema, GenerateShoppingListInput, GenerateShoppingListOutput } from '@/ai/types';

export async function generateShoppingList(input: GenerateShoppingListInput): Promise<GenerateShoppingListOutput> {
  return generateShoppingListFlow(input);
}

const generateShoppingListPrompt = ai.definePrompt({
  name: 'generateShoppingListPrompt',
  input: { schema: GenerateShoppingListInputSchema },
  output: { schema: GenerateShoppingListOutputSchema },
  prompt: `Tu es un assistant de cuisine expert. Crée une liste de courses détaillée et catégorisée pour la requête suivante: "{{prompt}}".

  Pour chaque article, fournis :
  - Un nom
  - Une catégorie parmi : {{jsonSchema (array 'items') 'properties' 'category' 'enum'}}.
  - Un prix estimé en Dinar Tunisien (DT) sous forme de nombre.
  - Une unité de mesure (ex: "kg", "L", "pièce").
  
  Ne renvoie que du JSON.`,
});

const generateShoppingListFlow = ai.defineFlow(
  {
    name: 'generateShoppingListFlow',
    inputSchema: GenerateShoppingListInputSchema,
    outputSchema: GenerateShoppingListOutputSchema,
  },
  async (input) => {
    const { output } = await generateShoppingListPrompt(input);
    return output!;
  }
);