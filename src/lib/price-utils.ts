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

/**
 * Find best matching market price for an ingredient
 * Tries exact match first, then fuzzy matching
 */
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

  for (const [_, price] of marketPrices.entries()) {
    const priceName = price.name.toLowerCase();
    
    // Calculate similarity score (word overlap)
    const searchWords = searchName.split(/\s+/);
    const priceWords = priceName.split(/\s+/);
    
    let score = 0;
    searchWords.forEach(word => {
      if (priceWords.some(pw => pw.includes(word) || word.includes(pw))) {
        score++;
      }
    });

    if (score > bestScore) {
      bestScore = score;
      bestMatch = price;
    }
  }

  return bestScore > 0 ? bestMatch : null;
}

/**
 * Convert between compatible units (e.g., kg to g, L to ml)
 * Returns conversion factor or null if units are incompatible
 */
export function getUnitConversionFactor(fromUnit: string, toUnit: string): number | null {
  const conversions: Record<string, Record<string, number>> = {
    // Weight conversions (to grams)
    kg: { g: 1000, kg: 1 },
    g: { kg: 0.001, g: 1 },
    
    // Volume conversions (to milliliters)
    L: { ml: 1000, L: 1 },
    ml: { L: 0.001, ml: 1 },
    
    // Count/piece (no conversion)
    pièce: { pièce: 1 },
    
    // Generic containers
    boîte: { boîte: 1 },
    paquet: { paquet: 1 },
    Sachet: { Sachet: 1 },
    Bouteille: { Bouteille: 1 },
    Pot: { Pot: 1 },
  };

  if (conversions[fromUnit] && conversions[fromUnit][toUnit]) {
    return conversions[fromUnit][toUnit];
  }

  return null;
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
      availableCount++;
      
      // Try to convert units if they don't match
      let costForQuantity = ingredient.quantity * marketPrice.avgPrice;

      // If units don't match exactly, try conversion
      if (ingredient.unit !== marketPrice.unit) {
        const conversionFactor = getUnitConversionFactor(ingredient.unit, marketPrice.unit);
        if (conversionFactor) {
          // Convert ingredient quantity to market price unit
          const convertedQuantity = ingredient.quantity * conversionFactor;
          costForQuantity = convertedQuantity * marketPrice.avgPrice;
        }
        // If conversion fails, use original calculation
      }

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
        marketPrice: null,
      });
    }
  });

  const unavailableCount = ingredients.length - availableCount;

  return {
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
