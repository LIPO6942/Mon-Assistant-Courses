'use server';
/**
 * @fileOverview A personalized nutritional guide AI agent.
 *
 * - getNutritionalAdvice - A function that handles the nutritional advice process.
 * - NutritionalGuideInput - The input type for the getNutritionalAdvice function.
 * - NutritionalGuideOutput - The return type for the getNutritionalAdvice function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const NutritionalGuideInputSchema = z.object({
  condition: z.string().describe('The health condition or dietary restriction selected by the user (e.g., "Cholestérol élevé", "Carence en Fer").'),
  query: z.string().describe('The user\'s question about a meal, ingredient, or type of dish (e.g., "un plat de riz", "poulet", "salade").'),
});
export type NutritionalGuideInput = z.infer<typeof NutritionalGuideInputSchema>;

const NutritionalGuideOutputSchema = z.object({
  advice: z.string().describe("Provide detailed, personalized nutritional advice in Markdown format. The advice should be proactive and easy to understand. Structure it with headings, bold text, and lists. Include sections for 'Aliments à privilégier', 'Aliments à limiter/éviter', 'Substitutions saines', 'Associations bénéfiques', and 'Modes de cuisson' where applicable."),
});
export type NutritionalGuideOutput = z.infer<typeof NutritionalGuideOutputSchema>;


export async function getNutritionalAdvice(input: NutritionalGuideInput): Promise<NutritionalGuideOutput> {
  return nutritionalGuideFlow(input);
}

const prompt = ai.definePrompt({
  name: 'nutritionalGuidePrompt',
  input: { schema: NutritionalGuideInputSchema },
  output: { schema: NutritionalGuideOutputSchema },
  prompt: `Tu es un assistant nutritionnel intelligent et bienveillant. Ta mission est de fournir des conseils alimentaires personnalisés basés sur la condition de santé de l'utilisateur et le plat ou l'ingrédient qu'il mentionne.

Condition de santé de l'utilisateur : {{{condition}}}
Plat/Ingrédient mentionné : {{{query}}}

Analyse la demande de l'utilisateur dans le contexte de sa condition et fournis des conseils clairs, pratiques et proactifs. Ta réponse doit être structurée en Markdown pour une lecture facile.

Voici ce que tu dois faire :
1.  **Analyse Contextuelle :** Croise la condition de santé avec le plat/ingrédient.
2.  **Recommandations Spécifiques :** Donne des conseils précis sur :
    *   **Aliments à privilégier :** Suggère des ingrédients bénéfiques.
    *   **Aliments à limiter/éviter :** Mentionne ce qu'il faut consommer avec modération.
    *   **Substitutions saines :** Propose des alternatives plus saines (ex: crème végétale au lieu de crème fraîche).
    *   **Associations bénéfiques :** Suggère des combinaisons d'aliments qui améliorent la santé (ex: fer + vitamine C).
    *   **Modes de cuisson :** Recommande des méthodes de cuisson saines (vapeur, four...).
3.  **Explication Simple :** Explique brièvement *pourquoi* une recommandation est faite.
4.  **Format :** La sortie doit être un seul bloc de texte au format Markdown. Utilise des titres (##), des listes à puces (*) et du texte en gras (**) pour une clarté maximale.
5.  **Ton :** Sois encourageant, positif et non jugeant.

Exemple : Si la condition est "Cholestérol élevé" et le plat est "un gratin", tu pourrais suggérer d'utiliser des légumes, du fromage allégé, et une source de protéines maigres, tout en expliquant pourquoi.

Génère une réponse complète et utile.`,
});

const nutritionalGuideFlow = ai.defineFlow(
  {
    name: 'nutritionalGuideFlow',
    inputSchema: NutritionalGuideInputSchema,
    outputSchema: NutritionalGuideOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);

    if (!output || !output.advice) {
        throw new Error("L'IA n'a pas pu générer de conseil valide. Veuillez réessayer.");
    }

    return output;
  }
);
