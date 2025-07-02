'use client';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Recipe } from '@/lib/types';
import { BookOpen, Trash2 } from 'lucide-react';

interface SavedRecipesSheetProps {
  recipes: Recipe[];
  onViewRecipe: (recipe: (Omit<Recipe, 'id'> & { id?: string })) => void;
  onDeleteRecipe: (recipeId: string) => void;
}

export default function SavedRecipesSheet({
  recipes,
  onViewRecipe,
  onDeleteRecipe,
}: SavedRecipesSheetProps) {
  return (
    <SheetContent className="flex flex-col w-full sm:max-w-lg">
      <SheetHeader>
        <SheetTitle>Mes Recettes Sauvegardées</SheetTitle>
      </SheetHeader>
      
      <ScrollArea className="flex-grow my-4 pr-4">
        {recipes.length > 0 ? (
          <div className="space-y-4">
            {recipes.map(recipe => (
              <Card key={recipe.id} className="overflow-hidden bg-secondary/50">
                <CardHeader className="p-4">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg pr-2">{recipe.title}</CardTitle>
                    <Badge variant="outline" className="whitespace-nowrap bg-card">{recipe.calories} kcal</Badge>
                  </div>
                   <Badge variant="secondary" className="w-fit mt-1">{recipe.country}</Badge>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-sm text-muted-foreground line-clamp-2">{recipe.description}</p>
                </CardContent>
                <CardFooter className="flex justify-between bg-card/50 p-3">
                  <Button size="sm" onClick={() => onViewRecipe(recipe)}>Voir la recette</Button>
                  <Button variant="ghost" size="icon" onClick={() => onDeleteRecipe(recipe.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-sm text-muted-foreground">Aucune recette sauvegardée.</p>
            <p className="mt-1 text-sm text-muted-foreground">Sauvegardez une recette pour la retrouver ici.</p>
          </div>
        )}
      </ScrollArea>
    </SheetContent>
  );
}
