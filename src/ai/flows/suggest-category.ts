
'use server';
/**
 * @fileOverview Suggests a category for a grocery item.
 *
 * - suggestCategory - A function that suggests a category.
 * - SuggestCategoryInput - The input type.
 * - SuggestCategoryOutput - The output type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const SuggestCategoryInputSchema = z.object({
  ingredientName: z.string().describe("Le nom de l'ingrédient."),
  categories: z.array(z.string()).describe("La liste des catégories existantes."),
});
export type SuggestCategoryInput = z.infer<typeof SuggestCategoryInputSchema>;

const SuggestCategoryOutputSchema = z.object({
  categoryName: z
    .string()
    .describe(
      "La catégorie la plus pertinente pour l'ingrédient. Doit être choisie parmi les catégories existantes si l'une d'entre elles convient. Sinon, une nouvelle catégorie pertinente doit être créée."
    ),
});
export type SuggestCategoryOutput = z.infer<typeof SuggestCategoryOutputSchema>;

export async function suggestCategory(
  input: SuggestCategoryInput
): Promise<SuggestCategoryOutput> {
  return suggestCategoryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestCategoryPrompt',
  input: {schema: SuggestCategoryInputSchema},
  output: {schema: SuggestCategoryOutputSchema},
  prompt: `Tu es un assistant d'organisation expert en rangement de garde-manger.
Ta tâche est de trouver la catégorie la plus appropriée pour un ingrédient donné.

Voici l'ingrédient : {{{ingredientName}}}
Voici les catégories qui existent déjà : {{#each categories}}'{{this}}'{{#unless @last}}, {{/unless}}{{/each}}.

Règles :
1. Analyse l'ingrédient et la liste des catégories.
2. Si une des catégories existantes correspond PARFAITEMENT, retourne cette catégorie. Par exemple, pour "Pommes", "Fruits et Légumes" est parfait.
3. Si aucune catégorie existante ne convient, crée une nouvelle catégorie logique et concise. Par exemple, pour "Glace à la vanille", une bonne nouvelle catégorie serait "Surgelés". Pour "Shampoing", ce serait "Hygiène".
4. Ne retourne que le nom de la catégorie choisie ou créée.

Ingrédient : {{{ingredientName}}}`,
});

const suggestCategoryFlow = ai.defineFlow(
  {
    name: 'suggestCategoryFlow',
    inputSchema: SuggestCategoryInputSchema,
    outputSchema: SuggestCategoryOutputSchema,
  },
  async (input) => {
    if (input.ingredientName.trim().length < 3) {
        return { categoryName: '' };
    }
    try {
        const {output} = await prompt(input);
        if (!output) {
          return { categoryName: '' };
        }
        return output;
    } catch (e) {
      console.error("Error suggesting category:", e);
      // Fail silently on API errors (like 429 quota exceeded) to avoid showing the Next.js error overlay
      return { categoryName: '' };
    }
  }
);
