
'use client';

import { useState, useMemo, useEffect } from 'react';
import { ChefHat, ShoppingBasket, Bookmark, UtensilsCrossed, BookOpen, Dices, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetTrigger, SheetDescription } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

import { initialCategories, predefinedIngredients, chefSuggestions, streetFoodOptions } from '@/lib/data';
import type { Ingredient, Recipe, BasketItem, CategoryDef } from '@/lib/types';
import IngredientForm from './IngredientForm';
import CategoryForm from './CategoryForm';
import PantryView from './PantryView';
import RecipesView from './RecipesView';
import BasketSheet from './BasketSheet';


export default function KitchenAssistantPage() {
  // Global State
  const [pantry, setPantry] = useState<Ingredient[]>(predefinedIngredients);
  const [basket, setBasket] = useState<BasketItem[]>([]);
  const [categories, setCategories] = useState<CategoryDef[]>(initialCategories);
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

  // New features state
  const [budget, setBudget] = useState<number | null>(null);
  const [budgetInput, setBudgetInput] = useState<string>('');
  const [isDecisionWheelOpen, setIsDecisionWheelOpen] = useState(false);
  const [decisionResult, setDecisionResult] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [decisionMessage, setDecisionMessage] = useState<string | null>(null);

  // Load budget from localStorage on mount
  useEffect(() => {
    const savedBudget = localStorage.getItem('shoppingBudget');
    if (savedBudget && !isNaN(parseFloat(savedBudget))) {
        const parsedBudget = parseFloat(savedBudget);
        setBudget(parsedBudget);
        setBudgetInput(String(parsedBudget.toFixed(2)));
    }
  }, []);

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
      const categoryToDelete = categories.find(c => c.id === id);
      if (!categoryToDelete) return;

      const isConfirmed = window.confirm(`Êtes-vous sûr de vouloir supprimer la catégorie "${categoryToDelete.name}" ? Les produits de cette catégorie seront déplacés vers "Autre".`);
      if (isConfirmed) {
          setPantry(prevPantry => 
              prevPantry.map(ing => 
                  ing.category === categoryToDelete.name ? {...ing, category: 'Autre'} : ing
              )
          );
          setCategories(prev => prev.filter(cat => cat.id !== id));
      }
  };
  const openCategoryDialog = (category?: CategoryDef) => { setEditingCategory(category || { name: '' }); setIsCategoryDialogOpen(true);};

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
                price: 0, // Price is unknown
                unit: ing.unit,
            });
        }
    });
    if (newIngredients.length > 0) {
      setPantry(prev => [...prev, ...newIngredients].sort((a,b) => a.name.localeCompare(b.name)));
      alert(`${newIngredients.length} ingrédient(s) manquant(s) ont été ajoutés à votre garde-manger dans la catégorie "Autre". Pensez à y mettre un prix !`);
    } else {
      alert("Vous avez déjà tous les ingrédients pour cette recette !");
    }
    setSuggestionOpen(false);
    setActiveTab('pantry');
  };
  
  const handleSetBudget = () => {
    const newBudget = parseFloat(budgetInput);
    if (!isNaN(newBudget) && newBudget >= 0) {
        setBudget(newBudget);
        localStorage.setItem('shoppingBudget', String(newBudget));
    } else {
        setBudget(null);
        setBudgetInput('');
        localStorage.removeItem('shoppingBudget');
    }
  };
  
  const getSeasonalStreetFood = () => {
    const month = new Date().getMonth(); // 0-11 (Jan-Dec)
    const isLablebiSeason = (month >= 8 && month <= 10) || (month === 11 || month <= 1); // Sept-Feb
    const options = [...streetFoodOptions];
    if (isLablebiSeason) {
        options.push('Lablebi Royal');
    }
    return options;
  };
  
  const getFunnyMessage = (result: string) => {
    const messages = [
        `Alors, on dirait que le destin a choisi pour vous : un bon ${result} !`,
        `Ce soir, c'est soirée ${result} ! Régalez-vous bien.`,
        `Plus besoin de réfléchir, l'univers vous envoie un ${result}. Bon appétit !`,
        `Le verdict est tombé ! Ce sera ${result}. La flemme a du bon, non ?`,
    ];
    // Special cases
    if (result.toLowerCase().includes('lablebi')) {
        return `Parfait pour se réchauffer ! Le ${result} vous attend, n'oubliez pas le pain.`;
    }
    if (result.toLowerCase().includes('fricassé')) {
        return `Attention à la harissa ! Un ${result} bien tunisien, ça se respecte.`;
    }
     if (result.toLowerCase().includes('maqloub')) {
        return `Le Tacos Maqloub, le choix des connaisseurs. Un vrai délice !`;
    }
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const handleSpinWheel = () => {
      setIsSpinning(true);
      setDecisionResult(null);
      setDecisionMessage(null);
      const options = getSeasonalStreetFood();
      setTimeout(() => {
          const randomIndex = Math.floor(Math.random() * options.length);
          const result = options[randomIndex];
          setDecisionResult(result);
          setDecisionMessage(getFunnyMessage(result));
          setIsSpinning(false);
      }, 2000); // 2 second spin
  };

  const openDecisionWheel = () => {
    setDecisionResult(null); 
    setDecisionMessage(null);
    setIsDecisionWheelOpen(true);
  }
  
  const handleConfirmPurchase = () => {
    if (budget !== null) {
      const newBudget = budget - basketTotal;
      setBudget(newBudget);
      setBudgetInput(newBudget.toFixed(2));
      localStorage.setItem('shoppingBudget', String(newBudget));
    }
    clearBasket();
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
            <BasketSheet 
              basket={basket}
              basketTotal={basketTotal}
              budget={budget}
              budgetInput={budgetInput}
              setBudgetInput={setBudgetInput}
              handleSetBudget={handleSetBudget}
              updateBasketQuantity={updateBasketQuantity}
              clearBasket={clearBasket}
              handleConfirmPurchase={handleConfirmPurchase}
            />
          </Sheet>
        </div>
        <nav className="bg-card/50 border-b">
          <div className="container mx-auto px-4 flex justify-center gap-2">
            <Button variant={activeTab === 'pantry' ? 'secondary': 'ghost'} onClick={() => setActiveTab('pantry')} className="flex-1 md:flex-none"><UtensilsCrossed className="mr-2 h-4 w-4"/>Garde-Manger</Button>
            <Button variant={activeTab === 'recipes' ? 'secondary': 'ghost'} onClick={() => setActiveTab('recipes')} className="flex-1 md:flex-none"><BookOpen className="mr-2 h-4 w-4"/>Recettes & Idées</Button>
          </div>
        </nav>
      </header>

      <main className="container mx-auto p-4 md:p-6 lg:p-8 flex-grow">
        <div className="animate-in fade-in-50">
          {activeTab === 'pantry' && (
            <PantryView 
              groupedIngredients={groupedIngredients}
              categories={categories}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              addToBasket={addToBasket}
              openAddDialog={openAddDialog}
              openEditDialog={openEditDialog}
              handleDeleteIngredient={handleDeleteIngredient}
              openCategoryDialog={openCategoryDialog}
              handleDeleteCategory={handleDeleteCategory}
            />
          )}
          {activeTab === 'recipes' && (
            <RecipesView 
              savedRecipes={savedRecipes}
              handleShowSuggestion={handleShowSuggestion}
              setIsDecisionWheelOpen={openDecisionWheel}
              setViewingRecipe={setViewingRecipe}
              setSavedRecipes={setSavedRecipes}
            />
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
        {currentSuggestion && <DialogContent className="max-w-lg">
            <DialogHeader>
                <DialogTitle>{currentSuggestion.title}</DialogTitle>
                <DialogDescription>{currentSuggestion.country} - {currentSuggestion.description}</DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-72 my-2 border rounded-md p-4">
                <h4 className='font-semibold'>Ingrédients :</h4>
                <ul className='list-disc pl-5 text-sm space-y-1 my-2'>
                    {currentSuggestion.ingredients.map(ing => <li key={ing.name}>{ing.quantity} {ing.unit} de {ing.name}</li>)}
                </ul>
                 <h4 className='font-semibold mt-4'>Préparation :</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap mt-2">{currentSuggestion.preparation}</p>
            </ScrollArea>
            <DialogFooter className="sm:justify-between gap-2 mt-4">
                <Button variant="secondary" onClick={() => handleAddIngredientsFromRecipe(currentSuggestion)}>Ajouter les manquants</Button>
                <Button className="bg-primary" onClick={() => handleSaveRecipe(currentSuggestion)}><Bookmark className="mr-2 h-4 w-4"/>Sauvegarder</Button>
            </DialogFooter>
        </DialogContent>}
      </Dialog>
      <Dialog open={!!viewingRecipe} onOpenChange={(open) => !open && setViewingRecipe(null)}>
        {viewingRecipe && <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{viewingRecipe.title}</DialogTitle><DialogDescription>{viewingRecipe.country} - {viewingRecipe.description}</DialogDescription></Header>
            <ScrollArea className="h-72 my-2 border rounded-md p-4">
                <h4 className='font-semibold'>Ingrédients :</h4>
                <ul className='list-disc pl-5 text-sm space-y-1 my-2'>
                    {viewingRecipe.ingredients.map(ing => <li key={ing.name}>{ing.quantity} {ing.unit} de {ing.name}</li>)}
                </ul>
                <h4 className='font-semibold mt-4'>Préparation :</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap mt-2">{viewingRecipe.preparation}</p>
            </ScrollArea>
            <DialogFooter><DialogClose asChild><Button type="button">Fermer</Button></DialogClose></DialogFooter>
        </DialogContent>}
      </Dialog>
       <Dialog open={isDecisionWheelOpen} onOpenChange={(open) => { if (!open) setIsDecisionWheelOpen(false); }}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>La Roue de la Flemme</DialogTitle>
                    <DialogDescription>Que manger ce soir ? Faites tourner la roue !</DialogDescription>
                </DialogHeader>
                <div className="flex flex-col items-center justify-center p-8 gap-6 min-h-[150px]">
                    {isSpinning ? (
                        <RotateCw className="h-16 w-16 text-primary animate-spin" />
                    ) : decisionResult ? (
                        <div className="text-center animate-in fade-in-50 zoom-in-95">
                            <p className="text-3xl font-bold text-primary">{decisionResult} !</p>
                            {decisionMessage && <p className="text-sm text-muted-foreground mt-2">{decisionMessage}</p>}
                        </div>
                    ) : (
                        <Dices className="h-16 w-16 text-muted-foreground" />
                    )}
                </div>
                <DialogFooter>
                    <Button onClick={handleSpinWheel} disabled={isSpinning} className="w-full">
                        {isSpinning ? (<><RotateCw className="mr-2 h-4 w-4 animate-spin"/> Ça tourne...</>) : "Faire tourner !"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
  );
}
