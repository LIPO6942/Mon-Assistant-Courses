
'use server';
/**
 * @fileOverview Ce flow a été réinitialisé.
 */
import type { SuggestRecipeOutput } from '@/ai/types';

/**
 * Ceci est une fonction de remplacement.
 * La fonctionnalité de suggestion de recette sera réimplémentée.
 */
export async function suggestRecipe(): Promise<SuggestRecipeOutput> {
  console.log("La fonction suggestRecipe a été appelée, mais est actuellement désactivée.");
  // Retourne une recette vide pour éviter les erreurs.
  return {
    title: "Recette en attente",
    description: "La suggestion de recette sera bientôt de retour.",
    country: "Monde",
    ingredients: []
  };
}
