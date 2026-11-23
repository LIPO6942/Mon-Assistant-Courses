'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, PlusCircle, Pencil, Trash2, Search, BrainCircuit, History, ChevronUp, ChevronDown, AlarmClock, X, Sparkles, Dices } from 'lucide-react';
import type { Receipt, Ingredient, CategoryDef, PurchaseHistory, DbaratiItem } from '@/lib/types';
import BudgetManager from './BudgetManager';
import { cn, getProductStatus, isNonFoodItem } from '@/lib/utils';
import { Sheet, SheetTrigger } from '@/components/ui/sheet';
import QuickReorderSheet from './QuickReorderSheet';
import ReminderSheet from './ReminderSheet';
import { getPantryCategoryTheme, getPantryCategoryThemesMap } from '@/lib/pantry-categories';

type CreativeFilter =
  | { type: 'all' }
  | { type: 'status'; value: 'red' | 'orange' | 'green' | 'chandyek' }
  | { type: 'category'; value: string }
  | { type: 'letter'; value: string }
  | { type: 'ingredient'; value: string };

const getFirstLetter = (str: string): string => {
  if (!str) return '';
  const stripped = str
    .replace(/^[\p{Emoji_Presentation}\p{Extended_Pictographic}\s'"\-–—«»()\[\]{}.,:;!?*#+/@&~_]+/gu, '')
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  if (!stripped) return '#';
  const char = stripped.charAt(0).toUpperCase();
  return (char >= 'A' && char <= 'Z') ? char : '#';
};

const getIngredientEmoji = (name: string): string => {
  const n = name.toLowerCase();
  if (n.includes('avocat')) return '🥑';
  if (n.includes('tomate')) return '🍅';
  if (n.includes('oignon')) return '🧅';
  if (n.includes('ail')) return '🧄';
  if (n.includes('pomme de terre') || n.includes('patate')) return '🥔';
  if (n.includes('oeuf') || n.includes('œuf')) return '🥚';
  if (n.includes('poulet')) return '🍗';
  if (n.includes('viande') || n.includes('boeuf') || n.includes('agneau')) return '🥩';
  if (n.includes('poisson') || n.includes('thon') || n.includes('sardine')) return '🐟';
  if (n.includes('lait')) return '🥛';
  if (n.includes('fromage') || n.includes('mozzarella') || n.includes('parmesan') || n.includes('ricotta')) return '🧀';
  if (n.includes('pate') || n.includes('pâte') || n.includes('spaghetti') || n.includes('macaroni') || n.includes('couscous')) return '🍝';
  if (n.includes('riz')) return '🍚';
  if (n.includes('pain') || n.includes('baguette')) return '🥖';
  if (n.includes('huile')) return '🫒';
  if (n.includes('carotte')) return '🥕';
  if (n.includes('poivron') || n.includes('piment')) return '🌶️';
  if (n.includes('citron')) return '🍋';
  if (n.includes('beurre')) return '🧈';
  if (n.includes('farine') || n.includes('semoule')) return '🌾';
  if (n.includes('sel') || n.includes('sucre')) return '🧂';
  if (n.includes('harissa')) return '🌶️';
  return '🍽️';
};

interface PantryViewProps {
  dbarati?: DbaratiItem[];
  groupedIngredients: Record<string, Ingredient[]>;
  categories: CategoryDef[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  openQuantityDialog: (ingredient: Ingredient) => void;
  openAddDialog: (category?: string, initialName?: string) => void;
  openEditDialog: (ingredient: Ingredient) => void;
  handleDeleteIngredient: (id: string) => void;
  openCategoryDialog: (category?: CategoryDef) => void;
  handleDeleteCategory: (id: string) => void;
  onToggleChandyekIngredient: (ingredientName: string) => void;
  chandyekIngredientsList: string[];
  initialBudget: number;
  setInitialBudget: (budget: number) => void;
  basketTotalToPay: number;
  totalSpent: number;
  clearBasket: () => void;
  resetTotalSpent: () => void;
  basketItemCount: number;
  remainingBudget: number;
  pantry: Ingredient[];
  onAddToBasket: (ingredient: Ingredient, quantity: number) => void;
  purchaseHistory: PurchaseHistory;
  onDeleteFromHistory: (id: string) => void;
  onUpdatePrices: (updates: { id: string; price: number }[]) => void;
  onAddIngredients: (newIngredients: Omit<Ingredient, 'id'>[]) => void;
  onSaveReceipt?: (receipt: Receipt) => void;
  onViewCategoryTrends: (category: CategoryDef) => void;
  onMoveCategory: (id: string, direction: 'up' | 'down') => void;
  userId?: string;
}

export default function PantryView({
  dbarati,
  groupedIngredients,
  categories,
  searchQuery,
  setSearchQuery,
  openQuantityDialog,
  openAddDialog,
  openEditDialog,
  handleDeleteIngredient,
  openCategoryDialog,
  handleDeleteCategory,
  onToggleChandyekIngredient,
  chandyekIngredientsList,
  initialBudget,
  setInitialBudget,
  basketTotalToPay,
  totalSpent,
  clearBasket,
  resetTotalSpent,
  basketItemCount,
  remainingBudget,
  pantry,
  onAddToBasket,
  purchaseHistory,
  onDeleteFromHistory,
  onUpdatePrices,
  onAddIngredients,
  onSaveReceipt,
  onViewCategoryTrends,
  onMoveCategory,
  userId,
}: PantryViewProps) {
  const [creativeFilter, setCreativeFilter] = useState<CreativeFilter>({ type: 'all' });
  const [showLetterDrawer, setShowLetterDrawer] = useState(false);

  // Évaluation des statuts pour chaque produit
  const statusCounts = useMemo(() => {
    let red = 0;
    let orange = 0;
    let green = 0;
    let chandyek = 0;

    pantry.forEach(item => {
      const isChandyek = chandyekIngredientsList.some(name => name.toLowerCase() === item.name.toLowerCase());
      if (isChandyek) chandyek++;

      const status = getProductStatus(purchaseHistory[item.id], item.name, dbarati, item.category);
      if (status === 'red') red++;
      else if (status === 'orange') orange++;
      else if (status === 'green') green++;
    });

    return { red, orange, green, chandyek };
  }, [pantry, purchaseHistory, dbarati, chandyekIngredientsList]);

  // Extraction des lettres A-Z disponibles dans le garde-manger
  const pantryLetters = useMemo(() => {
    const map = new Map<string, number>();
    pantry.forEach(item => {
      const letter = getFirstLetter(item.name);
      if (letter) {
        map.set(letter, (map.get(letter) || 0) + 1);
      }
    });
    return Array.from(map.entries())
      .map(([letter, count]) => ({ letter, count }))
      .sort((a, b) => {
        if (a.letter === '#') return 1;
        if (b.letter === '#') return -1;
        return a.letter.localeCompare(b.letter);
      });
  }, [pantry]);

  // Pépites et ingrédients phares présents dans le placard
  const stapleIngredients = useMemo(() => {
    const priorityKeywords = [
      'avocat', 'tomate', 'oignon', 'ail', 'oeuf', 'œuf', 'lait', 'fromage',
      'poulet', 'thon', 'pates', 'pâte', 'huile', 'piment', 'pomme de terre', 'riz', 'pain'
    ];
    const found: Ingredient[] = [];
    const usedNames = new Set<string>();

    for (const kw of priorityKeywords) {
      const match = pantry.find(item => item.name.toLowerCase().includes(kw) && !usedNames.has(item.name.toLowerCase()));
      if (match) {
        found.push(match);
        usedNames.add(match.name.toLowerCase());
      }
      if (found.length >= 8) break;
    }

    if (found.length < 6) {
      for (const item of pantry) {
        if (!usedNames.has(item.name.toLowerCase())) {
          found.push(item);
          usedNames.add(item.name.toLowerCase());
        }
        if (found.length >= 8) break;
      }
    }

    return found;
  }, [pantry]);

  const categoryCounts = useMemo(() => {
    const map = new Map<string, number>();
    pantry.forEach(item => {
      const cat = item.category || 'Autre';
      map.set(cat, (map.get(cat) || 0) + 1);
    });
    return map;
  }, [pantry]);

  const categoryThemesMap = useMemo(() => {
    const names = categories.map(c => c.name);
    return getPantryCategoryThemesMap(names);
  }, [categories]);

  // Actions de filtrage créatif sans aucune saisie
  const handleRandomPick = () => {
    if (pantry.length === 0) return;
    const randomIndex = Math.floor(Math.random() * pantry.length);
    const randomItem = pantry[randomIndex];
    setCreativeFilter({ type: 'ingredient', value: randomItem.name });
    setSearchQuery('');
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate([15, 30, 15]); } catch { }
    }
  };

  const handleStatusFilter = (status: 'red' | 'orange' | 'green' | 'chandyek') => {
    if (creativeFilter.type === 'status' && creativeFilter.value === status) {
      setCreativeFilter({ type: 'all' });
    } else {
      setCreativeFilter({ type: 'status', value: status });
      setSearchQuery('');
    }
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(10); } catch { }
    }
  };

  const handleCategoryFilter = (categoryName: string) => {
    if (creativeFilter.type === 'category' && creativeFilter.value === categoryName) {
      setCreativeFilter({ type: 'all' });
    } else {
      setCreativeFilter({ type: 'category', value: categoryName });
      setSearchQuery('');
    }
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(10); } catch { }
    }
  };

  const handleLetterFilter = (letter: string) => {
    if (creativeFilter.type === 'letter' && creativeFilter.value === letter) {
      setCreativeFilter({ type: 'all' });
    } else {
      setCreativeFilter({ type: 'letter', value: letter });
      setSearchQuery('');
    }
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(10); } catch { }
    }
  };

  const handleStapleFilter = (ingredientName: string) => {
    if (creativeFilter.type === 'ingredient' && creativeFilter.value.toLowerCase() === ingredientName.toLowerCase()) {
      setCreativeFilter({ type: 'all' });
    } else {
      setCreativeFilter({ type: 'ingredient', value: ingredientName });
      setSearchQuery('');
    }
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(10); } catch { }
    }
  };

  const handleClearAllFilters = () => {
    setCreativeFilter({ type: 'all' });
    setSearchQuery('');
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(10); } catch { }
    }
  };

  const isFilterActive = creativeFilter.type !== 'all' || searchQuery.trim().length > 0;

  const creativeFilterLabel = useMemo(() => {
    if (searchQuery.trim()) return `« ${searchQuery.trim()} »`;
    if (creativeFilter.type === 'status') {
      if (creativeFilter.value === 'red') return '🔴 À racheter d’urgence';
      if (creativeFilter.value === 'orange') return '🟠 Stock à surveiller';
      if (creativeFilter.value === 'green') return '🟢 En stock';
      if (creativeFilter.value === 'chandyek') return '🧠 Sélection Ch3andek';
    }
    if (creativeFilter.type === 'category') return `Rayon « ${creativeFilter.value} »`;
    if (creativeFilter.type === 'letter') return `Lettre « ${creativeFilter.value} »`;
    if (creativeFilter.type === 'ingredient') return `Produit « ${creativeFilter.value} »`;
    return '';
  }, [creativeFilter, searchQuery]);

  // Calcul dynamique des catégories et produits filtrés
  const activeGroupedIngredients = useMemo(() => {
    let items = pantry;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      items = items.filter(i => i.name.toLowerCase().includes(q));
    }

    if (creativeFilter.type === 'status') {
      if (creativeFilter.value === 'chandyek') {
        items = items.filter(i => chandyekIngredientsList.some(name => name.toLowerCase() === i.name.toLowerCase()));
      } else {
        items = items.filter(i => {
          const s = getProductStatus(purchaseHistory[i.id], i.name, dbarati, i.category);
          return s === creativeFilter.value;
        });
      }
    } else if (creativeFilter.type === 'category') {
      items = items.filter(i => (i.category || 'Autre') === creativeFilter.value);
    } else if (creativeFilter.type === 'letter') {
      items = items.filter(i => getFirstLetter(i.name) === creativeFilter.value);
    } else if (creativeFilter.type === 'ingredient') {
      const target = creativeFilter.value.toLowerCase();
      items = items.filter(i => i.name.toLowerCase().includes(target));
    }

    const acc = categories.reduce((obj, cat) => ({ ...obj, [cat.name]: [] }), {} as Record<string, Ingredient[]>);
    acc['Autre'] = [];
    items.forEach(item => {
      const catName = item.category && categories.some(c => c.name === item.category) ? item.category : 'Autre';
      if (!acc[catName]) acc[catName] = [];
      acc[catName].push(item);
    });
    return acc;
  }, [pantry, searchQuery, creativeFilter, categories, purchaseHistory, dbarati, chandyekIngredientsList]);

  const totalMatchingIngredients = useMemo(() => {
    return Object.values(activeGroupedIngredients).reduce((sum, items) => sum + items.length, 0);
  }, [activeGroupedIngredients]);

  return (
    <div>
      <BudgetManager
        initialBudget={initialBudget}
        setInitialBudget={setInitialBudget}
        basketTotalToPay={basketTotalToPay}
        totalSpent={totalSpent}
        clearBasket={clearBasket}
        resetTotalSpent={resetTotalSpent}
        basketItemCount={basketItemCount}
        remainingBudget={remainingBudget}
      />
      <div className="flex gap-2 mb-3">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="h-11 w-11 rounded-full shadow-sm shrink-0 cursor-pointer" title="Programmer un rappel">
              <AlarmClock className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <ReminderSheet
            pantry={pantry}
            userId={userId}
          />
        </Sheet>
        <div className="relative flex-grow">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder="Rechercher ou toucher un filtre créatif ci-dessous..."
            className="pl-11 pr-10 rounded-full h-11 text-xs sm:text-sm [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden shadow-xs"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (e.target.value.trim() && creativeFilter.type !== 'all') {
                setCreativeFilter({ type: 'all' });
              }
            }}
          />
          {searchQuery.length > 0 && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              title="Effacer la recherche"
              aria-label="Effacer la recherche"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="h-11 w-11 rounded-full shadow-sm shrink-0 cursor-pointer" title="Historique d'achats">
              <History className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <QuickReorderSheet
            purchaseHistory={purchaseHistory}
            pantry={pantry}
            onAddToBasket={onAddToBasket}
            onDeleteFromHistory={onDeleteFromHistory}
            dbarati={dbarati}
          />
        </Sheet>
      </div>

      {/* --- ATELIER DE RECHERCHE CRÉATIVE DU GARDE-MANGER (ZERO TYPING) --- */}
      <div className="mb-6 space-y-2">
        {/* Ligne 1 : Statuts intelligents, Surprise aléatoire & Index A-Z */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 scroll-smooth snap-x">
          {/* Bouton Tous */}
          <button
            type="button"
            onClick={handleClearAllFilters}
            className={cn(
              "h-8 px-3 rounded-full text-xs font-bold shrink-0 transition-all duration-200 snap-start flex items-center gap-1.5 border shadow-2xs cursor-pointer",
              creativeFilter.type === 'all' && !searchQuery.trim()
                ? "bg-primary text-primary-foreground border-primary shadow-xs font-black ring-2 ring-primary/20 scale-105"
                : "bg-background/90 hover:bg-muted text-foreground border-border/60 hover:border-primary/40 active:scale-95"
            )}
          >
            <span>🌟 Tous</span>
            <span className="text-[10px] opacity-80 font-normal">({pantry.length})</span>
          </button>

          {/* Bouton À racheter d'urgence (rouge) */}
          {statusCounts.red > 0 && (
            <button
              type="button"
              onClick={() => handleStatusFilter('red')}
              className={cn(
                "h-8 px-3 rounded-full text-xs font-bold shrink-0 transition-all duration-200 snap-start flex items-center gap-1.5 border shadow-2xs cursor-pointer",
                creativeFilter.type === 'status' && creativeFilter.value === 'red'
                  ? "bg-red-500 text-white border-red-500 shadow-xs ring-2 ring-red-400/30 scale-105"
                  : "bg-red-50 hover:bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-950/60 border-red-200 dark:border-red-800/40 active:scale-95"
              )}
              title="Produits en rupture ou demandés par Dbarati"
            >
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse shrink-0" />
              <span>À racheter</span>
              <span className="text-[10px] opacity-85 font-semibold">({statusCounts.red})</span>
            </button>
          )}

          {/* Bouton Stock bas (orange) */}
          {statusCounts.orange > 0 && (
            <button
              type="button"
              onClick={() => handleStatusFilter('orange')}
              className={cn(
                "h-8 px-3 rounded-full text-xs font-bold shrink-0 transition-all duration-200 snap-start flex items-center gap-1.5 border shadow-2xs cursor-pointer",
                creativeFilter.type === 'status' && creativeFilter.value === 'orange'
                  ? "bg-orange-500 text-white border-orange-500 shadow-xs ring-2 ring-orange-400/30 scale-105"
                  : "bg-orange-50 hover:bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300 dark:hover:bg-orange-950/60 border-orange-200 dark:border-orange-800/40 active:scale-95"
              )}
              title="Produits dont le stock est bas"
            >
              <span className="h-2 w-2 rounded-full bg-orange-500 shrink-0" />
              <span>À surveiller</span>
              <span className="text-[10px] opacity-85 font-semibold">({statusCounts.orange})</span>
            </button>
          )}

          {/* Bouton En stock (vert) */}
          {statusCounts.green > 0 && (
            <button
              type="button"
              onClick={() => handleStatusFilter('green')}
              className={cn(
                "h-8 px-3 rounded-full text-xs font-bold shrink-0 transition-all duration-200 snap-start flex items-center gap-1.5 border shadow-2xs cursor-pointer",
                creativeFilter.type === 'status' && creativeFilter.value === 'green'
                  ? "bg-green-600 text-white border-green-600 shadow-xs ring-2 ring-green-500/30 scale-105"
                  : "bg-green-50 hover:bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300 dark:hover:bg-green-950/60 border-green-200 dark:border-green-800/40 active:scale-95"
              )}
              title="Produits bien approvisionnés"
            >
              <span className="h-2 w-2 rounded-full bg-green-500 shrink-0" />
              <span>En stock</span>
              <span className="text-[10px] opacity-85 font-semibold">({statusCounts.green})</span>
            </button>
          )}

          {/* Bouton Ch3andek */}
          {statusCounts.chandyek > 0 && (
            <button
              type="button"
              onClick={() => handleStatusFilter('chandyek')}
              className={cn(
                "h-8 px-3 rounded-full text-xs font-bold shrink-0 transition-all duration-200 snap-start flex items-center gap-1.5 border shadow-2xs cursor-pointer",
                creativeFilter.type === 'status' && creativeFilter.value === 'chandyek'
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-xs ring-2 ring-indigo-400/30 scale-105"
                  : "bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800/40 active:scale-95"
              )}
              title="Ingrédients cochés pour trouver des recettes"
            >
              <BrainCircuit className="h-3 w-3 shrink-0" />
              <span>Ch3andek</span>
              <span className="text-[10px] opacity-85 font-semibold">({statusCounts.chandyek})</span>
            </button>
          )}

          {/* Bouton Tirage Aléatoire Surprise */}
          <button
            type="button"
            onClick={handleRandomPick}
            className="h-8 px-3 rounded-full text-xs font-bold shrink-0 transition-all duration-200 snap-start flex items-center gap-1.5 border border-purple-200 dark:border-purple-800/50 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-amber-500/10 hover:from-purple-500/20 hover:to-amber-500/20 text-purple-700 dark:text-purple-300 shadow-2xs active:scale-95 cursor-pointer"
            title="Tirer au sort un ingrédient surprise du placard"
          >
            <Dices className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
            <span>Surprise !</span>
          </button>

          {/* Bouton Toggle pour Lettres A-Z & Essentiels */}
          <button
            type="button"
            onClick={() => setShowLetterDrawer(!showLetterDrawer)}
            className={cn(
              "h-8 px-3 rounded-full text-xs font-bold shrink-0 transition-all duration-200 snap-start flex items-center gap-1.5 border shadow-2xs cursor-pointer",
              showLetterDrawer || creativeFilter.type === 'letter' || creativeFilter.type === 'ingredient'
                ? "bg-primary/15 text-primary border-primary/30"
                : "bg-background/90 hover:bg-muted text-muted-foreground border-border/60 hover:text-foreground active:scale-95"
            )}
            title="Explorer par lettres A-Z ou ingrédients phares"
          >
            <span>🔤 Index A-Z</span>
            <ChevronDown className={cn("h-3 w-3 transition-transform duration-200", showLetterDrawer && "rotate-180")} />
          </button>
        </div>

        {/* Ligne 2 : Rayons / Catégories Visuelles avec émojis */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 scroll-smooth snap-x">
          {categories
            .filter(cat => (categoryCounts.get(cat.name) || 0) > 0)
            .map(cat => {
              const count = categoryCounts.get(cat.name) || 0;
              const isSelected = creativeFilter.type === 'category' && creativeFilter.value === cat.name;
              const theme = categoryThemesMap[cat.name] || getPantryCategoryTheme(cat.name);

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryFilter(cat.name)}
                  className={cn(
                    "h-7 px-2.5 rounded-full text-xs font-medium shrink-0 transition-all duration-150 snap-start flex items-center gap-1.5 border cursor-pointer",
                    isSelected
                      ? cn(theme.pillBg, theme.pillBorder, theme.pillText, "font-bold shadow-xs scale-105 ring-2 ring-primary/25")
                      : "bg-background/80 hover:bg-muted/80 text-foreground/80 border-border/60 active:scale-95"
                  )}
                  title={`Filtrer par le rayon ${cat.name} (${count})`}
                >
                  <span className="text-sm leading-none shrink-0">{theme.emoji}</span>
                  <span className="truncate max-w-[120px]">{cat.name}</span>
                  <span className="text-[10px] opacity-75 font-semibold">({count})</span>
                </button>
              );
            })}
        </div>

        {/* Panneau dépliable : Index Alphabétique A-Z & Pépites / Essentiels */}
        {showLetterDrawer && (
          <div className="p-3 rounded-2xl bg-muted/40 dark:bg-zinc-900/40 border border-border/60 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Lettres alphabétiques A-Z */}
            {pantryLetters.length > 0 && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1">
                  <span>🔤</span>
                  <span>Filtrer par lettre initiale</span>
                </p>
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
                  {pantryLetters.map(({ letter, count }) => {
                    const isSelected = creativeFilter.type === 'letter' && creativeFilter.value === letter;
                    return (
                      <button
                        key={letter}
                        type="button"
                        onClick={() => handleLetterFilter(letter)}
                        className={cn(
                          "h-7 min-w-7 px-1.5 rounded-lg text-xs font-black shrink-0 transition-all duration-150 flex items-center justify-center gap-0.5 border cursor-pointer",
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary shadow-xs scale-110"
                            : "bg-background text-foreground border-border/60 hover:bg-muted active:scale-95"
                        )}
                        title={`${count} produit${count > 1 ? 's' : ''} commençant par ${letter}`}
                      >
                        <span className="uppercase">{letter}</span>
                        <span className="text-[9px] opacity-70 font-normal">{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Pépites et Essentiels du placard */}
            {stapleIngredients.length > 0 && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1">
                  <span>✨</span>
                  <span>Essentiels & ingrédients phares</span>
                </p>
                <div className="flex flex-wrap items-center gap-1.5">
                  {stapleIngredients.map(item => {
                    const isSelected = creativeFilter.type === 'ingredient' && creativeFilter.value.toLowerCase() === item.name.toLowerCase();
                    const emoji = getIngredientEmoji(item.name);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleStapleFilter(item.name)}
                        className={cn(
                          "h-7 px-2.5 rounded-full text-xs font-semibold transition-all duration-150 flex items-center gap-1 border cursor-pointer",
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary shadow-xs scale-105"
                            : "bg-background text-foreground border-border/60 hover:bg-muted active:scale-95"
                        )}
                      >
                        <span>{emoji}</span>
                        <span>{item.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bannière active ultra-compacte sur UNE SEULE LIGNE */}
        {isFilterActive && (
          <div className="flex items-center justify-between gap-1.5 max-w-4xl mx-auto px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-primary/10 border border-primary/25 text-primary animate-in fade-in duration-150">
            <div className="flex items-center gap-1.5 text-xs font-bold min-w-0">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-primary text-primary-foreground font-black text-xs shrink-0 shadow-xs">
                ✨
              </span>
              <span className="text-xs truncate">
                {creativeFilterLabel}
              </span>
              <span className="text-[11px] opacity-75 font-medium shrink-0">
                ({totalMatchingIngredients})
              </span>
            </div>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={handleClearAllFilters}
              className="h-6 px-2 rounded-lg text-[11px] sm:text-xs font-semibold hover:bg-primary/20 text-primary gap-1 shrink-0 cursor-pointer"
            >
              <X className="h-3 w-3" />
              <span>Afficher tout</span>
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {(() => {
          const filledCategories = Object.entries(activeGroupedIngredients).filter(([, items]) => items.length > 0);

          if (filledCategories.length === 0 && isFilterActive) {
            return (
              <div className="col-span-full py-12 px-6 flex flex-col items-center justify-center text-center bg-card/60 dark:bg-zinc-900/40 rounded-3xl border border-dashed border-border/80 shadow-xs animate-in fade-in duration-200">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3 text-2xl shadow-inner">
                  ✨
                </div>
                <h3 className="text-base font-bold text-foreground mb-1">
                  Aucun ingrédient ne correspond à ce filtre
                </h3>
                <p className="text-xs text-muted-foreground max-w-sm mb-5">
                  Essayez un autre filtre ou réinitialisez pour afficher tout votre garde-manger.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleClearAllFilters}
                    className="rounded-full text-xs font-semibold gap-1.5 h-9 px-4 cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                    Réinitialiser le filtre
                  </Button>
                  {searchQuery.trim() && (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => openAddDialog(undefined, searchQuery.trim())}
                      className="rounded-full text-xs font-semibold gap-1.5 h-9 px-4 shadow-sm cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Ajouter « {searchQuery.trim()} »
                    </Button>
                  )}
                </div>
              </div>
            );
          }

          // Calculer les thèmes avec unicité absolue des émojis (aucun doublon)
          const categoryNames = filledCategories.map(([categoryName]) => {
            const cat = categories.find(c => c.name === categoryName);
            return cat?.name || categoryName || 'Autre';
          });
          const categoryThemesMap = getPantryCategoryThemesMap(categoryNames);

          return filledCategories.map(([categoryName, items], index) => {
            const category = categories.find(c => c.name === categoryName) || { id: 'c-autre', name: categoryName || 'Autre' };

            // Thème visuel intelligent : détection sémantique d'émoji et palette (produits laitiers / crèmerie en JAUNE)
            const palette = categoryThemesMap[category.name] || getPantryCategoryTheme(category.name);

            return (
              <Card key={category.id} className={cn("flex flex-col backdrop-blur-xl shadow-sm rounded-3xl overflow-hidden border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group/card", palette.bg, palette.border)}>
                <CardHeader className={cn("flex flex-row items-center justify-between gap-2 p-3 sm:p-4 border-b border-border/10", palette.header)}>
                  <CardTitle
                    className="cursor-pointer flex-1 min-w-0"
                    onClick={() => onViewCategoryTrends(category)}
                    title="Voir l'évolution des prix"
                  >
                    <span
                      className={cn(
                        "inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-2xl text-xs sm:text-sm font-bold shadow-xs border transition-all duration-200 hover:shadow-sm active:scale-[0.98] leading-snug break-words text-left max-w-full",
                        palette.pillBg,
                        palette.pillBorder,
                        palette.pillText
                      )}
                    >
                      <span className="text-base sm:text-lg leading-none shrink-0 select-none" role="img" aria-label={category.name}>
                        {palette.emoji}
                      </span>
                      <span className="break-words font-semibold tracking-tight">{category.name}</span>
                    </span>
                  </CardTitle>
                  {category.name !== 'Autre' && <div className="flex items-center gap-1 shrink-0 opacity-100 md:opacity-0 md:group-hover/card:opacity-100 transition-opacity ml-1">
                    <button
                      className={cn('h-6 w-6 flex items-center justify-center rounded-md transition-colors', palette.icon, palette.buttonHover, index === 0 ? 'opacity-20 pointer-events-none' : '')}
                      onClick={() => onMoveCategory(category.id, 'up')}
                      title="Monter"
                      disabled={index === 0}
                    >
                      <ChevronUp className="h-4 w-4" />
                    </button>
                    <button
                      className={cn('h-6 w-6 flex items-center justify-center rounded-md transition-colors', palette.icon, palette.buttonHover, index === filledCategories.length - 1 ? 'opacity-20 pointer-events-none' : '')}
                      onClick={() => onMoveCategory(category.id, 'down')}
                      title="Descendre"
                      disabled={index === filledCategories.length - 1}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    <Button variant="ghost" size="icon" className={cn('h-6 w-6 transition-colors', palette.buttonHover)} onClick={() => openCategoryDialog(category)}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className='h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors' onClick={() => handleDeleteCategory(category.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>}
                </CardHeader>
                <CardContent className="flex-grow p-3">
                  <ScrollArea className="h-48 pr-2">
                    <ul className="space-y-1.5">
                      {items.map((item) => {
                        const isNonFood = isNonFoodItem(item.name, item.category);
                        const isSelectedForChandyek = !isNonFood && chandyekIngredientsList.some(name => name.toLowerCase() === item.name.toLowerCase());

                        return (
                          <li
                            key={item.id}
                            className={cn(
                              "flex justify-between items-center p-2 rounded-xl border border-transparent transition-all duration-200",
                              "hover:bg-white/60 dark:hover:bg-black/20 hover:border-black/5 dark:hover:border-white/5 hover:shadow-xs group/item"
                            )}
                          >
                            <div className="flex-1 min-w-0 pr-2">
                              <div className="flex items-center gap-1.5">
                                <p className="font-semibold text-xs tracking-tight truncate text-foreground/90">{item.name}</p>
                                {(() => {
                                  const status = getProductStatus(purchaseHistory[item.id], item.name, dbarati, item.category);
                                  if (!status) return null;
                                  return (
                                    <span
                                      className={cn(
                                        "h-2 w-2 rounded-full shrink-0",
                                        status === 'green' && "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]",
                                        status === 'orange' && "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]",
                                        status === 'red' && "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]"
                                      )}
                                    />
                                  );
                                })()}
                              </div>
                              <p className='text-[10px] text-muted-foreground font-medium'>{item.price.toFixed(3)} DT / {item.unit}</p>
                            </div>

                            <div className='flex items-center gap-0.5 shrink-0'>
                              <Button
                                variant="ghost"
                                size="icon"
                                className={cn('h-7 w-7 rounded-full text-muted-foreground transition-colors', palette.buttonHover)}
                                title="Ajouter au panier"
                                onClick={() => openQuantityDialog(item)}
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </Button>
                              {!isNonFood && (
                                <Button
                                  variant={isSelectedForChandyek ? "secondary" : "ghost"}
                                  size="icon"
                                  className={cn(
                                    'h-7 w-7 rounded-full transition-colors',
                                    isSelectedForChandyek
                                      ? 'bg-primary/15 text-primary hover:bg-primary/25'
                                      : `text-muted-foreground ${palette.buttonHover}`
                                  )}
                                  title="Ajouter/Retirer de 'Ch3andek'"
                                  onClick={() => onToggleChandyekIngredient(item.name)}
                                >
                                  <BrainCircuit className="h-3.5 w-3.5" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                className={cn('h-7 w-7 rounded-full text-muted-foreground transition-colors', palette.buttonHover)}
                                title="Modifier"
                                onClick={() => openEditDialog(item)}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className='h-7 w-7 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors'
                                title="Supprimer"
                                onClick={() => {
                                  if (window.confirm(`Êtes-vous sûr de vouloir supprimer "${item.name}" ?`)) {
                                    handleDeleteIngredient(item.id);
                                  }
                                }}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </ScrollArea>
                </CardContent>
                <CardFooter className="p-3 pt-1 border-t border-border/10 bg-black/5">
                  <Button variant="ghost" className={cn("w-full mt-2 bg-transparent border border-dashed rounded-xl font-medium transition-all", palette.text, palette.border, palette.buttonHover)} onClick={() => openAddDialog(category.name)}><PlusCircle className="mr-2 h-4 w-4" /> Ajouter un produit</Button>
                </CardFooter>
              </Card>
            );
          });
        })()}
        <Card className="flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/20 bg-muted/5 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 min-h-[350px] rounded-3xl group cursor-pointer" onClick={() => openCategoryDialog()}>
          <div className="h-14 w-14 rounded-full bg-background shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 border border-border/50">
            <PlusCircle className="h-7 w-7 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <span className="font-semibold text-muted-foreground group-hover:text-primary transition-colors">Ajouter une catégorie</span>
        </Card>
      </div>

      {/* Pilule flottante pour réinitialiser le filtre lors du défilement */}
      {isFilterActive && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 bg-card/95 dark:bg-zinc-900/95 backdrop-blur-md border border-primary/30 shadow-2xl px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-bottom-3 duration-200">
          <span className="flex items-center gap-1.5 text-foreground whitespace-nowrap">
            <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>
              {totalMatchingIngredients} produit{totalMatchingIngredients > 1 ? 's' : ''} ({creativeFilterLabel})
            </span>
          </span>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={handleClearAllFilters}
            className="h-6 px-2.5 rounded-full text-[11px] font-bold bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 gap-1 transition-colors shrink-0 cursor-pointer"
          >
            <X className="h-3 w-3" />
            <span>Tout afficher</span>
          </Button>
        </div>
      )}
    </div>
  );
}
