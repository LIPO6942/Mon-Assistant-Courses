
'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, ShoppingCart, CircleArrowRight, RotateCcw, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

interface BudgetManagerProps {
  initialBudget: number;
  setInitialBudget: (budget: number) => void;
  basketTotalToPay: number;
  totalSpent: number;
  remainingBudget: number;
  clearBasket: () => void;
  resetTotalSpent: () => void;
  basketItemCount: number;
}

export default function BudgetManager({
  initialBudget,
  setInitialBudget,
  basketTotalToPay,
  totalSpent,
  remainingBudget,
  clearBasket,
  resetTotalSpent,
  basketItemCount
}: BudgetManagerProps) {

  return (
    <Card className="mb-6 shadow-lg border-border/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-3 text-primary">
          <Wallet className="h-6 w-6" />
          <span>Gestion du Budget</span>
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={clearBasket}
          disabled={basketItemCount === 0}
          aria-label="Vider le panier"
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </CardHeader>
      <CardContent className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-center items-end">
        <div>
          <Label htmlFor="budget-input" className="text-sm font-medium text-muted-foreground">
            Mon Budget Initial
          </Label>
          <div className="relative mt-2">
            <Input
              id="budget-input"
              type="number"
              value={initialBudget}
              onChange={(e) => setInitialBudget(parseFloat(e.target.value) || 0)}
              className="text-2xl font-bold text-center pr-10 h-12"
            />
            <span className="absolute inset-y-0 right-3 flex items-center text-xl text-muted-foreground">DT</span>
          </div>
        </div>

        <div className="flex flex-col justify-around h-full space-y-2">
          <div className="flex justify-center items-center gap-2">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">À Payer</p>
              <p className="text-xl font-bold mt-1">{basketTotalToPay.toFixed(3)} DT</p>
            </div>
            <CircleArrowRight className="h-5 w-5 text-muted-foreground/60 shrink-0" />
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5">
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5 justify-center"><ShoppingCart className='h-4 w-4' /> Acheté</p>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={resetTotalSpent} disabled={totalSpent === 0} aria-label="Réinitialiser le total acheté">
                  <RotateCcw className="h-3 w-3 text-muted-foreground" />
                </Button>
              </div>
              <p className="text-xl font-bold mt-1 text-muted-foreground/90">{totalSpent.toFixed(3)} DT</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center rounded-lg p-3 bg-secondary/50">
          <p className="text-sm font-semibold text-secondary-foreground">Budget Restant</p>
          <p className={cn(
            "text-2xl font-bold mt-2",
            remainingBudget < 0 ? "text-destructive" : "text-primary"
          )}>
            {remainingBudget.toFixed(3)} DT
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
