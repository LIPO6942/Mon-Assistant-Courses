'use client';

import type { GenerateShoppingListOutput, SuggestRecipeOutput } from '@/ai/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useState, useCallback, useTransition } from 'react';
import { ListPlus, ChefHat, ShoppingBasket, Trash2, Lightbulb, Loader2 } from 'lucide-react';
import type { generateShoppingList } from '@/ai/flows/generate-list-flow';
import type { suggestRecipe } from '@/ai/flows/suggest-recipe-flow';

type ShoppingItem = GenerateShoppingListOutput['items'][0] & { id: string };
type BasketItem = ShoppingItem;

interface KitchenAssistantPageProps {
  generateShoppingList: typeof generateShoppingList;
  suggestRecipe: typeof suggestRecipe;
}

export default function KitchenAssistantPage({
  generateShoppingList,
  suggestRecipe,
}: KitchenAssistantPageProps) {
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);
  const [basket, setBasket] = useState<BasketItem[]>([]);
  const [suggestedRecipe, setSuggestedRecipe] = useState<SuggestRecipeOutput | null>(null);
  const [prompt, setPrompt] = useState('');

  const [isGeneratingList, startListGeneration] = useTransition();
  const [isSuggestingRecipe, startRecipeSuggestion] = useTransition();

  const handleGenerateList = useCallback(async () => {
    if (!prompt) return;
    startListGeneration(async () => {
      const result = await generateShoppingList({ prompt });
      setShoppingList(result.items.map(item => ({ ...item, id: self.crypto.randomUUID() })));
    });
  }, [prompt, generateShoppingList]);

  const handleSuggestRecipe = useCallback(async () => {
    startRecipeSuggestion(async () => {
      const recipe = await suggestRecipe();
      setSuggestedRecipe(recipe);
    });
  }, [suggestRecipe]);

  const addToBasket = (item: ShoppingItem) => {
    setBasket(prev => [...prev, item]);
    setShoppingList(prev => prev.filter(i => i.id !== item.id));
  };

  const removeFromBasket = (item: BasketItem) => {
    setBasket(prev => prev.filter(i => i.id !== item.id));
  };
  
  const clearBasket = () => {
    setBasket([]);
  };

  const addRecipeIngredientsToList = () => {
    if (!suggestedRecipe) return;
    const recipeItems = suggestedRecipe.ingredients.map(ingredient => ({
      name: `${ingredient.name} (${ingredient.quantity}${ingredient.unit})`,
      category: 'Épicerie', // Default category
      id: self.crypto.randomUUID()
    }));
    setShoppingList(prev => [...prev, ...recipeItems]);
  };

  const groupedShoppingList = shoppingList.reduce((acc, item) => {
    const { category } = item;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, ShoppingItem[]>);


  return (
    <div className="min-h-screen bg-secondary/40">
      <header className="bg-background shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <ChefHat className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold tracking-tight">Mon Assistant Cuisine</h1>
            </div>
        </div>
      </header>

      <main className="container mx-auto p-4 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Colonne 1: Liste de Courses */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ListPlus/> Générer une Liste</CardTitle>
            <CardDescription>Décrivez un repas et laissez l'IA créer votre liste de courses.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Input 
                placeholder="Ex: ingrédients pour un couscous"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerateList()}
                disabled={isGeneratingList}
              />
              <Button onClick={handleGenerateList} disabled={isGeneratingList}>
                {isGeneratingList ? <Loader2 className="h-4 w-4 animate-spin" /> : "Créer"}
              </Button>
            </div>
            <ScrollArea className="h-[calc(100vh-280px)]">
              {Object.entries(groupedShoppingList).map(([category, items]) => (
                <div key={category} className="mb-4">
                  <h3 className="font-semibold mb-2 text-primary">{category}</h3>
                  <ul className="space-y-2">
                    {items.map(item => (
                      <li key={item.id} className="flex items-center justify-between bg-secondary/50 p-2 rounded-md">
                        <span>{item.name}</span>
                        <Button variant="ghost" size="sm" onClick={() => addToBasket(item)}>Ajouter</Button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
               {shoppingList.length === 0 && !isGeneratingList && (
                <p className="text-sm text-muted-foreground text-center mt-8">Votre liste de courses apparaîtra ici.</p>
               )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Colonne 2: Panier */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ShoppingBasket/> Mon Panier</CardTitle>
            <CardDescription>Les articles que vous avez sélectionnés.</CardDescription>
          </CardHeader>
          <CardContent>
              {basket.length > 0 && (
                <Button variant="outline" size="sm" className="mb-4" onClick={clearBasket}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Vider le panier
                </Button>
              )}
            <ScrollArea className="h-[calc(100vh-280px)]">
                {basket.length > 0 ? (
                    <ul className="space-y-2">
                        {basket.map(item => (
                        <li key={item.id} className="flex items-center justify-between bg-secondary/50 p-2 rounded-md">
                            <span>{item.name}</span>
                             <Button variant="ghost" size="icon" onClick={() => removeFromBasket(item)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-muted-foreground text-center mt-8">Votre panier est vide.</p>
                )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Colonne 3: Suggestion de Recette */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Lightbulb/> Suggestion du Chef</CardTitle>
            <CardDescription>En manque d'inspiration ? Laissez-nous vous surprendre.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleSuggestRecipe} disabled={isSuggestingRecipe} className="w-full mb-4">
              {isSuggestingRecipe ? <Loader2 className="h-4 w-4 animate-spin" /> : "Trouver une recette"}
            </Button>
            {suggestedRecipe && (
              <Card className="bg-secondary/50">
                <CardHeader>
                  <CardTitle>{suggestedRecipe.title}</CardTitle>
                  <Badge variant="outline">{suggestedRecipe.country}</Badge>
                  <CardDescription>{suggestedRecipe.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <h4 className="font-semibold mb-2">Ingrédients :</h4>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {suggestedRecipe.ingredients.map((ing, i) => (
                      <li key={i}>{ing.name} - {ing.quantity} {ing.unit}</li>
                    ))}
                  </ul>
                   <Button onClick={addRecipeIngredientsToList} className="w-full mt-4">Ajouter au courses</Button>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
