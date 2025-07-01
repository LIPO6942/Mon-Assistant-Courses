
'use client';

import { ChefHat, ShoppingBasket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetTrigger } from '@/components/ui/sheet';
import BasketSheet from './BasketSheet';
import type { BasketItem } from '@/lib/types';

interface AppHeaderProps {
  basket: BasketItem[];
  basketTotal: number;
  updateBasketQuantity: (id: string, newQuantity: number) => void;
  clearBasket: () => void;
  handleConfirmPurchase: () => void;
  budget: number;
}

export default function AppHeader({
  basket,
  basketTotal,
  updateBasketQuantity,
  clearBasket,
  handleConfirmPurchase,
  budget,
}: AppHeaderProps) {
  return (
    <header className="bg-card border-b sticky top-0 z-20">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ChefHat className="h-8 w-8 text-primary" />
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">Mon assistant de courses</h1>
        </div>
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
            budget={budget}
          />
        </Sheet>
      </div>
    </header>
  );
}
