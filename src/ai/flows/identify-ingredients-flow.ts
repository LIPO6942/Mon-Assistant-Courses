
'use server';
/**
 * @fileOverview An AI flow to identify ingredients from a photo.
 *
 * - identifyIngredientsFromImage - A function that identifies ingredients from an image data URI.
 * - IdentifyIngredientsInput - The input type for the function.
 * - IdentifyIngredientsOutput - The return type for the function.
 */

import { z } from 'zod';
import { groqChatJson, getPreferredVisionModel, type GroqMessageContentPart } from '@/ai/groq';

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
  const parsed = IdentifyIngredientsInputSchema.parse(input);

  // Groq supports OpenAI-style vision content arrays
  const systemPrompt = [
    "Tu es un assistant de vision spécialisé pour reconnaître des ingrédients sur des photos de frigo ou garde-manger.",
    'Retourne uniquement un JSON valide de la forme: { "ingredients": string[] }',
  ].join('\n');

  const userContent: GroqMessageContentPart[] = [
    { type: 'text', text: 'Analyse l’image et liste uniquement les noms des ingrédients.' },
    { type: 'image_url', image_url: { url: parsed.photoDataUri } },
  ];

  const output = await groqChatJson<IdentifyIngredientsOutput>({
    model: getPreferredVisionModel(),
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent },
    ],
    temperature: 0.2,
    max_tokens: 600,
    response_format: { type: 'json_object' },
  });

  const validated = IdentifyIngredientsOutputSchema.parse(output);
  return validated;
}
