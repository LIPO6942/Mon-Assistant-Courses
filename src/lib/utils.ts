import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { PurchaseRecord, DbaratiItem } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Calcule le statut dynamique d'un produit (Vert / Orange / Rouge)
 * en combinant le comportement d'achat (fréquence calendaire)
 * et le comportement de préparation culinaire réel (Dbarati).
 */
export function getProductStatus(
  history: PurchaseRecord[] | undefined,
  ingredientName?: string,
  dbaratiItems?: DbaratiItem[]
): 'green' | 'orange' | 'red' | null {
  if (!history || history.length === 0) return null;

  const sortedHistory = [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const lastPurchase = new Date(sortedHistory[sortedHistory.length - 1].date);
  const now = new Date();
  const diffDays = Math.max(0, (now.getTime() - lastPurchase.getTime()) / (1000 * 60 * 60 * 24));

  // Calcul de l'intervalle moyen d'achat
  let avgInterval = 7;
  const hasMultiplePurchases = sortedHistory.length >= 2;
  if (hasMultiplePurchases) {
    let totalDays = 0;
    for (let i = 1; i < sortedHistory.length; i++) {
      const prev = new Date(sortedHistory[i - 1].date);
      const curr = new Date(sortedHistory[i].date);
      totalDays += (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
    }
    avgInterval = totalDays / (sortedHistory.length - 1);
    if (avgInterval <= 0) avgInterval = 7;
  }

  // --- ANALYSE CULINAIRE COMBINÉE (Dbarati) ---
  if (ingredientName && dbaratiItems && dbaratiItems.length > 0) {
    const ingredientTokens = extractSignificantTokens(ingredientName);

    if (ingredientTokens.length > 0) {
      // Trouver tous les plats Dbarati qui utilisent cet ingrédient
      const matchingDishes = dbaratiItems.filter(dish => {
        if (!dish.text) return false;
        const dishTokens = extractSignificantTokens(dish.text);
        if (dishTokens.length === 0) return false;

        return ingredientTokens.some(ingTok => {
          if (ingTok.length < 3) return false;
          return dishTokens.some(dt => dt.includes(ingTok) || ingTok.includes(dt));
        });
      });

      if (matchingDishes.length > 0) {
        // Collecter toutes les dates de préparation de ces plats
        const allPrepDates: Date[] = [];
        matchingDishes.forEach(dish => {
          const dates = dish.prepHistory && dish.prepHistory.length > 0
            ? dish.prepHistory
            : (dish.lastPreparedAt ? [dish.lastPreparedAt] : []);

          dates.forEach(d => {
            const parsed = new Date(d);
            if (!isNaN(parsed.getTime())) {
              allPrepDates.push(parsed);
            }
          });
        });

        // 1. Nombre de préparations depuis le dernier achat
        const prepsSincePurchase = allPrepDates.filter(d => d.getTime() >= lastPurchase.getTime()).length;

        // 2. Déterminer le ratio attendu de préparations par achat
        let expectedPrepsPerPurchase = 3; // Réserve standard moyenne (ex: paquet ou portionnage frigo/congélo)
        if (sortedHistory.length >= 1 && allPrepDates.length > 0) {
          const observedRatio = allPrepDates.length / sortedHistory.length;
          if (observedRatio >= 1) {
            expectedPrepsPerPurchase = Math.max(1, Math.round(observedRatio));
          }
        }

        // --- ARBITRAGE INTELLIGENT (CALENDRIER vs PRÉPARATION RÉELLE) ---

        // Cas 1 : Toutes les préparations attendues ont été cuisinées
        // -> Le stock a été consommé, même si l'achat est récent !
        if (prepsSincePurchase >= expectedPrepsPerPurchase) {
          return 'red';
        }

        // Cas 2 : Presque toutes les préparations ont été cuisinées (dernière portion restante)
        if (prepsSincePurchase >= Math.max(1, expectedPrepsPerPurchase - 1) && prepsSincePurchase > 0) {
          return 'orange';
        }

        // Cas 3 : La préparation réelle protège les produits stockés/congelés
        // Si le calendrier est avancé (diffDays >= avgInterval), mais que l'utilisateur
        // n'a PAS cuisiné ou très peu cuisiné ce produit (il dort au congélateur ou au placard) :
        if (diffDays >= avgInterval * 1.5) {
          // L'ingrédient est stocké sans avoir été épuisé en cuisine
          // On le maintient en ORANGE (rappel intelligent) mais PAS en rupture RED !
          return 'orange';
        }

        if (diffDays >= avgInterval) {
          return 'orange';
        }

        // S'il reste des préparations disponibles et que le calendrier est normal
        return 'green';
      }
    }
  }

  // --- MODÈLE CALENDAIRE PUR (Fallback si pas de données Dbarati correspondantes) ---
  if (diffDays < 7) return 'green';
  if (!hasMultiplePurchases) return null;

  if (diffDays >= avgInterval && diffDays < avgInterval * 1.5) return 'orange';
  if (diffDays >= avgInterval * 1.5) return 'red';

  return 'green';
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

export function normalizeSearchText(str: string | undefined | null): string {
  if (!str || typeof str !== 'string') return '';
  try {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // supprime les accents
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')   // remplace la ponctuation par des espaces
      .trim()
      .replace(/\s+/g, ' ');
  } catch (_) {
    return '';
  }
}

function stemWord(word: string): string {
  if (typeof word === 'string' && word.length > 3 && (word.endsWith('s') || word.endsWith('x'))) {
    return word.slice(0, -1);
  }
  return word || '';
}

export function extractSignificantTokens(str: string | undefined | null): string[] {
  if (!str || typeof str !== 'string') return [];
  try {
    const norm = normalizeSearchText(str);
    if (!norm) return [];
    return norm
      .split(' ')
      .filter(token => token && token.length >= 2 && !STOP_WORDS.has(token))
      .map(stemWord);
  } catch (_) {
    return [];
  }
}

export function formatCompactRelativeDate(isoDate?: string | null): string | null {
  if (!isoDate || typeof isoDate !== 'string') return null;
  try {
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
  } catch (_) {
    return null;
  }
}

/**
 * Formate une date pour Dbarati avec le jour de la semaine abrégé en petit (lun., mar., mer., etc.)
 * Format compact en français, ex: "mar. 27 oct." ou "mar. 27 oct. 26"
 */
export function formatDbaratiDate(
  isoDate?: string | null,
  options?: { withYear?: boolean }
): string {
  if (!isoDate || typeof isoDate !== 'string') return '';
  try {
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) return '';

    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      ...(options?.withYear ? { year: '2-digit' } : {}),
    }).format(date);
  } catch (_) {
    return '';
  }
}

// --- PRODUITS EXCLUS DU MARCHÉ PUBLIC (HYGIÈNE INTIME, SOUS-VÊTEMENTS, PRÉSERVATIFS) ---
// Note : Les articles bébés sont expressément CONSERVÉS.
export function isExcludedFromMarketPrices(
  name: string | undefined | null,
  category?: string | null
): boolean {
  if (!name || typeof name !== 'string') return false;

  const raw = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  const cat = (category || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

  // RÈGLE PRIORITAIRE : TOUS LES ARTICLES BÉBÉ DOIVENT ÊTRE CONSERVÉS (GARDÉS)
  const isBabyItem =
    /\b(bebe|baby|nourrisson|infantile|maternite|pampers|huggies)\b/i.test(raw) ||
    /\b(bebe|baby|nourrisson|infantile)\b/i.test(cat);

  if (isBabyItem) {
    return false;
  }

  // Catégories intimes / lingerie
  if (/\b(intime|lingerie|sous[- ]vetement|protection feminine)\b/i.test(cat)) {
    return true;
  }

  // Exception : serviette de table ou serviette en papier (articles de table / ménage, non intimes)
  if (/\bserviette(s)?\b/i.test(raw) && /\b(table|papier|bain)\b/i.test(raw)) {
    return false;
  }

  // LISTE DES ARTICLES MASQUÉS (intime, hygiène féminine, sous-vêtements, préservatifs)
  const EXCLUDED_PATTERNS = [
    // 1. Serviettes et protections hygiéniques féminines (y compris coquilles usuelles comme 'alwayas')
    /\bserviette(s)?\b/i,
    /\bhygienique(s)?\b/i,
    /\balway(a)?s\b/i,
    /\b(nana|vania|tampax|kotex|femfresh|intima)\b/i,
    /\btampon(s)?\b/i,
    /\bprotege[- ]?slip(s)?\b/i,
    /\b(menstruel|menstruelle|menstruation|coupe menstruelle)\b/i,

    // 2. Sous-vêtements & lingerie
    /\bslip(s)?\b/i,
    /\bculotte(s)?\b/i,
    /\bboxer(s)?\b/i,
    /\bcalecon(s)?\b/i,
    /\bstring(s)?\b/i,
    /\bsoutien[- ]gorge(s)?\b/i,
    /\bbrassiere(s)?\b/i,
    /\blingerie\b/i,
    /\bsous[- ]vetement(s)?\b/i,

    // 3. Préservatifs et santé sexuelle / intime
    /\bpreservatif(s)?\b/i,
    /\bcondom(s)?\b/i,
    /\b(durex|manix|skyn)\b/i,
    /\blubrifiant[- ]intime\b/i,
    /\bgel[- ]intime\b/i,
  ];

  return EXCLUDED_PATTERNS.some(pattern => pattern.test(raw));
}

// --- PRODUITS NON-ALIMENTAIRES EXCLUS DE CH3ANDEK (BIEN-ÊTRE & MAISON / PILES / ETC.) ---
export function isNonFoodItem(
  name: string | undefined | null,
  category?: string | null
): boolean {
  const raw = (name || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  const cat = (category || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

  // 1. Catégories non-alimentaires (Maison, Entretien, Bien-être, etc.)
  const NON_FOOD_CATEGORIES = [
    /\bmaison\b/i,
    /\b(bien[- ]?etre)\b/i,
    /\b(medicament|medicaments|pharmacie|parapharmacie)\b/i,
    /\b(soin|soins|produits? de soin)\b/i,
    /\b(beaute|cosmetique|cosmetiques)\b/i,
    /\b(hygiene)\b/i,
    /\b(entretien|nettoyage|menage|droguerie)\b/i,
    /\b(bricolage|quincaillerie|electronique|electromenager|bazar)\b/i,
    /\b(animaux|animalerie)\b/i,
    /\b(fourniture|fournitures|papeterie)\b/i,
    // Boissons & Eaux prêtes à boire (exclues des ingrédients culinaires Ch3andek)
    /\b(eau|eaux|boisson|boissons|jus|soda|sodas)\b/i,
    // Biscuits, Goûters & Pâtisseries industrielles
    /\b(biscuit|biscuits|snack|snacks|gouter|viennoiserie|confiserie)\b/i,
  ];

  if (cat && NON_FOOD_CATEGORIES.some(pattern => pattern.test(cat))) {
    return true;
  }

  if (!raw) return false;

  // 2. Mots-clés d'articles non-alimentaires (Produits maison, piles, bien-être, etc.)
  const NON_FOOD_NAME_PATTERNS = [
    // Électronique, bricolage & maison
    /\bpile(s)?\b/i,
    /\bbatterie(s)?\b/i,
    /\baccu(s)?\b/i,
    /\bampoule(s)?\b/i,
    /\bchargeur(s)?\b/i,
    /\bcable(s)?\b/i,
    /\ballumette(s)?\b/i,
    /\bbriquet(s)?\b/i,
    /\bbougie(s)?\b/i,

    // Entretien, ménage & produits maison
    /\blessive(s)?\b/i,
    /\badoucissant(s)?\b/i,
    /\bassouplissant(s)?\b/i,
    /\bjavel\b/i,
    /\bliquide vaisselle\b/i,
    /\bpastille(s)? vaisselle\b/i,
    /\btablette(s)? (lave[- ]?)?vaisselle\b/i,
    /\bdetergent(s)?\b/i,
    /\bnettoyant(s)?\b/i,
    /\bdegraissant(s)?\b/i,
    /\bdesinfectant(s)?\b/i,
    /\banticalcaire\b/i,
    /\bdetartrant\b/i,
    /\beponge(s)?\b/i,
    /\bchiffon(s)?\b/i,
    /\blavette(s)?\b/i,
    /\bserpilliere(s)?\b/i,
    /\bserpillere(s)?\b/i,
    /\bbalai(s)?\b/i,
    /\bsac(s)? poubelle(s)?\b/i,
    /\bsac(s)? congelation\b/i,
    /\bfilm etirable\b/i,
    /\bpapier alu(minium)?\b/i,
    /\bpapier cuisson\b/i,
    /\bdesodorisant(s)?\b/i,
    /\banti[- ]moustique(s)?\b/i,
    /\binsecticide(s)?\b/i,

    // Hygiène & Bien-être
    /\bsavon(s)?\b/i,
    /\bshampoing(s)?\b/i,
    /\bshampooing(s)?\b/i,
    /\bapres[- ]shampoing(s)?\b/i,
    /\bgel douche\b/i,
    /\bdentifrice(s)?\b/i,
    /\bbrosse(s)? a dents?\b/i,
    /\bbain de bouche\b/i,
    /\bfil dentaire\b/i,
    /\bcoton(s)?\b/i,
    /\bcoton[- ]tige(s)?\b/i,
    /\bdeodorant(s)?\b/i,
    /\bparfum(s)?\b/i,
    /\beau de toilette\b/i,
    /\bcreme (solaire|visage|corps|mains|hydratante|anti[- ]age|nivea|de beaute)\b/i,
    /\bbaume a levres\b/i,
    /\bmouchoir(s)?\b/i,
    /\bpapier toilette\b/i,
    /\bpapier hygienique\b/i,
    /\bsopalin\b/i,
    /\bessuie[- ]tout\b/i,
    /\bserviette(s)? hygienique(s)?\b/i,
    /\btampon(s)?\b/i,
    /\bprotege[- ]slip(s)?\b/i,
    /\bcouche(s)?\b/i,
    /\blingette(s)?\b/i,
    /\brasoir(s)?\b/i,
    /\blame(s)? de rasoir\b/i,
    /\bmousse a raser\b/i,
    /\bpreservatif(s)?\b/i,
    /\bcondom(s)?\b/i,
    /\blubrifiant(s)?\b/i,

    // Santé & Médicaments
    /\bmedicament(s)?\b/i,
    /\bdoliprane\b/i,
    /\bparacetamol\b/i,
    /\befferalgan\b/i,
    /\baspirine\b/i,
    /\bibuprofene\b/i,
    /\bpansement(s)?\b/i,
    /\bbandage(s)?\b/i,
    /\bcompresse(s)?\b/i,
    /\bsparadrap\b/i,
    /\balcool a 70\b/i,
    /\bbetadine\b/i,
    /\bvitamine(s)?\b/i,
    /\bcomplement(s)? alimentaire(s)?\b/i,

    // Boissons & Eaux prêtes à consommer (non cuisinables dans Ch3andek)
    /\beau(x)?\b/i,
    /\b(safia|sabrine|marwa|melliti|fourat|jannet|hayat|denia|cristaline)\b/i,
    /\bjus\b/i,
    /\b(tropico|viva|boga|coca[- ]?cola|fanta|sprite|pepsi|apla|schweppes|ice[- ]?tea|red[- ]?bull|orangina)\b/i,
    /\bsoda(s)?\b/i,
    /\bboisson(s)? (gazeuse|energisante|sucree|rafraichissante)?\b/i,
    /\bsirop(s)?\b/i,

    // Biscuits, Sablito, Cakes et Pâtisseries industrielles prêtes à consommer
    /\bbiscuit(s)?\b/i,
    /\b(sablito|major|prince|oreo|bimo|saida|chocotom|krakou|tuc|lu)\b/i,
    /\bgaufrette(s)?\b/i,
    /\bcake(s)?\b/i,
    /\bmuffin(s)?\b/i,
    /\bmadeleine(s)?\b/i,
    /\bcroissant(s)?\b/i,
    /\bpain au chocolat\b/i,
    /\bviennoiserie(s)?\b/i,
    /\bchips\b/i,
    /\bbonbon(s)?\b/i,
  ];

  return NON_FOOD_NAME_PATTERNS.some(pattern => pattern.test(raw));
}

// --- NORMALISATION PHONÉTIQUE ET DIALECTALE DE LA CUISINE TUNISIENNE ---

export const TUNISIAN_CULINARY_ALIASES: Record<string, string[]> = {
  'nouasser': ['nwasser', 'nwaser', 'nouaser', 'nwassar'],
  'nwasser': ['nouasser', 'nwaser', 'nouaser', 'nwassar'],
  'couscous': ['kosksi', 'kouskous', 'kousseksi', 'kesksou'],
  'kosksi': ['couscous', 'kouskous', 'kousseksi'],
  'kouskous': ['couscous', 'kosksi', 'kousseksi'],
  'makrouna': ['macaroni', 'pates', 'ma9rouna', 'pasta'],
  'pates': ['makrouna', 'macaroni', 'pasta', 'ma9rouna'],
  'chorba': ['shorba', 'chourba', 'tchiche'],
  'shorba': ['chorba', 'chourba', 'tchiche'],
  'dwida': ['douida', 'dweeda'],
  'douida': ['dwida', 'dweeda'],
  'rechta': ['richta', 'rekhta'],
  'richta': ['rechta', 'rekhta'],
  'chakhchoukha': ['chakhchouka', 'chekhechoukha'],
  'chakhchouka': ['chakhchoukha', 'chekhechoukha'],
  'kafteji': ['kefteji', 'kaftaji', 'keftejy'],
  'kefteji': ['kafteji', 'kaftaji', 'keftejy'],
  'lablebi': ['lablabi'],
  'lablabi': ['lablebi'],
  'ojja': ['ojjet', 'odja'],
  'ojjet': ['ojja', 'odja'],
  'kamounia': ['kamouniet', 'kamounya'],
  'kamouniet': ['kamounia', 'kamounya'],
  'madfouna': ['madfounet'],
  'madfounet': ['madfouna'],
  'rouz': ['riz', 'roz'],
  'riz': ['rouz', 'roz'],
  'borghol': ['boulgour', 'burgul'],
  'tajine': ['tagine'],
  'tagine': ['tajine'],
  'slata': ['salade', 'salata'],
  'salade': ['slata', 'salata'],
  'brik': ['briek', 'borek', 'malsouka'],
  'malsouka': ['brik', 'dioul'],
};

export function normalizeDialectFoodText(str: string | undefined | null): string {
  if (!str || typeof str !== 'string') return '';
  let s = normalizeSearchText(str);
  if (!s) return '';

  // Supprimer les qualificatifs de garniture usuels dans les plats pour isoler la base
  const fillers = [
    'au poulet', 'a la viande', 'bel allouch', 'bil allouch', 'allouch', 'agneau',
    'bil hout', 'bel hout', 'au poisson', 'au thon', 'bil djedj', 'bel djedj', 'djedj',
    'au four', 'tunisien', 'tunisienne', 'traditionnel', 'maison', 'sauce rouge', 'sauce blanche',
    'aux legumes', 'escalope', 'merguez', 'kadid', 'osban'
  ];
  for (const f of fillers) {
    s = s.replace(new RegExp(`\\b${f}\\b`, 'g'), ' ');
  }

  // 1. Arabizi et consonnes phonétiquement équivalentes
  s = s.replace(/9/g, 'k')
       .replace(/q/g, 'k')
       .replace(/c(?=[aou])/g, 'k')
       .replace(/ch/g, 'sh')
       .replace(/5/g, 'kh')
       .replace(/7/g, 'h')
       .replace(/3/g, 'a');

  // 2. Équivalence phonétique maghrébine : 'ou' <-> 'w'
  s = s.replace(/ou/g, 'w');

  // 3. Réduction des consonnes doubles (ex: ss -> s, tt -> t, nn -> n, mm -> m, rr -> r)
  s = s.replace(/([a-z])\1+/g, '$1');

  // 4. Terminaisons dialectales féminines : "iet" -> "ia", "et" en fin de mot -> "a"
  s = s.replace(/iet\b/g, 'ia')
       .replace(/et\b/g, 'a');

  return s.replace(/\s+/g, ' ').trim();
}

function levenshteinSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  if (!a || !b) return 0;
  const la = a.length;
  const lb = b.length;
  const matrix: number[][] = [];
  for (let i = 0; i <= la; i++) matrix[i] = [i];
  for (let j = 0; j <= lb; j++) matrix[0][j] = j;

  for (let i = 1; i <= la; i++) {
    for (let j = 1; j <= lb; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  const distance = matrix[la][lb];
  const maxLen = Math.max(la, lb);
  return maxLen === 0 ? 1 : 1 - distance / maxLen;
}

export function findMatchingDbaratiItem(
  ingredientName: string | undefined | null,
  dbaratiItems: DbaratiItem[] | undefined | null
): { dishName: string; lastPreparedAt?: string; relativeDate: string | null } | null {
  try {
    if (!ingredientName || typeof ingredientName !== 'string') return null;
    if (!dbaratiItems || !Array.isArray(dbaratiItems) || dbaratiItems.length === 0) return null;

    const ingNorm = normalizeSearchText(ingredientName);
    const ingTokens = extractSignificantTokens(ingredientName);
    const ingDialect = normalizeDialectFoodText(ingredientName);
    const ingDialectTokens = ingDialect.split(' ').filter(t => t.length >= 2);

    if (!ingNorm && ingTokens.length === 0 && !ingDialect) return null;

    const matches: Array<{ item: DbaratiItem; score: number }> = [];

    for (const item of dbaratiItems) {
      if (!item || typeof item !== 'object' || !item.text || typeof item.text !== 'string') continue;
      const dishNorm = normalizeSearchText(item.text);
      const dishTokens = extractSignificantTokens(item.text);
      const dishDialect = normalizeDialectFoodText(item.text);
      const dishDialectTokens = dishDialect.split(' ').filter(t => t.length >= 2);

      let score = 0;

      // 1. Exact match normalisé
      if (dishNorm && ingNorm && dishNorm === ingNorm) {
        score = Math.max(score, 100);
      }
      // 2. Exact match dialectal phonétique (ex: Nouasser === Nwasser -> nwaser === nwaser)
      else if (dishDialect && ingDialect && dishDialect === ingDialect) {
        score = Math.max(score, 95);
      }
      // 3. Sous-chaîne directe ou dialectale (le plat contient l'ingrédient ou inversement)
      else if (
        (dishNorm && ingNorm && (dishNorm.includes(ingNorm) || ingNorm.includes(dishNorm))) ||
        (dishDialect && ingDialect && (dishDialect.includes(ingDialect) || ingDialect.includes(dishDialect)))
      ) {
        score = Math.max(score, 85);
      }
      // 4. Dictionnaire d'équivalences culinaires tunisiennes (ex: nouasser <-> nwasser, couscous <-> kosksi)
      else {
        let aliasMatch = false;
        for (const token of ingTokens) {
          const aliases = TUNISIAN_CULINARY_ALIASES[token];
          if (aliases && aliases.some(a => dishTokens.includes(a) || dishNorm.includes(a))) {
            aliasMatch = true;
            break;
          }
        }
        if (!aliasMatch) {
          for (const token of dishTokens) {
            const aliases = TUNISIAN_CULINARY_ALIASES[token];
            if (aliases && aliases.some(a => ingTokens.includes(a) || ingNorm.includes(a))) {
              aliasMatch = true;
              break;
            }
          }
        }
        if (aliasMatch) {
          score = Math.max(score, 80);
        }
      }

      // 5. Intersection de mots-clés significatifs (standards ou dialectaux)
      if (score === 0) {
        const hasCommonToken = ingTokens.some(ingToken =>
          dishTokens.some(dishToken => dishToken === ingToken)
        );
        const hasCommonDialectToken = ingDialectTokens.some(it =>
          dishDialectTokens.some(dt => dt === it)
        );
        if (hasCommonToken || hasCommonDialectToken) {
          score = Math.max(score, 75);
        }
      }

      // 6. Fuzzy matching (similarité Levenshtein >= 75%) sur chaîne complète ou dialectale
      if (score === 0 && ingNorm.length >= 4 && dishNorm.length >= 4) {
        const stdSim = levenshteinSimilarity(ingNorm, dishNorm);
        const dialectSim = levenshteinSimilarity(ingDialect, dishDialect);
        const bestSim = Math.max(stdSim, dialectSim);
        if (bestSim >= 0.75) {
          score = Math.max(score, Math.round(bestSim * 70));
        }
      }

      if (score > 0) {
        matches.push({ item, score });
      }
    }

    if (matches.length === 0) return null;

    // Priorité au score le plus élevé, puis au plat préparé le plus récemment
    matches.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (a.item.lastPreparedAt && b.item.lastPreparedAt) {
        const timeB = new Date(b.item.lastPreparedAt).getTime();
        const timeA = new Date(a.item.lastPreparedAt).getTime();
        if (!isNaN(timeB) && !isNaN(timeA)) return timeB - timeA;
      }
      if (a.item.lastPreparedAt) return -1;
      if (b.item.lastPreparedAt) return 1;
      return 0;
    });

    const bestMatch = matches[0].item;
    if (!bestMatch || !bestMatch.text) return null;

    return {
      dishName: bestMatch.text,
      lastPreparedAt: bestMatch.lastPreparedAt,
      relativeDate: formatCompactRelativeDate(bestMatch.lastPreparedAt),
    };
  } catch (e) {
    console.error("Error in findMatchingDbaratiItem:", e);
    return null;
  }
}

/**
 * Calcule et arrondit de manière culinaire et réaliste la quantité d'un ingrédient
 * selon le nombre de convives et l'unité de mesure.
 * Évite les aberrations mathématiques comme "266.667 g" ou "1.333 pièces".
 */
export function calculateAdjustedQuantity(
  baseQuantity: number,
  basePortions: number,
  newPortions: number,
  unit?: string
): number {
  if (!basePortions || !baseQuantity) return baseQuantity;
  const raw = (baseQuantity / basePortions) * newPortions;
  const u = (unit || '').toLowerCase().trim();

  // 1. Grammes (g) et millilitres / centilitres
  if (u.includes('gramme') || u.includes('(g)') || u === 'g' || u.includes('ml') || u.includes('cl')) {
    if (raw >= 100) {
      // Au-dessus de 100g : arrondir aux 5g les plus proches (ex: 266.667g -> 265g)
      return Math.round(raw / 5) * 5;
    } else if (raw >= 20) {
      // Entre 20g et 100g : arrondir aux 5g les plus proches (ex: 33.3g -> 35g)
      return Math.round(raw / 5) * 5;
    } else if (raw >= 5) {
      // Entre 5g et 20g : arrondir à l'entier
      return Math.round(raw);
    } else {
      // Petites pesées : au demi-gramme
      return Math.round(raw * 2) / 2;
    }
  }

  // 2. Kilogrammes (kg) et Litres (l)
  if (u.includes('kg') || u.includes('kilo') || u.includes('litre') || u === 'l') {
    const rounded = Math.round(raw * 20) / 20;
    return parseFloat(rounded.toFixed(2));
  }

  // 3. Cuillères, sachets, gousses, pincées, tranches, bottes
  if (
    u.includes('cuill') ||
    u.includes('cas') ||
    u.includes('cac') ||
    u.includes('gousse') ||
    u.includes('botte') ||
    u.includes('sachet') ||
    u.includes('pinc') ||
    u.includes('tranche')
  ) {
    const rounded = Math.round(raw * 2) / 2;
    return rounded === 0 ? 0.5 : rounded;
  }

  // 4. Pièces, oeufs, etc.
  if (u.includes('pi') || u.includes('oeuf') || u.includes('unit')) {
    const rounded = Math.round(raw * 2) / 2;
    return rounded === 0 ? 1 : rounded;
  }

  // 5. Par défaut :
  if (raw >= 50) return Math.round(raw);
  if (raw >= 10) return Math.round(raw * 2) / 2;
  return parseFloat(raw.toFixed(1));
}

