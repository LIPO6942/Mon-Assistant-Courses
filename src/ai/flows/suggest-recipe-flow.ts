
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
    'CONSIGNES CRITIQUES :',
    '',
    '1. COHÉRENCE CULINAIRE ABSOLUE :',
    '   - NE JAMAIS mélanger des ingrédients incompatibles culturellement',
    '   - Exemple INTERDIT : briouat avec spaghetti, couscous avec nouilles chinoises, etc.',
    '   - Chaque recette doit être AUTHENTIQUE et RÉALISTE',
    '   - Si un ingrédient ne convient pas à une recette traditionnelle, NE PAS le forcer',
    '',
    '2. UTILISATION DES INGRÉDIENTS :',
    '   - PRIVILÉGIE les ingrédients phares s\'ils sont disponibles',
    '   - Utilise AU MAXIMUM les ingrédients disponibles MAIS seulement si cela a du sens',
    '   - Il vaut mieux une recette cohérente avec 3 ingrédients qu\'une recette absurde avec 10',
    '   - Tu peux ajouter des ingrédients de base courants (épices, huile, sel, ail, oignon, etc.)',
    '',
    '3. DIVERSITÉ ET QUALITÉ :',
    '   - Génère 3 recettes DIFFÉRENTES de pays TRÈS VARIÉS du monde entier',
    '   - Pays suggérés : Tunisie, Maroc, Algérie, Libye, Égypte, Soudan, Syrie, Liban, Jordanie, Palestine, Irak, Arabie Saoudite, Yémen, Oman, Émirats, Qatar, Koweït, Bahreïn, Turquie, Iran, Afghanistan, Pakistan, Inde, Bangladesh, Thaïlande, Vietnam, Chine, Japon, Corée, Indonésie, Malaisie, Philippines, Éthiopie, Sénégal, Nigeria, Kenya, Brésil, Argentine, Mexique, Pérou, Colombie, Espagne, Italie, Grèce, France, Portugal, Russie, Pologne, Hongrie, etc.',
    '   - AU MOINS UNE recette doit être un PLAT CONSISTANT et COMPLET (pas juste une salade ou entrée)',
    '   - Privilégie la QUALITÉ et l\'AUTHENTICITÉ sur la quantité',
    '',
    '4. RECHERCHE MULTILINGUE ET AUTHENTICITÉ :',
    '   - Recherche des recettes AUTHENTIQUES en arabe (العربية), turc (Türkçe), persan (فارسی), ourdou (اردو), etc.',
    '   - Traduis les recettes trouvées en français avec précision',
    '   - Conserve les noms originaux des plats avec leur traduction',
    '   - Exemple : "Mansaf (المنسف) - Plat jordanien traditionnel à l\'agneau"',
    '   - Inclus les variantes régionales et noms locaux',
    '',
    '5. INSTRUCTIONS ULTRA-DÉTAILLÉES :',
    '   - Exige AU MOINS 5 ÉTAPES distinctes et numérotées par recette',
    '   - Chaque étape doit être EXTRÊMEMENT DÉTAILLÉE comme pour quelqu\'un qui n\'a jamais cuisiné',
    '   - Inclus les temps PRÉCIS, températures EXACTES, quantités MESURÉES',
    '   - Explique POURQUOI on fait chaque action (ex: "on fait dorer l\'oignon pour développer les sucres naturels et créer une base de saveur")',
    '   - Donne des repères VISUELS, OLFACTIFS et TACTILES (couleur, odeur, texture)',
    '   - Propose des ALTERNATIVES et VARIATIONS possibles',
    '   - Ajoute des CONSEILS DE CHEF et ASTUCES pour réussir',
    '   - Mentionne les ERREURS COURANTES à éviter',
    '   - Sépare chaque étape par \\n pour la lisibilité',
    '',
    '   - Une fois la génération terminée, identifie CLAIREMENT le plat consistant en mettant "isMainDish": true dans le JSON pour CE plat uniquement',
    '',
    '6. FORMAT JSON :',
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
    max_tokens: 4500,
    response_format: { type: 'json_object' },
  });

  const validated = SuggestRecipesOutputSchema.parse(output);
  if (!validated.recipes || validated.recipes.length === 0) {
    throw new Error("L'IA n'a pas pu générer de recettes valides. Veuillez réessayer.");
  }

  // Generate images using Pollinations.ai ONLY for the main dish
  const recipesWithImages = validated.recipes.map((recipe) => {
    // Only generate image if it is the main dish
    if (recipe.isMainDish) {
      // Construct a detailed prompt for the image
      const imagePrompt = `delicious ${recipe.title}, ${recipe.country} cuisine, professional food photography, 4k, appetizing, close-up`;
      // Encode the prompt for the URL
      const encodedPrompt = encodeURIComponent(imagePrompt);
      // Pollinations.ai URL with seed for consistency (optional, but good for caching)
      // Using random seed to get variety
      const seed = Math.floor(Math.random() * 1000);
      const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=800&height=600&nologo=true&seed=${seed}`;

      return { ...recipe, imageUrl };
    }

    // For other dishes, return without image URL
    return { ...recipe, imageUrl: undefined };
  });

  return recipesWithImages;
}
