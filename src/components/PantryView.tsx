
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, PlusCircle, Pencil, Trash2, Search, BrainCircuit, History } from 'lucide-react';
import type { Ingredient, CategoryDef, PurchaseHistory } from '@/lib/types';
import BudgetManager from './BudgetManager';
import { cn, getProductStatus } from '@/lib/utils';
import { Sheet, SheetTrigger } from '@/components/ui/sheet';
import QuickReorderSheet from './QuickReorderSheet';
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
  onAddIngredients
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
        {Object.entries(groupedIngredients).filter(([, items]) => items.length > 0).map(([categoryName, items]) => {
          const category = categories.find(c => c.name === categoryName) || { id: 'c-autre', name: 'Autre' };
          return (
            <Card key={category.id} className="flex flex-col bg-card/60 backdrop-blur-xl shadow-sm rounded-3xl overflow-hidden border border-border/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 group/card">
              <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/30 bg-muted/20">
                <CardTitle className="text-lg font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent px-1">{category.name}</CardTitle>
                {category.name !== 'Autre' && <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover/card:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors" onClick={() => openCategoryDialog(category)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" onClick={() => handleDeleteCategory(category.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>}
              </CardHeader>
              <CardContent className="flex-grow p-4">
                <ScrollArea className="h-64 pr-2">
                  <ul className="space-y-2">
                    {items.map(item => {
                      const isSelectedForChandyek = chandyekIngredientsList.includes(item.name);
                      return (
                        <li key={item.id} className="flex items-center justify-between p-3 rounded-2xl bg-card border border-border/40 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300 group/item">
                          <div className="flex flex-col gap-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className='font-semibold text-sm truncate'>{item.name}</span>
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
                            <p className='text-[11px] text-muted-foreground font-medium'>{item.price.toFixed(3)} DT / {item.unit}</p>
                          </div>

                          <div className='flex items-center gap-1 shrink-0'>
                            <Button
                              variant="ghost"
                              size="icon"
                              className='h-8 w-8 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors'
                              title="Ajouter au panier"
                              onClick={() => openQuantityDialog(item)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                            <Button
                              variant={isSelectedForChandyek ? "secondary" : "ghost"}
                              size="icon"
                              className={cn(
                                'h-8 w-8 rounded-full transition-colors',
                                isSelectedForChandyek
                                  ? 'bg-primary/15 text-primary hover:bg-primary/25'
                                  : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
                              )}
                              title="Ajouter/Retirer de 'Ch3andek'"
                              onClick={() => onToggleChandyekIngredient(item.name)}
                            >
                              <BrainCircuit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className='h-8 w-8 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors'
                              title="Modifier"
                              onClick={() => openEditDialog(item)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className='h-8 w-8 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors'
                              title="Supprimer"
                              onClick={() => handleDeleteIngredient(item.id)}
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
              <CardFooter className="p-4 pt-1 border-t border-border/30 bg-muted/10">
                <Button variant="ghost" className="w-full mt-2 bg-transparent hover:bg-primary/10 text-primary/80 hover:text-primary border border-dashed border-primary/20 hover:border-primary/40 rounded-xl font-medium transition-all" onClick={() => openAddDialog(category.name)}><PlusCircle className="mr-2 h-4 w-4" /> Ajouter un produit</Button>
              </CardFooter>
            </Card>
          )
        })}
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
