'use server';
/**
 * @fileOverview An AI flow to generate a shopping list from a user prompt.
 *
 * - generateShoppingList - A function that handles the shopping list generation.
 * - GenerateShoppingListInput - The input type for the generateShoppingList function.
 * - GenerateShoppingListOutput - The return type for the generateShoppingList function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const categories = [
  'Fruits et Légumes',
  'Viandes et Poissons',
  'Produits Laitiers',
  'Boulangerie',
  'Épicerie',
  'Boissons',
  'Maison',
  'Autre',
] as const;

const GenerateShoppingListInputSchema = z.object({
  prompt: z.string().describe('The user request, like "ingredients for a cake"'),
});
export type GenerateShoppingListInput = z.infer<typeof GenerateShoppingListInputSchema>;

const GenerateShoppingListOutputSchema = z.object({
    items: z.array(z.object({
        name: z.string().describe("The name of the shopping item."),
        category: z.enum(categories).describe("The category of the item.")
    })).describe("The array of generated shopping list items.")
});
export type GenerateShoppingListOutput = z.infer<typeof GenerateShoppingListOutputSchema>;

export async function generateShoppingList(input: GenerateShoppingListInput): Promise<GenerateShoppingListOutput> {
  return generateShoppingListFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateShoppingListPrompt',
  input: {schema: GenerateShoppingListInputSchema},
  output: {schema: GenerateShoppingListOutputSchema},
  prompt: `Tu es un assistant de courses intelligent. Ta tâche est de créer une liste de courses détaillée à partir de la demande de l'utilisateur.

  Pour chaque article, tu dois déterminer son nom et le classer dans l'une des catégories suivantes :
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
      throw new Error("La réponse du service IA était vide ou mal formée.");
    }

    return output;
  }
);
