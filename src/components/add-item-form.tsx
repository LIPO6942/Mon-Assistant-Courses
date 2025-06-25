"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";

type AddItemFormProps = {
  categories: string[];
  onAddItem: (item: string, category: string, price: number | null) => void;
};

const DEFAULT_CATEGORY = "Divers";

export function AddItemForm({ categories, onAddItem }: AddItemFormProps) {
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [category, setCategory] = useState(categories[0] || DEFAULT_CATEGORY);

  useEffect(() => {
    if (![...categories, DEFAULT_CATEGORY].includes(category)) {
      setCategory(categories[0] || DEFAULT_CATEGORY);
    }
  }, [categories, category]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (itemName.trim()) {
      const priceAsNumber = itemPrice ? parseFloat(itemPrice.replace(",", ".")) : null;
      onAddItem(itemName.trim(), category, priceAsNumber && !isNaN(priceAsNumber) ? priceAsNumber : null);
      setItemName("");
      setItemPrice("");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4"
    >
      <div className="flex gap-2">
        <Input
            type="text"
            placeholder="Nom de l'article (ex: Tomates)"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            className="flex-grow"
            aria-label="Nom de l'article"
            required
        />
        <Input
            type="text"
            placeholder="Prix (€)"
            value={itemPrice}
            onChange={(e) => setItemPrice(e.target.value)}
            className="w-24"
            aria-label="Prix de l'article"
            pattern="[0-9]*[.,]?[0-9]+"
        />
      </div>

      <Select value={category} onValueChange={setCategory}>
        <SelectTrigger aria-label="Catégorie">
          <SelectValue placeholder="Catégorie" />
        </SelectTrigger>
        <SelectContent>
          {[...categories, DEFAULT_CATEGORY].filter((v, i, a) => a.indexOf(v) === i).map((cat) => (
            <SelectItem key={cat} value={cat}>
              {cat}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button type="submit" className="w-full">
        <Plus className="mr-2 h-4 w-4" /> Ajouter
      </Button>
    </form>
  );
}
