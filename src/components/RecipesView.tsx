

'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Shuffle, Dices, Clock, Coins, Utensils, BookUser, Search, Tag, Sparkles, TrendingDown, ClipboardList, Check, Trash2, Plus, Minus, Users, ChevronUp, ChevronDown, Loader2, X, Calendar, AlertCircle, Cake, PackageCheck, CheckCircle2, Globe } from 'lucide-react';
import type { Recipe, UserRecipe, BasketItem, PurchaseHistory, CommunityPurchase, DbaratiItem, Ingredient, RecipeIngredient } from '@/lib/types';
import { streetFoodOptions } from '@/lib/data';
import { cn, getProductStatus, formatDbaratiDate } from '@/lib/utils';
import Image from 'next/image';
import { listenCommunityPurchases } from '@/lib/firestore-sync';
import { calculateMarketPrices, calculateRecipeCost, getRecipeAvailabilityPercentage, formatPrice } from '@/lib/price-utils';
import { getRecipeImageUrl } from '@/lib/recipe-images';
import { isIngredientMatch, findMatchingPantryItem } from '@/lib/smart-ingredient-matching';

// Mapping pays -> couleurs drapeau (gradient) + emoji
const COUNTRY_FLAG_MAP: Record<string, { colors: string; emoji: string }> = {
  'Tunisie': { colors: 'from-red-500/20 via-white/10 to-red-500/20', emoji: '🇹🇳' },
  'France': { colors: 'from-blue-500/20 via-white/10 to-red-500/20', emoji: '🇫🇷' },
  'Italie': { colors: 'from-green-500/20 via-white/10 to-red-500/20', emoji: '🇮🇹' },
  'Japon': { colors: 'from-white/10 via-red-500/25 to-white/10', emoji: '🇯🇵' },
  'Mexique': { colors: 'from-green-600/20 via-white/10 to-red-600/20', emoji: '🇲🇽' },
  'Maroc': { colors: 'from-red-600/20 via-green-600/15 to-red-600/20', emoji: '🇲🇦' },
  'Espagne': { colors: 'from-red-500/20 via-yellow-400/20 to-red-500/20', emoji: '🇪🇸' },
  'Grèce': { colors: 'from-blue-600/20 via-white/10 to-blue-600/20', emoji: '🇬🇷' },
  'Inde': { colors: 'from-orange-500/20 via-white/10 to-green-600/20', emoji: '🇮🇳' },
  'Thaïlande': { colors: 'from-red-500/15 via-blue-600/20 to-red-500/15', emoji: '🇹🇭' },
  'Chine': { colors: 'from-red-600/20 via-yellow-400/15 to-red-600/20', emoji: '🇨🇳' },
  'Corée du Sud': { colors: 'from-blue-500/15 via-white/10 to-red-500/15', emoji: '🇰🇷' },
  'Turquie': { colors: 'from-red-600/20 via-white/10 to-red-600/20', emoji: '🇹🇷' },
  'Liban': { colors: 'from-red-500/15 via-green-600/15 to-red-500/15', emoji: '🇱🇧' },
  'Argentine': { colors: 'from-sky-400/20 via-white/10 to-sky-400/20', emoji: '🇦🇷' },
  'Brésil': { colors: 'from-green-500/20 via-yellow-400/20 to-green-500/20', emoji: '🇧🇷' },
  'USA': { colors: 'from-blue-600/15 via-white/10 to-red-500/15', emoji: '🇺🇸' },
  'États-Unis': { colors: 'from-blue-600/15 via-white/10 to-red-500/15', emoji: '🇺🇸' },
  'Vietnam': { colors: 'from-red-600/20 via-yellow-400/15 to-red-600/20', emoji: '🇻🇳' },
  'Pérou': { colors: 'from-red-600/20 via-white/10 to-red-600/20', emoji: '🇵🇪' },
  'Royaume-Uni': { colors: 'from-blue-600/15 via-red-500/15 to-white/10', emoji: '🇬🇧' },
  'Belgique': { colors: 'from-black/10 via-yellow-400/20 to-red-600/20', emoji: '🇧🇪' },
  'Pologne': { colors: 'from-white/10 via-white/5 to-red-500/20', emoji: '🇵🇱' },
  'Hongrie': { colors: 'from-red-500/15 via-white/10 to-green-600/15', emoji: '🇭🇺' },
  'Suède': { colors: 'from-blue-600/20 via-yellow-400/20 to-blue-600/20', emoji: '🇸🇪' },
  'Iran': { colors: 'from-green-600/15 via-white/10 to-red-600/15', emoji: '🇮🇷' },
  'Indonésie': { colors: 'from-red-500/20 via-white/10 to-red-500/20', emoji: '🇮🇩' },
  'Philippines': { colors: 'from-blue-600/15 via-red-500/15 to-yellow-400/15', emoji: '🇵🇭' },
  'Cuba': { colors: 'from-blue-600/15 via-white/10 to-red-500/15', emoji: '🇨🇺' },
  'Sénégal': { colors: 'from-green-600/15 via-yellow-400/15 to-red-500/15', emoji: '🇸🇳' },
  'Éthiopie': { colors: 'from-green-600/15 via-yellow-400/15 to-red-500/15', emoji: '🇪🇹' },
  'Pakistan': { colors: 'from-green-700/20 via-white/10 to-green-700/20', emoji: '🇵🇰' },
  'Jordanie': { colors: 'from-black/10 via-green-600/15 to-red-500/15', emoji: '🇯🇴' },
  'Australie': { colors: 'from-blue-700/15 via-white/10 to-blue-700/15', emoji: '🇦🇺' },
  'Canada': { colors: 'from-red-600/20 via-white/10 to-red-600/20', emoji: '🇨🇦' },
  'Autriche': { colors: 'from-red-500/20 via-white/10 to-red-500/20', emoji: '🇦🇹' },
  'Roumanie': { colors: 'from-blue-600/15 via-yellow-400/15 to-red-500/15', emoji: '🇷🇴' },
  'Venezuela': { colors: 'from-yellow-400/15 via-blue-600/15 to-red-500/15', emoji: '🇻🇪' },
  'Géorgie': { colors: 'from-white/10 via-red-600/20 to-white/10', emoji: '🇬🇪' },
  'Salvador': { colors: 'from-blue-600/20 via-white/10 to-blue-600/20', emoji: '🇸🇻' },
  'Slovaquie': { colors: 'from-white/10 via-blue-600/15 to-red-500/15', emoji: '🇸🇰' },
  'Russie': { colors: 'from-white/10 via-blue-600/15 to-red-500/15', emoji: '🇷🇺' },
  'Singapour': { colors: 'from-red-500/15 via-white/10 to-red-500/15', emoji: '🇸🇬' },
  'Malaisie': { colors: 'from-blue-600/15 via-yellow-400/15 to-red-500/15', emoji: '🇲🇾' },
  'Antilles': { colors: 'from-blue-500/20 via-yellow-400/20 to-green-500/20', emoji: '🏝️' },
  'Martinique': { colors: 'from-blue-600/20 via-white/10 to-blue-600/20', emoji: '🇲🇶' },
  'Guadeloupe': { colors: 'from-blue-600/20 via-yellow-400/20 to-red-500/20', emoji: '🇬🇵' },
  'Caraïbes': { colors: 'from-cyan-500/20 via-yellow-400/20 to-emerald-500/20', emoji: '🌴' },
  'Haïti': { colors: 'from-blue-600/20 via-red-600/20 to-blue-600/20', emoji: '🇭🇹' },
  'Jamaïque': { colors: 'from-green-600/20 via-yellow-400/20 to-black/20', emoji: '🇯🇲' },
};

function getCountryFlag(tags?: string): { colors: string; emoji: string } | null {
  if (!tags) return null;
  const tagList = tags.split(',').map(t => t.trim().toLowerCase());
  for (const [country, data] of Object.entries(COUNTRY_FLAG_MAP)) {
    if (tagList.some(t => country.toLowerCase().includes(t) || t.includes(country.toLowerCase()))) {
      return data;
    }
  }
  // Fallback: check compound countries
  for (const tag of tagList) {
    for (const [country, data] of Object.entries(COUNTRY_FLAG_MAP)) {
      if (tag.includes(country.toLowerCase()) || country.toLowerCase().includes(tag)) {
        return data;
      }
    }
  }
  return null;
}
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';

const normalizeString = (s: string) =>
  s.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/['’\-]/g, " ") // replace apostrophes and dashes with space
    .replace(/[^a-z0-9 ]/g, "") // remove other special chars
    .trim();

export type ContinentFilter = 'Tous' | 'Europe' | 'Asie' | 'Amériques' | 'Afrique' | 'Océanie';

export function getRecipeContinent(country?: string): ContinentFilter {
  if (!country) return 'Europe';
  const c = country.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  if (c.includes('oceanie') || c.includes('australie') || c.includes('zelande') || c.includes('polynesie') || c.includes('tahiti') || c.includes('fidji')) {
    return 'Océanie';
  }
  if (c.includes('afrique') || c.includes('senegal') || c.includes('maroc') || c.includes('ethiopie') || c.includes('tunisie') || c.includes('liban') || c.includes('jordanie') || c.includes('iran') || c.includes('turquie') || c.includes('moyen orient') || c.includes('moyen-orient')) {
    return 'Afrique';
  }
  if (c.includes('asie') || c.includes('japon') || c.includes('coree') || c.includes('thailande') || c.includes('taiwan') || c.includes('chine') || c.includes('vietnam') || c.includes('inde') || c.includes('pakistan') || c.includes('indonesie') || c.includes('singapour') || c.includes('malaisie') || c.includes('philippines') || c.includes('ouzbekistan')) {
    return 'Asie';
  }
  if (c.includes('amerique') || c.includes('mexique') || c.includes('perou') || c.includes('etats unis') || c.includes('usa') || c.includes('bresil') || c.includes('argentine') || c.includes('canada') || c.includes('quebec') || c.includes('cuba') || c.includes('salvador') || c.includes('venezuela') || c.includes('hawai') || c.includes('antilles') || c.includes('martinique') || c.includes('guadeloupe') || c.includes('caraibes') || c.includes('haiti') || c.includes('jamaique')) {
    return 'Amériques';
  }
  return 'Europe';
}

export function getRecipePantryAvailability(
  recipeIngredients: RecipeIngredient[],
  pantry: Ingredient[] = [],
  purchaseHistory?: PurchaseHistory,
  dbarati?: DbaratiItem[]
): {
  availableCount: number;
  totalCount: number;
  percentage: number;
} {
  if (!recipeIngredients || recipeIngredients.length === 0) {
    return { availableCount: 0, totalCount: 0, percentage: 100 };
  }
  if (!pantry || pantry.length === 0) {
    return { availableCount: 0, totalCount: recipeIngredients.length, percentage: 0 };
  }

  let matched = 0;
  for (const ing of recipeIngredients) {
    const pantryItem = findMatchingPantryItem(ing.name, pantry);
    if (pantryItem) {
      if (purchaseHistory && dbarati) {
        const history = purchaseHistory[pantryItem.id] || purchaseHistory[pantryItem.name] || purchaseHistory[pantryItem.name.toLowerCase()];
        const status = getProductStatus(history, pantryItem.name, dbarati);
        // Si le produit est épuisé ou consommé dans Dbarati (statut rouge), il n'est plus disponible
        if (status === 'red') {
          continue;
        }
      }
      matched++;
    }
  }

  return {
    availableCount: matched,
    totalCount: recipeIngredients.length,
    percentage: Math.round((matched / recipeIngredients.length) * 100),
  };
}

export function containsRhum(recipe: Recipe): boolean {
  const hasRhum = (s?: string) => s ? /\b(rhum|rum)\b/i.test(s) : false;
  if (hasRhum(recipe.title) || hasRhum(recipe.description) || hasRhum(recipe.preparation)) return true;
  return (recipe.ingredients || []).some(ing => hasRhum(ing.name));
}

export function isDessertRecipe(recipe: Recipe): boolean {
  if (recipe.category === 'Dessert') return true;
  if (recipe.category === 'Plat' || recipe.category === 'Entrée') return false;

  const dessertIds = new Set([
    'r128', 'r131', 'r134', 'r139', 'r141', 'r142', 'r161', 'r162', 'r165',
    'r184', 'r187', 'r189', 'r190', 'r191', 'r192', 'r193', 'r194', 'r195', 'r196', 'r197', 'r198'
  ]);
  if (recipe.id && dessertIds.has(recipe.id)) return true;

  const title = (recipe.title || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const desc = (recipe.description || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const dessertKeywords = [
    'tiramisu', 'panna cotta', 'crepes sucrees', 'baklava', 'pancake',
    'cannoli', 'pastel de nata', 'brownie', 'pavlova', 'flan coco',
    'blanc-manger', 'mousse au chocolat', 'tarte tatin', 'creme brulee',
    'churros', 'cheesecake', 'dorayaki', 'crumble', 'fondant au chocolat',
    'mahalabia', 'tres leches', 'mango sticky rice'
  ];
  return dessertKeywords.some(kw => title.includes(kw) || desc.includes(kw));
}

export type DishCourseFilter = 'plat' | 'dessert' | 'all';

interface RecipesViewProps {
  setViewingRecipe: (recipe: (Omit<Recipe, 'id'> & { id?: string; }) | null) => void;
  discoverableRecipes: Recipe[];
  handleSaveRecipe: (recipe: Omit<Recipe, 'id'> & { id?: string; }) => void;
  userRecipes: UserRecipe[];
  openUserRecipeForm: (recipe?: UserRecipe) => void;
  onViewUserRecipe: (recipe: UserRecipe | null) => void;
  basket: BasketItem[];
  purchaseHistory: PurchaseHistory;
  dbarati: DbaratiItem[];
  pantry?: Ingredient[];
  onAddDbaratiItem: (
    text: string,
    type?: 'plat' | 'entree' | 'dessert',
    tag?: 'Soupe' | 'Salade' | 'Sauce',
    platTag?: 'Pates' | 'Sauces' | 'Sandwich' | 'Autres',
    dessertTag?: 'Gâteau' | 'Crème' | 'Fruits' | 'Pâtisserie' | 'Autres'
  ) => void;
  onToggleDbaratiItem: (id: string) => void;
  onMarkPrepared: (id: string, customDateIso?: string) => void;
  onSetDbaratiItemDone?: (id: string, done: boolean) => void;
  onDeleteDbaratiItem: (id: string) => void;
  onUpdateDbaratiItem: (id: string, text: string) => void;
  onMoveDbaratiItem: (id: string, direction: 'up' | 'down') => void;
  onUpdateDbaratiItemPlatTag: (id: string, platTag: 'Pates' | 'Sauces' | 'Sandwich' | 'Autres') => void;
  onUpdateDbaratiItemDessertTag?: (id: string, dessertTag: 'Gâteau' | 'Crème' | 'Fruits' | 'Pâtisserie' | 'Autres') => void;
  onRemovePrepDate?: (id: string, dateIsoToRemove: string) => void;
  onAddToRecetteti?: (recipe: Recipe) => void;
}

export default function RecipesView({
  setViewingRecipe,
  discoverableRecipes,
  handleSaveRecipe,
  userRecipes,
  openUserRecipeForm,
  onViewUserRecipe,
  basket,
  purchaseHistory,
  dbarati,
  pantry = [],
  onAddDbaratiItem,
  onToggleDbaratiItem,
  onMarkPrepared,
  onRemovePrepDate,
  onAddToRecetteti,
  onSetDbaratiItemDone,
  onDeleteDbaratiItem,
  onUpdateDbaratiItem,
  onMoveDbaratiItem,
  onUpdateDbaratiItemPlatTag,
  onUpdateDbaratiItemDessertTag,
}: RecipesViewProps) {
  const [suggestedRecipes, setSuggestedRecipes] = useState<Recipe[]>([]);
  const [dishCourseFilter, setDishCourseFilter] = useState<DishCourseFilter>('plat');
  const [selectedContinent, setSelectedContinent] = useState<ContinentFilter>('Tous');
  const [sortByAvailability, setSortByAvailability] = useState(false);
  const [selectedStreetFood, setSelectedStreetFood] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [displayedFood, setDisplayedFood] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const dbaratiIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [dbaratiAddedId, setDbaratiAddedId] = useState<string | null>(null);

  const [filterQuick, setFilterQuick] = useState(false);
  const [filterEconomical, setFilterEconomical] = useState(false);
  const [ideaPortions, setIdeaPortions] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('mac_idea_portions');
        if (saved) {
          const parsed = parseInt(saved, 10);
          if (!isNaN(parsed) && parsed >= 1 && parsed <= 20) return parsed;
        }
      } catch { }
    }
    return 4;
  });

  const handleSetIdeaPortions = (portionsOrUpdater: number | ((prev: number) => number)) => {
    setIdeaPortions(prev => {
      const next = typeof portionsOrUpdater === 'function' ? portionsOrUpdater(prev) : portionsOrUpdater;
      const clamped = Math.max(1, Math.min(20, next));
      try {
        localStorage.setItem('mac_idea_portions', clamped.toString());
      } catch { }
      return clamped;
    });
  };

  const [communityPurchases, setCommunityPurchases] = useState<CommunityPurchase[]>([]);
  const [userRecipeTagFilter, setUserRecipeTagFilter] = useState('');
  const [isDbaratiSpinning, setIsDbaratiSpinning] = useState(false);
  const [dbaratiDisplayedItem, setDbaratiDisplayedItem] = useState<string | null>(null);
  const [dbaratiSelectedItem, setDbaratiSelectedItem] = useState<string | null>(null);
  const [dbaratiSelectedEmoji, setDbaratiSelectedEmoji] = useState<string>('🍳');

  // Entrees state
  const [newEntreeText, setNewEntreeText] = useState('');
  const [newEntreeTag, setNewEntreeTag] = useState<'Soupe' | 'Salade' | 'Sauce'>('Salade');
  const [activeEntreeFilter, setActiveEntreeFilter] = useState<'Toutes' | 'Soupe' | 'Salade' | 'Sauce'>('Toutes');
  const [isEntreesExpanded, setIsEntreesExpanded] = useState(false);

  // Plats state
  const [newPlatText, setNewPlatText] = useState('');
  const [newPlatTag, setNewPlatTag] = useState<'Pates' | 'Sauces' | 'Sandwich' | 'Autres'>('Autres');
  const [activePlatFilter, setActivePlatFilter] = useState<'Tous' | 'Pates' | 'Sauces' | 'Sandwich' | 'Autres'>('Tous');
  const [isPlatsExpanded, setIsPlatsExpanded] = useState(true);
  const [longPressItemId, setLongPressItemId] = useState<string | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  // ID of the plat whose history panel is open (inline)
  const [openHistoryId, setOpenHistoryId] = useState<string | null>(null);

  // Desserts state
  const [newDessertText, setNewDessertText] = useState('');
  const [newDessertTag, setNewDessertTag] = useState<'Gâteau' | 'Crème' | 'Fruits' | 'Pâtisserie' | 'Autres'>('Gâteau');
  const [activeDessertFilter, setActiveDessertFilter] = useState<'Tous' | 'Gâteau' | 'Crème' | 'Fruits' | 'Pâtisserie' | 'Autres'>('Tous');
  const [isDessertsExpanded, setIsDessertsExpanded] = useState(true);

  // Preparation modal state
  const [preparingDish, setPreparingDish] = useState<DbaratiItem | null>(null);
  const [selectedPrepDate, setSelectedPrepDate] = useState<string>('');

  const getLocalDateString = (d: Date = new Date()) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const toLocalDateKey = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return '';
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch {
      return '';
    }
  };

  const todayStr = useMemo(() => getLocalDateString(), []);

  // Stats Dbarati : Rituels de la semaine (pliable par défaut)
  const [isRitualsExpanded, setIsRitualsExpanded] = useState(false);
  const [selectedStatDay, setSelectedStatDay] = useState<number | null>(null);

  const weekRituals = useMemo(() => {
    const WEEK_DAYS = ['lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'dim'] as const;
    const FULL_WEEK_DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'] as const;

    interface DayDetail {
      dayShort: string;
      dayFull: string;
      count: number;
      dishesMap: Record<string, number>;
    }

    const days: DayDetail[] = WEEK_DAYS.map((short, i) => ({
      dayShort: short,
      dayFull: FULL_WEEK_DAYS[i],
      count: 0,
      dishesMap: {},
    }));

    let totalPreps = 0;

    dbarati.forEach(item => {
      const dates = item.prepHistory && item.prepHistory.length > 0
        ? item.prepHistory
        : (item.lastPreparedAt ? [item.lastPreparedAt] : []);

      dates.forEach(iso => {
        const d = new Date(iso);
        if (!isNaN(d.getTime())) {
          const jsDay = d.getDay(); // 0 = Dimanche, 1 = Lundi, ...
          const dayIdx = (jsDay + 6) % 7; // 0 = Lun, ..., 6 = Dim
          days[dayIdx].count += 1;
          days[dayIdx].dishesMap[item.text] = (days[dayIdx].dishesMap[item.text] || 0) + 1;
          totalPreps += 1;
        }
      });
    });

    const maxCount = Math.max(...days.map(d => d.count), 1);
    const todayDayIdx = (new Date().getDay() + 6) % 7;

    const topDay = [...days].sort((a, b) => b.count - a.count)[0];

    const confirmedRituals: Array<{ dayShort: string; dayFull: string; dish: string; count: number }> = [];
    days.forEach(d => {
      const entries = Object.entries(d.dishesMap).sort((a, b) => b[1] - a[1]);
      if (entries.length > 0) {
        entries.filter(([, count]) => count >= 2).forEach(([dish, count]) => {
          confirmedRituals.push({
            dayShort: d.dayShort,
            dayFull: d.dayFull,
            dish,
            count,
          });
        });
      }
    });

    return {
      days,
      totalPreps,
      maxCount,
      todayDayIdx,
      topDay: topDay && topDay.count > 0 ? topDay : null,
      confirmedRituals,
    };
  }, [dbarati]);

  const dishPrepDates = useMemo(() => {
    if (!preparingDish) return new Set<string>();
    const history = preparingDish.prepHistory && preparingDish.prepHistory.length > 0
      ? preparingDish.prepHistory
      : (preparingDish.lastPreparedAt ? [preparingDish.lastPreparedAt] : []);
    return new Set(history.map(toLocalDateKey).filter(Boolean));
  }, [preparingDish]);

  const isDateAlreadyUsed = useMemo(() => {
    if (!selectedPrepDate) return false;
    return dishPrepDates.has(selectedPrepDate);
  }, [selectedPrepDate, dishPrepDates]);

  const isFutureDate = useMemo(() => {
    if (!selectedPrepDate) return false;
    return selectedPrepDate > todayStr;
  }, [selectedPrepDate, todayStr]);

  const handleOpenPrepModal = (item: DbaratiItem) => {
    setPreparingDish(item);
    setSelectedPrepDate(todayStr);
  };

  const handleConfirmPreparation = () => {
    if (!preparingDish || !selectedPrepDate || isDateAlreadyUsed || isFutureDate) return;
    let dateIsoToSave: string;
    if (selectedPrepDate === todayStr) {
      dateIsoToSave = new Date().toISOString();
    } else {
      const [y, m, d] = selectedPrepDate.split('-').map(Number);
      const targetDate = new Date(y, m - 1, d, 12, 0, 0);
      dateIsoToSave = targetDate.toISOString();
    }
    onMarkPrepared(preparingDish.id, dateIsoToSave);
    setPreparingDish(null);
  };

  const handleReactivateWithoutHistory = () => {
    if (!preparingDish) return;
    if (onSetDbaratiItemDone) {
      onSetDbaratiItemDone(preparingDish.id, true);
    } else {
      onToggleDbaratiItem(preparingDish.id);
    }
    setPreparingDish(null);
  };

  const handleRemovePrep = (dateToRemove: string) => {
    if (!preparingDish) return;
    if (window.confirm(`Supprimer la préparation du ${formatDbaratiDate(dateToRemove, { withYear: true })} ?`)) {
      if (onRemovePrepDate) {
        onRemovePrepDate(preparingDish.id, dateToRemove);
      }
      setPreparingDish(prev => {
        if (!prev) return null;
        const existing = prev.prepHistory && prev.prepHistory.length > 0
          ? prev.prepHistory
          : (prev.lastPreparedAt ? [prev.lastPreparedAt] : []);
        const newHistory = existing.filter(d => d !== dateToRemove);
        const newLatest = newHistory.length > 0 ? newHistory[newHistory.length - 1] : undefined;
        return {
          ...prev,
          done: newHistory.length > 0 ? prev.done : false,
          lastPreparedAt: newLatest,
          prepCount: newHistory.length,
          prepHistory: newHistory,
        };
      });
    }
  };

  const handleItemCheckClick = (item: DbaratiItem) => {
    if (item.done) {
      // Décocher : on passe done = false sans toucher à l'historique
      onToggleDbaratiItem(item.id);
    } else {
      // Cocher : on ouvre la modale de validation de date
      handleOpenPrepModal(item);
    }
  };

  // Listen to community purchases for recipe cost calculations
  useEffect(() => {
    let isMounted = true;

    try {
      const unsubscribe = listenCommunityPurchases((data) => {
        if (isMounted) {
          setCommunityPurchases(data as CommunityPurchase[]);
        }
      });

      return () => {
        isMounted = false;
        unsubscribe();
      };
    } catch (err) {
      console.error("Error listening to community purchases:", err);
    }
  }, []);

  const isTunisianRecipe = (r: Recipe): boolean => {
    const country = (r.country || '').toLowerCase().trim();
    const title = (r.title || '').toLowerCase().trim();
    const desc = (r.description || '').toLowerCase().trim();

    if (country.includes('tunis')) return true;
    if (title.includes('tunis') || desc.includes('tunis')) return true;

    const tunisianKeywords = [
      'mechouia', 'ojja', 'chorba frik', 'makarouna bel allouch',
      'brik', 'lablabi', 'kafteji', 'kamounia', 'rouz jerbi'
    ];
    return tunisianKeywords.some(kw => title.includes(kw));
  };


  const filteredDiscoverableRecipes = useMemo(() => {
    return discoverableRecipes.filter(recipe => {
      if (containsRhum(recipe)) return false;
      if (isTunisianRecipe(recipe)) return false;
      // Exclure les recettes déjà présentes dans Recetteti (userRecipes)
      const isAlreadyInRecetteti = userRecipes.some(
        ur => ur.title.toLowerCase().trim() === recipe.title.toLowerCase().trim()
      );
      if (isAlreadyInRecetteti) return false;

      // Filtre Plats (salé) vs Desserts (sucré)
      if (dishCourseFilter === 'plat' && isDessertRecipe(recipe)) return false;
      if (dishCourseFilter === 'dessert' && !isDessertRecipe(recipe)) return false;

      // Filtre par continent
      if (selectedContinent !== 'Tous') {
        const continent = getRecipeContinent(recipe.country);
        if (continent !== selectedContinent) return false;
      }

      const quickMatch = !filterQuick || (recipe.preparationTime !== undefined && recipe.preparationTime <= 30);
      const economicalMatch = !filterEconomical || !!recipe.isEconomical;
      return quickMatch && economicalMatch;
    });
  }, [discoverableRecipes, userRecipes, dishCourseFilter, selectedContinent, filterQuick, filterEconomical]);

  const filteredUserRecipes = useMemo(() => {
    if (!userRecipeTagFilter) return userRecipes;
    const filterTags = userRecipeTagFilter.toLowerCase().split(',').map(t => t.trim()).filter(Boolean);
    if (filterTags.length === 0) return userRecipes;

    return userRecipes.filter(recipe => {
      const recipeTags = (recipe.tags || '').toLowerCase().split(',').map(t => t.trim());
      return filterTags.every(ft => recipeTags.includes(ft));
    });

  }, [userRecipes, userRecipeTagFilter]);

  // Listen to community purchases for recipe cost calculations
  useEffect(() => {
    let isMounted = true;

    try {
      const unsubscribe = listenCommunityPurchases((data) => {
        if (isMounted) {
          setCommunityPurchases(data as CommunityPurchase[]);
        }
      });

      return () => {
        isMounted = false;
        unsubscribe();
      };
    } catch (err) {
      console.error("Error listening to community purchases:", err);
    }
  }, []);

  // Cleanup interval on component unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (dbaratiIntervalRef.current) {
        clearInterval(dbaratiIntervalRef.current);
      }
    };
  }, []);

  // Calculate market prices from community purchases
  const marketPrices = useMemo(() => {
    return calculateMarketPrices(communityPurchases);
  }, [communityPurchases]);

  // Adjust recipe total cost and cost per person dynamically based on selected ideaPortions
  const getAdjustedRecipeCost = (recipe: Recipe) => {
    const basePortions = recipe.portions && recipe.portions > 0 ? recipe.portions : 4;
    const rawCost = calculateRecipeCost(recipe.ingredients, marketPrices);
    if (rawCost.totalCost === null) {
      return { totalCost: null, perPersonCost: null, basePortions };
    }
    const perPersonCost = rawCost.totalCost / basePortions;
    const totalCost = perPersonCost * ideaPortions;
    return {
      totalCost,
      perPersonCost,
      basePortions,
    };
  };

  // Purger automatiquement les recettes suggérées dès qu'elles sont enregistrées dans Recetteti
  useEffect(() => {
    setSuggestedRecipes(prev =>
      prev.filter(r => !userRecipes.some(ur => ur.title.toLowerCase().trim() === r.title.toLowerCase().trim()))
    );
  }, [userRecipes]);

  const findRandomRecipes = () => {
    if (filteredDiscoverableRecipes.length === 0) {
      setSuggestedRecipes([]);
      return;
    }
    if (sortByAvailability) {
      // Tri du plus présent au moins présent selon les ingrédients du garde-manger (prenant en compte Dbarati) !
      const sorted = [...filteredDiscoverableRecipes].sort((a, b) => {
        const pA = getRecipePantryAvailability(a.ingredients, pantry, purchaseHistory, dbarati).percentage;
        const pB = getRecipePantryAvailability(b.ingredients, pantry, purchaseHistory, dbarati).percentage;
        return pB - pA;
      });
      setSuggestedRecipes(sorted.slice(0, 4));
    } else {
      // Aléatoire standard : en mode 'all', proposer un duo équilibré (1 plat + 1 dessert) si disponibles
      if (dishCourseFilter === 'all') {
        const savories = filteredDiscoverableRecipes.filter(r => !isDessertRecipe(r));
        const desserts = filteredDiscoverableRecipes.filter(r => isDessertRecipe(r));
        const picked: Recipe[] = [];
        if (savories.length > 0) {
          picked.push(savories[Math.floor(Math.random() * savories.length)]);
        }
        if (desserts.length > 0) {
          picked.push(desserts[Math.floor(Math.random() * desserts.length)]);
        }
        if (picked.length > 0) {
          setSuggestedRecipes(picked);
          return;
        }
      }
      const shuffled = [...filteredDiscoverableRecipes].sort(() => 0.5 - Math.random());
      setSuggestedRecipes(shuffled.slice(0, 2));
    }
  };

  // Réactualiser automatiquement les suggestions si l'utilisateur change de continent, de filtre ou bascule le tri
  useEffect(() => {
    if (suggestedRecipes.length > 0) {
      if (filteredDiscoverableRecipes.length === 0) {
        setSuggestedRecipes([]);
        return;
      }
      if (sortByAvailability) {
        const sorted = [...filteredDiscoverableRecipes].sort((a, b) => {
          const pA = getRecipePantryAvailability(a.ingredients, pantry, purchaseHistory, dbarati).percentage;
          const pB = getRecipePantryAvailability(b.ingredients, pantry, purchaseHistory, dbarati).percentage;
          return pB - pA;
        });
        setSuggestedRecipes(sorted.slice(0, 4));
      } else {
        if (dishCourseFilter === 'all') {
          const savories = filteredDiscoverableRecipes.filter(r => !isDessertRecipe(r));
          const desserts = filteredDiscoverableRecipes.filter(r => isDessertRecipe(r));
          const picked: Recipe[] = [];
          if (savories.length > 0) {
            picked.push(savories[Math.floor(Math.random() * savories.length)]);
          }
          if (desserts.length > 0) {
            picked.push(desserts[Math.floor(Math.random() * desserts.length)]);
          }
          if (picked.length > 0) {
            setSuggestedRecipes(picked);
            return;
          }
        }
        const shuffled = [...filteredDiscoverableRecipes].sort(() => 0.5 - Math.random());
        setSuggestedRecipes(shuffled.slice(0, 2));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortByAvailability, selectedContinent, filterQuick, filterEconomical, dishCourseFilter]);

  const handleSpin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setSelectedStreetFood(null);

    const spinDuration = 2500;
    const spinInterval = 100;

    intervalRef.current = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * streetFoodOptions.length);
      setDisplayedFood(streetFoodOptions[randomIndex]);
    }, spinInterval);

    setTimeout(() => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      const finalChoice = streetFoodOptions[Math.floor(Math.random() * streetFoodOptions.length)];
      setSelectedStreetFood(finalChoice);
      setDisplayedFood(null);
      setIsSpinning(false);
    }, spinDuration);
  };

  return (
    <div className="space-y-8">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger>
            <div className="flex justify-center items-center gap-3 py-2 text-primary">
              <BookUser className="h-8 w-8 text-primary" />
              <h2 className='text-3xl font-bold'>Recetteti</h2>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className='text-center py-4 px-4 rounded-xl bg-gradient-to-br from-secondary/50 via-card to-card border-2 border-border/50 shadow-lg'>
              <p className='text-muted-foreground mb-6 max-w-2xl mx-auto'>Votre carnet de recettes personnel. Créez, modifiez et conservez vos propres créations culinaires ici-même.</p>

              <div className="relative mb-6 max-w-sm mx-auto">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Filtrer par tags (ex: vegan, rapide)..."
                  className="pl-11 rounded-full h-10"
                  value={userRecipeTagFilter}
                  onChange={(e) => setUserRecipeTagFilter(e.target.value)}
                />
              </div>

              {filteredUserRecipes.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
                  {filteredUserRecipes.map(recipe => (
                    <Card key={recipe.id} className={cn("cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col overflow-hidden", getCountryFlag(recipe.tags) ? 'bg-gradient-to-r ' + getCountryFlag(recipe.tags)!.colors : '')} onClick={() => onViewUserRecipe(recipe)}>
                      <CardContent className='p-3 flex items-center gap-3'>
                        <div className="relative w-14 h-14 aspect-square shrink-0 rounded-lg overflow-hidden bg-secondary">
                          <img
                            src={recipe.photoDataUri || getRecipeImageUrl(recipe)}
                            alt={recipe.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=80';
                            }}
                          />
                        </div>
                        <div className="flex flex-col overflow-hidden">
                          <CardTitle className='text-base font-semibold truncate'>{recipe.title}</CardTitle>
                          <div className="flex flex-wrap items-center gap-1 mt-1">
                            <Badge variant="outline" className="text-xs">{recipe.category}</Badge>
                            <Badge variant="outline" className="flex items-center gap-1 text-xs"><Clock className="h-3 w-3" />{recipe.preparationTime} min</Badge>
                            {recipe.tags && recipe.tags.split(',').map(tag => {
                              const trimmed = tag.trim();
                              if (!trimmed) return null;
                              const flag = getCountryFlag(trimmed);
                              return (
                                <Badge key={trimmed} variant="secondary" className="text-xs flex items-center gap-1">
                                  {flag ? <span className="text-sm">{flag.emoji}</span> : <Tag className="h-3 w-3" />}
                                  {trimmed}
                                </Badge>
                              );
                            })}
                          </div>
                        </div>
                      </CardContent>
                      <div className="px-3 pb-2 pt-0 flex justify-end">
                        <Button
                          variant={dbaratiAddedId === recipe.id ? "default" : "ghost"}
                          size="sm"
                          className={cn(
                            "h-7 text-[10px] gap-1 rounded-lg transition-all",
                            dbaratiAddedId === recipe.id
                              ? "bg-green-500 hover:bg-green-500 text-white pointer-events-none"
                              : "text-muted-foreground hover:text-primary"
                          )}
                          title="Ajouter à Dbarati"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddDbaratiItem(recipe.title, 'plat');
                            setDbaratiAddedId(recipe.id);
                            setTimeout(() => setDbaratiAddedId(null), 2000);
                          }}
                        >
                          {dbaratiAddedId === recipe.id ? (
                            <><Check className="h-3 w-3" /> Ajouté !</>
                          ) : (
                            <><ClipboardList className="h-3 w-3" /> Dbarati</>
                          )}
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className='text-muted-foreground mb-6'>{userRecipes.length > 0 ? "Aucune recette ne correspond à votre filtre." : "Vous n'avez pas encore créé de recette."}</p>
              )}

              <Button onClick={() => openUserRecipeForm()}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Créer ma recette
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* --- DBARATI SECTION --- */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="dbarati">
          <AccordionTrigger>
            <div className="flex justify-center items-center gap-3 py-2 text-primary">
              <ClipboardList className="h-8 w-8 text-primary" />
              <h2 className='text-3xl font-bold'>Dbarati</h2>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className='py-4 px-1.5 sm:px-5 rounded-2xl bg-gradient-to-br from-indigo-50/50 via-white to-rose-50/50 dark:from-indigo-950/20 dark:via-background dark:to-rose-950/20 border border-border/40 shadow-xl backdrop-blur-sm'>
              <div className='flex flex-col items-center mb-4'>
                <p className='text-muted-foreground text-center max-w-2xl text-xs sm:text-sm leading-relaxed'>
                  <span className="font-semibold text-primary">Dbarati</span> : Vos idées de repas et vos habitudes culinaires.
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <Badge variant="outline" className="text-[10px] sm:text-xs font-bold bg-white/50 dark:bg-zinc-900/50 text-muted-foreground/80 border-primary/10 px-2.5 py-0.5 rounded-full">
                    {dbarati.length} {dbarati.length > 1 ? 'idées' : 'idée'} enregistrée{dbarati.length > 1 ? 's' : ''}
                  </Badge>
                </div>
              </div>

              {/* --- RITUELS DE LA SEMAINE (AVEC GAUGES/BAROMÈTRES, PLIABLE PAR DÉFAUT & ULTRA-MINCE) --- */}
              {(() => {
                if (weekRituals.totalPreps === 0) return null;

                return (
                  <div className="max-w-4xl mx-auto mb-3 bg-indigo-50/40 dark:bg-indigo-950/20 rounded-xl border border-indigo-200/40 dark:border-indigo-800/25 transition-all overflow-hidden shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setIsRitualsExpanded(!isRitualsExpanded)}
                      className="w-full flex items-center justify-between py-1.5 px-3 hover:bg-indigo-50/70 dark:hover:bg-indigo-950/35 transition-colors text-left group"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs shrink-0">✨</span>
                        <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-300 truncate">
                          Rituels de la semaine
                        </span>
                        <span className="text-[9px] font-bold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.2 rounded-full shrink-0">
                          {weekRituals.totalPreps} prép.
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        {!isRitualsExpanded && weekRituals.confirmedRituals.length > 0 && (
                          <span className="text-[10px] text-muted-foreground italic truncate max-w-[150px] sm:max-w-[260px] hidden sm:inline">
                            ex: {weekRituals.confirmedRituals[0].dish} ({weekRituals.confirmedRituals[0].dayShort}.)
                          </span>
                        )}
                        <span className="text-muted-foreground/70 group-hover:text-foreground">
                          {isRitualsExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                        </span>
                      </div>
                    </button>

                    {isRitualsExpanded && (
                      <div className="px-3 pb-2.5 pt-1 border-t border-indigo-100/70 dark:border-indigo-900/40 space-y-2 animate-in fade-in duration-150">
                        {/* Les 7 baromètres journaliers (très minces & épurés) */}
                        <div className="grid grid-cols-7 gap-1 sm:gap-1.5 pt-0.5">
                          {weekRituals.days.map((day, idx) => {
                            const isToday = idx === weekRituals.todayDayIdx;
                            const isSelected = selectedStatDay === idx;
                            const isTop = weekRituals.topDay && weekRituals.topDay.dayShort === day.dayShort && day.count > 0;
                            const heightPct = Math.max(Math.round((day.count / weekRituals.maxCount) * 100), day.count > 0 ? 20 : 0);

                            return (
                              <button
                                key={day.dayShort}
                                type="button"
                                onClick={() => setSelectedStatDay(isSelected ? null : idx)}
                                className={cn(
                                  "flex flex-col items-center justify-between py-1 px-0.5 rounded-lg transition-all cursor-pointer border text-center",
                                  isSelected
                                    ? "bg-indigo-600 text-white border-indigo-700 shadow-sm scale-102"
                                    : isToday
                                      ? "bg-indigo-100/70 dark:bg-indigo-900/40 border-indigo-300/80 dark:border-indigo-700/60 hover:bg-indigo-100"
                                      : "bg-white/80 dark:bg-zinc-900/40 border-border/30 hover:bg-muted/40 hover:border-indigo-200"
                                )}
                              >
                                <div className="flex items-center justify-center gap-0.5">
                                  <span className={cn(
                                    "text-[9px] font-bold uppercase",
                                    isSelected
                                      ? "text-white"
                                      : isToday
                                        ? "text-indigo-600 dark:text-indigo-400 font-extrabold"
                                        : "text-muted-foreground"
                                  )}>
                                    {day.dayShort}
                                  </span>
                                  {isTop && !isSelected && <span className="text-[7.5px] leading-none">🏆</span>}
                                </div>

                                {/* Jauge / Barre mince */}
                                <div className="w-full h-6 flex items-end justify-center py-0.5">
                                  <div
                                    className={cn(
                                      "w-2 sm:w-3 rounded-full transition-all duration-300",
                                      isSelected
                                        ? "bg-white/95"
                                        : day.count > 0
                                          ? isTop
                                            ? "bg-gradient-to-t from-amber-500 to-indigo-500"
                                            : "bg-indigo-500/80 dark:bg-indigo-400/80"
                                          : "bg-muted/40 h-0.5"
                                    )}
                                    style={{ height: day.count > 0 ? `${heightPct}%` : '2px' }}
                                  />
                                </div>

                                <span className={cn(
                                  "text-[8.5px] font-bold leading-none",
                                  isSelected
                                    ? "text-white"
                                    : day.count > 0
                                      ? "text-foreground"
                                      : "text-muted-foreground/40"
                                )}>
                                  {day.count}
                                </span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Rituels & Détails interactifs */}
                        <div className="pt-1 border-t border-indigo-100/60 dark:border-indigo-900/30">
                          {selectedStatDay !== null ? (
                            (() => {
                              const day = weekRituals.days[selectedStatDay];
                              const sortedDishes = Object.entries(day.dishesMap).sort((a, b) => b[1] - a[1]);
                              return (
                                <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                                  <span className="font-bold text-indigo-700 dark:text-indigo-300">
                                    {day.dayFull} ({day.count} {day.count > 1 ? 'repas' : 'repas'}) :
                                  </span>
                                  {sortedDishes.length > 0 ? (
                                    sortedDishes.map(([dish, count]) => (
                                      <span
                                        key={dish}
                                        className="inline-flex items-center gap-1 bg-white/90 dark:bg-zinc-800 px-2 py-0.5 rounded-md border text-[10px] font-medium shadow-2xs"
                                      >
                                        <span className="truncate max-w-[150px]">{dish}</span>
                                        <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                                          {count}x
                                        </span>
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-muted-foreground italic text-[10px]">
                                      Aucune préparation enregistrée ce jour-là.
                                    </span>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => setSelectedStatDay(null)}
                                    className="text-[9px] text-muted-foreground hover:text-foreground underline ml-auto shrink-0"
                                  >
                                    Fermer le détail
                                  </button>
                                </div>
                              );
                            })()
                          ) : (
                            <div className="flex flex-wrap items-center justify-between gap-1.5 text-[10px] text-muted-foreground">
                              <div className="flex flex-wrap items-center gap-2">
                                {weekRituals.topDay && (
                                  <span>
                                    🏆 Jour le plus actif : <strong className="text-foreground">{weekRituals.topDay.dayFull}</strong> ({weekRituals.topDay.count}x)
                                  </span>
                                )}
                                {weekRituals.confirmedRituals.length > 0 && (
                                  <span>
                                    • ✨ Rituel : <strong className="text-foreground">{weekRituals.confirmedRituals[0].dish}</strong> le {weekRituals.confirmedRituals[0].dayShort}. ({weekRituals.confirmedRituals[0].count}x)
                                  </span>
                                )}
                              </div>
                              <span className="text-[9px] italic opacity-70">
                                Touchez un jour pour voir ses rituels
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* --- MES CLASSIQUES --- */}
              {(() => {
                const classiques = dbarati
                  .filter(i => (i.type === 'plat' || !i.type) && (i.prepCount || 0) >= 2)
                  .sort((a, b) => (b.prepCount || 0) - (a.prepCount || 0))
                  .slice(0, 5);
                if (classiques.length === 0) return null;
                return (
                  <div className="max-w-4xl mx-auto mb-5 bg-amber-50/60 dark:bg-amber-950/10 rounded-2xl p-3 border border-amber-200/40 dark:border-amber-700/20 shadow-sm">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400 mb-2 flex items-center gap-1.5">
                      <span>🏆</span> Mes classiques
                    </p>
                    <div className="flex flex-col gap-1">
                      {classiques.map(c => (
                        <div key={c.id} className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-foreground truncate flex-1 mr-2">{c.text}</span>
                          <span className="text-amber-600 dark:text-amber-400 font-bold shrink-0">{c.prepCount}x</span>
                          {c.lastPreparedAt && (
                            <span className="text-muted-foreground ml-2 shrink-0 italic text-[10px]">
                              {formatDbaratiDate(c.lastPreparedAt)}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Entrées Section (Collapsible) - Moved Above Random Wheel */}
              <div className="max-w-4xl mx-auto mb-8 bg-white/30 dark:bg-zinc-900/10 rounded-2xl p-4 border border-border/20 shadow-sm">
                <button
                  onClick={() => setIsEntreesExpanded(!isEntreesExpanded)}
                  className="w-full flex justify-between items-center py-2 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors focus:outline-none"
                >
                  <span className="flex items-center gap-2">
                    <Utensils className="h-4 w-4" /> Entrées
                    <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4 ml-2">
                      {dbarati.filter(i => i.type === 'entree').length}
                    </Badge>
                  </span>
                  {isEntreesExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>

                {isEntreesExpanded && (
                  <div className="animate-in slide-in-from-top-2 fade-in duration-300 pt-4">

                    {/* Add new Entree - Multiline Layout */}
                    <div className="max-w-md mx-auto mb-6 scale-95 origin-top">
                      <form
                        className="flex flex-col gap-3"
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (newEntreeText.trim()) {
                            onAddDbaratiItem(newEntreeText, 'entree', newEntreeTag);
                            setNewEntreeText('');
                          }
                        }}
                      >
                        <Input
                          placeholder="Ajouter une entrée..."
                          className="rounded-xl h-10 text-sm border-primary/20 bg-background/50 w-full"
                          value={newEntreeText}
                          onChange={(e) => setNewEntreeText(e.target.value)}
                        />

                        {newEntreeText.length > 0 && (
                          <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                            <div className="flex border border-primary/20 rounded-xl overflow-hidden shadow-sm h-10 flex-1">
                              {(['Soupe', 'Salade', 'Sauce'] as const).map(tag => (
                                <button
                                  key={tag}
                                  type="button"
                                  className={cn(
                                    "px-2 text-[10px] font-medium transition-colors border-r border-primary/10 last:border-r-0 hover:bg-primary/10",
                                    newEntreeTag === tag ? "bg-primary/10 text-primary font-bold" : "bg-card text-muted-foreground"
                                  )}
                                  onClick={() => setNewEntreeTag(tag)}
                                >
                                  {tag}
                                </button>
                              ))}
                            </div>
                            <Button
                              type="submit"
                              size="icon"
                              className="h-10 w-10 rounded-xl shrink-0"
                              disabled={!newEntreeText.trim()}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </form>
                    </div>

                    {/* Filters (Always visible if entrees exist) */}
                    {dbarati.filter(i => i.type === 'entree').length > 0 && (
                      <div className="flex gap-2 mb-4 overflow-x-auto pb-1.5 no-scrollbar px-1 snap-x scroll-smooth w-full">
                        {(['Toutes', 'Soupe', 'Salade', 'Sauce'] as const).map(filter => (
                          <Badge
                            key={filter}
                            variant={activeEntreeFilter === filter ? "default" : "outline"}
                            className="shrink-0 cursor-pointer text-[10px] py-1 px-3 snap-center"
                            onClick={() => setActiveEntreeFilter(filter)}
                          >
                            {filter}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Entrees List */}
                    {dbarati.filter(i => i.type === 'entree').length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-4xl mx-auto scale-95 origin-top">
                        {[...dbarati]
                          .filter(i => i.type === 'entree')
                          .filter(i => activeEntreeFilter === 'Toutes' || i.tag === activeEntreeFilter)
                          .sort((a, b) => Number(a.done) - Number(b.done))
                          .map((item) => (
                            <div
                              key={item.id}
                              className={cn(
                                "relative p-2 rounded-lg border transition-all duration-300 group flex items-center justify-between",
                                item.done
                                  ? "bg-muted/40 border-border/40 opacity-70"
                                  : "bg-white dark:bg-card border-border/60 hover:border-primary/40 hover:shadow-sm"
                              )}
                            >
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <Checkbox
                                  id={`dbarati-${item.id}`}
                                  checked={item.done}
                                  onCheckedChange={() => onToggleDbaratiItem(item.id)}
                                  className="h-4 w-4 rounded border-primary/20 data-[state=checked]:bg-primary shrink-0"
                                />
                                <label
                                  htmlFor={`dbarati-${item.id}`}
                                  className={cn(
                                    "text-xs font-semibold cursor-pointer truncate flex-1",
                                    item.done ? "line-through text-muted-foreground" : "text-foreground"
                                  )}
                                >
                                  {item.text}
                                </label>
                                {item.tag && (
                                  <Badge variant="secondary" className="text-[8px] px-1 py-0 h-3 font-medium opacity-70 shrink-0">
                                    {item.tag}
                                  </Badge>
                                )}
                              </div>
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 rounded text-muted-foreground hover:text-destructive"
                                  onClick={() => onDeleteDbaratiItem(item.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 rounded-xl border border-dashed border-border/40 bg-muted/5 scale-95">
                        <p className='text-muted-foreground font-medium text-[11px]'>Aucune entrée ajoutée.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Random Wheel UI - Compact */}
              {(() => {
                const ONE_MONTH = 30 * 24 * 60 * 60 * 1000;
                const candidates = dbarati.filter(item => {
                  if (item.type === 'entree' || item.type === 'dessert') return false;
                  if (!item.done) return true;
                  if (item.lastPreparedAt) {
                    return (Date.now() - new Date(item.lastPreparedAt).getTime()) > ONE_MONTH;
                  }
                  return true;
                });

                if (candidates.length < 2) return null;

                const handleDbaratiSpin = () => {
                  if (isDbaratiSpinning) return;
                  setIsDbaratiSpinning(true);
                  setDbaratiSelectedItem(null);

                  const foodEmojis = ['🍳', '🥗', '🍝', '🍕', '🍱', '🍔', '🥙', '🍛', '🥘', '🍲', '🍜', '🍚', '🍗', '🐟', '🍤'];

                  dbaratiIntervalRef.current = setInterval(() => {
                    const randomIdx = Math.floor(Math.random() * candidates.length);
                    setDbaratiDisplayedItem(candidates[randomIdx].text);
                  }, 80);

                  setTimeout(() => {
                    if (dbaratiIntervalRef.current) {
                      clearInterval(dbaratiIntervalRef.current);
                      dbaratiIntervalRef.current = null;
                    }
                    const finalChoice = candidates[Math.floor(Math.random() * candidates.length)];
                    setDbaratiSelectedItem(finalChoice.text);
                    setDbaratiSelectedEmoji(foodEmojis[Math.floor(Math.random() * foodEmojis.length)]);
                    setDbaratiDisplayedItem(null);
                    setIsDbaratiSpinning(false);
                  }, 2500);
                };

                return (
                  <div className="relative mb-6 p-3 rounded-2xl bg-primary/5 border border-primary/10 overflow-hidden text-center group">
                    <div className="absolute -top-12 -right-12 w-20 h-20 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all duration-700" />
                    <div className="absolute -bottom-12 -left-12 w-20 h-20 bg-rose-400/10 rounded-full blur-2xl group-hover:bg-rose-400/20 transition-all duration-700" />

                    <div className="flex flex-col items-center gap-2">
                      <Button
                        onClick={handleDbaratiSpin}
                        disabled={isDbaratiSpinning}
                        size="sm"
                        className={cn(
                          "rounded-full px-4 py-1.5 h-8 font-bold shadow-sm transition-all duration-300 text-xs",
                          isDbaratiSpinning ? "bg-muted cursor-not-allowed" : "bg-gradient-to-r from-primary to-indigo-600 hover:shadow-primary/20 hover:scale-105 active:scale-95"
                        )}
                      >
                        {isDbaratiSpinning ? (
                          <span className="flex items-center gap-1.5">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Un instant...
                          </span>
                        ) : (
                          <><Dices className="h-3.5 w-3.5 mr-1.5" /> Qu&apos;est-ce qu&apos;on mange ?</>
                        )}
                      </Button>

                      <div className="h-8 flex flex-col justify-center items-center">
                        {isDbaratiSpinning && (
                          <div className="animate-in zoom-in-75 duration-200">
                            <p className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-600 truncate max-w-[240px]">
                              {dbaratiDisplayedItem}
                            </p>
                          </div>
                        )}
                        {!isDbaratiSpinning && dbaratiSelectedItem && (
                          <div className="animate-in fade-in-50 zoom-in-95 duration-500 text-center">
                            <div className="flex items-center justify-center gap-3">
                              <p className="text-xl font-black text-primary drop-shadow-sm flex items-center gap-2">
                                {dbaratiSelectedItem} <span className="text-lg animate-bounce">{dbaratiSelectedEmoji}</span>
                              </p>
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-8 w-8 rounded-full border-primary/20 text-primary hover:bg-primary hover:text-white transition-all shadow-sm"
                                title="Marquer comme préparé"
                                onClick={() => {
                                  // Find item among all, not just candidates, to safely toggle
                                  const normalizedSelected = normalizeString(dbaratiSelectedItem || '');
                                  const item = candidates.find(c => normalizeString(c.text) === normalizedSelected);
                                  if (item) handleOpenPrepModal(item);
                                }}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Plats Section (Collapsible) */}
              <div className="max-w-4xl mx-auto mb-6 bg-white/30 dark:bg-zinc-900/10 rounded-2xl p-4 border border-border/20 shadow-sm">
                <button
                  onClick={() => setIsPlatsExpanded(!isPlatsExpanded)}
                  className="w-full flex justify-between items-center py-2 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors focus:outline-none"
                >
                  <span className="flex items-center gap-2">
                    <Utensils className="h-4 w-4" /> Plats
                    <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4 ml-2">
                      {dbarati.filter(i => i.type === 'plat' || !i.type).length}
                    </Badge>
                  </span>
                  {isPlatsExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>

                {isPlatsExpanded && (
                  <div className="animate-in slide-in-from-top-2 fade-in duration-300 pt-4">

                    {/* Add new Plat - Multiline Layout */}
                    <div className="max-w-md mx-auto mb-6 scale-95 origin-top">
                      <form
                        className="flex flex-col gap-3"
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (newPlatText.trim()) {
                            onAddDbaratiItem(newPlatText, 'plat', undefined, newPlatTag);
                            setNewPlatText('');
                          }
                        }}
                      >
                        <Input
                          placeholder="Un plat ? Couscous, Pasta..."
                          className="rounded-xl h-10 text-sm border-primary/20 bg-background/50 w-full"
                          value={newPlatText}
                          onChange={(e) => setNewPlatText(e.target.value)}
                        />

                        {newPlatText.length > 0 && (
                          <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                            <div className="flex border border-primary/20 rounded-xl overflow-hidden shadow-sm h-10 flex-1">
                              {(['Pates', 'Sauces', 'Sandwich', 'Autres'] as const).map(tag => (
                                <button
                                  key={tag}
                                  type="button"
                                  className={cn(
                                    "px-2 text-[10px] font-medium transition-colors border-r border-primary/10 last:border-r-0 hover:bg-primary/10 flex-1",
                                    newPlatTag === tag ? "bg-primary/10 text-primary font-bold" : "bg-card text-muted-foreground"
                                  )}
                                  onClick={() => setNewPlatTag(tag)}
                                >
                                  {tag}
                                </button>
                              ))}
                            </div>
                            <Button
                              type="submit"
                              size="icon"
                              className="h-10 w-10 rounded-xl shrink-0"
                              disabled={!newPlatText.trim()}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </form>
                    </div>

                    {/* Filters (Always visible if plats exist) */}
                    {dbarati.filter(i => i.type === 'plat' || !i.type).length > 0 && (
                      <div className="flex gap-2 mb-4 overflow-x-auto pb-1.5 no-scrollbar px-1 snap-x scroll-smooth w-full">
                        {(['Tous', 'Pates', 'Sauces', 'Sandwich', 'Autres'] as const).map(filter => (
                          <Badge
                            key={filter}
                            variant={activePlatFilter === filter ? "default" : "outline"}
                            className="shrink-0 cursor-pointer text-[10px] py-1 px-3 snap-center"
                            onClick={() => setActivePlatFilter(filter)}
                          >
                            {filter}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Plats List */}
                    {dbarati.filter(i => i.type === 'plat' || !i.type).length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-4xl mx-auto">
                        {[...dbarati]
                          .filter(i => i.type === 'plat' || !i.type)
                          .filter(i => activePlatFilter === 'Tous' || i.platTag === activePlatFilter)
                          .sort((a, b) => Number(a.done) - Number(b.done))
                          .map((item, index) => {
                            const normalizedItemText = normalizeString(item.text);
                            const matchedRecipe = userRecipes.find(r => normalizeString(r.title) === normalizedItemText);
                            const isLongPressed = longPressItemId === item.id;

                            return (
                              <div
                                key={item.id}
                                className={cn(
                                  "relative p-3 rounded-xl border transition-all duration-300 group flex flex-col",
                                  item.done
                                    ? "bg-muted/40 border-border/40 opacity-90 scale-[0.98]"
                                    : "bg-white dark:bg-card border-border/60 hover:border-primary/40 hover:shadow-lg"
                                )}
                                onMouseDown={() => {
                                  longPressTimer.current = setTimeout(() => {
                                    setLongPressItemId(item.id);
                                  }, 500);
                                }}
                                onMouseUp={() => {
                                  if (longPressTimer.current) clearTimeout(longPressTimer.current);
                                }}
                                onMouseLeave={() => {
                                  if (longPressTimer.current) clearTimeout(longPressTimer.current);
                                }}
                                onTouchStart={() => {
                                  longPressTimer.current = setTimeout(() => {
                                    setLongPressItemId(item.id);
                                  }, 500);
                                }}
                                onTouchEnd={() => {
                                  if (longPressTimer.current) clearTimeout(longPressTimer.current);
                                }}
                              >
                                {/* Long-press native tag picker overlay */}
                                {isLongPressed && (
                                  <div className="absolute inset-0 z-10 bg-background/95 rounded-xl flex items-center justify-between px-4 animate-in fade-in duration-150 border-2 border-primary/20 shadow-sm">
                                    <div className="flex items-center gap-2 flex-1">
                                      <Tag className="h-3.5 w-3.5 text-primary" />
                                      <select
                                        className="w-full bg-transparent text-sm font-bold text-primary outline-none focus:ring-0 cursor-pointer appearance-none"
                                        value={item.platTag || ''}
                                        onChange={(e) => {
                                          if (e.target.value) {
                                            onUpdateDbaratiItemPlatTag(item.id, e.target.value as any);
                                            setLongPressItemId(null);
                                          }
                                        }}
                                        onBlur={() => setLongPressItemId(null)}
                                        autoFocus
                                      >
                                        <option value="" disabled hidden>Choisir un tag...</option>
                                        <option value="Pates">Pâtes</option>
                                        <option value="Sauces">Sauces</option>
                                        <option value="Sandwich">Sandwich</option>
                                        <option value="Autres">Autres</option>
                                      </select>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 rounded-full text-muted-foreground hover:bg-muted"
                                      onClick={() => setLongPressItemId(null)}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                )}

                                <div className="flex items-start gap-2.5">
                                  <div className="flex flex-col items-center justify-start gap-2 mt-0.5">
                                    <Checkbox
                                      id={`dbarati-${item.id}`}
                                      checked={item.done}
                                      onCheckedChange={() => handleItemCheckClick(item)}
                                      className="h-5 w-5 rounded-md border-2 border-primary/10 data-[state=checked]:bg-primary data-[state=checked]:border-primary shrink-0"
                                    />
                                    {/* Bouton +1 : visible dès que le plat a au moins 1 préparation enregistrée, ou est actuellement coché */}
                                    {(item.done || (item.prepCount || 0) > 0) && (
                                      <button
                                        title="Marquer une nouvelle préparation"
                                        onClick={(e) => { e.stopPropagation(); handleOpenPrepModal(item); }}
                                        className="inline-flex items-center justify-center bg-primary/15 hover:bg-primary/30 text-primary border border-primary/30 rounded-full h-5 px-1.5 min-w-[24px] text-[9px] font-black leading-none transition-colors shadow-sm"
                                      >
                                        +1
                                      </button>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start gap-1.5 flex-nowrap mt-[2px]">
                                      <label
                                        htmlFor={`dbarati-${item.id}`}
                                        className={cn(
                                          "flex-1 min-w-0 text-sm font-bold cursor-pointer transition-all leading-tight break-words",
                                          (() => {
                                            if (!item.done || !item.lastPreparedAt) return "text-foreground";
                                            const daysSince = (Date.now() - new Date(item.lastPreparedAt).getTime()) / (1000 * 60 * 60 * 24);
                                            if (daysSince <= 7) return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 px-1.5 py-0.5 rounded";
                                            if (daysSince <= 15) return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 px-1.5 py-0.5 rounded";
                                            if (daysSince <= 30) return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-1.5 py-0.5 rounded";
                                            return "text-muted-foreground";
                                          })()
                                        )}
                                      >
                                        {item.text}
                                      </label>
                                      {item.platTag && (
                                        <Badge variant="secondary" className="text-[7.5px] px-1 py-0 h-[11px] leading-none flex items-center font-bold opacity-60 shrink-0">
                                          {item.platTag}
                                        </Badge>
                                      )}
                                      {matchedRecipe && (
                                        <button
                                          title="Voir la recette"
                                          className="inline-flex items-center justify-center shrink-0 w-6 h-6 rounded-full bg-primary/10 text-[12px] hover:bg-primary/20 transition-colors mt-0.5"
                                          onClick={(e) => { e.stopPropagation(); onViewUserRecipe(matchedRecipe); }}
                                        >
                                          📖
                                        </button>
                                      )}
                                    </div>

                                    <div className="flex items-center gap-1.5 mt-1 flex-nowrap whitespace-nowrap">
                                      {(item.prepCount || 0) > 0 && (
                                        <span className="bg-primary/5 text-primary px-1.5 py-0 rounded-full text-[9px] font-bold shrink-0">
                                          {item.prepCount}x
                                        </span>
                                      )}
                                      {item.lastPreparedAt && (
                                        <span className="text-[10px] text-muted-foreground italic truncate">
                                          {formatDbaratiDate(item.lastPreparedAt)}
                                          <span className="opacity-70 ml-1">
                                            (il y a {Math.floor((Date.now() - new Date(item.lastPreparedAt).getTime()) / (1000 * 60 * 60 * 24))} j)
                                          </span>
                                        </span>
                                      )}

                                      {/* Bouton historique : visible seulement si ≥2 préparations */}
                                      {(item.prepHistory?.length || 0) >= 2 && (
                                        <button
                                          title="Voir l'historique"
                                          onClick={(e) => { e.stopPropagation(); setOpenHistoryId(openHistoryId === item.id ? null : item.id); }}
                                          className="inline-flex items-center justify-center text-muted-foreground hover:text-primary text-[11px] rounded-full px-1 py-0.5 transition-colors shrink-0"
                                        >
                                          📅
                                        </button>
                                      )}
                                    </div>
                                    {/* Mini-historique inline */}
                                    {openHistoryId === item.id && item.prepHistory && item.prepHistory.length > 0 && (
                                      <div className="mt-1.5 text-[9px] text-muted-foreground bg-muted/30 rounded-lg px-2 py-1.5 space-y-0.5 animate-in fade-in slide-in-from-top-1 duration-200">
                                        {[...item.prepHistory].reverse().map((date, i) => (
                                          <div key={i} className="flex items-center justify-between gap-1 group/hist py-0.5">
                                            <div className="flex items-center gap-1 min-w-0">
                                              <span className="w-1 h-1 rounded-full bg-primary/40 shrink-0" />
                                              <span className="italic truncate">{formatDbaratiDate(date, { withYear: true })}</span>
                                            </div>
                                            {onRemovePrepDate && (
                                              <button
                                                type="button"
                                                title="Supprimer cette préparation"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  if (window.confirm(`Supprimer la préparation du ${formatDbaratiDate(date, { withYear: true })} ?`)) {
                                                    onRemovePrepDate(item.id, date);
                                                  }
                                                }}
                                                className="opacity-0 group-hover/hist:opacity-100 text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 p-0.5 rounded transition-all shrink-0"
                                              >
                                                <X className="h-2.5 w-2.5" />
                                              </button>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 rounded-md text-muted-foreground hover:text-destructive shrink-0"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (window.confirm("🗑️ Voulez-vous vraiment supprimer ce plat de vos Dbarati ?")) {
                                          onDeleteDbaratiItem(item.id);
                                        }
                                      }}
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    ) : (
                      <div className="text-center py-4 rounded-xl border border-dashed border-border/40 bg-muted/5 scale-95">
                        <p className='text-muted-foreground font-medium text-[11px]'>Aucun plat ajouté.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Desserts Section (Collapsible) */}
              <div className="max-w-4xl mx-auto mb-6 bg-white/30 dark:bg-zinc-900/10 rounded-2xl p-4 border border-border/20 shadow-sm">
                <button
                  onClick={() => setIsDessertsExpanded(!isDessertsExpanded)}
                  className="w-full flex justify-between items-center py-2 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors focus:outline-none"
                >
                  <span className="flex items-center gap-2">
                    <Cake className="h-4 w-4 text-primary" /> Desserts
                    <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4 ml-2">
                      {dbarati.filter(i => i.type === 'dessert').length}
                    </Badge>
                  </span>
                  {isDessertsExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>

                {isDessertsExpanded && (
                  <div className="animate-in slide-in-from-top-2 fade-in duration-300 pt-4">

                    {/* Add new Dessert - Multiline Layout */}
                    <div className="max-w-md mx-auto mb-6 scale-95 origin-top">
                      <form
                        className="flex flex-col gap-3"
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (newDessertText.trim()) {
                            onAddDbaratiItem(newDessertText, 'dessert', undefined, undefined, newDessertTag);
                            setNewDessertText('');
                          }
                        }}
                      >
                        <Input
                          placeholder="Un dessert ? Tiramisu, Crème caramel, Gâteau..."
                          className="rounded-xl h-10 text-sm border-primary/20 bg-background/50 w-full"
                          value={newDessertText}
                          onChange={(e) => setNewDessertText(e.target.value)}
                        />

                        {newDessertText.length > 0 && (
                          <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                            <div className="flex border border-primary/20 rounded-xl overflow-hidden shadow-sm h-10 flex-1">
                              {(['Gâteau', 'Crème', 'Fruits', 'Pâtisserie', 'Autres'] as const).map(tag => (
                                <button
                                  key={tag}
                                  type="button"
                                  className={cn(
                                    "px-2 text-[10px] font-medium transition-colors border-r border-primary/10 last:border-r-0 hover:bg-primary/10 flex-1",
                                    newDessertTag === tag ? "bg-primary/10 text-primary font-bold" : "bg-card text-muted-foreground"
                                  )}
                                  onClick={() => setNewDessertTag(tag)}
                                >
                                  {tag}
                                </button>
                              ))}
                            </div>
                            <Button
                              type="submit"
                              size="icon"
                              className="h-10 w-10 rounded-xl shrink-0"
                              disabled={!newDessertText.trim()}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </form>
                    </div>

                    {/* Filters (Always visible if desserts exist) */}
                    {dbarati.filter(i => i.type === 'dessert').length > 0 && (
                      <div className="flex gap-2 mb-4 overflow-x-auto pb-1.5 no-scrollbar px-1 snap-x scroll-smooth w-full">
                        {(['Tous', 'Gâteau', 'Crème', 'Fruits', 'Pâtisserie', 'Autres'] as const).map(filter => (
                          <Badge
                            key={filter}
                            variant={activeDessertFilter === filter ? "default" : "outline"}
                            className="shrink-0 cursor-pointer text-[10px] py-1 px-3 snap-center"
                            onClick={() => setActiveDessertFilter(filter)}
                          >
                            {filter}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Desserts List */}
                    {dbarati.filter(i => i.type === 'dessert').length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-4xl mx-auto">
                        {[...dbarati]
                          .filter(i => i.type === 'dessert')
                          .filter(i => activeDessertFilter === 'Tous' || i.dessertTag === activeDessertFilter)
                          .sort((a, b) => Number(a.done) - Number(b.done))
                          .map((item) => {
                            const normalizedItemText = normalizeString(item.text);
                            const matchedRecipe = userRecipes.find(r => normalizeString(r.title) === normalizedItemText);
                            const isLongPressed = longPressItemId === item.id;

                            return (
                              <div
                                key={item.id}
                                className={cn(
                                  "relative p-3 rounded-xl border transition-all duration-300 group flex flex-col",
                                  item.done
                                    ? "bg-muted/40 border-border/40 opacity-90 scale-[0.98]"
                                    : "bg-white dark:bg-card border-border/60 hover:border-primary/40 hover:shadow-lg"
                                )}
                                onMouseDown={() => {
                                  longPressTimer.current = setTimeout(() => {
                                    setLongPressItemId(item.id);
                                  }, 500);
                                }}
                                onMouseUp={() => {
                                  if (longPressTimer.current) clearTimeout(longPressTimer.current);
                                }}
                                onMouseLeave={() => {
                                  if (longPressTimer.current) clearTimeout(longPressTimer.current);
                                }}
                                onTouchStart={() => {
                                  longPressTimer.current = setTimeout(() => {
                                    setLongPressItemId(item.id);
                                  }, 500);
                                }}
                                onTouchEnd={() => {
                                  if (longPressTimer.current) clearTimeout(longPressTimer.current);
                                }}
                              >
                                {/* Long-press native tag picker overlay */}
                                {isLongPressed && (
                                  <div className="absolute inset-0 z-10 bg-background/95 rounded-xl flex items-center justify-between px-4 animate-in fade-in duration-150 border-2 border-primary/20 shadow-sm">
                                    <div className="flex items-center gap-2 flex-1">
                                      <Tag className="h-3.5 w-3.5 text-primary" />
                                      <select
                                        className="w-full bg-transparent text-sm font-bold text-primary outline-none focus:ring-0 cursor-pointer appearance-none"
                                        value={item.dessertTag || ''}
                                        onChange={(e) => {
                                          if (e.target.value && onUpdateDbaratiItemDessertTag) {
                                            onUpdateDbaratiItemDessertTag(item.id, e.target.value as any);
                                            setLongPressItemId(null);
                                          }
                                        }}
                                        onBlur={() => setLongPressItemId(null)}
                                        autoFocus
                                      >
                                        <option value="" disabled hidden>Choisir un tag...</option>
                                        <option value="Gâteau">Gâteau</option>
                                        <option value="Crème">Crème</option>
                                        <option value="Fruits">Fruits</option>
                                        <option value="Pâtisserie">Pâtisserie</option>
                                        <option value="Autres">Autres</option>
                                      </select>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 rounded-full text-muted-foreground hover:bg-muted"
                                      onClick={() => setLongPressItemId(null)}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                )}

                                <div className="flex items-start gap-2.5">
                                  <div className="flex flex-col items-center justify-start gap-2 mt-0.5">
                                    <Checkbox
                                      id={`dbarati-${item.id}`}
                                      checked={item.done}
                                      onCheckedChange={() => handleItemCheckClick(item)}
                                      className="h-5 w-5 rounded-md border-2 border-primary/10 data-[state=checked]:bg-primary data-[state=checked]:border-primary shrink-0"
                                    />
                                    {/* Bouton +1 : visible dès que le dessert a au moins 1 préparation enregistrée, ou est actuellement coché */}
                                    {(item.done || (item.prepCount || 0) > 0) && (
                                      <button
                                        title="Marquer une nouvelle préparation"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleOpenPrepModal(item);
                                        }}
                                        className="inline-flex items-center justify-center bg-primary/15 hover:bg-primary/30 text-primary border border-primary/30 rounded-full h-5 px-1.5 min-w-[24px] text-[9px] font-black leading-none transition-colors shadow-sm"
                                      >
                                        +1
                                      </button>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start gap-1.5 flex-nowrap mt-[2px]">
                                      <label
                                        htmlFor={`dbarati-${item.id}`}
                                        className={cn(
                                          "flex-1 min-w-0 text-sm font-bold cursor-pointer transition-all leading-tight break-words",
                                          (() => {
                                            if (!item.done || !item.lastPreparedAt) return "text-foreground";
                                            const daysSince = (Date.now() - new Date(item.lastPreparedAt).getTime()) / (1000 * 60 * 60 * 24);
                                            if (daysSince <= 7) return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 px-1.5 py-0.5 rounded";
                                            if (daysSince <= 15) return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 px-1.5 py-0.5 rounded";
                                            if (daysSince <= 30) return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-1.5 py-0.5 rounded";
                                            return "text-muted-foreground";
                                          })()
                                        )}
                                      >
                                        {item.text}
                                      </label>
                                      {item.dessertTag && (
                                        <Badge variant="secondary" className="text-[7.5px] px-1 py-0 h-[11px] leading-none flex items-center font-bold opacity-60 shrink-0">
                                          {item.dessertTag}
                                        </Badge>
                                      )}
                                      {matchedRecipe && (
                                        <button
                                          title="Voir la recette"
                                          className="inline-flex items-center justify-center shrink-0 w-6 h-6 rounded-full bg-primary/10 text-[12px] hover:bg-primary/20 transition-colors mt-0.5"
                                          onClick={(e) => { e.stopPropagation(); onViewUserRecipe(matchedRecipe); }}
                                        >
                                          📖
                                        </button>
                                      )}
                                    </div>

                                    <div className="flex items-center gap-1.5 mt-1 flex-nowrap whitespace-nowrap">
                                      {(item.prepCount || 0) > 0 && (
                                        <span className="bg-primary/5 text-primary px-1.5 py-0 rounded-full text-[9px] font-bold shrink-0">
                                          {item.prepCount}x
                                        </span>
                                      )}
                                      {item.lastPreparedAt && (
                                        <span className="text-[10px] text-muted-foreground italic truncate">
                                          {formatDbaratiDate(item.lastPreparedAt)}
                                          <span className="opacity-70 ml-1">
                                            (il y a {Math.floor((Date.now() - new Date(item.lastPreparedAt).getTime()) / (1000 * 60 * 60 * 24))} j)
                                          </span>
                                        </span>
                                      )}

                                      {(item.prepHistory?.length || 0) >= 2 && (
                                        <button
                                          title="Voir l'historique"
                                          onClick={(e) => { e.stopPropagation(); setOpenHistoryId(openHistoryId === item.id ? null : item.id); }}
                                          className="inline-flex items-center justify-center text-muted-foreground hover:text-primary text-[11px] rounded-full px-1 py-0.5 transition-colors shrink-0"
                                        >
                                          📅
                                        </button>
                                      )}
                                    </div>

                                    {openHistoryId === item.id && item.prepHistory && item.prepHistory.length > 0 && (
                                      <div className="mt-1.5 text-[9px] text-muted-foreground bg-muted/30 rounded-lg px-2 py-1.5 space-y-0.5 animate-in fade-in slide-in-from-top-1 duration-200">
                                        {[...item.prepHistory].reverse().map((date, i) => (
                                          <div key={i} className="flex items-center justify-between gap-1 group/hist py-0.5">
                                            <div className="flex items-center gap-1 min-w-0">
                                              <span className="w-1 h-1 rounded-full bg-primary/40 shrink-0" />
                                              <span className="italic truncate">{formatDbaratiDate(date, { withYear: true })}</span>
                                            </div>
                                            {onRemovePrepDate && (
                                              <button
                                                type="button"
                                                title="Supprimer cette préparation"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  if (window.confirm(`Supprimer la préparation du ${formatDbaratiDate(date, { withYear: true })} ?`)) {
                                                    onRemovePrepDate(item.id, date);
                                                  }
                                                }}
                                                className="opacity-0 group-hover/hist:opacity-100 text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 p-0.5 rounded transition-all shrink-0"
                                              >
                                                <X className="h-2.5 w-2.5" />
                                              </button>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 rounded-md text-muted-foreground hover:text-destructive shrink-0"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (window.confirm("🗑️ Voulez-vous vraiment supprimer ce dessert de vos Dbarati ?")) {
                                          onDeleteDbaratiItem(item.id);
                                        }
                                      }}
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    ) : (
                      <div className="text-center py-4 rounded-xl border border-dashed border-border/40 bg-muted/5 scale-95">
                        <p className='text-muted-foreground font-medium text-[11px]'>Aucun dessert ajouté.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>




            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className='text-center py-6 sm:py-8 px-4 rounded-xl bg-gradient-to-br from-primary/10 via-card to-card border-2 border-primary/20 shadow-lg'>
        <h2 className='text-2xl font-bold mb-1'>À court d&apos;idées ?</h2>
        <p className='text-xs sm:text-sm font-semibold text-primary tracking-wide mb-4 flex items-center justify-center gap-1.5'>
          <span>🌍</span>
          <span>Voyager gustativement — Recettes du monde</span>
        </p>

        {/* Séparateur Plats (Salé) vs Desserts (Sucré) */}
        <div className="flex justify-center mb-4 px-1 max-w-full">
          <div className="inline-flex items-center p-1 bg-background/90 dark:bg-zinc-900/90 rounded-full border border-primary/25 shadow-xs gap-1 max-w-full overflow-x-auto">
            <button
              type="button"
              onClick={() => setDishCourseFilter('plat')}
              className={cn(
                "inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0",
                dishCourseFilter === 'plat'
                  ? "bg-primary text-primary-foreground shadow-sm scale-102"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <Utensils className="h-3.5 w-3.5 shrink-0" />
              <span>Plats salés</span>
            </button>

            <button
              type="button"
              onClick={() => setDishCourseFilter('dessert')}
              className={cn(
                "inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0",
                dishCourseFilter === 'dessert'
                  ? "bg-pink-600 text-white shadow-sm scale-102"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <Cake className="h-3.5 w-3.5 shrink-0" />
              <span>Desserts &amp; Sucré</span>
            </button>

            <button
              type="button"
              onClick={() => setDishCourseFilter('all')}
              className={cn(
                "inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer shrink-0",
                dishCourseFilter === 'all'
                  ? "bg-accent/80 text-foreground shadow-xs font-bold border border-border"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>Tous</span>
            </button>
          </div>
        </div>

        {/* Dynamic Portion Selector */}
        <div className="flex justify-center mb-5 w-full px-1">
          <div className="inline-flex items-center justify-center gap-1.5 sm:gap-2.5 bg-background/95 dark:bg-zinc-900/95 border border-primary/25 rounded-full p-1 sm:px-3 sm:py-1.5 shadow-sm max-w-[95%]">
            <div className="flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-muted-foreground pl-1 shrink-0">
              <Users className="h-3.5 w-3.5 text-primary" />
              <span className="hidden xs:inline">Pour</span>
            </div>

            <div className="flex items-center gap-0.5 bg-muted/80 dark:bg-zinc-800/80 rounded-full p-0.5 shrink-0">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-6 w-6 rounded-full hover:bg-background p-0"
                onClick={() => handleSetIdeaPortions(p => Math.max(1, p - 1))}
                disabled={ideaPortions <= 1}
                aria-label="Moins de personnes"
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="w-12 text-center text-[11px] sm:text-xs font-bold text-foreground tabular-nums">
                {ideaPortions} {ideaPortions > 1 ? 'pers.' : 'pers.'}
              </span>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-6 w-6 rounded-full hover:bg-background p-0"
                onClick={() => handleSetIdeaPortions(p => Math.min(20, p + 1))}
                disabled={ideaPortions >= 20}
                aria-label="Plus de personnes"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>

            <div className="flex items-center gap-1 border-l border-border/60 pl-1.5 pr-0.5 shrink-0">
              {[2, 4, 6].map(nb => (
                <button
                  key={nb}
                  type="button"
                  onClick={() => handleSetIdeaPortions(nb)}
                  className={cn(
                    "h-6 w-6 text-[10px] sm:text-[11px] font-bold rounded-full transition-all flex items-center justify-center",
                    ideaPortions === nb
                      ? "bg-primary text-primary-foreground shadow-xs scale-105"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  {nb}p
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Continents horizontal scrollable pills with toggle on/off */}
        <div className="flex items-center justify-center gap-1.5 overflow-x-auto no-scrollbar py-1 px-1 mb-3">
          {[
            { id: 'Tous', label: 'Tous', icon: '🌐' },
            { id: 'Europe', label: 'Europe', icon: '🇪🇺' },
            { id: 'Asie', label: 'Asie', icon: '🥢' },
            { id: 'Amériques', label: 'Amériques', icon: '🌮' },
            { id: 'Afrique', label: 'Afrique & Orient', icon: '🌍' },
            { id: 'Océanie', label: 'Océanie', icon: '🦘' },
          ].map(tab => {
            const isSelected = selectedContinent === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  if (tab.id === 'Tous') {
                    setSelectedContinent('Tous');
                  } else {
                    setSelectedContinent(prev => prev === tab.id ? 'Tous' : (tab.id as ContinentFilter));
                  }
                }}
                className={cn(
                  "inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold shrink-0 transition-all cursor-pointer border",
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary shadow-xs scale-102"
                    : "bg-background/80 hover:bg-muted text-muted-foreground border-border/60 hover:text-foreground"
                )}
                title={isSelected && tab.id !== 'Tous' ? "Cliquer pour désactiver et revenir à l'aléatoire mondial" : undefined}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {isSelected && tab.id !== 'Tous' && (
                  <X className="h-3 w-3 ml-0.5 opacity-80 hover:opacity-100" />
                )}
              </button>
            );
          })}
        </div>

        {/* Action toggles (Disponibilité Garde-manger, Rapide, Éco) */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-5">
          <Button
            type="button"
            variant={sortByAvailability ? "default" : "outline"}
            size="sm"
            onClick={() => setSortByAvailability(prev => !prev)}
            className={cn(
              "h-8 rounded-full text-xs font-semibold gap-1.5 transition-all shadow-xs",
              sortByAvailability
                ? "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 ring-2 ring-emerald-500/20"
                : "border-emerald-600/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10"
            )}
            title="Activer pour trier selon le % d'ingrédients disponibles dans votre garde-manger"
          >
            <PackageCheck className="h-3.5 w-3.5 shrink-0" />
            <span>En stock d&apos;abord</span>
            {sortByAvailability && <X className="h-3 w-3 ml-0.5 opacity-80 hover:opacity-100" />}
          </Button>

          <Button
            size="sm"
            variant={filterQuick ? "secondary" : "outline"}
            onClick={() => setFilterQuick(!filterQuick)}
            className={cn(
              "h-8 rounded-full text-xs font-medium gap-1.5 transition-all",
              filterQuick && 'ring-2 ring-primary font-bold bg-primary/15 text-primary'
            )}
          >
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span>≤ 30 min</span>
          </Button>

          <Button
            size="sm"
            variant={filterEconomical ? "secondary" : "outline"}
            onClick={() => setFilterEconomical(!filterEconomical)}
            className={cn(
              "h-8 rounded-full text-xs font-medium gap-1.5 transition-all",
              filterEconomical && 'ring-2 ring-primary font-bold bg-primary/15 text-primary'
            )}
          >
            <Coins className="h-3.5 w-3.5 shrink-0" />
            <span>Économique</span>
          </Button>
        </div>

        <Button
          onClick={findRandomRecipes}
          className={cn(
            "h-10 sm:h-11 rounded-full px-6 sm:px-8 text-sm sm:text-base font-bold shadow-md transition-all gap-2",
            sortByAvailability
              ? "bg-emerald-600 hover:bg-emerald-700 text-white"
              : dishCourseFilter === 'dessert'
                ? "bg-pink-600 hover:bg-pink-700 text-white"
                : ""
          )}
        >
          {sortByAvailability ? (
            <>
              <PackageCheck className="h-4 w-4 shrink-0" />
              <span>
                {dishCourseFilter === 'plat'
                  ? "Voir les plats en stock"
                  : dishCourseFilter === 'dessert'
                    ? "Voir les desserts en stock"
                    : "Voir les recettes en stock"}
              </span>
            </>
          ) : (
            <>
              {dishCourseFilter === 'plat' ? (
                <>
                  <Utensils className="h-4 w-4 shrink-0" />
                  <span>Trouver un plat salé</span>
                </>
              ) : dishCourseFilter === 'dessert' ? (
                <>
                  <Cake className="h-4 w-4 shrink-0" />
                  <span>Trouver un dessert sucré</span>
                </>
              ) : (
                <>
                  <Shuffle className="h-4 w-4 shrink-0" />
                  <span>Trouver une idée (Plat + Dessert)</span>
                </>
              )}
            </>
          )}
        </Button>

        {suggestedRecipes.length > 0 && (
          <div className="mt-8 mb-2 max-w-4xl mx-auto flex items-center justify-between gap-2 px-2 text-xs text-muted-foreground animate-in fade-in">
            <span className="font-semibold flex items-center gap-1.5">
              {sortByAvailability ? (
                <>
                  <PackageCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Classées par disponibilité du stock</span>
                </>
              ) : (
                <>
                  <Shuffle className="h-3.5 w-3.5 text-primary" />
                  <span>
                    {dishCourseFilter === 'plat'
                      ? `Suggestions de plats salés (${suggestedRecipes.length})`
                      : dishCourseFilter === 'dessert'
                        ? `Suggestions de desserts sucrés (${suggestedRecipes.length})`
                        : `Suggestions (${suggestedRecipes.length})`}
                  </span>
                </>
              )}
            </span>
            <div className="flex items-center gap-1.5">
              {dishCourseFilter === 'plat' && (
                <span className="bg-amber-500/10 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full text-[11px] font-semibold border border-amber-500/20 flex items-center gap-1">
                  <Utensils className="h-3 w-3" /> Plats salés
                </span>
              )}
              {dishCourseFilter === 'dessert' && (
                <span className="bg-pink-500/10 text-pink-700 dark:text-pink-300 px-2 py-0.5 rounded-full text-[11px] font-semibold border border-pink-500/20 flex items-center gap-1">
                  <Cake className="h-3 w-3" /> Desserts sucrés
                </span>
              )}
              {selectedContinent !== 'Tous' && (
                <span className="bg-muted px-2 py-0.5 rounded-full text-[11px] font-medium border border-border/50">
                  {selectedContinent}
                </span>
              )}
            </div>
          </div>
        )}

        {suggestedRecipes.length > 0 ? (
          <div className='mt-3 max-w-4xl mx-auto text-left animate-in fade-in-50 grid grid-cols-1 md:grid-cols-2 gap-6'>
            {suggestedRecipes.map(recipe => {
              const { totalCost, perPersonCost } = getAdjustedRecipeCost(recipe);
              const { availableCount, totalCount, percentage: pantryPercent } = getRecipePantryAvailability(recipe.ingredients, pantry, purchaseHistory, dbarati);
              const isDessert = isDessertRecipe(recipe);

              return (
                <Card key={recipe.id} className="overflow-hidden flex flex-col bg-card shadow-lg rounded-xl border border-border/50">
                  <div className="relative h-44 w-full overflow-hidden bg-secondary">
                    <img
                      src={recipe.imageUrl || getRecipeImageUrl(recipe)}
                      alt={recipe.title}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=80';
                      }}
                    />

                    {/* Pays, disponibilité et type de plat sur la photo en petits caractères */}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10 flex-wrap max-w-[85%]">
                      {isDessert && (
                        <Badge className="text-[9px] h-5 px-1.5 bg-pink-600/90 text-white border-none backdrop-blur-sm font-semibold flex items-center gap-1 shadow-xs">
                          <Cake className="h-2.5 w-2.5" />
                          <span>Dessert</span>
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-[9px] h-5 px-1.5 bg-black/60 text-white border-none backdrop-blur-sm font-medium shadow-xs">
                        {recipe.country}
                      </Badge>
                      <Badge
                        className={cn(
                          "text-[9px] h-5 px-1.5 border-none backdrop-blur-sm font-bold flex items-center gap-1 shadow-xs",
                          pantryPercent === 100
                            ? "bg-emerald-600/90 text-white"
                            : pantryPercent >= 50
                              ? "bg-amber-600/90 text-white"
                              : "bg-zinc-800/80 text-zinc-200"
                        )}
                        title={`${availableCount}/${totalCount} ingrédients disponibles dans le garde-manger`}
                      >
                        <span className={cn(
                          "w-1 h-1 rounded-full shrink-0",
                          pantryPercent === 100 ? "bg-emerald-300" : pantryPercent >= 50 ? "bg-amber-300" : "bg-zinc-400"
                        )} />
                        <span>{pantryPercent}% dispo</span>
                        <span className="text-[8px] opacity-80 font-normal">({availableCount}/{totalCount})</span>
                      </Badge>
                    </div>

                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
                      {recipe.calories !== undefined && (
                        <Badge variant="secondary" className="bg-black/60 text-white backdrop-blur-sm border-none text-[9px] font-semibold h-5 px-1.5">
                          {recipe.calories} kcal
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="pr-2 flex-1">
                        <CardTitle>{recipe.title}</CardTitle>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          {recipe.preparationTime !== undefined && (
                            <Badge variant="outline" className="flex items-center gap-1 text-[11px]"><Clock className="h-3 w-3" />{recipe.preparationTime} min</Badge>
                          )}
                          {recipe.isEconomical && <Badge variant="outline" className="flex items-center gap-1 text-[11px]"><Coins className="h-3 w-3" />Éco</Badge>}
                          {totalCost !== null && (
                            <Badge className="flex items-center gap-1.5 bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/30 text-[11px]">
                              <TrendingDown className="h-3 w-3" />
                              <span className="font-bold">{formatPrice(totalCost)}</span>
                              <span className="text-[10px] font-normal opacity-85">({ideaPortions} {ideaPortions > 1 ? 'pers.' : 'pers.'})</span>
                              {perPersonCost !== null && ideaPortions > 1 && (
                                <span className="text-[9px] opacity-75 border-l border-green-500/30 pl-1.5 ml-0.5 font-normal">
                                  ~{formatPrice(perPersonCost)}/pers.
                                </span>
                              )}
                            </Badge>
                          )}
                        </div>
                      </div>
                      {recipe.calories !== undefined && (
                        <Badge variant="outline" className="whitespace-nowrap">{recipe.calories} kcal</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground">{recipe.description}</p>
                  </CardContent>
                  <CardFooter className="flex justify-between mt-auto bg-secondary/30 pt-4 gap-2">
                    <Button onClick={() => setViewingRecipe({ ...recipe, targetPortions: ideaPortions })}>Voir la recette</Button>
                    <div className="flex items-center gap-1.5">
                      {onAddToRecetteti && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 text-xs"
                          title="Ajouter à Recetteti"
                          onClick={() => {
                            onAddToRecetteti(recipe);
                            setSuggestedRecipes(prev => prev.filter(r => r.id !== recipe.id));
                          }}
                        >
                          <BookUser className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Recetteti</span>
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleSaveRecipe(recipe)}
                        title="Sauvegarder dans mes favoris"
                      >
                        <PlusCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        ) : (
          filteredDiscoverableRecipes.length === 0 && (
            <p className="text-muted-foreground mt-4 text-sm">
              {dishCourseFilter === 'plat'
                ? "Aucun plat salé ne correspond à vos filtres. Essayez d'en retirer un."
                : dishCourseFilter === 'dessert'
                  ? "Aucun dessert ne correspond à vos filtres. Essayez d'en retirer un."
                  : "Aucune recette ne correspond à vos filtres. Essayez d'en retirer un."}
            </p>
          )
        )}
      </div>

      <div className='text-center py-8 px-4 rounded-xl bg-gradient-to-br from-accent/10 via-card to-card border-2 border-accent/20 shadow-lg'>
        <h2 className='text-2xl font-bold mb-2'>J’ai pas envie de cuisiner</h2>
        <p className='text-muted-foreground mb-6'>Pas le courage ? Laissez le hasard décider de votre prochain plat à emporter !</p>
        <div className="flex justify-center">
          <Button size="lg" onClick={handleSpin} className="bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isSpinning}>
            <Dices className={`mr-2 h-5 w-5 ${isSpinning ? 'animate-spin' : ''}`} />
            {isSpinning ? 'Ça tourne...' : 'Lancer la roue de la flemme !'}
          </Button>
        </div>

        <div className="mt-8 h-24 flex flex-col justify-center items-center">
          {isSpinning && (
            <p className="text-4xl font-bold text-primary transition-opacity duration-100 animate-in fade-in">
              {displayedFood}
            </p>
          )}
          {!isSpinning && selectedStreetFood && (
            <div className="animate-in fade-in-50 text-center">
              <p className="text-muted-foreground">Et le gagnant est...</p>
              <p className="text-4xl font-bold text-primary mt-2">{selectedStreetFood}</p>
              <p className="text-sm font-semibold text-accent/80 mt-4 animate-pulse">Alors, on se régale ?</p>

              <Button
                variant="outline"
                className="mt-6 gap-2"
                onClick={() => {
                  const query = encodeURIComponent(selectedStreetFood);
                  window.open(`https://kol-youm-app.vercel.app/khrouj?category=fast-food&query=${query}`, '_blank');
                }}
              >
                <Utensils className="h-4 w-4" />
                Manger ça dehors
              </Button>
            </div>
          )}
        </div>
      </div>
      {/* Pop-up de validation de la préparation avec sélecteur de date */}
      <Dialog open={!!preparingDish} onOpenChange={(open) => { if (!open) setPreparingDish(null); }}>
        <DialogContent className="max-w-md w-[95vw] rounded-2xl p-6 bg-card border shadow-xl">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
              <Calendar className="h-5 w-5 text-primary" />
              Valider la préparation
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Indiquez la date de préparation pour <span className="font-semibold text-foreground">« {preparingDish?.text} »</span>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex items-center justify-between">
                <span>Date de préparation</span>
                {selectedPrepDate === todayStr && (
                  <span className="text-[10px] text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-full">
                    Aujourd&apos;hui
                  </span>
                )}
              </label>
              <Input
                type="date"
                className="rounded-xl h-11 text-sm bg-background border-primary/20"
                value={selectedPrepDate}
                max={todayStr}
                onChange={(e) => setSelectedPrepDate(e.target.value)}
              />
              {selectedPrepDate && (
                <p className="text-[11px] text-muted-foreground italic mt-1">
                  Jour sélectionné : <span className="font-semibold text-foreground not-italic">{formatDbaratiDate(selectedPrepDate + 'T12:00:00')}</span>
                </p>
              )}
            </div>

            {/* Alerte date déjà enregistrée */}
            {isDateAlreadyUsed && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <div className="space-y-1 leading-snug">
                  <p className="font-semibold">Plat déjà préparé à cette date</p>
                  <p className="opacity-90">
                    Ce plat a déjà été enregistré comme préparé le{' '}
                    <span className="font-bold underline">
                      {selectedPrepDate ? formatDbaratiDate(selectedPrepDate + 'T12:00:00', { withYear: true }) : ''}
                    </span>.
                    Il n&apos;est pas possible d&apos;enregistrer deux fois le même jour.
                  </p>
                </div>
              </div>
            )}

            {/* Alerte date dans le futur */}
            {isFutureDate && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <p className="font-medium">La date de préparation ne peut pas être dans le futur.</p>
              </div>
            )}

            {/* Aperçu des préparations existantes avec possibilité de retrait */}
            {(() => {
              const prepList = preparingDish?.prepHistory && preparingDish.prepHistory.length > 0
                ? preparingDish.prepHistory
                : (preparingDish?.lastPreparedAt ? [preparingDish.lastPreparedAt] : []);

              if (!preparingDish || prepList.length === 0) return null;

              return (
                <div className="text-[11px] text-muted-foreground bg-muted/40 p-2.5 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold block text-[10px] uppercase tracking-wider text-muted-foreground/80">
                      Historique des préparations ({prepList.length}) :
                    </span>
                    <span className="text-[9px] text-muted-foreground/70 italic">
                      (cliquez sur ✕ pour retirer)
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-0.5 max-h-28 overflow-y-auto pr-1">
                    {[...prepList].reverse().map((d, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 text-[10px] pl-2 pr-1 py-0.5 rounded-lg border bg-background/80 font-normal hover:border-destructive/50 transition-colors"
                      >
                        <span className="italic">{formatDbaratiDate(d, { withYear: true })}</span>
                        <button
                          type="button"
                          title="Retirer cette préparation (erreur)"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemovePrep(d);
                          }}
                          className="h-3.5 w-3.5 rounded-full inline-flex items-center justify-center text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2">
            {isDateAlreadyUsed && !preparingDish?.done && (
              <Button
                type="button"
                variant="outline"
                className="rounded-xl text-xs flex-1"
                onClick={handleReactivateWithoutHistory}
              >
                Cocher comme fait (sans ajouter de préparation)
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              className="rounded-xl text-xs"
              onClick={() => setPreparingDish(null)}
            >
              Annuler
            </Button>
            <Button
              type="button"
              className="rounded-xl text-xs font-bold shadow-sm"
              disabled={!selectedPrepDate || isDateAlreadyUsed || isFutureDate}
              onClick={handleConfirmPreparation}
            >
              Confirmer la préparation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
