
import { db } from './idb';
import { Ingredient, ProductAlias } from './types';

/**
 * Calcul de la distance de Levenshtein pour le fuzzy matching
 */
function getLevenshteinDistance(a: string, b: string): number {
    const tmp = [];
    for (let i = 0; i <= a.length; i++) { tmp[i] = [i]; }
    for (let j = 0; j <= b.length; j++) { tmp[0][j] = j; }
    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
            tmp[i][j] = Math.min(
                tmp[i - 1][j] + 1,
                tmp[i][j - 1] + 1,
                tmp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
            );
        }
    }
    return tmp[a.length][b.length];
}

/**
 * Nettoie le nom du produit pour l'affichage et la création (ex: "Spaghetti 500g" -> "Spaghetti")
 */
export function cleanProductName(name: string): string {
    return (name || '')
        .replace(/\b(\d+[\.,]?\d*)\s*(kg|gr|g|ml|lt|l|cl|pcs|piece|u|un|x|pack|promo)\b/gi, '')
        .replace(/\b\d+\b/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

function normalize(text: string): string {
    return (text || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        // Retirer les grammages et unités courantes (ex: 500g, 1L, 2.5kg, x6)
        .replace(/\b(\d+[\.,]?\d*)\s*(kg|gr|g|ml|lt|l|cl|pcs|piece|u|un|x|pack|promo)\b/g, ' ')
        // Retirer les chiffres isolés qui sont souvent des quantités
        .replace(/\b\d+\b/g, ' ')
        .replace(/[^a-z0-9]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Mappage des catégories Lawra9 vers les catégories MAC
 */
export function mapLawra9Category(lawra9Cat: string): string {
    const mapping: Record<string, string> = {
        'Eau': 'Boissons',
        'Boissons': 'Boissons',
        'Frais': 'Produits Laitiers & Oeufs',
        'Pâtes': 'Épicerie Salée',
        'Epicerie Salée': 'Épicerie Salée',
        'Epicerie Sucrée': 'Épicerie Sucrée',
        'Fruits & Légumes': 'Fruits et Légumes',
        'Boucherie & Volaille': 'Viandes et Poissons',
        'Poisson': 'Viandes et Poissons',
        'Boulangerie': 'Boulangerie & Pâtisserie',
        'Entretien': 'Autre',
        'Hygiène': 'Autre',
        'Maison & Divers': 'Autre'
    };

    return mapping[lawra9Cat] || 'Autre';
}

export class SmartMatchingService {
    private static ALIASES_KEY = 'product_aliases';
    private static CUSTOM_INGREDIENTS_KEY = 'custom_ingredients';

    /**
     * Trouve l'ingrédient correspondant à un nom brut de Lawra9
     */
    static async findMatch(rawName: string, allIngredients: Ingredient[]): Promise<{ ingredient?: Ingredient; confidence: number; isAlias: boolean }> {
        const normRaw = normalize(rawName);

        // 1. Vérifier dans les alias enregistrés
        const aliases = await db.get<ProductAlias[]>(this.ALIASES_KEY) || [];
        const alias = aliases.find(a => normalize(a.rawName) === normRaw);
        if (alias) {
            const found = allIngredients.find(i => i.id === alias.ingredientId);
            if (found) return { ingredient: found, confidence: 1, isAlias: true };
        }

        // 2. Recherche exacte sur le nom normalisé
        const exactMatch = allIngredients.find(i => normalize(i.name) === normRaw);
        if (exactMatch) return { ingredient: exactMatch, confidence: 1, isAlias: false };

        // 3. Recherche par containment et similarité de mots
        // Ceci permet de matcher "Lait" avec "Lait demi écrémé" ou "Delio" avec "Delio aroma g"
        const containmentMatch = allIngredients.find(i => {
            const normIng = normalize(i.name);
            const rawWords = normRaw.split(' ').filter(w => w.length > 2);
            const ingWords = normIng.split(' ').filter(w => w.length > 2);

            // Si le nom MAC est contenu dans le nom Lawra9 (ex: "lait" dans "lait demi ecreme")
            if (normRaw.includes(normIng) && normIng.length >= 3) return true;

            // Si le nom Lawra9 est contenu dans le nom MAC
            if (normIng.includes(normRaw) && normRaw.length >= 3) return true;

            // Si le nom Lawra9 commence par le nom MAC (ex: "lait demi ecreme" commence par "lait")
            if (normRaw.startsWith(normIng + ' ') && normIng.length >= 3) return true;

            // Si le nom MAC commence par le nom Lawra9
            if (normIng.startsWith(normRaw + ' ') && normRaw.length >= 3) return true;

            // Si tous les mots significatifs du nom MAC sont dans le nom Lawra9
            if (ingWords.length > 0 && ingWords.every(word => normRaw.includes(word))) return true;

            // Si tous les mots significatifs du nom Lawra9 sont dans le nom MAC
            if (rawWords.length > 0 && rawWords.every(word => normIng.includes(word))) return true;

            return false;
        });

        if (containmentMatch) {
            return { ingredient: containmentMatch, confidence: 0.85, isAlias: false };
        }

        // 4. Fuzzy Matching (Levenshtein) - pour les fautes de frappe
        let bestMatch: Ingredient | undefined;
        let minDistance = Infinity;

        for (const ing of allIngredients) {
            const normIng = normalize(ing.name);
            const distance = getLevenshteinDistance(normRaw, normIng);

            // Seuil plus permissif : la distance doit être < 50% de la longueur du nom
            if (distance < minDistance && distance < normIng.length * 0.5) {
                minDistance = distance;
                bestMatch = ing;
            }
        }

        const confidence = bestMatch ? 1 - (minDistance / Math.max(normRaw.length, normalize(bestMatch.name).length)) : 0;

        return {
            ingredient: bestMatch,
            confidence: confidence,
            isAlias: false
        };
    }

    /**
     * Enregistre un nouvel alias pour le futur
     */
    static async saveAlias(rawName: string, ingredientId: string): Promise<void> {
        const aliases = await db.get<ProductAlias[]>(this.ALIASES_KEY) || [];
        const existingIndex = aliases.findIndex(a => normalize(a.rawName) === normalize(rawName));

        if (existingIndex >= 0) {
            aliases[existingIndex].ingredientId = ingredientId;
        } else {
            aliases.push({
                id: `alias-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                rawName,
                ingredientId
            });
        }
        await db.set(this.ALIASES_KEY, aliases);
    }
}
