
'use server';
/**
 * @fileOverview Suggests a meal based on the weather.
 *
 * - suggestMealByWeather - A function that suggests a meal.
 * - SuggestMealByWeatherInput - The input type for the function.
 * - SuggestMealByWeatherOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { getWeather } from '@/ai/tools/weather';
import { z } from 'zod';

const SuggestMealByWeatherInputSchema = z.object({
  location: z.string().describe('La ville pour laquelle obtenir la suggestion de repas. Ex: Paris'),
});
export type SuggestMealByWeatherInput = z.infer<typeof SuggestMealByWeatherInputSchema>;

const SuggestMealByWeatherOutputSchema = z.object({
  mealIdea: z.string().describe('Une courte suggestion de repas, avec une boisson. Ex: "Salade César et une limonade fraîche."'),
  weather: z.object({
    temperature: z.number(),
    condition: z.string(),
    frenchCondition: z.string(),
  }),
});
export type SuggestMealByWeatherOutput = z.infer<typeof SuggestMealByWeatherOutputSchema>;

export async function suggestMealByWeather(input: SuggestMealByWeatherInput): Promise<SuggestMealByWeatherOutput> {
  return suggestMealByWeatherFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestMealByWeatherPrompt',
  model: 'googleai/gemini-1.5-flash',
  tools: [getWeather],
  prompt: `Tu es un chef cuisinier qui adore adapter ses menus à la météo.
  
  Ta tâche est de suggérer une idée de repas simple (plat + boisson) parfaitement adaptée à la météo actuelle dans la ville de l'utilisateur.
  
  Utilise l'outil 'getWeatherForLocation' pour connaître la météo pour la ville suivante: {{{location}}}.
  
  Formule ta réponse comme une notification courte et amicale.`,
  output: {
    schema: SuggestMealByWeatherOutputSchema,
  },
});


const suggestMealByWeatherFlow = ai.defineFlow(
  {
    name: 'suggestMealByWeatherFlow',
    inputSchema: SuggestMealByWeatherInputSchema,
    outputSchema: SuggestMealByWeatherOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error("Impossible de générer une suggestion de repas.");
    }
    return output;
  }
);
