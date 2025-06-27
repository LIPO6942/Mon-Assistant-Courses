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
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Loader2, PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";


type AddItemFormProps = {
  categories: string[];
  onAddItem: (item: string, category: string, price: number, quantity: number, unit: string, isEssential: boolean) => Promise<void>;
};

const DEFAULT_UNIT = "pièce(s)";
const units = ["pièce(s)", "kg", "g", "L", "mL", "bouteille", "pack", "sachet"];

export function AddItemForm({ categories, onAddItem }: AddItemFormProps) {
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemQuantity, setItemQuantity] = useState("1");
  const [itemUnit, setItemUnit] = useState(DEFAULT_UNIT);
  const [category, setCategory] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isEssential, setIsEssential] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();

  const isCreatingNewCategory = category === "__NEW__";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAdding) return;

    const finalCategory = isCreatingNewCategory ? newCategoryName.trim() : category;

    if (!itemName.trim() || !finalCategory.trim()) {
      toast({ variant: 'destructive', title: 'Champs manquants', description: "Veuillez nommer l'article et choisir ou créer une catégorie." });
      return;
    }
    
    const priceAsNumber = parseFloat(itemPrice.replace(",", "."));
    const quantityAsNumber = parseFloat(itemQuantity.replace(",", "."));

    if (isNaN(priceAsNumber) || priceAsNumber <= 0) {
      toast({ variant: 'destructive', title: 'Erreur', description: "Veuillez entrer un prix valide." });
      return;
    }
    if (isNaN(quantityAsNumber) || quantityAsNumber <= 0) {
      toast({ variant: 'destructive', title: 'Erreur', description: "Veuillez entrer une quantité valide." });
      return;
    }

    setIsAdding(true);
    try {
      await onAddItem(itemName.trim(), finalCategory, priceAsNumber, quantityAsNumber, itemUnit, isEssential);
      // Reset form
      setItemName("");
      setItemPrice("");
      setItemQuantity("1");
      setItemUnit(DEFAULT_UNIT);
      setCategory("");
      setNewCategoryName("");
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
        <Label htmlFor="item-category-select">Catégorie</Label>
        <Select value={category} onValueChange={setCategory} disabled={isAdding}>
          <SelectTrigger id="item-category-select" aria-label="Catégorie">
            <SelectValue placeholder="Choisir une catégorie..." />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
             <SelectItem value="__NEW__">
                <span className="flex items-center gap-2 text-primary">
                  <PlusCircle className="h-4 w-4" /> Nouvelle catégorie...
                </span>
              </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isCreatingNewCategory && (
        <div className="grid gap-2 animate-in fade-in">
          <Label htmlFor="new-category-name">Nom de la nouvelle catégorie</Label>
          <Input
              id="new-category-name"
              type="text"
              placeholder="Ex: Surgelés"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              aria-label="Nom de la nouvelle catégorie"
              required
              autoFocus
              disabled={isAdding}
          />
        </div>
      )}

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
