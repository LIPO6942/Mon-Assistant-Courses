export interface CategoryTheme {
  name: string;
  emoji: string;
  border: string;
  bg: string;
  header: string;
  text: string;
  icon: string;
  buttonHover: string;
  pillBg: string;
  pillBorder: string;
  pillText: string;
}

/**
 * Normalise un nom de catégorie pour détection lexicale
 */
function normalizeCategoryName(name: string): string {
  return (name || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Détecte intelligemment le thème visuel (emoji + couleurs) pour n'importe quel nom de catégorie
 * spécifié librement par l'utilisateur.
 * Règle impérative : Tout ce qui touche aux produits laitiers / crèmerie est attribué au JAUNE.
 */
export function getPantryCategoryTheme(categoryName: string): CategoryTheme {
  const clean = normalizeCategoryName(categoryName);

  // 1. PRODUITS LAITIERS, CRÈMERIE, FROMAGES & ŒUFS -> JAUNE (Palette Amber/Yellow)
  if (
    /\b(lait|laitier|laitiers|laitiere|laitieres|cremerie|fromage|fromages|fromagerie|yaourt|yaourts|yogourt|yogourts|beurre|creme|oeuf|oeufs|egg|eggs|dairy|cheese|milk|ricotta|mozzarella|parmesan|gouda|edam|gruyere|kiri|vitalait|laban|raib|petit suisse)\b/.test(
      clean
    )
  ) {
    return {
      name: 'yellow',
      emoji: '🧀',
      border: 'border-amber-300/60 dark:border-amber-700/50',
      bg: 'bg-amber-50/40 dark:bg-amber-950/20',
      header:
        'bg-gradient-to-r from-amber-100/90 via-yellow-100/40 to-amber-50/20 dark:from-amber-950/60 dark:to-yellow-950/20',
      text: 'text-amber-900 dark:text-amber-200',
      icon: 'text-amber-700 dark:text-amber-300',
      buttonHover: 'hover:bg-amber-100 hover:text-amber-800 dark:hover:bg-amber-900/40',
      pillBg: 'bg-amber-100/90 dark:bg-amber-900/50',
      pillBorder: 'border-amber-300 dark:border-amber-700',
      pillText: 'text-amber-950 dark:text-amber-100',
    };
  }

  // 2. VIANDES, VOLAILLES, CHARCUTERIE & POISSONS -> CORAIL / ROSE
  if (
    /\b(viande|viandes|boucherie|poulet|volaille|volailles|escalope|dinde|boeuf|steak|veau|agneau|mouton|merguez|saucisse|saucisses|charcuterie|jambon|salami|poisson|poissons|poissonnerie|saumon|thon|crevette|crevettes|seiche|calmar|crustace|crustaces|fruits de mer|meat|fish|poultry)\b/.test(
      clean
    )
  ) {
    const isFish = /\b(poisson|poissons|poissonnerie|saumon|thon|crevette|crevettes|seiche|calmar|crustace|crustaces|mer)\b/.test(
      clean
    );
    return {
      name: 'rose',
      emoji: isFish ? '🐟' : '🥩',
      border: 'border-rose-200/60 dark:border-rose-800/50',
      bg: 'bg-rose-50/30 dark:bg-rose-950/20',
      header: 'bg-gradient-to-r from-rose-100/80 to-rose-50/20 dark:from-rose-950/60 dark:to-rose-900/20',
      text: 'text-rose-700 dark:text-rose-200',
      icon: 'text-rose-600 dark:text-rose-300',
      buttonHover: 'hover:bg-rose-100 hover:text-rose-700 dark:hover:bg-rose-900/40',
      pillBg: 'bg-rose-100/80 dark:bg-rose-900/40',
      pillBorder: 'border-rose-200 dark:border-rose-700',
      pillText: 'text-rose-800 dark:text-rose-100',
    };
  }

  // 3. FRUITS & LÉGUMES -> VERT ÉMERAUDE
  if (
    /\b(fruit|fruits|legume|legumes|primeur|primeurs|maraicher|salade|salades|tomate|tomates|pomme|pommes|agrume|agrumes|verdure|vegetable|vegetables)\b/.test(
      clean
    )
  ) {
    return {
      name: 'emerald',
      emoji: '🥦',
      border: 'border-emerald-200/60 dark:border-emerald-800/50',
      bg: 'bg-emerald-50/30 dark:bg-emerald-950/20',
      header: 'bg-gradient-to-r from-emerald-100/80 to-emerald-50/20 dark:from-emerald-950/60 dark:to-emerald-900/20',
      text: 'text-emerald-700 dark:text-emerald-200',
      icon: 'text-emerald-600 dark:text-emerald-300',
      buttonHover: 'hover:bg-emerald-100 hover:text-emerald-700 dark:hover:bg-emerald-900/40',
      pillBg: 'bg-emerald-100/80 dark:bg-emerald-900/40',
      pillBorder: 'border-emerald-200 dark:border-emerald-700',
      pillText: 'text-emerald-800 dark:text-emerald-100',
    };
  }

  // 4. BOULANGERIE & PÂTISSERIE -> DORÉ / ORANGE CHAUD
  if (
    /\b(boulangerie|patisserie|pain|pains|baguette|baguettes|croissant|croissants|brioche|brioches|viennoiserie|viennoiseries|toast|toasts|biscotte|biscottes|bakery)\b/.test(
      clean
    )
  ) {
    return {
      name: 'orange',
      emoji: '🥖',
      border: 'border-orange-200/60 dark:border-orange-800/50',
      bg: 'bg-orange-50/30 dark:bg-orange-950/20',
      header: 'bg-gradient-to-r from-orange-100/80 to-orange-50/20 dark:from-orange-950/60 dark:to-orange-900/20',
      text: 'text-orange-800 dark:text-orange-200',
      icon: 'text-orange-600 dark:text-orange-300',
      buttonHover: 'hover:bg-orange-100 hover:text-orange-800 dark:hover:bg-orange-900/40',
      pillBg: 'bg-orange-100/80 dark:bg-orange-900/40',
      pillBorder: 'border-orange-200 dark:border-orange-700',
      pillText: 'text-orange-900 dark:text-orange-100',
    };
  }

  // 5. BOISSONS -> CYAN / BLEU LAGON
  if (
    /\b(boisson|boissons|eau|eaux|jus|soda|sodas|cola|pepsi|cafe|the|tisane|infusion|sirop|drink|drinks|beverage)\b/.test(
      clean
    )
  ) {
    return {
      name: 'cyan',
      emoji: '🧃',
      border: 'border-cyan-200/60 dark:border-cyan-800/50',
      bg: 'bg-cyan-50/30 dark:bg-cyan-950/20',
      header: 'bg-gradient-to-r from-cyan-100/80 to-cyan-50/20 dark:from-cyan-950/60 dark:to-cyan-900/20',
      text: 'text-cyan-700 dark:text-cyan-200',
      icon: 'text-cyan-600 dark:text-cyan-300',
      buttonHover: 'hover:bg-cyan-100 hover:text-cyan-700 dark:hover:bg-cyan-900/40',
      pillBg: 'bg-cyan-100/80 dark:bg-cyan-900/40',
      pillBorder: 'border-cyan-200 dark:border-cyan-700',
      pillText: 'text-cyan-800 dark:text-cyan-100',
    };
  }

  // 6. ÉPICERIE SALÉE -> TERRACOTTA / AMBRE SALÉ
  if (
    /\b(sale|salee|sel|epice|epices|conserve|conserves|pate|pates|riz|huile|huiles|sauce|sauces|vinaigre|farine|moutarde|olive|olives)\b/.test(
      clean
    )
  ) {
    return {
      name: 'terracotta',
      emoji: '🧂',
      border: 'border-orange-300/50 dark:border-orange-800/50',
      bg: 'bg-amber-50/25 dark:bg-amber-950/20',
      header: 'bg-gradient-to-r from-amber-100/70 to-orange-100/30 dark:from-amber-950/50 dark:to-orange-950/20',
      text: 'text-amber-800 dark:text-amber-200',
      icon: 'text-amber-700 dark:text-amber-300',
      buttonHover: 'hover:bg-amber-100 hover:text-amber-800 dark:hover:bg-amber-900/40',
      pillBg: 'bg-amber-100/70 dark:bg-amber-900/40',
      pillBorder: 'border-amber-300/60 dark:border-amber-700',
      pillText: 'text-amber-900 dark:text-amber-100',
    };
  }

  // 7. ÉPICERIE SUCRÉE -> VIOLET / FRAMBOISE
  if (
    /\b(sucre|sucree|biscuit|biscuits|chocolat|chocolats|gateau|gateaux|bonbon|bonbons|confiture|miel|chamia|halwa|cereale|cereales|gouter|sweet|snack)\b/.test(
      clean
    )
  ) {
    return {
      name: 'violet',
      emoji: '🍫',
      border: 'border-violet-200/60 dark:border-violet-800/50',
      bg: 'bg-violet-50/30 dark:bg-violet-950/20',
      header: 'bg-gradient-to-r from-violet-100/80 to-violet-50/20 dark:from-violet-950/60 dark:to-violet-900/20',
      text: 'text-violet-700 dark:text-violet-200',
      icon: 'text-violet-600 dark:text-violet-300',
      buttonHover: 'hover:bg-violet-100 hover:text-violet-700 dark:hover:bg-violet-900/40',
      pillBg: 'bg-violet-100/80 dark:bg-violet-900/40',
      pillBorder: 'border-violet-200 dark:border-violet-700',
      pillText: 'text-violet-800 dark:text-violet-100',
    };
  }

  // 8. SURGELÉS -> INDIGO GLACIER
  if (/\b(surgele|surgeles|congele|congeles|glace|glaces|frozen|ice)\b/.test(clean)) {
    return {
      name: 'indigo',
      emoji: '❄️',
      border: 'border-indigo-200/60 dark:border-indigo-800/50',
      bg: 'bg-indigo-50/30 dark:bg-indigo-950/20',
      header: 'bg-gradient-to-r from-indigo-100/80 to-indigo-50/20 dark:from-indigo-950/60 dark:to-indigo-900/20',
      text: 'text-indigo-700 dark:text-indigo-200',
      icon: 'text-indigo-600 dark:text-indigo-300',
      buttonHover: 'hover:bg-indigo-100 hover:text-indigo-700 dark:hover:bg-indigo-900/40',
      pillBg: 'bg-indigo-100/80 dark:bg-indigo-900/40',
      pillBorder: 'border-indigo-200 dark:border-indigo-700',
      pillText: 'text-indigo-800 dark:text-indigo-100',
    };
  }

  // 9. ENTRETIEN & HYGIÈNE -> TEAL / MENTHE
  if (
    /\b(entretien|menage|nettoyage|lessive|vaisselle|savon|shampoing|hygiene|papier|essuie|javel|nettoyant)\b/.test(
      clean
    )
  ) {
    return {
      name: 'teal',
      emoji: '🧼',
      border: 'border-teal-200/60 dark:border-teal-800/50',
      bg: 'bg-teal-50/30 dark:bg-teal-950/20',
      header: 'bg-gradient-to-r from-teal-100/80 to-teal-50/20 dark:from-teal-950/60 dark:to-teal-900/20',
      text: 'text-teal-700 dark:text-teal-200',
      icon: 'text-teal-600 dark:text-teal-300',
      buttonHover: 'hover:bg-teal-100 hover:text-teal-700 dark:hover:bg-teal-900/40',
      pillBg: 'bg-teal-100/80 dark:bg-teal-900/40',
      pillBorder: 'border-teal-200 dark:border-teal-700',
      pillText: 'text-teal-800 dark:text-teal-100',
    };
  }

  // 10. DÉFAUT / AUTRE -> ARDOISE NEUTRE ÉLÉGANT
  return {
    name: 'zinc',
    emoji: '📦',
    border: 'border-zinc-200/70 dark:border-zinc-800/50',
    bg: 'bg-zinc-50/40 dark:bg-zinc-950/20',
    header: 'bg-gradient-to-r from-zinc-100/80 to-zinc-50/20 dark:from-zinc-900/60 dark:to-zinc-950/20',
    text: 'text-zinc-700 dark:text-zinc-300',
    icon: 'text-zinc-600 dark:text-zinc-400',
    buttonHover: 'hover:bg-zinc-100 hover:text-zinc-800 dark:hover:bg-zinc-900/40',
    pillBg: 'bg-zinc-100 dark:bg-zinc-800/60',
    pillBorder: 'border-zinc-200 dark:border-zinc-700',
    pillText: 'text-zinc-800 dark:text-zinc-200',
  };
}

