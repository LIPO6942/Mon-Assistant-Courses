'use client';

import { useState, useMemo, useEffect } from 'react';
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
  AlertDialogFooter,
} from "@/components/ui/alert-dialog"
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChefHat, ShoppingCart, Sparkles, Trash2, Plus, Minus, Loader2, AlertCircle, UtensilsCrossed, Dices, Pencil, Search } from 'lucide-react';
import { suggestRecipe, type SuggestRecipeOutput } from '@/ai/flows/suggest-recipe-flow';
import { cn } from '@/lib/utils';

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
const initialIngredients: Ingredient[] = [
    { name: 'Poulet', price: 12, unit: 'kg', category: 'Viandes' },
    { name: 'Viande hachée', price: 18, unit: 'kg', category: 'Viandes' },
    { name: 'Tomates', price: 1.5, unit: 'kg', category: 'Légumes' },
    { name: 'Oignons', price: 0.8, unit: 'kg', category: 'Légumes' },
    { name: 'Ail', price: 5, unit: 'kg', category: 'Légumes' },
    { name: 'Riz', price: 2.5, unit: 'kg', category: 'Épicerie' },
    { name: 'Pâtes', price: 1.2, unit: 'kg', category: 'Épicerie' },
    { name: 'Huile d\'olive', price: 15, unit: 'litre', category: 'Épicerie' },
    { name: 'Fromage', price: 20, unit: 'kg', category: 'Produits Laitiers' },
    { name: 'Yaourt', price: 0.5, unit: 'pièce', category: 'Produits Laitiers' },
    { name: 'Pain', price: 0.3, unit: 'pièce', category: 'Boulangerie' },
    { name: 'Baguette', price: 0.25, unit: 'pièce', category: 'Boulangerie' },
];
const initialCategories = [...new Set(initialIngredients.map(i => i.category))];

const lazyOptions = ['Maqloub', 'Pizza', 'Burrito', 'Tacos Mexicain', 'Tacos Français', 'Baguette Farcie'];

export default function Home() {
  const [ingredients, setIngredients] = useState<Ingredient[]>(initialIngredients);
  const [categories, setCategories] = useState<string[]>(initialCategories);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [budget, setBudget] = useState<number>(0);
  
  const [hydrated, setHydrated] = useState(false);

  // Load state from localStorage on initial client-side render
  useEffect(() => {
    try {
      const savedIngredients = localStorage.getItem('kitchen-ingredients');
      const savedCategories = localStorage.getItem('kitchen-categories');
      const savedCart = localStorage.getItem('kitchen-cart');
      const savedBudget = localStorage.getItem('kitchen-budget');
      
      if (savedIngredients) setIngredients(JSON.parse(savedIngredients));
      if (savedCategories) setCategories(JSON.parse(savedCategories));
      if (savedCart) setCart(JSON.parse(savedCart));
      if (savedBudget) setBudget(JSON.parse(savedBudget));
      
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
    } finally {
      setHydrated(true);
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (hydrated) {
      localStorage.setItem('kitchen-ingredients', JSON.stringify(ingredients));
    }
  }, [ingredients, hydrated]);

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem('kitchen-categories', JSON.stringify(categories));
    }
  }, [categories, hydrated]);

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem('kitchen-cart', JSON.stringify(cart));
    }
  }, [cart, hydrated]);

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem('kitchen-budget', JSON.stringify(budget));
    }
  }, [budget, hydrated]);

  const [suggestedRecipe, setSuggestedRecipe] = useState<SuggestRecipeOutput | null>(null);
  const [isRecipeLoading, setIsRecipeLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  
  // State for the lucky choice feature
  const [luckyChoice, setLuckyChoice] = useState<string | null>(null);
  const [isLuckyDialogOpen, setIsLuckyDialogOpen] = useState(false);
  const [displayChoice, setDisplayChoice] = useState<string>('');
  const [isSpinning, setIsSpinning] = useState(false);

  // New state for management
  const [searchTerm, setSearchTerm] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [addingToCategory, setAddingToCategory] = useState<string | null>(null);
  const [newBudgetValue, setNewBudgetValue] = useState<string>('');
  
  // State for modal forms
  const [editFormState, setEditFormState] = useState({ name: '', price: 0, unit: '' });
  const [addFormState, setAddFormState] = useState({ name: '', price: 0, unit: '' });

  useEffect(() => {
    if (editingIngredient) {
      setEditFormState({
        name: editingIngredient.name,
        price: editingIngredient.price,
        unit: editingIngredient.unit,
      });
    }
  }, [editingIngredient]);

  const ingredientsByCategory = useMemo(() => {
    const filtered = ingredients.filter(ingredient =>
      ingredient.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const grouped = filtered.reduce((acc, ingredient) => {
      const { category } = ingredient;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(ingredient);
      return acc;
    }, {} as Record<string, Ingredient[]>);

    categories.forEach(cat => {
      if (!grouped[cat]) {
        grouped[cat] = [];
      }
    });
    
    // Show only categories that have results when searching
    if (searchTerm.trim() !== '') {
        Object.keys(grouped).forEach(cat => {
            if(grouped[cat].length === 0) {
                delete grouped[cat];
            }
        });
    }

    return grouped;
  }, [ingredients, searchTerm, categories]);

  const handleAddCategory = () => {
    const trimmedName = newCategoryName.trim();
    if (trimmedName && !categories.includes(trimmedName)) {
      setCategories(prev => [...prev, trimmedName]);
      setNewCategoryName('');
    }
  };

  const handleSaveNewIngredient = () => {
    if (!addingToCategory || !addFormState.name.trim()) return;
    const newIngredient: Ingredient = {
      ...addFormState,
      category: addingToCategory,
    };
    setIngredients(prev => [...prev, newIngredient]);
    setAddingToCategory(null);
    setAddFormState({ name: '', price: 0, unit: '' }); // Reset form
  };

  const handleSaveEditedIngredient = () => {
    if (!editingIngredient) return;

    const updatedIngredient = {
      ...editingIngredient,
      ...editFormState,
    };
    
    const originalName = editingIngredient.name;

    setIngredients(prev => prev.map(ing => (ing.name === originalName ? updatedIngredient : ing)));
    setCart(prev => prev.map(item => (item.name === originalName ? { ...updatedIngredient, quantity: item.quantity } : item)));
    setEditingIngredient(null);
  };
  
  const handleDeleteIngredient = () => {
    if (!editingIngredient) return;
    setIngredients(prev => prev.filter(ing => ing.name !== editingIngredient.name));
    setCart(prev => prev.filter(item => item.name !== editingIngredient.name));
    setEditingIngredient(null);
  };

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
  
  const handleClearCart = () => {
    setCart([]);
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
        const dbIngredient = ingredients.find(db => db.name.toLowerCase() === recipeIngredient.name.toLowerCase());
        
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
    setIsLuckyDialogOpen(true);
    setIsSpinning(true);
    setLuckyChoice(null);

    const spinDuration = 3000; // 3 seconds for suspense
    const spinInterval = 100;

    const intervalId = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * lazyOptions.length);
        setDisplayChoice(lazyOptions[randomIndex]);
    }, spinInterval);

    setTimeout(() => {
        clearInterval(intervalId);
        const finalRandomIndex = Math.floor(Math.random() * lazyOptions.length);
        const finalChoice = lazyOptions[finalRandomIndex];
        setLuckyChoice(finalChoice);
        setDisplayChoice(finalChoice);
        setIsSpinning(false);
    }, spinDuration);
  };
  
  const handleSetBudget = () => {
    const newBudget = parseFloat(newBudgetValue);
    if (!isNaN(newBudget) && newBudget >= 0) {
      setBudget(newBudget);
      setNewBudgetValue('');
    }
  };


  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const remainingBudget = budget - total;

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
              <SheetContent className="flex flex-col h-full">
                <SheetHeader className="flex-row justify-between items-center pb-4 border-b">
                  <SheetTitle>Mon Panier</SheetTitle>
                   {cart.length > 0 && (
                      <Button variant="destructive" size="sm" onClick={handleClearCart}>
                        <Trash2 className="mr-1.5 h-4 w-4" />
                        Vider
                      </Button>
                    )}
                </SheetHeader>
                <div className="flex-grow overflow-y-auto py-4">
                  {cart.length === 0 ? (
                    <p className="text-muted-foreground text-center pt-10">Votre panier est vide.</p>
                  ) : (
                    <ul className="space-y-4 pr-2">
                      {cart.map((item) => (
                        <li key={item.name} className="flex items-center justify-between gap-2">
                          <div className="flex-grow">
                            <p className="font-semibold">{item.name}</p>
                            <p className="text-sm text-muted-foreground">{item.quantity} x {item.price.toFixed(2)} DT</p>
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
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleRemoveFromCart(item.name)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <SheetFooter className="border-t pt-4">
                  <div className="w-full space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="budget-input">Définir un budget (DT)</Label>
                        <div className="flex gap-2">
                            <Input
                                id="budget-input"
                                type="number"
                                placeholder="Ex: 100"
                                value={newBudgetValue}
                                onChange={(e) => setNewBudgetValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSetBudget()}
                            />
                            <Button onClick={handleSetBudget}>Définir</Button>
                        </div>
                    </div>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Budget</span>
                            <span>{budget.toFixed(2)} DT</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Dépenses</span>
                            <span>{total.toFixed(2)} DT</span>
                        </div>
                        <div className="flex justify-between font-semibold text-base">
                            <span>Restant</span>
                            <span className={cn(
                                remainingBudget < 0 ? "text-destructive" : "text-accent"
                            )}>{remainingBudget.toFixed(2)} DT</span>
                        </div>
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
            <CardTitle>Gérer mes produits</CardTitle>
            <CardDescription>Recherchez, ajoutez et modifiez vos produits et catégories.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Rechercher un ingrédient..." className="pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <div className="flex gap-2">
                <Input placeholder="Nouvelle catégorie..." value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} />
                <Button onClick={handleAddCategory}><Plus className="mr-2 h-4 w-4" /> Ajouter</Button>
              </div>
            </div>
          </CardContent>
        </Card>

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Object.entries(ingredientsByCategory).map(([category, ingredientsList]) => (
            <Card key={category} className="shadow-lg flex flex-col">
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle>{category}</CardTitle>
                <Button variant="outline" size="icon" onClick={() => setAddingToCategory(category)}>
                  <Plus className="h-4 w-4" />
                  <span className="sr-only">Ajouter un ingrédient à {category}</span>
                </Button>
              </CardHeader>
              <CardContent className="flex-grow">
                {ingredientsList.length > 0 ? (
                  <ul className="space-y-2">
                    {ingredientsList.map((ingredient) => (
                      <li key={ingredient.name} className="flex items-center justify-between p-2 rounded-md hover:bg-secondary/50">
                        <div>
                          <span className="font-medium">{ingredient.name}</span>
                          <span className="text-sm text-muted-foreground ml-2">({ingredient.price.toFixed(2)} DT / {ingredient.unit})</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditingIngredient(ingredient)}>
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Modifier {ingredient.name}</span>
                          </Button>
                          <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => handleAddToCart(ingredient)}>
                            <Plus className="h-4 w-4" />
                            <span className="sr-only">Ajouter {ingredient.name}</span>
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground text-center pt-4">Aucun ingrédient dans cette catégorie.</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <AlertDialog open={isLuckyDialogOpen} onOpenChange={setIsLuckyDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center text-2xl">
              {isSpinning ? "Le destin est en marche..." : "Roulement de tambour..."}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="text-center py-8 px-4 space-y-4">
                <div className="text-5xl font-bold text-primary h-16 flex items-center justify-center transition-all duration-100">
                  {displayChoice}
                </div>
                {!isSpinning && luckyChoice && (
                  <p className="text-lg text-muted-foreground animate-in fade-in-50 delay-500">
                    Ce soir, le chef, c'est le hasard ! Bon appétit !
                  </p>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => setIsLuckyDialogOpen(false)}
              disabled={isSpinning}
              className="w-full"
            >
              {isSpinning ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Génial !"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Edit Ingredient Dialog */}
      <Dialog open={!!editingIngredient} onOpenChange={(open) => !open && setEditingIngredient(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier l'ingrédient</DialogTitle>
            <DialogDescription>Changez les détails de votre ingrédient ici.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">Nom</Label>
              <Input id="edit-name" value={editFormState.name} onChange={(e) => setEditFormState({...editFormState, name: e.target.value})} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-price" className="text-right">Prix (DT)</Label>
              <Input id="edit-price" type="number" value={editFormState.price} onChange={(e) => setEditFormState({...editFormState, price: parseFloat(e.target.value) || 0})} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-unit" className="text-right">Unité</Label>
              <Input id="edit-unit" value={editFormState.unit} onChange={(e) => setEditFormState({...editFormState, unit: e.target.value})} className="col-span-3" />
            </div>
          </div>
          <DialogFooter className="sm:justify-between">
            <Button type="button" variant="destructive" onClick={handleDeleteIngredient}>
                <Trash2 className="mr-2 h-4 w-4" /> Supprimer
            </Button>
            <div className="flex gap-2">
              <DialogClose asChild>
                <Button type="button" variant="secondary">Annuler</Button>
              </DialogClose>
              <Button type="button" onClick={handleSaveEditedIngredient}>Enregistrer</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Ingredient Dialog */}
      <Dialog open={!!addingToCategory} onOpenChange={(open) => !open && setAddingToCategory(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un ingrédient à "{addingToCategory}"</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="add-name" className="text-right">Nom</Label>
              <Input id="add-name" value={addFormState.name} onChange={(e) => setAddFormState({...addFormState, name: e.target.value})} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="add-price" className="text-right">Prix (DT)</Label>
              <Input id="add-price" type="number" value={addFormState.price} onChange={(e) => setAddFormState({...addFormState, price: parseFloat(e.target.value) || 0})} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="add-unit" className="text-right">Unité</Label>
              <Input id="add-unit" value={addFormState.unit} onChange={(e) => setAddFormState({...addFormState, unit: e.target.value})} className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">Annuler</Button>
            </DialogClose>
            <Button type="button" onClick={handleSaveNewIngredient}>Ajouter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
