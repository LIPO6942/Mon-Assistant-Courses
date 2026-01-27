'use client';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Recipe } from '@/lib/types';
import { BookOpen, Trash2, Share2, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SavedRecipesSheetProps {
  recipes: Recipe[];
  onViewRecipe: (recipe: (Omit<Recipe, 'id'> & { id?: string })) => void;
  onDeleteRecipe: (recipeId: string) => void;
  onShareRecipe: (recipe: Recipe) => void;
}

export default function SavedRecipesSheet({
  recipes,
  onViewRecipe,
  onDeleteRecipe,
  onShareRecipe,
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
                <CardFooter className="flex flex-col gap-3 bg-card/50 p-3">
                  {recipe.searchLinks && recipe.searchLinks.length > 0 && (
                    <div className="flex flex-wrap gap-2 w-full">
                      {recipe.searchLinks.map((link, i) => {
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
                    </div>
                  )}
                  <div className="flex justify-between items-center w-full">
                    <Button size="sm" variant="secondary" className="h-8 text-xs px-4" onClick={() => onViewRecipe(recipe)}>
                      Détails
                    </Button>
                    <div className="flex items-center">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onShareRecipe(recipe)} aria-label="Partager la recette">
                        <Share2 className="h-4 w-4 text-primary" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDeleteRecipe(recipe.id)} aria-label="Supprimer la recette">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
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
