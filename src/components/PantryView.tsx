'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, PlusCircle, Pencil, Trash2, Search, BrainCircuit, History, ChevronUp, ChevronDown, AlarmClock } from 'lucide-react';
import type { Receipt, Ingredient, CategoryDef, PurchaseHistory, DbaratiItem } from '@/lib/types';
import BudgetManager from './BudgetManager';
import { cn, getProductStatus, isNonFoodItem } from '@/lib/utils';
import { Sheet, SheetTrigger } from '@/components/ui/sheet';
import QuickReorderSheet from './QuickReorderSheet';
import ReminderSheet from './ReminderSheet';
import { getPantryCategoryTheme } from '@/lib/pantry-categories';

interface PantryViewProps {
  dbarati?: DbaratiItem[];
  groupedIngredients: Record<string, Ingredient[]>;
  categories: CategoryDef[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  openQuantityDialog: (ingredient: Ingredient) => void;
  openAddDialog: (category?: string) => void;
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
      <div className="flex gap-2 mb-6">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="h-11 w-11 rounded-full shadow-sm shrink-0" title="Programmer un rappel">
              <AlarmClock className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <ReminderSheet
            pantry={pantry}
            userId={userId}
          />
        </Sheet>
        <div className="relative flex-grow">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input type="search" placeholder="Rechercher un ingrédient..." className="pl-11 rounded-full h-11 text-base" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="h-11 w-11 rounded-full shadow-sm shrink-0" title="Historique / Re-commande">
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
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {(() => {
          const filledCategories = Object.entries(groupedIngredients).filter(([, items]) => items.length > 0);
          return filledCategories.map(([categoryName, items], index) => {
            const category = categories.find(c => c.name === categoryName) || { id: 'c-autre', name: categoryName || 'Autre' };

            // Thème visuel intelligent : détection sémantique d'émoji et palette (produits laitiers / crèmerie en JAUNE)
            const palette = getPantryCategoryTheme(category.name);

            return (
              <Card key={category.id} className={cn("flex flex-col backdrop-blur-xl shadow-sm rounded-3xl overflow-hidden border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group/card", palette.bg, palette.border)}>
                <CardHeader className={cn("flex flex-row items-center justify-between pb-3 border-b border-border/10", palette.header)}>
                  <CardTitle
                    className="cursor-pointer min-w-0"
                    onClick={() => onViewCategoryTrends(category)}
                    title="Voir l'évolution des prix"
                  >
                    <span
                      className={cn(
                        "inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs sm:text-sm font-bold shadow-2xs border transition-all duration-200 hover:scale-[1.03] active:scale-95 truncate max-w-full",
                        palette.pillBg,
                        palette.pillBorder,
                        palette.pillText
                      )}
                    >
                      <span className="text-base sm:text-lg leading-none shrink-0" role="img" aria-label={category.name}>
                        {palette.emoji}
                      </span>
                      <span className="truncate">{category.name}</span>
                    </span>
                  </CardTitle>
                  {category.name !== 'Autre' && <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover/card:opacity-100 transition-opacity">
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
                                  const status = getProductStatus(purchaseHistory[item.id], item.name, dbarati);
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
    </div>
  );
}
