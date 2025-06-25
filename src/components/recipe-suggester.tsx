"use client";

import { useState } from "react";
import {
  suggestRecipe,
  SuggestRecipeOutput,
} from "@/ai/flows/suggest-ingredients";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "./ui/scroll-area";
import { Loader2, Sparkles, ChefHat } from "lucide-react";

type RecipeSuggesterProps = {
  ingredients: string[];
};

export function RecipeSuggester({ ingredients }: RecipeSuggesterProps) {
  const [open, setOpen] = useState(false);
  const [recipe, setRecipe] = useState<SuggestRecipeOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSuggest = async () => {
    setIsLoading(true);
    setRecipe(null);
    try {
      const result = await suggestRecipe({ ingredients });
      setRecipe(result);
    } catch (error) {
      console.error("Failed to suggest recipe:", error);
      toast({
        variant: "destructive",
        title: "Erreur de suggestion",
        description:
          "Impossible de récupérer la suggestion de recette. Veuillez réessayer.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setTimeout(() => {
        setRecipe(null);
        setIsLoading(false);
      }, 300);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Sparkles className="mr-2 h-4 w-4 text-accent" />
          Idée Recette
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Suggestion de Recette</DialogTitle>
          <DialogDescription>
            Laissez l'IA vous suggérer une recette à partir des ingrédients de
            votre liste.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 min-h-[20rem] flex items-center justify-center">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground">
                Recherche d'une recette...
              </p>
            </div>
          ) : recipe ? (
            <ScrollArea className="h-80 w-full">
              <div className="space-y-4 pr-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <ChefHat className="h-6 w-6 text-primary" />
                  {recipe.recipeName}
                </h3>

                <div>
                  <h4 className="font-semibold mb-2">Instructions:</h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    {recipe.instructions.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ol>
                </div>

                {recipe.missingIngredients &&
                  recipe.missingIngredients.length > 0 && (
                    <div>
                      <h4 className="font-semibold mt-4 mb-2">
                        Ingrédients manquants suggérés :
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        {recipe.missingIngredients.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
              </div>
            </ScrollArea>
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 text-center">
              <p className="text-muted-foreground px-4">
                {ingredients.length > 0
                  ? `Cliquez ci-dessous pour trouver une recette avec vos ${ingredients.length} ingrédient(s).`
                  : "Votre liste est vide, mais nous pouvons quand même vous suggérer quelque chose !"}
              </p>
              <Button onClick={handleSuggest} disabled={isLoading}>
                <ChefHat className="mr-2 h-4 w-4" />
                Trouver une recette
              </Button>
            </div>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              Fermer
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
