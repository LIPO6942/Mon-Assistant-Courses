/**
 * Community Brands Service
 * 
 * Manages crowdsourced/community brand suggestions in Firestore:
 * - When an individual user adds a brand for an ingredient, it gets recorded in Firestore (anonymously).
 * - Generates a bespoke vector SVG emblem for the brand based on its product domain.
 * - Intelligently proposes the brand to other users when their ingredient is similar (stem/root match & domain guard).
 * - Ranks community suggestions by popularity (usage count).
 */

import { collection, doc, setDoc, increment, onSnapshot, getDocs } from 'firebase/firestore';
import { firestoreDb } from '@/lib/firebase';
import { normalizeIngredientName } from '@/lib/normalization';
import { ProductDomain, detectProductDomain, createDynamicBrandSvgLogo, BrandDef, brandMatchesDomain } from '@/lib/brand-catalog';

export interface CommunityBrandRecord {
  id: string;
  brandName: string;
  ingredientName: string;
  ingredientNormalized: string;
  domain: ProductDomain;
  category?: string;
  popularity: number;
  logoUrl: string;
  updatedAt: string;
}

const COMMUNITY_BRANDS_CACHE_KEY = 'mon_assistant_community_brands_cache_v1';
let inMemoryCommunityBrands: CommunityBrandRecord[] = [];

/**
 * Loads cached community brands from localStorage.
 */
export function getCachedCommunityBrands(): CommunityBrandRecord[] {
  if (inMemoryCommunityBrands.length > 0) return inMemoryCommunityBrands;
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(COMMUNITY_BRANDS_CACHE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      inMemoryCommunityBrands = parsed;
      return parsed;
    }
  } catch (e) {
    console.warn('[CommunityBrands] Error reading cache:', e);
  }
  return [];
}

/**
 * Saves community brands to local cache for instant offline access.
 */
function setCachedCommunityBrands(records: CommunityBrandRecord[]) {
  inMemoryCommunityBrands = records;
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(COMMUNITY_BRANDS_CACHE_KEY, JSON.stringify(records));
  } catch (e) {
    console.warn('[CommunityBrands] Error writing cache:', e);
  }
}

/**
 * Checks if two ingredient names are similar:
 * 1. Strictly isolated by culinary product domain (RICE never matches PASTA, DAIRY never matches WELLNESS).
 * 2. Matches on exact normalized string, substring inclusion, or common token stems (e.g. "riz" in "riz basmati").
 */
export function isIngredientSimilar(
  nameA: string = '',
  nameB: string = '',
  domainA?: ProductDomain | null,
  domainB?: ProductDomain | null
): boolean {
  // Strict domain guard: if both domains are known, they MUST be compatible
  if (domainA && domainB && domainA !== domainB) {
    return false;
  }

  const normA = normalizeIngredientName(nameA);
  const normB = normalizeIngredientName(nameB);

  if (!normA || !normB) return false;

  // 1. Exact normalized match
  if (normA === normB) return true;

  // 2. Direct substring containment (e.g. "riz basmati" contains "riz")
  if (normA.includes(normB) || normB.includes(normA)) {
    // Ensure substring match is on word boundary
    const regexB = new RegExp(`\\b${normB}\\b`, 'i');
    const regexA = new RegExp(`\\b${normA}\\b`, 'i');
    if (regexB.test(normA) || regexA.test(normB)) return true;
  }

  // 3. Shared culinary keyword match (min length 3 to avoid noise like "de", "le")
  const tokensA = normA.split(/\s+/).filter(t => t.length >= 3);
  const tokensB = normB.split(/\s+/).filter(t => t.length >= 3);

  const shared = tokensA.some(t => tokensB.includes(t));
  if (shared && domainA === domainB && domainA !== null && domainA !== undefined) {
    return true;
  }

  return false;
}

/**
 * Publishes a brand added or purchased by a user to the community collection.
 * 100% anonymous (no user ID linked).
 * Increments popularity so frequently used brands appear higher for everyone.
 */
export async function recordCommunityBrand(
  brandName: string,
  ingredientName: string,
  categoryName: string = '',
  ingredientId?: string
): Promise<void> {
  const trimmedBrand = brandName.trim();
  const trimmedIngredient = ingredientName.trim();
  if (!trimmedBrand || !trimmedIngredient) return;

  const domain = detectProductDomain(trimmedIngredient, categoryName) || 'OTHER';
  const normalizedIng = normalizeIngredientName(trimmedIngredient);
  const normalizedBrand = trimmedBrand.toLowerCase().replace(/[^a-z0-9]/g, '');

  if (!normalizedBrand || !normalizedIng) return;

  const docId = `${domain}_${normalizedBrand}_${normalizedIng.replace(/\s+/g, '_')}`.slice(0, 80);
  const logoUrl = createDynamicBrandSvgLogo(trimmedBrand, domain);

  const record: CommunityBrandRecord = {
    id: docId,
    brandName: trimmedBrand,
    ingredientName: trimmedIngredient,
    ingredientNormalized: normalizedIng,
    domain,
    category: categoryName || undefined,
    popularity: 1,
    logoUrl,
    updatedAt: new Date().toISOString()
  };

  // 1. Optimistic update in local cache
  const current = getCachedCommunityBrands();
  const idx = current.findIndex(r => r.id === docId);
  let updatedList: CommunityBrandRecord[];
  if (idx >= 0) {
    updatedList = [...current];
    updatedList[idx] = {
      ...updatedList[idx],
      popularity: (updatedList[idx].popularity || 1) + 1,
      updatedAt: record.updatedAt
    };
  } else {
    updatedList = [record, ...current];
  }
  setCachedCommunityBrands(updatedList);

  // 2. Synchronize to global Firestore collection
  try {
    const docRef = doc(firestoreDb, 'communityBrands', docId);
    await setDoc(docRef, {
      brandName: trimmedBrand,
      ingredientName: trimmedIngredient,
      ingredientNormalized: normalizedIng,
      domain,
      category: categoryName || 'Autre',
      logoUrl,
      popularity: increment(1),
      updatedAt: new Date().toISOString()
    }, { merge: true });
    console.log(`[CommunityBrands] Published/Updated brand "${trimmedBrand}" for "${trimmedIngredient}".`);
  } catch (err) {
    console.warn('[CommunityBrands] Firestore write error (falling back to offline cache):', err);
  }
}

/**
 * Subscribes to real-time community brands updates from Firestore.
 * Automatically refreshes the local cache.
 */
export function listenCommunityBrands(
  onUpdate?: (records: CommunityBrandRecord[]) => void
): () => void {
  if (typeof window === 'undefined') return () => {};

  try {
    const colRef = collection(firestoreDb, 'communityBrands');
    const unsubscribe = onSnapshot(colRef, (snapshot) => {
      const records: CommunityBrandRecord[] = snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          brandName: data.brandName || '',
          ingredientName: data.ingredientName || '',
          ingredientNormalized: data.ingredientNormalized || normalizeIngredientName(data.ingredientName || ''),
          domain: data.domain || 'OTHER',
          category: data.category,
          popularity: Number(data.popularity) || 1,
          logoUrl: data.logoUrl || createDynamicBrandSvgLogo(data.brandName || '', data.domain),
          updatedAt: data.updatedAt || new Date().toISOString()
        };
      });

      // Sort by popularity descending
      records.sort((a, b) => b.popularity - a.popularity);
      setCachedCommunityBrands(records);
      if (onUpdate) onUpdate(records);
    }, (err) => {
      console.warn('[CommunityBrands] Listener error:', err);
    });

    return unsubscribe;
  } catch (err) {
    console.warn('[CommunityBrands] Failed to subscribe:', err);
    return () => {};
  }
}

/**
 * Finds community brands matching a specific ingredient or its culinary domain.
 * Proposes brands added by other users for identical or similar ingredients.
 */
export function getCommunityBrandsForProduct(
  ingredientName: string = '',
  categoryName: string = '',
  detectedDomain?: ProductDomain | null
): BrandDef[] {
  const domain = detectedDomain || detectProductDomain(ingredientName, categoryName);
  const records = getCachedCommunityBrands();
  const candidateMap = new Map<string, { brandDef: BrandDef; popularity: number }>();

  records.forEach(rec => {
    // 1. Strict domain compatibility guard
    if (domain && rec.domain && rec.domain !== domain) {
      return;
    }

    // 2. Similarity check
    const isSimilar = isIngredientSimilar(
      ingredientName,
      rec.ingredientName,
      domain,
      rec.domain
    );

    // Or if same domain with significant community popularity
    const isDomainFallback = Boolean(domain && rec.domain === domain && rec.popularity >= 2);

    if (isSimilar || isDomainFallback) {
      const key = rec.brandName.toLowerCase();
      if (!candidateMap.has(key) || (candidateMap.get(key)!.popularity < rec.popularity)) {
        candidateMap.set(key, {
          brandDef: {
            name: rec.brandName,
            logoUrl: rec.logoUrl || createDynamicBrandSvgLogo(rec.brandName, domain || rec.domain),
            domain: rec.domain || domain || 'OTHER',
            keywords: [key, rec.ingredientNormalized]
          },
          popularity: rec.popularity
        });
      }
    }
  });

  // Sort candidates by community popularity
  return Array.from(candidateMap.values())
    .sort((a, b) => b.popularity - a.popularity)
    .map(c => c.brandDef);
}
