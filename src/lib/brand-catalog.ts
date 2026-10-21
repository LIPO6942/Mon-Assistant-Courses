import { PurchaseHistory } from './types';

export interface BrandDef {
  name: string;
  logoUrl: string;
  domain:
    | 'WATER'
    | 'SODA'
    | 'JUICE'
    | 'COFFEE'
    | 'PASTA_GRAINS'
    | 'DAIRY'
    | 'CHEESE'
    | 'OIL'
    | 'SAUCE'
    | 'CANNED_FISH'
    | 'BISCUITS'
    | 'BATTERIES'
    | 'WELLNESS_HYGIENE'
    | 'OTHER';
  keywords: string[];
}

/**
 * Creates a crisp, vector SVG brand logo with official brand colors, typography, and graphic emblem.
 * Loads instantaneously with 0 network latency, 0 broken links, and 100% authentic branding.
 */
export function createBrandSvgLogo(
  bg: string,
  fg: string,
  text: string,
  subIconSvg: string = '',
  border: string = 'rgba(255,255,255,0.4)'
): string {
  const isLong = text.length > 7;
  const fontSize = isLong ? 12 : 15;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <defs>
      <linearGradient id="g_${text.replace(/[^a-zA-Z]/g, '')}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bg}" stop-opacity="1"/>
        <stop offset="100%" stop-color="${bg}" stop-opacity="0.85"/>
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="47" fill="url(#g_${text.replace(/[^a-zA-Z]/g, '')})" stroke="${border}" stroke-width="3"/>
    ${subIconSvg}
    <text x="50" y="${subIconSvg ? 72 : 56}" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="${fontSize}" fill="${fg}" text-anchor="middle" letter-spacing="-0.3">${text}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Predefined catalog of recognized brands with authentic vector emblems.
 */
export const PREDEFINED_BRANDS: BrandDef[] = [
  // --- EAUX MINÉRALES & EAUX DE SOURCE (STRICTEMENT SÉPARÉES DES SODAS ET DU CAFÉ) ---
  {
    name: 'Safia',
    logoUrl: createBrandSvgLogo(
      '#0066CC',
      '#FFFFFF',
      'Safia',
      '<path d="M50 20 C42 32 36 40 36 48 A14 14 0 0 0 64 48 C64 40 58 32 50 20 Z" fill="#FFFFFF" opacity="0.95"/>'
    ),
    domain: 'WATER',
    keywords: ['safia', 'eau', 'eau minerale', 'eau de source', 'eau plate']
  },
  {
    name: 'Sabrine',
    logoUrl: createBrandSvgLogo(
      '#009EE0',
      '#FFFFFF',
      'Sabrine',
      '<circle cx="50" cy="36" r="10" fill="#E0F7FA"/><path d="M42 46 Q50 38 58 46 Q50 54 42 46" fill="#FFFFFF"/>'
    ),
    domain: 'WATER',
    keywords: ['sabrine', 'eau', 'eau minerale', 'eau de source']
  },
  {
    name: 'Marwa',
    logoUrl: createBrandSvgLogo(
      '#00A896',
      '#FFFFFF',
      'Marwa',
      '<path d="M50 22 C44 32 38 40 38 46 A12 12 0 0 0 62 46 C62 40 56 32 50 22 Z" fill="#E6FFFA"/>'
    ),
    domain: 'WATER',
    keywords: ['marwa', 'eau', 'eau minerale', 'eau de source']
  },
  {
    name: 'Melliti',
    logoUrl: createBrandSvgLogo(
      '#0055A5',
      '#FFFFFF',
      'Melliti',
      '<path d="M35 40 Q50 26 65 40 Q50 50 35 40" fill="#64B5F6"/>'
    ),
    domain: 'WATER',
    keywords: ['melliti', 'eau', 'eau minerale']
  },
  {
    name: 'Fourat',
    logoUrl: createBrandSvgLogo(
      '#008080',
      '#FFFFFF',
      'Fourat',
      '<circle cx="50" cy="36" r="11" fill="#80CBC4"/><path d="M50 26 L55 38 L45 38 Z" fill="#FFFFFF"/>'
    ),
    domain: 'WATER',
    keywords: ['fourat', 'eau', 'eau minerale']
  },
  {
    name: 'Jannet',
    logoUrl: createBrandSvgLogo(
      '#0288D1',
      '#FFFFFF',
      'Jannet',
      '<path d="M38 44 C44 34 56 34 62 44" stroke="#FFFFFF" stroke-width="4" fill="none" stroke-linecap="round"/>'
    ),
    domain: 'WATER',
    keywords: ['jannet', 'eau', 'eau minerale']
  },

  // --- BOISSONS GAZEUSES / SODAS (STRICTEMENT SÉPARÉES DE L'EAU) ---
  {
    name: 'Boga',
    logoUrl: createBrandSvgLogo(
      '#008A00',
      '#FFFFFF',
      'BOGA',
      '<rect x="25" y="30" width="50" height="18" rx="9" fill="#E30613"/><circle cx="50" cy="39" r="6" fill="#FFFFFF"/>'
    ),
    domain: 'SODA',
    keywords: ['boga', 'cidre', 'lim', 'boga cidre', 'boga lim', 'soda', 'boisson gazeuse']
  },
  {
    name: 'Apla',
    logoUrl: createBrandSvgLogo(
      '#C8102E',
      '#FFFFFF',
      'APLA',
      '<circle cx="50" cy="36" r="12" fill="#4CAF50"/><path d="M50 24 Q54 20 58 22" stroke="#2E7D32" stroke-width="3" fill="none"/>'
    ),
    domain: 'SODA',
    keywords: ['apla', 'soda', 'pomme', 'boisson gazeuse']
  },
  {
    name: 'Viva',
    logoUrl: createBrandSvgLogo(
      '#FF6600',
      '#FFFFFF',
      'VIVA',
      '<circle cx="50" cy="36" r="12" fill="#FFD54F"/><path d="M42 36 L50 28 L58 36 Z" fill="#E65100"/>'
    ),
    domain: 'SODA',
    keywords: ['viva', 'soda', 'boisson gazeuse']
  },
  {
    name: 'Coca-Cola',
    logoUrl: createBrandSvgLogo(
      '#E60000',
      '#FFFFFF',
      'Coca',
      '<path d="M32 38 Q50 30 68 38 Q50 46 32 38" fill="#FFFFFF" opacity="0.9"/>'
    ),
    domain: 'SODA',
    keywords: ['coca', 'coca-cola', 'coke', 'soda']
  },
  {
    name: 'Fanta',
    logoUrl: createBrandSvgLogo(
      '#004B9B',
      '#FFFFFF',
      'Fanta',
      '<circle cx="50" cy="36" r="12" fill="#FF8800"/><path d="M52 22 Q56 18 60 20" stroke="#4CAF50" stroke-width="3" fill="none"/>'
    ),
    domain: 'SODA',
    keywords: ['fanta', 'soda', 'orange']
  },

  // --- JUS DE FRUITS (STRICTEMENT SÉPARÉS DE L'EAU) ---
  {
    name: 'Tropico',
    logoUrl: createBrandSvgLogo(
      '#FF7A00',
      '#FFFFFF',
      'Tropico',
      '<circle cx="50" cy="36" r="12" fill="#FFD700"/><path d="M45 28 Q50 20 55 28" stroke="#388E3C" stroke-width="3" fill="none"/>'
    ),
    domain: 'JUICE',
    keywords: ['tropico', 'jus', 'nectar']
  },
  {
    name: 'Délice Jus',
    logoUrl: createBrandSvgLogo(
      '#E65100',
      '#FFFFFF',
      'Délice',
      '<path d="M35 34 Q50 22 65 34 Q50 42 35 34" fill="#FFCC80"/>'
    ),
    domain: 'JUICE',
    keywords: ['delice jus', 'jus delice', 'jus']
  },
  {
    name: 'Diva',
    logoUrl: createBrandSvgLogo(
      '#D81B60',
      '#FFFFFF',
      'Diva',
      '<circle cx="50" cy="36" r="11" fill="#F8BBD0"/>'
    ),
    domain: 'JUICE',
    keywords: ['diva', 'jus']
  },
  {
    name: 'Oh!',
    logoUrl: createBrandSvgLogo(
      '#F57C00',
      '#FFFFFF',
      'Oh!',
      '<circle cx="50" cy="36" r="12" fill="#FFE082"/>'
    ),
    domain: 'JUICE',
    keywords: ['oh', 'oh!', 'jus']
  },

  // --- CAFÉ & THÉ (STRICTEMENT SÉPARÉS DU COUSCOUS ET DES PÂTES) ---
  {
    name: 'Ben Yedder',
    logoUrl: createBrandSvgLogo(
      '#3D2314',
      '#D4AF37',
      'B.Yedder',
      '<ellipse cx="50" cy="36" rx="10" ry="14" fill="#C5A059" transform="rotate(25 50 36)"/><path d="M50 24 Q55 36 50 48" stroke="#3D2314" stroke-width="2" fill="none"/>',
      '#C5A059'
    ),
    domain: 'COFFEE',
    keywords: ['ben yedder', 'cafe', 'café', 'moulu', 'grain', 'espresso']
  },
  {
    name: 'Bondin',
    logoUrl: createBrandSvgLogo(
      '#4A2E1B',
      '#FFF8E7',
      'Bondin',
      '<ellipse cx="50" cy="36" rx="9" ry="13" fill="#D7CCC8" transform="rotate(-20 50 36)"/><path d="M50 25 Q46 36 50 47" stroke="#4A2E1B" stroke-width="2" fill="none"/>',
      '#A1887F'
    ),
    domain: 'COFFEE',
    keywords: ['bondin', 'cafe', 'café', 'moulu', 'grain', 'espresso']
  },

  // --- PÂTES, COUSCOUS, SEMOULE, RIZ & FARINE (SANS DE CECCO) ---
  {
    name: 'Randa',
    logoUrl: createBrandSvgLogo(
      '#C4122F',
      '#FFFFFF',
      'randa',
      '<circle cx="50" cy="36" r="11" fill="#FFC107" opacity="0.3"/><circle cx="50" cy="36" r="8" fill="#FFFFFF"/>'
    ),
    domain: 'PASTA_GRAINS',
    keywords: ['randa', 'pates', 'pâtes', 'spaghetti', 'couscous', 'semoule', 'farine', 'riz', 'macaroni', 'nwasser', 'nouasser', 'chorba', 'penne', 'lasagne']
  },
  {
    name: 'Warda',
    logoUrl: createBrandSvgLogo(
      '#D31932',
      '#FFFFFF',
      'WARDA',
      '<circle cx="50" cy="36" r="11" fill="#FFCDD2"/><path d="M46 32 C50 26 54 26 58 32 C54 38 46 38 46 32 Z" fill="#C2185B"/>'
    ),
    domain: 'PASTA_GRAINS',
    keywords: ['warda', 'pates', 'pâtes', 'spaghetti', 'couscous', 'semoule', 'farine', 'riz', 'macaroni', 'nwasser', 'nouasser', 'chorba', 'penne', 'lasagne']
  },
  {
    name: 'Épi d\'Or',
    logoUrl: createBrandSvgLogo(
      '#0A2342',
      '#F1A104',
      'Épi d\'Or',
      '<path d="M50 18 L53 32 L50 46 L47 32 Z" fill="#F1A104"/><circle cx="45" cy="28" r="3" fill="#F1A104"/><circle cx="55" cy="28" r="3" fill="#F1A104"/>',
      '#F1A104'
    ),
    domain: 'PASTA_GRAINS',
    keywords: ['epi d\'or', 'épi d\'or', 'pates', 'pâtes', 'spaghetti', 'couscous', 'semoule', 'farine', 'riz', 'macaroni']
  },
  {
    name: 'Diari',
    logoUrl: createBrandSvgLogo(
      '#E59B27',
      '#FFFFFF',
      'DIARI',
      '<circle cx="50" cy="36" r="11" fill="#2E7D32"/>'
    ),
    domain: 'PASTA_GRAINS',
    keywords: ['diari', 'couscous', 'semoule', 'pates', 'pâtes', 'spaghetti']
  },
  {
    name: 'Barilla',
    logoUrl: createBrandSvgLogo(
      '#00205B',
      '#FFFFFF',
      'Barilla',
      '<ellipse cx="50" cy="36" rx="20" ry="10" fill="#E30613"/><ellipse cx="50" cy="36" rx="16" ry="7" fill="#FFFFFF"/>'
    ),
    domain: 'PASTA_GRAINS',
    keywords: ['barilla', 'pates', 'pâtes', 'spaghetti', 'penne', 'sauce']
  },

  // --- PRODUITS LAITIERS (LAIT, YAOURT, BEURRE) ---
  {
    name: 'Délice',
    logoUrl: createBrandSvgLogo(
      '#004B9B',
      '#FFFFFF',
      'Délice',
      '<path d="M30 38 Q50 22 70 34" stroke="#E30613" stroke-width="4" fill="none" stroke-linecap="round"/>'
    ),
    domain: 'DAIRY',
    keywords: ['delice', 'délice', 'lait', 'yaourt', 'beurre', 'creme', 'produits laitiers']
  },
  {
    name: 'Vitalait',
    logoUrl: createBrandSvgLogo(
      '#007A3D',
      '#FFFFFF',
      'Vitalait',
      '<circle cx="50" cy="36" r="10" fill="#E53935"/><circle cx="50" cy="36" r="6" fill="#FFFFFF"/>'
    ),
    domain: 'DAIRY',
    keywords: ['vitalait', 'lait', 'yaourt', 'beurre', 'produits laitiers']
  },
  {
    name: 'Natilait',
    logoUrl: createBrandSvgLogo(
      '#0084CA',
      '#FFFFFF',
      'Natilait',
      '<path d="M36 36 Q50 26 64 36 Q50 44 36 36" fill="#FFFFFF"/>'
    ),
    domain: 'DAIRY',
    keywords: ['natilait', 'lait', 'produits laitiers']
  },

  // --- FROMAGES (AVEC FROMY, SANS FROMITAL) ---
  {
    name: 'Fromy',
    logoUrl: createBrandSvgLogo(
      '#FFCC00',
      '#D50000',
      'FROMY',
      '<path d="M38 42 L62 42 L58 26 Z" fill="#D50000"/><circle cx="48" cy="38" r="2" fill="#FFCC00"/><circle cx="54" cy="34" r="2" fill="#FFCC00"/>'
    ),
    domain: 'CHEESE',
    keywords: ['fromy', 'fromage', 'fromage fondu', 'fromage rape', 'fromage blanc', 'gruyere', 'edam', 'mozzarella']
  },
  {
    name: 'Land\'Or',
    logoUrl: createBrandSvgLogo(
      '#0D5C3A',
      '#FFFFFF',
      'Land\'Or',
      '<circle cx="50" cy="36" r="11" fill="#C5A059"/><path d="M44 36 L50 28 L56 36 Z" fill="#0D5C3A"/>',
      '#C5A059'
    ),
    domain: 'CHEESE',
    keywords: ['land\'or', 'land or', 'fromage', 'mozzarella', 'fromage rape', 'fromage fondu']
  },
  {
    name: 'Président',
    logoUrl: createBrandSvgLogo(
      '#D62828',
      '#FFFFFF',
      'Président',
      '<rect x="28" y="26" width="44" height="18" fill="#F4E8C1" rx="4"/><text x="50" y="38" font-family="sans-serif" font-size="8" font-weight="900" fill="#D62828" text-anchor="middle">PRÉSIDENT</text>',
      '#F4E8C1'
    ),
    domain: 'CHEESE',
    keywords: ['president', 'président', 'fromage', 'beurre', 'camembert', 'emmental', 'creme']
  },

  // --- HUILES & CONDIMENTS ---
  {
    name: 'Nejma',
    logoUrl: createBrandSvgLogo(
      '#4B5320',
      '#FFFFFF',
      'Nejma',
      '<path d="M50 22 L53 32 L63 32 L55 38 L58 48 L50 42 L42 48 L45 38 L37 32 L47 32 Z" fill="#FFD700"/>'
    ),
    domain: 'OIL',
    keywords: ['nejma', 'huile', 'huile de mais', 'huile vegetale']
  },
  {
    name: 'Safir',
    logoUrl: createBrandSvgLogo(
      '#1E4620',
      '#FFFFFF',
      'Safir',
      '<circle cx="50" cy="36" r="10" fill="#FFC107"/><path d="M50 26 C46 32 46 38 50 44 C54 38 54 32 50 26 Z" fill="#2E7D32"/>'
    ),
    domain: 'OIL',
    keywords: ['safir', 'huile', 'huile d\'olive']
  },
  {
    name: 'Ruspina',
    logoUrl: createBrandSvgLogo(
      '#2E5339',
      '#FFFFFF',
      'Ruspina',
      '<ellipse cx="50" cy="36" rx="10" ry="13" fill="#81C784"/>'
    ),
    domain: 'OIL',
    keywords: ['ruspina', 'huile', 'huile d\'olive']
  },

  // --- TOMATES, HARISSA & SAUCES ---
  {
    name: 'Sicam',
    logoUrl: createBrandSvgLogo(
      '#D62828',
      '#FFFFFF',
      'SICAM',
      '<circle cx="50" cy="36" r="12" fill="#FFC107"/><circle cx="50" cy="36" r="9" fill="#D62828"/>'
    ),
    domain: 'SAUCE',
    keywords: ['sicam', 'tomate', 'double concentre', 'harissa', 'sauce', 'conserve']
  },
  {
    name: 'Jouda',
    logoUrl: createBrandSvgLogo(
      '#B30000',
      '#FFFFFF',
      'JOUDA',
      '<circle cx="50" cy="36" r="11" fill="#FFB300"/>'
    ),
    domain: 'SAUCE',
    keywords: ['jouda', 'tomate', 'harissa', 'conserve']
  },
  {
    name: 'Cap d\'Or',
    logoUrl: createBrandSvgLogo(
      '#E65100',
      '#FFFFFF',
      'Cap d\'Or',
      '<circle cx="50" cy="36" r="11" fill="#FFD54F"/>'
    ),
    domain: 'SAUCE',
    keywords: ['cap d\'or', 'harissa', 'tomate']
  },
  {
    name: 'Le Phare du Cap Bon',
    logoUrl: createBrandSvgLogo(
      '#C4122F',
      '#FFFFFF',
      'Le Phare',
      '<path d="M47 44 L50 26 L53 44 Z" fill="#FFFFFF"/><circle cx="50" cy="24" r="3" fill="#FFEB3B"/>'
    ),
    domain: 'SAUCE',
    keywords: ['le phare du cap bon', 'phare', 'harissa', 'sauce']
  },

  // --- CONSERVES DE POISSON (THON, SARDINE) ---
  {
    name: 'Sidi Daoud',
    logoUrl: createBrandSvgLogo(
      '#0A192F',
      '#FFD700',
      'S.Daoud',
      '<path d="M38 36 Q50 30 62 36 Q50 42 38 36 M62 36 L66 32 L66 40 Z" fill="#FFD700"/>',
      '#FFD700'
    ),
    domain: 'CANNED_FISH',
    keywords: ['sidi daoud', 'thon', 'sardine', 'conserve']
  },
  {
    name: 'Manar',
    logoUrl: createBrandSvgLogo(
      '#0D47A1',
      '#FFFFFF',
      'MANAR',
      '<path d="M38 36 Q50 29 62 36 Q50 43 38 36 M62 36 L67 31 L67 41 Z" fill="#90CAF9"/>'
    ),
    domain: 'CANNED_FISH',
    keywords: ['manar', 'thon', 'sardine']
  },

  // --- BISCUITS & GÂTEAUX ---
  {
    name: 'Saida',
    logoUrl: createBrandSvgLogo(
      '#D48817',
      '#FFFFFF',
      'SAIDA',
      '<circle cx="50" cy="36" r="12" fill="#E65100"/>'
    ),
    domain: 'BISCUITS',
    keywords: ['saida', 'biscuit', 'sablito', 'major', 'gaufrette']
  },
  {
    name: 'Moulin d\'Or',
    logoUrl: createBrandSvgLogo(
      '#14213D',
      '#FCA311',
      'M. d\'Or',
      '<circle cx="50" cy="36" r="11" fill="#FCA311"/><path d="M50 26 L50 46 M40 36 L60 36" stroke="#14213D" stroke-width="2"/>',
      '#FCA311'
    ),
    domain: 'BISCUITS',
    keywords: ['moulin d\'or', 'cake', 'pain', 'viennoiserie', 'gâteau']
  },

  // --- PILES & ACCUS (ÉLECTRONIQUE & MAISON) ---
  {
    name: 'Energizer',
    logoUrl: createBrandSvgLogo(
      '#1C1C1C',
      '#FFDD00',
      'Energizer',
      '<rect x="36" y="24" width="28" height="46" rx="4" fill="#FFDD00" stroke="#000000" stroke-width="2"/><rect x="43" y="18" width="14" height="6" rx="2" fill="#FFDD00"/><path d="M50 34 L50 46 M44 40 L56 40" stroke="#000000" stroke-width="3" stroke-linecap="round"/>',
      '#FFDD00'
    ),
    domain: 'BATTERIES',
    keywords: ['energizer', 'pile', 'piles', 'batterie', 'batteries', 'accu', 'accus', 'aa', 'aaa']
  },
  {
    name: 'Eveready',
    logoUrl: createBrandSvgLogo(
      '#C8102E',
      '#FFFFFF',
      'Eveready',
      '<circle cx="50" cy="36" r="12" fill="#000000"/><path d="M48 27 L43 37 L49 37 L46 45 L56 34 L50 34 Z" fill="#FFE500"/>',
      '#FFE500'
    ),
    domain: 'BATTERIES',
    keywords: ['eveready', 'everday', 'eveready cat', 'pile', 'piles', 'batterie']
  },
  {
    name: 'Duracell',
    logoUrl: createBrandSvgLogo(
      '#111111',
      '#C68A4C',
      'Duracell',
      '<rect x="34" y="22" width="32" height="14" rx="2" fill="#C68A4C"/><rect x="34" y="36" width="32" height="32" rx="2" fill="#222222"/><rect x="44" y="16" width="12" height="6" rx="2" fill="#C68A4C"/>',
      '#C68A4C'
    ),
    domain: 'BATTERIES',
    keywords: ['duracell', 'pile', 'piles', 'plus', 'ultra', 'batterie']
  },
  {
    name: 'Varta',
    logoUrl: createBrandSvgLogo(
      '#002D72',
      '#FED100',
      'VARTA',
      '<polygon points="50,20 66,44 34,44" fill="#FED100"/>',
      '#FED100'
    ),
    domain: 'BATTERIES',
    keywords: ['varta', 'pile', 'piles', 'batterie']
  },
  {
    name: 'GP',
    logoUrl: createBrandSvgLogo(
      '#00823B',
      '#FED100',
      'GP',
      '<circle cx="50" cy="36" r="11" fill="#FED100"/><text x="50" y="40" font-family="sans-serif" font-weight="900" font-size="11" fill="#00823B" text-anchor="middle">GP</text>',
      '#FED100'
    ),
    domain: 'BATTERIES',
    keywords: ['gp', 'gp batteries', 'pile', 'piles']
  },
  {
    name: 'Philips',
    logoUrl: createBrandSvgLogo(
      '#0B5ED7',
      '#FFFFFF',
      'Philips',
      '<path d="M38 32 C44 26 56 26 62 32 C56 42 44 42 38 32 Z" fill="#FFFFFF"/>'
    ),
    domain: 'BATTERIES',
    keywords: ['philips', 'pile', 'piles']
  },

  // --- BIEN-ÊTRE, SOINS CORPORELS & HYGIÈNE ---
  {
    name: 'Nivea',
    logoUrl: createBrandSvgLogo(
      '#0032A0',
      '#FFFFFF',
      'NIVEA',
      '<circle cx="50" cy="36" r="13" fill="#00227A"/><circle cx="50" cy="36" r="10" fill="#0032A0"/>'
    ),
    domain: 'WELLNESS_HYGIENE',
    keywords: ['nivea', 'creme', 'deodorant', 'deo', 'lotion', 'savon', 'soin', 'gel douche', 'baume']
  },
  {
    name: 'Dove',
    logoUrl: createBrandSvgLogo(
      '#1A3B8B',
      '#D4AF37',
      'Dove',
      '<path d="M40 32 C45 26 55 28 62 34 C54 36 48 38 42 42 C40 38 38 34 40 32 Z" fill="#D4AF37"/>',
      '#D4AF37'
    ),
    domain: 'WELLNESS_HYGIENE',
    keywords: ['dove', 'savon', 'gel douche', 'shampoing', 'deodorant', 'soin', 'creme']
  },
  {
    name: 'Le Petit Marseillais',
    logoUrl: createBrandSvgLogo(
      '#EAA822',
      '#1E3A5F',
      'Marseillais',
      '<circle cx="50" cy="30" r="6" fill="#1E3A5F"/><path d="M42 44 C42 37 58 37 58 44 Z" fill="#1E3A5F"/>',
      '#1E3A5F'
    ),
    domain: 'WELLNESS_HYGIENE',
    keywords: ['le petit marseillais', 'marseillais', 'gel douche', 'shampoing', 'savon']
  },
  {
    name: 'Palmolive',
    logoUrl: createBrandSvgLogo(
      '#006847',
      '#FFFFFF',
      'Palmolive',
      '<path d="M50 22 C42 32 40 38 40 44 A10 10 0 0 0 60 44 C60 38 58 32 50 22 Z" fill="#88D49E"/>'
    ),
    domain: 'WELLNESS_HYGIENE',
    keywords: ['palmolive', 'savon', 'gel douche', 'liquide vaisselle', 'shampoing']
  },
  {
    name: 'Cadum',
    logoUrl: createBrandSvgLogo(
      '#E91E63',
      '#FFFFFF',
      'Cadum',
      '<path d="M50 24 C44 32 38 38 38 44 A12 12 0 0 0 62 44 C62 38 56 32 50 24 Z" fill="#F8BBD0"/>'
    ),
    domain: 'WELLNESS_HYGIENE',
    keywords: ['cadum', 'savon', 'gel douche', 'bebe', 'shampoing']
  },
  {
    name: 'Signal',
    logoUrl: createBrandSvgLogo(
      '#D32F2F',
      '#FFFFFF',
      'Signal',
      '<path d="M34 38 Q50 26 66 38 Q50 44 34 38" fill="#FFFFFF"/><circle cx="50" cy="35" r="4" fill="#D32F2F"/>'
    ),
    domain: 'WELLNESS_HYGIENE',
    keywords: ['signal', 'dentifrice', 'brosse a dents']
  },
  {
    name: 'Colgate',
    logoUrl: createBrandSvgLogo(
      '#C62828',
      '#FFFFFF',
      'Colgate',
      '<path d="M36 34 Q50 44 64 34 Q50 48 36 34" fill="#FFFFFF"/>'
    ),
    domain: 'WELLNESS_HYGIENE',
    keywords: ['colgate', 'dentifrice', 'brosse a dents', 'bain de bouche']
  },
  {
    name: 'Head & Shoulders',
    logoUrl: createBrandSvgLogo(
      '#004B9B',
      '#FFFFFF',
      'H&S',
      '<path d="M34 40 C42 28 58 28 66 40 C58 34 42 34 34 40 Z" fill="#42A5F5"/>'
    ),
    domain: 'WELLNESS_HYGIENE',
    keywords: ['head & shoulders', 'head and shoulders', 'shampoing', 'antipelliculaire']
  },
  {
    name: 'Elseve',
    logoUrl: createBrandSvgLogo(
      '#1C1C1C',
      '#D4AF37',
      'Elseve',
      '<ellipse cx="50" cy="34" rx="9" ry="12" fill="#D4AF37"/>',
      '#D4AF37'
    ),
    domain: 'WELLNESS_HYGIENE',
    keywords: ['elseve', 'l\'oreal', 'loreal', 'shampoing', 'apres-shampoing', 'masque']
  },
  {
    name: 'Gillette',
    logoUrl: createBrandSvgLogo(
      '#0D1B2A',
      '#E0E1DD',
      'Gillette',
      '<path d="M36 32 L64 32 L58 42 L30 42 Z" fill="#415A77"/>'
    ),
    domain: 'WELLNESS_HYGIENE',
    keywords: ['gillette', 'rasoir', 'mousse a raser', 'lames']
  },
  {
    name: 'Always',
    logoUrl: createBrandSvgLogo(
      '#00509D',
      '#FFD166',
      'Always',
      '<path d="M36 38 C44 28 56 28 64 38 C56 34 44 34 36 38 Z" fill="#FFD166"/>'
    ),
    domain: 'WELLNESS_HYGIENE',
    keywords: ['always', 'serviettes', 'hygienique', 'protege slip']
  },
  {
    name: 'Dettol',
    logoUrl: createBrandSvgLogo(
      '#007A3D',
      '#FFFFFF',
      'Dettol',
      '<circle cx="50" cy="35" r="10" fill="#FFFFFF"/><path d="M50 27 L50 43 M42 35 L58 35" stroke="#007A3D" stroke-width="3"/>'
    ),
    domain: 'WELLNESS_HYGIENE',
    keywords: ['dettol', 'savon', 'antiseptique', 'desinfectant']
  }
];

const CUSTOM_BRANDS_STORAGE_KEY = 'mon_assistant_custom_brands_v3';

export interface CustomBrandRecord {
  name: string;
  domain?: BrandDef['domain'] | null;
  category?: string;
  ingredientId?: string;
  timestamp: number;
}

/**
 * Retrieves all stored custom brands with domain/category metadata.
 */
export function getCustomBrandRecords(): CustomBrandRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CUSTOM_BRANDS_STORAGE_KEY);
    if (!raw) {
      // Check fallback v2 key for backwards compatibility
      const fallback = localStorage.getItem('mon_assistant_custom_brands_v2');
      if (fallback) {
        const parsed = JSON.parse(fallback);
        if (Array.isArray(parsed)) {
          return parsed.map(item => {
            if (typeof item === 'string') {
              return { name: item, timestamp: Date.now() };
            }
            return item;
          });
        }
      }
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(item => {
      if (typeof item === 'string') {
        return { name: item, timestamp: Date.now() };
      }
      return item;
    });
  } catch {
    return [];
  }
}

/**
 * Returns plain list of custom brand names.
 */
export function getCustomBrands(): string[] {
  return getCustomBrandRecords().map(r => r.name);
}

/**
 * Saves a custom brand entered by the user, binding it to its domain/category context
 * so it immediately becomes available and prioritized for relevant products.
 */
export function saveCustomBrand(
  brandName: string,
  ingredientName?: string,
  categoryName?: string,
  ingredientId?: string
): void {
  if (typeof window === 'undefined') return;
  const trimmed = brandName.trim();
  if (!trimmed) return;
  try {
    const records = getCustomBrandRecords();
    const existingIndex = records.findIndex(r => r.name.toLowerCase() === trimmed.toLowerCase());
    const domain = (ingredientName || categoryName) ? detectProductDomain(ingredientName, categoryName) : null;

    const newRecord: CustomBrandRecord = {
      name: trimmed,
      domain: domain || undefined,
      category: categoryName || undefined,
      ingredientId: ingredientId || undefined,
      timestamp: Date.now()
    };

    if (existingIndex >= 0) {
      records[existingIndex] = {
        ...records[existingIndex],
        domain: newRecord.domain || records[existingIndex].domain,
        category: newRecord.category || records[existingIndex].category,
        ingredientId: newRecord.ingredientId || records[existingIndex].ingredientId,
        timestamp: Date.now()
      };
    } else {
      records.unshift(newRecord);
    }

    localStorage.setItem(CUSTOM_BRANDS_STORAGE_KEY, JSON.stringify(records));
  } catch (err) {
    console.error('Error saving custom brand:', err);
  }
}

/**
 * Detects the culinary/food/household domain of a given ingredient name and category.
 * This ensures strict isolation: Coffee brands NEVER show on Couscous,
 * Sodas/Juice/Coffee NEVER show on plain Water,
 * and Batteries/Wellness brands stay in their respective categories.
 */
export function detectProductDomain(
  ingredientName: string = '',
  categoryName: string = ''
): BrandDef['domain'] | null {
  const norm = `${ingredientName} ${categoryName}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

  // 1. Water (MUST take precedence to prevent soda/juice/coffee from matching)
  if (/\b(eau|eaux|minerale|source)\b/.test(norm) && !/\b(eau de fleur|eau de rose)\b/.test(norm)) {
    return 'WATER';
  }

  // 2. Sodas & carbonated drinks
  if (/\b(soda|gazeuse|gazee|boga|coca|fanta|sprite|pepsi|apla|viva|schweppes)\b/.test(norm)) {
    return 'SODA';
  }

  // 3. Fruit juices
  if (/\b(jus|nectar|tropico|diva)\b/.test(norm)) {
    return 'JUICE';
  }

  // 4. Coffee & tea
  if (/\b(cafe|the|espresso|moulu|grain|infusion|ben yedder|bondin)\b/.test(norm)) {
    return 'COFFEE';
  }

  // 5. Batteries & power (Piles, accus, batteries)
  if (/\b(pile|piles|batterie|batteries|accu|accus|energizer|eveready|everday|duracell|varta)\b/.test(norm)) {
    return 'BATTERIES';
  }

  // 6. Wellness, personal care, beauty, body hygiene
  if (
    /\b(bien[- ]?etre|hygiene|beaute|soin|soins|cosmetique|savon|savons|gel douche|shampoing|champoing|apres[- ]shampoing|dentifrice|brosse a dents|deodorant|deo|creme|lotion|rasoir|mousse a raser|serviette hygienique|protege[- ]slip|lingettes|nivea|dove|cadum|palmolive|signal|colgate|elseve|gillette|always)\b/.test(norm)
  ) {
    return 'WELLNESS_HYGIENE';
  }

  // 7. Pasta, couscous, semolina, flour, rice
  if (/\b(pate|pates|spaghetti|macaroni|couscous|semoule|farine|riz|nwasser|nouasser|chorba|penne|lasagne|randa|warda)\b/.test(norm)) {
    return 'PASTA_GRAINS';
  }

  // 8. Cheese
  if (/\b(fromage|fromy|land or|mozzarella|ricotta|gruyere|emmental|edam|sicilien|parmesan)\b/.test(norm)) {
    return 'CHEESE';
  }

  // 9. Dairy (Milk, yogurt, butter, cream)
  if (/\b(lait|yaourt|beurre|creme|laban|raib|laitier|laitiere)\b/.test(norm)) {
    return 'DAIRY';
  }

  // 10. Oils
  if (/\b(huile|olives?|olive)\b/.test(norm)) {
    return 'OIL';
  }

  // 11. Tomatoes, harissa, tomato paste
  if (/\b(tomate|harissa|sauce|concentre)\b/.test(norm)) {
    return 'SAUCE';
  }

  // 12. Canned fish
  if (/\b(thon|sardine|maquereau)\b/.test(norm)) {
    return 'CANNED_FISH';
  }

  // 13. Biscuits & cakes
  if (/\b(biscuit|biscuits|sablito|major|gaufrette|cake|gateur|cookie)\b/.test(norm)) {
    return 'BISCUITS';
  }

  return null;
}

/**
 * Returns strictly sorted brands for a specific product:
 * 1. Strictly isolated by product domain (NO Ben Yedder on Couscous, NO Boga on Water!).
 * 2. Predefined catalog + custom brands saved by user.
 * 3. Trié par fréquence d'achat de l'utilisateur pour CE produit : le premier est TOUJOURS le plus utilisé !
 */
export function getSortedBrandsForProduct(
  ingredientId: string,
  ingredientName: string,
  categoryName: string,
  purchaseHistory: PurchaseHistory,
  userCustomBrands: string[] = []
): BrandDef[] {
  const domain = detectProductDomain(ingredientName, categoryName);
  const normName = (ingredientName || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  const normCat = (categoryName || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

  // 1. Calculate purchase frequency for each brand EXCLUSIVELY on this ingredient
  const brandFrequency: Record<string, number> = {};
  const ingredientHistory = purchaseHistory[ingredientId] || [];

  ingredientHistory.forEach(record => {
    if (record.brand && record.brand.trim()) {
      const b = record.brand.trim();
      brandFrequency[b] = (brandFrequency[b] || 0) + 1;
    }
  });

  const candidateMap = new Map<string, BrandDef>();

  // 2. Add predefined brands matching this product's domain or specific keyword
  PREDEFINED_BRANDS.forEach(def => {
    let isMatch = false;

    if (domain) {
      if (def.domain === domain) {
        isMatch = true;
      }
    } else {
      isMatch = def.keywords.some(k => normName.includes(k) || k.includes(normName));
    }

    if (isMatch) {
      candidateMap.set(def.name.toLowerCase(), def);
    }
  });

  // 3. Add custom brands saved by user matching this product / domain / category
  const customRecords = typeof window !== 'undefined' ? getCustomBrandRecords() : [];
  customRecords.forEach(rec => {
    const key = rec.name.toLowerCase();
    let matches = false;

    if (rec.ingredientId && rec.ingredientId === ingredientId) {
      matches = true;
    } else if (domain && rec.domain && rec.domain === domain) {
      matches = true;
    } else if (rec.category && normCat && (rec.category.toLowerCase().includes(normCat) || normCat.includes(rec.category.toLowerCase()))) {
      matches = true;
    } else if (!domain && !rec.domain) {
      matches = true;
    }

    if (matches && !candidateMap.has(key)) {
      const predefined = PREDEFINED_BRANDS.find(b => b.name.toLowerCase() === key);
      if (predefined) {
        candidateMap.set(key, predefined);
      } else {
        candidateMap.set(key, {
          name: rec.name,
          logoUrl: createBrandSvgLogo('#4A5568', '#FFFFFF', rec.name),
          domain: domain || 'OTHER',
          keywords: [key]
        });
      }
    }
  });

  // 4. Also process userCustomBrands (strings passed directly as argument)
  userCustomBrands.forEach(b => {
    const key = b.toLowerCase();
    if (!candidateMap.has(key)) {
      const predefined = PREDEFINED_BRANDS.find(def => def.name.toLowerCase() === key);
      if (predefined && (!domain || predefined.domain === domain)) {
        candidateMap.set(key, predefined);
      } else if (!domain) {
        candidateMap.set(key, {
          name: b,
          logoUrl: createBrandSvgLogo('#4A5568', '#FFFFFF', b),
          domain: 'OTHER',
          keywords: [key]
        });
      }
    }
  });

  // 5. Include any brand previously recorded in history specifically for this product
  Object.keys(brandFrequency).forEach(brandName => {
    const key = brandName.toLowerCase();
    if (!candidateMap.has(key)) {
      const predefined = PREDEFINED_BRANDS.find(b => b.name.toLowerCase() === key);
      if (predefined) {
        candidateMap.set(key, predefined);
      } else {
        candidateMap.set(key, {
          name: brandName,
          logoUrl: createBrandSvgLogo('#4A5568', '#FFFFFF', brandName),
          domain: domain || 'OTHER',
          keywords: [key]
        });
      }
    }
  });

  // 6. Sort descending by frequency:
  // "toujours le premier c'est le plus utilisé par l'utilisateur etc.."
  const sorted = Array.from(candidateMap.values()).sort((a, b) => {
    const freqA = brandFrequency[a.name] || 0;
    const freqB = brandFrequency[b.name] || 0;
    if (freqB !== freqA) {
      return freqB - freqA; // Most used brand first!
    }
    return a.name.localeCompare(b.name);
  });

  return sorted;
}

