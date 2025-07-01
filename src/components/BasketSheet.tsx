
'use client';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import type { BasketItem } from '@/lib/types';
import { Minus, Plus, Trash2 } from 'lucide-react';

interface BasketSheetProps {
  basket: BasketItem[];
  basketTotal: number;
  updateBasketQuantity: (id: string, newQuantity: number) => void;
  clearBasket: () => void;
  handleConfirmPurchase: () => void;
}

export default function BasketSheet({
  basket,
  basketTotal,
  updateBasketQuantity,
  clearBasket,
  handleConfirmPurchase,
}: BasketSheetProps) {
  return (
    <SheetContent className="flex flex-col">
      <SheetHeader>
        <SheetTitle>Mon Panier</SheetTitle>
      </SheetHeader>
      
      <ScrollArea className="flex-grow my-4 pr-4">
        {basket.length > 0 ? (
          <ul className="space-y-3">
            {basket.map(item => (
              <li key={item.id} className="flex flex-col gap-2 bg-secondary/50 p-3 rounded-md">
                <div className='flex justify-between items-center'><span className='font-semibold'>{item.name}</span><span className='font-bold text-primary'>{(item.price * item.quantity).toFixed(2)} DT</span></div>
                <div className='flex justify-between items-center'><span className='text-sm text-muted-foreground'>{item.price.toFixed(2)} DT / {item.unit}</span>
                  <div className='flex items-center gap-2'>
                     <Button variant="ghost" size="icon" className='h-7 w-7 rounded-full' onClick={() => updateBasketQuantity(item.id, item.quantity - 1)}><Minus className='h-4 w-4'/></Button>
                     <span className='font-bold w-4 text-center'>{item.quantity}</span>
                     <Button variant="ghost" size="icon" className='h-7 w-7 rounded-full' onClick={() => updateBasketQuantity(item.id, item.quantity + 1)}><Plus className='h-4 w-4'/></Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : <p className="text-sm text-muted-foreground text-center mt-8">Votre panier est vide.</p>}
      </ScrollArea>

      {basket.length > 0 && (
        <SheetFooter className='pt-4 border-t flex-col gap-4 w-full'>
            <div className="flex justify-between items-center w-full">
                <span className="text-lg font-semibold text-muted-foreground">Total à Payer</span>
                <span className="text-2xl font-bold text-primary">{basketTotal.toFixed(2)} DT</span>
            </div>
            <div className="grid grid-cols-2 gap-2 w-full">
                <Button variant="outline" onClick={clearBasket} className="w-full" disabled={basket.length === 0}><Trash2 className="h-4 w-4 mr-2" /> Vider</Button>
                <Button onClick={handleConfirmPurchase} className="w-full" disabled={basket.length === 0}>Valider</Button>
            </div>
        </SheetFooter>
      )}
    </SheetContent>
  );
}
