
'use server';

import { z } from 'zod';
import { groqChatJson, getPreferredVisionModel, type GroqMessageContentPart } from '@/ai/groq';
import { recipeCategories, units } from '@/lib/types';

const OcrRecipeInputSchema = z.object({
    photoDataUri: z.string(),
});

export type OcrRecipeInput = z.infer<typeof OcrRecipeInputSchema>;

const OcrRecipeOutputSchema = z.object({
    title: z.string().optional(),
    category: z.enum(recipeCategories).optional(),
    portions: z.number().optional(),
    ingredients: z.array(z.object({
        name: z.string(),
        quantity: z.number(),
        unit: z.string()
    })).optional(),
    preparation: z.string().optional(),
    preparationTime: z.number().optional(),
    tags: z.string().optional(),
});

export type OcrRecipeOutput = z.infer<typeof OcrRecipeOutputSchema>;

export async function ocrRecipeFromImage(input: OcrRecipeInput): Promise<OcrRecipeOutput> {
    const parsed = OcrRecipeInputSchema.parse(input);

    const systemPrompt = [
        "Tu es un expert en lecture de recettes (OCR). Ta mission est d'extraire les informations d'une photo de recette (livre, manuscrit, écran).",
        "Instructions :",
        "- Si la photo est floue, essaie de deviner ou laisse vide.",
        "- Convertis les quantités en nombres.",
        `- Utilise uniquement ces unités si possible : ${units.join(', ')}.`,
        `- Utilise l'une de ces catégories : ${recipeCategories.join(', ')}.`,
        "Retourne uniquement un JSON valide.",
    ].join('\n');

    const userContent: GroqMessageContentPart[] = [
        { type: 'text', text: 'Analyse cette recette et extrais les données structurées.' },
        { type: 'image_url', image_url: { url: parsed.photoDataUri } },
    ];

    const output = await groqChatJson<OcrRecipeOutput>({
        model: getPreferredVisionModel(),
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userContent },
        ],
        temperature: 0.1,
        max_tokens: 2000,
        response_format: { type: 'json_object' },
    });

    return OcrRecipeOutputSchema.parse(output);
}
