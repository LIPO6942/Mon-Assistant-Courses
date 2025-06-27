
'use server';
/**
 * @fileOverview Suggests an icon for a given ingredient.
 *
 * - suggestIcon - A function that suggests an icon.
 * - SuggestIconInput - The input type for the suggestIcon function.
 * - SuggestIconOutput - The return type for the suggestIcon function.
 */

// import {ai} from '@/ai/genkit';
import {z} from 'zod';

const SuggestIconInputSchema = z.object({
  ingredientName: z.string().describe('The name of the ingredient.'),
});
export type SuggestIconInput = z.infer<typeof SuggestIconInputSchema>;

const SuggestIconOutputSchema = z.object({
  iconName: z
    .string()
    .describe(
      'A valid Lucide icon name from lucide-react, in PascalCase (e.g., "Apple", "Beef", "Milk"). Return "ShoppingCart" if no specific icon is found.'
    ),
});
export type SuggestIconOutput = z.infer<typeof SuggestIconOutputSchema>;

export async function suggestIcon(
  input: SuggestIconInput
): Promise<SuggestIconOutput> {
  // return suggestIconFlow(input);
  console.warn("Genkit is disabled. Returning default icon.");
  return Promise.resolve({ iconName: 'ShoppingCart' });
}

/* GENKIT FEATURES DISABLED
const prompt = ai.definePrompt({
  name: 'suggestIconPrompt',
  input: {schema: SuggestIconInputSchema},
  output: {schema: SuggestIconOutputSchema},
  prompt: `You are an expert in UI design. Your task is to suggest a relevant icon name from the lucide-react library for a given grocery ingredient. The icon name MUST be a valid, existing icon in lucide-react, written in PascalCase. Examples: "Apple", "Beef", "Milk", "Carrot".

If you cannot find a specific and relevant icon, you MUST return "ShoppingCart". Do not invent icon names.

Ingredient: {{{ingredientName}}}`,
});

const suggestIconFlow = ai.defineFlow(
  {
    name: 'suggestIconFlow',
    inputSchema: SuggestIconInputSchema,
    outputSchema: SuggestIconOutputSchema,
  },
  async (input) => {
    try {
        const {output} = await prompt(input);
        if (!output) {
            return { iconName: 'ShoppingCart' };
        }
        return output;
    } catch (e) {
        console.error("Error suggesting icon:", e);
        // Fail silently on API errors (like 429 quota exceeded) and return the default icon.
        return { iconName: 'ShoppingCart' };
    }
  }
);
*/
