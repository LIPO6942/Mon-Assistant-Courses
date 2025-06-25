
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DynamicIcon } from "./dynamic-icon";
import { ShoppingCart as ShoppingCartIcon, X, Trash2, Pencil, AlertTriangle } from "lucide-react";
import type { GroceryItem } from "@/app/page";
import { cn } from "@/lib/utils";
import { Separator } from "./ui/separator";

type ShoppingCartProps = {
  items: GroceryItem[];
  onToggleItem: (item: GroceryItem) => void;
  onClearCart: () => void;
  totalCost: number;
  budget: number;
  onBudgetChange: (newBudget: number) => void;
};

export function ShoppingCart({ items, onToggleItem, onClearCart, totalCost, budget, onBudgetChange }: ShoppingCartProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newBudget, setNewBudget] = useState(budget.toString());

  const budgetExceeded = totalCost > budget;

  useEffect(() => {
    // Syncs the input value if the budget prop changes from outside,
    // but only when the user is not actively editing it.
    if (!isEditing) {
      setNewBudget(budget.toString());
    }
  }, [budget, isEditing]);

  const handleSave = () => {
    const budgetAsNumber = parseFloat(newBudget.replace(',', '.'));
    if (!isNaN(budgetAsNumber) && budgetAsNumber >= 0) {
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
        <div className="flex items-center gap-3">
          <ShoppingCartIcon className="h-6 w-6 text-primary" />
          <CardTitle>Mon Panier & Budget</CardTitle>
        </div>
        <CardDescription>
          Les articles à acheter et le suivi de votre budget.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-4 min-h-[10rem]">
            <p>Votre panier est vide.</p>
            <p className="text-xs mt-1">Cochez des articles dans le garde-manger pour les ajouter.</p>
          </div>
        ) : (
          <ScrollArea className="h-64">
            <div className="space-y-2 pr-4">
              {items.map(item => (
                <div key={item.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                  <div className="flex items-center gap-3 flex-1">
                    <DynamicIcon name={item.icon} className="h-5 w-5 text-primary" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.quantity} {item.unit} &times; {item.price.toFixed(2).replace('.',',')} TND
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold w-20 text-right">
                      {(item.quantity * item.price).toFixed(2).replace('.',',')} TND
                    </p>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onToggleItem(item)}>
                        <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
      
      <CardFooter className="flex-col items-stretch gap-4 !pt-4 border-t">
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total du Panier:</span>
                  <span className={cn(
                      "text-lg font-bold",
                      budgetExceeded ? "text-destructive" : "text-primary"
                  )}>
                      {totalCost.toFixed(2).replace('.',',')} TND
                  </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="budget-input">Votre Budget</Label>
                 {!isEditing && (
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsEditing(true)}>
                        <Pencil className="h-4 w-4" />
                    </Button>
                )}
              </div>
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
                      className="h-9"
                    />
                    <Button onClick={handleSave} size="sm">OK</Button>
                </div>
              ) : (
                <p className="text-lg font-semibold text-muted-foreground text-right">
                    {budget.toFixed(2).replace('.', ',')} TND
                </p>
              )}
            </div>

            {budgetExceeded && totalCost > 0 && (
                <div className="flex items-center gap-2 text-destructive p-2 bg-destructive/10 rounded-lg text-sm">
                    <AlertTriangle className="h-5 w-5 flex-shrink-0"/>
                    <p>Attention, budget dépassé !</p>
                </div>
            )}
        </div>

        {items.length > 0 && (
          <>
            <Separator />
            <Button variant="outline" size="sm" onClick={onClearCart} className="w-full mt-4">
                <Trash2 className="mr-2 h-4 w-4" />
                Vider le panier
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
