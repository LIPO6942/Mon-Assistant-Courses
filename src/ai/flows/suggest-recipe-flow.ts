
'use server';
/**
 * @fileOverview An AI-powered recipe suggestion flow.
 *
 * - suggestRecipes - A function that suggests recipes based on a list of ingredients.
 */

import {
  SuggestRecipeInputSchema,
  SuggestRecipesOutputSchema,
  type SuggestRecipeInput,
  type SuggestRecipeOutput,
} from '@/ai/types';
import { groqChatJson, getPreferredTextModel } from '@/ai/groq';

export async function suggestRecipes(input: SuggestRecipeInput): Promise<SuggestRecipeOutput[]> {
  const parsedInput = SuggestRecipeInputSchema.parse(input);

  const systemPrompt = [
    'Tu es un chef cuisinier créatif et expérimenté, spécialisé dans la cuisine internationale.',
    'Rends uniquement un objet JSON valide respectant ce schéma exact:',
    '{ "recipes": [',
    '  {',
    '    "title": string,',
    '    "description": string,',
    '    "country": string,',
    '    "portions": number,',
    '    "ingredients": [ { "name": string, "quantity": number, "unit": string } ],',
    '    "preparation": string,',
    '    "calories": number,',
    '    "preparationTime": number,',
    '    "isEconomical": boolean',
    '  }',
    '] }',
  ].join('\n');

  const userPrompt = [
    'Ingrédients disponibles :',
    ...parsedInput.ingredients.map((i) => `- ${i}`),
    '',
    'CONSIGNES IMPORTANTES :',
    '1. Génère 3 recettes différentes et VARIÉES provenant de pays différents (Tunisie, Maroc, Libye, Syrie, Liban, Turquie, Arabie Saoudite, Égypte, Jordanie, Palestine, Irak, etc.)',
    '2. AU MOINS UNE recette doit être un PLAT CONSISTANT et COMPLET (pas juste une salade ou une entrée)',
    '3. Utilise AU MAXIMUM les ingrédients disponibles dans la liste ci-dessus',
    '4. Tu peux ajouter quelques ingrédients de base courants si nécessaire (épices, huile, sel, etc.)',
    '5. Pour le champ "preparation", écris des instructions TRÈS DÉTAILLÉES, étape par étape, comme si tu expliquais à un adolescent de 15 ans :',
    '   - Explique chaque technique de cuisine simplement',
    '   - Donne des repères visuels (couleur, texture, odeur)',
    '   - Indique les temps de cuisson précis',
    '   - Ajoute des conseils et astuces pour réussir',
    '   - Sépare chaque étape par \\n pour la lisibilité',
    '6. Respecte strictement le schéma JSON demandé et renvoie uniquement du JSON sans texte additionnel.',
  ].join('\n');

  const output = await groqChatJson<{ recipes: SuggestRecipeOutput[] }>({
    model: getPreferredTextModel(),
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 3000,
    response_format: { type: 'json_object' },
  });

  const validated = SuggestRecipesOutputSchema.parse(output);
  if (!validated.recipes || validated.recipes.length === 0) {
    throw new Error("L'IA n'a pas pu générer de recettes valides. Veuillez réessayer.");
  }
  return validated.recipes;
}
