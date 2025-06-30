
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Trash2 } from 'lucide-react';
import type { Recipe } from '@/lib/types';

interface RecipesViewProps {
  savedRecipes: Recipe[];
  setViewingRecipe: (recipe: Recipe | null) => void;
  setSavedRecipes: (recipes: Recipe[] | ((prev: Recipe[]) => Recipe[])) => void;
}

export default function RecipesView({
  savedRecipes,
  setViewingRecipe,
  setSavedRecipes,
}: RecipesViewProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className='text-2xl font-bold mb-4'>Mes Recettes Sauvegardées</h2>
        {savedRecipes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedRecipes.map(recipe => (
              <Card key={recipe.id} className="overflow-hidden flex flex-col">
                <CardHeader>
                  <CardTitle>{recipe.title}</CardTitle>
                  <Badge variant="secondary" className="mt-2 w-fit">{recipe.country}</Badge>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground">{recipe.description}</p>
                </CardContent>
                <CardFooter className="flex justify-between mt-auto bg-secondary/30 pt-4">
                  <Button onClick={() => setViewingRecipe(recipe)}>Voir la recette</Button>
                  <Button variant="ghost" size="icon" onClick={() => setSavedRecipes(prev => prev.filter(r => r.id !== recipe.id))}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 border-2 border-dashed rounded-lg">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-sm text-muted-foreground">Aucune recette sauvegardée pour le moment.</p>
            <p className="mt-1 text-sm text-muted-foreground">La fonctionnalité de suggestion sera bientôt de retour !</p>
          </div>
        )}
      </div>
    </div>
  );
}
