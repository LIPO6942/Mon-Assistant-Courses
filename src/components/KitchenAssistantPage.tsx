'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useState, useMemo } from 'react';
import { ChefHat, ShoppingBasket, Trash2, PlusCircle, Pencil, Minus, Plus } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const categories = [
  'Fruits et Légumes',
  'Viandes et Poissons',
  'Produits Laitiers',
  'Boulangerie',
  'Épicerie',
  'Boissons',
  'Surgelés',
  'Maison',
  'Autre',
] as const;
type Category = (typeof categories)[number];

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

interface Recipe {
  title: string;
  description: string;
  ingredients: string[];
}

const predefinedIngredients: Ingredient[] = [
    { id: 'f1', name: 'Pommes', category: 'Fruits et Légumes', price: 2.5, unit: 'kg' },
    { id: 'f2', name: 'Bananes', category: 'Fruits et Légumes', price: 3.0, unit: 'kg' },
    { id: 'f3', name: 'Tomates', category: 'Fruits et Légumes', price: 4.0, unit: 'kg' },
    { id: 'f4', name: 'Laitue', category: 'Fruits et Légumes', price: 1.5, unit: 'pièce' },
    { id: 'v1', name: 'Filet de Poulet', category: 'Viandes et Poissons', price: 12.0, unit: 'kg' },
    { id: 'v2', name: 'Saumon Frais', category: 'Viandes et Poissons', price: 25.0, unit: 'kg' },
    { id: 'v3', name: 'Steak de boeuf', category: 'Viandes et Poissons', price: 20.0, unit: 'kg' },
    { id: 'p1', name: 'Lait Entier', category: 'Produits Laitiers', price: 1.8, unit: 'L' },
    { id: 'p2', name: 'Yaourt nature', category: 'Produits Laitiers', price: 0.8, unit: 'pot' },
    { id: 'p3', name: 'Fromage Emmental', category: 'Produits Laitiers', price: 15.0, unit: 'kg' },
    { id: 'b1', name: 'Baguette Tradition', category: 'Boulangerie', price: 1.2, unit: 'pièce' },
    { id: 'b2', name: 'Croissant au beurre', category: 'Boulangerie', price: 1.0, unit: 'pièce' },
    { id: 'e1', name: 'Pâtes Penne', category: 'Épicerie', price: 1.5, unit: '500g' },
    { id: 'e2', name: 'Riz Basmati', category: 'Épicerie', price: 2.0, unit: 'kg' },
    { id: 'e3', name: 'Huile d\'olive vierge', category: 'Épicerie', price: 8.0, unit: 'L' },
    { id: 'bo1', name: 'Eau Minérale', category: 'Boissons', price: 0.5, unit: '1.5L' },
    { id: 'bo2', name: 'Jus de Pomme Bio', category: 'Boissons', price: 2.5, unit: 'L' },
];

const predefinedRecipes: Recipe[] = [
    { title: 'Spaghetti Aglio e Olio', description: 'Un classique italien simple et savoureux, parfait pour un repas rapide.', ingredients: ['Spaghetti', 'Ail', 'Huile d\'olive', 'Piment rouge', 'Persil'] },
    { title: 'Omelette aux champignons', description: 'Facile et rapide, une omelette est toujours une bonne idée pour un repas léger.', ingredients: ['Oeufs', 'Champignons', 'Beurre', 'Sel', 'Poivre'] },
    { title: 'Salade César', description: 'Une salade iconique et gourmande avec son poulet grillé et sa sauce onctueuse.', ingredients: ['Laitue romaine', 'Poulet', 'Croûtons', 'Parmesan', 'Sauce César'] },
    { title: 'Soupe de lentilles corail', description: 'Une soupe réconfortante et épicée, aux saveurs orientales.', ingredients: ['Lentilles corail', 'Oignon', 'Carottes', 'Lait de coco', 'Curry'] },
    { title: 'Avocado Toast', description: 'Le petit-déjeuner ou brunch tendance, sain et délicieux.', ingredients: ['Pain de campagne', 'Avocat', 'Citron', 'Flocons de piment', 'Oeuf poché (optionnel)'] }
];


export default function KitchenAssistantPage() {
  const [ingredients, setIngredients] = useState<Ingredient[]>(predefinedIngredients);
  const [basket, setBasket] = useState<BasketItem[]>([]);
  const [budget, setBudget] = useState(100);
  const [budgetInput, setBudgetInput] = useState('100');

  const [isAddEditDialogOpen, setAddEditDialogOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Partial<Ingredient> | null>(null);
  
  const [isRecipeDialogOpen, setIsRecipeDialogOpen] = useState(false);
  const [suggestedRecipe, setSuggestedRecipe] = useState<Recipe | null>(null);

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
  
  const handleSaveIngredient = (formData: Omit<Ingredient, 'id'> & { id?: string }) => {
    if (formData.id && ingredients.some(i => i.id === formData.id)) {
      setIngredients(prev => prev.map(ing => ing.id === formData.id ? { ...ing, ...formData } as Ingredient : ing));
    } else {
      const newIngredient = { ...formData, id: self.crypto.randomUUID() } as Ingredient;
      setIngredients(prev => [...prev, newIngredient].sort((a,b) => a.name.localeCompare(b.name)));
    }
    setAddEditDialogOpen(false);
    setEditingIngredient(null);
  };

  const handleDeleteIngredient = (id: string) => {
    setIngredients(prev => prev.filter(ing => ing.id !== id));
  };
  
  const openAddDialog = (category?: Category) => {
    setEditingIngredient({ category: category || 'Autre', price: 0, unit: 'pièce' });
    setAddEditDialogOpen(true);
  };

  const openEditDialog = (ingredient: Ingredient) => {
    setEditingIngredient(ingredient);
    setAddEditDialogOpen(true);
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
    const allCategories = [...categories];
    const acc = allCategories.reduce((obj, cat) => ({ ...obj, [cat]: [] }), {} as Record<Category, Ingredient[]>);
    ingredients.forEach(item => {
        if (acc[item.category]) acc[item.category].push(item);
    });
    return acc;
  }, [ingredients]);

  const handleSuggestRecipe = () => {
    if (predefinedRecipes.length > 0) {
      const randomIndex = Math.floor(Math.random() * predefinedRecipes.length);
      setSuggestedRecipe(predefinedRecipes[randomIndex]);
      setIsRecipeDialogOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-secondary/40">
      <header className="bg-card border-b sticky top-0 z-20">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ChefHat className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">Assistant de Courses</h1>
          </div>
           <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={handleSuggestRecipe}>
                  <ChefHat className="mr-2 h-4 w-4" />
                  Suggestion du Chef
              </Button>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-4 p-2 rounded-lg border bg-background shadow-sm">
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
                  <SheetDescription>Articles sélectionnés pour vos courses.</SheetDescription>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-180px)] pr-4">
                  {basket.length > 0 ? (
                    <ul className="space-y-3 py-4">
                      {basket.map(item => (
                        <li key={item.id} className="flex flex-col gap-2 bg-secondary p-3 rounded-md">
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
        </div>
      </header>

      <main className="container mx-auto p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(Object.keys(groupedIngredients) as Category[]).map(category => (
            <Card key={category} className="flex flex-col">
                <CardHeader>
                    <CardTitle className="text-primary">{category}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                    <ScrollArea className="h-64">
                        <ul className="space-y-2 pr-3">
                            {groupedIngredients[category].length > 0 ? groupedIngredients[category].map(item => (
                            <li key={item.id} className="flex items-center justify-between bg-secondary/70 p-2 rounded-md">
                                <div>
                                <span className='font-medium'>{item.name}</span>
                                <p className='text-sm text-muted-foreground'>{item.price.toFixed(2)} DT / {item.unit}</p>
                                </div>
                                <div className='flex items-center gap-1'>
                                <Button variant="ghost" size="sm" onClick={() => addToBasket(item)}>Ajouter</Button>
                                <Button variant="ghost" size="icon" className='h-8 w-8' onClick={() => openEditDialog(item)}><Pencil className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" className='h-8 w-8' onClick={() => handleDeleteIngredient(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                </div>
                            </li>
                            )) : (
                                <p className="text-sm text-muted-foreground text-center py-10">Aucun produit dans cette catégorie.</p>
                            )}
                        </ul>
                    </ScrollArea>
                </CardContent>
                <CardFooter>
                    <Button variant="outline" className="w-full" onClick={() => openAddDialog(category)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Ajouter un produit
                    </Button>
                </CardFooter>
            </Card>
        ))}
      </main>

      <Dialog open={isAddEditDialogOpen} onOpenChange={setAddEditDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{editingIngredient?.id ? "Modifier le produit" : "Ajouter un produit"}</DialogTitle>
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
      
      <Dialog open={isRecipeDialogOpen} onOpenChange={setIsRecipeDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{suggestedRecipe?.title}</DialogTitle>
                <DialogDescription>{suggestedRecipe?.description}</DialogDescription>
            </DialogHeader>
            <div className="py-2">
                <h4 className="font-semibold mb-2 text-foreground">Ingrédients suggérés :</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {suggestedRecipe?.ingredients.map(ing => <li key={ing}>{ing}</li>)}
                </ul>
            </div>
            <DialogFooter>
                <Button type="button" onClick={() => setIsRecipeDialogOpen(false)}>Fermer</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function IngredientForm({
  ingredient,
  onSave,
  onCancel,
}: {
  ingredient: Partial<Ingredient> | null;
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
        <Input id="price" type="number" step="0.1" min="0" value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value) || 0})} className="col-span-3" required />
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
