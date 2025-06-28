'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog"

import { ChefHat, ShoppingCart, Sparkles, Trash2, Plus, Minus, Loader2, AlertCircle, UtensilsCrossed, Dices } from 'lucide-react';
import { suggestRecipe, type SuggestRecipeOutput } from '@/ai/flows/suggest-recipe-flow';

// Data structures
type Ingredient = {
  name: string;
  price: number;
  unit: string;
  category: 'Légumes' | 'Viandes' | 'Épicerie' | 'Produits Laitiers' | 'Boulangerie';
};

type CartItem = Ingredient & {
  quantity: number;
};

// "Database" of available ingredients
const availableIngredients: Ingredient[] = [
    { name: 'Poulet', price: 1200, unit: 'kg', category: 'Viandes' },
    { name: 'Viande hachée', price: 1800, unit: 'kg', category: 'Viandes' },
    { name: 'Tomates', price: 150, unit: 'kg', category: 'Légumes' },
    { name: 'Oignons', price: 80, unit: 'kg', category: 'Légumes' },
    { name: 'Ail', price: 500, unit: 'kg', category: 'Légumes' },
    { name: 'Riz', price: 200, unit: 'kg', category: 'Épicerie' },
    { name: 'Pâtes', price: 120, unit: 'kg', category: 'Épicerie' },
    { name: 'Huile d\'olive', price: 950, unit: 'litre', category: 'Épicerie' },
    { name: 'Fromage', price: 1500, unit: 'kg', category: 'Produits Laitiers' },
    { name: 'Yaourt', price: 50, unit: 'pièce', category: 'Produits Laitiers' },
    { name: 'Pain', price: 20, unit: 'pièce', category: 'Boulangerie' },
    { name: 'Baguette', price: 15, unit: 'pièce', category: 'Boulangerie' },
];

const lazyOptions = ['Maqloub', 'Pizza', 'Burrito', 'Tacos Mexicain', 'Tacos Français', 'Baguette Farcie'];

// Group ingredients by category
const ingredientsByCategory = availableIngredients.reduce((acc, ingredient) => {
  const { category } = ingredient;
  if (!acc[category]) {
    acc[category] = [];
  }
  acc[category].push(ingredient);
  return acc;
}, {} as Record<Ingredient['category'], Ingredient[]>);


export default function Home() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [suggestedRecipe, setSuggestedRecipe] = useState<SuggestRecipeOutput | null>(null);
  const [isRecipeLoading, setIsRecipeLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [luckyChoice, setLuckyChoice] = useState<string | null>(null);

  const handleAddToCart = (ingredient: Ingredient) => {
    setCart((currentCart) => {
      const existingItem = currentCart.find((item) => item.name === ingredient.name);
      if (existingItem) {
        return currentCart.map((item) =>
          item.name === ingredient.name ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...currentCart, { ...ingredient, quantity: 1 }];
    });
  };

  const handleQuantityChange = (name: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(name);
      return;
    }
    setCart((currentCart) =>
      currentCart.map((item) => (item.name === name ? { ...item, quantity } : item))
    );
  };

  const handleRemoveFromCart = (name: string) => {
    setCart((currentCart) => currentCart.filter((item) => item.name !== name));
  };

  const handleSuggestRecipe = async () => {
    setIsRecipeLoading(true);
    setAiError(null);
    setSuggestedRecipe(null);
    try {
      const recipe = await suggestRecipe();
      setSuggestedRecipe(recipe);
    } catch (error) {
      console.error('Erreur lors de la suggestion de recette :', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      setAiError(`Une erreur est survenue lors de la suggestion. (Détail: ${errorMessage})`);
    } finally {
      setIsRecipeLoading(false);
    }
  };

  const addRecipeIngredientsToCart = () => {
    if (!suggestedRecipe) return;
    
    setCart(currentCart => {
      let newCart = [...currentCart];
      suggestedRecipe.ingredients.forEach(recipeIngredient => {
        const dbIngredient = availableIngredients.find(db => db.name.toLowerCase() === recipeIngredient.name.toLowerCase());
        
        if (dbIngredient) {
          const existingCartItem = newCart.find(item => item.name === dbIngredient.name);
          if (existingCartItem) {
            newCart = newCart.map(item => 
              item.name === dbIngredient.name 
                ? { ...item, quantity: item.quantity + 1 }
                : item
            );
          } else {
            newCart.push({ ...dbIngredient, quantity: 1 });
          }
        }
      });
      return newCart;
    });
    setSuggestedRecipe(null); // Clear suggestion after adding
  };

  const handleLuckyChoice = () => {
    const randomIndex = Math.floor(Math.random() * lazyOptions.length);
    setLuckyChoice(lazyOptions[randomIndex]);
  };

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
          <div className="flex gap-2 items-center">
             <ChefHat className="h-6 w-6 text-primary" />
             <h1 className="text-2xl font-bold tracking-tight text-primary-foreground">Mon Assistant Cuisine</h1>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-2">
            <Dialog open={!!suggestedRecipe || isRecipeLoading} onOpenChange={(open) => !open && setSuggestedRecipe(null)}>
              <Button variant="ghost" size="icon" onClick={handleSuggestRecipe} disabled={isRecipeLoading}>
                <Sparkles className="h-5 w-5 text-accent" />
                <span className="sr-only">Surprends-moi</span>
              </Button>
              <DialogContent>
                <DialogHeader>
                  {isRecipeLoading ? (
                    <div className="flex flex-col items-center justify-center p-8 gap-4">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <DialogTitle>Recherche d'une recette...</DialogTitle>
                      <DialogDescription>L'IA explore les saveurs du monde pour vous.</DialogDescription>
                    </div>
                  ) : suggestedRecipe ? (
                    <>
                      <DialogTitle className="flex items-center gap-2">
                        <UtensilsCrossed /> {suggestedRecipe.title} ({suggestedRecipe.country})
                      </DialogTitle>
                      <DialogDescription>{suggestedRecipe.description}</DialogDescription>
                    </>
                  ) : null}
                </DialogHeader>
                {suggestedRecipe && (
                  <div>
                    <h4 className="font-semibold mb-2">Ingrédients :</h4>
                    <ul className="list-disc list-inside text-sm space-y-1 mb-4">
                      {suggestedRecipe.ingredients.map(ing => <li key={ing.name}>{ing.name} ({ing.quantity} {ing.unit})</li>)}
                    </ul>
                    <DialogFooter>
                      <DialogClose asChild>
                         <Button type="button" variant="secondary">Fermer</Button>
                      </DialogClose>
                      <Button onClick={addRecipeIngredientsToCart} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                        <Plus className="mr-2 h-4 w-4" /> Ajouter au panier
                      </Button>
                    </DialogFooter>
                  </div>
                )}
                 {aiError && (
                  <div className="mt-4 p-3 rounded-md border border-destructive/50 bg-destructive/10 text-destructive text-sm flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    <p>{aiError}</p>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      {cartItemCount}
                    </span>
                  )}
                  <span className="sr-only">Ouvrir le panier</span>
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Mon Panier</SheetTitle>
                </SheetHeader>
                <div className="py-4">
                  {cart.length === 0 ? (
                    <p className="text-muted-foreground text-center">Votre panier est vide.</p>
                  ) : (
                    <ul className="space-y-4">
                      {cart.map((item) => (
                        <li key={item.name} className="flex items-center justify-between gap-2">
                          <div className="flex-grow">
                            <p className="font-semibold">{item.name}</p>
                            <p className="text-sm text-muted-foreground">{(item.price * item.quantity).toFixed(0)} DA</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleQuantityChange(item.name, item.quantity - 1)}>
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-6 text-center">{item.quantity}</span>
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleQuantityChange(item.name, item.quantity + 1)}>
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleRemoveFromCart(item.name)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                {cart.length > 0 && (
                  <SheetFooter>
                    <div className="flex justify-between items-center font-bold text-lg w-full border-t pt-4">
                      <span>Total</span>
                      <span>{total.toFixed(0)} DA</span>
                    </div>
                  </SheetFooter>
                )}
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      
      <main className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="md:col-span-2 lg:col-span-3">
             <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Dices className="text-accent" /> La flemme de cuisiner ?</CardTitle>
                  <CardDescription>Cliquez sur le bouton pour choisir un plat rapide au hasard.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={handleLuckyChoice} className="w-full">
                    <Dices className="mr-2 h-4 w-4" /> Lance ta chance
                  </Button>
                </CardContent>
              </Card>
          </div>

          {Object.entries(ingredientsByCategory).map(([category, ingredients]) => (
            <Card key={category} className="shadow-lg">
              <CardHeader>
                <CardTitle>{category}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {ingredients.map((ingredient) => (
                    <li key={ingredient.name} className="flex items-center justify-between p-2 rounded-md bg-secondary">
                      <div>
                        <span className="font-medium">{ingredient.name}</span>
                        <span className="text-sm text-muted-foreground ml-2">({ingredient.price.toFixed(0)} DA / {ingredient.unit})</span>
                      </div>
                      <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => handleAddToCart(ingredient)}>
                        <Plus className="h-4 w-4" />
                        <span className="sr-only">Ajouter {ingredient.name}</span>
                      </Button>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <AlertDialog open={!!luckyChoice} onOpenChange={(open) => !open && setLuckyChoice(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Le sort en est jeté !</AlertDialogTitle>
            <AlertDialogDescription>
              Ce soir, vous mangerez : <span className="font-bold text-lg text-primary">{luckyChoice}</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
            <AlertDialogAction onClick={() => setLuckyChoice(null)}>Génial !</AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
