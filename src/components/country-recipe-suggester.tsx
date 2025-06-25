
"use client";

import { useState } from "react";
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
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "./ui/scroll-area";
import { Loader2, Globe, ChefHat, Palette, PartyPopper } from "lucide-react";

export function CountryRecipeSuggester() {
  const [open, setOpen] = useState(false);
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

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setTimeout(() => {
        setSuggestion(null);
        setIsLoading(false);
      }, 300);
    }
  };

  return (
    <Card>
        <CardHeader>
            <div className="flex items-center gap-3">
                <Globe className="h-6 w-6 text-primary"/>
                <CardTitle>Recette du Monde</CardTitle>
            </div>
            <CardDescription>
                Laissez-vous surprendre par une recette venue d'ailleurs !
            </CardDescription>
        </CardHeader>
        <CardContent>
            <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button className="w-full" variant="outline">
                    <PartyPopper className="mr-2 h-4 w-4 text-accent" />
                    Me surprendre !
                </Button>
            </DialogTrigger>
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
                            Prêt pour un voyage culinaire inattendu ? Cliquez sur le bouton pour recevoir une recette aléatoire d'un pays du monde.
                        </p>
                        <Button onClick={handleSuggest} disabled={isLoading}>
                            <Globe className="mr-2 h-4 w-4" />
                            Lancer la recherche
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
        </CardContent>
    </Card>
  );
}
