
"use client";

import { useState, useCallback } from "react";
import {
  suggestCountryRecipe,
  SuggestCountryRecipeOutput,
  SuggestCountryRecipeInput,
} from "@/ai/flows/suggest-country-recipe";
import { saveFavoriteRecipe } from "@/services/recipes";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "./ui/scroll-area";
import { Loader2, ChefHat, Palette, RefreshCw, Bookmark, Globe } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";


type CountryRecipeSuggesterProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const continentConfig = [
  { value: "Europe", label: "Europe", color: "bg-blue-600" },
  { value: "Asie", label: "Asie", color: "bg-yellow-400" },
  { value: "Afrique", label: "Afrique", color: "bg-black" },
  { value: "Amérique", label: "Amériques", color: "bg-red-600" },
  { value: "Océanie", label: "Océanie", color: "bg-green-600" },
];

export function CountryRecipeSuggester({ open, onOpenChange }: CountryRecipeSuggesterProps) {
  const [suggestion, setSuggestion] = useState<SuggestCountryRecipeOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedContinent, setSelectedContinent] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSuggest = useCallback(async (continent: string) => {
    setSelectedContinent(continent);
    setIsLoading(true);
    setSuggestion(null);
    try {
      const input: SuggestCountryRecipeInput = { continent };
      const result = await suggestCountryRecipe(input);
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
  }, [toast]);

  const handleSave = async () => {
    if (!suggestion) return;
    setIsSaving(true);
    try {
      await saveFavoriteRecipe(suggestion);
      toast({
        title: "Recette sauvegardée !",
        description: `${suggestion.recipeName} a été ajoutée à votre carnet.`,
      });
    } catch (error) {
      console.error("Failed to save recipe:", error);
      toast({
        variant: "destructive",
        title: "Erreur de sauvegarde",
        description: "La recette n'a pas pu être sauvegardée.",
      });
    } finally {
      setIsSaving(false);
    }
  };


  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen);
    if (!isOpen) {
      setTimeout(() => {
        setSuggestion(null);
        setIsLoading(false);
        setSelectedContinent(null);
      }, 300);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Suggestion du Globe-Trotter</DialogTitle>
          <div className="flex justify-center items-center gap-3 pt-4">
            {continentConfig.map((continent) => (
              <TooltipProvider key={continent.value} delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => !isLoading && handleSuggest(continent.value)}
                      className={cn(
                        "h-10 w-10 rounded-full flex items-center justify-center font-bold transition-transform duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring",
                        continent.color,
                        selectedContinent === continent.value
                          ? "ring-2 ring-offset-2 ring-primary scale-110 shadow-lg"
                          : "hover:scale-110",
                        isLoading ? "cursor-not-allowed opacity-60 pointer-events-none" : ""
                      )}
                      aria-label={continent.label}
                    >
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{continent.label}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
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
               <Globe className="h-12 w-12 text-muted-foreground/50" />
               <p className="text-muted-foreground px-4 font-medium">
                  Envie d’évasion ? 🌍 <br/> Clique sur un continent et découvre ce que l’on cuisine ailleurs.
              </p>
            </div>
          )}
        </div>
        <DialogFooter className="sm:justify-between gap-2">
          <div className="flex gap-2">
              <Button variant="secondary" onClick={() => selectedContinent && handleSuggest(selectedContinent)} disabled={isLoading || !selectedContinent}>
                <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Nouvelle Suggestion
              </Button>
              {suggestion && (
                <Button variant="outline" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Bookmark className="mr-2 h-4 w-4" />}
                  {isSaving ? "Enregistrement..." : "Sauvegarder"}
                </Button>
              )}
          </div>
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
