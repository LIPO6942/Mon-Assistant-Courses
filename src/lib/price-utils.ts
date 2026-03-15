import type { CommunityPurchase, RecipeIngredient } from './types';

export interface IngredientMarketPrice {
  name: string;
  avgPrice: number;
  unit: string;
  count: number;
  minPrice: number;
  maxPrice: number;
  sources: string[];
}

/**
 * Calculate average market prices for all ingredients from community purchases
 */
export function calculateMarketPrices(purchases: CommunityPurchase[]): Map<string, IngredientMarketPrice> {
  const priceMap = new Map<string, IngredientMarketPrice>();

  purchases.forEach(purchase => {
    const key = `${(purchase.normalizedName || purchase.ingredientName).toLowerCase()}|${purchase.unit}`;
    const existing = priceMap.get(key);

    if (existing) {
      // Update existing entry
      const oldSum = existing.avgPrice * existing.count;
      const newSum = oldSum + purchase.price;
      existing.count += 1;
      existing.avgPrice = newSum / existing.count;
      existing.minPrice = Math.min(existing.minPrice, purchase.price);
      existing.maxPrice = Math.max(existing.maxPrice, purchase.price);
      if (purchase.store && !existing.sources.includes(purchase.store)) {
        existing.sources.push(purchase.store);
      }
    } else {
      priceMap.set(key, {
        name: purchase.ingredientName,
        avgPrice: purchase.price,
        unit: purchase.unit,
        count: 1,
        minPrice: purchase.price,
        maxPrice: purchase.price,
        sources: purchase.store ? [purchase.store] : [],
      });
    }
  });

  return priceMap;
}

export function normalizeUnit(unit: string | undefined): string {
  if (!unit) return '';
  const lower = unit.toLowerCase().trim();
  if (lower === 'g' || lower.startsWith('gram')) return 'g';
  if (lower === 'kg' || lower.startsWith('kilo')) return 'kg';
  if (lower === 'l' || lower.startsWith('litr')) return 'l';
  if (lower === 'ml' || lower.startsWith('milli')) return 'ml';
  if (lower === 'cl' || lower.startsWith('centi')) return 'cl';
  if (lower.startsWith('c. à soupe') || lower.startsWith('cas') || lower.startsWith('cuillere a soupe') || lower.startsWith('cuillère à soupe')) return 'cas';
  if (lower.startsWith('c. à café') || lower.startsWith('cac') || lower.startsWith('cuillere a cafe') || lower.startsWith('cuillère à café')) return 'cac';
  if (lower.startsWith('pièce') || lower.startsWith('piece') || lower === 'pce' || lower === 'unité') return 'piece';
  if (lower.startsWith('boît') || lower.startsWith('boit')) return 'boite';
  if (lower.startsWith('botte')) return 'botte';
  if (lower.startsWith('pincée') || lower.startsWith('pincee')) return 'pincee';
  // Also common ones like 'feuilles', 'tranches'
  if (lower.startsWith('feuille')) return 'feuille';
  if (lower.startsWith('tranche')) return 'tranche';
  return lower;
}

export function getUnitConversionFactor(fromUnit: string, toUnit: string): number | null {
  const normFrom = normalizeUnit(fromUnit);
  const normTo = normalizeUnit(toUnit);

  if (normFrom === normTo && normFrom !== '') return 1;

  const conversions: Record<string, Record<string, number>> = {
    // Weight conversions
    kg: { g: 1000 },
    g: { kg: 0.001 },

    // Volume conversions
    l: { ml: 1000, cl: 100 },
    ml: { l: 0.001, cl: 0.1 },
    cl: { l: 0.01, ml: 10 },
  };

  if (conversions[normFrom] && conversions[normFrom][normTo]) {
    return conversions[normFrom][normTo];
  }

  return null;
}

export function findMarketPrice(
  ingredientName: string,
  marketPrices: Map<string, IngredientMarketPrice>,
  preferredUnit?: string
): IngredientMarketPrice | null {
  const searchName = ingredientName.toLowerCase().trim();

  // Try exact match with preferred unit first
  if (preferredUnit) {
    const exactKey = `${searchName}|${preferredUnit}`;
    if (marketPrices.has(exactKey)) {
      return marketPrices.get(exactKey) || null;
    }
  }

  // Try exact match with any unit
  for (const [key, price] of marketPrices.entries()) {
    if (key.startsWith(`${searchName}|`)) {
      return price;
    }
  }

  // Try fuzzy matching (contains search)
  let bestMatch: IngredientMarketPrice | null = null;
  let bestScore = 0;

  const searchWords = searchName.split(/\s+/).filter(w => w.length > 2 || w === 'ail' || w === 'riz' || w === 'sel');

  for (const [_, price] of marketPrices.entries()) {
    const priceName = price.name.toLowerCase();
    const priceWords = priceName.split(/\s+/);

    let score = 0;

    // Exact name match or singular/plural exact match gets absolute priority
    if (priceName === searchName || priceName === searchName + 's' || priceName + 's' === searchName) {
      score += 10;
    }

    searchWords.forEach(word => {
      const lowerWord = word.endsWith('s') ? word.slice(0, -1) : word;
      if (priceWords.some(pw => {
        const lowerPw = pw.endsWith('s') ? pw.slice(0, -1) : pw;
        return lowerPw === lowerWord || lowerPw.includes(lowerWord) || lowerWord.includes(lowerPw);
      })) {
        score++;
      }
    });

    // Penalize if the parsed market ingredient has many extra words (e.g., search 'tomate', found 'sauce tomate purée')
    if (score > 0) {
      score -= (priceWords.length - searchWords.length) * 0.1;
    }

    if (score > bestScore && score > 0.5) { // Needs a minimum valid score
      bestScore = score;
      bestMatch = price;
    }
  }

  return bestMatch;
}

export function calculateRecipeCost(
  ingredients: RecipeIngredient[],
  marketPrices: Map<string, IngredientMarketPrice>
): {
  totalCost: number | null;
  details: Array<{
    name: string;
    quantity: number;
    unit: string;
    estimatedCost: number | null;
    marketPrice: IngredientMarketPrice | null;
  }>;
  availableCount: number;
  unavailableCount: number;
} {
  let totalCost = 0;
  let availableCount = 0;
  const details: Array<{
    name: string;
    quantity: number;
    unit: string;
    estimatedCost: number | null;
    marketPrice: IngredientMarketPrice | null;
  }> = [];

  ingredients.forEach(ingredient => {
    const marketPrice = findMarketPrice(ingredient.name, marketPrices, ingredient.unit);

    if (marketPrice) {
      let costForQuantity: number | null = null;
      let conversionFactor = getUnitConversionFactor(ingredient.unit, marketPrice.unit);
      
      if (conversionFactor !== null) {
        costForQuantity = (ingredient.quantity * conversionFactor) * marketPrice.avgPrice;
      } else {
        // Fallback heuristics when units are inherently mismatched
        const normIng = normalizeUnit(ingredient.unit);
        const normMkt = normalizeUnit(marketPrice.unit);
        
        if (['pincee', 'cas', 'cac', 'feuille'].includes(normIng) && ['kg', 'g', 'l', 'ml', 'cl'].includes(normMkt)) {
          costForQuantity = 0.050; // Nominal very small amount for pinches/spoons of big-bulk items
        } else if (normIng === 'piece' && normMkt === 'kg') {
          // Assume ~150g per average "piece" of vegetable/fruit
          costForQuantity = (ingredient.quantity * 0.150) * marketPrice.avgPrice;
        } else if (normIng === 'botte' && normMkt === 'kg') {
          // Assume ~200g per average botte of herbs/aromatics
          costForQuantity = (ingredient.quantity * 0.200) * marketPrice.avgPrice;
        } else if (normIng === normMkt) {
          // Both completely unknown, but identically unknown
          costForQuantity = ingredient.quantity * marketPrice.avgPrice;
        } else {
          // Safest to return null rather than risk absurd $3000 price for 200g falling back to `200 * 15 $/kg`
          costForQuantity = null;
        }
      }

      if (costForQuantity !== null) {
        availableCount++;
        totalCost += costForQuantity;
        details.push({
          name: ingredient.name,
          quantity: ingredient.quantity,
          unit: ingredient.unit,
          estimatedCost: costForQuantity,
          marketPrice,
        });
      } else {
        details.push({
          name: ingredient.name,
          quantity: ingredient.quantity,
          unit: ingredient.unit,
          estimatedCost: null,
          marketPrice: null, // Treat as unavailable to maintain accuracy
        });
      }
    } else {
      details.push({
        name: ingredient.name,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        estimatedCost: null,
        marketPrice: null,
      });
    }
  });

  const unavailableCount = ingredients.length - availableCount;

  return {
    // Only yield total cost if we confidently priced at least a portion of it, otherwise null
    totalCost: availableCount > 0 ? totalCost : null,
    details,
    availableCount,
    unavailableCount,
  };
}

/**
 * Format price in dinars
 */
export function formatPrice(price: number): string {
  return `${price.toFixed(3)} DT`;
}

/**
 * Get percentage of recipe ingredients available in market prices
 */
export function getRecipeAvailabilityPercentage(
  ingredients: RecipeIngredient[],
  marketPrices: Map<string, IngredientMarketPrice>
): number {
  if (ingredients.length === 0) return 100;

  let available = 0;
  ingredients.forEach(ing => {
    if (findMarketPrice(ing.name, marketPrices, ing.unit)) {
      available++;
    }
  });

  return Math.round((available / ingredients.length) * 100);
}
