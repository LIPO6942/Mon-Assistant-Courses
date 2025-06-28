'use server';
/**
 * @fileOverview An AI flow to suggest a world recipe.
 *
 * - suggestRecipe - A function that suggests a recipe.
 * - SuggestRecipeOutput - The return type for the suggestRecipe function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import {googleAI} from '@genkit-ai/googleai';

const SuggestRecipeOutputSchema = z.object({
  title: z.string().describe("The name of the recipe."),
  description: z.string().describe("A short, enticing description of the dish."),
  country: z.string().describe("The country of origin of the recipe."),
  ingredients: z.array(z.object({
    name: z.string().describe("The name of the ingredient."),
    quantity: z.number().describe("The numeric quantity of the ingredient."),
    unit: z.string().describe("The unit of measurement (e.g., 'g', 'ml', 'pcs').")
  })).describe("The array of ingredients for the recipe.")
});
export type SuggestRecipeOutput = z.infer<typeof SuggestRecipeOutputSchema>;

export async function suggestRecipe(): Promise<SuggestRecipeOutput> {
  return suggestRecipeFlow();
}

const prompt = ai.definePrompt({
  name: 'suggestRecipePrompt',
  model: googleAI.model('gemini-1.5-flash-latest'),
  output: {schema: SuggestRecipeOutputSchema},
  prompt: `Tu es un chef cuisinier de renommée mondiale, spécialisé dans la découverte de saveurs uniques.
  
  Ta tâche est de proposer une recette de plat principal intéressante et originale, provenant de n'importe quel pays du monde.
  
  Pour la recette, fournis les informations suivantes :
  - Le titre du plat.
  - Une courte description alléchante.
  - Le pays d'origine.
  - La liste des ingrédients nécessaires pour 2 personnes, avec le nom, la quantité (numérique) et l'unité (par ex: 'g', 'ml', 'pièces').

  Sois créatif et surprenant ! Ne propose pas de plat trop commun comme la pizza ou le burger.
  `,
});

const suggestRecipeFlow = ai.defineFlow(
  {
    name: 'suggestRecipeFlow',
    outputSchema: SuggestRecipeOutputSchema,
  },
  async () => {
    const {output} = await prompt({});
    
    if (!output) {
      console.error("Erreur : La réponse de l'IA était vide.");
      throw new Error("La réponse du service IA était vide ou mal formée. Cela peut être dû à un problème avec la clé API ou aux filtres de sécurité du contenu de l'IA.");
    }

    return output;
  }
);
