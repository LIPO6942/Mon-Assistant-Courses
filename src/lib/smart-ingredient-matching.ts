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
 * Mots vides (stop-words) alimentaires en français et qualificatifs culinaires
 * de découpe/préparation qui ne modifient pas l'identité fondamentale du produit.
 */
const STOP_WORDS = new Set([
  'de', 'd', 'du', 'des', 'le', 'la', 'les', 'l', 'un', 'une',
  'a', 'au', 'aux', 'en', 'et', 'pour', 'sur', 'dans', 'par',
  'frais', 'fraiche', 'fraiches', 'bien', 'tres', 'pur', 'pure', 'doux', 'douce',
  'extra', 'vierge', 'qualite', 'degraisse', 'egoutte', 'entier', 'entiere',
  'murs', 'mures', 'sec', 'seche', 'seches', 'sechee', 'sechees',
  'moulu', 'moulue', 'moulus', 'moulues', 'rape', 'rapee', 'rapes', 'rapees',
  'hache', 'hachee', 'haches', 'hachees', 'pile', 'pilee', 'piles', 'pilees',
  'emince', 'emincee', 'eminces', 'emincees', 'coupe', 'coupee', 'coupes', 'coupees',
  'morceaux', 'rondelles', 'tranches', 'filets', 'filet', 'gousses', 'gousse',
  'cuisses', 'cuisse', 'blancs', 'blanc', 'chair', 'cubes', 'fines', 'fins',
  'poudre', 'feuilles', 'feuille', 'branches', 'branche', 'botte', 'bottes',
  'boite', 'boites', 'conserve', 'conserves', 'pave', 'paves', 'chair'
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

  // Féminins et terminaisons courantes
  if (word.endsWith('e') && word.length > 4) {
    if (word.endsWith('concentree')) return 'concentre';
    if (word.endsWith('hachee')) return 'hache';
    if (word.endsWith('moulue')) return 'moulu';
    if (word.endsWith('rapee')) return 'rape';
    if (word.endsWith('sechee') || word.endsWith('seche')) return 'sec';
    if (word.endsWith('fraiche')) return 'frais';
    if (word.endsWith('rouge')) return 'rouge';
    if (word.endsWith('jaune')) return 'jaune';
    if (word.endsWith('verte')) return 'vert';
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
 * Ingrédients composés connus où un mot-clé unique ne doit PAS suffire
 * afin d'éviter les faux positifs (ex: "pomme" ne doit pas valider "pomme de terre").
 */
const COMPOUND_EXCLUSIONS: Record<string, string[]> = {
  'pomme': ['terre'],
  'lait': ['coco', 'amande', 'avoine', 'soja', 'riz'],
  'creme': ['coco', 'marron', 'marrons'],
  'sauce': ['soja', 'huitre', 'poisson', 'barbecue', 'worcestershire', 'nuoc'],
  'pate': ['arachide', 'pistache', 'curry', 'tartiner'],
  'sucre': ['vanille', 'glace', 'roux'],
  'vinaigre': ['balsamique', 'riz', 'cidre'],
  'farine': ['pois', 'chiche', 'mais'],
};

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
 */
export function getCanonicalIngredientKey(name: string): string {
  const tokens = getIngredientTokens(name);
  return tokens.slice().sort().join(' ');
}

/**
 * Comparaison élémentaire entre deux chaînes simples
 */
function isSingleIngredientMatch(nameA: string, nameB: string): boolean {
  if (!nameA || !nameB) return false;

  const cleanA = cleanIngredientName(nameA);
  const cleanB = cleanIngredientName(nameB);

  // 1. Égalité stricte ou après nettoyage
  if (cleanA === cleanB) return true;

  // 2. Clé canonique triée (ex: "concentré de tomate" vs "tomate concentré")
  const keyA = getCanonicalIngredientKey(nameA);
  const keyB = getCanonicalIngredientKey(nameB);
  if (keyA && keyB && keyA === keyB) return true;

  // 3. Comparaison par tokens
  const tokensA = getIngredientTokens(nameA);
  const tokensB = getIngredientTokens(nameB);

  if (tokensA.length === 0 || tokensB.length === 0) return false;

  const setA = new Set(tokensA);
  const setB = new Set(tokensB);

  const aInB = tokensA.every(t => setB.has(t));
  const bInA = tokensB.every(t => setA.has(t));

  if (aInB && bInA) return true;

  const minLen = Math.min(tokensA.length, tokensB.length);

  // Si au moins 2 mots clés sont partagés et l'un est sous-ensemble de l'autre
  if (minLen >= 2 && (aInB || bInA)) {
    return true;
  }

  // 4. Reconnaissance intelligente par ingrédient pivot (ex: "poulet" dans "cuisses de poulet")
  if (minLen === 1) {
    const singleToken = tokensA.length === 1 ? tokensA[0] : tokensB[0];
    const multiTokens = tokensA.length === 1 ? tokensB : tokensA;
    const multiSet = tokensA.length === 1 ? setB : setA;

    if (multiSet.has(singleToken)) {
      // Vérifier les exclusions composées (ex: pomme vs pomme de terre, lait vs lait de coco)
      const exclusions = COMPOUND_EXCLUSIONS[singleToken];
      if (exclusions && exclusions.length > 0) {
        const hasExcludedToken = exclusions.some(ex => multiTokens.includes(ex));
        if (!hasExcludedToken) {
          return true;
        }
      } else {
        return true;
      }
    }
  }

  // 5. Calcul du score de Jaccard sur les tokens (seuil abaissé à 60% avec les stop-words nettoyés)
  let overlapCount = 0;
  for (const t of tokensA) {
    if (setB.has(t)) overlapCount++;
  }

  const unionSize = new Set([...tokensA, ...tokensB]).size;
  const jaccard = unionSize > 0 ? overlapCount / unionSize : 0;

  if (jaccard >= 0.6) return true;

  return false;
}

/**
 * Découpe une chaîne en alternatives possibles si elle contient "ou", "/", ou ";"
 * Ex: "Filets de barramundi ou daurade royale" -> ["Filets de barramundi", "daurade royale"]
 */
function splitAlternatives(name: string): string[] {
  if (!name) return [];
  // Éviter de découper si c'est juste un mot
  if (!/\b(?:ou)\b|\/|;/i.test(name)) return [name];
  return name
    .split(/\b(?:ou)\b|\/|;/i)
    .map(part => part.trim())
    .filter(Boolean);
}

/**
 * Vérifie si deux noms d'ingrédients désignent le même produit
 * (gère les inversions, les alternatives "ou /", les singuliers/pluriels,
 * les qualificatifs culinaires et les ingrédients pivots).
 */
export function isIngredientMatch(nameA: string, nameB: string): boolean {
  if (!nameA || !nameB) return false;

  const partsA = splitAlternatives(nameA);
  const partsB = splitAlternatives(nameB);

  for (const partA of partsA) {
    for (const partB of partsB) {
      if (isSingleIngredientMatch(partA, partB)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Trouve l'ingrédient correspondant dans le garde-manger en utilisant la correspondance intelligente
 * Gère également les lignes combinées avec "et" (ex: "Oignon haché et gousses d'ail").
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

  // 3. Recherche par correspondance intelligente directe
  const match = pantry.find(p => isIngredientMatch(p.name, ingredientName));
  if (match) return match;

  // 4. Si la ligne est combinée avec "et" (ex: "Oignon haché et gousses d'ail pilées")
  if (/\bet\b/i.test(ingredientName)) {
    const subParts = ingredientName.split(/\bet\b/i).map(s => s.trim()).filter(Boolean);
    for (const subPart of subParts) {
      const subMatch = pantry.find(p => isIngredientMatch(p.name, subPart));
      if (subMatch) return subMatch;
    }
  }

  return undefined;
}

/**
 * Extrait les termes / options présents entre parenthèses dans un libellé d'ingrédient
 * (ex: "Filet de poisson blanc très frais (daurade, cabillaud)" -> ["daurade", "cabillaud"])
 */
export function extractParenthesisKeywords(name: string): string[] {
  if (!name) return [];
  const matches = name.matchAll(/\(([^)]+)\)/g);
  const keywords: string[] = [];
  for (const match of matches) {
    const content = match[1];
    // Ignorer les indications purement techniques ou de quantité
    if (/^\s*(?:\d+|environ|\d+%\s*mg|facultatif|surgel[eé]s?|au\s+choix|selon\s+go[uû]t)/i.test(content)) {
      continue;
    }
    // Séparer par virgule, point-virgule, slash ou "ou"
    const parts = content.split(/[,;/]|\bou\b/i).map(s => s.replace(/\betc\.?$/i, '').trim()).filter(Boolean);
    for (const part of parts) {
      if (part.length >= 3 && !/^(?:etc|autre|au choix)$/i.test(part)) {
        keywords.push(part);
      }
    }
  }
  return keywords;
}

/**
 * Nettoie et simplifie un libellé d'ingrédient de recette pour générer un nom
 * d'article concis, logique et adapté au garde-manger.
 * Ex: "Filet de poisson blanc très frais (daurade, cabillaud)" -> "Poisson blanc"
 * Ex: "Oignon rouge émincé en très fines lamelles" -> "Oignon rouge"
 * Ex: "Gousses d'ail pilées" -> "Ail"
 * Ex: "Cuisses de poulet fermier désossées" -> "Poulet fermier"
 */
export function simplifyIngredientForPantry(rawName: string): string {
  if (!rawName) return '';

  let name = rawName.trim();

  // 1. Retirer ce qui est entre parenthèses
  name = name.replace(/\s*\([^)]*\)/g, ' ').trim();

  // 2. Gestion des alternatives "ou" / "/" : prendre la première option principale
  if (/\b(?:ou)\b|\//i.test(name)) {
    const parts = name.split(/\b(?:ou)\b|\//i).map(s => s.trim()).filter(Boolean);
    if (parts.length > 0) {
      name = parts[0];
    }
  }

  // 3. Retrait des préfixes de coupe, morceaux, conditionnement
  const prefixes = [
    /^(?:filets?|pav[eé]s?|morceaux?|tranches?|cubes?|rondelles?|lamelles?|b[aâ]tonnets?)\s+(?:de|d'|du|des)?\s*/i,
    /^(?:gousses?|gousse)\s+(?:d'|de|du|des)?\s*/i,
    /^(?:zestes?|jus)\s+(?:de|d'|du|des)?\s*/i,
    /^(?:feuilles?|branches?|brins?|bottes?|brin)\s+(?:de|d'|du|des)?\s*/i,
    /^(?:escalopes?|blancs?|cuisses?|poitrine|morceau)\s+(?:de|d'|du|des)?\s*/i,
    /^(?:bo[iî]tes?|bocal|conserves?|sachets?|paquets?|pots?)\s+(?:de|d'|du|des)?\s*/i,
    /^(?:poudre|graines?|pur[eé]e)\s+(?:de|d'|du|des)?\s*/i,
    /^(?:petites?|gros|grosses?)\s+/i,
  ];
  for (const regex of prefixes) {
    name = name.replace(regex, '');
  }

  // 4. Retrait des qualificatifs d'état, de cuisson ou de découpe
  const culinaryAdjectives = [
    /\b(?:tr[eèé]s|bien)\b/gi,
    /\b(?:fra[iî]che?s?|frais)\b/gi,
    /\b(?:fermes?|m[uû]res?|m[uû]rs?)\b/gi,
    /\b(?:[eé]minc[eé]e?s?|hach[eé]e?s?|r[aâ]p[eé]e?s?|pil[eé]e?s?|[eé]cras[eé]e?s?|cisel[eé]e?s?)\b/gi,
    /\b(?:d[eé]cortiqu[eé]e?s?|d[eé]soss[eé]e?s?|pel[eé]e?s?|[eé]goutt[eé]e?s?|d[eé]graiss[eé]e?s?|moulue?s?|grill[eé]e?s?)\b/gi,
    /\b(?:en\s+(?:bo[iî]te|conserve|d[eé]s|morceaux|lamelles|tranches|poudre|bocaux))\b/gi,
    /\b(?:en\s+(?:tr[eèé]s\s+)?fines?\s+lamelles?)\b/gi,
    /\b(?:fin|fine|fines|fins|finement|grossi[eè]rement)\b/gi,
    /\b(?:cuits?|cuites?|crus?|crues?|press[eé]e?s?|concass[eé]e?s?)\b/gi,
  ];
  for (const regex of culinaryAdjectives) {
    name = name.replace(regex, ' ');
  }

  // 5. Nettoyage des petits mots de liaison au début ou résiduels
  name = name.replace(/^(?:de|d'|du|des|le|la|les|un|une)\s+/i, '');
  name = name.replace(/\s+/g, ' ').trim();

  // Si le résultat est vide ou trop court (< 3 caractères), repli sur le nom brut nettoyé de parenthèses
  if (!name || name.length < 3) {
    name = rawName.replace(/\s*\([^)]*\)/g, '').trim();
  }

  // 6. Majuscule sur la première lettre
  return name.charAt(0).toUpperCase() + name.slice(1);
}
