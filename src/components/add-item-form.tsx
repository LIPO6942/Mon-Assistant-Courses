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
import { Plus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";


type AddItemFormProps = {
  categories: string[];
  onAddItem: (item: string, category: string, price: number, quantity: number, unit: string, isEssential: boolean) => Promise<void>;
};

const DEFAULT_CATEGORY = "Divers";
const DEFAULT_UNIT = "pièce(s)";
const units = ["pièce(s)", "kg", "g", "L", "mL", "bouteille", "pack", "sachet"];

export function AddItemForm({ categories, onAddItem }: AddItemFormProps) {
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemQuantity, setItemQuantity] = useState("1");
  const [itemUnit, setItemUnit] = useState(DEFAULT_UNIT);
  const [category, setCategory] = useState(categories[0] || DEFAULT_CATEGORY);
  const [isEssential, setIsEssential] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (![...categories, DEFAULT_CATEGORY].includes(category)) {
      setCategory(categories[0] || DEFAULT_CATEGORY);
    }
  }, [categories, category]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (itemName.trim() && !isAdding) {
      const priceAsNumber = parseFloat(itemPrice.replace(",", "."));
      const quantityAsNumber = parseFloat(itemQuantity.replace(",", "."));

      if (!isNaN(priceAsNumber) && !isNaN(quantityAsNumber) && priceAsNumber > 0 && quantityAsNumber > 0) {
        setIsAdding(true);
        try {
          await onAddItem(itemName.trim(), category, priceAsNumber, quantityAsNumber, itemUnit, isEssential);
          // Reset form
          setItemName("");
          setItemPrice("");
          setItemQuantity("1");
          setItemUnit(DEFAULT_UNIT);
          setIsEssential(false);
        } catch (error) {
          console.error(error);
          toast({
            variant: 'destructive',
            title: 'Erreur',
            description: "Une erreur est survenue lors de l'ajout de l'article."
          })
        } finally {
          setIsAdding(false);
        }
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4"
    >
      <div className="grid gap-2">
        <Label htmlFor="item-name">Nom de l'article</Label>
        <Input
            id="item-name"
            type="text"
            placeholder="Ex: Tomates"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            aria-label="Nom de l'article"
            required
            disabled={isAdding}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
            <Label htmlFor="item-price">Prix (par unité)</Label>
            <Input
                id="item-price"
                type="text"
                placeholder="Prix (TND)"
                value={itemPrice}
                onChange={(e) => setItemPrice(e.target.value)}
                aria-label="Prix de l'article"
                pattern="[0-9]*[.,]?[0-9]+"
                required
                disabled={isAdding}
            />
        </div>
        <div>
            <Label htmlFor="item-quantity">Quantité</Label>
            <Input
                id="item-quantity"
                type="text"
                value={itemQuantity}
                onChange={(e) => setItemQuantity(e.target.value)}
                aria-label="Quantité de l'article"
                pattern="[0-9]*[.,]?[0-9]+"
                required
                disabled={isAdding}
            />
        </div>
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="item-unit">Unité</Label>
        <Select value={itemUnit} onValueChange={setItemUnit} disabled={isAdding}>
            <SelectTrigger id="item-unit" aria-label="Unité">
              <SelectValue placeholder="Unité" />
            </SelectTrigger>
            <SelectContent>
              {units.map((unit) => (
                <SelectItem key={unit} value={unit}>
                  {unit}
                </SelectItem>
              ))}
            </SelectContent>
        </Select>
      </div>


      <div className="grid gap-2">
        <Label htmlFor="item-category">Catégorie</Label>
        <Select value={category} onValueChange={setCategory} disabled={isAdding}>
            <SelectTrigger id="item-category" aria-label="Catégorie">
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
      </div>

      <div className="flex items-center space-x-2 pt-2">
        <Checkbox 
          id="is-essential" 
          checked={isEssential}
          onCheckedChange={(checked) => setIsEssential(checked as boolean)}
          disabled={isAdding}
        />
        <Label htmlFor="is-essential" className="cursor-pointer">
          Article de première nécessité
        </Label>
      </div>

      <Button type="submit" className="w-full mt-2" disabled={isAdding}>
        {isAdding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
        {isAdding ? "Ajout en cours..." : "Ajouter"}
      </Button>
    </form>
  );
}
