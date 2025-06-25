"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { AddItemForm } from "@/components/add-item-form";
import { GroceryList } from "@/components/grocery-list";
import { WeatherSuggester } from "@/components/weather-suggester";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type GroceryItem = {
  id: number;
  name: string;
  checked: boolean;
  price: number | null;
  isEssential: boolean;
};

export type GroceryLists = Record<string, GroceryItem[]>;

const initialLists: GroceryLists = {
  "Fruits et Légumes": [
    { id: 1, name: "Pommes", checked: false, price: 3.5, isEssential: false },
    { id: 2, name: "Carottes", checked: true, price: 2.0, isEssential: true },
    { id: 3, name: "Épinards", checked: false, price: 4.0, isEssential: false },
  ],
  Boulangerie: [{ id: 4, name: "Baguette", checked: false, price: 0.4, isEssential: true }],
  "Produits Laitiers": [
    { id: 5, name: "Lait", checked: false, price: 1.5, isEssential: true },
    { id: 6, name: "Yaourts nature", checked: false, price: 2.5, isEssential: false },
    { id: 7, name: "Fromage râpé", checked: true, price: 5.0, isEssential: false },
  ],
};

export default function Home() {
  const [lists, setLists] = useState<GroceryLists>(initialLists);

  const handleAddItem = (item: string, category: string, price: number | null, isEssential: boolean) => {
    setLists((prevLists) => {
      const newLists = { ...prevLists };
      const newItem: GroceryItem = { id: Date.now(), name: item, checked: false, price, isEssential };
      if (newLists[category]) {
        newLists[category] = [...newLists[category], newItem];
      } else {
        newLists[category] = [newItem];
      }
      return newLists;
    });
  };

  const handleToggleItem = (category: string, itemId: number) => {
    setLists((prevLists) => {
      const newLists = { ...prevLists };
      newLists[category] = newLists[category].map((item) =>
        item.id === itemId ? { ...item, checked: !item.checked } : item
      );
      return newLists;
    });
  };

  const handleDeleteItem = (category: string, itemId: number) => {
    setLists(prevLists => {
      const newLists = { ...prevLists };
      newLists[category] = newLists[category].filter(item => item.id !== itemId);
      if (newLists[category].length === 0) {
        delete newLists[category];
      }
      return newLists;
    });
  };

  const handleToggleEssential = (category: string, itemId: number) => {
    setLists((prevLists) => {
      const newLists = { ...prevLists };
      newLists[category] = newLists[category].map((item) =>
        item.id === itemId ? { ...item, isEssential: !item.isEssential } : item
      );
      return newLists;
    });
  };

  const categories = Object.keys(lists);
  const allIngredients = Object.values(lists).flat();

  return (
    <div className="flex flex-col min-h-screen w-full bg-muted/40">
      <Header ingredients={allIngredients} />
      <main className="flex-1 container mx-auto p-4 md:p-8">
        <div className="grid md:grid-cols-3 gap-8">
          
          <div className="md:col-span-2">
            <GroceryList 
              lists={lists} 
              onToggleItem={handleToggleItem} 
              onDeleteItem={handleDeleteItem}
              onToggleEssential={handleToggleEssential}
            />
          </div>

          <aside className="space-y-8 md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Ajouter un article</CardTitle>
              </CardHeader>
              <CardContent>
                <AddItemForm categories={categories} onAddItem={handleAddItem} />
              </CardContent>
            </Card>

            <WeatherSuggester />
          </aside>

        </div>
      </main>
    </div>
  );
}
