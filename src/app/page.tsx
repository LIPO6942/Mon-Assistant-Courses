
"use client";

import { useState, useMemo, useEffect } from "react";
import { Header } from "@/components/header";
import { AddItemForm } from "@/components/add-item-form";
import { GroceryList } from "@/components/grocery-list";
import { WeatherSuggester } from "@/components/weather-suggester";
import { BudgetTracker } from "@/components/budget-tracker";
import { CountryRecipeSuggester } from "@/components/country-recipe-suggester";
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

export type GroceryItem = {
  id: number;
  name: string;
  checked: boolean;
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
    { id: 2, name: "Carottes", checked: true, price: 2.0, quantity: 0.5, unit: 'kg', isEssential: true, icon: 'Carrot' },
    { id: 3, name: "Épinards", checked: false, price: 4.0, quantity: 1, unit: 'sachet', isEssential: false, icon: 'Leaf' },
  ],
  Boulangerie: [{ id: 4, name: "Baguette", checked: false, price: 0.4, quantity: 2, unit: 'pièce(s)', isEssential: true, icon: 'Wheat' }],
  "Produits Laitiers": [
    { id: 5, name: "Lait", checked: false, price: 1.5, quantity: 1, unit: 'L', isEssential: true, icon: 'Milk' },
    { id: 6, name: "Yaourts nature", checked: false, price: 0.8, quantity: 4, unit: 'pièce(s)', isEssential: false, icon: 'GlassWater' },
    { id: 7, name: "Fromage râpé", checked: true, price: 5.0, quantity: 1, unit: 'sachet', isEssential: false, icon: 'Cheese' },
  ],
};

export default function Home() {
  const [lists, setLists] = useState<GroceryLists | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddSheetOpen, setAddSheetOpen] = useState(false);
  const [budget, setBudget] = useState<number>(150);
  const { toast } = useToast();

  useEffect(() => {
    const fetchLists = async () => {
      setIsLoading(true);
      try {
        let data = await getGroceryLists();
        if (!data) {
          console.log("No data found in Firestore, seeding with initial data.");
          data = initialLists;
          await updateGroceryLists(data);
        }
        setLists(data);
      } catch (error) {
        console.error("Failed to load or seed grocery lists:", error);
        toast({
          variant: "destructive",
          title: "Erreur de chargement",
          description: "Impossible de charger les données. Vérifiez votre configuration Firebase et rafraîchissez la page.",
        });
        setLists(initialLists); 
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

  const handleUpdateLists = async (newLists: GroceryLists, oldLists: GroceryLists | null) => {
    setLists(newLists); 
    try {
      await updateGroceryLists(newLists);
    } catch (error) {
      console.error("Failed to save lists:", error);
      toast({
        variant: 'destructive',
        title: 'Erreur de sauvegarde',
        description: "La modification n'a pas pu être sauvegardée."
      });
      if (oldLists) {
        setLists(oldLists);
      }
    }
  };

  const handleAddItem = async (item: string, category: string, price: number, quantity: number, unit: string, isEssential: boolean) => {
    if (!lists) return;
    const oldLists = JSON.parse(JSON.stringify(lists));

    let iconName = 'ShoppingCart';
    try {
      const result = await suggestIcon({ ingredientName: item });
      iconName = result.iconName;
    } catch (error) {
      console.error("Failed to suggest icon:", error);
    }

    const newLists = JSON.parse(JSON.stringify(lists));
    const newItem: GroceryItem = { id: Date.now(), name: item, checked: false, price, quantity, unit, isEssential, icon: iconName };
    if (newLists[category]) {
      newLists[category] = [...newLists[category], newItem];
    } else {
      newLists[category] = [newItem];
    }
    
    await handleUpdateLists(newLists, oldLists);
    setAddSheetOpen(false);
  };

  const handleToggleItem = async (category: string, itemId: number) => {
    if (!lists) return;
    const oldLists = JSON.parse(JSON.stringify(lists));
    const newLists = JSON.parse(JSON.stringify(lists));
    newLists[category] = newLists[category].map((item) =>
      item.id === itemId ? { ...item, checked: !item.checked } : item
    );
    await handleUpdateLists(newLists, oldLists);
  };

  const handleDeleteItem = async (category: string, itemId: number) => {
    if (!lists) return;
    const oldLists = JSON.parse(JSON.stringify(lists));
    const newLists = JSON.parse(JSON.stringify(lists));
    newLists[category] = newLists[category].filter(item => item.id !== itemId);
    if (newLists[category].length === 0) {
      delete newLists[category];
    }
    await handleUpdateLists(newLists, oldLists);
  };

  const handleToggleEssential = async (category: string, itemId: number) => {
    if (!lists) return;
    const oldLists = JSON.parse(JSON.stringify(lists));
    const newLists = JSON.parse(JSON.stringify(lists));
    newLists[category] = newLists[category].map((item) =>
      item.id === itemId ? { ...item, isEssential: !item.isEssential } : item
    );
    await handleUpdateLists(newLists, oldLists);
  };
  
  const handleUpdateItem = async (category: string, itemId: number, updates: Partial<Pick<GroceryItem, 'price' | 'quantity'>>) => {
    if (!lists) return;
    const oldLists = JSON.parse(JSON.stringify(lists));
    const newLists = JSON.parse(JSON.stringify(lists));
    newLists[category] = newLists[category].map(item =>
      item.id === itemId ? { ...item, ...updates } : item
    );
    await handleUpdateLists(newLists, oldLists);
  };

  const handleDeselectAll = async () => {
    if (!lists) return;
    const oldLists = JSON.parse(JSON.stringify(lists));
    const newLists = JSON.parse(JSON.stringify(lists));
    Object.keys(newLists).forEach((category) => {
      newLists[category] = newLists[category].map((item) => ({
        ...item,
        checked: false,
      }));
    });
    await handleUpdateLists(newLists, oldLists);
  };

  const categories = useMemo(() => (lists ? Object.keys(lists) : []), [lists]);
  
  const ingredientsForRecipe = useMemo(() => {
    if (!lists) return [];
    return Object.values(lists)
      .flat()
      .filter(item => item.checked)
      .map(item => ({ name: item.name, price: item.price }));
  }, [lists]);

  const totalCost = useMemo(() => {
    if (!lists) return 0;
    return Object.values(lists)
      .flat()
      .filter(item => item.checked)
      .reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [lists]);

  return (
    <div className="flex flex-col min-h-screen w-full bg-muted/40">
      <Header ingredients={ingredientsForRecipe} />
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
              <GroceryList 
                lists={lists || {}} 
                onToggleItem={handleToggleItem} 
                onDeleteItem={handleDeleteItem}
                onToggleEssential={handleToggleEssential}
                onUpdateItem={handleUpdateItem}
                onAddItemClick={() => setAddSheetOpen(true)}
                onDeselectAll={handleDeselectAll}
              />
            )}
          </div>

          <aside className="space-y-8 lg:col-span-1">
            <BudgetTracker 
              totalCost={totalCost}
              budget={budget}
              onBudgetChange={handleBudgetChange}
              isLoading={isLoading}
            />
            <WeatherSuggester />
            <CountryRecipeSuggester />
          </aside>

        </div>
      </main>

       <Sheet open={isAddSheetOpen} onOpenChange={setAddSheetOpen}>
        <SheetContent>
            <SheetHeader className="mb-6">
              <SheetTitle>Ajouter un nouvel article</SheetTitle>
              <SheetDescription>
                Remplissez les détails ci-dessous et ajoutez l'article à votre liste.
              </SheetDescription>
            </SheetHeader>
            <AddItemForm categories={categories} onAddItem={handleAddItem} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
