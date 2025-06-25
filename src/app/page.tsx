"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { AddItemForm } from "@/components/add-item-form";
import { GroceryList } from "@/components/grocery-list";

type GroceryItem = {
  id: number;
  name: string;
  checked: boolean;
};

type GroceryLists = Record<string, GroceryItem[]>;

const initialLists: GroceryLists = {
  "Fruits et Légumes": [
    { id: 1, name: "Pommes", checked: false },
    { id: 2, name: "Carottes", checked: true },
    { id: 3, name: "Épinards", checked: false },
  ],
  Boulangerie: [{ id: 4, name: "Baguette", checked: false }],
  "Produits Laitiers": [
    { id: 5, name: "Lait", checked: false },
    { id: 6, name: "Yaourts nature", checked: false },
    { id: 7, name: "Fromage râpé", checked: true },
  ],
};

export default function Home() {
  const [lists, setLists] = useState<GroceryLists>(initialLists);

  const handleAddItem = (item: string, category: string) => {
    setLists((prevLists) => {
      const newLists = { ...prevLists };
      const newItem = { id: Date.now(), name: item, checked: false };
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

  const categories = Object.keys(lists);
  const allIngredients = Object.values(lists)
    .flat()
    .map((item) => item.name);

  return (
    <div className="flex flex-col items-center min-h-screen w-full">
      <Header ingredients={allIngredients} />
      <main className="w-full max-w-4xl p-4 md:p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Ajouter un article</h2>
          <AddItemForm categories={categories} onAddItem={handleAddItem} />
        </div>
        <GroceryList lists={lists} onToggleItem={handleToggleItem} />
      </main>
    </div>
  );
}
