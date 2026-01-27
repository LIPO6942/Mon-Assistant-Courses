
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
    'Tu es un chef professionnel et concepteur de recettes, spécialisé dans la création de plats cohérents, réalistes et équilibrés, à partir d’une liste d’ingrédients imposée.',
    '',
    '🎯 OBJECTIF',
    'Créer des recettes complètes, claires et fiables, en utilisant en priorité les ingrédients fournis par l’application, sans jamais les forcer, et en respectant strictement la logique culinaire.',
    '',
    '⚖️ RÈGLE FONDAMENTALE – PRIORITÉ SANS FORÇAGE',
    'Utiliser le maximum d’ingrédients compatibles entre eux.',
    'NE JAMAIS utiliser un ingrédient si :',
    '- il est culturellement ou techniquement incohérent avec la recette',
    '- il dégrade l’équilibre des saveurs',
    '- il impose une association absurde ou artificielle (ex. produits lactés fermentés avec des pâtes sèches, épices sucrées dans un plat salé classique, etc.)',
    '',
    'Il est obligatoire d’exclure tout ingrédient non pertinent. Un ingrédient exclu n’est ni mentionné, ni justifié.',
    'La cohérence prime toujours sur l’exhaustivité.',
    '',
    '🚫 INTERDICTION EXPLICITE',
    '- Ne jamais construire une recette uniquement pour “caser” un ingrédient.',
    '- Ne jamais créer de plats hybrides incohérents.',
    '- Ne jamais proposer d’associations non reconnues en cuisine réelle.',
    '',
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
    '    "isEconomical": boolean,',
    '    "isMainDish": boolean',
    '  }',
    '] }',
  ].join('\n');

  const userPrompt = [
    'Ingrédients disponibles :',
    ...parsedInput.ingredients.map((i) => `- ${i}`),
    '',
    ...(parsedInput.keyIngredients && parsedInput.keyIngredients.length > 0 ? [
      'Ingrédients phares disponibles (à privilégier) :',
      ...parsedInput.keyIngredients.map((i) => `- ${i}`),
      '',
    ] : []),
    'CONSIGNES DE QUALITÉ :',
    '- Langage professionnel, clair et précis.',
    '- Étapes numérotées et chronologiques.',
    '- Quantités exactes.',
    '- Temps et températures systématiques.',
    '- Méthodes de cuisson réalistes.',
    '- Aucun ingrédient listé non utilisé.',
    '- Aucun ingrédient utilisé non listé (sauf sel, poivre, eau).',
    '',
    'STRUCTURE OBLIGATOIRE DE CHAQUE RECETTE :',
    '1. Titre : Court, précis, appétissant.',
    '2. Informations clés : Temps de préparation, cuisson, total, difficulté, portions.',
    '3. Ingrédients : Quantités précises, état de préparation.',
    '4. Préparations préalables : Marinade, mise en place, préchauffage.',
    '5. Étapes de préparation : Action claire, technique précise, durée, température, indice visuel ou sensoriel.',
    '6. Cuisson : Méthode adaptée, paramètres exacts, critères de réussite.',
    '',
    'DIVERSITÉ :',
    '- Génère exactement 3 recettes de pays variés.',
    '- Marque "isMainDish": true pour la première recette (la plus consistante).',
  ].join('\n');

  const output = await groqChatJson<{ recipes: SuggestRecipeOutput[] }>({
    model: getPreferredTextModel(),
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 4500,
    response_format: { type: 'json_object' },
  });

  const validated = SuggestRecipesOutputSchema.parse(output);
  if (!validated.recipes || validated.recipes.length === 0) {
    throw new Error("L'IA n'a pas pu générer de recettes valides. Veuillez réessayer.");
  }

  // Generate images using Pollinations.ai ONLY for the FIRST recipe
  const recipesWithImages = validated.recipes.map((recipe, index) => {
    // Only generate image for the first recipe
    if (index === 0) {
      const imagePrompt = `professional food photography of ${recipe.title}, ${recipe.country} style, high quality, appetizing, detailed`;
      const encodedPrompt = encodeURIComponent(imagePrompt);
      const seed = Math.floor(Math.random() * 1000);
      const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=800&height=600&nologo=true&seed=${seed}`;

      return { ...recipe, imageUrl };
    }

    return { ...recipe, imageUrl: undefined };
  });

  return recipesWithImages;
}

