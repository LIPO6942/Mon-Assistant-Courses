"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import { Skeleton } from "./ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { getFavoriteRecipes, deleteFavoriteRecipe, FavoriteRecipe } from "@/services/recipes";
import { ChefHat, Globe, Trash2, Loader2, BookHeart } from "lucide-react";

type FavoriteRecipesProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function FavoriteRecipes({ open, onOpenChange }: FavoriteRecipesProps) {
  const [recipes, setRecipes] = useState<FavoriteRecipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchRecipes = useCallback(async () => {
    setIsLoading(true);
    try {
      const savedRecipes = await getFavoriteRecipes();
      setRecipes(savedRecipes);
    } catch (error: any) {
      if (error.code !== 'unavailable') {
        toast({
            variant: "destructive",
            title: "Erreur de chargement",
            description: "Impossible de charger les recettes sauvegardées.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (open) {
      fetchRecipes();
    }
  }, [open, fetchRecipes]);
  
  const handleDelete = async (recipeId: string) => {
      setIsDeleting(recipeId);
      try {
          await deleteFavoriteRecipe(recipeId);
          setRecipes(prev => prev.filter(r => r.id !== recipeId));
          toast({
              title: "Recette supprimée",
              description: "La recette a bien été retirée de votre carnet.",
          });
      } catch (error: any) {
          console.error("Failed to delete recipe:", error);
           if (error.code === 'firebase-not-configured') {
            toast({
                variant: "destructive",
                title: "Mode local",
                description: error.message,
            });
          } else {
            toast({
              variant: "destructive",
              title: "Erreur",
              description: "La recette n'a pas pu être supprimée.",
            });
          }
      } finally {
          setIsDeleting(null);
      }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Mon Carnet de Recettes</SheetTitle>
          <SheetDescription>
            Retrouvez ici toutes les recettes que vous avez sauvegardées.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto -mx-6 px-6 py-4">
          {isLoading ? (
            <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
          ) : recipes.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {recipes.map((recipe) => (
                <AccordionItem value={recipe.id} key={recipe.id}>
                  <AccordionTrigger>
                    <div className="flex items-center gap-3 text-left">
                        {recipe.source === 'country' ? <Globe className="h-5 w-5 text-primary"/> : <ChefHat className="h-5 w-5 text-primary"/>}
                        <span className="flex-1">{recipe.name}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pl-2">
                        {recipe.country && (
                             <p className="text-sm text-primary font-semibold">{recipe.theme} ({recipe.country})</p>
                        )}
                        <div>
                            <h4 className="font-semibold mb-2">Ingrédients :</h4>
                            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                                {recipe.ingredients.map((item, index) => (
                                <li key={index}>{item}</li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2">Préparation :</h4>
                            <ol className="list-decimal list-inside space-y-2 text-sm">
                                {recipe.instructions.map((step, index) => (
                                <li key={index}>{step}</li>
                                ))}
                            </ol>
                        </div>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm" className="w-full" disabled={isDeleting === recipe.id}>
                                    {isDeleting === recipe.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Trash2 className="mr-2 h-4 w-4" />}
                                    Supprimer
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Cette action est irréversible. La recette "{recipe.name}" sera supprimée définitivement.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(recipe.id)}>Confirmer</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
             <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
                <BookHeart className="h-16 w-16 mb-4 text-muted-foreground/50"/>
                <p className="text-lg font-semibold">Votre carnet est vide.</p>
                <p className="mt-1 text-sm">Sauvegardez des recettes pour les retrouver ici.</p>
            </div>
          )}
        </div>
        <SheetFooter>
            <SheetClose asChild>
                <Button variant="outline" className="w-full">Fermer</Button>
            </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
