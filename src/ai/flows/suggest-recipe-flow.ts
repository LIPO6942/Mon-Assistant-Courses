
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

  // Generate images and search URLs sequentially or with Promise.all
  const recipesWithExtras = await Promise.all(validated.recipes.map(async (recipe: SuggestRecipeOutput, index: number) => {
    const recipeTitle = encodeURIComponent(recipe.title);
    const fullQuery = encodeURIComponent(`${recipe.title} ${recipe.country} recette`);

    // Construct Search Links
    const searchLinks = [
      { label: 'Google', url: `https://www.google.com/search?q=${fullQuery}&btnI=1` },
      { label: 'Marmiton', url: `https://www.marmiton.org/recettes/recherche.aspx?aqt=${recipeTitle}` },
      { label: 'YouTube', url: `https://www.google.com/search?q=site:youtube.com+${recipeTitle}+recette&btnI=1` },
      { label: 'TikTok', url: `https://www.google.com/search?q=site:tiktok.com+${recipeTitle}+recette&btnI=1` }
    ];

    const searchUrl = searchLinks[0].url; // Default to Google

    // Only fetch image for the first recipe
    if (index === 0) {
      let imageUrl: string | undefined = undefined;

      const unsplashKey = process.env.UNSPLASH_ACCESS_KEY;
      if (unsplashKey) {
        try {
          // Search for a relevant food image on Unsplash
          const searchImageQuery = encodeURIComponent(`${recipe.title} food ${recipe.country}`);
          const res = await fetch(`https://api.unsplash.com/search/photos?query=${searchImageQuery}&per_page=1&orientation=landscape`, {
            headers: {
              Authorization: `Client-ID ${unsplashKey}`
            }
          });
          
          if (res.ok) {
            const data = await res.json();
            if (data.results && data.results.length > 0) {
              imageUrl = data.results[0].urls.regular;
            }
          } else {
            console.error("Unsplash API error:", await res.text());
          }
        } catch (err) {
          console.error("Failed to fetch from Unsplash:", err);
        }
      }

      // If Unsplash fails or no key, we leave it undefined which will trigger the UI placeholder
      return { ...recipe, imageUrl, searchUrl, searchLinks };
    }

    return { ...recipe, imageUrl: undefined, searchUrl, searchLinks };
  }));

  return recipesWithExtras;
}
