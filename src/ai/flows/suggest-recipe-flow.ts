
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
    'RÔLE',
    'Tu es un Chef Innovant et Aventurier culinaire.',
    '',
    '🎯 OBJECTIF',
    'Proposer 3 idées de plats captivants basées sur les ingrédients fournis.',
    '',
    '🎨 CRÉATIVITÉ & VARIÉTÉ',
    '- Explore des cuisines du monde entier (Asie, Afrique, Amérique Latine, Caraïbes, etc.).',
    '- Surprends l’utilisateur avec des associations de saveurs audacieuses.',
    '- Sur les 3 plats, au moins UN doit être "non conventionnel" ou mystérieux pour stimuler la curiosité culinaire.',
    '',
    'Rends uniquement un objet JSON valide respectant ce schéma exact:',
    '{ "recipes": [',
    '  {',
    '    "title": string,',
    '    "description": string,',
    '    "country": string,',
    '    "ingredients": [ { "name": string, "quantity": number, "unit": string } ]',
    '  }',
    '] }',
  ].join('\n');

  const userPrompt = [
    'Ingrédients disponibles :',
    ...parsedInput.ingredients.map((i: string) => `- ${i}`),
    '',
    ...(parsedInput.keyIngredients && parsedInput.keyIngredients.length > 0
      ? ['🎯 INGRÉDIENTS PHARES (À utiliser en priorité) :', ...parsedInput.keyIngredients.map((i: string) => `- ${i}`), '']
      : []),
    'CONSIGNES :',
    '- Soit EXTRÊMEMENT RAPIDE : ne génère que le titre, une description d’une ligne et la liste des ingrédients utilisés.',
    '- NE GÉNÈRE AUCUNE ÉTAPE DE PRÉPARATION.',
    '- Génère exactement 3 idées de recettes variées.',
  ].join('\n');

  const output = await groqChatJson<{ recipes: SuggestRecipeOutput[] }>({
    model: getPreferredTextModel(),
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 1000, // Very low for maximum speed
    response_format: { type: 'json_object' },
  });

  const validated = SuggestRecipesOutputSchema.parse(output);
  if (!validated.recipes || validated.recipes.length === 0) {
    throw new Error("L'IA n'a pas pu générer d'idées de recettes. Veuillez réessayer.");
  }

  // Generate images and search URLs
  const recipesWithExtras = validated.recipes.map((recipe: SuggestRecipeOutput, index: number) => {
    const recipeTitle = encodeURIComponent(recipe.title);
    const fullQuery = encodeURIComponent(`${recipe.title} ${recipe.country} recette`);

    // Construct Search Links
    const searchLinks = [
      { label: 'Google', url: `https://www.google.com/search?q=${fullQuery}&btnI=1` },
      { label: 'Marmiton', url: `https://www.marmiton.org/recettes/recherche.aspx?aqt=${recipeTitle}` },
      { label: 'Journal des Femmes', url: `https://cuisine.journaldesfemmes.fr/recherche/?f_recherche=${recipeTitle}` },
      { label: 'YouTube', url: `https://www.google.com/search?q=site:youtube.com+${recipeTitle}+recette&btnI=1` },
      { label: 'TikTok', url: `https://www.google.com/search?q=site:tiktok.com+${recipeTitle}+recette&btnI=1` }
    ];

    const searchUrl = searchLinks[0].url; // Default to Google

    // Only generate image for the first recipe
    if (index === 0) {
      const imagePrompt = `professional food photography of ${recipe.title}, ${recipe.country} style, high quality, appetizing`;
      const encodedPrompt = encodeURIComponent(imagePrompt);
      const seed = Math.floor(Math.random() * 1000);
      const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=800&height=600&nologo=true&seed=${seed}`;

      return { ...recipe, imageUrl, searchUrl, searchLinks };
    }

    return { ...recipe, imageUrl: undefined, searchUrl, searchLinks };
  });

  return recipesWithExtras;
}
