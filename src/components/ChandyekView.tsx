
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BrainCircuit, Salad, X, Lightbulb, Loader2, Terminal, PlusCircle, Clock, Coins, ExternalLink } from 'lucide-react';
import type { Recipe } from '@/lib/types';
import type { SuggestRecipeOutput } from '@/ai/types';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';
import { cn } from '@/lib/utils';

interface ChandyekViewProps {
  selectedIngredients: string[];
  aiSuggestions: SuggestRecipeOutput[];
  isLoading: boolean;
  error: string | null;
  onGenerate: (extraIngredient?: string) => void;
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
                        onClick={() => onGenerate(ing)}
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {aiSuggestions.map((recipe, index) => (
                  <Card key={index} className="flex flex-col bg-secondary/30 overflow-hidden border-primary/20 hover:border-primary/40 transition-colors">
                    {recipe.imageUrl && index === 0 && (
                      <div className="relative w-full h-48 bg-muted group">
                        <img
                          src={recipe.imageUrl}
                          alt={recipe.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-bottom p-4">
                          <Badge className="mt-auto bg-primary text-primary-foreground border-none">Chef's Choice</Badge>
                        </div>
                      </div>
                    )}

                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start gap-2">
                        <CardTitle className="text-lg font-bold leading-tight line-clamp-2">{recipe.title}</CardTitle>
                        <Badge variant="outline" className="shrink-0">{recipe.country}</Badge>
                      </div>
                      <CardDescription className="line-clamp-2 text-xs">{recipe.description}</CardDescription>
                    </CardHeader>

                    <CardContent className="flex-grow pb-2">
                      <div className="space-y-2">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Ingrédients utilisés :</p>
                        <div className="flex flex-wrap gap-1">
                          {recipe.ingredients.slice(0, 6).map((ing, i) => (
                            <Badge key={i} variant="secondary" className="px-1 py-0 text-[10px] font-normal lowercase bg-secondary/50">
                              {ing.name}
                            </Badge>
                          ))}
                          {recipe.ingredients.length > 6 && (
                            <span className="text-[10px] text-muted-foreground">+{recipe.ingredients.length - 6}...</span>
                          )}
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter className="flex flex-col gap-2 pt-2 border-t border-primary/5">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground w-full">Cuisiner sur :</p>
                      <div className="flex flex-wrap gap-2 w-full">
                        {(recipe.searchLinks || []).map((link, i) => {
                          const isYouTube = link.label.toLowerCase() === 'youtube';
                          const isTikTok = link.label.toLowerCase() === 'tiktok';
                          const isGoogle = link.label.toLowerCase() === 'google';

                          return (
                            <Button
                              key={i}
                              variant="outline"
                              size="sm"
                              className={cn(
                                "flex-1 h-8 text-[10px] gap-1 py-1 transition-all duration-300 font-bold",
                                isYouTube && "bg-[#FF0000] hover:bg-[#CC0000] text-white border-none shadow-sm",
                                isTikTok && "bg-black hover:bg-zinc-800 text-white border-none shadow-sm",
                                isGoogle && "bg-gradient-to-r from-blue-500/10 via-red-500/10 to-yellow-500/10 border-primary/10 hover:border-primary/30"
                              )}
                              asChild
                            >
                              <a href={link.url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className={cn("h-3 w-3", (isYouTube || isTikTok) && "text-white")} />
                                {link.label}
                              </a>
                            </Button>
                          );
                        })}
                        {!recipe.searchLinks && recipe.searchUrl && (
                          <Button variant="outline" size="sm" className="flex-1 h-8 text-xs gap-1" asChild>
                            <a href={recipe.searchUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3" />
                              Google
                            </a>
                          </Button>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full h-8 text-[10px] text-muted-foreground hover:text-primary transition-colors gap-1"
                        onClick={() => onSaveRecipe(recipe)}
                      >
                        <PlusCircle className='h-3 w-3' />
                        Enregistrer l'idée
                      </Button>
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
