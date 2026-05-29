
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, PlusCircle, Pencil, Trash2, Search, BrainCircuit, History, ChevronUp, ChevronDown, AlarmClock } from 'lucide-react';
import type { Ingredient, CategoryDef, PurchaseHistory } from '@/lib/types';
import BudgetManager from './BudgetManager';
import { cn, getProductStatus } from '@/lib/utils';
import { Sheet, SheetTrigger } from '@/components/ui/sheet';
import QuickReorderSheet from './QuickReorderSheet';
import ReminderSheet from './ReminderSheet';
import { ImportFromLawra9Dialog } from './ImportFromLawra9Dialog';

interface PantryViewProps {
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
  purchaseHistory: PurchaseHistory;
  pantry: Ingredient[];
  onAddToBasket: (ingredient: Ingredient, quantity: number) => void;
  onDeleteFromHistory: (id: string) => void;
  onUpdatePrices: (updates: { id: string; price: number }[]) => void;
  onAddIngredients: (newIngredients: Omit<Ingredient, 'id'>[]) => void;
  onViewCategoryTrends: (category: CategoryDef) => void;
  onMoveCategory: (id: string, direction: 'up' | 'down') => void;
  userId?: string;
}

export default function PantryView({
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
  purchaseHistory,
  pantry,
  onAddToBasket,
  onDeleteFromHistory,
  onUpdatePrices,
  onAddIngredients,
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
        <ImportFromLawra9Dialog
          allIngredients={pantry}
          categories={categories}
          onUpdatePrices={onUpdatePrices}
          onAddIngredients={onAddIngredients}
        />
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
          />
        </Sheet>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {(() => {
          const filledCategories = Object.entries(groupedIngredients).filter(([, items]) => items.length > 0);
          return filledCategories.map(([categoryName, items], index) => {
            const category = categories.find(c => c.name === categoryName) || { id: 'c-autre', name: 'Autre' };

            // Define a vibrant color palette
            const colorPalettes = [
              { name: 'emerald', border: 'border-emerald-200/50', bg: 'bg-emerald-50/30', header: 'bg-gradient-to-r from-emerald-100/80 to-emerald-50/20', text: 'text-emerald-700', icon: 'text-emerald-600', buttonHover: 'hover:bg-emerald-100 hover:text-emerald-700' },
              { name: 'blue', border: 'border-blue-200/50', bg: 'bg-blue-50/30', header: 'bg-gradient-to-r from-blue-100/80 to-blue-50/20', text: 'text-blue-700', icon: 'text-blue-600', buttonHover: 'hover:bg-blue-100 hover:text-blue-700' },
              { name: 'violet', border: 'border-violet-200/50', bg: 'bg-violet-50/30', header: 'bg-gradient-to-r from-violet-100/80 to-violet-50/20', text: 'text-violet-700', icon: 'text-violet-600', buttonHover: 'hover:bg-violet-100 hover:text-violet-700' },
              { name: 'amber', border: 'border-amber-200/50', bg: 'bg-amber-50/30', header: 'bg-gradient-to-r from-amber-100/80 to-amber-50/20', text: 'text-amber-700', icon: 'text-amber-600', buttonHover: 'hover:bg-amber-100 hover:text-amber-700' },
              { name: 'rose', border: 'border-rose-200/50', bg: 'bg-rose-50/30', header: 'bg-gradient-to-r from-rose-100/80 to-rose-50/20', text: 'text-rose-700', icon: 'text-rose-600', buttonHover: 'hover:bg-rose-100 hover:text-rose-700' },
              { name: 'cyan', border: 'border-cyan-200/50', bg: 'bg-cyan-50/30', header: 'bg-gradient-to-r from-cyan-100/80 to-cyan-50/20', text: 'text-cyan-700', icon: 'text-cyan-600', buttonHover: 'hover:bg-cyan-100 hover:text-cyan-700' },
              { name: 'orange', border: 'border-orange-200/50', bg: 'bg-orange-50/30', header: 'bg-gradient-to-r from-orange-100/80 to-orange-50/20', text: 'text-orange-700', icon: 'text-orange-600', buttonHover: 'hover:bg-orange-100 hover:text-orange-700' },
              { name: 'indigo', border: 'border-indigo-200/50', bg: 'bg-indigo-50/30', header: 'bg-gradient-to-r from-indigo-100/80 to-indigo-50/20', text: 'text-indigo-700', icon: 'text-indigo-600', buttonHover: 'hover:bg-indigo-100 hover:text-indigo-700' },
            ];

            const palette = colorPalettes[index % colorPalettes.length];

            return (
              <Card key={category.id} className={cn("flex flex-col backdrop-blur-xl shadow-sm rounded-3xl overflow-hidden border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group/card", palette.bg, palette.border)}>
                <CardHeader className={cn("flex flex-row items-center justify-between pb-3 border-b border-border/10", palette.header)}>
                  <CardTitle
                    className={cn("text-lg font-bold tracking-tight px-1 cursor-pointer hover:underline decoration-dashed decoration-2 underline-offset-4 transition-all", palette.text)}
                    onClick={() => onViewCategoryTrends(category)}
                    title="Voir l'évolution des prix"
                  >
                    {category.name}
                  </CardTitle>
                  {category.name !== 'Autre' && <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover/card:opacity-100 transition-opacity">
                    <button
                      className={cn('h-6 w-6 flex items-center justify-center rounded-md transition-colors', palette.icon, palette.buttonHover, index === 0 ? 'opacity-20 pointer-events-none' : '')}
                      onClick={() => onMoveCategory(category.id, 'up')}
                      title="Monter"
                      disabled={index === 0}
                    >
                      <ChevronUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      className={cn('h-6 w-6 flex items-center justify-center rounded-md transition-colors', palette.icon, palette.buttonHover, index === filledCategories.length - 1 ? 'opacity-20 pointer-events-none' : '')}
                      onClick={() => onMoveCategory(category.id, 'down')}
                      title="Descendre"
                      disabled={index === filledCategories.length - 1}
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                    <Button variant="ghost" size="icon" className={cn("h-7 w-7 transition-colors", palette.icon, palette.buttonHover)} onClick={() => openCategoryDialog(category)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" onClick={() => handleDeleteCategory(category.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>}
                </CardHeader>
                <CardContent className="flex-grow p-3">
                  <ScrollArea className="h-64">
                    <ul className="space-y-2 pr-4">
                      {items.map(item => {
                        const isSelectedForChandyek = chandyekIngredientsList.includes(item.name);
                        // Masquer le bouton Ch3andek pour les articles non-alimentaires
                        const categoryLower = item.category.toLowerCase();
                        const isNonFoodItem = ['maison','médicaments','médicament','produits de soin','produit de soin','soin','bien-être','bien être','hygiène','entretien','nettoyage','hygiene','beauté','beaute'].some(kw => categoryLower.includes(kw));
                        return (
                          <li key={item.id} className="flex items-center justify-between p-2 rounded-2xl bg-background/50 border border-border/20 shadow-sm hover:shadow-md hover:bg-background/80 transition-all duration-300 group/item">
                            <div className="flex flex-col gap-0.5 min-w-0 flex-1 mr-1">
                              <div className="flex items-center gap-1.5">
                                <span className='font-semibold text-sm whitespace-normal break-words leading-tight'>{item.name}</span>
                                {(() => {
                                  const status = getProductStatus(purchaseHistory[item.id]);
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
                              {!isNonFoodItem && (
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
