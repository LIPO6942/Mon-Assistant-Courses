'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BrainCircuit, Salad, X } from 'lucide-react';
import type { Recipe, RecipeIngredient } from '@/lib/types';

// The recipe object will be augmented with match details
type SuggestedRecipe = Recipe & {
  matchCount: number;
  missingIngredients: RecipeIngredient[];
};

interface ChandyekViewProps {
  selectedIngredients: string[];
  suggestions: SuggestedRecipe[];
  onViewRecipe: (recipe: Recipe) => void;
  onRemoveIngredient: (ingredient: string) => void;
  onClearIngredients: () => void;
}

export default function ChandyekView({
  selectedIngredients,
  suggestions,
  onViewRecipe,
  onRemoveIngredient,
  onClearIngredients
}: ChandyekViewProps) {
  
  return (
    <div className="space-y-8">
      <Card className="max-w-4xl mx-auto shadow-lg border-border/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center gap-2 mb-2">
            <Salad className="h-8 w-8 text-primary"/>
            <CardTitle className="text-3xl font-bold">Ch3andek?</CardTitle>
          </div>
          <CardDescription>
            Voici des suggestions de recettes basées sur les ingrédients que vous avez sélectionnés dans votre garde-manger.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold text-lg mb-3">Vos ingrédients sélectionnés :</h3>
            {selectedIngredients.length > 0 ? (
              <div className="flex flex-wrap gap-2 items-center">
                {selectedIngredients.map(ing => (
                  <Badge key={ing} variant="secondary" className="text-base py-1 pl-3 pr-2">
                    {ing}
                    <button onClick={() => onRemoveIngredient(ing)} className="ml-2 rounded-full hover:bg-muted-foreground/20 p-0.5 transition-colors">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                <Button variant="outline" size="sm" onClick={onClearIngredients}>Tout effacer</Button>
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <p>
                  Aucun ingrédient sélectionné.
                </p>
                <p className="text-sm mt-1">
                  Allez dans l'onglet "Garde-Manger" et cliquez sur l'icône <BrainCircuit className="inline h-4 w-4 mx-1" /> pour commencer.
                </p>
              </div>
            )}
          </div>

          {selectedIngredients.length > 0 && (
            <div>
              <h3 className="font-semibold text-lg mb-3">Recettes suggérées :</h3>
              {suggestions.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {suggestions.map((recipe) => (
                    <Card key={recipe.id} className="flex flex-col bg-secondary/30">
                      <CardHeader>
                        <CardTitle>{recipe.title}</CardTitle>
                        <Badge variant="outline" className="w-fit bg-card">
                          {recipe.matchCount} / {recipe.ingredients.length} ingrédients possédés
                        </Badge>
                      </CardHeader>
                      <CardContent className="flex-grow space-y-3">
                         <p className="text-sm text-muted-foreground">{recipe.description}</p>
                         {recipe.missingIngredients.length > 0 && (
                            <div>
                              <p className="text-sm font-semibold">Il vous manque :</p>
                              <ul className="text-xs text-muted-foreground list-disc list-inside">
                                {recipe.missingIngredients.map(ing => <li key={ing.name}>{ing.name}</li>)}
                              </ul>
                            </div>
                         )}
                      </CardContent>
                      <CardFooter>
                        <Button onClick={() => onViewRecipe(recipe)}>Voir la recette complète</Button>
                      </CardFooter>
                    </Card>
                  ))}
                 </div>
              ) : (
                <div className="text-center py-10 border-2 border-dashed rounded-lg">
                  <BrainCircuit className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 text-sm text-muted-foreground">Aucune recette dans notre base de données ne correspond à votre sélection.</p>
                  <p className="mt-1 text-sm text-muted-foreground">Essayez avec plus d'ingrédients ou des ingrédients différents.</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
