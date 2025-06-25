
"use client";

import { useState, useEffect } from "react";
import { 
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DynamicIcon } from "./dynamic-icon";
import { Checkbox } from "@/components/ui/checkbox";
import { ShoppingCart as ShoppingCartIcon, X, Trash2, Pencil, AlertTriangle } from "lucide-react";
import type { GroceryItem } from "@/app/page";
import { cn } from "@/lib/utils";
import { Separator } from "./ui/separator";

type ShoppingCartProps = {
  items: GroceryItem[];
  purchasedItemIds: Set<number>;
  onTogglePurchased: (itemId: number) => void;
  onToggleItem: (item: GroceryItem) => void;
  onClearCart: () => void;
  budget: number;
  onBudgetChange: (newBudget: number) => void;
};

export function ShoppingCart({ 
  items, 
  purchasedItemIds,
  onTogglePurchased,
  onToggleItem, 
  onClearCart, 
  budget, 
  onBudgetChange 
}: ShoppingCartProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newBudget, setNewBudget] = useState(budget.toString());

  const sortedItems = [...items].sort((a, b) => {
    const aPurchased = purchasedItemIds.has(a.id);
    const bPurchased = purchasedItemIds.has(b.id);
    if (aPurchased === bPurchased) return 0;
    return aPurchased ? 1 : -1;
  });

  const totalCost = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const remainingCost = items
    .filter(item => !purchasedItemIds.has(item.id))
    .reduce((sum, item) => sum + item.price * item.quantity, 0);

  const budgetExceeded = totalCost > budget;

  useEffect(() => {
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
    <>
      <SheetHeader>
        <div className="flex items-center gap-3">
          <ShoppingCartIcon className="h-6 w-6 text-primary" />
          <SheetTitle>Mon Panier & Budget</SheetTitle>
        </div>
        <SheetDescription>
          Les articles à acheter et le suivi de votre budget.
        </SheetDescription>
      </SheetHeader>
      
      <div className="flex-1 overflow-y-auto py-4">
        {items.length === 0 ? (
          <div className="flex flex-col h-full items-center justify-center text-center text-muted-foreground p-4">
            <ShoppingCartIcon className="h-16 w-16 mb-4 text-muted-foreground/50"/>
            <p>Votre panier est vide.</p>
            <p className="text-xs mt-1">Cochez des articles dans le garde-manger pour les ajouter.</p>
          </div>
        ) : (
          <ScrollArea className="h-full pr-4">
            <div className="space-y-2">
              {sortedItems.map(item => (
                <div key={item.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                  <div className="flex items-center gap-3 flex-1">
                    <Checkbox
                      id={`cart-item-${item.id}`}
                      checked={purchasedItemIds.has(item.id)}
                      onCheckedChange={() => onTogglePurchased(item.id)}
                      aria-label={`Marquer ${item.name} comme acheté`}
                    />
                    <DynamicIcon name={item.icon} className="h-5 w-5 text-primary" />
                    <div className="flex-1">
                       <p className={cn(
                        "text-sm font-medium",
                        purchasedItemIds.has(item.id) && "line-through text-muted-foreground"
                      )}>
                        {item.name}
                      </p>
                      <p className={cn(
                        "text-xs text-muted-foreground",
                        purchasedItemIds.has(item.id) && "line-through"
                      )}>
                        {item.quantity} {item.unit} &times; {item.price.toFixed(2).replace('.',',')} TND
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className={cn(
                      "text-sm font-semibold w-20 text-right",
                       purchasedItemIds.has(item.id) && "line-through text-muted-foreground"
                    )}>
                      {(item.quantity * item.price).toFixed(2).replace('.',',')} TND
                    </p>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onToggleItem(item)} aria-label={`Retirer ${item.name} du panier`}>
                        <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
      
      <SheetFooter className="pt-4 border-t">
        <div className="flex flex-col gap-4 w-full">
            <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Coût restant :</span>
                  <span className="font-semibold">
                      {remainingCost.toFixed(2).replace('.',',')} TND
                  </span>
            </div>
            <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total du Panier:</span>
                  <span className={cn(
                      "text-lg font-bold",
                      budgetExceeded && totalCost > 0 ? "text-destructive" : "text-primary"
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
        
            {items.length > 0 && (
            <>
                <Separator />
                <Button variant="outline" size="sm" onClick={onClearCart} className="w-full">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Vider le panier
                </Button>
            </>
            )}
        </div>
      </SheetFooter>
    </>
  );
}
