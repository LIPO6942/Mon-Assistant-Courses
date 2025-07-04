
'use client';

import { ChefHat, ShoppingBasket, BookHeart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetTrigger } from '@/components/ui/sheet';
import BasketSheet from './BasketSheet';
import SavedRecipesSheet from './SavedRecipesSheet';
import type { BasketItem, Recipe } from '@/lib/types';

interface AppHeaderProps {
  basket: BasketItem[];
  basketTotal: number;
  updateBasketQuantity: (id: string, newQuantity: number) => void;
  clearBasket: () => void;
  handleConfirmPurchase: () => void;
  handleShareBasket: () => void;
  savedRecipes: Recipe[];
  onViewRecipe: (recipe: (Omit<Recipe, 'id'> & { id?: string })) => void;
  onDeleteRecipe: (recipeId: string) => void;
}

export default function AppHeader({
  basket,
  basketTotal,
  updateBasketQuantity,
  clearBasket,
  handleConfirmPurchase,
  handleShareBasket,
  savedRecipes,
  onViewRecipe,
  onDeleteRecipe,
}: AppHeaderProps) {
  return (
    <header className="bg-card shadow-md sticky top-0 z-20">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4 h-[69px]">
        <div className="flex items-center gap-3">
          <ChefHat className="h-8 w-8 text-primary" />
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">Mon assistant de courses</h1>
        </div>

        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="relative rounded-full">
                <BookHeart />
                {savedRecipes.length > 0 && <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full flex items-center justify-center bg-primary text-primary-foreground">{savedRecipes.length}</Badge>}
              </Button>
            </SheetTrigger>
            <SavedRecipesSheet 
              recipes={savedRecipes}
              onViewRecipe={onViewRecipe}
              onDeleteRecipe={onDeleteRecipe}
            />
          </Sheet>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="relative rounded-full">
                <ShoppingBasket />
                {basket.length > 0 && <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full flex items-center justify-center bg-accent text-accent-foreground">{basket.reduce((acc, item) => acc + item.quantity, 0)}</Badge>}
              </Button>
            </SheetTrigger>
            <BasketSheet 
              basket={basket}
              basketTotal={basketTotal}
              updateBasketQuantity={updateBasketQuantity}
              clearBasket={clearBasket}
              handleConfirmPurchase={handleConfirmPurchase}
              onShareBasket={handleShareBasket}
            />
          </Sheet>
        </div>
      </div>
    </header>
  );
}
