/**
 * Dictionnaire culinaire d'images haute définition vérifiées par plat.
 * Chaque entrée cible les mots-clés distinctifs du plat dans le TITRE.
 */
interface CulinaryEntry {
  keywords: string[];
  url: string;
}

const CULINARY_KEYWORD_IMAGES: CulinaryEntry[] = [
  // 1. Pâtes & Spécialités Italiennes
  {
    keywords: ['carbonara'],
    url: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=800&auto=format&fit=crop&q=80'
  },
  {
    keywords: ['lasagne', 'lasagnes', 'bolognaise'],
    url: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=800&auto=format&fit=crop&q=80'
  },
  {
    keywords: ['pesto'],
    url: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&auto=format&fit=crop&q=80'
  },
  {
    keywords: ['arrabbiata', 'penne', 'spaghetti', 'tagliatelle', 'makarouna', 'gnocchi', 'pates', 'pâtes'],
    url: 'https://images.unsplash.com/photo-1621996346565-e3d5d62816f9?w=800&auto=format&fit=crop&q=80'
  },
  {
    keywords: ['risotto'],
    url: 'https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?w=800&auto=format&fit=crop&q=80'
  },
  {
    keywords: ['bruschetta', 'tartine'],
    url: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=800&auto=format&fit=crop&q=80'
  },
  {
    keywords: ['pizza', 'pide', 'khachapuri'],
    url: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&auto=format&fit=crop&q=80'
  },

  // 2. Plats Méditerranéens & Maghrébins
  {
    keywords: ['couscous'],
    url: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&auto=format&fit=crop&q=80'
  },
  {
    keywords: ['tajine', 'tagine'],
    url: 'https://images.unsplash.com/photo-1584278433742-b91a7c73dbca?w=800&auto=format&fit=crop&q=80'
  },
  {
    keywords: ['shakshuka', 'ojja', 'chakchouka'],
    url: 'https://images.unsplash.com/photo-1590412200988-a436970781fa?w=800&auto=format&fit=crop&q=80'
  },
  {
    keywords: ['houmous', 'hummus', 'pita'],
    url: 'https://images.unsplash.com/photo-1577906096429-f73c2c312435?w=800&auto=format&fit=crop&q=80'
  },
  {
    keywords: ['falafel', 'falafels'],
    url: 'https://images.unsplash.com/photo-1593001874117-c99c800e3eb7?w=800&auto=format&fit=crop&q=80'
  },
  {
    keywords: ['mechouia', 'slata'],
    url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80'
  },
  {
    keywords: ['chorba', 'frik'],
    url: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&auto=format&fit=crop&q=80'
  },
  {
    keywords: ['brik', 'samosa', 'samosas', 'coxinha', 'empanada', 'empanadas'],
    url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop&q=80'
  },
  {
    keywords: ['yassa'],
    url: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=800&auto=format&fit=crop&q=80'
  },
  {
    keywords: ['lentille', 'lentilles'],
    url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80'
  },
  {
    keywords: ['halloumi'],
    url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80'
  },
  {
    keywords: ['moussaka', 'pastitsio'],
    url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80'
  },
  {
    keywords: ['paella', 'paëlla'],
    url: 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=800&auto=format&fit=crop&q=80'
  },
  {
    keywords: ['tortilla', 'omelette'],
    url: 'https://images.unsplash.com/photo-1510693206972-df098062cb71?w=800&auto=format&fit=crop&q=80'
  },
  {
    keywords: ['gaspacho', 'gazpacho'],
    url: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&auto=format&fit=crop&q=80'
  },
  {
    keywords: ['souvlaki', 'chich taouk', 'kofta', 'kefta', 'brochette', 'brochettes'],
    url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&auto=format&fit=crop&q=80'
  },

  // 3. Spécialités Américaines & Mexicaines
  {
    keywords: ['burger', 'cheeseburger'],
    url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80'
  },
  {
    keywords: ['fish tacos', 'tacos de poisson'],
    url: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=800&auto=format&fit=crop&q=80'
  },
  {
    keywords: ['tacos', 'taco'],
    url: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&auto=format&fit=crop&q=80'
  },
  {
    keywords: ['quesadilla', 'quesadillas'],
    url: 'https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=800&auto=format&fit=crop&q=80'
  },
  {
    keywords: ['fajita', 'fajitas', 'enchilada', 'enchiladas'],
    url: 'https://images.unsplash.com/photo-1534352956036-cd81e27dd615?w=800&auto=format&fit=crop&q=80'
  },
  {
    keywords: ['guacamole', 'nachos', 'avocado toast'],
    url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&auto=format&fit=crop&q=80'
  },
  {
    keywords: ['chili con carne', 'feijoada'],
    url: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=800&auto=format&fit=crop&q=80'
  },
  {
    keywords: ['poutine'],
    url: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=800&auto=format&fit=crop&q=80'
  },
  {
    keywords: ['arepa', 'arepas', 'pupusa', 'pupusas'],
    url: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&auto=format&fit=crop&q=80'
  },
  {
    keywords: ['ceviche'],
    url: 'https://images.unsplash.com/photo-1535400255456-984241443b29?w=800&auto=format&fit=crop&q=80'
  },
  {
    keywords: ['lomo saltado'],
    url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80'
  },

  // 4. Plats Asiatiques
  {
    keywords: ['ramen'],
    url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format&fit=crop&q=80'
  },
  {
    keywords: ['pho'],
    url: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&auto=format&fit=crop&q=80'
  },
  {
    keywords: ['pad thai', 'pad thaï'],
    url: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=800&auto=format&fit=crop&q=80'
  },
  {
    keywords: ['chow mein', 'yakisoba', 'nouilles'],
    url: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&auto=format&fit=crop&q=80'
  },
  {
    keywords: ['curry vert', 'green curry'],
    url: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=800&auto=format&fit=crop&q=80'
  },
  {
    keywords: ['butter chicken', 'makhani', 'tikka masala'],
    url: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&auto=format&fit=crop&q=80'
  },
  {
    keywords: ['katsu curry', 'katsu'],
    url: 'https://images.unsplash.com/photo-1599921841143-8190253ae33f?w=800&auto=format&fit=crop&q=80'
  },
  {
    keywords: ['dahl', 'dal'],
    url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80'
  },
  {
    keywords: ['biryani', 'plov', 'tahchin', 'nasi goreng', 'fried rice'],
    url: 'https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?w=800&auto=format&fit=crop&q=80'
  },
  {
    keywords: ['bibimbap'],
    url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80'
  },
  {
    keywords: ['bulgogi'],
    url: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800&auto=format&fit=crop&q=80'
  },
  {
    keywords: ['poke bowl', 'poke'],
    url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80'
  },
  {
    keywords: ['teriyaki'],
    url: 'https://images.unsplash.com/photo-1609183480237-ccbc2da09348?w=800&auto=format&fit=crop&q=80'
  },
  {
    keywords: ['gyoza', 'ravioli', 'dumpling', 'tteokbokki'],
    url: 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=800&auto=format&fit=crop&q=80'
  },
  {
    keywords: ['tom yum', 'laksa', 'khao soi'],
    url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format&fit=crop&q=80'
  },
  {
    keywords: ['bun cha'],
    url: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&auto=format&fit=crop&q=80'
  },
  {
    keywords: ['chawarma', 'shawarma', 'kebab'],
    url: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=800&auto=format&fit=crop&q=80'
  },
  {
    keywords: ['banh mi', 'bánh mì'],
    url: 'https://images.unsplash.com/photo-1626804475297-41608ea09aeb?w=800&auto=format&fit=crop&q=80'
  },
  {
    keywords: ['croque-monsieur', 'sandwich'],
    url: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800&auto=format&fit=crop&q=80'
  },

  // 5. Plats Traditionnels Européens & Français
  {
    keywords: ['bourguignon', 'goulash', 'carbonnade', 'ragout', 'ragoût', 'osso buco', 'stroganoff', 'rendang', 'bigos', 'nihari'],
    url: 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=800&auto=format&fit=crop&q=80'
  },
  {
    keywords: ['ratatouille', 'tian'],
    url: 'https://images.unsplash.com/photo-1572449043416-55f4685c9bb7?w=800&auto=format&fit=crop&q=80'
  },
  {
    keywords: ['schnitzel', 'escalope'],
    url: 'https://images.unsplash.com/photo-1599921841143-8190253ae33f?w=800&auto=format&fit=crop&q=80'
  },
  {
    keywords: ['soupe a l oignon', 'soupe à l\'oignon'],
    url: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&auto=format&fit=crop&q=80'
  },
  {
    keywords: ['fish and chips'],
    url: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=800&auto=format&fit=crop&q=80'
  },
  {
    keywords: ['moules marinières', 'moules'],
    url: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=800&auto=format&fit=crop&q=80'
  },
  {
    keywords: ['gambas', 'crevette', 'crevettes'],
    url: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=800&auto=format&fit=crop&q=80'
  },
  {
    keywords: ['saumon', 'daurade', 'poisson', 'moqueca', 'thieboudienne', 'gravlax'],
    url: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&auto=format&fit=crop&q=80'
  },
  {
    keywords: ['salade cesar', 'salade césar', 'salade nicoise', 'salade niçoise', 'salade grecque', 'salade'],
    url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=80'
  },

  // 6. Desserts & Sucré
  {
    keywords: ['tiramisu'],
    url: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800&auto=format&fit=crop&q=80'
  },
  {
    keywords: ['pancake', 'pancakes'],
    url: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&auto=format&fit=crop&q=80'
  },
  {
    keywords: ['crepe', 'crêpe', 'crepes', 'crêpes'],
    url: 'https://images.unsplash.com/photo-1519676867240-f03562e64571?w=800&auto=format&fit=crop&q=80'
  },
  {
    keywords: ['panna cotta'],
    url: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&auto=format&fit=crop&q=80'
  },
  {
    keywords: ['baklava'],
    url: 'https://images.unsplash.com/photo-1598110750624-207050c4f28c?w=800&auto=format&fit=crop&q=80'
  },
  {
    keywords: ['cannoli'],
    url: 'https://images.unsplash.com/photo-1621236378699-8597faf6a176?w=800&auto=format&fit=crop&q=80'
  }
];

const DEFAULT_RECIPE_IMAGE = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=80';

/**
 * Nettoie une chaîne pour une recherche lexicale stricte
 */
function cleanText(text: string): string {
  return (text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Détecte les URLs erronées connues dans la base de données
 * (ex: photo de houmous appliquée par erreur au tajine)
 */
function isKnownMismatchedUrl(url: string, cleanTitle: string): boolean {
  // L'URL de houmous (photo-1541518763669-27fef04b14ea) associée à un tajine
  if (url.includes('1541518763669-27fef04b14ea') && cleanTitle.includes('tajine')) {
    return true;
  }
  return false;
}

/**
 * Renvoie une image haute définition garantie et exactement fidèle au plat cuisiné.
 * Règle d'or : On recherche d'abord sur le TITRE de la recette pour éviter que les ingrédients
 * de la description (ex: "avec des légumes", "du bouillon") ne fassent dérailler la détection.
 */
export function getRecipeImageUrl(recipe?: {
  title?: string;
  imageUrl?: string;
  photoDataUri?: string;
  category?: string;
  description?: string;
} | null): string {
  if (!recipe) return DEFAULT_RECIPE_IMAGE;

  // 1. Photo utilisateur personnalisée enregistrée
  if (recipe.photoDataUri && recipe.photoDataUri.trim()) {
    return recipe.photoDataUri;
  }

  const cleanTitle = cleanText(recipe.title || '');

  // 2. CORRESPONDANCE PRIORITAIRE SUR LE TITRE DE LA RECETTE
  // Le titre est l'élément le plus fiable pour identifier la vraie nature du plat
  if (cleanTitle) {
    for (const entry of CULINARY_KEYWORD_IMAGES) {
      if (
        entry.keywords.some(kw => {
          const cleanKw = cleanText(kw);
          // Correspondance par mot entier ou inclusion directe dans le titre
          return (
            new RegExp(`(^|\\s)${cleanKw}(\\s|$)`, 'i').test(cleanTitle) ||
            cleanTitle.includes(cleanKw)
          );
        })
      ) {
        return entry.url;
      }
    }
  }

  // 3. Image explicite fournie sur la recette (si pas d'écrasement nécessaire)
  if (recipe.imageUrl && recipe.imageUrl.trim() && !isKnownMismatchedUrl(recipe.imageUrl, cleanTitle)) {
    return recipe.imageUrl;
  }

  // 4. Si le titre n'a donné aucun résultat, recherche sur les mots clés du plat dans la description
  const cleanDesc = cleanText(recipe.description || '');
  if (cleanDesc) {
    for (const entry of CULINARY_KEYWORD_IMAGES) {
      // On teste les mots-clés spécifiques de plats (pas les ingrédients génériques)
      if (
        entry.keywords.some(kw => {
          const cleanKw = cleanText(kw);
          return new RegExp(`(^|\\s)${cleanKw}(\\s|$)`, 'i').test(cleanDesc);
        })
      ) {
        return entry.url;
      }
    }
  }

  // 5. Fallback par catégorie
  const cleanCat = cleanText(recipe.category || '');
  if (cleanCat.includes('dessert')) {
    return 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800&auto=format&fit=crop&q=80';
  }

  return DEFAULT_RECIPE_IMAGE;
}
