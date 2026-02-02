'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { initialCategories, predefinedIngredients, discoverableRecipes, initialHealthConditions } from '@/lib/data';
import type { Ingredient, Recipe, BasketItem, CategoryDef, RecipeIngredient, HealthConditionCategory, HealthCondition, UserRecipe, PurchaseHistory } from '@/lib/types';
import { suggestRecipes } from '@/ai/flows/suggest-recipe-flow';
import type { SuggestRecipeOutput } from '@/ai/types';

import AppHeader from './AppHeader';
import AppNav from './AppNav';
import { decodeBasket } from '@/lib/url-sharing';
import KitchenAssistantDialogs from './KitchenAssistantDialogs';
import PantryView from './PantryView';
import RecipesView from './RecipesView';
import ChandyekView from './ChandyekView';
import NutritionalGuideView from './NutritionalGuideView';
import CategoryPriceEvolutionDialog from './CategoryPriceEvolutionDialog';
import { db } from '@/lib/idb';
import { isInAppBrowser, getProductStatus } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';


export default function KitchenAssistantPage() {
  // --- STATE MANAGEMENT ---
  const [pantry, setPantry] = useState<Ingredient[]>([]);
  const [basket, setBasket] = useState<BasketItem[]>([]);
  const [categories, setCategories] = useState<CategoryDef[]>([]);
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const [userRecipes, setUserRecipes] = useState<UserRecipe[]>([]);
  const [initialBudget, setInitialBudget] = useState(200);
  const [totalSpent, setTotalSpent] = useState(0);
  const [healthConditions, setHealthConditions] = useState<HealthConditionCategory[]>([]);
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseHistory>({});
  const [isDataLoaded, setIsDataLoaded] = useState(false);

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
  const [viewingRecipe, setViewingRecipe] = useState<(Omit<Recipe, 'id'> & { id?: string; }) | null>(null);
  const [viewingUserRecipe, setViewingUserRecipe] = useState<UserRecipe | null>(null);
  const [isHealthConditionManagerOpen, setHealthConditionManagerOpen] = useState(false);
  const [isQuantityDialogOpen, setQuantityDialogOpen] = useState(false);
  const [ingredientForQuantity, setIngredientForQuantity] = useState<Ingredient | null>(null);
  const [isUserRecipeFormOpen, setUserRecipeFormOpen] = useState(false);
  const [editingUserRecipe, setEditingUserRecipe] = useState<UserRecipe | null>(null);

  // Sharing State
  const [isShareBasketDialogOpen, setShareBasketDialogOpen] = useState(false);
  const [sharedBasketToMerge, setSharedBasketToMerge] = useState<BasketItem[] | null>(null);

  // Price Evolution State
  const [viewingCategoryTrends, setViewingCategoryTrends] = useState<CategoryDef | null>(null);



  // --- WAKE LOCK ---
  useEffect(() => {
    let wakeLock: WakeLockSentinel | null = null;

    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await navigator.wakeLock.request('screen');
          console.log('Screen Wake Lock is active.');
          wakeLock.addEventListener('release', () => {
            console.log('Screen Wake Lock was released.');
          });
        } else {
          console.log('Wake Lock API not supported.');
        }
      } catch (err: any) {
        console.error(`${err.name}, ${err.message}`);
      }
    };

    const handleVisibilityChange = () => {
      if (wakeLock !== null && document.visibilityState === 'visible') {
        requestWakeLock();
      }
    };

    requestWakeLock();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (wakeLock !== null) {
        wakeLock.release();
        wakeLock = null;
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);


  // --- INDEXEDDB PERSISTENCE ---
  useEffect(() => {
    async function loadData() {
      try {
        const [
          pantryData,
          basketData,
          categoriesData,
          savedRecipesData,
          userRecipesData,
          budgetData,
          totalSpentData,
          healthConditionsData,
          purchaseHistoryData,
        ] = await Promise.all([
          db.get<Ingredient[]>('pantry'),
          db.get<BasketItem[]>('basket'),
          db.get<CategoryDef[]>('categories'),
          db.get<Recipe[]>('savedRecipes'),
          db.get<UserRecipe[]>('userRecipes'),
          db.get<number>('budget'),
          db.get<number>('totalSpent'),
          db.get<HealthConditionCategory[]>('healthConditions'),
          db.get<PurchaseHistory>('purchaseHistory'),
        ]);

        setPantry(pantryData ?? predefinedIngredients);
        setBasket(basketData ?? []);
        setCategories(categoriesData ?? initialCategories);
        setSavedRecipes(savedRecipesData ?? []);
        setUserRecipes(userRecipesData ?? []);
        setInitialBudget(budgetData ?? 200);
        setTotalSpent(totalSpentData ?? 0);
        setHealthConditions(healthConditionsData ?? initialHealthConditions);
        // Migrate purchase history if needed
        const migratedHistory: PurchaseHistory = {};
        if (purchaseHistoryData) {
          Object.entries(purchaseHistoryData).forEach(([id, data]) => {
            migratedHistory[id] = Array.isArray(data) ? data : [data];
          });
        }
        setPurchaseHistory(migratedHistory);

      } catch (error) {
        console.error("Error loading data from IndexedDB", error);
        // Fallback to initial data if loading fails
        setPantry(predefinedIngredients);
        setBasket([]);
        setCategories(initialCategories);
        setSavedRecipes([]);
        setUserRecipes([]);
        setInitialBudget(200);
        setTotalSpent(0);
        setHealthConditions(initialHealthConditions);
        setPurchaseHistory({});
      } finally {
        setIsDataLoaded(true);
      }
    }
    loadData();
  }, []);

  // New Pantry Addition Logic
  const [confirmPantryAddOpen, setConfirmPantryAddOpen] = useState(false);
  const [missingIngredients, setMissingIngredients] = useState<Omit<Ingredient, 'id'>[]>([]);
  const [pendingRecipeSave, setPendingRecipeSave] = useState<{ recipe: UserRecipe, isNew: boolean } | null>(null);

  useEffect(() => { if (isDataLoaded) { try { db.set('pantry', pantry); } catch (e) { console.error(e); alert("Le stockage local est plein. Impossible de sauvegarder les modifications du garde-manger.") } } }, [pantry, isDataLoaded]);
  useEffect(() => { if (isDataLoaded) { try { db.set('basket', basket); } catch (e) { console.error(e); alert("Le stockage local est plein. Impossible de sauvegarder les modifications du panier.") } } }, [basket, isDataLoaded]);
  useEffect(() => { if (isDataLoaded) { try { db.set('categories', categories); } catch (e) { console.error(e); alert("Le stockage local est plein. Impossible de sauvegarder les modifications des catégories.") } } }, [categories, isDataLoaded]);
  useEffect(() => { if (isDataLoaded) { try { db.set('savedRecipes', savedRecipes); } catch (e) { console.error(e); alert("Le stockage local est plein. Impossible de sauvegarder les recettes.") } } }, [savedRecipes, isDataLoaded]);
  useEffect(() => { if (isDataLoaded) { try { db.set('userRecipes', userRecipes); } catch (e) { console.error(e); alert("Le stockage local est plein. Impossible de sauvegarder vos recettes personnelles.") } } }, [userRecipes, isDataLoaded]);
  useEffect(() => { if (isDataLoaded) { try { db.set('purchaseHistory', purchaseHistory); } catch (e) { console.error(e); alert("Le stockage local est plein. Impossible de sauvegarder l'historique des achats.") } } }, [purchaseHistory, isDataLoaded]);
  useEffect(() => { if (isDataLoaded) { try { db.set('budget', initialBudget); } catch (e) { console.error(e); alert("Le stockage local est plein. Impossible de sauvegarder le budget.") } } }, [initialBudget, isDataLoaded]);
  useEffect(() => { if (isDataLoaded) { try { db.set('totalSpent', totalSpent); } catch (e) { console.error(e); alert("Le stockage local est plein. Impossible de sauvegarder le total dépensé.") } } }, [totalSpent, isDataLoaded]);
  useEffect(() => { if (isDataLoaded) { try { db.set('healthConditions', healthConditions); } catch (e) { console.error(e); alert("Le stockage local est plein. Impossible de sauvegarder les conditions de santé.") } } }, [healthConditions, isDataLoaded]);

  // --- URL SHARING DETECTION ---
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);

      // 1. Detect Basket Share
      const encodedData = params.get('d');
      if (encodedData) {
        const decodedBasket = decodeBasket(encodedData);
        if (decodedBasket) {
          setSharedBasketToMerge(decodedBasket);
          if (!isInAppBrowser()) {
            window.history.replaceState({}, '', window.location.pathname);
          }
        }
      }

      // 2. Detect Recipe Share
      const sharedRecipeId = params.get('recipeId');
      if (sharedRecipeId && isDataLoaded) {
        // Try to find in discoverable first
        const foundDiscoverable = discoverableRecipes.find(r => r.id === sharedRecipeId);
        if (foundDiscoverable) {
          setViewingRecipe(foundDiscoverable);
          setActiveTab('recipes');
        } else {
          // Try to find in user recipes
          const foundUserRecipe = userRecipes.find(r => r.id === sharedRecipeId);
          if (foundUserRecipe) {
            setViewingUserRecipe(foundUserRecipe);
            setActiveTab('recipes');
          }
        }
      }
    }
  }, [isDataLoaded, userRecipes]); // Dependency on isDataLoaded and userRecipes to ensure we search APTER data load

  // --- MEMOIZED CALCULATIONS ---
  const basketTotalToPay = useMemo(() => basket.reduce((total, item) => !item.purchased ? total + item.price * item.quantity : total, 0), [basket]);
  const currentlyPurchasedInBasket = useMemo(() => basket.reduce((total, item) => item.purchased ? total + item.price * item.quantity : total, 0), [basket]);
  const remainingBudget = initialBudget - totalSpent;

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

  // Auto-add ingredients with green status to Ch3andek
  useEffect(() => {
    if (!isDataLoaded) return;

    // Categories to exclude from Ch3andek auto-selection
    const excludedCategories = [
      'maison',
      'médicaments',
      'médicament',
      'produits de soin',
      'produit de soin',
      'soin',
      'bien-être',
      'bien être',
      'hygiène',
      'entretien',
      'nettoyage',
    ];

    const greenIngredients = pantry.filter(ingredient => {
      const status = getProductStatus(purchaseHistory[ingredient.id]);
      const categoryLower = ingredient.category.toLowerCase();

      // Check if category contains any excluded keywords
      const isExcluded = excludedCategories.some(excluded =>
        categoryLower.includes(excluded)
      );

      return status === 'green' && !isExcluded;
    });

    // Only add if there are green ingredients and chandyek is empty
    if (greenIngredients.length > 0 && !chandyekIngredients) {
      const ingredientNames = greenIngredients.map(ing => ing.name).join(', ');
      setChandyekIngredients(ingredientNames);
    }
  }, [isDataLoaded, pantry, purchaseHistory, chandyekIngredients]);



  // --- HANDLERS ---
  const handleGenerateAiRecipes = useCallback(async (extraIngredient?: string) => {
    let currentIngredients = [...chandyekIngredientsList];

    if (extraIngredient) {
      if (!currentIngredients.some(ing => ing.toLowerCase() === extraIngredient.toLowerCase())) {
        currentIngredients.push(extraIngredient);
        // Sync back to the main search string state
        setChandyekIngredients(prev => {
          const list = prev ? prev.split(', ').filter(Boolean) : [];
          if (!list.some(i => i.toLowerCase() === extraIngredient.toLowerCase())) {
            list.push(extraIngredient);
            return list.join(', ');
          }
          return prev;
        });
      }
    }

    if (currentIngredients.length === 0) {
      setChandyekError("Veuillez sélectionner au moins un ingrédient.");
      return;
    }

    setIsChandyekLoading(true);
    setChandyekError(null);
    setAiSuggestions([]);

    // Filter key ingredients from the selected ingredients
    const keyIngredientsList = ['Poulet', 'Bœuf', 'Agneau', 'Poisson', 'Crevettes', 'Œufs', 'Tofu', 'Lentilles', 'Pois chiches'];
    const keyIngredients = currentIngredients.filter(ing =>
      keyIngredientsList.some(key => ing.toLowerCase().includes(key.toLowerCase()))
    );

    try {
      const results = await suggestRecipes({
        ingredients: currentIngredients,
        keyIngredients: keyIngredients.length > 0 ? keyIngredients : undefined
      });
      setAiSuggestions(results);
    } catch (err) {
      console.error(err);
      let errorMessage = "Une erreur inattendue est survenue lors de la génération des recettes.";
      if (err instanceof Error) {
        if (err.message.includes('503')) {
          errorMessage = "Le service est actuellement surchargé. Veuillez réessayer dans quelques instants.";
        } else if (err.message.includes('400')) {
          errorMessage = "La demande est invalide. Veuillez vérifier les ingrédients et réessayer.";
        } else {
          errorMessage = "L'IA n'a pas pu générer de recettes. Veuillez réessayer.";
        }
      }
      setChandyekError(errorMessage);
    } finally {
      setIsChandyekLoading(false);
    }
  }, [chandyekIngredientsList]);

  const handleFridgeScan = useCallback((ingredients: string[]) => {
    setChandyekIngredients(ingredients.join(', '));
    setActiveTab('chandyek');
  }, [setChandyekIngredients, setActiveTab]);

  const handleSaveIngredient = (formData: Omit<Ingredient, 'id'> & { id?: string }) => {
    if (formData.id) {
      setPantry(prev => prev.map(ing => ing.id === formData.id ? { ...ing, ...formData } as Ingredient : ing));
    } else {
      const newIngredient = { ...formData, id: self.crypto.randomUUID() } as Ingredient;
      setPantry(prev => [...prev, newIngredient].sort((a, b) => a.name.localeCompare(b.name)));
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
          ing.category === categoryToDelete.name ? { ...ing, category: 'Autre' } : ing
        )
      );
      setCategories(prev => prev.filter(cat => cat.id !== id));
    }
  };

  const openCategoryDialog = (category?: CategoryDef) => {
    setEditingCategory(category || { name: '' });
    setIsCategoryDialogOpen(true);
  };

  const handleUpdatePrices = (updates: { id: string; price: number }[]) => {
    setPantry(prev => prev.map(ing => {
      const update = updates.find(u => u.id === ing.id);
      return update ? { ...ing, price: update.price } : ing;
    }));
    alert(`${updates.length} prix mis à jour avec succès.`);
  };

  const handleAddIngredients = (newItems: Omit<Ingredient, 'id'>[]) => {
    const prepared = newItems.map(item => ({
      ...item,
      id: self.crypto.randomUUID()
    } as Ingredient));
    setPantry(prev => [...prev, ...prepared].sort((a, b) => a.name.localeCompare(b.name)));
    alert(`${newItems.length} nouveaux produits ajoutés au garde-manger.`);
  };

  const addToBasket = (ingredient: Ingredient, quantity: number) => {
    setBasket(prev => {
      const existingItem = prev.find(item => item.id === ingredient.id);
      if (existingItem) {
        return prev.map(item => item.id === ingredient.id ? { ...item, quantity: item.quantity + quantity } : item);
      }
      return [...prev, { ...ingredient, quantity, purchased: false }];
    });
    setQuantityDialogOpen(false);
  };

  const handleOpenQuantityDialog = (ingredient: Ingredient) => {
    setIngredientForQuantity(ingredient);
    setQuantityDialogOpen(true);
  };

  const updateBasketQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) setBasket(prev => prev.filter(item => item.id !== id));
    else setBasket(prev => prev.map(item => item.id === id ? { ...item, quantity: newQuantity } : item));
  };

  const handleTogglePurchaseStatus = (id: string, itemPrice: number, itemQuantity: number) => {
    setBasket(prevBasket =>
      prevBasket.map(item => {
        if (item.id === id) {
          return { ...item, purchased: !item.purchased };
        }
        return item;
      })
    );
  };

  const clearBasket = () => {
    setBasket([]);
  };

  const resetTotalSpent = () => {
    setTotalSpent(0);
  };

  const handleConfirmPurchase = () => {
    const costOfPurchasedItems = basket.reduce((total, item) => item.purchased ? total + item.price * item.quantity : total, 0);

    // Update purchase history
    const newHistory = { ...purchaseHistory };
    const now = new Date().toISOString();

    // Items to add to Ch3andek
    let newChandyekIngredients = chandyekIngredients ? chandyekIngredients.split(', ').filter(Boolean) : [];
    let hasChandyekUpdates = false;

    basket.forEach(item => {
      if (item.purchased) {
        if (!newHistory[item.id]) newHistory[item.id] = [];
        newHistory[item.id].push({
          date: now,
          quantity: item.quantity,
          unit: item.unit
        });

        // Add to Ch3andek if not present
        if (!newChandyekIngredients.some(ingName => ingName.toLowerCase() === item.name.toLowerCase())) {
          newChandyekIngredients.push(item.name);
          hasChandyekUpdates = true;
        }
      }
    });

    if (hasChandyekUpdates) {
      setChandyekIngredients(newChandyekIngredients.join(', '));
    }

    setPurchaseHistory(newHistory);
    setTotalSpent(prev => prev + costOfPurchasedItems);
    setBasket(prevBasket => prevBasket.filter(item => !item.purchased));
  };

  const handleDeleteFromHistory = (ingredientId: string) => {
    setPurchaseHistory(prev => {
      const newHistory = { ...prev };
      delete newHistory[ingredientId];
      return newHistory;
    });
  };

  const handleShareBasket = async () => {
    if (basket.length === 0) {
      alert("Votre panier est vide.");
      return;
    }
    setShareBasketDialogOpen(true);
  };

  const handleMergeBasket = () => {
    if (!sharedBasketToMerge) return;
    const items = sharedBasketToMerge;

    // 1. Merge into basket
    setBasket(prev => {
      const newBasket = [...prev];
      items.forEach(newItem => {
        const existing = newBasket.find(i => i.name === newItem.name);
        if (existing) {
          existing.quantity += newItem.quantity;
        } else {
          newBasket.push({ ...newItem, id: self.crypto.randomUUID(), purchased: false });
        }
      });
      return newBasket;
    });

    // 2. Check for missing ingredients in pantry and ask to add
    const missingIngredients = items.filter(item =>
      !pantry.some(p => p.name.toLowerCase() === item.name.toLowerCase())
    );

    if (missingIngredients.length > 0) {
      if (confirm(`Vous avez reçu ${missingIngredients.length} produits qui ne sont pas dans votre garde-manger. Voulez-vous les ajouter ?`)) {
        const newIngredients = missingIngredients.map(item => ({
          id: self.crypto.randomUUID(),
          name: item.name,
          category: item.category || 'Autre',
          unit: item.unit || 'pièce',
          price: item.price || 0
        } as Ingredient));

        setPantry(prev => [...prev, ...newIngredients].sort((a, b) => a.name.localeCompare(b.name)));
        alert(`${newIngredients.length} produits ajoutés à votre garde-manger.`);
      }
    }

    alert("Panier fusionné avec succès !");
    setSharedBasketToMerge(null);
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

  const handleShareSavedRecipe = async (recipe: Recipe) => {
    const title = `Recette: ${recipe.title}`;

    const ingredientsText = recipe.ingredients
      .map(ing => `- ${ing.quantity} ${ing.unit} ${ing.name}`)
      .join('\n');

    const preparationText = recipe.preparation;

    const fullText = `${title}\n\nOrigine: ${recipe.country}\nPour ${recipe.portions} personnes\nTemps: ${recipe.preparationTime} min\nCalories: ~${recipe.calories} kcal\n\n---\n\n**Ingrédients:**\n${ingredientsText}\n\n---\n\n**Préparation:**\n${preparationText}`;

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
        alert('Recette copiée dans le presse-papiers !');
      } catch (error) {
        console.error('Erreur lors de la copie:', error);
        alert('Impossible de copier la recette.');
      }
    }
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

  // --- USER RECIPE HANDLERS ---
  const openUserRecipeForm = (recipe?: UserRecipe) => {
    setEditingUserRecipe(recipe || null);
    setUserRecipeFormOpen(true);
  };

  const handleEditUserRecipe = (recipe: UserRecipe) => {
    setViewingUserRecipe(null); // Close the view dialog
    openUserRecipeForm(recipe); // Open the form with the recipe to edit
  };

  const handleSaveUserRecipe = async (recipeData: UserRecipe | (Omit<UserRecipe, 'id'> & { id?: string })) => {
    const isNew = !recipeData.id;
    const finalRecipe: UserRecipe = isNew
      ? { ...recipeData, id: self.crypto.randomUUID() } as UserRecipe
      : recipeData as UserRecipe;

    // Check for missing ingredients in pantry
    const missing = finalRecipe.ingredients.filter(recipeIng => {
      return !pantry.some(pantryIng => pantryIng.name.toLowerCase() === recipeIng.name.toLowerCase());
    });

    if (missing.length > 0) {
      // Prepare potential new ingredients with default category
      const newPantryItems: Omit<Ingredient, 'id'>[] = missing.map(ing => ({
        name: ing.name,
        category: 'Autre', // Default category, user can edit later
        unit: ing.unit,
        price: 0
      }));
      setMissingIngredients(newPantryItems);
      setPendingRecipeSave({ recipe: finalRecipe, isNew });
      setConfirmPantryAddOpen(true);
      return; // Stop here, wait for user confirmation
    }

    // Proceed directly if no missing ingredients
    completeRecipeSave(finalRecipe, isNew);
  };

  const completeRecipeSave = (finalRecipe: UserRecipe, isNew: boolean) => {
    if (isNew) {
      setUserRecipes(prev => [...prev, finalRecipe]);
    } else {
      setUserRecipes(prev => prev.map(r => r.id === finalRecipe.id ? finalRecipe : r));
    }
    setUserRecipeFormOpen(false);
    setEditingUserRecipe(null);
  };

  const handleConfirmPantryAdd = (itemsToAdd: Omit<Ingredient, 'id'>[]) => {
    handleAddIngredients(itemsToAdd); // Re-use the batch add function
    if (pendingRecipeSave) {
      completeRecipeSave(pendingRecipeSave.recipe, pendingRecipeSave.isNew);
    }
    setConfirmPantryAddOpen(false);
    setPendingRecipeSave(null);
    setMissingIngredients([]);
  };

  const handleDeleteUserRecipe = (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette recette ?")) {
      setUserRecipes(prev => prev.filter(r => r.id !== id));
    }
  };

  const handleShareUserRecipe = async (recipe: UserRecipe) => {
    const title = `Recette: ${recipe.title}`;

    // Generate the App Link
    const appLink = `${window.location.origin}${window.location.pathname}?recipeId=${recipe.id}`;

    const ingredientsText = recipe.ingredients.map(ing => `- ${ing.quantity} ${ing.unit} ${ing.name}`).join('\n');
    const preparationText = recipe.preparation;
    const fullText = `${title}\n\nAuteur: ${recipe.author || 'Non spécifié'}\nPour ${recipe.portions} personnes\nTemps: ${recipe.preparationTime} min\n\n---\n\n**Ingrédients:**\n${ingredientsText}\n\n---\n\n**Préparation:**\n${preparationText}\n\nVoir la recette dans l'app : ${appLink}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: fullText,
          url: appLink,
        });
      } catch (error) {
        console.error('Erreur lors du partage :', error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(fullText);
        alert('Recette copiée dans le presse-papiers !');
      } catch (error) {
        console.error('Erreur de copie:', error);
        alert('Impossible de copier la recette.');
      }
    }
  };

  if (!isDataLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Chargement des données...</p>
      </div>
    );
  }

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <AppHeader
        basket={basket}
        basketTotal={basketTotalToPay}
        updateBasketQuantity={updateBasketQuantity}
        clearBasket={clearBasket}
        handleConfirmPurchase={handleConfirmPurchase}
        handleShareBasket={handleShareBasket}
        savedRecipes={savedRecipes}
        onViewRecipe={setViewingRecipe}
        onDeleteRecipe={handleDeleteSavedRecipe}
        onShareRecipe={handleShareSavedRecipe}
        onTogglePurchaseStatus={handleTogglePurchaseStatus}
        onFridgeScan={handleFridgeScan}
        purchaseHistory={purchaseHistory}
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
              openQuantityDialog={handleOpenQuantityDialog}
              openAddDialog={openAddDialog}
              openEditDialog={openEditDialog}
              handleDeleteIngredient={handleDeleteIngredient}
              openCategoryDialog={openCategoryDialog}
              handleDeleteCategory={handleDeleteCategory}
              onToggleChandyekIngredient={handleToggleChandyekIngredient}
              chandyekIngredientsList={chandyekIngredientsList}
              initialBudget={initialBudget}
              setInitialBudget={setInitialBudget}
              basketTotalToPay={basketTotalToPay}
              totalSpent={totalSpent + currentlyPurchasedInBasket}
              clearBasket={clearBasket}
              resetTotalSpent={resetTotalSpent}
              basketItemCount={basket.length}
              remainingBudget={remainingBudget - currentlyPurchasedInBasket}
              purchaseHistory={purchaseHistory}
              pantry={pantry}
              onAddToBasket={addToBasket}
              onDeleteFromHistory={handleDeleteFromHistory}
              onUpdatePrices={handleUpdatePrices}
              onAddIngredients={handleAddIngredients}
              onViewCategoryTrends={setViewingCategoryTrends}
            />
          )}
          {activeTab === 'recipes' && (
            <RecipesView
              setViewingRecipe={setViewingRecipe}
              discoverableRecipes={discoverableRecipes}
              handleSaveRecipe={handleSaveRecipe}
              userRecipes={userRecipes}
              openUserRecipeForm={openUserRecipeForm}
              onViewUserRecipe={setViewingUserRecipe}
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
        isQuantityDialogOpen={isQuantityDialogOpen}
        setQuantityDialogOpen={setQuantityDialogOpen}
        ingredientForQuantity={ingredientForQuantity}
        onAddToBasket={addToBasket}
        isUserRecipeFormOpen={isUserRecipeFormOpen}
        setUserRecipeFormOpen={setUserRecipeFormOpen}
        editingUserRecipe={editingUserRecipe}
        handleSaveUserRecipe={handleSaveUserRecipe}
        viewingUserRecipe={viewingUserRecipe}
        setViewingUserRecipe={setViewingUserRecipe}
        onDeleteUserRecipe={handleDeleteUserRecipe}
        onShareUserRecipe={handleShareUserRecipe}
        onEditUserRecipe={handleEditUserRecipe}
        isShareBasketDialogOpen={isShareBasketDialogOpen}
        setShareBasketDialogOpen={setShareBasketDialogOpen}
        basket={basket}
        sharedBasketToMerge={sharedBasketToMerge}
        setSharedBasketToMerge={setSharedBasketToMerge}
        onMergeBasket={handleMergeBasket}
        pantry={pantry}
        purchaseHistory={purchaseHistory}
      />

      <CategoryPriceEvolutionDialog
        category={viewingCategoryTrends}
        isOpen={!!viewingCategoryTrends}
        onClose={() => setViewingCategoryTrends(null)}
        pantry={pantry}
        purchaseHistory={purchaseHistory}
      />

      <Dialog open={confirmPantryAddOpen} onOpenChange={setConfirmPantryAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ingrédients manquants</DialogTitle>
            <DialogDescription>
              Certains ingrédients de cette recette ne sont pas dans votre garde-manger. Voulez-vous les ajouter ?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm font-medium mb-2">Ingrédients détectés :</p>
            <ul className="space-y-1">
              {missingIngredients.map((ing, idx) => (
                <li key={idx} className="text-sm flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-500" />
                  {ing.name}
                </li>
              ))}
            </ul>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => {
              // Save recipe ONLY, ignore pantry add
              if (pendingRecipeSave) completeRecipeSave(pendingRecipeSave.recipe, pendingRecipeSave.isNew);
              setConfirmPantryAddOpen(false);
            }}>
              Non, enregistrer la recette uniquement
            </Button>
            <Button onClick={() => handleConfirmPantryAdd(missingIngredients)}>
              Oui, ajouter au garde-manger
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
