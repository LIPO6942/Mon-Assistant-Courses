'use client';

import { Receipt, ReceiptLine } from './types';
import { mapLawra9Category } from './smart-matching';

/**
 * Convertit un fichier en Data URL base64
 */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Redimensionne et compresse une image côté client (mobile & desktop)
 */
export async function compressImage(
  file: File,
  quality = 0.7,
  maxWidth = 1600,
  maxHeight = 1600
): Promise<{ blob: Blob; dataUrl: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas context error'));

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error('Compression error'));
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve({ blob, dataUrl: reader.result as string });
          };
          reader.readAsDataURL(blob);
        },
        'image/jpeg',
        quality
      );
    };
    img.onerror = (e) => reject(e);
  });
}

/**
 * Normalise l'unité et la quantité (ex: 500g -> 0.5kg)
 */
export function normalizeUnit(
  quantity?: number,
  unitStr?: string,
  label?: string
): { stdUnit: 'kg' | 'L' | 'pcs'; stdQty: number } {
  const q = quantity && quantity > 0 ? quantity : 1;
  const u = (unitStr || '').trim().toLowerCase();
  const text = (label || '').toLowerCase();

  if (u) {
    if (u === 'kg' || u === 'kilo') return { stdUnit: 'kg', stdQty: q };
    if (u === 'g' || u === 'gr') return { stdUnit: 'kg', stdQty: q / 1000 };
    if (u === 'l' || u === 'lt') return { stdUnit: 'L', stdQty: q };
    if (u === 'ml') return { stdUnit: 'L', stdQty: q / 1000 };
    if (u === 'pcs' || u === 'piece' || u === 'pièce' || u === 'un' || u === 'u')
      return { stdUnit: 'pcs', stdQty: q };
  }

  // Détection dans le libellé (ex: 500g, 1.5L)
  const kgMatch = text.match(/(\d+(?:\.\d+)?)\s?kg/);
  if (kgMatch) return { stdUnit: 'kg', stdQty: parseFloat(kgMatch[1]) * q };
  const gMatch = text.match(/(\d+(?:\.\d+)?)\s?g(?!r)/);
  if (gMatch) return { stdUnit: 'kg', stdQty: (parseFloat(gMatch[1]) / 1000) * q };
  const lMatch = text.match(/(\d+(?:\.\d+)?)\s?l(?!t)/);
  if (lMatch) return { stdUnit: 'L', stdQty: parseFloat(lMatch[1]) * q };
  const mlMatch = text.match(/(\d+(?:\.\d+)?)\s?ml/);
  if (mlMatch) return { stdUnit: 'L', stdQty: (parseFloat(mlMatch[1]) / 1000) * q };

  return { stdUnit: 'pcs', stdQty: q };
}

/**
 * Calcule le prix unitaire standardisé
 */
export function computeStandardUnitPrice(line: ReceiptLine): number | undefined {
  const qty = line.stdQty && line.stdQty > 0 ? line.stdQty : line.quantity;
  if (!qty || qty <= 0) return undefined;
  const total =
    line.lineTotal != null
      ? line.lineTotal
      : line.unitPrice != null
      ? line.unitPrice * (line.quantity || 1)
      : undefined;
  if (total == null) return undefined;
  return parseFloat((total / qty).toFixed(3));
}

/**
 * Nettoie une chaîne de date pour en extraire un Date valide
 */
export function parseFlexibleDate(dateStr: string | undefined): Date | null {
  if (!dateStr || dateStr.toLowerCase() === 'null') return null;
  const cleanStr = dateStr.trim();

  // Format ISO YYYY-MM-DD
  const d = new Date(cleanStr);
  if (!isNaN(d.getTime()) && cleanStr.includes('-') && cleanStr.split('-')[0].length === 4) {
    return d;
  }

  // DD/MM/YYYY ou DD-MM-YYYY
  const dmh = cleanStr.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/);
  if (dmh) {
    const day = parseInt(dmh[1], 10);
    const month = parseInt(dmh[2], 10) - 1;
    const year = parseInt(dmh[3], 10);
    const date = new Date(year, month, day);
    if (!isNaN(date.getTime())) return date;
  }

  // DD/MM/YY
  const dmy = cleanStr.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2})/);
  if (dmy) {
    const day = parseInt(dmy[1], 10);
    const month = parseInt(dmy[2], 10) - 1;
    let year = parseInt(dmy[3], 10);
    year += year > 50 ? 1900 : 2000;
    const date = new Date(year, month, day);
    if (!isNaN(date.getTime())) return date;
  }

  return isNaN(d.getTime()) ? null : d;
}

/**
 * KPIs de base pour les reçus
 */
export function computeReceiptKpis(receipts: Receipt[]) {
  const count = receipts.length;
  const totalSpend = receipts.reduce((acc, r) => acc + (r.total || 0), 0);
  const totalItems = receipts.reduce((acc, r) => acc + (r.lines?.length || 0), 0);
  const avgBasket = count > 0 ? totalSpend / count : 0;
  return { count, totalSpend, totalItems, avgBasket };
}
