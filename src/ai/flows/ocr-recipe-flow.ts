
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
        "Tu es un expert en lecture de recettes (OCR). Ta mission est d'extraire TOUTES les informations possibles d'une photo de recette (livre, manuscrit, écran).",
        "DIRECTIVES CRITIQUES :",
        "- EXTRAIS CE QUE TU PEUX : Même si la photo ne contient que le titre ou juste quelques ingrédients, retourne ces informations. Ne renvoie pas un objet vide si au moins un champ est identifiable.",
        "- SOIS RÉSILIENT : Si une partie est illisible, ignore-la mais continue pour le reste.",
        "- FORMATAGE DES INGRÉDIENTS : Sépare bien le nom, la quantité (nombre uniquement) et l'unité.",
        `- UNITÉS : Utilise prioritairement : ${units.join(', ')}.`,
        `- CATÉGORIES : Choisis la plus proche parmi : ${recipeCategories.join(', ')}.`,
        "- PRÉPARATION : Extrais les étapes même si elles sont partielles.",
        "Retourne uniquement un JSON valide.",
    ].join('\n');

    const userContent: GroqMessageContentPart[] = [
        { type: 'text', text: 'Analyse cette image. Extrais le maximum de données de la recette, même si elle est incomplète.' },
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
