
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DynamicIcon } from "./dynamic-icon";
import { ShoppingCart as ShoppingCartIcon, X, Trash2 } from "lucide-react";
import type { GroceryItem } from "@/app/page";

type ShoppingCartProps = {
  items: GroceryItem[];
  onToggleItem: (item: GroceryItem) => void;
  onClearCart: () => void;
  totalCost: number;
};

export function ShoppingCart({ items, onToggleItem, onClearCart, totalCost }: ShoppingCartProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <ShoppingCartIcon className="h-6 w-6 text-primary" />
          <CardTitle>Mon Panier</CardTitle>
        </div>
        <CardDescription>
          Les articles que vous prévoyez d'acheter.
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
      {items.length > 0 && (
        <CardFooter className="flex-col items-stretch gap-2 !pt-4 border-t">
           <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total du Panier:</span>
                <span className="text-lg font-bold text-primary">{totalCost.toFixed(2).replace('.',',')} TND</span>
            </div>
            <Button variant="outline" size="sm" onClick={onClearCart}>
                <Trash2 className="mr-2 h-4 w-4" />
                Vider le panier
            </Button>
        </CardFooter>
      )}
    </Card>
  );
}

