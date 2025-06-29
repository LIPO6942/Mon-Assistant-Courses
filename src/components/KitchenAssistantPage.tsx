'use client';

import type { SuggestRecipeOutput, Category, categories } from '@/ai/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useState, useCallback, useTransition, useMemo } from 'react';
import { ListPlus, ChefHat, ShoppingBasket, Trash2, Lightbulb, Loader2, PlusCircle, Pencil, Minus, Plus } from 'lucide-react';
import type { generateShoppingList } from '@/ai/flows/generate-list-flow';
import type { suggestRecipe } from '@/ai/flows/suggest-recipe-flow';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Data Structures
interface Ingredient {
  id: string;
  name: string;
  category: Category;
  price: number;
  unit: string;
}

interface BasketItem extends Ingredient {
  quantity: number;
}

interface KitchenAssistantPageProps {
  generateShoppingList: typeof generateShoppingList;
  suggestRecipe: typeof suggestRecipe;
}

const initialIngredients: Ingredient[] = [
    { id: '1', name: 'Poulet (1kg)', category: 'Viandes et Poissons', price: 15.00, unit: 'kg' },
    { id: '2', name: 'Tomates (500g)', category: 'Fruits et Légumes', price: 2.50, unit: 'kg' },
    { id: '3', name: 'Lait (1L)', category: 'Produits Laitiers', price: 1.40, unit: 'L' },
    { id: '4', name: 'Pain de campagne', category: 'Boulangerie', price: 2.00, unit: 'pièce' },
    { id: '5', name: 'Pâtes complètes (500g)', category: 'Épicerie', price: 2.50, unit: 'paquet' },
];

export default function KitchenAssistantPage({
  generateShoppingList,
  suggestRecipe,
}: KitchenAssistantPageProps) {
  const [ingredients, setIngredients] = useState<Ingredient[]>(initialIngredients);
  const [basket, setBasket] = useState<BasketItem[]>([]);
  const [suggestedRecipe, setSuggestedRecipe] = useState<SuggestRecipeOutput | null>(null);
  const [prompt, setPrompt] = useState('');
  const [budget, setBudget] = useState(100);
  const [budgetInput, setBudgetInput] = useState('100');

  const [isGeneratingList, startListGeneration] = useTransition();
  const [isSuggestingRecipe, startRecipeSuggestion] = useTransition();

  const [isAddEditDialogOpen, setAddEditDialogOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);

  // --- Budget & Basket Calculations ---
  const basketTotal = useMemo(() => {
    return basket.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [basket]);

  const remainingBudget = useMemo(() => budget - basketTotal, [budget, basketTotal]);

  const handleSetBudget = () => {
    const newBudget = parseFloat(budgetInput);
    if (!isNaN(newBudget)) {
      setBudget(newBudget);
    }
  };
  
  // --- Ingredient DB Management ---
  const handleSaveIngredient = (formData: Omit<Ingredient, 'id'> & { id?: string }) => {
    if (formData.id) { // Editing
      setIngredients(prev => prev.map(ing => ing.id === formData.id ? { ...ing, ...formData } : ing));
    } else { // Adding
      const newIngredient = { ...formData, id: self.crypto.randomUUID() };
      setIngredients(prev => [...prev, newIngredient]);
    }
    setAddEditDialogOpen(false);
    setEditingIngredient(null);
  };

  const handleDeleteIngredient = (id: string) => {
    setIngredients(prev => prev.filter(ing => ing.id !== id));
  };
  
  const openAddDialog = () => {
    setEditingIngredient(null);
    setAddEditDialogOpen(true);
  };

  const openEditDialog = (ingredient: Ingredient) => {
    setEditingIngredient(ingredient);
    setAddEditDialogOpen(true);
  };


  // --- Basket Management ---
  const addToBasket = (ingredient: Ingredient) => {
    setBasket(prev => {
      const existingItem = prev.find(item => item.id === ingredient.id);
      if (existingItem) {
        return prev.map(item => item.id === ingredient.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...ingredient, quantity: 1 }];
    });
  };

  const updateBasketQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setBasket(prev => prev.filter(item => item.id !== id));
    } else {
      setBasket(prev => prev.map(item => item.id === id ? { ...item, quantity: newQuantity } : item));
    }
  };
  
  const clearBasket = () => setBasket([]);

  // --- AI Features ---
  const handleGenerateList = useCallback(async () => {
    if (!prompt) return;
    startListGeneration(async () => {
      const result = await generateShoppingList({ prompt });
      const newIngredients = result.items.map(item => ({ ...item, id: self.crypto.randomUUID() }));
      
      // Merge results, avoiding duplicates by name
      setIngredients(prev => {
        const existingNames = new Set(prev.map(i => i.name.toLowerCase()));
        const uniqueNew = newIngredients.filter(i => !existingNames.has(i.name.toLowerCase()));
        return [...prev, ...uniqueNew];
      });
    });
  }, [prompt, generateShoppingList]);

  const handleSuggestRecipe = useCallback(async () => {
    startRecipeSuggestion(async () => {
      const recipe = await suggestRecipe();
      setSuggestedRecipe(recipe);
    });
  }, [suggestRecipe]);
  
  const addRecipeIngredientsToDb = () => {
    if (!suggestedRecipe) return;
    const recipeItems: Ingredient[] = suggestedRecipe.ingredients.map(ingredient => ({
      name: `${ingredient.name}`,
      category: 'Épicerie', // Default category
      id: self.crypto.randomUUID(),
      price: 0, // Default price, user can edit
      unit: ingredient.unit,
    }));
    
    setIngredients(prev => {
        const existingNames = new Set(prev.map(i => i.name.toLowerCase()));
        const uniqueNew = recipeItems.filter(i => !existingNames.has(i.name.toLowerCase()));
        return [...prev, ...uniqueNew];
    });
  };

  const groupedIngredients = ingredients.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<Category, Ingredient[]>);


  return (
    <div className="min-h-screen bg-secondary/40">
      {/* Header */}
      <header className="bg-background shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ChefHat className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight hidden sm:block">Assistant Cuisine</h1>
          </div>
          <div className="flex items-center gap-4 p-2 rounded-lg border bg-secondary/50">
            <div className='flex items-center gap-2'>
              <Label htmlFor="budget" className='font-semibold'>Budget:</Label>
              <Input
                id="budget"
                type="number"
                value={budgetInput}
                onChange={e => setBudgetInput(e.target.value)}
                onBlur={handleSetBudget}
                className="w-24 h-8"
              />
            </div>
            <Button onClick={handleSetBudget} size='sm' className="h-8">Définir</Button>
            <div className="text-sm">
                <span className="font-semibold">Dépenses: </span>{basketTotal.toFixed(2)} DT
            </div>
            <div className={`text-sm font-bold ${remainingBudget < 0 ? 'text-destructive' : 'text-green-600'}`}>
                <span className="font-semibold">Restant: </span>{remainingBudget.toFixed(2)} DT
            </div>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="relative">
                <ShoppingBasket />
                {basket.length > 0 && <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full flex items-center justify-center">{basket.reduce((acc, item) => acc + item.quantity, 0)}</Badge>}
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Mon Panier</SheetTitle>
                <SheetDescription>Articles sélectionnés pour vos courses.</SheetDescription>
              </SheetHeader>
              <ScrollArea className="h-[calc(100vh-180px)] pr-4">
                {basket.length > 0 ? (
                  <ul className="space-y-3 py-4">
                    {basket.map(item => (
                      <li key={item.id} className="flex flex-col gap-2 bg-secondary/50 p-3 rounded-md">
                        <div className='flex justify-between items-center'>
                          <span className='font-semibold'>{item.name}</span>
                          <span className='font-bold text-primary'>{(item.price * item.quantity).toFixed(2)} DT</span>
                        </div>
                        <div className='flex justify-between items-center'>
                          <span className='text-sm text-muted-foreground'>{item.price.toFixed(2)} DT / {item.unit}</span>
                          <div className='flex items-center gap-2'>
                             <Button variant="ghost" size="icon" className='h-7 w-7' onClick={() => updateBasketQuantity(item.id, item.quantity - 1)}><Minus className='h-4 w-4'/></Button>
                             <span className='font-bold w-4 text-center'>{item.quantity}</span>
                             <Button variant="ghost" size="icon" className='h-7 w-7' onClick={() => updateBasketQuantity(item.id, item.quantity + 1)}><Plus className='h-4 w-4'/></Button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground text-center mt-8">Votre panier est vide.</p>
                )}
              </ScrollArea>
              <SheetFooter className='pt-4 border-t'>
                  <Button variant="outline" onClick={clearBasket} className="w-full">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Vider le panier
                  </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne 1 & 2: Base de données d'ingrédients */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className='flex justify-between items-center'>
              <CardTitle className="flex items-center gap-2"><ListPlus/> Base d'ingrédients</CardTitle>
              <Button onClick={openAddDialog}><PlusCircle className="mr-2 h-4 w-4" /> Ajouter un produit</Button>
            </div>
            <CardDescription>Gérez votre liste de produits disponibles. Ajoutez-les au panier pour vos courses.</CardDescription>
          </CardHeader>
          <CardContent>
             <ScrollArea className="h-[calc(100vh-250px)]">
               {Object.entries(groupedIngredients).map(([category, items]) => (
                  <div key={category} className="mb-4">
                    <h3 className="font-semibold mb-2 text-primary">{category}</h3>
                    <ul className="space-y-2">
                      {items.map(item => (
                        <li key={item.id} className="flex items-center justify-between bg-secondary/50 p-2 rounded-md">
                          <div>
                            <span className='font-medium'>{item.name}</span>
                            <p className='text-sm text-muted-foreground'>{item.price.toFixed(2)} DT / {item.unit}</p>
                          </div>
                          <div className='flex items-center gap-1'>
                            <Button variant="ghost" size="sm" onClick={() => addToBasket(item)}>Ajouter au panier</Button>
                            <Button variant="ghost" size="icon" className='h-8 w-8' onClick={() => openEditDialog(item)}><Pencil className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className='h-8 w-8' onClick={() => handleDeleteIngredient(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                {ingredients.length === 0 && !isGeneratingList && (
                    <p className="text-sm text-muted-foreground text-center mt-8">Aucun ingrédient. Ajoutez-en un pour commencer.</p>
                )}
             </ScrollArea>
          </CardContent>
        </Card>

        {/* Colonne 3: Actions IA */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <Card>
            <CardHeader>
                <CardTitle>Générer avec l'IA</CardTitle>
                <CardDescription>Décrivez un repas et laissez l'IA ajouter les ingrédients à votre base.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex gap-2">
                    <Input 
                    placeholder="Ex: ingrédients pour couscous"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleGenerateList()}
                    disabled={isGeneratingList}
                    />
                    <Button onClick={handleGenerateList} disabled={isGeneratingList}>
                    {isGeneratingList ? <Loader2 className="h-4 w-4 animate-spin" /> : "Créer"}
                    </Button>
                </div>
            </CardContent>
          </Card>
          <Card>
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
                    <h4 className="font-semibold mb-2">Ingrédients de la recette :</h4>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {suggestedRecipe.ingredients.map((ing, i) => (
                        <li key={i}>{ing.name} - {ing.quantity} {ing.unit}</li>
                      ))}
                    </ul>
                    <Button onClick={addRecipeIngredientsToDb} className="w-full mt-4">Ajouter à ma base</Button>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Add/Edit Ingredient Dialog */}
      <Dialog open={isAddEditDialogOpen} onOpenChange={setAddEditDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{editingIngredient ? "Modifier l'ingrédient" : "Ajouter un ingrédient"}</DialogTitle>
                <DialogDescription>
                    Remplissez les détails du produit.
                </DialogDescription>
            </DialogHeader>
            <IngredientForm 
              key={editingIngredient?.id || 'new'}
              ingredient={editingIngredient} 
              onSave={handleSaveIngredient} 
              onCancel={() => setAddEditDialogOpen(false)}
            />
        </DialogContent>
      </Dialog>
    </div>
  );
}


// Sub-component for the Ingredient Form to handle its own state
function IngredientForm({
  ingredient,
  onSave,
  onCancel,
}: {
  ingredient: Ingredient | null;
  onSave: (data: Omit<Ingredient, 'id'> & { id?: string }) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: ingredient?.name || '',
    category: ingredient?.category || 'Autre',
    price: ingredient?.price || 0,
    unit: ingredient?.unit || 'pièce',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, id: ingredient?.id });
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="name" className="text-right">Nom</Label>
        <Input id="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="col-span-3" required />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="category" className="text-right">Catégorie</Label>
        <Select value={formData.category} onValueChange={(value: Category) => setFormData({...formData, category: value})}>
            <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Choisir une catégorie" />
            </SelectTrigger>
            <SelectContent>
                {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
            </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="price" className="text-right">Prix (DT)</Label>
        <Input id="price" type="number" step="0.1" value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value) || 0})} className="col-span-3" required />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="unit" className="text-right">Unité</Label>
        <Input id="unit" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} className="col-span-3" required />
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Annuler</Button>
        <Button type="submit">Sauvegarder</Button>
      </DialogFooter>
    </form>
  )
}