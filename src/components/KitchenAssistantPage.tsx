
'use client';

import { useState, useMemo, useEffect } from 'react';
import { initialCategories, predefinedIngredients, discoverableRecipes } from '@/lib/data';
import type { Ingredient, Recipe, BasketItem, CategoryDef } from '@/lib/types';

import AppHeader from './AppHeader';
import AppNav from './AppNav';
import KitchenAssistantDialogs from './KitchenAssistantDialogs';
import PantryView from './PantryView';
import RecipesView from './RecipesView';

export default function KitchenAssistantPage() {
  // --- STATE MANAGEMENT ---
  // We initialize state with default values.
  // Then, a useEffect will run once on the client to load persisted data from localStorage.
  const [pantry, setPantry] = useState<Ingredient[]>(predefinedIngredients);
  const [basket, setBasket] = useState<BasketItem[]>([]);
  const [categories, setCategories] = useState<CategoryDef[]>(initialCategories);
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const [budget, setBudget] = useState(200);
  
  // Ephemeral state, doesn't need to be saved
  const [activeTab, setActiveTab] = useState<'pantry' | 'recipes'>('pantry');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dialogs State
  const [isAddEditDialogOpen, setAddEditDialogOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Partial<Ingredient> | null>(null);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<{ id?: string; name: string } | null>(null);
  const [viewingRecipe, setViewingRecipe] = useState<Recipe | null>(null);

  // --- LOCALSTORAGE PERSISTENCE ---

  // On initial client-side render, load all data from localStorage
  useEffect(() => {
    try {
      const storedPantry = localStorage.getItem('pantry-data');
      if (storedPantry) setPantry(JSON.parse(storedPantry));

      const storedBasket = localStorage.getItem('basket-data');
      if (storedBasket) setBasket(JSON.parse(storedBasket));

      const storedCategories = localStorage.getItem('categories-data');
      if (storedCategories) setCategories(JSON.parse(storedCategories));

      const storedSavedRecipes = localStorage.getItem('saved-recipes-data');
      if (storedSavedRecipes) setSavedRecipes(JSON.parse(storedSavedRecipes));

      const storedBudget = localStorage.getItem('budget-data');
      if (storedBudget) setBudget(JSON.parse(storedBudget));
    } catch (error) {
      console.error("Error loading data from localStorage", error);
      // If there's an error (e.g., corrupted data), we'll just use the defaults.
    }
  }, []); // The empty dependency array ensures this runs only once on mount.

  // The following useEffects save data to localStorage whenever it changes.
  useEffect(() => {
    try {
      localStorage.setItem('pantry-data', JSON.stringify(pantry));
    } catch (error) {
      console.error("Error saving pantry data to localStorage", error);
    }
  }, [pantry]);

  useEffect(() => {
    try {
      localStorage.setItem('basket-data', JSON.stringify(basket));
    } catch (error) {
      console.error("Error saving basket data to localStorage", error);
    }
  }, [basket]);

  useEffect(() => {
    try {
      localStorage.setItem('categories-data', JSON.stringify(categories));
    } catch (error) {
      console.error("Error saving categories data to localStorage", error);
    }
  }, [categories]);

  useEffect(() => {
    try {
      localStorage.setItem('saved-recipes-data', JSON.stringify(savedRecipes));
    } catch (error) {
      console.error("Error saving recipes data to localStorage", error);
    }
  }, [savedRecipes]);

  useEffect(() => {
    try {
      localStorage.setItem('budget-data', JSON.stringify(budget));
    } catch (error) {
      console.error("Error saving budget data to localStorage", error);
    }
  }, [budget]);

  // --- SERVICE WORKER REGISTRATION ---
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js').then(registration => {
          console.log('SW registered: ', registration);
        }).catch(registrationError => {
          console.log('SW registration failed: ', registrationError);
        });
      });
    }
  }, []);


  // --- MEMOIZED CALCULATIONS ---
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

  // --- HANDLERS ---
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
  
  const openAddDialog = (category?: string) => { 
    setEditingIngredient({ category: category || 'Autre', unit: 'pièce', price: 0, name: '' }); 
    setAddEditDialogOpen(true); 
  };
  
  const openEditDialog = (ingredient: Ingredient) => { 
    setEditingIngredient(ingredient); 
    setAddEditDialogOpen(true); 
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

  const openCategoryDialog = (category?: CategoryDef) => { 
    setEditingCategory(category || { name: '' }); 
    setIsCategoryDialogOpen(true);
  };

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
  
  const handleConfirmPurchase = () => {
    if (basketTotal > budget) {
      alert("Fonds insuffisants ! Le total de votre panier dépasse votre budget.");
      return;
    }
    const newBudget = budget - basketTotal;
    setBudget(newBudget);
    alert(`Achats validés ! Votre nouveau budget est de ${newBudget.toFixed(2)} DT.`);
    clearBasket();
  };

  const handleSaveRecipe = (recipeToSave: Recipe) => {
    if (savedRecipes.find(r => r.id === recipeToSave.id)) {
      alert("Cette recette est déjà dans vos favoris !");
      return;
    }
    setSavedRecipes(prev => [...prev, recipeToSave]);
    alert(`Recette "${recipeToSave.title}" sauvegardée !`);
  };

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <AppHeader
        basket={basket}
        basketTotal={basketTotal}
        updateBasketQuantity={updateBasketQuantity}
        clearBasket={clearBasket}
        handleConfirmPurchase={handleConfirmPurchase}
      />
      <AppNav activeTab={activeTab} setActiveTab={setActiveTab} />

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
              budget={budget}
              setBudget={setBudget}
              basketTotal={basketTotal}
              clearBasket={clearBasket}
              basketItemCount={basket.length}
            />
          )}
          {activeTab === 'recipes' && (
            <RecipesView 
              savedRecipes={savedRecipes}
              setViewingRecipe={setViewingRecipe}
              setSavedRecipes={setSavedRecipes}
              discoverableRecipes={discoverableRecipes}
              handleSaveRecipe={handleSaveRecipe}
            />
          )}
        </div>
      </main>

      <KitchenAssistantDialogs
        isAddEditDialogOpen={isAddEditDialogOpen}
        setAddEditDialogOpen={setAddEditDialogOpen}
        editingIngredient={editingIngredient}
        categories={categories}
        handleSaveIngredient={handleSaveIngredient}
        isCategoryDialogOpen={isCategoryDialogOpen}
        setIsCategoryDialogOpen={setIsCategoryDialogOpen}
        editingCategory={editingCategory}
        handleSaveCategory={handleSaveCategory}
        viewingRecipe={viewingRecipe}
        setViewingRecipe={setViewingRecipe}
      />
    </div>
  );
}
