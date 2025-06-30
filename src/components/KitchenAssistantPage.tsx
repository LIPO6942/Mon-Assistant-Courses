'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useState, useMemo } from 'react';
import { ChefHat, ShoppingBasket, Trash2, PlusCircle, Pencil, Minus, Plus, Dices, UtensilsCrossed, ListSteps } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const initialCategories = [
  { id: 'c1', name: 'Fruits et Légumes' },
  { id: 'c2', name: 'Viandes et Poissons' },
  { id: 'c3', name: 'Produits Laitiers' },
  { id: 'c4', name: 'Boulangerie' },
  { id: 'c5', name: 'Épicerie' },
  { id: 'c6', name: 'Boissons' },
  { id: 'c7', name: 'Surgelés' },
  { id: 'c8', name: 'Maison' },
];

const units = ['pièce', 'kg', 'g', 'L', 'ml', 'boîte', 'paquet', 'botte'] as const;

const fastFoodOptions = [
    "Baguette farcie", "Ma9loub", "Tacos mexicain", "Tacos français", "Burrito", "Chapati", "Quesidilla", "Tabouna Chawarma", "Tabouna Escalope"
];

const funnyMessages = [
    "Ce soir, on oublie la vaisselle !", "Votre estomac vous dira merci... votre balance, un peu moins.", "Parfait pour accompagner votre série préférée.", "La diète ? On verra ça demain. Ou après-demain.", "Le destin a parlé ! C'est un ordre.", "Bon appétit, et que la force du gras soit avec vous."
];

// Data Structures
interface Ingredient {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
}

interface BasketItem extends Ingredient {
  quantity: number;
}

interface Recipe {
  title: string;
  description: string;
  ingredients: string[];
  calories: number;
  ambiance: string;
  decoration: string;
  instructions: string[];
}

const predefinedIngredients: Ingredient[] = [
    { id: 'f1', name: 'Pommes', category: 'Fruits et Légumes', price: 2.5, unit: 'kg' },
    { id: 'f2', name: 'Bananes', category: 'Fruits et Légumes', price: 3.0, unit: 'kg' },
    { id: 'f3', name: 'Tomates', category: 'Fruits et Légumes', price: 4.0, unit: 'kg' },
    { id: 'v1', name: 'Filet de Poulet', category: 'Viandes et Poissons', price: 12.0, unit: 'kg' },
    { id: 'p1', name: 'Lait Entier', category: 'Produits Laitiers', price: 1.8, unit: 'L' },
    { id: 'b1', name: 'Baguette Tradition', category: 'Boulangerie', price: 1.2, unit: 'pièce' },
    { id: 'e1', name: 'Pâtes Penne', category: 'Épicerie', price: 1.5, unit: 'boîte' },
    { id: 'bo1', name: 'Eau Minérale', category: 'Boissons', price: 0.5, unit: 'L' },
];

const predefinedRecipes: Recipe[] = [
    { 
        title: 'Spaghetti Aglio e Olio', 
        description: 'Un classique italien simple et savoureux, parfait pour un repas rapide en semaine.', 
        ingredients: ['Spaghetti', 'Ail', 'Huile d\'olive', 'Flocons de piment rouge', 'Persil'],
        calories: 450,
        ambiance: 'Lumière tamisée, une playlist de musique italienne douce, et pourquoi pas une nappe à carreaux rouges et blancs.',
        decoration: 'Servez dans une assiette creuse. Saupoudrez généreusement de persil frais haché et d\'un filet d\'huile d\'olive extra vierge juste avant de servir.',
        instructions: [
            "Faites cuire les spaghetti selon les instructions sur l'emballage jusqu'à ce qu'ils soient al dente.", "Pendant que les pâtes cuisent, hachez finement l'ail.", "Dans une grande poêle, chauffez l'huile d'olive à feu moyen. Ajoutez l'ail et les flocons de piment.", "Faites revenir l'ail pendant 1-2 minutes jusqu'à ce qu'il soit légèrement doré. Attention à ne pas le brûler.", "Égouttez les pâtes en réservant une petite tasse de leur eau de cuisson.", "Ajoutez les pâtes égouttées dans la poêle avec l'huile et l'ail. Mélangez bien pour enrober les pâtes.", "Versez un peu d'eau de cuisson des pâtes pour créer une sauce légère et crémeuse.", "Incorporez le persil frais haché, salez, poivrez et servez immédiatement."
        ]
    },
    // ... other recipes from before
];

export default function KitchenAssistantPage() {
  const [categories, setCategories] = useState(initialCategories);
  const [ingredients, setIngredients] = useState<Ingredient[]>(predefinedIngredients);
  const [basket, setBasket] = useState<BasketItem[]>([]);
  const [budget, setBudget] = useState(100);
  const [budgetInput, setBudgetInput] = useState('100');

  const [isAddEditDialogOpen, setAddEditDialogOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Partial<Ingredient> | null>(null);
  
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<{ id?: string; name: string } | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<{ id: string; name: string } | null>(null);

  const [isRecipeDialogOpen, setIsRecipeDialogOpen] = useState(false);
  const [suggestedRecipe, setSuggestedRecipe] = useState<Recipe | null>(null);

  const [isWheelOpen, setIsWheelOpen] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [wheelResult, setWheelResult] = useState<string | null>(null);
  const [funnyMessage, setFunnyMessage] = useState<string>('');

  const basketTotal = useMemo(() => {
    return basket.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [basket]);

  const remainingBudget = useMemo(() => budget - basketTotal, [budget, basketTotal]);

  const handleSetBudget = () => {
    const newBudget = parseFloat(budgetInput);
    if (!isNaN(newBudget)) setBudget(newBudget);
  };
  
  const handleSaveIngredient = (formData: Omit<Ingredient, 'id'> & { id?: string }) => {
    if (formData.id) {
      setIngredients(prev => prev.map(ing => ing.id === formData.id ? { ...ing, ...formData } as Ingredient : ing));
    } else {
      const newIngredient = { ...formData, id: self.crypto.randomUUID() } as Ingredient;
      setIngredients(prev => [...prev, newIngredient].sort((a,b) => a.name.localeCompare(b.name)));
    }
    setAddEditDialogOpen(false);
    setEditingIngredient(null);
  };

  const handleDeleteIngredient = (id: string) => setIngredients(prev => prev.filter(ing => ing.id !== id));
  
  const openAddDialog = (category?: string) => {
    setEditingIngredient({ category: category || 'Autre', unit: 'pièce', price: undefined, name: '' });
    setAddEditDialogOpen(true);
  };

  const openEditDialog = (ingredient: Ingredient) => {
    setEditingIngredient(ingredient);
    setAddEditDialogOpen(true);
  };

  const openCategoryDialog = (category?: { id: string; name: string }) => {
    setEditingCategory(category || { name: '' });
    setIsCategoryDialogOpen(true);
  };

  const handleSaveCategory = (formData: { id?: string; name: string }) => {
    if (formData.id) {
      setCategories(prev => prev.map(cat => cat.id === formData.id ? { ...cat, name: formData.name } : cat));
    } else {
      setCategories(prev => [...prev, { ...formData, id: self.crypto.randomUUID() }]);
    }
    setIsCategoryDialogOpen(false);
    setEditingCategory(null);
  };

  const handleDeleteCategory = (id: string) => {
    setCategories(prev => prev.filter(cat => cat.id !== id));
    // Optionally re-categorize ingredients under the deleted category to "Autre"
    // setIngredients(prev => prev.map(ing => ing.category === deletingCategory?.name ? {...ing, category: 'Autre'} : ing));
    setDeletingCategory(null);
  };

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

  const groupedIngredients = useMemo(() => {
    const acc = categories.reduce((obj, cat) => ({ ...obj, [cat.name]: [] }), {} as Record<string, Ingredient[]>);
    ingredients.forEach(item => {
      if (acc[item.category]) acc[item.category].push(item);
    });
    return acc;
  }, [ingredients, categories]);

  const handleSuggestRecipe = () => {
    const randomIndex = Math.floor(Math.random() * predefinedRecipes.length);
    setSuggestedRecipe(predefinedRecipes[randomIndex]);
    setIsRecipeDialogOpen(true);
  };
  
  const handleAddIngredientFromRecipe = (ingredientName: string) => {
    const exists = ingredients.some(ing => ing.name.toLowerCase() === ingredientName.toLowerCase());
    if (exists) return;

    const newIngredient: Ingredient = {
      id: self.crypto.randomUUID(),
      name: ingredientName.charAt(0).toUpperCase() + ingredientName.slice(1),
      category: 'Autre', price: 0, unit: 'pièce'
    };
    setIngredients(prev => [...prev, newIngredient].sort((a,b) => a.name.localeCompare(b.name)));
  };

  const handleSpinWheel = () => {
    setSpinning(true); setWheelResult(null); setFunnyMessage('');
    setTimeout(() => {
      const finalIndex = Math.floor(Math.random() * fastFoodOptions.length);
      setWheelResult(fastFoodOptions[finalIndex]);
      setFunnyMessage(funnyMessages[Math.floor(Math.random() * funnyMessages.length)]);
      setSpinning(false);
    }, 3000);
  };
  const openWheelDialog = () => { setWheelResult(null); setFunnyMessage(''); setIsWheelOpen(true); };

  return (
    <div className="min-h-screen bg-secondary/40">
      <header className="bg-card border-b sticky top-0 z-20">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <ChefHat className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">Mon assistant de courses</h1>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-center">
              <Button variant="ghost" onClick={handleSuggestRecipe}>
                  <ChefHat className="mr-2 h-4 w-4" /> Suggestion du Chef
              </Button>
              <Button variant="ghost" onClick={openWheelDialog}>
                  <Dices className="mr-2 h-4 w-4" /> T'as pas envie de cuisiner ?
              </Button>
          </div>
          <div className="flex items-center gap-4">
             <div className="hidden sm:flex items-center gap-4 p-2 rounded-lg border bg-background shadow-sm">
                <div className='flex items-center gap-2'>
                  <Label htmlFor="budget" className='font-semibold'>Budget:</Label>
                  <Input id="budget" type="number" value={budgetInput} onChange={e => setBudgetInput(e.target.value)} onBlur={handleSetBudget} className="w-24 h-8" />
                  <span>DT</span>
                </div>
                <div className="text-sm">
                    <span className="font-semibold text-muted-foreground">Dépenses: </span>{basketTotal.toFixed(2)} DT
                </div>
                <div className={`text-sm font-bold ${remainingBudget < 0 ? 'text-destructive' : 'text-primary'}`}>
                    <span className="font-semibold text-muted-foreground">Restant: </span>{remainingBudget.toFixed(2)} DT
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
                  <SheetDescription>Articles de votre liste de courses.</SheetDescription>
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
                               <Button variant="ghost" size="icon" className='h-7 w-7 rounded-full' onClick={() => updateBasketQuantity(item.id, item.quantity - 1)}><Minus className='h-4 w-4'/></Button>
                               <span className='font-bold w-4 text-center'>{item.quantity}</span>
                               <Button variant="ghost" size="icon" className='h-7 w-7 rounded-full' onClick={() => updateBasketQuantity(item.id, item.quantity + 1)}><Plus className='h-4 w-4'/></Button>
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
                      <Trash2 className="h-4 w-4 mr-2" /> Vider le panier
                    </Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4">
        <h2 className="text-xl font-bold mb-4">Mon Garde-Manger</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {categories.map(category => (
                <Card key={category.id} className="flex flex-col bg-card">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-primary">{category.name}</CardTitle>
                        <div className="flex items-center">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openCategoryDialog(category)}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeletingCategory(category)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <ScrollArea className="h-64">
                            <ul className="space-y-2 pr-3">
                                {(groupedIngredients[category.name] || []).map(item => (
                                <li key={item.id} className="flex items-center justify-between p-2 rounded-md hover:bg-secondary/50 transition-colors">
                                    <div>
                                    <span className='font-medium'>{item.name}</span>
                                    <p className='text-sm text-muted-foreground'>{item.price.toFixed(2)} DT / {item.unit}</p>
                                    </div>
                                    <div className='flex items-center gap-1'>
                                      <Button variant="ghost" size="icon" className='h-8 w-8' onClick={() => addToBasket(item)}><Plus className="h-4 w-4" /></Button>
                                      <Button variant="ghost" size="icon" className='h-8 w-8' onClick={() => openEditDialog(item)}><Pencil className="h-4 w-4" /></Button>
                                      <Button variant="ghost" size="icon" className='h-8 w-8' onClick={() => handleDeleteIngredient(item.id)}><Trash2 className="h-4 w-4 text-destructive/80" /></Button>
                                    </div>
                                </li>
                                ))}
                            </ul>
                        </ScrollArea>
                    </CardContent>
                    <CardFooter>
                        <Button variant="outline" className="w-full" onClick={() => openAddDialog(category.name)}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un produit
                        </Button>
                    </CardFooter>
                </Card>
            ))}
            <Card className="flex flex-col items-center justify-center border-2 border-dashed bg-card/50 hover:border-primary hover:text-primary transition-colors cursor-pointer min-h-[300px]" onClick={() => openCategoryDialog()}>
              <PlusCircle className="h-10 w-10 mb-2" />
              <span className="font-semibold">Ajouter une catégorie</span>
            </Card>
        </div>
      </main>
      
      {/* Dialogs */}
      <Dialog open={isAddEditDialogOpen} onOpenChange={setAddEditDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{editingIngredient?.id ? "Modifier le produit" : "Ajouter un produit"}</DialogTitle>
                <DialogDescription>Remplissez les détails du produit.</DialogDescription>
            </DialogHeader>
            <IngredientForm 
              key={editingIngredient?.id || 'new'}
              ingredient={editingIngredient} 
              categories={categories}
              onSave={handleSaveIngredient} 
              onCancel={() => setAddEditDialogOpen(false)}
            />
        </DialogContent>
      </Dialog>

      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{editingCategory?.id ? "Modifier la catégorie" : "Ajouter une catégorie"}</DialogTitle>
            </DialogHeader>
            <CategoryForm
              key={editingCategory?.id || 'new-cat'}
              category={editingCategory}
              onSave={handleSaveCategory}
              onCancel={() => setIsCategoryDialogOpen(false)}
            />
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={!!deletingCategory} onOpenChange={() => setDeletingCategory(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer cette catégorie ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Tous les produits de la catégorie "{deletingCategory?.name}" ne seront plus affichés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingCategory(null)}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleDeleteCategory(deletingCategory!.id)}>Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isRecipeDialogOpen} onOpenChange={setIsRecipeDialogOpen}>
        <DialogContent className="max-w-2xl">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-2xl"><ChefHat className="h-7 w-7 text-primary" /><span>{suggestedRecipe?.title}</span></DialogTitle>
                <DialogDescription className="text-left pt-1">{suggestedRecipe?.description}</DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[70vh] pr-6">
                <div className="py-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                          <h4 className="font-semibold mb-2 flex items-center gap-2"><UtensilsCrossed className="h-5 w-5 text-primary"/>Ingrédients</h4>
                          <ul className="space-y-2 text-sm">
                              {suggestedRecipe?.ingredients.map(ing => (
                                <li key={ing} className="flex items-center justify-between p-1.5 rounded-md hover:bg-secondary">
                                    <span>{ing}</span>
                                    {!ingredients.some(pantryIng => pantryIng.name.toLowerCase() === ing.toLowerCase()) && (
                                      <Button size="sm" variant="outline" className="h-7" onClick={() => handleAddIngredientFromRecipe(ing)}><PlusCircle className="mr-1.5 h-3.5 w-3.5" /> Ajouter</Button>
                                    )}
                                </li>
                              ))}
                          </ul>
                      </div>
                       <div>
                          <h4 className="font-semibold mb-2 flex items-center gap-2"><ListSteps className="h-5 w-5 text-primary"/>Préparation</h4>
                          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground pl-2">
                              {suggestedRecipe?.instructions.map((step, index) => <li key={index}>{step}</li>)}
                          </ol>
                      </div>
                    </div>
                </div>
            </ScrollArea>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isWheelOpen} onOpenChange={setIsWheelOpen}>
        <DialogContent className="max-w-md">
            <DialogHeader>
                <DialogTitle className="text-center text-2xl font-bold">La Roue de l'Indécision</DialogTitle>
                <DialogDescription className="text-center">Laissez le destin choisir votre repas.</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center justify-center h-48 bg-muted rounded-lg my-4 overflow-hidden relative">
                {spinning ? <p className="text-lg text-muted-foreground">Ça tourne...</p> : wheelResult ? (
                    <div className="text-center">
                        <p className="text-4xl font-extrabold text-primary animate-pulse">{wheelResult}</p>
                        {funnyMessage && <p className="text-center text-lg italic text-foreground/80 mt-4 animate-in fade-in-50">"{funnyMessage}"</p>}
                    </div>
                ) : <p className="text-lg text-muted-foreground">Prêt à tenter votre chance ?</p>}
            </div>
            <DialogFooter>
                <Button onClick={handleSpinWheel} disabled={spinning} className="w-full">{spinning ? "..." : "Lancer la roue !"}</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function IngredientForm({ ingredient, categories, onSave, onCancel }: { ingredient: Partial<Ingredient> | null; categories: {id: string; name: string}[]; onSave: (data: Omit<Ingredient, 'id'> & { id?: string }) => void; onCancel: () => void; }) {
  const [formData, setFormData] = useState({
    name: ingredient?.name || '',
    category: ingredient?.category || categories[0]?.name || 'Autre',
    price: ingredient?.price !== undefined ? String(ingredient.price) : '',
    unit: ingredient?.unit || 'pièce',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, price: parseFloat(formData.price) || 0, id: ingredient?.id });
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="name" className="text-right">Nom</Label><Input id="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="col-span-3" required /></div>
      <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="category" className="text-right">Catégorie</Label>
        <Select value={formData.category} onValueChange={(value: string) => setFormData({...formData, category: value})}>
            <SelectTrigger className="col-span-3"><SelectValue placeholder="Choisir" /></SelectTrigger>
            <SelectContent>{categories.map(cat => <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="price" className="text-right">Prix (DT)</Label><Input id="price" type="number" step="0.1" min="0" value={formData.price} placeholder="ex: 3.50" onChange={e => setFormData({...formData, price: e.target.value})} className="col-span-3" required /></div>
      <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="unit" className="text-right">Unité</Label>
        <Select value={formData.unit} onValueChange={(value: string) => setFormData({...formData, unit: value})}>
            <SelectTrigger className="col-span-3"><SelectValue placeholder="Choisir" /></SelectTrigger>
            <SelectContent>{units.map(unit => <SelectItem key={unit} value={unit}>{unit}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <DialogFooter><Button type="button" variant="outline" onClick={onCancel}>Annuler</Button><Button type="submit">Sauvegarder</Button></DialogFooter>
    </form>
  )
}

function CategoryForm({ category, onSave, onCancel }: { category: {id?: string, name: string} | null; onSave: (data: { id?: string; name: string }) => void; onCancel: () => void; }) {
  const [name, setName] = useState(category?.name || '');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) onSave({ id: category?.id, name: name.trim() });
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="cat-name" className="text-right">Nom</Label>
            <Input id="cat-name" value={name} onChange={e => setName(e.target.value)} className="col-span-3" required />
        </div>
        <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel}>Annuler</Button>
            <Button type="submit">Sauvegarder</Button>
        </DialogFooter>
    </form>
  )
}
