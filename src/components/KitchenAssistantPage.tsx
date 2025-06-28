'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter
} from "@/components/ui/sheet";
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
} from "@/components/ui/alert-dialog";
import { ChefHat, ShoppingCart, Sparkles, Plus, Trash2, Loader2, Minus, Tag } from 'lucide-react';

import type { GenerateShoppingListInput, GenerateShoppingListOutput, SuggestRecipeOutput } from '@/ai/types';
import { categories } from '@/ai/types';


type ShoppingItem = {
  name: string;
  category: typeof categories[number];
};

type CartItem = ShoppingItem & {
  quantity: number;
  price: number;
};

const initialShoppingList: ShoppingItem[] = [
    { name: 'Pommes', category: 'Fruits et Légumes' },
    { name: 'Poulet', category: 'Viandes et Poissons' },
    { name: 'Lait', category: 'Produits Laitiers' },
    { name: 'Pain de campagne', category: 'Boulangerie' },
    { name: 'Pâtes complètes', category: 'Épicerie' },
    { name: 'Jus d\'orange', category: 'Boissons' },
    { name: 'Liquide vaisselle', category: 'Maison' },
];

interface KitchenAssistantPageProps {
  generateShoppingListAction: (input: GenerateShoppingListInput) => Promise<GenerateShoppingListOutput>;
  suggestRecipeAction: () => Promise<SuggestRecipeOutput>;
}

export default function KitchenAssistantPage({ generateShoppingListAction, suggestRecipeAction }: KitchenAssistantPageProps) {
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [budget, setBudget] = useState<number>(100);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestedRecipe, setSuggestedRecipe] = useState<SuggestRecipeOutput | null>(null);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    try {
      const savedList = localStorage.getItem('shoppingList');
      const savedCart = localStorage.getItem('cart');
      const savedBudget = localStorage.getItem('budget');

      if (savedList) {
        setShoppingList(JSON.parse(savedList));
      } else {
        setShoppingList(initialShoppingList);
      }
      if (savedCart) setCart(JSON.parse(savedCart));
      if (savedBudget) setBudget(JSON.parse(savedBudget));
    } catch (e) {
      console.error("Échec du chargement depuis localStorage", e);
      setShoppingList(initialShoppingList);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('shoppingList', JSON.stringify(shoppingList));
    } catch (e) {
      console.error("Échec de la sauvegarde de shoppingList dans localStorage", e);
    }
  }, [shoppingList]);

  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(cart));
    } catch (e)
      {
      console.error("Échec de la sauvegarde du panier dans localStorage", e);
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('budget', JSON.stringify(budget));
    } catch (e) {
      console.error("Échec de la sauvegarde du budget dans localStorage", e);
    }
  }, [budget]);

  const handleAddToCart = (item: ShoppingItem) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.name === item.name);
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.name === item.name ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
        );
      } else {
        return [...prevCart, { ...item, quantity: 1, price: 0 }];
      }
    });
  };

  const handleRemoveFromCart = (itemName: string) => {
    setCart(prevCart => prevCart.filter(item => item.name !== itemName));
  };
  
  const handleQuantityChange = (itemName: string, amount: number) => {
    setCart(prevCart =>
      prevCart.map(item =>
        item.name === itemName
          ? { ...item, quantity: Math.max(0, item.quantity + amount) }
          : item
      ).filter(item => item.quantity > 0)
    );
  };
  
  const handlePriceChange = (itemName: string, newPrice: number) => {
      setCart(prevCart =>
          prevCart.map(item =>
              item.name === itemName ? { ...item, price: newPrice } : item
          )
      );
  };

  const handleSuggestRecipe = async () => {
    setIsSuggesting(true);
    setSuggestedRecipe(null);
    setError(null);
    try {
      const recipe = await suggestRecipeAction();
      setSuggestedRecipe(recipe);
    } catch (e: any) {
      console.error("Erreur lors de la suggestion de recette :", e);
      setError(e.message || "Une erreur est survenue lors de la suggestion de recette.");
    } finally {
      setIsSuggesting(false);
    }
  };
  
  const addRecipeIngredientsToShoppingList = () => {
    if (!suggestedRecipe) return;

    const newItems = suggestedRecipe.ingredients.map(ingredient => ({
      name: `${ingredient.name} (${ingredient.quantity}${ingredient.unit})`,
      category: 'Épicerie' as const
    }));
    
    setShoppingList(prevList => {
        const existingNames = new Set(prevList.map(item => item.name));
        const uniqueNewItems = newItems.filter(item => !existingNames.has(item.name));
        return [...prevList, ...uniqueNewItems];
    });

    setSuggestedRecipe(null);
  };


  const handleGenerateList = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    setError(null);
    try {
      const result = await generateShoppingListAction({ prompt });
      if (result && result.items) {
        setShoppingList(prevList => {
           const existingNames = new Set(prevList.map(item => item.name));
           const uniqueNewItems = result.items.filter(item => !existingNames.has(item.name));
           return [...prevList, ...uniqueNewItems];
        });
      }
      setPrompt('');
    } catch (e: any) {
      console.error("Erreur lors de la génération de la liste :", e);
      setError(e.message || "Une erreur est survenue lors de la génération de la liste.");
    } finally {
      setIsGenerating(false);
    }
  };

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const remainingBudget = budget - total;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
          <div className="flex gap-2 items-center">
             <ChefHat className="h-6 w-6 text-primary" />
             <h1 className="text-2xl font-bold tracking-tight">Mon Assistant Cuisine</h1>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-2">
            
            <AlertDialog open={isSuggesting || !!suggestedRecipe || !!error} onOpenChange={(open) => { if (!open) { setSuggestedRecipe(null); setError(null); }}}>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" onClick={handleSuggestRecipe}>
                  <Sparkles className="h-5 w-5 text-accent" />
                  <span className="sr-only">Surprends-moi</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                {isSuggesting && (
                  <div className="flex flex-col items-center justify-center space-y-4 p-8">
                     <Loader2 className="h-16 w-16 animate-spin text-primary" />
                     <p className="text-muted-foreground">Recherche d'une recette succulente...</p>
                  </div>
                )}
                {error && !isSuggesting && (
                   <>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Erreur</AlertDialogTitle>
                      <AlertDialogDescription>
                        {error}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogAction onClick={() => setError(null)}>Fermer</AlertDialogAction>
                    </AlertDialogFooter>
                   </>
                )}
                {suggestedRecipe && !isSuggesting && (
                  <>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{suggestedRecipe.title} ({suggestedRecipe.country})</AlertDialogTitle>
                      <AlertDialogDescription>
                        {suggestedRecipe.description}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div>
                        <h4 className="font-semibold mb-2">Ingrédients :</h4>
                        <ul className="list-disc list-inside text-sm text-muted-foreground">
                            {suggestedRecipe.ingredients.map((ing, index) => (
                                <li key={index}>{ing.name} - {ing.quantity} {ing.unit}</li>
                            ))}
                        </ul>
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setSuggestedRecipe(null)}>Fermer</AlertDialogCancel>
                      <AlertDialogAction onClick={addRecipeIngredientsToShoppingList}>
                        <Plus className="mr-2 h-4 w-4" /> Ajouter à ma liste
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </>
                )}
              </AlertDialogContent>
            </AlertDialog>


            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {cart.length > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
                      {cart.length}
                    </span>
                  )}
                  <span className="sr-only">Ouvrir le panier</span>
                </Button>
              </SheetTrigger>
              <SheetContent className="flex flex-col h-full">
                <SheetHeader>
                  <SheetTitle>Mon Panier</SheetTitle>
                </SheetHeader>
                <div className="flex-grow overflow-y-auto py-4">
                  {cart.length === 0 ? (
                    <p className="text-muted-foreground text-center pt-10">Votre panier est vide.</p>
                  ) : (
                    <div className="space-y-4">
                      {cart.map(item => (
                        <div key={item.name} className="flex items-center gap-4 p-2 rounded-lg border">
                           <div className="flex-grow">
                             <p className="font-semibold">{item.name}</p>
                             <div className="flex items-center gap-2 mt-1">
                                <Tag className="h-4 w-4 text-muted-foreground" />
                                <Input 
                                   type="number"
                                   value={item.price}
                                   onChange={(e) => handlePriceChange(item.name, parseFloat(e.target.value) || 0)}
                                   className="h-8 w-24"
                                   placeholder="Prix"
                                />
                                <span>DT</span>
                             </div>
                           </div>
                           <div className="flex items-center gap-2">
                             <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => handleQuantityChange(item.name, -1)}>
                               <Minus className="h-4 w-4" />
                             </Button>
                             <span className="w-4 text-center">{item.quantity}</span>
                             <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => handleQuantityChange(item.name, 1)}>
                               <Plus className="h-4 w-4" />
                             </Button>
                           </div>
                           <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleRemoveFromCart(item.name)}>
                             <Trash2 className="h-4 w-4 text-destructive" />
                           </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <SheetFooter className="border-t pt-4">
                  <div className="w-full space-y-4">
                    <div className="flex items-center gap-2">
                       <Label htmlFor="budget" className="whitespace-nowrap">Mon Budget :</Label>
                       <Input 
                         id="budget"
                         type="number"
                         value={budget}
                         onChange={(e) => setBudget(parseFloat(e.target.value) || 0)}
                         className="h-9"
                       />
                       <span>DT</span>
                    </div>
                     <div className="flex justify-between font-semibold text-base">
                        <span>Total</span>
                        <span>{total.toFixed(2)} DT</span>
                    </div>
                    <div className={`flex justify-between font-semibold text-base ${remainingBudget < 0 ? 'text-destructive' : 'text-green-600'}`}>
                        <span>Restant</span>
                        <span>{remainingBudget.toFixed(2)} DT</span>
                    </div>
                  </div>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      
      <main className="container py-8 space-y-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Générer une liste de courses avec l'IA</CardTitle>
            <CardDescription>Décrivez ce que vous voulez cuisiner (ex: "des crêpes pour 4 personnes") et laissez l'IA créer votre liste.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ex: un gâteau au chocolat"
                disabled={isGenerating}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerateList()}
              />
              <Button onClick={handleGenerateList} disabled={!prompt || isGenerating}>
                {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Générer
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map(category => {
              const itemsInCategory = shoppingList.filter(item => item.category === category);
              if (itemsInCategory.length === 0) return null;

              return (
                <Card key={category} className="shadow-lg flex flex-col">
                  <CardHeader>
                    <CardTitle>{category}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <ul className="space-y-2">
                      {itemsInCategory.map(item => (
                        <li key={item.name} className="flex items-center justify-between p-2 rounded-md hover:bg-secondary">
                          <span>{item.name}</span>
                          <Button size="sm" variant="ghost" onClick={() => handleAddToCart(item)}>
                            <Plus className="h-4 w-4 mr-1"/> Ajouter
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )
            })}
        </div>
      </main>
    </div>
  );
}
