"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GroceryItem, GroceryLists } from "@/app/page";
import { DynamicIcon } from "./dynamic-icon";

type GroceryListProps = {
  lists: GroceryLists;
  onToggleItem: (category: string, itemId: number) => void;
  onDeleteItem: (category: string, itemId: number) => void;
  onToggleEssential: (category: string, itemId: number) => void;
  onUpdateItem: (category: string, itemId: number, updates: Partial<Pick<GroceryItem, 'price' | 'quantity'>>) => void;
};

export function GroceryList({ lists, onToggleItem, onDeleteItem, onToggleEssential, onUpdateItem }: GroceryListProps) {
  const categories = Object.keys(lists);

  if (categories.length === 0) {
    return (
      <Card className="flex items-center justify-center min-h-[400px]">
        <div className="text-center text-muted-foreground">
          <p className="text-lg">Votre liste de courses est vide.</p>
          <p>Ajoutez des articles pour commencer !</p>
        </div>
      </Card>
    );
  }

  const formatPrice = (price: number) => {
    if (isNaN(price)) return "";
    return `${price.toFixed(2).replace('.', ',')} TND`;
  }
  
  const handleNumericUpdate = (category: string, itemId: number, field: 'price' | 'quantity', value: string) => {
    const numericValue = parseFloat(value.replace(",", "."));
    if (!isNaN(numericValue) && numericValue >= 0) {
      onUpdateItem(category, itemId, { [field]: numericValue });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ma Liste de Courses</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" defaultValue={categories} className="w-full">
          {categories.map((category) => (
            <AccordionItem value={category} key={category}>
              <AccordionTrigger className="text-lg font-semibold">
                {category}
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col gap-4 pt-2">
                  {/* Header Row */}
                  <div className="hidden md:grid grid-cols-12 items-center gap-3 text-sm font-medium text-muted-foreground px-4">
                    <div className="col-span-4">Article</div>
                    <div className="col-span-2">Quantité</div>
                    <div className="col-span-2">Prix Unitaire</div>
                    <div className="col-span-2 text-right">Total</div>
                    <div className="col-span-2 text-right">Actions</div>
                  </div>
                  {lists[category].map((item) => (
                    <div key={item.id} className={cn("grid grid-cols-12 items-center gap-2 md:gap-3 group p-2 rounded-lg", item.checked && "bg-muted/50")}>
                      {/* Item name, checkbox and icon */}
                      <div className="col-span-12 md:col-span-4 flex items-center gap-3">
                        <Checkbox
                          id={`${category}-${item.id}`}
                          checked={item.checked}
                          onCheckedChange={() => onToggleItem(category, item.id)}
                          className="size-5"
                        />
                        <DynamicIcon name={item.icon} className="h-6 w-6 text-primary flex-shrink-0" />
                        <Label
                          htmlFor={`${category}-${item.id}`}
                          className={cn("flex-1 text-base transition-colors cursor-pointer", item.checked && "text-muted-foreground line-through")}
                        >
                          {item.name}
                        </Label>
                      </div>

                      {/* Quantity Input */}
                      <div className="col-span-6 md:col-span-2">
                        <div className="flex items-center gap-1">
                          <Input 
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleNumericUpdate(category, item.id, 'quantity', e.target.value)}
                            className="h-8 w-20 text-center"
                            aria-label={`Quantité pour ${item.name}`}
                            disabled={item.checked}
                          />
                          <span className="text-xs text-muted-foreground">{item.unit}</span>
                        </div>
                      </div>

                      {/* Price Input */}
                       <div className="col-span-6 md:col-span-2">
                         <Input 
                            type="number"
                            value={item.price}
                            onChange={(e) => handleNumericUpdate(category, item.id, 'price', e.target.value)}
                            className="h-8 w-24 text-right"
                            aria-label={`Prix pour ${item.name}`}
                            disabled={item.checked}
                          />
                      </div>
                      
                      {/* Total Price */}
                      <div className={cn("col-span-6 md:col-span-2 font-mono text-sm text-right font-semibold", item.checked && "text-muted-foreground line-through")}>
                        {formatPrice(item.price * item.quantity)}
                      </div>
                      
                      {/* Actions */}
                      <div className="col-span-6 md:col-span-2 flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-muted-foreground hover:text-yellow-500"
                          onClick={() => onToggleEssential(category, item.id)}
                          aria-label="Marquer comme essentiel"
                        >
                          <Star className={cn("size-4", item.isEssential && "fill-yellow-400 text-yellow-500")} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-muted-foreground hover:text-destructive"
                          onClick={() => onDeleteItem(category, item.id)}
                          aria-label="Supprimer l'article"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
