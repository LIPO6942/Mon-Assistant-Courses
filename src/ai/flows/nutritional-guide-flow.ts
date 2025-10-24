
'use server';
/**
 * @fileOverview A personalized nutritional guide AI agent.
 *
 * - getNutritionalAdvice - A function that handles the nutritional advice process.
 */

import {
  NutritionalGuideInputSchema,
  NutritionalGuideOutputSchema,
  type NutritionalGuideInput,
  type NutritionalGuideOutput,
} from '@/ai/types';
import { groqChatText, GroqModels } from '@/ai/groq';

export async function getNutritionalAdvice(input: NutritionalGuideInput): Promise<NutritionalGuideOutput> {
  const parsedInput = NutritionalGuideInputSchema.parse(input);

  const systemPrompt = [
    "Tu es un assistant nutritionnel intelligent et bienveillant.",
    "Réponds en Markdown, clair, structuré (titres ##, listes, gras).",
  ].join('\n');

  const userPrompt = [
    `Condition de santé de l'utilisateur : ${parsedInput.condition}`,
    `Plat/Ingrédient mentionné : ${parsedInput.query}`,
    '',
    'Tâches :',
    '1. Analyse contextuelle',
    '2. Recommandations précises :',
    '   - Aliments à privilégier',
    '   - Aliments à limiter/éviter',
    '   - Substitutions saines',
    '   - Associations bénéfiques',
    '   - Modes de cuisson',
    '3. Explique brièvement le pourquoi de chaque recommandation.',
  ].join('\n');

  const advice = await groqChatText({
    model: GroqModels.Text,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.4,
    max_tokens: 1200,
  });

  const output: NutritionalGuideOutput = { advice };
  return NutritionalGuideOutputSchema.parse(output);
}
