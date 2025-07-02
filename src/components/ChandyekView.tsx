
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BrainCircuit, Salad, X, Lightbulb, Loader2, Terminal, PlusCircle } from 'lucide-react';
import type { Recipe } from '@/lib/types';
import type { SuggestRecipeOutput } from '@/ai/types';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';

interface ChandyekViewProps {
  selectedIngredients: string[];
  aiSuggestions: SuggestRecipeOutput[];
  isLoading: boolean;
  error: string | null;
  onGenerate: () => void;
  onSaveRecipe: (recipe: SuggestRecipeOutput) => void;
  onViewRecipe: (recipe: SuggestRecipeOutput) => void;
  onRemoveIngredient: (ingredient: string) => void;
  onClearIngredients: () => void;
}

export default function ChandyekView({
  selectedIngredients,
  aiSuggestions,
  isLoading,
  error,
  onGenerate,
  onSaveRecipe,
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
            Sélectionnez des ingrédients dans votre garde-manger, puis laissez l'IA vous proposer des recettes créatives !
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
                <p>Aucun ingrédient sélectionné.</p>
                <p className="text-sm mt-1">
                  Allez dans l'onglet "Garde-Manger" et cliquez sur l'icône <BrainCircuit className="inline h-4 w-4 mx-1" /> pour commencer.
                </p>
              </div>
            )}
          </div>

          {selectedIngredients.length > 0 && (
            <div className='text-center'>
              <Button size="lg" onClick={onGenerate} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    L'IA réfléchit...
                  </>
                ) : (
                  <>
                    <Lightbulb className="mr-2 h-5 w-5" />
                    Générer des idées de recettes
                  </>
                )}
              </Button>
            </div>
          )}

          {error && (
            <Alert variant="destructive" className="mt-4">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Erreur de Génération</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {aiSuggestions.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold text-lg mb-3">Recettes suggérées par l'IA :</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {aiSuggestions.map((recipe, index) => (
                  <Card key={index} className="flex flex-col bg-secondary/30">
                    <CardHeader>
                      <CardTitle>{recipe.title}</CardTitle>
                      <div className="flex justify-between items-center text-sm text-muted-foreground">
                        <span>{recipe.country}</span>
                        <Badge variant="outline" className="bg-card">{recipe.calories} kcal</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-grow">
                       <p className="text-sm text-muted-foreground">{recipe.description}</p>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button onClick={() => onViewRecipe(recipe)}>Voir la recette</Button>
                      <Button variant="outline" onClick={() => onSaveRecipe(recipe)}><PlusCircle className='h-4 w-4 mr-2'/> Sauvegarder</Button>
                    </CardFooter>
                  </Card>
                ))}
               </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
