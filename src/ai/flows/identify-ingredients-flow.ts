
'use server';
/**
 * @fileOverview An AI flow to identify ingredients from a photo.
 *
 * - identifyIngredientsFromImage - A function that identifies ingredients from an image data URI.
 * - IdentifyIngredientsInput - The input type for the function.
 * - IdentifyIngredientsOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const IdentifyIngredientsInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a fridge or pantry, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type IdentifyIngredientsInput = z.infer<typeof IdentifyIngredientsInputSchema>;

const IdentifyIngredientsOutputSchema = z.object({
  ingredients: z.array(z.string()).describe("An array of the names of the identified ingredients."),
});
export type IdentifyIngredientsOutput = z.infer<typeof IdentifyIngredientsOutputSchema>;

export async function identifyIngredientsFromImage(input: IdentifyIngredientsInput): Promise<IdentifyIngredientsOutput> {
  return identifyIngredientsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'identifyIngredientsPrompt',
  model: 'googleai/gemini-1.5-flash',
  input: { schema: IdentifyIngredientsInputSchema },
  output: { schema: IdentifyIngredientsOutputSchema },
  prompt: `Analyse l'image suivante d'un réfrigérateur ou d'un garde-manger. Identifie tous les ingrédients alimentaires que tu reconnais distinctement.

Liste uniquement les noms des ingrédients, sans description ni quantité. Sois concis et précis.

Photo: {{media url=photoDataUri}}`,
});

const identifyIngredientsFlow = ai.defineFlow(
  {
    name: 'identifyIngredientsFlow',
    inputSchema: IdentifyIngredientsInputSchema,
    outputSchema: IdentifyIngredientsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error("L'IA n'a pas pu identifier d'ingrédients. Assurez-vous que l'image est claire et bien éclairée.");
    }
    return output;
  }
);
