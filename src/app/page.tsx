'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { ChefHat, ShoppingCart, Sparkles, Trash2, Plus, Minus, Loader2, AlertCircle, UtensilsCrossed } from 'lucide-react';
import { suggestRecipe, type SuggestRecipeOutput } from '@/ai/flows/suggest-recipe-flow';
import type { Metadata } from 'next';

// Data structures
type Ingredient = {
  name: string;
  price: number;
  unit: string;
  category: string;
};

type CartItem = Ingredient & {
  quantity: number;
};

// "Database" of available ingredients
const availableIngredients: Ingredient[] = [
    { name: 'Poulet', price: 9.50, unit: 'kg', category: 'Viandes' },
    { name: 'Tomates', price: 2.50, unit: 'kg', category: 'Légumes' },
    { name: 'Oignons', price: 1.80, unit: 'kg', category: 'Légumes' },
    { name: 'Ail', price: 15.00, unit: 'kg', category: 'Légumes' },
    { name: 'Riz Basmati', price: 4.00, unit: 'kg', category: 'Épicerie' },
    { name: 'Lentilles corail', price: 3.50, unit: 'kg', category: 'Épicerie' },
    { name: 'Lait de coco', price: 2.80, unit: 'litre', category: 'Épicerie' },
    { name: 'Pâte de curry', price: 4.50, unit: 'pot', category: 'Épicerie' },
    { name: 'Huile d\'olive', price: 8.00, unit: 'litre', category: 'Épicerie' },
    { name: 'Crème fraîche', price: 2.20, unit: 'litre', category: 'Produits Laitiers' },
    { name: 'Fromage râpé', price: 12.00, unit: 'kg', category: 'Produits Laitiers' },
    { name: 'Pain', price: 1.10, unit: 'pièce', category: 'Boulangerie' },
];

export default function Home() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [suggestedRecipe, setSuggestedRecipe] = useState<SuggestRecipeOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

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
    setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  const addRecipeIngredientsToCart = () => {
    if (!suggestedRecipe) return;
    
    // Using a functional update to ensure we have the latest cart state
    setCart(currentCart => {
      let newCart = [...currentCart];
      
      suggestedRecipe.ingredients.forEach(recipeIngredient => {
        // Find a matching ingredient in our "database" to get price etc.
        const dbIngredient = availableIngredients.find(db => db.name.toLowerCase() === recipeIngredient.name.toLowerCase());
        
        // Only add if it exists in our database
        if (dbIngredient) {
          const existingCartItem = newCart.find(item => item.name === dbIngredient.name);
          if (existingCartItem) {
            // If item exists, just increase quantity (assuming 1 unit per recipe 'quantity')
            newCart = newCart.map(item => 
              item.name === dbIngredient.name 
                ? { ...item, quantity: item.quantity + 1 } // Simple increment
                : item
            );
          } else {
            // Add new item to cart
            newCart.push({ ...dbIngredient, quantity: 1 }); // Default to 1 unit
          }
        }
      });
      return newCart;
    });
    setSuggestedRecipe(null); // Clear suggestion after adding
  };

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <main className="flex flex-col lg:flex-row gap-8 justify-center min-h-screen p-4 sm:p-8">
      {/* Left Column: Ingredients & Recipe */}
      <div className="w-full lg:w-1/2 space-y-8">
        <header className="text-center">
          <h1 className="text-4xl font-bold tracking-tight lg:text-5xl text-primary-foreground bg-primary p-4 rounded-lg shadow-md flex items-center justify-center gap-3">
            <ChefHat size={40} /> Mon Assistant Cuisine
          </h1>
        </header>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Sparkles className="text-accent" /> Surprends-moi !</CardTitle>
            <CardDescription>Cliquez sur le bouton pour obtenir une idée de recette aléatoire du monde entier.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleSuggestRecipe} disabled={isLoading} className="w-full">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Suggérer une recette
            </Button>
            {aiError && (
              <div className="mt-4 p-3 rounded-md border border-destructive/50 bg-destructive/10 text-destructive text-sm flex items-start gap-3">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <p>{aiError}</p>
              </div>
            )}
          </CardContent>
          {suggestedRecipe && (
            <CardFooter className="flex flex-col items-start gap-4 border-t pt-6">
               <div className="w-full">
                <h3 className="text-xl font-bold text-primary flex items-center gap-2">
                  <UtensilsCrossed /> {suggestedRecipe.title} ({suggestedRecipe.country})
                </h3>
                <p className="text-muted-foreground mt-1">{suggestedRecipe.description}</p>
              </div>
              <div className="w-full">
                <h4 className="font-semibold mb-2">Ingrédients :</h4>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {suggestedRecipe.ingredients.map(ing => <li key={ing.name}>{ing.name} ({ing.quantity} {ing.unit})</li>)}
                </ul>
              </div>
              <Button onClick={addRecipeIngredientsToCart} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                <Plus className="mr-2 h-4 w-4" /> Ajouter au panier
              </Button>
            </CardFooter>
          )}
        </Card>
        
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Ingrédients disponibles</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {availableIngredients.map((ingredient) => (
                <li key={ingredient.name} className="flex items-center justify-between p-2 rounded-md bg-secondary">
                  <div>
                    <span className="font-medium">{ingredient.name}</span>
                    <span className="text-sm text-muted-foreground ml-2">({ingredient.price.toFixed(2)}€ / {ingredient.unit})</span>
                  </div>
                  <Button size="sm" onClick={() => handleAddToCart(ingredient)}>
                    <Plus className="h-4 w-4 mr-1" /> Ajouter
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Right Column: Shopping Cart */}
      <div className="w-full lg:w-1/3">
        <Card className="shadow-lg sticky top-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ShoppingCart /> Mon Panier</CardTitle>
          </CardHeader>
          <CardContent>
            {cart.length === 0 ? (
              <p className="text-muted-foreground text-center">Votre panier est vide.</p>
            ) : (
              <ul className="space-y-4">
                {cart.map((item) => (
                  <li key={item.name} className="flex items-center justify-between gap-2">
                    <div className="flex-grow">
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{(item.price * item.quantity).toFixed(2)}€</p>
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
          </CardContent>
          {cart.length > 0 && (
             <CardFooter className="flex justify-between items-center font-bold text-lg border-t pt-4">
                <span>Total</span>
                <span>{total.toFixed(2)}€</span>
            </CardFooter>
          )}
        </Card>
      </div>
    </main>
  );
}
