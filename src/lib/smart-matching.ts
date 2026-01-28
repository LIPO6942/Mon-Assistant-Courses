
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
        // 3. Recherche par containment et similarité de mots
        // Ceci permet de matcher "Lait" avec "Lait demi écrémé" ou "Delio" avec "Delio aroma g"
        let bestContainmentMatch: Ingredient | undefined;
        let bestContainmentScore = 0;

        for (const ing of allIngredients) {
            const normIng = normalize(ing.name);
            const ingWords = normIng.split(' ').filter(w => w.length > 2);

            // Priorité absolue : Le nom MAC est un préfixe exact ou contenu exact du nom importé
            // Ex: MAC "Eau" -> Import "Eau Pristine"
            // Ex: MAC "Lait" -> Import "Lait Delice"

            // Score 0.95 : Le nom importé COMMENCE par le nom MAC + espace (ex: "Eau X")
            if (normRaw.startsWith(normIng + ' ') && normIng.length >= 2) {
                if (0.95 > bestContainmentScore) { bestContainmentMatch = ing; bestContainmentScore = 0.95; }
            }
            // Score 0.9 : Le nom MAC est contenu dans le nom importé (ex: "Pack Eau X")
            else if (normRaw.includes(' ' + normIng + ' ') || normRaw.endsWith(' ' + normIng) || normRaw === normIng) {
                if (0.9 > bestContainmentScore) { bestContainmentMatch = ing; bestContainmentScore = 0.9; }
            }
            // Cas simple 'includes' mais attention aux faux positifs courts
            else if (normRaw.includes(normIng) && normIng.length >= 4) {
                if (0.85 > bestContainmentScore) { bestContainmentMatch = ing; bestContainmentScore = 0.85; }
            }
        }

        if (bestContainmentMatch) {
            return { ingredient: bestContainmentMatch, confidence: bestContainmentScore, isAlias: false };
        }

        // 4. Fuzzy Matching (Levenshtein) - pour les fautes de frappe

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
