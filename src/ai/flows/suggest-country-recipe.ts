
'use server';
/**
 * @fileOverview Suggests a random recipe from a random country.
 *
 * - suggestCountryRecipe - A function that suggests a recipe.
 * - SuggestCountryRecipeOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestCountryRecipeOutputSchema = z.object({
  country: z.string().describe("Le pays d'origine de la recette. Ex: Italie"),
  recipeName: z.string().describe("Le nom du plat. Ex: Pizza Margherita"),
  ingredients: z.array(z.string()).describe("La liste des ingrédients nécessaires pour la recette."),
  instructions: z.array(z.string()).describe("Les étapes de préparation de la recette."),
  decorationIdea: z.string().describe("Une suggestion humoristique et thématique pour décorer la table en accord avec le plat du pays."),
});

export type SuggestCountryRecipeOutput = z.infer<typeof SuggestCountryRecipeOutputSchema>;

export async function suggestCountryRecipe(): Promise<SuggestCountryRecipeOutput> {
    return suggestCountryRecipeFlow();
}

const prompt = ai.definePrompt({
    name: 'suggestCountryRecipePrompt',
    output: { schema: SuggestCountryRecipeOutputSchema },
    prompt: `Tu es un globe-trotter culinaire et un comédien.
    
    Ta mission est de surprendre l'utilisateur avec une recette d'un pays choisi complètement au hasard.

    1.  Choisis un pays au hasard dans le monde.
    2.  Trouve une recette emblématique et accessible de ce pays.
    3.  Liste les ingrédients et les instructions claires en français.
    4.  IMPORTANT : Ajoute une touche finale en proposant une idée de décoration de table humoristique et un peu cliché, en lien avec le pays de la recette. Par exemple, pour une paella espagnole, suggérer de mettre des castagnettes à côté des assiettes et de diffuser un fond sonore de flamenco.

    Sois créatif, drôle et inspirant !`,
});

const suggestCountryRecipeFlow = ai.defineFlow(
    {
        name: 'suggestCountryRecipeFlow',
        outputSchema: SuggestCountryRecipeOutputSchema,
    },
    async () => {
        const { output } = await prompt({});
        if (!output) {
            throw new Error("Impossible de générer une suggestion de recette.");
        }
        return output;
    }
);
