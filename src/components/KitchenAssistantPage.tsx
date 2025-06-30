'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useState, useMemo } from 'react';
import { ChefHat, ShoppingBasket, Trash2, PlusCircle, Pencil, Minus, Plus, Search, Bookmark, UtensilsCrossed, BookOpen } from 'lucide-react';
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Image from 'next/image';

// Data Structures
interface Ingredient {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
}

interface RecipeIngredient {
  name: string;
  quantity: number;
  unit: string;
}

interface Recipe {
  id: string;
  title: string;
  description: string;
  country: string;
  ingredients: RecipeIngredient[];
  image: string;
}

interface BasketItem extends Ingredient {
  quantity: number;
}

// Initial Data
const initialCategories = [
  { id: 'c1', name: 'Fruits et Légumes' },
  { id: 'c2', name: 'Viandes et Poissons' },
  { id: 'c3', name: 'Produits Laitiers' },
  { id: 'c4', name: 'Boulangerie' },
  { id: 'c5', name: 'Épicerie' },
  { id: 'c6', name: 'Boissons' },
];

const units = ['pièce', 'kg', 'g', 'L', 'ml', 'boîte', 'paquet', 'botte', 'cuillère à soupe', 'cuillère à café'] as const;

const predefinedIngredients: Ingredient[] = [
    { id: 'f1', name: 'Pommes', category: 'Fruits et Légumes', price: 2.5, unit: 'kg' },
    { id: 'f3', name: 'Tomates', category: 'Fruits et Légumes', price: 4.0, unit: 'kg' },
    { id: 'v1', name: 'Filet de Poulet', category: 'Viandes et Poissons', price: 12.0, unit: 'kg' },
    { id: 'p1', name: 'Lait Entier', category: 'Produits Laitiers', price: 1.8, unit: 'L' },
    { id: 'b1', name: 'Baguette', category: 'Boulangerie', price: 0.4, unit: 'pièce' },
    { id: 'e1', name: 'Pâtes Penne', category: 'Épicerie', price: 1.5, unit: 'paquet' },
    { id: 'e2', name: 'Huile d\'olive', category: 'Épicerie', price: 15, unit: 'L' },
    { id: 'e3', name: 'Oignon', category: 'Fruits et Légumes', price: 2, unit: 'kg' },
];

const chefSuggestions: Recipe[] = [
  {
    id: 'rec1',
    title: 'Couscous Tunisien',
    description: 'Un plat emblématique et convivial, riche en saveurs et en légumes.',
    country: 'Tunisie',
    image: 'https://placehold.co/600x400.png',
    ingredients: [
      { name: 'Semoule de couscous', quantity: 500, unit: 'g' },
      { name: 'Agneau', quantity: 750, unit: 'g' },
      { name: 'Carottes', quantity: 4, unit: 'pièce' },
      { name: 'Courgettes', quantity: 4, unit: 'pièce' },
      { name: 'Pois chiches', quantity: 200, unit: 'g' },
      { name: 'Concentré de tomate', quantity: 2, unit: 'cuillère à soupe' },
      { name: 'Harissa', quantity: 1, unit: 'cuillère à café' },
    ],
  },
  {
    id: 'rec2',
    title: 'Brik à l\'œuf',
    description: 'Une entrée croustillante et savoureuse, parfaite pour commencer le repas.',
    country: 'Tunisie',
    image: 'https://placehold.co/600x400.png',
    ingredients: [
      { name: 'Feuille de brick', quantity: 8, unit: 'pièce' },
      { name: 'Œuf', quantity: 8, unit: 'pièce' },
      { name: 'Thon à l\'huile', quantity: 200, unit: 'g' },
      { name: 'Câpres', quantity: 2, unit: 'cuillère à soupe' },
      { name: 'Persil', quantity: 1, unit: 'botte' },
    ],
  },
  {
    id: 'rec3',
    title: 'Salade Méchouia',
    description: 'Une salade de poivrons et tomates grillés, fraîche et relevée.',
    country: 'Tunisie',
    image: 'https://placehold.co/600x400.png',
    ingredients: [
      { name: 'Poivrons verts', quantity: 4, unit: 'pièce' },
      { name: 'Tomates', quantity: 4, unit: 'pièce' },
      { name: 'Oignon', quantity: 1, unit: 'pièce' },
      { name: 'Ail', quantity: 3, unit: 'g' },
      { name: 'Huile d\'olive', quantity: 4, unit: 'cuillère à soupe' },
    ],
  },
];

export default function KitchenAssistantPage() {
  // Global State
  const [pantry, setPantry] = useState<Ingredient[]>(predefinedIngredients);
  const [basket, setBasket] = useState<BasketItem[]>([]);
  const [categories, setCategories] = useState(initialCategories);
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const [activeTab, setActiveTab] = useState<'pantry' | 'recipes'>('pantry');

  // Pantry State
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dialogs State
  const [isAddEditDialogOpen, setAddEditDialogOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Partial<Ingredient> | null>(null);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<{ id?: string; name: string } | null>(null);
  const [isSuggestionOpen, setSuggestionOpen] = useState(false);
  const [currentSuggestion, setCurrentSuggestion] = useState<Recipe | null>(null);
  const [viewingRecipe, setViewingRecipe] = useState<Recipe | null>(null);


  // Memoized Calculations
  const basketTotal = useMemo(() => basket.reduce((total, item) => total + item.price * item.quantity, 0), [basket]);

  const filteredPantry = useMemo(() => {
    if (!searchQuery) return pantry;
    return pantry.filter(ing => ing.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [pantry, searchQuery]);

  const groupedIngredients = useMemo(() => {
    const acc = categories.reduce((obj, cat) => ({ ...obj, [cat.name]: [] }), {} as Record<string, Ingredient[]>);
    acc['Autre'] = [];
    filteredPantry.forEach(item => {
      const categoryExists = categories.some(c => c.name === item.category);
      if (categoryExists) acc[item.category].push(item);
      else acc['Autre'].push(item);
    });
    return acc;
  }, [filteredPantry, categories]);

  // Handlers
  const handleSaveIngredient = (formData: Omit<Ingredient, 'id'> & { id?: string }) => {
    if (formData.id) {
      setPantry(prev => prev.map(ing => ing.id === formData.id ? { ...ing, ...formData } as Ingredient : ing));
    } else {
      const newIngredient = { ...formData, id: self.crypto.randomUUID() } as Ingredient;
      setPantry(prev => [...prev, newIngredient].sort((a,b) => a.name.localeCompare(b.name)));
    }
    setAddEditDialogOpen(false);
    setEditingIngredient(null);
  };
  const handleDeleteIngredient = (id: string) => setPantry(prev => prev.filter(ing => ing.id !== id));
  const openAddDialog = (category?: string) => { setEditingIngredient({ category: category || 'Autre', unit: 'pièce', price: 0, name: '' }); setAddEditDialogOpen(true); };
  const openEditDialog = (ingredient: Ingredient) => { setEditingIngredient(ingredient); setAddEditDialogOpen(true); };

  const handleSaveCategory = (formData: { id?: string; name: string }) => {
    if (formData.id) {
      setCategories(prev => prev.map(cat => cat.id === formData.id ? { ...cat, name: formData.name } : cat));
    } else {
      setCategories(prev => [...prev, { ...formData, id: self.crypto.randomUUID() }]);
    }
    setIsCategoryDialogOpen(false); setEditingCategory(null);
  };
  const handleDeleteCategory = (id: string) => {
      const isConfirmed = window.confirm(`Êtes-vous sûr de vouloir supprimer cette catégorie ?`);
      if (isConfirmed) setCategories(prev => prev.filter(cat => cat.id !== id));
  };
  const openCategoryDialog = (category?: { id: string; name: string }) => { setEditingCategory(category || { name: '' }); setIsCategoryDialogOpen(true);};

  const addToBasket = (ingredient: Ingredient) => {
    setBasket(prev => {
      const existingItem = prev.find(item => item.id === ingredient.id);
      if (existingItem) return prev.map(item => item.id === ingredient.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...ingredient, quantity: 1 }];
    });
  };
  const updateBasketQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) setBasket(prev => prev.filter(item => item.id !== id));
    else setBasket(prev => prev.map(item => item.id === id ? { ...item, quantity: newQuantity } : item));
  };
  const clearBasket = () => setBasket([]);

  const handleShowSuggestion = () => {
    const suggestion = chefSuggestions[Math.floor(Math.random() * chefSuggestions.length)];
    setCurrentSuggestion(suggestion);
    setSuggestionOpen(true);
  };

  const handleSaveRecipe = (recipe: Recipe) => {
    if (!savedRecipes.some(r => r.id === recipe.id)) {
      setSavedRecipes(prev => [...prev, recipe]);
    }
    setSuggestionOpen(false);
    setActiveTab('recipes');
  };

  const handleAddIngredientsFromRecipe = (recipe: Recipe) => {
    const newIngredients: Ingredient[] = [];
    recipe.ingredients.forEach(ing => {
        if (!pantry.some(p => p.name.toLowerCase() === ing.name.toLowerCase())) {
            newIngredients.push({
                id: self.crypto.randomUUID(),
                name: ing.name,
                category: 'Autre',
                price: 0,
                unit: ing.unit,
            });
        }
    });
    if (newIngredients.length > 0) {
      setPantry(prev => [...prev, ...newIngredients].sort((a,b) => a.name.localeCompare(b.name)));
    }
    setSuggestionOpen(false);
    setActiveTab('pantry');
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="bg-card border-b sticky top-0 z-20">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ChefHat className="h-8 w-8 text-primary" />
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">Mon assistant de courses</h1>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="relative rounded-full">
                <ShoppingBasket />
                {basket.length > 0 && <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full flex items-center justify-center bg-accent text-accent-foreground">{basket.reduce((acc, item) => acc + item.quantity, 0)}</Badge>}
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Mon Panier</SheetTitle>
                <SheetDescription>Total: {basketTotal.toFixed(2)} DT</SheetDescription>
              </SheetHeader>
              <ScrollArea className="h-[calc(100vh-200px)] pr-4">
                {basket.length > 0 ? (
                  <ul className="space-y-3 py-4">
                    {basket.map(item => (
                      <li key={item.id} className="flex flex-col gap-2 bg-secondary/50 p-3 rounded-md">
                        <div className='flex justify-between items-center'><span className='font-semibold'>{item.name}</span><span className='font-bold text-primary'>{(item.price * item.quantity).toFixed(2)} DT</span></div>
                        <div className='flex justify-between items-center'><span className='text-sm text-muted-foreground'>{item.price.toFixed(2)} DT / {item.unit}</span>
                          <div className='flex items-center gap-2'>
                             <Button variant="ghost" size="icon" className='h-7 w-7 rounded-full' onClick={() => updateBasketQuantity(item.id, item.quantity - 1)}><Minus className='h-4 w-4'/></Button>
                             <span className='font-bold w-4 text-center'>{item.quantity}</span>
                             <Button variant="ghost" size="icon" className='h-7 w-7 rounded-full' onClick={() => updateBasketQuantity(item.id, item.quantity + 1)}><Plus className='h-4 w-4'/></Button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : <p className="text-sm text-muted-foreground text-center mt-8">Votre panier est vide.</p>}
              </ScrollArea>
              <SheetFooter className='pt-4 border-t'>
                  <Button variant="outline" onClick={clearBasket} className="w-full" disabled={basket.length === 0}><Trash2 className="h-4 w-4 mr-2" /> Vider le panier</Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
        <nav className="bg-card/50 border-b">
          <div className="container mx-auto px-4 flex justify-center gap-2">
            <Button variant={activeTab === 'pantry' ? 'secondary': 'ghost'} onClick={() => setActiveTab('pantry')} className="flex-1 md:flex-none"><UtensilsCrossed className="mr-2 h-4 w-4"/>Garde-Manger</Button>
            <Button variant={activeTab === 'recipes' ? 'secondary': 'ghost'} onClick={() => setActiveTab('recipes')} className="flex-1 md:flex-none"><BookOpen className="mr-2 h-4 w-4"/>Mes Recettes</Button>
          </div>
        </nav>
      </header>

      <main className="container mx-auto p-4 md:p-6 lg:p-8 flex-grow">
        <div className="animate-in fade-in-50">
          {activeTab === 'pantry' && (
            <div>
              <div className="relative mb-6">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input type="search" placeholder="Rechercher un ingrédient..." className="pl-11 rounded-full" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {Object.entries(groupedIngredients).filter(([catName, items]) => items.length > 0 || catName === 'Autre' && categories.some(c => c.name === 'Autre')).map(([categoryName, items]) => {
                       const category = categories.find(c => c.name === categoryName) || {id: 'c-autre', name: 'Autre'};
                       return (
                        <Card key={category.id} className="flex flex-col bg-card shadow-sm hover:shadow-md transition-shadow">
                          <CardHeader className="flex flex-row items-center justify-between">
                              <CardTitle className="text-primary">{category.name}</CardTitle>
                              {category.id !== 'c-autre' && <div className="flex items-center">
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openCategoryDialog(category)}><Pencil className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteCategory(category.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                              </div>}
                          </CardHeader>
                          <CardContent className="flex-grow"><ScrollArea className="h-64"><ul className="space-y-2 pr-3">
                            {items.map(item => (
                              <li key={item.id} className="flex items-center justify-between p-2 rounded-md hover:bg-secondary/50 transition-colors">
                                  <div><span className='font-medium'>{item.name}</span><p className='text-sm text-muted-foreground'>{item.price.toFixed(2)} DT / {item.unit}</p></div>
                                  <div className='flex items-center gap-1'>
                                    <Button variant="ghost" size="icon" className='h-8 w-8 rounded-full' onClick={() => addToBasket(item)}><Plus className="h-4 w-4" /></Button>
                                    <Button variant="ghost" size="icon" className='h-8 w-8 rounded-full' onClick={() => openEditDialog(item)}><Pencil className="h-4 w-4" /></Button>
                                    <Button variant="ghost" size="icon" className='h-8 w-8 rounded-full' onClick={() => handleDeleteIngredient(item.id)}><Trash2 className="h-4 w-4 text-destructive/80" /></Button>
                                  </div>
                              </li>))}
                          </ul></ScrollArea></CardContent>
                          <CardFooter><Button variant="outline" className="w-full" onClick={() => openAddDialog(category.name)}><PlusCircle className="mr-2 h-4 w-4" /> Ajouter un produit</Button></CardFooter>
                        </Card>
                       )
                  })}
                  <Card className="flex flex-col items-center justify-center border-2 border-dashed bg-card/50 hover:border-primary hover:text-primary transition-colors cursor-pointer min-h-[300px]" onClick={() => openCategoryDialog()}>
                    <PlusCircle className="h-10 w-10 mb-2" />
                    <span className="font-semibold">Ajouter une catégorie</span>
                  </Card>
              </div>
            </div>
          )}
          {activeTab === 'recipes' && (
            <div>
                <Card className='mb-8 bg-gradient-to-br from-primary/80 to-primary text-primary-foreground text-center p-6'>
                    <CardHeader><CardTitle>À la recherche d'inspiration ?</CardTitle><CardDescription className="text-primary-foreground/80">Laissez notre chef vous proposer un plat savoureux !</CardDescription></CardHeader>
                    <CardContent><Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={handleShowSuggestion}>Suggestion du Chef</Button></CardContent>
                </Card>
                <h2 className='text-2xl font-bold mb-4'>Mes Recettes Sauvegardées</h2>
                {savedRecipes.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {savedRecipes.map(recipe => (
                            <Card key={recipe.id} className="overflow-hidden">
                                <Image src={recipe.image} alt={recipe.title} width={400} height={200} className="w-full h-40 object-cover"/>
                                <CardHeader><CardTitle>{recipe.title}</CardTitle><Badge variant="secondary" className="mt-2 w-fit">{recipe.country}</Badge></CardHeader>
                                <CardContent><p className="text-sm text-muted-foreground">{recipe.description}</p></CardContent>
                                <CardFooter className="flex justify-between">
                                    <Button onClick={() => setViewingRecipe(recipe)}>Voir la recette</Button>
                                    <Button variant="ghost" size="icon" onClick={() => setSavedRecipes(prev => prev.filter(r => r.id !== recipe.id))}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                ) : <p className="text-muted-foreground text-center py-8">Aucune recette sauvegardée pour le moment.</p>}
            </div>
          )}
        </div>
      </main>

      {/* --- DIALOGS --- */}
      <Dialog open={isAddEditDialogOpen} onOpenChange={setAddEditDialogOpen}>
        <DialogContent>
            <DialogHeader><DialogTitle>{editingIngredient?.id ? "Modifier" : "Ajouter"} un produit</DialogTitle></DialogHeader>
            <IngredientForm key={editingIngredient?.id || 'new'} ingredient={editingIngredient} categories={categories} onSave={handleSaveIngredient} formId="ingredient-form" />
            <DialogFooter><Button variant="outline" onClick={() => setAddEditDialogOpen(false)}>Annuler</Button><Button type="submit" form="ingredient-form">Sauvegarder</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent>
            <DialogHeader><DialogTitle>{editingCategory?.id ? "Modifier" : "Ajouter"} une catégorie</DialogTitle></DialogHeader>
            <CategoryForm key={editingCategory?.id || 'new-cat'} category={editingCategory} onSave={handleSaveCategory} formId="category-form"/>
            <DialogFooter><Button variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>Annuler</Button><Button type="submit" form="category-form">Sauvegarder</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isSuggestionOpen} onOpenChange={setSuggestionOpen}>
        {currentSuggestion && <DialogContent className="max-w-md">
            <DialogHeader>
                <DialogTitle>{currentSuggestion.title}</DialogTitle>
                <DialogDescription>{currentSuggestion.country} - {currentSuggestion.description}</DialogDescription>
            </DialogHeader>
            <Image src={currentSuggestion.image} alt={currentSuggestion.title} width={600} height={400} className="w-full h-48 object-cover rounded-md mt-2"/>
            <h4 className='font-semibold mt-4'>Ingrédients :</h4>
            <ScrollArea className="h-32"><ul className='list-disc pl-5 text-sm space-y-1'>
                {currentSuggestion.ingredients.map(ing => <li key={ing.name}>{ing.quantity} {ing.unit} de {ing.name}</li>)}
            </ul></ScrollArea>
            <DialogFooter className="sm:justify-between gap-2 mt-4">
                <Button variant="secondary" onClick={() => handleAddIngredientsFromRecipe(currentSuggestion)}>Ajouter au garde-manger</Button>
                <Button className="bg-primary" onClick={() => handleSaveRecipe(currentSuggestion)}><Bookmark className="mr-2 h-4 w-4"/>Sauvegarder</Button>
            </DialogFooter>
        </DialogContent>}
      </Dialog>
      <Dialog open={!!viewingRecipe} onOpenChange={(open) => !open && setViewingRecipe(null)}>
        {viewingRecipe && <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>{viewingRecipe.title}</DialogTitle><DialogDescription>{viewingRecipe.country} - {viewingRecipe.description}</DialogDescription></DialogHeader>
            <Image src={viewingRecipe.image} alt={viewingRecipe.title} width={600} height={400} className="w-full h-48 object-cover rounded-md mt-2"/>
            <h4 className='font-semibold mt-4'>Ingrédients :</h4>
            <ScrollArea className="h-40"><ul className='list-disc pl-5 text-sm space-y-1'>
                {viewingRecipe.ingredients.map(ing => <li key={ing.name}>{ing.quantity} {ing.unit} de {ing.name}</li>)}
            </ul></ScrollArea>
            <DialogFooter><DialogClose asChild><Button type="button">Fermer</Button></DialogClose></DialogFooter>
        </DialogContent>}
      </Dialog>
    </div>
  );
}

// Sub-components for forms
function IngredientForm({ ingredient, categories, onSave, formId }: { ingredient: Partial<Ingredient> | null; categories: {id: string; name: string}[]; onSave: (data: Omit<Ingredient, 'id'> & { id?: string }) => void; formId: string }) {
  const [formData, setFormData] = useState({ name: ingredient?.name || '', category: ingredient?.category || categories[0]?.name || 'Autre', price: ingredient?.price !== undefined ? String(ingredient.price) : '', unit: ingredient?.unit || 'pièce', });
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave({ ...formData, price: parseFloat(formData.price) || 0, id: ingredient?.id }); };
  return (
    <form id={formId} onSubmit={handleSubmit} className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="name" className="text-right">Nom</Label><Input id="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="col-span-3" required /></div>
      <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="category" className="text-right">Catégorie</Label>
        <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
            <SelectTrigger className="col-span-3"><SelectValue placeholder="Choisir" /></SelectTrigger>
            <SelectContent>{categories.map(cat => <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="price" className="text-right">Prix (DT)</Label><Input id="price" type="number" step="0.1" min="0" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="col-span-3" required /></div>
      <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="unit" className="text-right">Unité</Label>
        <Select value={formData.unit} onValueChange={(value) => setFormData({...formData, unit: value})}>
            <SelectTrigger className="col-span-3"><SelectValue placeholder="Choisir" /></SelectTrigger>
            <SelectContent>{[...units].map(unit => <SelectItem key={unit} value={unit}>{unit}</SelectItem>)}</SelectContent>
        </Select>
      </div>
    </form>
  )
}

function CategoryForm({ category, onSave, formId }: { category: {id?: string, name: string} | null; onSave: (data: { id?: string; name: string }) => void; formId: string }) {
  const [name, setName] = useState(category?.name || '');
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); if (name.trim()) onSave({ id: category?.id, name: name.trim() }); };
  return (
    <form id={formId} onSubmit={handleSubmit} className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="cat-name" className="text-right">Nom</Label><Input id="cat-name" value={name} onChange={e => setName(e.target.value)} className="col-span-3" required /></div>
    </form>
  )
}
