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

type GroceryItem = {
  id: number;
  name: string;
  checked: boolean;
};

type GroceryLists = Record<string, GroceryItem[]>;

type GroceryListProps = {
  lists: GroceryLists;
  onToggleItem: (category: string, itemId: number) => void;
};

export function GroceryList({ lists, onToggleItem }: GroceryListProps) {
  const categories = Object.keys(lists);

  if (categories.length === 0) {
    return (
      <div className="text-center text-muted-foreground mt-10">
        <p>Votre liste de courses est vide.</p>
        <p>Ajoutez des articles ou générez une liste à partir d'une recette !</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mes Listes de Courses</CardTitle>
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
                  {lists[category].map((item) => (
                    <div key={item.id} className="flex items-center space-x-3">
                      <Checkbox
                        id={`${category}-${item.id}`}
                        checked={item.checked}
                        onCheckedChange={() => onToggleItem(category, item.id)}
                      />
                      <Label
                        htmlFor={`${category}-${item.id}`}
                        className={`text-base transition-colors ${
                          item.checked
                            ? "text-muted-foreground line-through"
                            : "text-foreground"
                        }`}
                      >
                        {item.name}
                      </Label>
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
