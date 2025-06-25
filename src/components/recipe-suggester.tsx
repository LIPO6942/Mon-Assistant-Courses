"use client";

import { useState } from "react";
import { suggestIngredients } from "@/ai/flows/suggest-ingredients";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { ScrollArea } from "./ui/scroll-area";
import { Loader2, Sparkles } from "lucide-react";

type RecipeSuggesterProps = {
  onAddItems: (items: string[]) => void;
};

export function RecipeSuggester({ onAddItems }: RecipeSuggesterProps) {
  const [open, setOpen] = useState(false);
  const [recipeName, setRecipeName] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSuggest = async () => {
    if (!recipeName.trim()) return;

    setIsLoading(true);
    setSuggestions([]);
    setSelected({});
    try {
      const result = await suggestIngredients({ recipeName });
      setSuggestions(result.ingredients);
      // Pre-select all by default
      const initialSelection = result.ingredients.reduce((acc, ingredient) => {
        acc[ingredient] = true;
        return acc;
      }, {} as Record<string, boolean>);
      setSelected(initialSelection);
    } catch (error) {
      console.error("Failed to suggest ingredients:", error);
      toast({
        variant: "destructive",
        title: "Erreur de suggestion",
        description:
          "Impossible de récupérer les suggestions d'ingrédients. Veuillez réessayer.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleToggleSelection = (ingredient: string) => {
    setSelected(prev => ({ ...prev, [ingredient]: !prev[ingredient]}));
  }

  const handleAddSelected = () => {
    const itemsToAdd = Object.keys(selected).filter(key => selected[key]);
    if (itemsToAdd.length > 0) {
      onAddItems(itemsToAdd);
      toast({
        title: "Ingrédients ajoutés!",
        description: `${itemsToAdd.length} ingrédient(s) ont été ajoutés à votre liste.`,
      });
    }
    setOpen(false);
    // Reset state on close
    setTimeout(() => {
        setRecipeName('');
        setSuggestions([]);
        setSelected({});
    }, 300);
  };

  const selectedCount = Object.values(selected).filter(Boolean).length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Sparkles className="mr-2 h-4 w-4 text-accent" />
          Idée Recette
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Générer une liste d'ingrédients</DialogTitle>
          <DialogDescription>
            Entrez le nom d'une recette et laissez l'IA vous suggérer les
            ingrédients nécessaires.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex gap-2">
            <Input
              id="recipe-name"
              placeholder="Ex: Crêpes au sucre"
              value={recipeName}
              onChange={(e) => setRecipeName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSuggest()}
            />
            <Button onClick={handleSuggest} disabled={isLoading || !recipeName}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Suggérer"
              )}
            </Button>
          </div>
          {suggestions.length > 0 && (
            <ScrollArea className="h-72 w-full rounded-md border p-4">
              <div className="space-y-4">
                <h4 className="font-medium">Ingrédients suggérés :</h4>
                {suggestions.map((ingredient) => (
                  <div key={ingredient} className="flex items-center space-x-3">
                    <Checkbox
                      id={ingredient}
                      checked={selected[ingredient] || false}
                      onCheckedChange={() => handleToggleSelection(ingredient)}
                    />
                    <Label htmlFor={ingredient} className="text-sm font-normal">
                      {ingredient}
                    </Label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
        <DialogFooter>
          <Button
            onClick={handleAddSelected}
            disabled={isLoading || selectedCount === 0}
          >
            Ajouter {selectedCount > 0 ? `(${selectedCount})` : ''} à la liste
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
