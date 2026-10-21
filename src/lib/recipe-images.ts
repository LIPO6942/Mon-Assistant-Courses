/**
 * Helper to guarantee a high-definition, dish-appropriate photo for any recipe
 * whether predefined, AI-generated, or user-created.
 */

const CULINARY_KEYWORD_IMAGES: { keywords: string[]; url: string }[] = [
  {
    keywords: ['paella'],
    url: 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=800&auto=format&fit=crop&q=80'
  },
  {
    keywords: ['butter chicken', 'makhani', 'tikka masala', 'curry'],
    url: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&auto=format&fit=crop&q=80'
  },
  {
    keywords: ['pad thaï', 'pad thai', 'nouilles', 'chow mein', 'yakisoba'],
    url: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=800&auto=format&fit=crop&q=80'
  },
  {
    keywords: ['pho', 'ramen', 'soupe', 'bouillon', 'chorba', 'laksa'],
    url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format&fit=crop&q=80'
  },
  {
    keywords: ['burger', 'cheeseburger'],
    url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80'
  },
  {
    keywords: ['houmous', 'pita', 'falafel'],
    url: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=800&auto=format&fit=crop&q=80'
  },
  {
    keywords: ['salade', 'césar', 'cesar', 'grecque', 'niçoise', 'nicoise'],
    url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=80'
  },
  {
    keywords: ['couscous'],
    url: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&auto=format&fit=crop&q=80'
  },
  {
    keywords: ['chili con carne', 'haricots rouges'],
    url: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=800&auto=format&fit=crop&q=80'
  },
  {
    keywords: ['ratatouille', 'tian', 'légumes'],
    url: 'https://images.unsplash.com/photo-1572449043416-55f4685c9bb7?w=800&auto=format&fit=crop&q=80'
  },
  {
    keywords: ['omelette', 'œuf', 'oeuf', 'tortilla'],
    url: 'https://images.unsplash.com/photo-1510693206972-df098062cb71?w=800&auto=format&fit=crop&q=80'
  },
  {
    keywords: ['dahl', 'lentille', 'pois chiche'],
    url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80'
  },
  {
    keywords: ['gaspacho'],
    url: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=800&auto=format&fit=crop&q=80'
  },
  {
    keywords: ['crevette', 'gambas', 'fruits de mer'],
    url: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=800&auto=format&fit=crop&q=80'
  },
  {
    keywords: ['bruschetta', 'tartine'],
    url: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=800&auto=format&fit=crop&q=80'
  },
  {
    keywords: ['goulash', 'bourguignon', 'bœuf', 'boeuf', 'carbonnade', 'ragoût', 'ragout', 'osso buco'],
    url: 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=800&auto=format&fit=crop&q=80'
  },
  {
    keywords: ['ceviche'],
    url: 'https://images.unsplash.com/photo-1535400255456-984241443b29?w=800&auto=format&fit=crop&q=80'
  },
  {
    keywords: ['fish and chips', 'poisson', 'daurade', 'saumon', 'thieboudienne', 'moqueca'],
    url: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&auto=format&fit=crop&q=80'
  },
  {
    keywords: ['schnitzel', 'escalope', 'katsu', 'poulet'],
    url: 'https://images.unsplash.com/photo-1599921841143-8190253ae33f?w=800&auto=format&fit=crop&q=80'
  },
  {
    keywords: ['bibimbap', 'poke bowl', 'bowl'],
    url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80'
  },
  {
    keywords: ['spaghetti', 'pâtes', 'pates', 'carbonara', 'pesto', 'penne', 'tagliatelle', 'lasagne', 'makarouna'],
    url: 'https://images.unsplash.com/photo-1621996346565-e3d5d62816f9?w=800&auto=format&fit=crop&q=80'
  },
  {
    keywords: ['croque-monsieur', 'sandwich', 'chawarma', 'bánh mì', 'banh mi'],
    url: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800&auto=format&fit=crop&q=80'
  },
  {
    keywords: ['samosa', 'brik', 'coxinha', 'empanada'],
    url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop&q=80'
  },
  {
    keywords: ['avocado toast', 'avocat', 'guacamole'],
    url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&auto=format&fit=crop&q=80'
  },
  {
    keywords: ['quesadilla', 'tacos', 'fajita', 'mexicain', 'arepas'],
    url: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=800&auto=format&fit=crop&q=80'
  },
  {
    keywords: ['shakshuka', 'ojja', 'chakchouka'],
    url: 'https://images.unsplash.com/photo-1590412200988-a436970781fa?w=800&auto=format&fit=crop&q=80'
  },
  {
    keywords: ['risotto', 'riz', 'biryani', 'plov'],
    url: 'https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?w=800&auto=format&fit=crop&q=80'
  },
  {
    keywords: ['tajine', 'yassa', 'chich taouk', 'kofta'],
    url: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=800&auto=format&fit=crop&q=80'
  },
  {
    keywords: ['gyoza', 'ravioli', 'dumpling'],
    url: 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=800&auto=format&fit=crop&q=80'
  },
  {
    keywords: ['moussaka', 'gratin', 'pastitsio'],
    url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80'
  }
];

const DEFAULT_RECIPE_IMAGE = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=80';

/**
 * Returns a guaranteed high-quality image URL for any recipe.
 */
export function getRecipeImageUrl(recipe?: {
  title?: string;
  imageUrl?: string;
  photoDataUri?: string;
  category?: string;
  description?: string;
} | null): string {
  if (!recipe) return DEFAULT_RECIPE_IMAGE;

  if (recipe.photoDataUri && recipe.photoDataUri.trim()) {
    return recipe.photoDataUri;
  }

  if (recipe.imageUrl && recipe.imageUrl.trim()) {
    return recipe.imageUrl;
  }

  const textToMatch = `${recipe.title || ''} ${recipe.category || ''} ${recipe.description || ''}`.toLowerCase();

  for (const entry of CULINARY_KEYWORD_IMAGES) {
    if (entry.keywords.some(kw => textToMatch.includes(kw))) {
      return entry.url;
    }
  }

  return DEFAULT_RECIPE_IMAGE;
}
