
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { FavoriteRecipe } from "@/services/recipes";
import { Loader2 } from "lucide-react";

type RecipeFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipe: Partial<FavoriteRecipe> | null;
  onSave: (data: { name: string; ingredients: string[]; instructions: string[] }) => Promise<void>;
};

export function RecipeFormDialog({ open, onOpenChange, recipe, onSave }: RecipeFormDialogProps) {
  const [name, setName] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [instructions, setInstructions] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open && recipe) {
      setName(recipe.name || "");
      setIngredients(recipe.ingredients?.join("\n") || "");
      setInstructions(recipe.instructions?.join("\n") || "");
    } else {
      // Reset form when dialog is closed or for new recipe
      setName("");
      setIngredients("");
      setInstructions("");
    }
  }, [recipe, open]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast({ variant: "destructive", title: "Nom manquant", description: "Veuillez donner un nom à votre recette." });
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        name: name.trim(),
        ingredients: ingredients.split("\n").filter(line => line.trim() !== ""),
        instructions: instructions.split("\n").filter(line => line.trim() !== ""),
      });
      onOpenChange(false);
    } catch (e) {
      // The parent component will show the toast for saving errors
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{recipe?.id ? "Modifier la recette" : "Ajouter une recette"}</DialogTitle>
          <DialogDescription>
            Remplissez les détails de votre recette personnalisée.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="recipe-name">Nom de la recette</Label>
            <Input
              id="recipe-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSaving}
              autoFocus
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="recipe-ingredients">Ingrédients (un par ligne)</Label>
            <Textarea
              id="recipe-ingredients"
              placeholder="1kg de farine&#x0a;2 oeufs&#x0a;..."
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              rows={5}
              disabled={isSaving}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="recipe-instructions">Instructions (une étape par ligne)</Label>
            <Textarea
              id="recipe-instructions"
              placeholder="Mélanger la farine et les oeufs...&#x0a;Cuire au four à 180°C...&#x0a;..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={8}
              disabled={isSaving}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={isSaving}>
              Annuler
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isSaving ? "Sauvegarde..." : "Sauvegarder"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
