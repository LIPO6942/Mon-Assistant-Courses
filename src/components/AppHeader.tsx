
'use client';

import { ChefHat, ShoppingBasket, BookHeart, Refrigerator, LogIn, Mail, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetTrigger } from '@/components/ui/sheet';
import BasketSheet from './BasketSheet';
import SavedRecipesSheet from './SavedRecipesSheet';
import type { BasketItem, Recipe, PurchaseHistory } from '@/lib/types';
import FridgeScannerSheet from './FridgeScannerSheet';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getPendingInvitations } from '@/lib/sharing-service';

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
  onShareRecipe: (recipe: Recipe) => void;
  onTogglePurchaseStatus: (id: string, itemPrice: number, itemQuantity: number) => void;
  onFridgeScan: (ingredients: string[]) => void;
  purchaseHistory: PurchaseHistory;
  onOpenInbox: () => void;
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
  onShareRecipe,
  onTogglePurchaseStatus,
  onFridgeScan,
  purchaseHistory,
  onOpenInbox,
}: AppHeaderProps) {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const { user, signInWithGoogle, signInAnonymouslyUser } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (user?.email) {
      getPendingInvitations(user.email).then(invites => setPendingCount(invites.length));
    } else {
      setPendingCount(0);
    }
  }, [user]);

  return (
    <header className="bg-card shadow-md sticky top-0 z-20">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4 h-[69px]">
        <div className="flex items-center gap-3">
          <ChefHat className="h-8 w-8 text-primary" />
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">M A C</h1>
        </div>

        <div className="flex items-center gap-2">
          <Sheet open={isScannerOpen} onOpenChange={setIsScannerOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="relative rounded-full">
                <Refrigerator />
              </Button>
            </SheetTrigger>
            <FridgeScannerSheet onIngredientsIdentified={onFridgeScan} open={isScannerOpen} onOpenChange={setIsScannerOpen} />
          </Sheet>

          {user ? (
            <Button variant="outline" size="icon" className="relative rounded-full" onClick={onOpenInbox} title="Boîte de réception">
              <Mail />
              {pendingCount > 0 && <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full flex items-center justify-center bg-red-500 text-white">{pendingCount}</Badge>}
            </Button>
          ) : (
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => signInWithGoogle()} title="Se connecter">
              <LogIn />
            </Button>
          )}

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
