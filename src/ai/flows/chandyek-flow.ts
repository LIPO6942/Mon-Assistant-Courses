
'use server';
/**
 * @fileOverview Un assistant IA autonome pour suggérer des recettes.
 * Ce fichier contient toute la logique pour la fonctionnalité "Ch3andek?",
 * y compris la définition des données, le prompt et le flow Genkit.
 *
 * - suggestChandyekRecipes - La fonction serveur exportée à appeler depuis le client.
 * - ChandyekOutput - Le type de la réponse attendue.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

// Définition des schémas et types de données LOCALEMENT.
// Ces constantes ne sont PAS exportées pour respecter les règles de "use server".
const ChandyekInputSchema = z.object({
  ingredients: z.string().describe("Liste des ingrédients que l'utilisateur possède, séparés par des virgules."),
});

const ChandyekOutputSchema = z.object({
  suggestions: z.array(z.object({
    title: z.string().describe("Le nom de la recette suggérée."),
    description: z.string().describe("Description courte de la recette et des ingrédients importants qui pourraient manquer."),
  }))
  .min(1, "La liste de suggestions DOIT contenir au moins une recette.") // Règle stricte de validation
  .describe("Un tableau d'au moins 1 suggestion de recette."),
});

// Les types TypeScript peuvent être exportés en toute sécurité.
export type ChandyekInput = z.infer<typeof ChandyekInputSchema>;
export type ChandyekOutput = z.infer<typeof ChandyekOutputSchema>;


// Le prompt est simplifié et très directif pour éviter toute confusion de l'IA.
const chandyekSystemPrompt = `
Tu es une API de suggestion de recettes. Tu ne parles que le format JSON.
Ta mission est de générer une liste de suggestions de recettes à partir d'une liste d'ingrédients.
- Ta réponse DOIT être un objet JSON valide et rien d'autre.
- N'inclus aucun texte, commentaire ou formatage en dehors de l'objet JSON.
- L'objet JSON doit respecter le schéma de sortie fourni.
- Le tableau 'suggestions' DOIT contenir au moins 1 recette.
- Pour chaque suggestion, fournis un 'title' et une 'description'.
- Dans la 'description', mentionne brièvement les ingrédients importants qui pourraient manquer.

Voici les ingrédients fournis par l'utilisateur :
{{{ingredients}}}
`;

const prompt = ai.definePrompt({
  name: 'chandyekPrompt',
  input: {schema: ChandyekInputSchema},
  output: {schema: ChandyekOutputSchema},
  prompt: chandyekSystemPrompt,
  config: {
    temperature: 0.5,
  }
});

const chandyekFlow = ai.defineFlow(
  {
    name: 'chandyekFlow',
    inputSchema: ChandyekInputSchema,
    outputSchema: ChandyekOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    
    // La validation par le schéma de sortie de Genkit/Zod est maintenant la principale protection.
    // Si la sortie est invalide (par ex, un tableau de suggestions vide),
    // une erreur sera automatiquement levée ici et propagée au client.
    if (!output) {
      throw new Error("L'assistant IA n'a renvoyé aucune réponse. Veuillez réessayer.");
    }
    
    return output;
  }
);

/**
 * Fonction serveur principale à appeler depuis le code client.
 * Elle reçoit les ingrédients et retourne les suggestions de recettes.
 * Une erreur est levée si la réponse de l'IA est invalide ou vide.
 */
export async function suggestChandyekRecipes(input: ChandyekInput): Promise<ChandyekOutput> {
  return chandyekFlow(input);
}
