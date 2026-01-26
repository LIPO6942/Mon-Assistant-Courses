
'use server';
/**
 * @fileOverview An AI-powered recipe suggestion flow.
 *
 * - suggestRecipes - A function that suggests recipes based on a list of ingredients.
 */

import {
  SuggestRecipeInputSchema,
  SuggestRecipesOutputSchema,
  type SuggestRecipeInput,
  type SuggestRecipeOutput,
} from '@/ai/types';
import { groqChatJson, getPreferredTextModel } from '@/ai/groq';

export async function suggestRecipes(input: SuggestRecipeInput): Promise<SuggestRecipeOutput[]> {
  const parsedInput = SuggestRecipeInputSchema.parse(input);

  const systemPrompt = [
    'Tu es un chef cuisinier créatif et expérimenté, spécialisé dans la cuisine internationale.',
    'Rends uniquement un objet JSON valide respectant ce schéma exact:',
    '{ "recipes": [',
    '  {',
    '    "title": string,',
    '    "description": string,',
    '    "country": string,',
    '    "portions": number,',
    '    "ingredients": [ { "name": string, "quantity": number, "unit": string } ],',
    '    "preparation": string,',
    '    "calories": number,',
    '    "preparationTime": number,',
    '    "isEconomical": boolean',
    '  }',
    '] }',
  ].join('\n');

  const userPrompt = [
    'Ingrédients disponibles :',
    ...parsedInput.ingredients.map((i) => `- ${i}`),
    '',
    'CONSIGNES CRITIQUES :',
    '',
    '1. COHÉRENCE CULINAIRE ABSOLUE :',
    '   - NE JAMAIS mélanger des ingrédients incompatibles culturellement',
    '   - Exemple INTERDIT : briouat avec spaghetti, couscous avec nouilles chinoises, etc.',
    '   - Chaque recette doit être AUTHENTIQUE et RÉALISTE',
    '   - Si un ingrédient ne convient pas à une recette traditionnelle, NE PAS le forcer',
    '',
    '2. UTILISATION DES INGRÉDIENTS :',
    '   - Utilise AU MAXIMUM les ingrédients disponibles MAIS seulement si cela a du sens',
    '   - Il vaut mieux une recette cohérente avec 3 ingrédients qu\'une recette absurde avec 10',
    '   - Tu peux ajouter des ingrédients de base courants (épices, huile, sel, ail, oignon, etc.)',
    '',
    '3. DIVERSITÉ ET QUALITÉ :',
    '   - Génère 3 recettes DIFFÉRENTES de pays VARIÉS (Tunisie, Maroc, Libye, Syrie, Liban, Turquie, Arabie Saoudite, Égypte, etc.)',
    '   - AU MOINS UNE recette doit être un PLAT CONSISTANT et COMPLET (pas juste une salade ou entrée)',
    '   - Privilégie la QUALITÉ et l\'AUTHENTICITÉ sur la quantité',
    '',
    '4. INSTRUCTIONS DÉTAILLÉES :',
    '   - Écris des instructions TRÈS DÉTAILLÉES, étape par étape, comme pour un adolescent de 15 ans',
    '   - Explique chaque technique simplement',
    '   - Donne des repères visuels (couleur, texture, odeur)',
    '   - Indique les temps de cuisson précis',
    '   - Ajoute des conseils et astuces',
    '   - Sépare chaque étape par \\n',
    '',
    '5. FORMAT JSON :',
    '   - Respecte strictement le schéma JSON demandé',
    '   - Renvoie uniquement du JSON sans texte additionnel',
  ].join('\n');

  const output = await groqChatJson<{ recipes: SuggestRecipeOutput[] }>({
    model: getPreferredTextModel(),
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 3000,
    response_format: { type: 'json_object' },
  });

  const validated = SuggestRecipesOutputSchema.parse(output);
  if (!validated.recipes || validated.recipes.length === 0) {
    throw new Error("L'IA n'a pas pu générer de recettes valides. Veuillez réessayer.");
  }

  // Add images from Unsplash for each recipe
  const recipesWithImages = await Promise.all(
    validated.recipes.map(async (recipe) => {
      try {
        // Search for food images on Unsplash
        const searchQuery = encodeURIComponent(`${recipe.title} ${recipe.country} food`);
        const unsplashUrl = `https://source.unsplash.com/400x300/?${searchQuery}`;
        return { ...recipe, imageUrl: unsplashUrl };
      } catch (error) {
        console.error('Error fetching image for recipe:', recipe.title, error);
        return recipe; // Return recipe without image if fetch fails
      }
    })
  );

  return recipesWithImages;
}
