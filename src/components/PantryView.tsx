
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
            <Card key={category.id} className="flex flex-col bg-card shadow-lg rounded-xl overflow-hidden border border-border/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-br from-card to-secondary/50">
                <CardTitle className="text-primary">{category.name}</CardTitle>
                {category.name !== 'Autre' && <div className="flex items-center">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openCategoryDialog(category)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteCategory(category.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>}
              </CardHeader>
              <CardContent className="flex-grow">
                <ScrollArea className="h-64">
                  <ul className="space-y-2 pr-3">
                    {items.map(item => {
                      const isSelectedForChandyek = chandyekIngredientsList.includes(item.name);
                      return (
                        <li key={item.id} className="flex items-center justify-between p-2 rounded-md hover:bg-secondary/50 transition-colors">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className='font-medium'>{item.name}</span>
                              {(() => {
                                const status = getProductStatus(purchaseHistory[item.id]);
                                if (!status) return null;
                                return (
                                  <span
                                    className={cn(
                                      "h-1.5 w-1.5 rounded-full shrink-0",
                                      status === 'green' && "bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.6)]",
                                      status === 'orange' && "bg-orange-500 shadow-[0_0_6px_rgba(249,115,22,0.6)]",
                                      status === 'red' && "bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.6)]"
                                    )}
                                  />
                                );
                              })()}
                            </div>
                            <p className='text-sm text-muted-foreground'>{item.price.toFixed(3)} DT / {item.unit}</p>
                          </div>
                          <div className='flex items-center gap-1'>
                            <Button variant="ghost" size="icon" className='h-8 w-8 rounded-full' title="Ajouter au panier" onClick={() => openQuantityDialog(item)}><Plus className="h-4 w-4" /></Button>
                            <Button
                              variant={isSelectedForChandyek ? "secondary" : "ghost"}
                              size="icon"
                              className='h-8 w-8 rounded-full'
                              title="Ajouter/Retirer de 'Ch3andek'"
                              onClick={() => onToggleChandyekIngredient(item.name)}
                            >
                              <BrainCircuit className={cn("h-4 w-4", isSelectedForChandyek ? 'text-primary' : 'text-accent')} />
                            </Button>
                            <Button variant="ghost" size="icon" className='h-8 w-8 rounded-full' title="Modifier" onClick={() => openEditDialog(item)}><Pencil className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className='h-8 w-8 rounded-full' title="Supprimer" onClick={() => handleDeleteIngredient(item.id)}><Trash2 className="h-4 w-4 text-destructive/80" /></Button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </ScrollArea>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => openAddDialog(category.name)}><PlusCircle className="mr-2 h-4 w-4" /> Ajouter un produit</Button>
              </CardFooter>
            </Card>
          )
        })}
        <Card className="flex flex-col items-center justify-center border-2 border-dashed bg-card/50 hover:border-primary hover:text-primary transition-all duration-300 min-h-[300px] rounded-xl group hover:bg-primary/5" onClick={() => openCategoryDialog()}>
          <PlusCircle className="h-10 w-10 mb-2 text-muted-foreground group-hover:text-primary transition-colors" />
          <span className="font-semibold text-muted-foreground group-hover:text-primary transition-colors">Ajouter une catégorie</span>
        </Card>
      </div>
    </div>
  );
}
