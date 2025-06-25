
"use client";

import { useState, useMemo, useEffect } from "react";
import { Header } from "@/components/header";
import { AddItemForm } from "@/components/add-item-form";
import { Pantry } from "@/components/pantry";
import { ShoppingCart } from "@/components/shopping-cart";
import { WeatherSuggester } from "@/components/weather-suggester";
import { LazyFoodWheel } from "@/components/lazy-food-wheel";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { suggestIcon } from "@/ai/flows/suggest-icon";
import { useToast } from "@/hooks/use-toast";
import { getGroceryLists, updateGroceryLists } from "@/services/grocery";
import { CountryRecipeSuggester } from "@/components/country-recipe-suggester";

export type GroceryItem = {
  id: number;
  name: string;
  checked: boolean; // This will now represent if it's in the cart
  price: number;
  quantity: number;
  unit: string;
  isEssential: boolean;
  icon?: string;
};

export type GroceryLists = Record<string, GroceryItem[]>;

const initialLists: GroceryLists = {
  "Fruits et Légumes": [
    { id: 1, name: "Pommes", checked: false, price: 3.5, quantity: 1, unit: 'kg', isEssential: false, icon: 'Apple' },
    { id: 2, name: "Carottes", checked: false, price: 2.0, quantity: 0.5, unit: 'kg', isEssential: true, icon: 'Carrot' },
    { id: 3, name: "Épinards", checked: false, price: 4.0, quantity: 1, unit: 'sachet', isEssential: false, icon: 'Leaf' },
  ],
  Boulangerie: [{ id: 4, name: "Baguette", checked: false, price: 0.4, quantity: 2, unit: 'pièce(s)', isEssential: true, icon: 'Wheat' }],
  "Produits Laitiers": [
    { id: 5, name: "Lait", checked: false, price: 1.5, quantity: 1, unit: 'L', isEssential: true, icon: 'Milk' },
    { id: 6, name: "Yaourts nature", checked: false, price: 0.8, quantity: 4, unit: 'pièce(s)', isEssential: false, icon: 'GlassWater' },
    { id: 7, name: "Fromage râpé", checked: false, price: 5.0, quantity: 1, unit: 'sachet', isEssential: false, icon: 'Cheese' },
  ],
};

export default function Home() {
  const [pantryLists, setPantryLists] = useState<GroceryLists | null>(null);
  const [cartItems, setCartItems] = useState<GroceryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddSheetOpen, setAddSheetOpen] = useState(false);
  const [isCountryRecipeOpen, setCountryRecipeOpen] = useState(false);
  const [budget, setBudget] = useState<number>(150);
  const { toast } = useToast();

  useEffect(() => {
    const fetchLists = async () => {
      setIsLoading(true);
      try {
        let data = await getGroceryLists();
        if (!data || Object.keys(data).length === 0) {
          console.log("No data found, seeding with initial data.");
          data = initialLists;
          await updateGroceryLists(data);
        }
        
        // Separate items into pantry and cart based on 'checked' status
        const loadedCartItems: GroceryItem[] = [];
        const loadedPantryLists: GroceryLists = JSON.parse(JSON.stringify(data));
        
        Object.keys(loadedPantryLists).forEach(category => {
          loadedPantryLists[category].forEach(item => {
            if (item.checked) {
              loadedCartItems.push(item);
            }
          });
        });
        
        setPantryLists(loadedPantryLists);
        setCartItems(loadedCartItems);

      } catch (error) {
        console.error("Failed to load or seed grocery lists:", error);
        toast({
          variant: "destructive",
          title: "Erreur de chargement",
          description: "Impossible de charger les données. Vérifiez votre configuration Firebase.",
        });
        setPantryLists(initialLists); 
      } finally {
        setIsLoading(false);
      }
    };
    fetchLists();

    const savedBudget = localStorage.getItem('groceryBudget');
    if (savedBudget) {
      setBudget(JSON.parse(savedBudget));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const handleBudgetChange = (newBudget: number) => {
    setBudget(newBudget);
    localStorage.setItem('groceryBudget', JSON.stringify(newBudget));
  };

  const updatePantryAndPersist = async (newPantry: GroceryLists) => {
    setPantryLists(newPantry);
    try {
      await updateGroceryLists(newPantry);
    } catch (error) {
       console.error("Failed to save lists:", error);
       toast({
         variant: 'destructive',
         title: 'Erreur de sauvegarde',
         description: "La modification n'a pas pu être sauvegardée."
       });
       // Note: Reverting state might be complex here, so we just show an error.
    }
  }

  const handleAddItem = async (item: string, category: string, price: number, quantity: number, unit: string, isEssential: boolean) => {
    if (!pantryLists) return;
    const oldPantry = JSON.parse(JSON.stringify(pantryLists));

    let iconName = 'ShoppingCart';
    try {
      const result = await suggestIcon({ ingredientName: item });
      iconName = result.iconName;
    } catch (error) {
      console.error("Failed to suggest icon:", error);
    }

    const newPantry = JSON.parse(JSON.stringify(pantryLists));
    const newItem: GroceryItem = { id: Date.now(), name: item, checked: false, price, quantity, unit, isEssential, icon: iconName };
    if (newPantry[category]) {
      newPantry[category] = [...newPantry[category], newItem];
    } else {
      newPantry[category] = [newItem];
    }
    
    await updatePantryAndPersist(newPantry);
    setAddSheetOpen(false);
  };

  const handleToggleCartItem = async (item: GroceryItem) => {
    const isInCart = cartItems.some(cartItem => cartItem.id === item.id);
    let newCartItems: GroceryItem[];
    if (isInCart) {
      newCartItems = cartItems.filter(cartItem => cartItem.id !== item.id);
    } else {
      newCartItems = [...cartItems, item];
    }
    setCartItems(newCartItems);

    // Update the 'checked' state in the main pantry list and persist
    if(pantryLists) {
      const newPantry = JSON.parse(JSON.stringify(pantryLists));
      let found = false;
      for (const category in newPantry) {
        for(let i=0; i < newPantry[category].length; i++) {
          if (newPantry[category][i].id === item.id) {
            newPantry[category][i].checked = !isInCart;
            found = true;
            break;
          }
        }
        if(found) break;
      }
      await updatePantryAndPersist(newPantry);
    }
  };

  const handleDeleteItem = async (category: string, itemId: number) => {
    if (!pantryLists) return;
    const newPantry = JSON.parse(JSON.stringify(pantryLists));
    newPantry[category] = newPantry[category].filter(item => item.id !== itemId);
    if (newPantry[category].length === 0) {
      delete newPantry[category];
    }

    setCartItems(cartItems.filter(item => item.id !== itemId));
    await updatePantryAndPersist(newPantry);
  };
  
  const handleMoveItem = async (itemId: number, oldCategory: string, newCategory: string) => {
    if (!pantryLists || oldCategory === newCategory) return;
    const newPantry = JSON.parse(JSON.stringify(pantryLists));

    const itemToMove = newPantry[oldCategory]?.find((item: GroceryItem) => item.id === itemId);
    if (!itemToMove) return;

    newPantry[oldCategory] = newPantry[oldCategory].filter((item: GroceryItem) => item.id !== itemId);
    if (newPantry[oldCategory].length === 0) {
        delete newPantry[oldCategory];
    }
    
    if (!newPantry[newCategory]) {
        newPantry[newCategory] = [];
    }
    newPantry[newCategory].push(itemToMove);

    await updatePantryAndPersist(newPantry);
  };

  const handleToggleEssential = async (category: string, itemId: number) => {
    if (!pantryLists) return;
    const newPantry = JSON.parse(JSON.stringify(pantryLists));
    let itemToUpdate: GroceryItem | undefined;

    for (const cat of Object.keys(newPantry)) {
        const itemIndex = newPantry[cat].findIndex((i: GroceryItem) => i.id === itemId);
        if (itemIndex !== -1) {
            newPantry[cat][itemIndex].isEssential = !newPantry[cat][itemIndex].isEssential;
            itemToUpdate = newPantry[cat][itemIndex];
            break;
        }
    }
    
    if (itemToUpdate) {
        setCartItems(cartItems.map(item => item.id === itemId ? itemToUpdate! : item));
    }
    
    await updatePantryAndPersist(newPantry);
  };
  
  const handleUpdateItem = async (category: string, itemId: number, updates: Partial<Pick<GroceryItem, 'price' | 'quantity'>>) => {
    if (!pantryLists) return;
    const newPantry = JSON.parse(JSON.stringify(pantryLists));
    let itemToUpdate: GroceryItem | undefined;

    for (const cat of Object.keys(newPantry)) {
        const itemIndex = newPantry[cat].findIndex((i: GroceryItem) => i.id === itemId);
        if (itemIndex !== -1) {
            newPantry[cat][itemIndex] = { ...newPantry[cat][itemIndex], ...updates };
            itemToUpdate = newPantry[cat][itemIndex];
            break;
        }
    }

    if (itemToUpdate) {
        setCartItems(cartItems.map(item => item.id === itemId ? itemToUpdate! : item));
    }
    
    await updatePantryAndPersist(newPantry);
  };

  const handleClearCart = async () => {
    setCartItems([]);
     if(pantryLists) {
      const newPantry = JSON.parse(JSON.stringify(pantryLists));
      for (const category in newPantry) {
        newPantry[category] = newPantry[category].map(item => ({...item, checked: false}));
      }
      await updatePantryAndPersist(newPantry);
    }
  };

  const categories = useMemo(() => (pantryLists ? Object.keys(pantryLists) : []), [pantryLists]);
  
  const ingredientsForRecipe = useMemo(() => {
    return cartItems.map(item => ({ name: item.name, price: item.price }));
  }, [cartItems]);

  const totalCost = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cartItems]);
  
  const cartItemIds = useMemo(() => new Set(cartItems.map(item => item.id)), [cartItems]);

  return (
    <div className="flex flex-col min-h-screen w-full bg-muted/40">
      <Header 
        ingredients={ingredientsForRecipe} 
        onCountryRecipeClick={() => setCountryRecipeOpen(true)}
      />
      <main className="flex-1 container mx-auto p-4 md:p-8">
        <div className="grid lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2">
            {isLoading ? (
              <Card>
                <CardHeader>
                  <Skeleton className="h-8 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-4 p-6">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </CardContent>
              </Card>
            ) : (
              <Pantry
                lists={pantryLists || {}}
                cartItemIds={cartItemIds}
                categories={categories}
                onToggleItem={handleToggleCartItem} 
                onDeleteItem={handleDeleteItem}
                onToggleEssential={handleToggleEssential}
                onUpdateItem={handleUpdateItem}
                onMoveItem={handleMoveItem}
                onAddItemClick={() => setAddSheetOpen(true)}
              />
            )}
          </div>

          <aside className="space-y-8 lg:col-span-1">
            <ShoppingCart 
              items={cartItems} 
              onToggleItem={handleToggleCartItem}
              onClearCart={handleClearCart}
              totalCost={totalCost}
              budget={budget}
              onBudgetChange={handleBudgetChange}
            />
            <WeatherSuggester />
            <LazyFoodWheel />
          </aside>

        </div>
      </main>

       <Sheet open={isAddSheetOpen} onOpenChange={setAddSheetOpen}>
        <SheetContent>
            <SheetHeader className="mb-6">
              <SheetTitle>Ajouter au garde-manger</SheetTitle>
              <SheetDescription>
                Remplissez les détails ci-dessous et ajoutez l'article à votre base de données.
              </SheetDescription>
            </SheetHeader>
            <AddItemForm categories={categories} onAddItem={handleAddItem} />
        </SheetContent>
      </Sheet>

      <CountryRecipeSuggester 
        open={isCountryRecipeOpen}
        onOpenChange={setCountryRecipeOpen}
      />
    </div>
  );
}
