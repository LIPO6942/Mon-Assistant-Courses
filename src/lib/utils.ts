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

export function normalizeSearchText(str: string): string {
  return (str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // supprime les accents
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')   // remplace la ponctuation par des espaces
    .trim()
    .replace(/\s+/g, ' ');
}

function stemWord(word: string): string {
  if (word.length > 3 && (word.endsWith('s') || word.endsWith('x'))) {
    return word.slice(0, -1);
  }
  return word;
}

export function extractSignificantTokens(str: string): string[] {
  const norm = normalizeSearchText(str);
  if (!norm) return [];
  return norm
    .split(' ')
    .filter(token => token.length >= 2 && !STOP_WORDS.has(token))
    .map(stemWord);
}

export function formatCompactRelativeDate(isoDate?: string | null): string | null {
  if (!isoDate) return null;
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
}

export function findMatchingDbaratiItem(
  ingredientName: string,
  dbaratiItems: DbaratiItem[] | undefined
): { dishName: string; lastPreparedAt?: string; relativeDate: string | null } | null {
  if (!ingredientName || !dbaratiItems || dbaratiItems.length === 0) return null;

  const ingNorm = normalizeSearchText(ingredientName);
  const ingTokens = extractSignificantTokens(ingredientName);
  if (!ingNorm && ingTokens.length === 0) return null;

  const matches: DbaratiItem[] = [];

  for (const item of dbaratiItems) {
    if (!item.text) continue;
    const dishNorm = normalizeSearchText(item.text);
    const dishTokens = extractSignificantTokens(item.text);

    // 1. Exact match normalisé
    if (dishNorm === ingNorm) {
      matches.push(item);
      continue;
    }

    // 2. Sous-chaîne directe (le plat contient l'ingrédient ou l'ingrédient contient le plat)
    if (dishNorm.includes(ingNorm) || ingNorm.includes(dishNorm)) {
      matches.push(item);
      continue;
    }

    // 3. Intersection de mots-clés significatifs (ex: 'poulpe' dans 'couscous poulpe', 'couscous' dans 'couscous poulpe')
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
      return new Date(b.lastPreparedAt).getTime() - new Date(a.lastPreparedAt).getTime();
    }
    if (a.lastPreparedAt) return -1;
    if (b.lastPreparedAt) return 1;
    return 0;
  });

  const bestMatch = matches[0];
  return {
    dishName: bestMatch.text,
    lastPreparedAt: bestMatch.lastPreparedAt,
    relativeDate: formatCompactRelativeDate(bestMatch.lastPreparedAt),
  };
}

