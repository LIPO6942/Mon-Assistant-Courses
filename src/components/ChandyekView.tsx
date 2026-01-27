
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BrainCircuit, Salad, X, Lightbulb, Loader2, Terminal, PlusCircle, Clock, Coins } from 'lucide-react';
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
            <Salad className="h-8 w-8 text-primary" />
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
            <>
              <div className='mt-6'>
                <h3 className="font-semibold text-base mb-3">Avez-vous des ingrédients phares ? (optionnel)</h3>
                <p className="text-sm text-muted-foreground mb-3">Sélectionnez les ingrédients principaux que vous souhaitez privilégier dans les recettes :</p>
                <div className="flex flex-wrap gap-2">
                  {['Poulet', 'Bœuf', 'Agneau', 'Poisson', 'Crevettes', 'Œufs', 'Tofu', 'Lentilles', 'Pois chiches'].map(ing => {
                    // Check if this specific ingredient or its generic category is already selected
                    const isSpecificSelected = selectedIngredients.some(i => i.toLowerCase() === ing.toLowerCase());
                    const isCategorySelected = (ing === 'Poulet' || ing === 'Bœuf' || ing === 'Agneau') &&
                      selectedIngredients.some(i => i.toLowerCase() === 'viande' || i.toLowerCase() === 'viandes');

                    if (isSpecificSelected || isCategorySelected) return null;

                    return (
                      <Badge
                        key={ing}
                        variant="outline"
                        className="cursor-pointer transition-all hover:bg-secondary"
                        onClick={() => onGenerate()} // Trigger generation or we could just allow clicking to add it to some keyIngredients state if we had it, but here it seems to just be a suggestion list. 
                      // Wait, looking at the previous code, clicking it called onRemoveIngredient(ing) which is counter-intuitive for a "select" list.
                      // Actually, looking at line 87: onClick={() => onRemoveIngredient(ing)}
                      // If it's selected, it should be removable. But the request says "ne plus afficher la proposition boeuf".
                      // So if it's already there (selected), we hide it.
                      >
                        {ing}
                      </Badge>
                    );
                  })}
                </div>
              </div>

              <div className='text-center mt-6'>
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
            </>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {aiSuggestions.map((recipe, index) => (
                  <Card key={index} className="flex flex-col bg-secondary/30 overflow-hidden">
                    {recipe.imageUrl && index === 0 && (
                      <div className="relative w-full h-48 bg-muted group">
                        <img
                          src={recipe.imageUrl}
                          alt={recipe.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          loading="lazy"
                          onError={(e) => {
                            // Hide image if it fails to load
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                          <span className="text-white text-sm font-medium">✨ Suggestion IA</span>
                        </div>
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle>{recipe.title}</CardTitle>
                      <div className="flex items-center flex-wrap gap-2 mt-2 text-sm text-muted-foreground">
                        <Badge variant="secondary" className="w-fit">{recipe.country}</Badge>
                        <Badge variant="outline" className="flex items-center gap-1 bg-card"><Clock className="h-3 w-3" />{recipe.preparationTime} min</Badge>
                        {recipe.isEconomical && <Badge variant="outline" className="flex items-center gap-1 bg-card"><Coins className="h-3 w-3" />Éco</Badge>}
                        <Badge variant="outline" className="bg-card">{recipe.calories} kcal</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-sm text-muted-foreground whitespace-pre-line">{recipe.description}</p>
                    </CardContent>
                    <CardFooter className="flex justify-between items-center gap-2">
                      <Button onClick={() => onViewRecipe(recipe)}>Voir la recette</Button>
                      <Button variant="outline" size="icon" onClick={() => onSaveRecipe(recipe)}><PlusCircle className='h-4 w-4' /></Button>
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
