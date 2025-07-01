
'use client';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import type { BasketItem } from '@/lib/types';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface BasketSheetProps {
  basket: BasketItem[];
  basketTotal: number;
  updateBasketQuantity: (id: string, newQuantity: number) => void;
  clearBasket: () => void;
  handleConfirmPurchase: () => void;
  budget: number;
  setBudget: (budget: number) => void;
}

export default function BasketSheet({
  basket,
  basketTotal,
  updateBasketQuantity,
  clearBasket,
  handleConfirmPurchase,
  budget,
  setBudget,
}: BasketSheetProps) {
  const remainingBudget = budget - basketTotal;

  return (
    <SheetContent>
      <SheetHeader>
        <SheetTitle>Mon Panier & Budget</SheetTitle>
      </SheetHeader>
      
      <div className="py-4 border-b">
          <div className="grid grid-cols-2 gap-4 text-center items-start">
                <div>
                  <Label htmlFor="budget-input" className="text-sm text-muted-foreground">Budget Actuel</Label>
                  <div className="relative mt-1">
                    <Input
                      id="budget-input"
                      type="number"
                      value={budget}
                      onChange={(e) => setBudget(parseFloat(e.target.value) || 0)}
                      className="text-2xl font-bold text-center pr-10"
                      />
                    <span className="absolute inset-y-0 right-3 flex items-center text-xl text-muted-foreground">DT</span>
                  </div>
              </div>
              <div>
                  <p className="text-sm text-muted-foreground">Total Panier</p>
                  <p className="text-2xl font-bold mt-1">{basketTotal.toFixed(2)} DT</p>
              </div>
          </div>
          <div className="mt-4 rounded-lg p-3 text-center bg-accent/20">
              <p className="text-sm font-semibold text-accent-foreground">Budget Restant Après Achat</p>
                <p className={cn(
                  "text-2xl font-bold",
                  remainingBudget < 0 ? "text-destructive" : "text-primary"
              )}>
                  {remainingBudget.toFixed(2)} DT
              </p>
          </div>
      </div>
      
      <ScrollArea className="h-[calc(100vh-340px)] pr-4">
        {basket.length > 0 ? (
          <ul className="space-y-3 py-4">
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
      <SheetFooter className='pt-4 border-t flex-col sm:flex-row gap-2 w-full'>
          <Button variant="outline" onClick={clearBasket} className="w-full" disabled={basket.length === 0}><Trash2 className="h-4 w-4 mr-2" /> Vider le panier</Button>
          <Button onClick={handleConfirmPurchase} className="w-full" disabled={basket.length === 0}>Valider les achats</Button>
      </SheetFooter>
    </SheetContent>
  );
}
