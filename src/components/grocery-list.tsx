
"use client";

import { useMemo } from 'react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Trash2, Star, Plus, ListX, MoreHorizontal, MoveRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GroceryItem, GroceryLists } from "@/app/page";
import { DynamicIcon } from "./dynamic-icon";
import { Separator } from './ui/separator';

type GroceryListProps = {
  lists: GroceryLists;
  categories: string[];
  onToggleItem: (category: string, itemId: number) => void;
  onDeleteItem: (category: string, itemId: number) => void;
  onToggleEssential: (category: string, itemId: number) => void;
  onUpdateItem: (category: string, itemId: number, updates: Partial<Pick<GroceryItem, 'price' | 'quantity'>>) => void;
  onMoveItem: (itemId: number, oldCategory: string, newCategory: string) => void;
  onAddItemClick: () => void;
  onDeselectAll: () => void;
};

const ItemRow = ({ 
  item, 
  category, 
  categories, 
  onToggleItem, 
  onDeleteItem, 
  onToggleEssential, 
  onUpdateItem, 
  onMoveItem 
}: { 
  item: GroceryItem, 
  category: string, 
  categories: string[], 
  onToggleItem: (category: string, itemId: number) => void,
  onDeleteItem: (category: string, itemId: number) => void,
  onToggleEssential: (category: string, itemId: number) => void,
  onUpdateItem: (category: string, itemId: number, updates: Partial<Pick<GroceryItem, 'price' | 'quantity'>>) => void,
  onMoveItem: (itemId: number, oldCategory: string, newCategory: string) => void,
}) => {
  
  const formatPrice = (price: number) => {
    if (isNaN(price)) return "";
    return `${price.toFixed(2).replace('.', ',')} TND`;
  }
  
  const handleNumericUpdate = (field: 'price' | 'quantity', value: string) => {
    const numericValue = parseFloat(value.replace(",", "."));
    if (!isNaN(numericValue) && numericValue >= 0) {
      onUpdateItem(category, item.id, { [field]: numericValue });
    }
  }

  return (
    <div className={cn("grid grid-cols-12 items-center gap-2 md:gap-3 group p-2 rounded-lg", item.checked && "bg-muted/50")}>
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
            onChange={(e) => handleNumericUpdate('quantity', e.target.value)}
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
            onChange={(e) => handleNumericUpdate('price', e.target.value)}
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => onToggleEssential(category, item.id)}>
              <Star className={cn("mr-2 size-4", item.isEssential && "fill-yellow-400 text-yellow-500")} />
              {item.isEssential ? "Non essentiel" : "Essentiel"}
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <MoveRight className="mr-2 size-4" />
                Déplacer vers
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {categories.filter(c => c !== category).map(newCategory => (
                  <DropdownMenuItem key={newCategory} onSelect={() => onMoveItem(item.id, category, newCategory)}>
                    {newCategory}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive focus:text-destructive focus:bg-destructive/10"
              onSelect={() => onDeleteItem(category, item.id)}
            >
              <Trash2 className="mr-2 size-4" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};


export function GroceryList({ 
  lists, 
  categories,
  onToggleItem, 
  onDeleteItem, 
  onToggleEssential, 
  onUpdateItem, 
  onMoveItem,
  onAddItemClick, 
  onDeselectAll 
}: GroceryListProps) {
  
  const allCategories = Object.keys(lists);

  const hasCheckedItems = useMemo(() => {
    return Object.values(lists).flat().some(item => item.checked);
  }, [lists]);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle>Ma Liste de Courses</CardTitle>
            <div className="flex items-center gap-2">
                {hasCheckedItems && (
                    <Button variant="outline" size="sm" onClick={onDeselectAll}>
                        <ListX className="mr-2 h-4 w-4" />
                        Tout Décocher
                    </Button>
                )}
                <Button onClick={onAddItemClick} size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter
                </Button>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        {allCategories.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center text-muted-foreground p-4">
            <DynamicIcon name="ShoppingCart" className="h-16 w-16 mb-4 text-muted-foreground/50"/>
            <p className="text-lg font-semibold">Votre liste de courses est vide.</p>
            <p className="mt-1">Cliquez sur le bouton "Ajouter" ci-dessus pour commencer.</p>
          </div>
        ) : (
          <Accordion type="multiple" defaultValue={allCategories} className="w-full">
            {allCategories.map((category) => {
              const itemsToBuy = lists[category].filter(item => !item.checked);
              const itemsBought = lists[category].filter(item => item.checked);

              return (
                <AccordionItem value={category} key={category}>
                  <AccordionTrigger className="text-lg font-semibold">
                    {category}
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-col gap-2 pt-2">
                      {itemsToBuy.length > 0 && (
                        <div className="hidden md:grid grid-cols-12 items-center gap-3 text-sm font-medium text-muted-foreground px-4">
                          <div className="col-span-4">Article</div>
                          <div className="col-span-2">Quantité</div>
                          <div className="col-span-2">Prix Unitaire</div>
                          <div className="col-span-2 text-right">Total</div>
                          <div className="col-span-2 text-right">Actions</div>
                        </div>
                      )}

                      {itemsToBuy.map((item) => (
                        <ItemRow 
                          key={item.id}
                          item={item} 
                          category={category}
                          categories={categories}
                          onToggleItem={onToggleItem}
                          onDeleteItem={onDeleteItem}
                          onToggleEssential={onToggleEssential}
                          onUpdateItem={onUpdateItem}
                          onMoveItem={onMoveItem}
                        />
                      ))}

                      {itemsToBuy.length > 0 && itemsBought.length > 0 && (
                        <div className="relative py-2">
                          <div className="absolute inset-0 flex items-center" aria-hidden="true">
                            <div className="w-full border-t border-border" />
                          </div>
                          <div className="relative flex justify-center">
                            <span className="bg-card px-2 text-xs text-muted-foreground">
                              Achetés
                            </span>
                          </div>
                        </div>
                      )}

                      {itemsBought.map((item) => (
                        <ItemRow 
                          key={item.id}
                          item={item} 
                          category={category}
                          categories={categories}
                          onToggleItem={onToggleItem}
                          onDeleteItem={onDeleteItem}
                          onToggleEssential={onToggleEssential}
                          onUpdateItem={onUpdateItem}
                          onMoveItem={onMoveItem}
                        />
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}
