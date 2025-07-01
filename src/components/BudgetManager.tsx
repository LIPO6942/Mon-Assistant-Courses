'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BudgetManagerProps {
  budget: number;
  setBudget: (budget: number) => void;
  basketTotal: number;
}

export default function BudgetManager({ budget, setBudget, basketTotal }: BudgetManagerProps) {
  const remainingBudget = budget - basketTotal;

  return (
    <Card className="mb-6 shadow-lg border-border/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-primary">
          <Wallet className="h-6 w-6" />
          <span>Gestion du Budget</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center items-end">
        <div>
          <Label htmlFor="budget-input" className="text-sm font-medium text-muted-foreground">
            Mon Budget Actuel
          </Label>
          <div className="relative mt-2">
            <Input
              id="budget-input"
              type="number"
              value={budget}
              onChange={(e) => setBudget(parseFloat(e.target.value) || 0)}
              className="text-2xl font-bold text-center pr-10 h-12"
            />
            <span className="absolute inset-y-0 right-3 flex items-center text-xl text-muted-foreground">DT</span>
          </div>
        </div>
        <div className="flex flex-col items-center">
            <p className="text-sm font-medium text-muted-foreground">Total du Panier</p>
            <p className="text-2xl font-bold mt-2">{basketTotal.toFixed(2)} DT</p>
        </div>
        <div className="flex flex-col items-center rounded-lg p-3 bg-secondary/50">
            <p className="text-sm font-semibold text-secondary-foreground">Solde Restant</p>
              <p className={cn(
                "text-2xl font-bold mt-2",
                remainingBudget < 0 ? "text-destructive" : "text-primary"
            )}>
                {remainingBudget.toFixed(2)} DT
            </p>
        </div>
      </CardContent>
    </Card>
  );
}
