
'use client';

import { useState, useMemo, useEffect } from 'react';
import { initialCategories, predefinedIngredients, discoverableRecipes, initialHealthConditions } from '@/lib/data';
import type { Ingredient, Recipe, BasketItem, CategoryDef, RecipeIngredient, HealthConditionCategory, HealthCondition } from '@/lib/types';
import { suggestRecipes } from '@/ai/flows/suggest-recipe-flow';
import type { SuggestRecipeOutput } from '@/ai/types';

import AppHeader from './AppHeader';
import AppNav from './AppNav';
import KitchenAssistantDialogs from './KitchenAssistantDialogs';
import PantryView from './PantryView';
import RecipesView from './RecipesView';
import ChandyekView from './ChandyekView';
import NutritionalGuideView from './NutritionalGuideView';

export default function KitchenAssistantPage() {
  // --- STATE MANAGEMENT ---
  const [pantry, setPantry] = useState<Ingredient[]>(predefinedIngredients);
  const [basket, setBasket] = useState<BasketItem[]>([]);
  const [categories, setCategories] = useState<CategoryDef[]>(initialCategories);
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const [budget, setBudget] = useState(200);
  const [healthConditions, setHealthConditions] = useState<HealthConditionCategory[]>(initialHealthConditions);
  
  // Ephemeral state
  const [activeTab, setActiveTab] = useState<'pantry' | 'recipes' | 'chandyek' | 'guide'>('pantry');
  const [searchQuery, setSearchQuery] = useState('');

  // Chandyek (AI) State
  const [chandyekIngredients, setChandyekIngredients] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<SuggestRecipeOutput[]>([]);
  const [isChandyekLoading, setIsChandyekLoading] = useState(false);
  const [chandyekError, setChandyekError] = useState<string | null>(null);
  
  // Dialogs State
  const [isAddEditDialogOpen, setAddEditDialogOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Partial<Ingredient> | null>(null);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<{ id?: string; name: string } | null>(null);
  const [viewingRecipe, setViewingRecipe] = useState<(Omit<Recipe, 'id'> & { id?: string }) | null>(null);
  const [isHealthConditionManagerOpen, setHealthConditionManagerOpen] = useState(false);


  // --- LOCALSTORAGE PERSISTENCE ---
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
      
      const storedHealthConditions = localStorage.getItem('health-conditions-data');
      if (storedHealthConditions) setHealthConditions(JSON.parse(storedHealthConditions));
    } catch (error) {
      console.error("Error loading data from localStorage", error);
    }
  }, []);

  useEffect(() => { localStorage.setItem('pantry-data', JSON.stringify(pantry)); }, [pantry]);
  useEffect(() => { localStorage.setItem('basket-data', JSON.stringify(basket)); }, [basket]);
  useEffect(() => { localStorage.setItem('categories-data', JSON.stringify(categories)); }, [categories]);
  useEffect(() => { localStorage.setItem('saved-recipes-data', JSON.stringify(savedRecipes)); }, [savedRecipes]);
  useEffect(() => { localStorage.setItem('budget-data', JSON.stringify(budget)); }, [budget]);
  useEffect(() => { localStorage.setItem('health-conditions-data', JSON.stringify(healthConditions)); }, [healthConditions]);

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

  const chandyekIngredientsList = useMemo(() => {
    return chandyekIngredients.split(', ').filter(Boolean);
  }, [chandyekIngredients]);


  // --- HANDLERS ---
  const handleGenerateAiRecipes = async () => {
    if (chandyekIngredientsList.length === 0) {
      setChandyekError("Veuillez sélectionner au moins un ingrédient.");
      return;
    }
    setIsChandyekLoading(true);
    setChandyekError(null);
    setAiSuggestions([]);
    try {
      const results = await suggestRecipes({ ingredients: chandyekIngredientsList });
      setAiSuggestions(results);
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : "Une erreur inattendue est survenue.";
      setChandyekError(`L'IA n'a pas pu générer de recettes. Détail: ${errorMessage}`);
    } finally {
      setIsChandyekLoading(false);
    }
  };

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

  const handleShareBasket = async () => {
    if (basket.length === 0) {
      alert("Votre panier est vide.");
      return;
    }

    const title = 'Ma liste de courses';
    const basketText = basket
      .map(item => `- ${item.name}: ${item.quantity} ${item.unit}`)
      .join('\n');
    const totalText = `\nTotal estimé: ${basketTotal.toFixed(2)} DT`;
    const fullText = `${title}\n\n${basketText}\n${totalText}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: fullText,
        });
      } catch (error) {
        console.error('Erreur lors du partage:', error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(fullText);
        alert('Liste de courses copiée dans le presse-papiers !');
      } catch (error) {
        console.error('Erreur lors de la copie:', error);
        alert('Impossible de copier la liste.');
      }
    }
  };

  const handleSaveRecipe = (recipeToSave: Omit<Recipe, 'id'> & { id?: string }) => {
    if (recipeToSave.id && savedRecipes.some(r => r.id === recipeToSave.id)) {
      alert("Cette recette est déjà dans vos favoris !");
      return;
    }
    if (savedRecipes.some(r => r.title.toLowerCase() === recipeToSave.title.toLowerCase())) {
        alert("Une recette avec ce titre est déjà dans vos favoris !");
        return;
    }

    const newRecipe: Recipe = {
      ...recipeToSave,
      id: recipeToSave.id || self.crypto.randomUUID(),
    };
    
    setSavedRecipes(prev => [...prev, newRecipe]);
    alert(`Recette "${newRecipe.title}" sauvegardée !`);
  };
  
  const handleDeleteSavedRecipe = (recipeId: string) => {
    setSavedRecipes(prev => prev.filter(r => r.id !== recipeId));
  };

  const handleToggleChandyekIngredient = (ingredientName: string) => {
    setChandyekIngredients(prev => {
      const ingredientsList = prev ? prev.split(', ').filter(Boolean) : [];
      if (ingredientsList.includes(ingredientName)) {
        return ingredientsList.filter(name => name !== ingredientName).join(', ');
      } else {
        ingredientsList.push(ingredientName);
        return ingredientsList.join(', ');
      }
    });
  };

  const handleClearChandyekIngredients = () => {
    setChandyekIngredients('');
    setAiSuggestions([]);
    setChandyekError(null);
  };

  // --- HEALTH CONDITION HANDLERS ---
  const handleSaveHealthCategory = (id: string | null, name: string) => {
    if (!name.trim()) return;
    setHealthConditions(prev => {
      if (id) {
        return prev.map(cat => cat.id === id ? { ...cat, name: name.trim() } : cat);
      } else {
        const newCategory: HealthConditionCategory = { id: self.crypto.randomUUID(), name: name.trim(), conditions: [] };
        return [...prev, newCategory];
      }
    });
  };

  const handleDeleteHealthCategory = (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette catégorie et toutes ses conditions ?")) {
      setHealthConditions(prev => prev.filter(cat => cat.id !== id));
    }
  };

  const handleSaveHealthCondition = (categoryId: string, condition: { id: string | null; name: string }) => {
    if (!condition.name.trim()) return;
    setHealthConditions(prev => prev.map(cat => {
      if (cat.id === categoryId) {
        const updatedConditions = condition.id
          ? cat.conditions.map(c => c.id === condition.id ? { ...c, name: condition.name.trim() } : c)
          : [...cat.conditions, { id: self.crypto.randomUUID(), name: condition.name.trim() }];
        return { ...cat, conditions: updatedConditions };
      }
      return cat;
    }));
  };

  const handleDeleteHealthCondition = (categoryId: string, conditionId: string) => {
    setHealthConditions(prev => prev.map(cat => {
      if (cat.id === categoryId) {
        return { ...cat, conditions: cat.conditions.filter(c => c.id !== conditionId) };
      }
      return cat;
    }));
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
        handleShareBasket={handleShareBasket}
        savedRecipes={savedRecipes}
        onViewRecipe={setViewingRecipe}
        onDeleteRecipe={handleDeleteSavedRecipe}
      />
      <AppNav 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        chandyekIngredientCount={chandyekIngredientsList.length}
      />

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
              onToggleChandyekIngredient={handleToggleChandyekIngredient}
              chandyekIngredientsList={chandyekIngredientsList}
              budget={budget}
              setBudget={setBudget}
              basketTotal={basketTotal}
              clearBasket={clearBasket}
              basketItemCount={basket.length}
            />
          )}
          {activeTab === 'recipes' && (
            <RecipesView 
              setViewingRecipe={setViewingRecipe}
              discoverableRecipes={discoverableRecipes}
              handleSaveRecipe={handleSaveRecipe}
            />
          )}
          {activeTab === 'chandyek' && (
            <ChandyekView 
              selectedIngredients={chandyekIngredientsList}
              aiSuggestions={aiSuggestions}
              isLoading={isChandyekLoading}
              error={chandyekError}
              onGenerate={handleGenerateAiRecipes}
              onSaveRecipe={handleSaveRecipe}
              onViewRecipe={setViewingRecipe}
              onRemoveIngredient={handleToggleChandyekIngredient}
              onClearIngredients={handleClearChandyekIngredients}
            />
          )}
          {activeTab === 'guide' && (
            <NutritionalGuideView 
              healthConditions={healthConditions}
              openHealthConditionManager={() => setHealthConditionManagerOpen(true)}
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
        isHealthConditionManagerOpen={isHealthConditionManagerOpen}
        setHealthConditionManagerOpen={setHealthConditionManagerOpen}
        healthConditions={healthConditions}
        onSaveHealthCategory={handleSaveHealthCategory}
        onDeleteHealthCategory={handleDeleteHealthCategory}
        onSaveHealthCondition={handleSaveHealthCondition}
        onDeleteHealthCondition={handleDeleteHealthCondition}
      />
    </div>
  );
}
