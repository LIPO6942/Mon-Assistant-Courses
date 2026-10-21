import { PurchaseHistory } from './types';

export interface BrandDef {
  name: string;
  logoUrl?: string;
  categoryKeys: string[];
}

/**
 * Predefined catalog of recognized brands with high-definition, optimized mini logos/photos.
 */
export const PREDEFINED_BRANDS: BrandDef[] = [
  // --- Produits Laitiers & Fromages ---
  {
    name: 'Délice',
    logoUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=100&auto=format&fit=crop&q=80',
    categoryKeys: ['produits laitiers', 'lait', 'fromage', 'yaourt', 'beurre', 'crème']
  },
  {
    name: 'Vitalait',
    logoUrl: 'https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?w=100&auto=format&fit=crop&q=80',
    categoryKeys: ['produits laitiers', 'lait', 'fromage', 'yaourt', 'beurre']
  },
  {
    name: 'Natilait',
    logoUrl: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=100&auto=format&fit=crop&q=80',
    categoryKeys: ['produits laitiers', 'lait']
  },
  {
    name: 'Président',
    logoUrl: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=100&auto=format&fit=crop&q=80',
    categoryKeys: ['produits laitiers', 'fromage', 'beurre', 'crème']
  },
  {
    name: 'Land\'Or',
    logoUrl: 'https://images.unsplash.com/photo-1618164436241-4473940d1f5c?w=100&auto=format&fit=crop&q=80',
    categoryKeys: ['produits laitiers', 'fromage']
  },
  {
    name: 'Fromital',
    logoUrl: 'https://images.unsplash.com/photo-1552767059-ce182ead6c1b?w=100&auto=format&fit=crop&q=80',
    categoryKeys: ['produits laitiers', 'fromage']
  },

  // --- Pâtes, Riz, Féculents & Farine ---
  {
    name: 'Randa',
    logoUrl: 'https://images.unsplash.com/photo-1621996346565-e3d5d62816f9?w=100&auto=format&fit=crop&q=80',
    categoryKeys: ['pâtes', 'riz', 'féculents', 'farine', 'semoule', 'couscous', 'spaghetti']
  },
  {
    name: 'Warda',
    logoUrl: 'https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=100&auto=format&fit=crop&q=80',
    categoryKeys: ['pâtes', 'riz', 'féculents', 'farine', 'semoule', 'couscous', 'spaghetti']
  },
  {
    name: 'Épi d\'Or',
    logoUrl: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=100&auto=format&fit=crop&q=80',
    categoryKeys: ['pâtes', 'riz', 'féculents', 'farine', 'semoule', 'couscous', 'spaghetti']
  },
  {
    name: 'Diari',
    logoUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=100&auto=format&fit=crop&q=80',
    categoryKeys: ['pâtes', 'couscous', 'semoule', 'féculents']
  },
  {
    name: 'Barilla',
    logoUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=100&auto=format&fit=crop&q=80',
    categoryKeys: ['pâtes', 'spaghetti', 'féculents', 'sauce']
  },
  {
    name: 'De Cecco',
    logoUrl: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=100&auto=format&fit=crop&q=80',
    categoryKeys: ['pâtes', 'spaghetti', 'féculents']
  },

  // --- Huiles, Condiments & Sauces ---
  {
    name: 'Nejma',
    logoUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=100&auto=format&fit=crop&q=80',
    categoryKeys: ['huiles', 'condiments', 'huile']
  },
  {
    name: 'Safir',
    logoUrl: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=100&auto=format&fit=crop&q=80',
    categoryKeys: ['huiles', 'huile d\'olive', 'condiments']
  },
  {
    name: 'Ruspina',
    logoUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=100&auto=format&fit=crop&q=80',
    categoryKeys: ['huiles', 'huile d\'olive']
  },
  {
    name: 'Sicam',
    logoUrl: 'https://images.unsplash.com/photo-1546470427-0d4db154ceb7?w=100&auto=format&fit=crop&q=80',
    categoryKeys: ['sauces', 'tomate', 'harissa', 'conserves', 'condiments']
  },
  {
    name: 'Cap d\'Or',
    logoUrl: 'https://images.unsplash.com/photo-1589135233689-d6528825832a?w=100&auto=format&fit=crop&q=80',
    categoryKeys: ['sauces', 'harissa', 'tomate', 'condiments']
  },
  {
    name: 'Le Phare du Cap Bon',
    logoUrl: 'https://images.unsplash.com/photo-1589135233689-d6528825832a?w=100&auto=format&fit=crop&q=80',
    categoryKeys: ['harissa', 'sauces', 'condiments']
  },

  // --- Eaux & Boissons ---
  {
    name: 'Safia',
    logoUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=100&auto=format&fit=crop&q=80',
    categoryKeys: ['boissons', 'eau', 'eaux']
  },
  {
    name: 'Sabrine',
    logoUrl: 'https://images.unsplash.com/photo-1559839914-17aae19cec71?w=100&auto=format&fit=crop&q=80',
    categoryKeys: ['boissons', 'eau', 'eaux']
  },
  {
    name: 'Marwa',
    logoUrl: 'https://images.unsplash.com/photo-1560023907-5f339617ea30?w=100&auto=format&fit=crop&q=80',
    categoryKeys: ['boissons', 'eau', 'eaux']
  },
  {
    name: 'Melliti',
    logoUrl: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=100&auto=format&fit=crop&q=80',
    categoryKeys: ['boissons', 'eau', 'eaux']
  },
  {
    name: 'Boga',
    logoUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=100&auto=format&fit=crop&q=80',
    categoryKeys: ['boissons', 'soda', 'gazéifiée']
  },
  {
    name: 'Tropico',
    logoUrl: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=100&auto=format&fit=crop&q=80',
    categoryKeys: ['boissons', 'jus']
  },

  // --- Conserves & Épicerie ---
  {
    name: 'Sidi Daoud',
    logoUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=100&auto=format&fit=crop&q=80',
    categoryKeys: ['conserves', 'thon', 'sardine', 'poisson']
  },
  {
    name: 'Manar',
    logoUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=100&auto=format&fit=crop&q=80',
    categoryKeys: ['conserves', 'thon', 'sardine', 'poisson']
  },
  {
    name: 'Jouda',
    logoUrl: 'https://images.unsplash.com/photo-1546470427-0d4db154ceb7?w=100&auto=format&fit=crop&q=80',
    categoryKeys: ['conserves', 'confiture', 'tomate']
  },

  // --- Café, Thé & Petit Déjeuner ---
  {
    name: 'Ben Yedder',
    logoUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=100&auto=format&fit=crop&q=80',
    categoryKeys: ['café', 'petit déjeuner', 'boissons chaudes', 'épicerie']
  },
  {
    name: 'Bondin',
    logoUrl: 'https://images.unsplash.com/photo-1498804103079-a6351b050096?w=100&auto=format&fit=crop&q=80',
    categoryKeys: ['café', 'petit déjeuner', 'boissons chaudes', 'épicerie']
  },
  {
    name: 'Saida',
    logoUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=100&auto=format&fit=crop&q=80',
    categoryKeys: ['biscuits', 'petit déjeuner', 'gâteau', 'épicerie']
  },
  {
    name: 'Moulin d\'Or',
    logoUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=100&auto=format&fit=crop&q=80',
    categoryKeys: ['pain', 'boulangerie', 'gâteau', 'viennoiserie', 'petit déjeuner']
  }
];

const CUSTOM_BRANDS_STORAGE_KEY = 'mon_assistant_custom_brands_v1';

export function getCustomBrands(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CUSTOM_BRANDS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomBrand(brandName: string): void {
  if (typeof window === 'undefined') return;
  const trimmed = brandName.trim();
  if (!trimmed) return;
  try {
    const existing = getCustomBrands();
    if (!existing.some(b => b.toLowerCase() === trimmed.toLowerCase())) {
      const updated = [...existing, trimmed];
      localStorage.setItem(CUSTOM_BRANDS_STORAGE_KEY, JSON.stringify(updated));
    }
  } catch (err) {
    console.error('Error saving custom brand:', err);
  }
}

/**
 * Returns sorted brands for a specific product and category:
 * The most frequently purchased brand by the user is ALWAYS ranked #1!
 */
export function getSortedBrandsForProduct(
  ingredientId: string,
  ingredientName: string,
  categoryName: string,
  purchaseHistory: PurchaseHistory,
  userCustomBrands: string[] = []
): BrandDef[] {
  const normCategory = (categoryName || '').toLowerCase().trim();
  const normName = (ingredientName || '').toLowerCase().trim();

  // 1. Calculate user purchase frequency for each brand on this ingredient
  const brandFrequency: Record<string, number> = {};
  const ingredientHistory = purchaseHistory[ingredientId] || [];

  ingredientHistory.forEach(record => {
    if (record.brand && record.brand.trim()) {
      const b = record.brand.trim();
      brandFrequency[b] = (brandFrequency[b] || 0) + 1;
    }
  });

  // Also check other ingredients in the same category to give context
  Object.values(purchaseHistory).forEach(records => {
    records.forEach(r => {
      if (r.brand && r.brand.trim()) {
        const b = r.brand.trim();
        // Light weight for general brand usage
        brandFrequency[b] = (brandFrequency[b] || 0) + 0.1;
      }
    });
  });

  // 2. Filter predefined brands matching category or ingredient name
  const candidateMap = new Map<string, BrandDef>();

  PREDEFINED_BRANDS.forEach(def => {
    const matchesCategory = def.categoryKeys.some(key => normCategory.includes(key) || key.includes(normCategory));
    const matchesIngredient = def.categoryKeys.some(key => normName.includes(key));
    if (matchesCategory || matchesIngredient) {
      candidateMap.set(def.name.toLowerCase(), def);
    }
  });

  // Add custom brands saved by user
  userCustomBrands.forEach(b => {
    const key = b.toLowerCase();
    if (!candidateMap.has(key)) {
      candidateMap.set(key, {
        name: b,
        categoryKeys: [normCategory]
      });
    }
  });

  // Also include any brand previously recorded in history for this product
  Object.keys(brandFrequency).forEach(brandName => {
    const key = brandName.toLowerCase();
    if (!candidateMap.has(key)) {
      candidateMap.set(key, {
        name: brandName,
        categoryKeys: [normCategory]
      });
    }
  });

  // 3. Convert to array and sort descending by frequency:
  // "toujours le premier c'est le plus utilisé par l'utilisateur etc.."
  const sorted = Array.from(candidateMap.values()).sort((a, b) => {
    const freqA = brandFrequency[a.name] || 0;
    const freqB = brandFrequency[b.name] || 0;
    if (freqB !== freqA) {
      return freqB - freqA; // highest frequency first
    }
    return a.name.localeCompare(b.name);
  });

  return sorted;
}
