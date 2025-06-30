
'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import type { BasketItem } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Minus, Plus, Trash2 } from 'lucide-react';

interface BasketSheetProps {
  basket: BasketItem[];
  basketTotal: number;
  budget: number | null;
  budgetInput: string;
  setBudgetInput: (value: string) => void;
  handleSetBudget: () => void;
  updateBasketQuantity: (id: string, newQuantity: number) => void;
  clearBasket: () => void;
  handleConfirmPurchase: () => void;
}

export default function BasketSheet({
  basket,
  basketTotal,
  budget,
  budgetInput,
  setBudgetInput,
  handleSetBudget,
  updateBasketQuantity,
  clearBasket,
  handleConfirmPurchase,
}: BasketSheetProps) {
  return (
    <SheetContent>
      <SheetHeader>
        <SheetTitle>Mon Panier</SheetTitle>
        <div className="pt-2 text-left space-y-2">
            <Label htmlFor="budget-input">Définir un budget (DT)</Label>
            <div className="flex gap-2">
                <Input id="budget-input" type="number" placeholder="Ex: 50" value={budgetInput} onChange={(e) => setBudgetInput(e.target.value)} onBlur={handleSetBudget} onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}/>
                <Button onClick={handleSetBudget}>OK</Button>
            </div>
        </div>
      </SheetHeader>
      <div className="py-4 text-left border-t mt-4">
            <p className="text-lg text-muted-foreground">Total du panier :</p>
            <p className={cn(
                "text-3xl font-bold",
                budget !== null && basketTotal > budget ? "text-destructive" : "text-primary"
            )}>
                {basketTotal.toFixed(2)} DT
            </p>
            {budget !== null && (
                 <p className={cn("text-sm font-semibold mt-1", basketTotal > budget ? "text-destructive" : "text-muted-foreground")}>
                    Budget : {budget.toFixed(2)} DT
                 </p>
            )}
            {budget !== null && basketTotal > budget && (
                <p className="text-destructive font-semibold mt-1">Budget dépassé de {(basketTotal - budget).toFixed(2)} DT !</p>
            )}
      </div>
      <ScrollArea className="h-[calc(100vh-350px)] pr-4">
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
