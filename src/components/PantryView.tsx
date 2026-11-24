'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, PlusCircle, Pencil, Trash2, Search, BrainCircuit, History, ChevronUp, ChevronDown, AlarmClock, X, Sparkles } from 'lucide-react';
import type { Receipt, Ingredient, CategoryDef, PurchaseHistory, DbaratiItem } from '@/lib/types';
import BudgetManager from './BudgetManager';
import { cn, getProductStatus, isNonFoodItem } from '@/lib/utils';
import { Sheet, SheetTrigger } from '@/components/ui/sheet';
import QuickReorderSheet from './QuickReorderSheet';
import ReminderSheet from './ReminderSheet';
import { getPantryCategoryTheme, getPantryCategoryThemesMap } from '@/lib/pantry-categories';

type CreativeFilter =
  | { type: 'all' }
  | { type: 'status'; value: 'red' | 'orange' | 'green' };

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

  // Évaluation des statuts pour chaque produit
  const statusCounts = useMemo(() => {
    let red = 0;
    let orange = 0;
    let green = 0;

    pantry.forEach(item => {
      const status = getProductStatus(purchaseHistory[item.id], item.name, dbarati, item.category);
      if (status === 'red') red++;
      else if (status === 'orange') orange++;
      else if (status === 'green') green++;
    });

    return { red, orange, green };
  }, [pantry, purchaseHistory, dbarati]);

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
  const handleStatusFilter = (status: 'red' | 'orange' | 'green') => {
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

  const handleClearAllFilters = () => {
    setCreativeFilter({ type: 'all' });
    setSearchQuery('');
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(10); } catch { }
    }
  };

  const isFilterActive = creativeFilter.type !== 'all' || searchQuery.trim().length > 0;

  const hasExactMatch = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return pantry.some(i => i.name.trim().toLowerCase() === q);
  }, [pantry, searchQuery]);

  const showAddSuggestion = searchQuery.trim().length > 0 && !hasExactMatch;

  const creativeFilterLabel = useMemo(() => {
    if (searchQuery.trim()) return `« ${searchQuery.trim()} »`;
    if (creativeFilter.type === 'status') {
      if (creativeFilter.value === 'red') return '🔴 À racheter d’urgence';
      if (creativeFilter.value === 'orange') return '🟠 Stock à surveiller';
      if (creativeFilter.value === 'green') return '🟢 En stock';
    }
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
      items = items.filter(i => {
        const s = getProductStatus(purchaseHistory[i.id], i.name, dbarati, i.category);
        return s === creativeFilter.value;
      });
    }

    const acc = categories.reduce((obj, cat) => ({ ...obj, [cat.name]: [] }), {} as Record<string, Ingredient[]>);
    acc['Autre'] = [];
    items.forEach(item => {
      const catName = item.category && categories.some(c => c.name === item.category) ? item.category : 'Autre';
      if (!acc[catName]) acc[catName] = [];
      acc[catName].push(item);
    });
    return acc;
  }, [pantry, searchQuery, creativeFilter, categories, purchaseHistory, dbarati]);

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

        </div>

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
                  {searchQuery.trim()
                    ? `« ${searchQuery.trim()} » n'est pas encore dans votre garde-manger.`
                    : "Essayez un autre filtre ou réinitialisez pour afficher tout votre garde-manger."}
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
                      <span className="text-[11px] sm:text-xs font-normal opacity-75 ml-1 shrink-0">
                        ({items.length !== (categoryCounts.get(category.name) ?? items.length) ? `${items.length}/${categoryCounts.get(category.name) ?? items.length}` : (categoryCounts.get(category.name) ?? items.length)})
                      </span>
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

      {/* Pilule flottante ancrée au-dessus du clavier et en bas d'écran */}
      {isFilterActive && (
        <div className="fixed bottom-4 sm:bottom-5 left-1/2 -translate-x-1/2 z-40 max-w-[95vw] bg-card/95 dark:bg-zinc-900/95 backdrop-blur-md border border-primary/30 shadow-2xl px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-full flex items-center gap-1.5 sm:gap-2 text-xs font-semibold animate-in slide-in-from-bottom-3 duration-200">
          {showAddSuggestion ? (
            <Button
              type="button"
              size="sm"
              onClick={() => openAddDialog(undefined, searchQuery.trim())}
              className="h-7 sm:h-8 px-3 rounded-full text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs gap-1.5 shrink-0 cursor-pointer active:scale-95 transition-all"
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="truncate max-w-[160px] sm:max-w-xs">
                Ajouter « {searchQuery.trim()} »
              </span>
            </Button>
          ) : (
            <span className="flex items-center gap-1.5 text-foreground whitespace-nowrap px-1 text-[11px] sm:text-xs">
              <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>
                {totalMatchingIngredients} produit{totalMatchingIngredients > 1 ? 's' : ''} ({creativeFilterLabel})
              </span>
            </span>
          )}

          {showAddSuggestion && totalMatchingIngredients > 0 && (
            <span className="text-[10px] sm:text-[11px] text-muted-foreground font-medium px-0.5 shrink-0 whitespace-nowrap">
              ({totalMatchingIngredients} trouvé{totalMatchingIngredients > 1 ? 's' : ''})
            </span>
          )}

          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={handleClearAllFilters}
            className="h-7 sm:h-8 px-2 sm:px-2.5 rounded-full text-[11px] font-bold text-muted-foreground hover:text-foreground hover:bg-muted/80 gap-1 transition-colors shrink-0 cursor-pointer active:scale-95"
            title="Tout afficher"
          >
            <X className="h-3 w-3" />
            <span>Tout afficher</span>
          </Button>
        </div>
      )}
    </div>
  );
}
