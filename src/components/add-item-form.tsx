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
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus } from "lucide-react";

type AddItemFormProps = {
  categories: string[];
  onAddItem: (item: string, category: string, price: number | null, isEssential: boolean) => void;
};

const DEFAULT_CATEGORY = "Divers";

export function AddItemForm({ categories, onAddItem }: AddItemFormProps) {
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [category, setCategory] = useState(categories[0] || DEFAULT_CATEGORY);
  const [isEssential, setIsEssential] = useState(false);

  useEffect(() => {
    if (![...categories, DEFAULT_CATEGORY].includes(category)) {
      setCategory(categories[0] || DEFAULT_CATEGORY);
    }
  }, [categories, category]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (itemName.trim()) {
      const priceAsNumber = itemPrice ? parseFloat(itemPrice.replace(",", ".")) : null;
      onAddItem(itemName.trim(), category, priceAsNumber && !isNaN(priceAsNumber) ? priceAsNumber : null, isEssential);
      setItemName("");
      setItemPrice("");
      setIsEssential(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4"
    >
      <div className="flex flex-col sm:flex-row gap-2">
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
            placeholder="Prix (TND)"
            value={itemPrice}
            onChange={(e) => setItemPrice(e.target.value)}
            className="w-full sm:w-28"
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

      <div className="flex items-center space-x-2">
        <Checkbox 
          id="is-essential" 
          checked={isEssential}
          onCheckedChange={(checked) => setIsEssential(checked as boolean)}
        />
        <Label htmlFor="is-essential" className="cursor-pointer">
          Article de première nécessité
        </Label>
      </div>

      <Button type="submit" className="w-full">
        <Plus className="mr-2 h-4 w-4" /> Ajouter
      </Button>
    </form>
  );
}
