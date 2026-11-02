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
 * Supprime grammages, unités et nombres isolés.
 */
export function cleanProductName(name: string): string {
    return (name || '')
        .replace(/\b(\d+[\.,]?\d*)\s*(kg|gr|g|ml|lt|l|cl|pcs|piece|u|un|x|pack|promo)\b/gi, '')
        .replace(/\b\d+\b/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Mots-clés de "bruit de ticket" qui ne sont pas des produits alimentaires.
 * Retourne true si la ligne doit être ignorée lors de la synchronisation garde-manger.
 */
const RECEIPT_NOISE_KEYWORDS = [
    'timbre', 'droit timbre', 'droit de timbre', 'tva', 'taxe', 'remise',
    'reduction', 'reduction', 'avoir', 'total', 'sous-total', 'sous total',
    'escompte', 'fidelite', 'fidelite', 'point fidel', 'points fid',
    'frais livraison', 'frais de port', 'sac', 'emballage',
    'ticket', 'recu', 'recu', 'caisse',
];

export function isReceiptNoise(label: string): boolean {
    const normalized = (label || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();
    return RECEIPT_NOISE_KEYWORDS.some(kw => {
        const normKw = kw.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return normalized === normKw || normalized.startsWith(normKw + ' ');
    });
}

/**
 * Nettoie un libellé de ticket brut pour proposer un nom produit lisible :
 * - Supprime le grammage en début (ex: "330G PATE A TARTIN" -> "Pate A Tartin")
 * - Supprime les unités en fin de chaîne
 * - Met en forme Title Case si tout est en majuscules
 */
export function cleanReceiptLabel(rawLabel: string): string {
    let name = (rawLabel || '').trim();

    // Supprimer les patterns de grammage en début : ex "330G", "2L", "25CL"
    name = name.replace(/^\d+[\.,]?\d*\s*(kg|gr|g|ml|lt|l|cl|pcs|u|un|x)\s*/gi, '');
    // Supprimer les grammages en fin
    name = name.replace(/\s+\d+[\.,]?\d*\s*(kg|gr|g|ml|lt|l|cl|pcs|u|un|x)\s*$/gi, '');
    // Supprimer les codes numériques longs (ex: codes PLU "12345")
    name = name.replace(/\b\d{3,}\b/g, '');
    name = name.replace(/\s+/g, ' ').trim();

    // Mettre en Title Case si tout est en majuscules
    if (name === name.toUpperCase() && name.length > 2) {
        name = name
            .toLowerCase()
            .replace(/(^|\s)\S/g, (c) => c.toUpperCase());
    }

    return name.trim();
}

/**
 * Normalisation avancée avec lemmatisation du pluriel français ('s' ou 'x' terminaux)
 */
function stemWord(w: string): string {
    if (w.length > 3) {
        if (w.endsWith('s') || w.endsWith('x')) {
            return w.slice(0, -1);
        }
    }
    return w;
}

export function normalize(text: string): string {
    const raw = (text || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        // Retirer les grammages et unités courantes (ex: 500g, 1L, 2.5kg, x6)
        .replace(/\b(\d+[\.,]?\d*)\s*(kg|gr|g|ml|lt|l|cl|pcs|piece|u|un|x|pack|promo|bt|bte|bouteille|sachet)\b/g, ' ')
        // Retirer les chiffres isolés qui sont souvent des quantités
        .replace(/\b\d+\b/g, ' ')
        .replace(/[^a-z0-9]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    return raw.split(' ').map(stemWord).join(' ');
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
     * Trouve l'ingrédient correspondant à un nom brut de Lawra9 ou d'un ticket
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
        let bestContainmentMatch: Ingredient | undefined;
        let bestContainmentScore = 0;

        for (const ing of allIngredients) {
            const normIng = normalize(ing.name);

            // Priorité absolue : Le nom MAC est un préfixe exact ou contenu exact du nom importé
            if (normRaw.startsWith(normIng + ' ') && normIng.length >= 2) {
                if (0.95 > bestContainmentScore) { bestContainmentMatch = ing; bestContainmentScore = 0.95; }
            }
            else if (normRaw.includes(' ' + normIng + ' ') || normRaw.endsWith(' ' + normIng) || normRaw === normIng) {
                if (0.9 > bestContainmentScore) { bestContainmentMatch = ing; bestContainmentScore = 0.9; }
            }
            else if (normRaw.includes(normIng) && normIng.length >= 4) {
                if (0.85 > bestContainmentScore) { bestContainmentMatch = ing; bestContainmentScore = 0.85; }
            }
        }

        if (bestContainmentMatch) {
            return { ingredient: bestContainmentMatch, confidence: bestContainmentScore, isAlias: false };
        }

        // 4. Fuzzy Matching (Levenshtein)
        let bestMatch: Ingredient | undefined;
        let bestScore = 0;

        for (const ing of allIngredients) {
            const normIng = normalize(ing.name);

            const lenRatio = Math.min(normRaw.length, normIng.length) / Math.max(normRaw.length, normIng.length);
            if (lenRatio < 0.5) continue;

            const rawWords = normRaw.split(' ').filter(w => w.length >= 3);
            const ingWords = normIng.split(' ').filter(w => w.length >= 3);
            const hasCommonWord = rawWords.some(w => ingWords.some(iw => iw === w || iw.startsWith(w) || w.startsWith(iw)));
            if (!hasCommonWord) continue;

            const distance = getLevenshteinDistance(normRaw, normIng);
            const maxLength = Math.max(normRaw.length, normIng.length);
            const score = maxLength === 0 ? 0 : 1 - (distance / maxLength);

            if (score > bestScore) {
                bestScore = score;
                bestMatch = ing;
            }
        }

        if (bestScore < 0.65) {
            return { ingredient: undefined, confidence: 0, isAlias: false };
        }

        return {
            ingredient: bestMatch,
            confidence: bestScore,
            isAlias: false
        };
    }

    /**
     * Recherche haute fidélité pour faire correspondre un libellé de ticket à un article du panier
     */
    static async findMatchInBasket<T extends { id: string; name: string }>(
        rawLabel: string,
        items: T[]
    ): Promise<{ item?: T; confidence: number }> {
        if (!items || items.length === 0) return { confidence: 0 };

        const normRaw = normalize(rawLabel);

        // 1. Alias connus
        const aliases = await db.get<ProductAlias[]>(this.ALIASES_KEY) || [];
        const alias = aliases.find(a => normalize(a.rawName) === normRaw);
        if (alias) {
            const found = items.find(i => i.id === alias.ingredientId);
            if (found) return { item: found, confidence: 1 };
        }

        // 2. Égalité exacte après normalisation & lemmatisation (ex: "Tomates" == "Tomate")
        const exact = items.find(i => normalize(i.name) === normRaw);
        if (exact) return { item: exact, confidence: 1 };

        // 3. Containment strict
        let bestContainment: T | undefined;
        let bestContainmentScore = 0;

        for (const it of items) {
            const normIt = normalize(it.name);
            if (normRaw.startsWith(normIt + ' ') && normIt.length >= 2) {
                if (0.95 > bestContainmentScore) { bestContainment = it; bestContainmentScore = 0.95; }
            } else if (normRaw.includes(' ' + normIt + ' ') || normRaw.endsWith(' ' + normIt)) {
                if (0.9 > bestContainmentScore) { bestContainment = it; bestContainmentScore = 0.9; }
            } else if (normRaw.includes(normIt) && normIt.length >= 4) {
                if (0.85 > bestContainmentScore) { bestContainment = it; bestContainmentScore = 0.85; }
            } else if (normIt.includes(normRaw) && normRaw.length >= 4) {
                if (0.85 > bestContainmentScore) { bestContainment = it; bestContainmentScore = 0.85; }
            }
        }

        if (bestContainment) {
            return { item: bestContainment, confidence: bestContainmentScore };
        }

        // 4. Fuzzy Levenshtein avec filtre de mot en commun
        let bestMatch: T | undefined;
        let bestScore = 0;

        for (const it of items) {
            const normIt = normalize(it.name);
            const lenRatio = Math.min(normRaw.length, normIt.length) / Math.max(normRaw.length, normIt.length);
            if (lenRatio < 0.45) continue;

            const rawWords = normRaw.split(' ').filter(w => w.length >= 3);
            const itWords = normIt.split(' ').filter(w => w.length >= 3);
            const hasCommonWord = rawWords.some(w => itWords.some(iw => iw === w || iw.startsWith(w) || w.startsWith(iw)));
            if (!hasCommonWord) continue;

            const dist = getLevenshteinDistance(normRaw, normIt);
            const maxL = Math.max(normRaw.length, normIt.length);
            const score = maxL === 0 ? 0 : 1 - (dist / maxL);

            if (score > bestScore) {
                bestScore = score;
                bestMatch = it;
            }
        }

        if (bestScore >= 0.60 && bestMatch) {
            return { item: bestMatch, confidence: bestScore };
        }

        return { item: undefined, confidence: 0 };
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
