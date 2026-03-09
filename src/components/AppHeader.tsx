
'use client';

import { ChefHat, ShoppingBasket, BookHeart, Refrigerator, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetTrigger } from '@/components/ui/sheet';
import BasketSheet from './BasketSheet';
import SavedRecipesSheet from './SavedRecipesSheet';
import type { BasketItem, Recipe, PurchaseHistory } from '@/lib/types';
import FridgeScannerSheet from './FridgeScannerSheet';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

interface AppHeaderProps {
  basket: BasketItem[];
  basketTotal: number;
  updateBasketQuantity: (id: string, newQuantity: number) => void;
  updateBasketItemPrice: (id: string, newPrice: number) => void;
  clearBasket: () => void;
  handleConfirmPurchase: (store?: string) => void;
  handleShareBasket: () => void;
  savedRecipes: Recipe[];
  onViewRecipe: (recipe: (Omit<Recipe, 'id'> & { id?: string })) => void;
  onDeleteRecipe: (recipeId: string) => void;
  onShareRecipe: (recipe: Recipe) => void;
  onTogglePurchaseStatus: (id: string, itemPrice: number, itemQuantity: number) => void;
  onFridgeScan: (ingredients: string[]) => void;
  purchaseHistory: PurchaseHistory;
}

export default function AppHeader({
  basket,
  basketTotal,
  updateBasketQuantity,
  updateBasketItemPrice,
  clearBasket,
  handleConfirmPurchase,
  handleShareBasket,
  savedRecipes,
  onViewRecipe,
  onDeleteRecipe,
  onShareRecipe,
  onTogglePurchaseStatus,
  onFridgeScan,
  purchaseHistory,
}: AppHeaderProps) {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const { user, signOut } = useAuth();

  return (
    <header className="bg-card shadow-md sticky top-0 z-20">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4 h-[69px]">
        <div className="flex items-center gap-3">
          <ChefHat className="h-8 w-8 text-primary" />
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">M A C</h1>
        </div>

        <div className="flex items-center gap-2">
          {/* User avatar & Sign out button - left of fridge */}
          {user && (
            <Button
              variant="outline"
              size="icon"
              className="relative rounded-full"
              onClick={signOut}
              title={`Déconnecter ${user.displayName || user.email || ''}`}
            >
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="Avatar"
                  className="w-full h-full rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <LogOut className="h-4 w-4" />
              )}
            </Button>
          )}
          <Sheet open={isScannerOpen} onOpenChange={setIsScannerOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="relative rounded-full">
                <Refrigerator />
              </Button>
            </SheetTrigger>
            <FridgeScannerSheet onIngredientsIdentified={onFridgeScan} open={isScannerOpen} onOpenChange={setIsScannerOpen} />
          </Sheet>

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
              onShareRecipe={onShareRecipe}
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
              updateBasketItemPrice={updateBasketItemPrice}
              clearBasket={clearBasket}
              handleConfirmPurchase={handleConfirmPurchase}
              onShareBasket={handleShareBasket}
              onTogglePurchaseStatus={onTogglePurchaseStatus}
              purchaseHistory={purchaseHistory}
            />
          </Sheet>
        </div>
      </div>
    </header>
  );
}

