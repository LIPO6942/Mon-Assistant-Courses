'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useState, useMemo } from 'react';
import { ChefHat, ShoppingBasket, Trash2, PlusCircle, Pencil, Minus, Plus, Search } from 'lucide-react';
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
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

export default function KitchenAssistantPage() {
  const [categories, setCategories] = useState(initialCategories);
  const [ingredients, setIngredients] = useState<Ingredient[]>(predefinedIngredients);
  const [basket, setBasket] = useState<BasketItem[]>([]);
  const [budget, setBudget] = useState(100);
  const [budgetInput, setBudgetInput] = useState('100');

  const [searchQuery, setSearchQuery] = useState('');

  const [isAddEditDialogOpen, setAddEditDialogOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Partial<Ingredient> | null>(null);
  
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<{ id?: string; name: string } | null>(null);

  const basketTotal = useMemo(() => {
    return basket.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [basket]);

  const remainingBudget = useMemo(() => budget - basketTotal, [budget, basketTotal]);

  const filteredIngredients = useMemo(() => {
    if (!searchQuery) return ingredients;
    return ingredients.filter(ing =>
      ing.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [ingredients, searchQuery]);

  const groupedIngredients = useMemo(() => {
    const acc = categories.reduce((obj, cat) => ({ ...obj, [cat.name]: [] }), {} as Record<string, Ingredient[]>);
    filteredIngredients.forEach(item => {
      if (acc[item.category]) acc[item.category].push(item);
      else {
          if (!acc['Autre']) acc['Autre'] = [];
          acc['Autre'].push(item);
      }
    });
    return acc;
  }, [filteredIngredients, categories]);


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
    setEditingIngredient({ category: category || 'Autre', unit: 'pièce', price: 0, name: '' });
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
  };
  
  const confirmDeleteCategory = (category: { id: string; name: string }) => {
    const isConfirmed = window.confirm(`Êtes-vous sûr de vouloir supprimer la catégorie "${category.name}" ?\nCette action est irréversible.`);
    if (isConfirmed) {
      handleDeleteCategory(category.id);
    }
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


  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="bg-card border-b sticky top-0 z-20">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ChefHat className="h-8 w-8 text-primary" />
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">Mon assistant de courses</h1>
          </div>
          <div className="flex items-center gap-2">
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
                  <SheetDescription>Articles à acheter.</SheetDescription>
                </SheetHeader>
                <div className='my-4 p-3 rounded-lg border bg-secondary/30 space-y-2'>
                    <div className='flex items-center gap-2'>
                      <Label htmlFor="budget" className='font-semibold text-sm'>Budget:</Label>
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
                <ScrollArea className="h-[calc(100vh-280px)] pr-4">
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

      <main className="container mx-auto p-4 md:p-6 lg:p-8">
        <div className="animate-in fade-in-50">
            <div className="relative mb-6">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                    type="search"
                    placeholder="Rechercher un ingrédient..." 
                    className="pl-11" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {categories.map(category => (
                    <Card key={category.id} className="flex flex-col bg-card shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-primary">{category.name}</CardTitle>
                            <div className="flex items-center">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openCategoryDialog(category)}><Pencil className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => confirmDeleteCategory(category)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
        </div>
      </main>
      
      {/* --- DIALOGS --- */}
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
              formId="ingredient-form"
            />
            <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setAddEditDialogOpen(false)}>Annuler</Button>
                <Button type="submit" form="ingredient-form">Sauvegarder</Button>
            </DialogFooter>
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
              formId="category-form"
            />
            <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>Annuler</Button>
                <Button type="submit" form="category-form">Sauvegarder</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
      
    </div>
  );
}

function IngredientForm({ ingredient, categories, onSave, formId }: { ingredient: Partial<Ingredient> | null; categories: {id: string; name: string}[]; onSave: (data: Omit<Ingredient, 'id'> & { id?: string }) => void; formId: string }) {
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
    <form id={formId} onSubmit={handleSubmit} className="grid gap-4 py-4">
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
    </form>
  )
}

function CategoryForm({ category, onSave, formId }: { category: {id?: string, name: string} | null; onSave: (data: { id?: string; name: string }) => void; formId: string }) {
  const [name, setName] = useState(category?.name || '');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) onSave({ id: category?.id, name: name.trim() });
  };

  return (
    <form id={formId} onSubmit={handleSubmit} className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="cat-name" className="text-right">Nom</Label>
            <Input id="cat-name" value={name} onChange={e => setName(e.target.value)} className="col-span-3" required />
        </div>
    </form>
  )
}
