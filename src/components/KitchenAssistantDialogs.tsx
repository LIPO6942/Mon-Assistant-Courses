'use client';

import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BasketShareDialog } from './BasketShareDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Minus, Plus, Pencil, Trash2, Users, Share2, AlertTriangle, ExternalLink } from 'lucide-react';
import IngredientForm from './IngredientForm';
import CategoryForm from './CategoryForm';
import HealthConditionManager from './HealthConditionManager';
import type { Ingredient, Recipe, CategoryDef, HealthConditionCategory, UserRecipe, RecipeIngredient, BasketItem, PurchaseHistory } from '@/lib/types';
import UserRecipeForm from './UserRecipeForm';
import Image from 'next/image';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { cn, getProductStatus } from '@/lib/utils';
import RecipeContent from './RecipeContent';

interface KitchenAssistantDialogsProps {
  isAddEditDialogOpen: boolean;
  setAddEditDialogOpen: (isOpen: boolean) => void;
  editingIngredient: Partial<Ingredient> | null;
  categories: CategoryDef[];
  handleSaveIngredient: (formData: Omit<Ingredient, 'id'> & { id?: string }) => void;

  isCategoryDialogOpen: boolean;
  setIsCategoryDialogOpen: (isOpen: boolean) => void;
  editingCategory: { id?: string; name: string } | null;
  handleSaveCategory: (formData: { id?: string; name: string }) => void;

  viewingRecipe: (Omit<Recipe, 'id'> & { id?: string; }) | null;
  setViewingRecipe: (recipe: (Omit<Recipe, 'id'> & { id?: string; }) | null) => void;

  isHealthConditionManagerOpen: boolean;
  setHealthConditionManagerOpen: (isOpen: boolean) => void;
  healthConditions: HealthConditionCategory[];
  onSaveHealthCategory: (id: string | null, name: string) => void;
  onDeleteHealthCategory: (id: string) => void;
  onSaveHealthCondition: (categoryId: string, condition: { id: string | null; name: string }) => void;
  onDeleteHealthCondition: (categoryId: string, conditionId: string) => void;

  isQuantityDialogOpen: boolean;
  setQuantityDialogOpen: (isOpen: boolean) => void;
  ingredientForQuantity: Ingredient | null;
  onAddToBasket: (ingredient: Ingredient, quantity: number) => void;

  isUserRecipeFormOpen: boolean;
  setUserRecipeFormOpen: (isOpen: boolean) => void;
  editingUserRecipe: UserRecipe | null;
  handleSaveUserRecipe: (recipeData: Omit<UserRecipe, 'id'> & { id?: string }) => void;

  viewingUserRecipe: UserRecipe | null;
  setViewingUserRecipe: (recipe: UserRecipe | null) => void;
  onDeleteUserRecipe: (recipeId: string) => void;
  onEditUserRecipe: (recipe: UserRecipe) => void;
  onShareUserRecipe: (recipe: UserRecipe) => void;

  // Sharing props
  isShareBasketDialogOpen: boolean;
  setShareBasketDialogOpen: (open: boolean) => void;
  basket: BasketItem[];
  sharedBasketToMerge: BasketItem[] | null;
  setSharedBasketToMerge: (basket: BasketItem[] | null) => void;
  onMergeBasket: () => void;
  sharedRecipeToView: UserRecipe | null;
  setSharedRecipeToView: (recipe: UserRecipe | null) => void;
  onSaveSharedRecipe: (recipeData: Omit<UserRecipe, 'id'> & { id?: string }) => void;
  isInApp?: boolean;
  pantry: Ingredient[];
  purchaseHistory: PurchaseHistory;
}

export default function KitchenAssistantDialogs(props: KitchenAssistantDialogsProps) {
  const {
    isAddEditDialogOpen,
    setAddEditDialogOpen,
    editingIngredient,
    categories,
    handleSaveIngredient,
    isCategoryDialogOpen,
    setIsCategoryDialogOpen,
    editingCategory,
    handleSaveCategory,
    viewingRecipe,
    setViewingRecipe,
    isHealthConditionManagerOpen,
    setHealthConditionManagerOpen,
    healthConditions,
    onSaveHealthCategory,
    onDeleteHealthCategory,
    onSaveHealthCondition,
    onDeleteHealthCondition,
    isQuantityDialogOpen,
    setQuantityDialogOpen,
    ingredientForQuantity,
    onAddToBasket,
    isUserRecipeFormOpen,
    setUserRecipeFormOpen,
    editingUserRecipe,
    handleSaveUserRecipe,
    viewingUserRecipe,
    setViewingUserRecipe,
    onDeleteUserRecipe,
    onEditUserRecipe,
    onShareUserRecipe,
    isShareBasketDialogOpen,
    setShareBasketDialogOpen,
    basket,
    sharedBasketToMerge,
    setSharedBasketToMerge,
    onMergeBasket,
    sharedRecipeToView,
    setSharedRecipeToView,
    onSaveSharedRecipe,
    isInApp,
    pantry,
    purchaseHistory,
  } = props;

  const [isPreviewPhotoOpen, setIsPreviewPhotoOpen] = React.useState(false);

  const [quantityInput, setQuantityInput] = React.useState('1');
  const [portions, setPortions] = React.useState(viewingRecipe?.portions || viewingUserRecipe?.portions || 2);

  React.useEffect(() => {
    if (isQuantityDialogOpen) {
      setQuantityInput('1');
    }
  }, [isQuantityDialogOpen]);

  React.useEffect(() => {
    setPortions(viewingRecipe?.portions || viewingUserRecipe?.portions || 2);
  }, [viewingRecipe, viewingUserRecipe]);


  const handleConfirmQuantity = () => {
    const quantity = parseFloat(quantityInput);
    if (!isNaN(quantity) && quantity > 0 && ingredientForQuantity) {
      onAddToBasket(ingredientForQuantity, quantity);
    }
  };

  const calculateAdjustedQuantity = (baseQuantity: number, basePortions: number, newPortions: number) => {
    if (!basePortions) return baseQuantity;
    const adjusted = (baseQuantity / basePortions) * newPortions;
    // Format to max 3 decimal places, and remove trailing zeros
    return parseFloat(adjusted.toFixed(3));
  };


  const currentRecipe = viewingRecipe || viewingUserRecipe;
  const currentIngredients = currentRecipe?.ingredients as RecipeIngredient[] | undefined;
  const basePortions = currentRecipe?.portions || 1;

  return (
    <>
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
          <CategoryForm key={editingCategory?.id || 'new-cat'} category={editingCategory} onSave={handleSaveCategory} formId="category-form" />
          <DialogFooter><Button variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>Annuler</Button><Button type="submit" form="category-form">Sauvegarder</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!currentRecipe} onOpenChange={(open: boolean) => {
        if (!open) {
          setViewingRecipe(null);
          setViewingUserRecipe(null);
        }
      }}>
        <DialogContent className="max-w-md p-0 overflow-hidden bg-white dark:bg-zinc-950">
          {currentRecipe && (
            <div className="flex flex-col h-[85vh]">
              {/* Image Header / Title Section */}
              <div className="relative h-32 shrink-0">
                {(currentRecipe as UserRecipe).photoDataUri ? (
                  <Image src={(currentRecipe as UserRecipe).photoDataUri!} alt={currentRecipe.title} layout="fill" objectFit="cover" className="brightness-90" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <Users className="h-16 w-16 text-primary/20" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
                  <div className="flex justify-between items-end gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {'category' in currentRecipe && (
                          <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                            {currentRecipe.category || 'Recette'}
                          </span>
                        )}
                        {'country' in currentRecipe && currentRecipe.country && (
                          <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                            {currentRecipe.country}
                          </span>
                        )}
                      </div>
                      <DialogTitle className="text-2xl font-black text-white leading-tight">{currentRecipe.title}</DialogTitle>
                      <div className="flex items-center gap-3 text-white/80 text-xs font-medium">
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>{portions} pers.</span>
                        </div>
                        {'preparationTime' in currentRecipe && currentRecipe.preparationTime && (
                          <div className="flex items-center gap-1">
                            <Plus className="h-3 w-3" />
                            <span>{currentRecipe.preparationTime} min</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {(currentRecipe as UserRecipe).photoDataUri && (
                      <Button
                        variant="secondary"
                        size="icon"
                        className="rounded-full bg-white/20 backdrop-blur-md border-none text-white hover:bg-white/40"
                        onClick={() => setIsPreviewPhotoOpen(true)}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons (External Links) */}
              {currentRecipe && (('searchLinks' in currentRecipe && currentRecipe.searchLinks && currentRecipe.searchLinks.length > 0) || ('searchUrl' in currentRecipe && currentRecipe.searchUrl)) && (
                <div className="px-4 pt-4 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {'searchLinks' in currentRecipe && currentRecipe.searchLinks?.map((link, i) => (
                    <Button key={i} variant="outline" size="sm" className="h-8 rounded-full text-[10px] font-bold shrink-0 gap-1" asChild>
                      <a href={link.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3" />
                        {link.label}
                      </a>
                    </Button>
                  ))}
                  {'searchUrl' in currentRecipe && currentRecipe.searchUrl && (
                    <Button variant="outline" size="sm" className="h-8 rounded-full text-[10px] font-bold shrink-0 gap-1" asChild>
                      <a href={currentRecipe.searchUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3" />
                        Source
                      </a>
                    </Button>
                  )}
                </div>
              )}

              {/* Unified Recipe Content */}
              <div className="flex-1 min-h-0">
                <RecipeContent
                  ingredients={currentIngredients || []}
                  preparation={currentRecipe.preparation || ''}
                  basePortions={basePortions}
                  initialPortions={portions}
                  pantry={pantry}
                  purchaseHistory={purchaseHistory}
                />
              </div>

              <DialogFooter className="sm:justify-between w-full shrink-0 px-4 py-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 gap-4">
                <div>
                  {viewingUserRecipe && (
                    <div className='flex items-center gap-1'>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full hover:bg-white dark:hover:bg-zinc-800"
                        onClick={() => onShareUserRecipe(viewingUserRecipe)}
                        aria-label="Partager la recette"
                      >
                        <Share2 className="h-4 w-4 text-primary" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full hover:bg-white dark:hover:bg-zinc-800"
                        onClick={() => {
                          onEditUserRecipe(viewingUserRecipe);
                        }}
                        aria-label="Modifier la recette"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full hover:bg-white dark:hover:bg-zinc-800"
                        onClick={() => {
                          onDeleteUserRecipe(viewingUserRecipe.id);
                          setViewingUserRecipe(null);
                        }}
                        aria-label="Supprimer la recette"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  )}
                </div>
                <Button
                  type="button"
                  variant="default"
                  className="rounded-full px-8 font-bold"
                  onClick={() => {
                    setViewingRecipe(null);
                    setViewingUserRecipe(null);
                  }}
                >
                  Fermer
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isUserRecipeFormOpen} onOpenChange={setUserRecipeFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editingUserRecipe ? "Modifier" : "Créer"} ma recette</DialogTitle></DialogHeader>
          <UserRecipeForm
            key={editingUserRecipe?.id || 'new-user-recipe'}
            initialData={editingUserRecipe}
            onSave={handleSaveUserRecipe}
            formId='user-recipe-form'
            pantry={pantry}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setUserRecipeFormOpen(false)}>Annuler</Button>
            <Button type="submit" form="user-recipe-form">Sauvegarder</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isHealthConditionManagerOpen} onOpenChange={setHealthConditionManagerOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle>Gérer les Conditions de Santé</DialogTitle></DialogHeader>
          <HealthConditionManager
            healthConditions={healthConditions}
            onSaveCategory={onSaveHealthCategory}
            onDeleteCategory={onDeleteHealthCategory}
            onSaveCondition={onSaveHealthCondition}
            onDeleteCondition={onDeleteHealthCondition}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setHealthConditionManagerOpen(false)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isQuantityDialogOpen} onOpenChange={setQuantityDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Quelle quantité pour {ingredientForQuantity?.name} ?</DialogTitle>
            <DialogDescription>
              Indiquez la quantité ({ingredientForQuantity?.unit}) à ajouter au panier.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center gap-4 py-4">
            <Button variant="outline" size="icon" onClick={() => {
              const current = parseFloat(quantityInput) || 0;
              const next = Math.max(0, parseFloat((current - 1).toFixed(3)));
              setQuantityInput(String(next));
            }}><Minus className="h-4 w-4" /></Button>
            <Input
              type="text"
              inputMode="decimal"
              value={quantityInput}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const val = e.target.value;
                if (val === '' || /^[0-9]*\.?[0-9]*$/.test(val)) {
                  setQuantityInput(val);
                }
              }}
              className="w-20 text-center text-lg font-bold h-10"
            />
            <Button variant="outline" size="icon" onClick={() => {
              const current = parseFloat(quantityInput) || 0;
              const next = parseFloat((current + 1).toFixed(3));
              setQuantityInput(String(next));
            }}><Plus className="h-4 w-4" /></Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setQuantityDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleConfirmQuantity} disabled={!(parseFloat(quantityInput) > 0)}>Ajouter au panier</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog >
      <BasketShareDialog
        isOpen={isShareBasketDialogOpen}
        onOpenChange={setShareBasketDialogOpen}
        basket={basket}
      />

      <Dialog open={!!sharedBasketToMerge} onOpenChange={(open: boolean) => !open && setSharedBasketToMerge(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Panier Partagé Reçu !</DialogTitle>
            <DialogDescription>
              Vous avez reçu un panier contenant {sharedBasketToMerge?.length} articles. Voulez-vous les ajouter à votre liste ?
            </DialogDescription>
          </DialogHeader>
          {isInApp && (
            <div className="bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 p-3 rounded-lg flex gap-3 items-start my-2">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              <div className="text-xs text-amber-800 dark:text-amber-200">
                <p className="font-bold">Navigateur limité détecté (Messenger/Instagram)</p>
                <p>Pour enregistrer ce panier de façon permanente, <strong>ouvrez ce lien dans Chrome ou Safari</strong> (Menu ⋮ &gt; Ouvrir dans le navigateur).</p>
              </div>
            </div>
          )}
          <div className="max-h-60 overflow-y-auto my-4 border rounded-md p-2 bg-muted/20">
            <ul className="space-y-1 text-sm">
              {sharedBasketToMerge?.map((item, idx) => (
                <li key={idx} className="flex justify-between">
                  <span>{item.name}</span>
                  <span className="text-muted-foreground">{item.quantity} {item.unit}</span>
                </li>
              ))}
            </ul>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSharedBasketToMerge(null)}>Ignorer</Button>
            <Button onClick={onMergeBasket}>Fusionner</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isPreviewPhotoOpen} onOpenChange={setIsPreviewPhotoOpen}>
        <DialogContent className="max-w-4xl w-full h-[80vh] p-0 overflow-hidden bg-black/90 border-none">
          <div className="relative w-full h-full flex items-center justify-center">
            <DialogClose className="absolute top-4 right-4 z-50 rounded-full bg-white/10 p-2 hover:bg-white/20 transition-colors">
              <Minus className="h-6 w-6 text-white" />
              <span className="sr-only">Fermer</span>
            </DialogClose>
            {currentRecipe && (currentRecipe as UserRecipe).photoDataUri && (
              <Image
                src={(currentRecipe as UserRecipe).photoDataUri!}
                alt={currentRecipe.title}
                className="object-contain"
                fill
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!sharedRecipeToView} onOpenChange={(open) => !open && setSharedRecipeToView(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Recette Partagée Reçue !</DialogTitle>
            <DialogDescription>
              Vous avez reçu une recette : &quot;{sharedRecipeToView?.title}&quot;. Voulez-vous la sauvegarder dans vos recettes ?
            </DialogDescription>
          </DialogHeader>
          {sharedRecipeToView && (
            <div className="max-h-60 overflow-y-auto my-4 border rounded-md p-3 bg-muted/20">
              <div className="space-y-2 text-sm">
                <div>
                  <strong>Catégorie:</strong> {sharedRecipeToView.category}
                </div>
                <div>
                  <strong>Portions:</strong> {sharedRecipeToView.portions} personnes
                </div>
                <div>
                  <strong>Temps de préparation:</strong> {sharedRecipeToView.preparationTime} min
                </div>
                {sharedRecipeToView.author && (
                  <div>
                    <strong>Auteur:</strong> {sharedRecipeToView.author}
                  </div>
                )}
                <div>
                  <strong>Ingrédients:</strong>
                  <ul className="list-disc pl-5 mt-1">
                    {sharedRecipeToView.ingredients.map((ing, idx) => (
                      <li key={idx}>{ing.quantity} {ing.unit} de {ing.name}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSharedRecipeToView(null)}>Ignorer</Button>
            <Button onClick={() => {
              if (sharedRecipeToView) {
                // Generate a new ID for the recipe
                const recipeToSave = { ...sharedRecipeToView, id: undefined };
                onSaveSharedRecipe(recipeToSave);
                setSharedRecipeToView(null);
                alert(`Recette "${sharedRecipeToView.title}" sauvegardée dans vos recettes !`);
              }
            }}>Sauvegarder</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
