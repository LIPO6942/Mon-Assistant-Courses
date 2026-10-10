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

export function findMatchingDbaratiItem(
  ingredientName: string | undefined | null,
  dbaratiItems: DbaratiItem[] | undefined | null
): { dishName: string; lastPreparedAt?: string; relativeDate: string | null } | null {
  try {
    if (!ingredientName || typeof ingredientName !== 'string') return null;
    if (!dbaratiItems || !Array.isArray(dbaratiItems) || dbaratiItems.length === 0) return null;

    const ingNorm = normalizeSearchText(ingredientName);
    const ingTokens = extractSignificantTokens(ingredientName);
    if (!ingNorm && ingTokens.length === 0) return null;

    const matches: DbaratiItem[] = [];

    for (const item of dbaratiItems) {
      if (!item || typeof item !== 'object' || !item.text || typeof item.text !== 'string') continue;
      const dishNorm = normalizeSearchText(item.text);
      const dishTokens = extractSignificantTokens(item.text);

      // 1. Exact match normalisé
      if (dishNorm && ingNorm && dishNorm === ingNorm) {
        matches.push(item);
        continue;
      }

      // 2. Sous-chaîne directe (le plat contient l'ingrédient ou l'ingrédient contient le plat)
      if ((dishNorm && ingNorm && dishNorm.includes(ingNorm)) || (ingNorm && dishNorm && ingNorm.includes(dishNorm))) {
        matches.push(item);
        continue;
      }

      // 3. Intersection de mots-clés significatifs
      const hasCommonToken = ingTokens.some(ingToken =>
        dishTokens.some(dishToken => dishToken === ingToken)
      );

      if (hasCommonToken) {
        matches.push(item);
      }
    }

    if (matches.length === 0) return null;

    // Priorité au plat préparé le plus récemment
    matches.sort((a, b) => {
      if (a.lastPreparedAt && b.lastPreparedAt) {
        const timeB = new Date(b.lastPreparedAt).getTime();
        const timeA = new Date(a.lastPreparedAt).getTime();
        if (!isNaN(timeB) && !isNaN(timeA)) return timeB - timeA;
      }
      if (a.lastPreparedAt) return -1;
      if (b.lastPreparedAt) return 1;
      return 0;
    });

    const bestMatch = matches[0];
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

