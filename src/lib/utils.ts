import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { PurchaseRecord, DbaratiItem } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getProductStatus(history: PurchaseRecord[] | undefined): 'green' | 'orange' | 'red' | null {
  if (!history || history.length === 0) return null;

  const sortedHistory = [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const lastPurchase = new Date(sortedHistory[sortedHistory.length - 1].date);
  const now = new Date();
  const diffDays = (now.getTime() - lastPurchase.getTime()) / (1000 * 60 * 60 * 24);

  // Vert : moins de 7 jours
  if (diffDays < 7) return 'green';

  if (sortedHistory.length < 2) return null;

  // Calculer l'intervalle moyen
  let totalDays = 0;
  for (let i = 1; i < sortedHistory.length; i++) {
    const prev = new Date(sortedHistory[i - 1].date);
    const curr = new Date(sortedHistory[i].date);
    totalDays += (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
  }
  const avgInterval = totalDays / (sortedHistory.length - 1);

  // Orange : atteint la date de fréquence habituelle
  if (diffDays >= avgInterval && diffDays < avgInterval * 1.5) return 'orange';

  // Rouge : en rupture/retard (dépassé de 50% ou 4 mois si l'utilisateur l'a suggéré)
  // On va utiliser le ratio 1.5 pour le rouge
  if (diffDays >= avgInterval * 1.5) return 'red';

  return null;
}

export function isInAppBrowser(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent || navigator.vendor || (window as any).opera;
  return (
    /FBAN/i.test(ua) ||
    /FBAV/i.test(ua) ||
    /Instagram/i.test(ua) ||
    /Messenger/i.test(ua) ||
    /LinkedInApp/i.test(ua) ||
    /Twitter/i.test(ua) ||
    /WhatsApp/i.test(ua) ||
    /Snapchat/i.test(ua)
  );
}

const STOP_WORDS = new Set([
  'de', 'des', 'du', 'au', 'aux', 'a', 'et', 'le', 'la', 'les', 'un', 'une', 'd', 'l',
  'en', 'pour', 'avec', 'sans', 'sur', 'dans', 'el', 'al'
]);

export function normalizeSearchText(str: string | undefined | null): string {
  if (!str || typeof str !== 'string') return '';
  try {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // supprime les accents
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')   // remplace la ponctuation par des espaces
      .trim()
      .replace(/\s+/g, ' ');
  } catch (_) {
    return '';
  }
}

function stemWord(word: string): string {
  if (typeof word === 'string' && word.length > 3 && (word.endsWith('s') || word.endsWith('x'))) {
    return word.slice(0, -1);
  }
  return word || '';
}

export function extractSignificantTokens(str: string | undefined | null): string[] {
  if (!str || typeof str !== 'string') return [];
  try {
    const norm = normalizeSearchText(str);
    if (!norm) return [];
    return norm
      .split(' ')
      .filter(token => token && token.length >= 2 && !STOP_WORDS.has(token))
      .map(stemWord);
  } catch (_) {
    return [];
  }
}

export function formatCompactRelativeDate(isoDate?: string | null): string | null {
  if (!isoDate || typeof isoDate !== 'string') return null;
  try {
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) return null;

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return "auj.";
    if (diffDays === 1) return "hier";
    if (diffDays < 30) return `il y a ${diffDays} j`;
    if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `il y a ${months} mois`;
    }
    return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' }).format(date);
  } catch (_) {
    return null;
  }
}

// --- PRODUITS EXCLUS DU MARCHÉ PUBLIC (HYGIÈNE INTIME, SOUS-VÊTEMENTS, PRÉSERVATIFS) ---
// Note : Les articles bébés sont expressément CONSERVÉS.
export function isExcludedFromMarketPrices(
  name: string | undefined | null,
  category?: string | null
): boolean {
  if (!name || typeof name !== 'string') return false;

  const raw = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  const cat = (category || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

  // RÈGLE PRIORITAIRE : TOUS LES ARTICLES BÉBÉ DOIVENT ÊTRE CONSERVÉS (GARDÉS)
  const isBabyItem =
    /\b(bebe|baby|nourrisson|infantile|maternite|pampers|huggies)\b/i.test(raw) ||
    /\b(bebe|baby|nourrisson|infantile)\b/i.test(cat);

  if (isBabyItem) {
    return false;
  }

  // Catégories intimes / lingerie
  if (/\b(intime|lingerie|sous[- ]vetement|protection feminine)\b/i.test(cat)) {
    return true;
  }

  // Exception : serviette de table ou serviette en papier (articles de table / ménage, non intimes)
  if (/\bserviette(s)?\b/i.test(raw) && /\b(table|papier|bain)\b/i.test(raw)) {
    return false;
  }

  // LISTE DES ARTICLES MASQUÉS (intime, hygiène féminine, sous-vêtements, préservatifs)
  const EXCLUDED_PATTERNS = [
    // 1. Serviettes et protections hygiéniques féminines (y compris coquilles usuelles comme 'alwayas')
    /\bserviette(s)?\b/i,
    /\bhygienique(s)?\b/i,
    /\balway(a)?s\b/i,
    /\b(nana|vania|tampax|kotex|femfresh|intima)\b/i,
    /\btampon(s)?\b/i,
    /\bprotege[- ]?slip(s)?\b/i,
    /\b(menstruel|menstruelle|menstruation|coupe menstruelle)\b/i,

    // 2. Sous-vêtements & lingerie
    /\bslip(s)?\b/i,
    /\bculotte(s)?\b/i,
    /\bboxer(s)?\b/i,
    /\bcalecon(s)?\b/i,
    /\bstring(s)?\b/i,
    /\bsoutien[- ]gorge(s)?\b/i,
    /\bbrassiere(s)?\b/i,
    /\blingerie\b/i,
    /\bsous[- ]vetement(s)?\b/i,

    // 3. Préservatifs et santé sexuelle / intime
    /\bpreservatif(s)?\b/i,
    /\bcondom(s)?\b/i,
    /\b(durex|manix|skyn)\b/i,
    /\blubrifiant[- ]intime\b/i,
    /\bgel[- ]intime\b/i,
  ];

  return EXCLUDED_PATTERNS.some(pattern => pattern.test(raw));
}

// --- NORMALISATION PHONÉTIQUE ET DIALECTALE DE LA CUISINE TUNISIENNE ---

export const TUNISIAN_CULINARY_ALIASES: Record<string, string[]> = {
  'nouasser': ['nwasser', 'nwaser', 'nouaser', 'nwassar'],
  'nwasser': ['nouasser', 'nwaser', 'nouaser', 'nwassar'],
  'couscous': ['kosksi', 'kouskous', 'kousseksi', 'kesksou'],
  'kosksi': ['couscous', 'kouskous', 'kousseksi'],
  'kouskous': ['couscous', 'kosksi', 'kousseksi'],
  'makrouna': ['macaroni', 'pates', 'ma9rouna', 'pasta'],
  'pates': ['makrouna', 'macaroni', 'pasta', 'ma9rouna'],
  'chorba': ['shorba', 'chourba', 'tchiche'],
  'shorba': ['chorba', 'chourba', 'tchiche'],
  'dwida': ['douida', 'dweeda'],
  'douida': ['dwida', 'dweeda'],
  'rechta': ['richta', 'rekhta'],
  'richta': ['rechta', 'rekhta'],
  'chakhchoukha': ['chakhchouka', 'chekhechoukha'],
  'chakhchouka': ['chakhchoukha', 'chekhechoukha'],
  'kafteji': ['kefteji', 'kaftaji', 'keftejy'],
  'kefteji': ['kafteji', 'kaftaji', 'keftejy'],
  'lablebi': ['lablabi'],
  'lablabi': ['lablebi'],
  'ojja': ['ojjet', 'odja'],
  'ojjet': ['ojja', 'odja'],
  'kamounia': ['kamouniet', 'kamounya'],
  'kamouniet': ['kamounia', 'kamounya'],
  'madfouna': ['madfounet'],
  'madfounet': ['madfouna'],
  'rouz': ['riz', 'roz'],
  'riz': ['rouz', 'roz'],
  'borghol': ['boulgour', 'burgul'],
  'tajine': ['tagine'],
  'tagine': ['tajine'],
  'slata': ['salade', 'salata'],
  'salade': ['slata', 'salata'],
  'brik': ['briek', 'borek', 'malsouka'],
  'malsouka': ['brik', 'dioul'],
};

export function normalizeDialectFoodText(str: string | undefined | null): string {
  if (!str || typeof str !== 'string') return '';
  let s = normalizeSearchText(str);
  if (!s) return '';

  // Supprimer les qualificatifs de garniture usuels dans les plats pour isoler la base
  const fillers = [
    'au poulet', 'a la viande', 'bel allouch', 'bil allouch', 'allouch', 'agneau',
    'bil hout', 'bel hout', 'au poisson', 'au thon', 'bil djedj', 'bel djedj', 'djedj',
    'au four', 'tunisien', 'tunisienne', 'traditionnel', 'maison', 'sauce rouge', 'sauce blanche',
    'aux legumes', 'escalope', 'merguez', 'kadid', 'osban'
  ];
  for (const f of fillers) {
    s = s.replace(new RegExp(`\\b${f}\\b`, 'g'), ' ');
  }

  // 1. Arabizi et consonnes phonétiquement équivalentes
  s = s.replace(/9/g, 'k')
       .replace(/q/g, 'k')
       .replace(/c(?=[aou])/g, 'k')
       .replace(/ch/g, 'sh')
       .replace(/5/g, 'kh')
       .replace(/7/g, 'h')
       .replace(/3/g, 'a');

  // 2. Équivalence phonétique maghrébine : 'ou' <-> 'w'
  s = s.replace(/ou/g, 'w');

  // 3. Réduction des consonnes doubles (ex: ss -> s, tt -> t, nn -> n, mm -> m, rr -> r)
  s = s.replace(/([a-z])\1+/g, '$1');

  // 4. Terminaisons dialectales féminines : "iet" -> "ia", "et" en fin de mot -> "a"
  s = s.replace(/iet\b/g, 'ia')
       .replace(/et\b/g, 'a');

  return s.replace(/\s+/g, ' ').trim();
}

function levenshteinSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  if (!a || !b) return 0;
  const la = a.length;
  const lb = b.length;
  const matrix: number[][] = [];
  for (let i = 0; i <= la; i++) matrix[i] = [i];
  for (let j = 0; j <= lb; j++) matrix[0][j] = j;

  for (let i = 1; i <= la; i++) {
    for (let j = 1; j <= lb; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  const distance = matrix[la][lb];
  const maxLen = Math.max(la, lb);
  return maxLen === 0 ? 1 : 1 - distance / maxLen;
}

export function findMatchingDbaratiItem(
  ingredientName: string | undefined | null,
  dbaratiItems: DbaratiItem[] | undefined | null
): { dishName: string; lastPreparedAt?: string; relativeDate: string | null } | null {
  try {
    if (!ingredientName || typeof ingredientName !== 'string') return null;
    if (!dbaratiItems || !Array.isArray(dbaratiItems) || dbaratiItems.length === 0) return null;

    const ingNorm = normalizeSearchText(ingredientName);
    const ingTokens = extractSignificantTokens(ingredientName);
    const ingDialect = normalizeDialectFoodText(ingredientName);
    const ingDialectTokens = ingDialect.split(' ').filter(t => t.length >= 2);

    if (!ingNorm && ingTokens.length === 0 && !ingDialect) return null;

    const matches: Array<{ item: DbaratiItem; score: number }> = [];

    for (const item of dbaratiItems) {
      if (!item || typeof item !== 'object' || !item.text || typeof item.text !== 'string') continue;
      const dishNorm = normalizeSearchText(item.text);
      const dishTokens = extractSignificantTokens(item.text);
      const dishDialect = normalizeDialectFoodText(item.text);
      const dishDialectTokens = dishDialect.split(' ').filter(t => t.length >= 2);

      let score = 0;

      // 1. Exact match normalisé
      if (dishNorm && ingNorm && dishNorm === ingNorm) {
        score = Math.max(score, 100);
      }
      // 2. Exact match dialectal phonétique (ex: Nouasser === Nwasser -> nwaser === nwaser)
      else if (dishDialect && ingDialect && dishDialect === ingDialect) {
        score = Math.max(score, 95);
      }
      // 3. Sous-chaîne directe ou dialectale (le plat contient l'ingrédient ou inversement)
      else if (
        (dishNorm && ingNorm && (dishNorm.includes(ingNorm) || ingNorm.includes(dishNorm))) ||
        (dishDialect && ingDialect && (dishDialect.includes(ingDialect) || ingDialect.includes(dishDialect)))
      ) {
        score = Math.max(score, 85);
      }
      // 4. Dictionnaire d'équivalences culinaires tunisiennes (ex: nouasser <-> nwasser, couscous <-> kosksi)
      else {
        let aliasMatch = false;
        for (const token of ingTokens) {
          const aliases = TUNISIAN_CULINARY_ALIASES[token];
          if (aliases && aliases.some(a => dishTokens.includes(a) || dishNorm.includes(a))) {
            aliasMatch = true;
            break;
          }
        }
        if (!aliasMatch) {
          for (const token of dishTokens) {
            const aliases = TUNISIAN_CULINARY_ALIASES[token];
            if (aliases && aliases.some(a => ingTokens.includes(a) || ingNorm.includes(a))) {
              aliasMatch = true;
              break;
            }
          }
        }
        if (aliasMatch) {
          score = Math.max(score, 80);
        }
      }

      // 5. Intersection de mots-clés significatifs (standards ou dialectaux)
      if (score === 0) {
        const hasCommonToken = ingTokens.some(ingToken =>
          dishTokens.some(dishToken => dishToken === ingToken)
        );
        const hasCommonDialectToken = ingDialectTokens.some(it =>
          dishDialectTokens.some(dt => dt === it)
        );
        if (hasCommonToken || hasCommonDialectToken) {
          score = Math.max(score, 75);
        }
      }

      // 6. Fuzzy matching (similarité Levenshtein >= 75%) sur chaîne complète ou dialectale
      if (score === 0 && ingNorm.length >= 4 && dishNorm.length >= 4) {
        const stdSim = levenshteinSimilarity(ingNorm, dishNorm);
        const dialectSim = levenshteinSimilarity(ingDialect, dishDialect);
        const bestSim = Math.max(stdSim, dialectSim);
        if (bestSim >= 0.75) {
          score = Math.max(score, Math.round(bestSim * 70));
        }
      }

      if (score > 0) {
        matches.push({ item, score });
      }
    }

    if (matches.length === 0) return null;

    // Priorité au score le plus élevé, puis au plat préparé le plus récemment
    matches.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (a.item.lastPreparedAt && b.item.lastPreparedAt) {
        const timeB = new Date(b.item.lastPreparedAt).getTime();
        const timeA = new Date(a.item.lastPreparedAt).getTime();
        if (!isNaN(timeB) && !isNaN(timeA)) return timeB - timeA;
      }
      if (a.item.lastPreparedAt) return -1;
      if (b.item.lastPreparedAt) return 1;
      return 0;
    });

    const bestMatch = matches[0].item;
    if (!bestMatch || !bestMatch.text) return null;

    return {
      dishName: bestMatch.text,
      lastPreparedAt: bestMatch.lastPreparedAt,
      relativeDate: formatCompactRelativeDate(bestMatch.lastPreparedAt),
    };
  } catch (e) {
    console.error("Error in findMatchingDbaratiItem:", e);
    return null;
  }
}

/**
 * Calcule et arrondit de manière culinaire et réaliste la quantité d'un ingrédient
 * selon le nombre de convives et l'unité de mesure.
 * Évite les aberrations mathématiques comme "266.667 g" ou "1.333 pièces".
 */
export function calculateAdjustedQuantity(
  baseQuantity: number,
  basePortions: number,
  newPortions: number,
  unit?: string
): number {
  if (!basePortions || !baseQuantity) return baseQuantity;
  const raw = (baseQuantity / basePortions) * newPortions;
  const u = (unit || '').toLowerCase().trim();

  // 1. Grammes (g) et millilitres / centilitres
  if (u.includes('gramme') || u.includes('(g)') || u === 'g' || u.includes('ml') || u.includes('cl')) {
    if (raw >= 100) {
      // Au-dessus de 100g : arrondir aux 5g les plus proches (ex: 266.667g -> 265g)
      return Math.round(raw / 5) * 5;
    } else if (raw >= 20) {
      // Entre 20g et 100g : arrondir aux 5g les plus proches (ex: 33.3g -> 35g)
      return Math.round(raw / 5) * 5;
    } else if (raw >= 5) {
      // Entre 5g et 20g : arrondir à l'entier
      return Math.round(raw);
    } else {
      // Petites pesées : au demi-gramme
      return Math.round(raw * 2) / 2;
    }
  }

  // 2. Kilogrammes (kg) et Litres (l)
  if (u.includes('kg') || u.includes('kilo') || u.includes('litre') || u === 'l') {
    const rounded = Math.round(raw * 20) / 20;
    return parseFloat(rounded.toFixed(2));
  }

  // 3. Cuillères, sachets, gousses, pincées, tranches, bottes
  if (
    u.includes('cuill') ||
    u.includes('cas') ||
    u.includes('cac') ||
    u.includes('gousse') ||
    u.includes('botte') ||
    u.includes('sachet') ||
    u.includes('pinc') ||
    u.includes('tranche')
  ) {
    const rounded = Math.round(raw * 2) / 2;
    return rounded === 0 ? 0.5 : rounded;
  }

  // 4. Pièces, oeufs, etc.
  if (u.includes('pi') || u.includes('oeuf') || u.includes('unit')) {
    const rounded = Math.round(raw * 2) / 2;
    return rounded === 0 ? 1 : rounded;
  }

  // 5. Par défaut :
  if (raw >= 50) return Math.round(raw);
  if (raw >= 10) return Math.round(raw * 2) / 2;
  return parseFloat(raw.toFixed(1));
}

