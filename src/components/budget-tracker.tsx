
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Wallet, AlertTriangle, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

type BudgetTrackerProps = {
  totalCost: number;
  budget: number;
  onBudgetChange: (newBudget: number) => void;
  isLoading: boolean;
};

export function BudgetTracker({ totalCost, budget, onBudgetChange, isLoading }: BudgetTrackerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newBudget, setNewBudget] = useState(budget.toString());

  const budgetExceeded = totalCost > budget;

  const handleSave = () => {
    const budgetAsNumber = parseFloat(newBudget.replace(',', '.'));
    if (!isNaN(budgetAsNumber) && budgetAsNumber > 0) {
      onBudgetChange(budgetAsNumber);
      setIsEditing(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <Wallet className="h-6 w-6 text-primary" />
                <CardTitle>Suivi du Budget</CardTitle>
            </div>
            {!isEditing && (
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsEditing(true)}>
                    <Pencil className="h-4 w-4" />
                </Button>
            )}
        </div>
        <CardDescription>
            Suivez le coût de vos achats et gérez votre budget.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
            <div className="space-y-4">
                <Skeleton className="h-9 w-1/2 mx-auto" />
                <Skeleton className="h-8 w-full" />
            </div>
        ) : (
          <>
            <div className="text-center">
                <p className="text-sm text-muted-foreground">Coût de la sélection</p>
                <p className={cn(
                    "text-3xl font-bold transition-colors",
                    budgetExceeded ? "text-destructive" : "text-foreground"
                )}>
                    {totalCost.toFixed(2).replace('.', ',')} TND
                </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="budget-input">Votre Budget (TND)</Label>
              {isEditing ? (
                <div className="flex items-center gap-2">
                    <Input
                      id="budget-input"
                      type="text"
                      pattern="[0-9]*[.,]?[0-9]+"
                      value={newBudget}
                      onChange={(e) => setNewBudget(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onBlur={handleSave}
                      autoFocus
                    />
                    <Button onClick={handleSave}>OK</Button>
                </div>
              ) : (
                <p className="text-lg font-semibold text-muted-foreground">
                    {budget.toFixed(2).replace('.', ',')} TND
                </p>
              )}
            </div>

            {budgetExceeded && (
                <div className="flex items-center gap-2 text-destructive p-2 bg-destructive/10 rounded-lg text-sm">
                    <AlertTriangle className="h-5 w-5 flex-shrink-0"/>
                    <p>Attention, vous avez dépassé votre budget !</p>
                </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
