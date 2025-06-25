
"use client";

import { useState, useEffect } from "react";
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
import { Trash2, Star, Plus, MoreHorizontal, MoveRight, XCircle, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GroceryItem, GroceryLists } from "@/app/page";
import { DynamicIcon } from "./dynamic-icon";

type PantryProps = {
  lists: GroceryLists;
  cartItemIds: Set<number>;
  categories: string[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onToggleItem: (item: GroceryItem) => void;
  onDeleteItem: (category: string, itemId: number) => void;
  onToggleEssential: (category: string, itemId: number) => void;
  onUpdateItem: (category: string, itemId: number, updates: Partial<Pick<GroceryItem, 'price' | 'quantity'>>) => void;
  onMoveItem: (itemId: number, oldCategory: string, newCategory: string) => void;
  onAddItemClick: () => void;
  onClearCart: () => void;
};

const ItemRow = ({ 
  item,
  isChecked,
  category, 
  categories, 
  onToggleItem, 
  onDeleteItem, 
  onToggleEssential, 
  onUpdateItem, 
  onMoveItem 
}: { 
  item: GroceryItem,
  isChecked: boolean,
  category: string, 
  categories: string[], 
  onToggleItem: (item: GroceryItem) => void,
  onDeleteItem: (category: string, itemId: number) => void,
  onToggleEssential: (category: string, itemId: number) => void,
  onUpdateItem: (category: string, itemId: number, updates: Partial<Pick<GroceryItem, 'price' | 'quantity'>>) => void,
  onMoveItem: (itemId: number, oldCategory: string, newCategory: string) => void,
}) => {
  const [quantity, setQuantity] = useState(item.quantity.toString());
  const [price, setPrice] = useState(item.price.toString());

  useEffect(() => {
    setQuantity(item.quantity.toString());
  }, [item.quantity]);

  useEffect(() => {
    setPrice(item.price.toString());
  }, [item.price]);
  
  const handleUpdate = (field: 'price' | 'quantity') => {
    const value = field === 'price' ? price : quantity;
    let numericValue = parseFloat(value.replace(",", "."));
    
    if (isNaN(numericValue) || numericValue < 0) {
      numericValue = 0;
    }

    if (item[field] !== numericValue) {
        onUpdateItem(category, item.id, { [field]: numericValue });
    } else if (value !== item[field].toString()) {
        // This handles cases where the user enters an invalid value (like "abc")
        // but the underlying numeric value hasn't changed (e.g., was already 0).
        // We revert the input to the valid value from the parent state.
        if (field === 'price') setPrice(item.price.toString());
        else setQuantity(item.quantity.toString());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, field: 'price' | 'quantity') => {
    if (e.key === 'Enter') {
      handleUpdate(field);
      e.currentTarget.blur();
    }
  }

  const currentPrice = parseFloat(price.replace(",", ".")) || 0;
  const currentQuantity = parseFloat(quantity.replace(",", ".")) || 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-12 items-center gap-x-3 gap-y-2 md:gap-3 group p-2 rounded-lg">
      <div className="col-span-2 md:col-span-5 flex items-center gap-3">
        <Checkbox
          id={`pantry-${item.id}`}
          checked={isChecked}
          onCheckedChange={() => onToggleItem(item)}
          className="size-5"
        />
        <DynamicIcon name={item.icon} className="h-6 w-6 text-primary flex-shrink-0" />
        <Label
          htmlFor={`pantry-${item.id}`}
          className="flex-1 text-base transition-colors cursor-pointer"
        >
          {item.name}
        </Label>
      </div>

      <div className="col-span-1 md:col-span-2">
        <div className="flex items-center gap-1">
          <Input 
            type="text"
            inputMode="decimal"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            onBlur={() => handleUpdate('quantity')}
            onKeyDown={(e) => handleKeyDown(e, 'quantity')}
            className="h-8 text-center"
            aria-label={`Quantité pour ${item.name}`}
          />
          <span className="text-xs text-muted-foreground">{item.unit}</span>
        </div>
      </div>

      <div className="col-span-1 md:col-span-2">
        <Input 
            type="text"
            inputMode="decimal"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            onBlur={() => handleUpdate('price')}
            onKeyDown={(e) => handleKeyDown(e, 'price')}
            className="h-8 text-right"
            aria-label={`Prix pour ${item.name}`}
          />
      </div>
      
      <div className="col-span-1 md:col-span-1 font-mono text-sm text-right font-semibold">
        {`${(currentPrice * currentQuantity).toFixed(2).replace('.', ',')} TND`}
      </div>
      
      <div className="col-span-1 md:col-span-2 flex items-center justify-end gap-1">
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

export function Pantry({ 
  lists, 
  cartItemIds,
  categories,
  searchQuery,
  onSearchChange,
  onToggleItem, 
  onDeleteItem, 
  onToggleEssential, 
  onUpdateItem, 
  onMoveItem,
  onAddItemClick,
  onClearCart,
}: PantryProps) {
  
  const allCategories = Object.keys(lists);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle>Mon Garde-Manger</CardTitle>
            <div className="flex items-center gap-2">
              {cartItemIds.size > 0 && (
                  <Button onClick={onClearCart} variant="outline" size="sm">
                      <XCircle className="mr-2 h-4 w-4" />
                      Tout désélectionner
                  </Button>
              )}
              <Button onClick={onAddItemClick} size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter un article
              </Button>
            </div>
        </div>
        <div className="relative pt-2">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
              type="search"
              placeholder="Rechercher un ingrédient..."
              className="w-full rounded-md bg-background pl-10"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent>
        {allCategories.length === 0 ? (
          searchQuery ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center text-muted-foreground p-4">
              <DynamicIcon name="SearchX" className="h-16 w-16 mb-4 text-muted-foreground/50"/>
              <p className="text-lg font-semibold">Aucun résultat</p>
              <p className="mt-1 text-sm">Aucun ingrédient ne correspond à votre recherche.</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center text-muted-foreground p-4">
              <DynamicIcon name="Box" className="h-16 w-16 mb-4 text-muted-foreground/50"/>
              <p className="text-lg font-semibold">Votre garde-manger est vide.</p>
              <p className="mt-1">Cliquez sur "Ajouter un article" pour commencer à le remplir.</p>
            </div>
          )
        ) : (
          <Accordion type="multiple" defaultValue={allCategories} className="w-full">
            {allCategories.map((category) => (
              <AccordionItem value={category} key={category}>
                <AccordionTrigger className="text-lg font-semibold">
                  {category}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col gap-2 pt-2">
                    <div className="hidden md:grid grid-cols-12 items-center gap-3 text-sm font-medium text-muted-foreground px-4">
                      <div className="col-span-5">Article</div>
                      <div className="col-span-2">Quantité</div>
                      <div className="col-span-2">Prix Unitaire</div>
                      <div className="col-span-1 text-right">Total</div>
                      <div className="col-span-2 text-right">Actions</div>
                    </div>
                    {lists[category].map((item) => (
                      <ItemRow 
                        key={item.id}
                        item={item} 
                        isChecked={cartItemIds.has(item.id)}
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
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}
