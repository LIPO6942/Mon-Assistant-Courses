"use client";

import { useState } from "react";
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
  onAddItem: (item: string, category: string) => void;
};

const DEFAULT_CATEGORY = "Maison";

export function AddItemForm({ categories, onAddItem }: AddItemFormProps) {
  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState(DEFAULT_CATEGORY);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (itemName.trim()) {
      onAddItem(itemName.trim(), category);
      setItemName("");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col sm:flex-row gap-2"
    >
      <Input
        type="text"
        placeholder="Nom de l'article (ex: Tomates)"
        value={itemName}
        onChange={(e) => setItemName(e.target.value)}
        className="flex-grow"
        aria-label="Nom de l'article"
      />
      <Select value={category} onValueChange={setCategory}>
        <SelectTrigger className="w-full sm:w-[180px]" aria-label="Catégorie">
          <SelectValue placeholder="Catégorie" />
        </SelectTrigger>
        <SelectContent>
          {categories.map((cat) => (
            <SelectItem key={cat} value={cat}>
              {cat}
            </SelectItem>
          ))}
           {!categories.includes(DEFAULT_CATEGORY) && (
            <SelectItem value={DEFAULT_CATEGORY}>
              {DEFAULT_CATEGORY}
            </SelectItem>
          )}
        </SelectContent>
      </Select>
      <Button type="submit" className="w-full sm:w-auto">
        <Plus className="mr-2 h-4 w-4" /> Ajouter
      </Button>
    </form>
  );
}
