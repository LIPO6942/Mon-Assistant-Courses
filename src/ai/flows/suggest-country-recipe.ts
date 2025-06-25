'use server';
/**
 * @fileOverview Suggests a random recipe from a random country using creative axes.
 *
 * - suggestCountryRecipe - A function that suggests a recipe.
 * - SuggestCountryRecipeInput - The input type for the suggestCountryRecipe function.
 * - SuggestCountryRecipeOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestCountryRecipeInputSchema = z.object({
  continent: z.string().optional().describe("Le continent à partir duquel choisir un pays. Ex: 'Europe', 'Asie', etc."),
});
export type SuggestCountryRecipeInput = z.infer<typeof SuggestCountryRecipeInputSchema>;


const SuggestCountryRecipeOutputSchema = z.object({
  theme: z.string().describe("Le thème créatif ou l'axe de suggestion choisi. Ex: 'Par Humeur : Réconfort' ou 'Par Pays Méconnu : Arménie'."),
  country: z.string().describe("Le pays d'origine de la recette. Ex: Italie"),
  recipeName: z.string().describe("Le nom du plat. Ex: Pizza Margherita"),
  ingredients: z.array(z.string()).describe("La liste des ingrédients nécessaires pour la recette."),
  instructions: z.array(z.string()).describe("Les étapes de préparation de la recette."),
  decorationIdea: z.string().describe("Une suggestion humoristique et thématique pour décorer la table ou l'ambiance, en accord avec l'axe et le plat."),
});

export type SuggestCountryRecipeOutput = z.infer<typeof SuggestCountryRecipeOutputSchema>;

export async function suggestCountryRecipe(input: SuggestCountryRecipeInput): Promise<SuggestCountryRecipeOutput> {
    return suggestCountryRecipeFlow(input);
}

const prompt = ai.definePrompt({
    name: 'suggestCountryRecipePrompt',
    input: { schema: SuggestCountryRecipeInputSchema },
    output: { schema: SuggestCountryRecipeOutputSchema },
    prompt: `
    Tu es un guide culinaire globe-trotter, créatif et plein d'humour.
    
    Ta mission est de surprendre l'utilisateur avec une suggestion de recette originale. Pour cela, tu dois d'abord choisir AU HASARD UN SEUL des axes de suggestion créatifs suivants. Ta réponse entière doit être basée sur l'axe que tu as choisi.

    {{#if continent}}
    IMPORTANT : Tu dois impérativement choisir un pays qui se trouve sur le continent : {{continent}}. Si l'axe choisi est "Par Pays Méconnu", le pays doit être à la fois méconnu ET sur le continent spécifié.
    {{/if}}

    Voici les axes possibles :

    1.  **Par Humeur :** Propose un plat qui correspond à une humeur.
        -   Exemples : "Besoin de réconfort ?" → Curry japonais doux. "Envie d’aventure ?" → Bibimbap coréen. "Tu veux impressionner ?" → Pastilla marocaine.

    2.  **Par Pays Méconnu :** Sors des sentiers battus et choisis un pays dont la cuisine est moins connue.
        -   Exemples : Arménie (Harissa aux aubergines), Éthiopie (Injera et wat), Laos (Larb de bœuf), Islande (Plokkfiskur).

    3.  **Par Couleur Dominante :** Le plat doit avoir une couleur principale très marquée.
        -   Exemples : Rouge (Shakshuka), Vert (Soupe thaïe au lait de coco), Jaune (Dhal indien), Noir (Risotto à l’encre de seiche).

    4.  **Par Moment de la Journée Original :** Pense à des moments spécifiques.
        -   Exemples : Brunch du monde, Dîner mystique sous la lune, Repas de rue nocturne.

    5.  **Par Ingrédient Local avec une Torsion Étrangère :** Prends un ingrédient de base tunisien et cuisine-le d'une manière totalement différente.
        -   Exemples : Couscous tunisien revisité à la coréenne (avec kimchi et œuf mollet). Poivron tunisien farci façon grecque (avec feta, origan).

    6.  **Par Ambiance Sonore Associée :** Suggère une ambiance musicale ou sonore pour accompagner la préparation.
        -   Exemples : Ramen (pluie japonaise + shamisen), Tacos (ambiance de rue mexicaine), Souvlaki (mer grecque et bouzouki).

    ÉTAPES DE TA RÉPONSE :
    1.  Choisis un seul axe au hasard.
    2.  Définis le champ "theme" avec le nom de l'axe et une précision. Ex: "Par Humeur : Aventure" ou "Par Ambiance Sonore".
    3.  Construis ta suggestion (recette, pays, ingrédients, instructions) en respectant cet axe.
    4.  IMPORTANT : Ta "decorationIdea" doit être en lien direct avec l'axe choisi. Sois créatif et drôle. Pour l'ambiance sonore, l'idée de déco peut être la description de l'ambiance.

    Sois créatif, drôle et inspirant ! La réponse doit être en français.
    `,
});

const suggestCountryRecipeFlow = ai.defineFlow(
    {
        name: 'suggestCountryRecipeFlow',
        inputSchema: SuggestCountryRecipeInputSchema,
        outputSchema: SuggestCountryRecipeOutputSchema,
    },
    async (input) => {
        const { output } = await prompt(input);
        if (!output) {
            throw new Error("Impossible de générer une suggestion de recette.");
        }
        return output;
    }
);
