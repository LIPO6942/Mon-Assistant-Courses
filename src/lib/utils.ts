import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { PurchaseRecord } from "./types"

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
