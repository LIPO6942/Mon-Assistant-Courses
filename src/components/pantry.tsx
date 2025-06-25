
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Trash2, Star, Plus, MoreHorizontal, MoveRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GroceryItem, GroceryLists } from "@/app/page";
import { DynamicIcon } from "./dynamic-icon";

type PantryProps = {
  lists: GroceryLists;
  cartItemIds: Set<number>;
  categories: string[];
  onToggleItem: (item: GroceryItem) => void;
  onDeleteItem: (category: string, itemId: number) => void;
  onToggleEssential: (category: string, itemId: number) => void;
  onUpdateItem: (category: string, itemId: number, updates: Partial<Pick<GroceryItem, 'price' | 'quantity'>>) => void;
  onMoveItem: (itemId: number, oldCategory: string, newCategory: string) => void;
  onAddItemClick: () => void;
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
  
  const handleNumericUpdate = (field: 'price' | 'quantity', value: string) => {
    const numericValue = parseFloat(value.replace(",", "."));
    if (!isNaN(numericValue) && numericValue >= 0) {
      onUpdateItem(category, item.id, { [field]: numericValue });
    }
  }

  return (
    <div className="grid grid-cols-12 items-center gap-2 md:gap-3 group p-2 rounded-lg">
      <div className="col-span-12 md:col-span-5 flex items-center gap-3">
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

      <div className="col-span-6 md:col-span-2">
        <div className="flex items-center gap-1">
          <Input 
            type="number"
            value={item.quantity}
            onChange={(e) => handleNumericUpdate('quantity', e.target.value)}
            className="h-8 w-20 text-center"
            aria-label={`Quantité pour ${item.name}`}
          />
          <span className="text-xs text-muted-foreground">{item.unit}</span>
        </div>
      </div>

      <div className="col-span-6 md:col-span-2">
        <Input 
            type="number"
            value={item.price}
            onChange={(e) => handleNumericUpdate('price', e.target.value)}
            className="h-8 w-24 text-right"
            aria-label={`Prix pour ${item.name}`}
          />
      </div>
      
      <div className="col-span-6 md:col-span-1 font-mono text-sm text-right font-semibold">
        {`${(item.price * item.quantity).toFixed(2).replace('.', ',')} TND`}
      </div>
      
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

export function Pantry({ 
  lists, 
  cartItemIds,
  categories,
  onToggleItem, 
  onDeleteItem, 
  onToggleEssential, 
  onUpdateItem, 
  onMoveItem,
  onAddItemClick,
}: PantryProps) {
  
  const allCategories = Object.keys(lists);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle>Mon Garde-Manger</CardTitle>
            <Button onClick={onAddItemClick} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Ajouter un article
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        {allCategories.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center text-muted-foreground p-4">
            <DynamicIcon name="Box" className="h-16 w-16 mb-4 text-muted-foreground/50"/>
            <p className="text-lg font-semibold">Votre garde-manger est vide.</p>
            <p className="mt-1">Cliquez sur "Ajouter un article" pour commencer à le remplir.</p>
          </div>
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
