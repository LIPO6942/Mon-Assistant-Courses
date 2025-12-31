'use client';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import type { BasketItem, PurchaseHistory } from '@/lib/types';
import { Minus, Plus, Trash2, Share2, History } from 'lucide-react';
import { Checkbox } from './ui/checkbox';
import { cn } from '@/lib/utils';

interface BasketSheetProps {
  basket: BasketItem[];
  basketTotal: number;
  updateBasketQuantity: (id: string, newQuantity: number) => void;
  clearBasket: () => void;
  handleConfirmPurchase: () => void;
  onShareBasket: () => void;
  onTogglePurchaseStatus: (id: string, itemPrice: number, itemQuantity: number) => void;
  purchaseHistory: PurchaseHistory;
}

export default function BasketSheet({
  basket,
  basketTotal,
  updateBasketQuantity,
  clearBasket,
  handleConfirmPurchase,
  onShareBasket,
  onTogglePurchaseStatus,
  purchaseHistory,
}: BasketSheetProps) {

  const sortedBasket = basket.slice().sort((a, b) => {
    const aPurchased = a.purchased ?? false;
    const bPurchased = b.purchased ?? false;
    if (aPurchased === bPurchased) return 0;
    return aPurchased ? 1 : -1;
  });

  const purchasedItemCount = basket.filter(item => item.purchased).length;

  return (
    <SheetContent className="flex flex-col">
      <SheetHeader>
        <div className="flex justify-between items-center">
          <SheetTitle>Mon Panier</SheetTitle>
          <Button variant="ghost" size="icon" onClick={onShareBasket} disabled={basket.length === 0} aria-label="Partager le panier">
            <Share2 className="h-5 w-5 text-primary" />
          </Button>
        </div>
      </SheetHeader>

      <ScrollArea className="flex-grow my-4 pr-4">
        {sortedBasket.length > 0 ? (
          <ul className="space-y-3">
            {sortedBasket.map(item => (
              <li key={item.id} className={cn("flex flex-col gap-2 bg-secondary/50 p-3 rounded-md transition-opacity", item.purchased && 'opacity-70')}>
                <div className='flex justify-between items-center'>
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id={`item-${item.id}`}
                      checked={!!item.purchased}
                      onCheckedChange={() => onTogglePurchaseStatus(item.id, item.price, item.quantity)}
                      aria-label={`Marquer ${item.name} comme acheté`}
                    />
                    <label
                      htmlFor={`item-${item.id}`}
                      className={cn(
                        'font-semibold cursor-pointer',
                        item.purchased && 'line-through text-muted-foreground'
                      )}
                    >
                      {item.name}
                    </label>
                  </div>
                  {purchaseHistory[item.id] && (
                    <div className="flex items-center gap-1.5 ml-8 -mt-1">
                      <History className="h-3 w-3 text-primary/70" />
                      <span className="text-[10px] text-muted-foreground font-medium italic">
                        Acheté le {new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' }).format(new Date(purchaseHistory[item.id].date))} ({purchaseHistory[item.id].quantity} {purchaseHistory[item.id].unit})
                      </span>
                    </div>
                  )}
                  <span className={cn('font-bold text-primary', item.purchased && 'line-through text-muted-foreground')}>
                    {(item.price * item.quantity).toFixed(2)} DT
                  </span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className={cn('text-sm text-muted-foreground', item.purchased && 'line-through')}>
                    {item.price.toFixed(2)} DT / {item.unit}
                  </span>
                  <div className='flex items-center gap-2'>
                    <Button variant="ghost" size="icon" className='h-7 w-7 rounded-full' onClick={() => updateBasketQuantity(item.id, item.quantity - 1)} disabled={!!item.purchased}><Minus className='h-4 w-4' /></Button>
                    <span className='font-bold w-4 text-center'>{item.quantity}</span>
                    <Button variant="ghost" size="icon" className='h-7 w-7 rounded-full' onClick={() => updateBasketQuantity(item.id, item.quantity + 1)} disabled={!!item.purchased}><Plus className='h-4 w-4' /></Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : <p className="text-sm text-muted-foreground text-center mt-8">Votre panier est vide.</p>}
      </ScrollArea>

      {basket.length > 0 && (
        <SheetFooter className='pt-4 border-t flex-col gap-2 w-full'>
          <div className="flex justify-between items-center w-full">
            <span className="text-lg font-semibold text-muted-foreground">Total à Payer</span>
            <span className="text-2xl font-bold text-primary">{basketTotal.toFixed(2)} DT</span>
          </div>
          <Button onClick={handleConfirmPurchase} className="w-full" disabled={purchasedItemCount === 0}>
            Valider les {purchasedItemCount} articles achetés
          </Button>
          <Button variant="outline" onClick={clearBasket} className="w-full" disabled={basket.length === 0}><Trash2 className="h-4 w-4 mr-2" /> Vider</Button>
        </SheetFooter>
      )}
    </SheetContent>
  );
}
