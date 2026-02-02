
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
    console.log("[OCR] Starting recipe analysis...");
    const parsed = OcrRecipeInputSchema.parse(input);

    const systemPrompt = [
        "Tu es un expert en lecture de recettes (OCR). Ta mission est d'extraire TOUTES les informations possibles d'une photo de recette.",
        "IMPORTANT : Retourne un objet JSON avec les champs suivants :",
        "- title (string)",
        "- category (string: Plat, Entrée, Dessert, Petit Déjeuner, Boisson, Autre)",
        "- portions (number)",
        "- ingredients (array de {name: string, quantity: number, unit: string})",
        "- preparation (string: concatène toutes les étapes)",
        "- preparationTime (number: en minutes)",
        "- tags (string: séparés par des virgules)",
        "Si une donnée est manquante, laisse le champ ou mets une valeur par défaut cohérente.",
    ].join('\n');

    const userContent: GroqMessageContentPart[] = [
        { type: 'text', text: 'Analyse cette image de recette et extrais les données en JSON.' },
        { type: 'image_url', image_url: { url: parsed.photoDataUri } },
    ];

    try {
        const output = await groqChatJson<any>({
            model: getPreferredVisionModel(),
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userContent },
            ],
            temperature: 0.1,
            max_tokens: 2000,
            response_format: { type: 'json_object' },
        });

        console.log("[OCR] raw output received");

        // Soft validation to avoid crash on minor type mismatches
        const refined: OcrRecipeOutput = {
            title: typeof output.title === 'string' ? output.title : undefined,
            category: recipeCategories.includes(output.category) ? output.category : 'Autre',
            portions: Number(output.portions) || 2,
            ingredients: Array.isArray(output.ingredients) ? output.ingredients.map((ing: any) => ({
                name: String(ing.name || ''),
                quantity: Number(ing.quantity) || 1,
                unit: String(ing.unit || 'pièce')
            })) : [],
            preparation: typeof output.preparation === 'string' ? output.preparation : undefined,
            preparationTime: Number(output.preparationTime) || 30,
            tags: typeof output.tags === 'string' ? output.tags : undefined,
        };

        return refined;
    } catch (error) {
        console.error("[OCR] Critical error during Groq call:", error);
        throw error;
    }
}
