
'use server';
/**
 * @fileOverview Ce flow a été réinitialisé.
 */
import type { GenerateShoppingListInput, GenerateShoppingListOutput } from '@/ai/types';

/**
 * Ceci est une fonction de remplacement.
 * La fonctionnalité de génération de liste sera réimplémentée.
 */
export async function generateShoppingList(input: GenerateShoppingListInput): Promise<GenerateShoppingListOutput> {
  console.log("La fonction generateShoppingList a été appelée, mais est actuellement désactivée.");
  // Retourne une liste vide pour éviter les erreurs.
  return { items: [] };
}
