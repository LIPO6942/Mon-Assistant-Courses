
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Dices, Trash2 } from 'lucide-react';
import type { Recipe } from '@/lib/types';

interface RecipesViewProps {
  savedRecipes: Recipe[];
  handleShowSuggestion: () => void;
  setIsDecisionWheelOpen: (isOpen: boolean) => void;
  setViewingRecipe: (recipe: Recipe | null) => void;
  setSavedRecipes: (recipes: Recipe[] | ((prev: Recipe[]) => Recipe[])) => void;
}

export default function RecipesView({
  savedRecipes,
  handleShowSuggestion,
  setIsDecisionWheelOpen,
  setViewingRecipe,
  setSavedRecipes,
}: RecipesViewProps) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className='lg:col-span-1 bg-gradient-to-br from-primary/80 to-primary text-primary-foreground text-center p-6 flex flex-col'>
          <CardHeader className="flex-grow">
            <CardTitle>À la recherche d'inspiration ?</CardTitle>
            <CardDescription className="text-primary-foreground/80 pt-2">Laissez notre chef vous proposer un plat savoureux !</CardDescription>
          </CardHeader>
          <CardContent>
            <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={handleShowSuggestion}>Suggestion du Chef</Button>
          </CardContent>
        </Card>
        <Card className="lg:col-span-1 bg-gradient-to-br from-accent/80 to-accent text-accent-foreground text-center p-6 flex flex-col">
          <CardHeader className="flex-grow">
            <CardTitle>J'ai pas envie de cuisiner</CardTitle>
            <CardDescription className="text-accent-foreground/80 pt-2">Laissez le hasard décider pour vous !</CardDescription>
          </CardHeader>
          <CardContent>
            <Button size="lg" variant="secondary" className="bg-background/20 hover:bg-background/30" onClick={() => { setIsDecisionWheelOpen(true); }}>
              <Dices className="mr-2 h-5 w-5" />Roue de la Flemme
            </Button>
          </CardContent>
        </Card>
      </div>

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
            <p className="mt-1 text-sm text-muted-foreground">Utilisez la "Suggestion du Chef" pour en découvrir !</p>
          </div>
        )}
      </div>
    </div>
  );
}
