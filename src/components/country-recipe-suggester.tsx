
"use client";

import { useState, useEffect } from "react";
import {
  suggestCountryRecipe,
  SuggestCountryRecipeOutput,
} from "@/ai/flows/suggest-country-recipe";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "./ui/scroll-area";
import { Loader2, ChefHat, Palette } from "lucide-react";

type CountryRecipeSuggesterProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CountryRecipeSuggester({ open, onOpenChange }: CountryRecipeSuggesterProps) {
  const [suggestion, setSuggestion] = useState<SuggestCountryRecipeOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSuggest = async () => {
    setIsLoading(true);
    setSuggestion(null);
    try {
      const result = await suggestCountryRecipe();
      setSuggestion(result);
    } catch (error) {
      console.error("Failed to suggest country recipe:", error);
      toast({
        variant: "destructive",
        title: "Erreur de suggestion",
        description: "Impossible de récupérer une recette du monde. Veuillez réessayer.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      handleSuggest();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen);
    if (!isOpen) {
      setTimeout(() => {
        setSuggestion(null);
        setIsLoading(false);
      }, 300);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Suggestion du Globe-Trotter</DialogTitle>
          <DialogDescription>
            Une recette choisie au hasard, juste pour vous.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 min-h-[24rem] flex items-center justify-center">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground">
                Le chef parcourt le monde...
              </p>
            </div>
          ) : suggestion ? (
            <ScrollArea className="h-96 w-full">
              <div className="space-y-4 pr-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <ChefHat className="h-6 w-6 text-primary" />
                  {suggestion.recipeName} ({suggestion.country})
                </h3>
                <p className="text-sm text-primary font-semibold -mt-1 mb-2">{suggestion.theme}</p>
                
                <div>
                  <h4 className="font-semibold mb-2">Ingrédients :</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {suggestion.ingredients.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Préparation :</h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    {suggestion.instructions.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ol>
                </div>
                
                <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/10">
                  <Palette className="h-5 w-5 text-accent mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Déco & Ambiance</h4>
                    <p className="text-muted-foreground text-xs italic">
                      {suggestion.decorationIdea}
                    </p>
                  </div>
                </div>
              </div>
            </ScrollArea>
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 text-center">
              <p className="text-muted-foreground px-4">
                  La suggestion est en cours de chargement...
              </p>
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
