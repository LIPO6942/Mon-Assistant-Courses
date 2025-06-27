
'use server';
/**
 * @fileOverview Generates a daily food-related quiz.
 *
 * - generateFoodQuiz - A function that returns a quiz question.
 * - GenerateFoodQuizOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateFoodQuizOutputSchema = z.object({
  question: z.string().describe('La question du quiz, amusante et surprenante.'),
  options: z.array(z.string()).length(4).describe('Un tableau de 4 réponses possibles (chaînes de caractères).'),
  correctAnswerIndex: z.number().min(0).max(3).describe("L'index de la bonne réponse dans le tableau 'options' (de 0 à 3)."),
  funFact: z.string().describe("Une anecdote ou un fait amusant expliquant la bonne réponse. Doit être concis et intéressant."),
});
export type GenerateFoodQuizOutput = z.infer<typeof GenerateFoodQuizOutputSchema>;

export async function generateFoodQuiz(): Promise<GenerateFoodQuizOutput> {
  return generateFoodQuizFlow();
}

const prompt = ai.definePrompt({
  name: 'generateFoodQuizPrompt',
  output: { schema: GenerateFoodQuizOutputSchema },
  prompt: `Tu es un créateur de quiz culinaires, drôle et expert en faits insolites sur la nourriture.
Ta mission est de créer UNE seule question de quiz à choix multiples.

Règles :
1.  La question doit être surprenante, amusante ou éducative, portant sur la nourriture, les ingrédients, l'histoire culinaire ou les traditions du monde.
2.  Tu dois fournir exactement 4 options de réponse. Une seule doit être correcte.
3.  Les options incorrectes doivent être plausibles mais fausses.
4.  Tu dois fournir l'index de la bonne réponse (de 0 à 3).
5.  Tu dois inclure un "fait amusant" (funFact) qui explique pourquoi la réponse est correcte, de manière engageante et mémorable.
6.  Sois créatif et original ! Ne répète pas les mêmes questions.

Exemples de thèmes possibles : Origine surprenante d'un plat, record du monde alimentaire, ingrédient bizarre, nom scientifique d'un fruit, etc.
La réponse doit être en français.`,
});

const generateFoodQuizFlow = ai.defineFlow(
  {
    name: 'generateFoodQuizFlow',
    inputSchema: z.void(),
    outputSchema: GenerateFoodQuizOutputSchema,
  },
  async () => {
    const { output } = await prompt();
    if (!output) {
      throw new Error("Impossible de générer un quiz.");
    }
    return output;
  }
);
