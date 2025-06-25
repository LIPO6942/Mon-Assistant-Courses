
"use client";

import { useState } from "react";
import {
  suggestRecipe,
  SuggestRecipeOutput,
} from "@/ai/flows/suggest-ingredients";
import { saveFavoriteRecipe } from "@/services/recipes";
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
import { Loader2, Sparkles, ChefHat, Wallet, HeartPulse, Bookmark } from "lucide-react";

type RecipeSuggesterProps = {
  ingredients: { name: string; price: number | null; }[];
};

export function RecipeSuggester({ ingredients }: RecipeSuggesterProps) {
  const [open, setOpen] = useState(false);
  const [recipe, setRecipe] = useState<SuggestRecipeOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
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

  const handleSave = async () => {
    if (!recipe) return;
    setIsSaving(true);
    const result = await saveFavoriteRecipe(recipe);
    if (result.success) {
      toast({
        title: "Recette sauvegardée !",
        description: `${recipe.recipeName} a été ajoutée à votre carnet.`,
      });
    } else {
      toast({
        variant: "destructive",
        title: result.code === 'firebase-not-configured' ? "Mode local" : "Erreur de sauvegarde",
        description: result.message,
      });
    }
    setIsSaving(false);
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setTimeout(() => {
        setRecipe(null);
        setIsLoading(false);
        setIsSaving(false);
      }, 300);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Sparkles className="h-4 w-4 text-accent sm:mr-2" />
          <span className="hidden sm:inline">Idée Recette</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Suggestion de Recette</DialogTitle>
          <DialogDescription>
            Laissez l'IA vous suggérer une recette à partir des ingrédients de
            votre liste.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 min-h-[24rem] flex items-center justify-center">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground">
                Recherche d'une recette...
              </p>
            </div>
          ) : recipe ? (
            <ScrollArea className="h-96 w-full">
              <div className="space-y-4 pr-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <ChefHat className="h-6 w-6 text-primary" />
                  {recipe.recipeName}
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <Wallet className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                        <div>
                            <h4 className="font-semibold">Coût estimé</h4>
                            <p className="text-muted-foreground">{recipe.estimatedCost.toFixed(2)} TND</p>
                        </div>
                    </div>
                     <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <HeartPulse className="h-5 w-5 text-destructive mt-1 flex-shrink-0" />
                        <div>
                            <h4 className="font-semibold">Analyse Nutritionnelle</h4>
                            <p className="text-muted-foreground text-xs">
                                Cal: {recipe.nutritionalAnalysis.calories} &bull; Prot: {recipe.nutritionalAnalysis.protein} &bull; Glu: {recipe.nutritionalAnalysis.carbs} &bull; Lip: {recipe.nutritionalAnalysis.fat}
                            </p>
                        </div>
                    </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Instructions:</h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    {recipe.instructions.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ol>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                        <h4 className="font-semibold mb-2">Ingrédients utilisés:</h4>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                            {recipe.usedIngredients.map((item, index) => (
                                <li key={index}>{item}</li>
                            ))}
                        </ul>
                    </div>
                    {recipe.missingIngredients && recipe.missingIngredients.length > 0 && (
                        <div>
                            <h4 className="font-semibold mb-2">Ingrédients manquants:</h4>
                            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                {recipe.missingIngredients.map((item, index) => (
                                    <li key={index}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
              </div>
            </ScrollArea>
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 text-center">
              <p className="text-muted-foreground px-4">
                {ingredients.length > 0
                  ? `Cliquez ci-dessous pour trouver une recette avec les ${ingredients.length} ingrédient(s) que vous avez sélectionné(s).`
                  : "Cochez des ingrédients dans votre liste pour obtenir une suggestion personnalisée. Sinon, nous vous proposerons une recette simple."}
              </p>
              <Button onClick={handleSuggest} disabled={isLoading}>
                <ChefHat className="mr-2 h-4 w-4" />
                {ingredients.length > 0 ? "Trouver une recette" : "Suggérer une recette simple"}
              </Button>
            </div>
          )}
        </div>
        <DialogFooter className="sm:justify-between gap-2">
           {recipe && (
              <Button variant="outline" onClick={handleSave} disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Bookmark className="mr-2 h-4 w-4" />}
                {isSaving ? "Enregistrement..." : "Sauvegarder"}
              </Button>
            )}
          <DialogClose asChild>
            <Button variant="outline" onClick={() => handleOpenChange(false)} className={!recipe ? 'w-full' : ''}>
              Fermer
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
