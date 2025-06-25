"use client";

import { useState, useMemo } from "react";
import { Header } from "@/components/header";
import { AddItemForm } from "@/components/add-item-form";
import { GroceryList } from "@/components/grocery-list";
import { WeatherSuggester } from "@/components/weather-suggester";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet } from "lucide-react";

// Updated GroceryItem type
export type GroceryItem = {
  id: number;
  name: string;
  checked: boolean;
  price: number; // Price per unit, now mandatory
  quantity: number;
  unit: string;
  isEssential: boolean;
};

export type GroceryLists = Record<string, GroceryItem[]>;

// Updated initial data
const initialLists: GroceryLists = {
  "Fruits et Légumes": [
    { id: 1, name: "Pommes", checked: false, price: 3.5, quantity: 1, unit: 'kg', isEssential: false },
    { id: 2, name: "Carottes", checked: true, price: 2.0, quantity: 0.5, unit: 'kg', isEssential: true },
    { id: 3, name: "Épinards", checked: false, price: 4.0, quantity: 1, unit: 'sachet', isEssential: false },
  ],
  Boulangerie: [{ id: 4, name: "Baguette", checked: false, price: 0.4, quantity: 2, unit: 'pièce(s)', isEssential: true }],
  "Produits Laitiers": [
    { id: 5, name: "Lait", checked: false, price: 1.5, quantity: 1, unit: 'L', isEssential: true },
    { id: 6, name: "Yaourts nature", checked: false, price: 0.8, quantity: 4, unit: 'pièce(s)', isEssential: false },
    { id: 7, name: "Fromage râpé", checked: true, price: 5.0, quantity: 1, unit: 'sachet', isEssential: false },
  ],
};

export default function Home() {
  const [lists, setLists] = useState<GroceryLists>(initialLists);

  const handleAddItem = (item: string, category: string, price: number, quantity: number, unit: string, isEssential: boolean) => {
    setLists((prevLists) => {
      const newLists = { ...prevLists };
      const newItem: GroceryItem = { id: Date.now(), name: item, checked: false, price, quantity, unit, isEssential };
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
  
  const handleUpdateItem = (category: string, itemId: number, updates: Partial<Pick<GroceryItem, 'price' | 'quantity'>>) => {
    setLists(prevLists => {
      const newLists = { ...prevLists };
      newLists[category] = newLists[category].map(item =>
        item.id === itemId ? { ...item, ...updates } : item
      );
      return newLists;
    });
  };

  const categories = Object.keys(lists);
  
  const ingredientsForRecipe = useMemo(() => {
    return Object.values(lists)
      .flat()
      .filter(item => item.checked)
      .map(item => ({ name: item.name, price: item.price }));
  }, [lists]);

  const totalCost = useMemo(() => {
    return Object.values(lists)
      .flat()
      .filter(item => item.checked)
      .reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [lists]);


  return (
    <div className="flex flex-col min-h-screen w-full bg-muted/40">
      <Header ingredients={ingredientsForRecipe} />
      <main className="flex-1 container mx-auto p-4 md:p-8">
        <div className="grid md:grid-cols-3 gap-8">
          
          <div className="md:col-span-2">
            <GroceryList 
              lists={lists} 
              onToggleItem={handleToggleItem} 
              onDeleteItem={handleDeleteItem}
              onToggleEssential={handleToggleEssential}
              onUpdateItem={handleUpdateItem}
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

            <Card>
              <CardHeader className="flex flex-row items-center gap-3 space-y-0">
                <Wallet className="h-6 w-6 text-primary" />
                <CardTitle>Total de la sélection</CardTitle>
              </CardHeader>
              <CardContent>
                 <p className="text-3xl font-bold text-center">{totalCost.toFixed(2).replace('.', ',')} <span className="text-lg font-normal text-muted-foreground">TND</span></p>
              </CardContent>
            </Card>

            <WeatherSuggester />
          </aside>

        </div>
      </main>
    </div>
  );
}
