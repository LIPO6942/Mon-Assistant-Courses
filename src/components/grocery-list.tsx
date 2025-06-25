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
import { Trash2 } from "lucide-react";

type GroceryItem = {
  id: number;
  name: string;
  checked: boolean;
  price: number | null;
};

type GroceryLists = Record<string, GroceryItem[]>;

type GroceryListProps = {
  lists: GroceryLists;
  onToggleItem: (category: string, itemId: number) => void;
  onDeleteItem: (category: string, itemId: number) => void;
};

export function GroceryList({ lists, onToggleItem, onDeleteItem }: GroceryListProps) {
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

  const formatPrice = (price: number | null) => {
    if (price === null || isNaN(price)) return "";
    return `${price.toFixed(2).replace('.', ',')} €`;
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
                <div className="flex flex-col gap-3 pt-2">
                  {lists[category].map((item) => (
                    <div key={item.id} className="flex items-center gap-3 group">
                      <Checkbox
                        id={`${category}-${item.id}`}
                        checked={item.checked}
                        onCheckedChange={() => onToggleItem(category, item.id)}
                        className="size-5"
                      />
                      <Label
                        htmlFor={`${category}-${item.id}`}
                        className={`flex-1 text-base transition-colors ${
                          item.checked
                            ? "text-muted-foreground line-through"
                            : "text-foreground"
                        }`}
                      >
                        {item.name}
                      </Label>
                      <span className={`font-mono text-sm ${item.checked ? "text-muted-foreground line-through" : "text-foreground"}`}>
                        {formatPrice(item.price)}
                      </span>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="size-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                        onClick={() => onDeleteItem(category, item.id)}
                        aria-label="Supprimer l'article"
                      >
                        <Trash2 className="size-4" />
                      </Button>
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
