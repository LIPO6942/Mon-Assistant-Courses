import type { Ingredient } from './types';

/**
 * Nettoie une chaîne d'ingrédient : retire les émojis, accents, ponctuation,
 * et normalise les espaces et la casse.
 */
export function cleanIngredientName(name: string): string {
  if (!name) return '';
  return name
    // Supprimer les émojis et symboles graphiques
    .replace(/[\p{Extended_Pictographic}\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/gu, ' ')
    // Normaliser les accents et diacritiques
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    // Remplacer la ponctuation par des espaces
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Mots vides (stop-words) alimentaires en français qui ne modifient pas l'identité du produit
 */
const STOP_WORDS = new Set([
  'de', 'd', 'du', 'des', 'le', 'la', 'les', 'l', 'un', 'une',
  'a', 'au', 'aux', 'en', 'et', 'pour', 'sur', 'dans', 'par',
  'frais', 'fraiche', 'fraiches'
]);

/**
 * Mots invariables se terminant par 's' ou 'x' à ne pas tronquer
 */
const INVARIANT_WORDS = new Set([
  'riz', 'ananas', 'couscous', 'pois', 'jus', 'mais', 'radis', 'os', 'cassis', 'fois'
]);

/**
 * Normalise un token singulier / féminin
 */
function normalizeWordToken(word: string): string {
  if (!word || word.length <= 2) return word;
  
  // Féminins courants
  if (word.endsWith('e') && word.length > 4) {
    if (word.endsWith('concentree')) return 'concentre';
    if (word.endsWith('hachee')) return 'hache';
    if (word.endsWith('moulue')) return 'moulu';
    if (word.endsWith('rapee')) return 'rape';
    if (word.endsWith('sechee')) return 'sec';
    if (word.endsWith('seche')) return 'sec';
  }

  // Pluriels simples (s ou x)
  if (!INVARIANT_WORDS.has(word)) {
    if (word.endsWith('s') && word.length > 3) {
      return word.slice(0, -1);
    }
    if (word.endsWith('x') && word.length > 3) {
      return word.slice(0, -1);
    }
  }

  return word;
}

/**
 * Extrait les tokens significatifs et normalisés d'un ingrédient
 */
export function getIngredientTokens(name: string): string[] {
  const cleaned = cleanIngredientName(name);
  if (!cleaned) return [];

  const rawTokens = cleaned.split(' ');
  const tokens: string[] = [];

  for (const raw of rawTokens) {
    const trimmed = raw.trim();
    if (!trimmed || STOP_WORDS.has(trimmed)) continue;
    const normalized = normalizeWordToken(trimmed);
    if (normalized && !tokens.includes(normalized)) {
      tokens.push(normalized);
    }
  }

  return tokens;
}

/**
 * Génère une clé canonique invariable selon l'ordre des mots
 * Ex: "Concentré de tomate" -> "concentre tomate"
 *     "Tomate concentré"    -> "concentre tomate"
 *     "Oignon 🧅"           -> "oignon"
 */
export function getCanonicalIngredientKey(name: string): string {
  const tokens = getIngredientTokens(name);
  return tokens.slice().sort().join(' ');
}

/**
 * Vérifie si deux noms d'ingrédients désignent le même produit
 * (gère les inversions de mots, émojis, singulier/pluriel, accents, stop-words)
 */
export function isIngredientMatch(nameA: string, nameB: string): boolean {
  if (!nameA || !nameB) return false;

  const cleanA = cleanIngredientName(nameA);
  const cleanB = cleanIngredientName(nameB);

  // 1. Égalité stricte ou après nettoyage
  if (cleanA === cleanB) return true;

  // 2. Clé canonique triée (gère "concentré de tomate" vs "tomate concentré")
  const keyA = getCanonicalIngredientKey(nameA);
  const keyB = getCanonicalIngredientKey(nameB);
  if (keyA && keyB && keyA === keyB) return true;

  // 3. Comparaison par tokens
  const tokensA = getIngredientTokens(nameA);
  const tokensB = getIngredientTokens(nameB);

  if (tokensA.length === 0 || tokensB.length === 0) return false;

  // Si tous les tokens de l'un sont dans l'autre (ex: "filet de poulet" vs "poulet filet")
  const setA = new Set(tokensA);
  const setB = new Set(tokensB);

  const aInB = tokensA.every(t => setB.has(t));
  const bInA = tokensB.every(t => setA.has(t));

  if (aInB && bInA) return true;

  // Si l'un est un sous-ensemble complet de l'autre avec au moins 2 mots clés partagés
  // Ex: "double concentré de tomate" et "concentré de tomate"
  if (minTokensLength(tokensA, tokensB) >= 2 && (aInB || bInA)) {
    return true;
  }

  // Calcul du score de Jaccard sur les tokens
  let overlapCount = 0;
  for (const t of tokensA) {
    if (setB.has(t)) overlapCount++;
  }

  const unionSize = new Set([...tokensA, ...tokensB]).size;
  const jaccard = unionSize > 0 ? overlapCount / unionSize : 0;

  // Si la similarité est supérieure à 70%
  if (jaccard >= 0.7) return true;

  return false;
}

function minTokensLength(a: string[], b: string[]): number {
  return Math.min(a.length, b.length);
}

/**
 * Trouve l'ingrédient correspondant dans le garde-manger en utilisant la correspondance intelligente
 */
export function findMatchingPantryItem(
  ingredientName: string,
  pantry: Ingredient[]
): Ingredient | undefined {
  if (!ingredientName || !pantry || pantry.length === 0) return undefined;

  // 1. Recherche exacte
  const lower = ingredientName.toLowerCase().trim();
  const exact = pantry.find(p => p.name.toLowerCase().trim() === lower);
  if (exact) return exact;

  // 2. Recherche par clé canonique
  const key = getCanonicalIngredientKey(ingredientName);
  if (key) {
    const canonicalMatch = pantry.find(p => getCanonicalIngredientKey(p.name) === key);
    if (canonicalMatch) return canonicalMatch;
  }

  // 3. Recherche par correspondance intelligente
  return pantry.find(p => isIngredientMatch(p.name, ingredientName));
}

