

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
import { cn } from '@/lib/utils';

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
    isInApp,
    pantry,
    purchaseHistory,
  } = props;

  const [isPreviewPhotoOpen, setIsPreviewPhotoOpen] = React.useState(false);

  const [quantityInput, setQuantityInput] = React.useState('1');
  const [portions, setPortions] = React.useState(viewingRecipe?.portions || viewingUserRecipe?.portions || 2);
  const [checkedSteps, setCheckedSteps] = React.useState<Set<number>>(new Set());

  React.useEffect(() => {
    if (isQuantityDialogOpen) {
      setQuantityInput('1');
    }
  }, [isQuantityDialogOpen]);

  React.useEffect(() => {
    setPortions(viewingRecipe?.portions || viewingUserRecipe?.portions || 2);
    // Reset checked steps when a new recipe is viewed
    setCheckedSteps(new Set());
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

  const handleToggleStep = (index: number) => {
    setCheckedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const currentRecipe = viewingRecipe || viewingUserRecipe;
  const currentIngredients = currentRecipe?.ingredients as RecipeIngredient[] | undefined;
  const basePortions = currentRecipe?.portions || 1;
  const preparationSteps = currentRecipe?.preparation?.split('\n').filter(line => line.trim() !== '') || [];

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

      <Dialog open={!!currentRecipe} onOpenChange={(open) => {
        if (!open) {
          setViewingRecipe(null);
          setViewingUserRecipe(null);
        }
      }}>
        <DialogContent className="max-w-lg">
          {currentRecipe && (
            <>
              <DialogHeader>
                {(currentRecipe as UserRecipe).photoDataUri && (
                  <div
                    className="relative w-full h-48 mb-4 rounded-lg overflow-hidden cursor-pointer group"
                    onClick={() => setIsPreviewPhotoOpen(true)}
                  >
                    <Image src={(currentRecipe as UserRecipe).photoDataUri!} alt={currentRecipe.title} layout="fill" objectFit="cover" />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="bg-white/90 text-primary text-xs font-bold px-3 py-1 rounded-full shadow-lg">Agrandir</span>
                    </div>
                  </div>
                )}
                <DialogTitle>{currentRecipe.title}</DialogTitle>
                <DialogDescription>
                  {'country' in currentRecipe ? `${currentRecipe.country} - ` : ''}
                  {'calories' in currentRecipe ? `Environ ${currentRecipe.calories} kcal` : ''}
                  {'description' in currentRecipe ? ` - ${currentRecipe.description}` : ''}
                </DialogDescription>
                {currentRecipe && 'searchLinks' in currentRecipe && currentRecipe.searchLinks && currentRecipe.searchLinks.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {currentRecipe.searchLinks.map((link, i) => {
                      const isYouTube = link.label.toLowerCase() === 'youtube';
                      const isTikTok = link.label.toLowerCase() === 'tiktok';
                      const isGoogle = link.label.toLowerCase() === 'google';

                      return (
                        <Button
                          key={i}
                          variant="outline"
                          size="sm"
                          className={cn(
                            "flex-1 h-8 text-[10px] gap-1 py-1 transition-all duration-300 font-bold",
                            isYouTube && "bg-[#FF0000] hover:bg-[#CC0000] text-white border-none shadow-sm",
                            isTikTok && "bg-black hover:bg-zinc-800 text-white border-none shadow-sm",
                            isGoogle && "bg-gradient-to-r from-blue-500/10 via-red-500/10 to-yellow-500/10 border-primary/10 hover:border-primary/30"
                          )}
                          asChild
                        >
                          <a href={link.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className={cn("h-3 w-3", (isYouTube || isTikTok) && "text-white")} />
                            {link.label}
                          </a>
                        </Button>
                      );
                    })}
                  </div>
                ) : (
                  currentRecipe && 'searchUrl' in currentRecipe && currentRecipe.searchUrl && (
                    <div className="mt-2">
                      <Button variant="outline" size="sm" asChild className="gap-2">
                        <a href={currentRecipe.searchUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                          Voir la recette complète en ligne
                        </a>
                      </Button>
                    </div>
                  )
                )}
              </DialogHeader>

              <div className="flex items-center gap-4 my-2">
                <Label htmlFor="portions" className="flex items-center gap-2"><Users className='h-4 w-4' /> Portions :</Label>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" className='h-8 w-8' onClick={() => setPortions(p => Math.max(1, p - 1))}><Minus className='h-4 w-4' /></Button>
                  <Input id="portions" type="number" value={portions} onChange={e => setPortions(Math.max(1, parseInt(e.target.value, 10) || 1))} className="w-16 h-8 text-center font-bold" />
                  <Button variant="outline" size="icon" className='h-8 w-8' onClick={() => setPortions(p => p + 1)}><Plus className='h-4 w-4' /></Button>
                </div>
              </div>

              <ScrollArea className="h-72 my-2 border rounded-md p-4">
                <h4 className='font-semibold'>Ingrédients :</h4>
                <ul className='list-disc pl-5 text-sm space-y-1 my-2'>
                  {currentIngredients?.map((ing, i) =>
                    <li key={ing.name + i}>
                      {calculateAdjustedQuantity(ing.quantity, basePortions, portions)} {ing.unit} de {ing.name}
                    </li>
                  )}
                </ul>
                {preparationSteps.length > 0 && (
                  <>
                    <h4 className='font-semibold mt-4'>Préparation :</h4>
                    <div className="text-sm text-muted-foreground whitespace-pre-wrap mt-2 space-y-3">
                      {preparationSteps.map((step, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <Checkbox
                            id={`step-${index}`}
                            checked={checkedSteps.has(index)}
                            onCheckedChange={() => handleToggleStep(index)}
                            className='mt-1'
                          />
                          <label
                            htmlFor={`step-${index}`}
                            className={cn("flex-1 cursor-pointer", checkedSteps.has(index) && "line-through text-muted-foreground/70")}
                          >
                            {step}
                          </label>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </ScrollArea>
              <DialogFooter className="sm:justify-between w-full">
                <div>
                  {viewingUserRecipe && (
                    <div className='flex items-center gap-1'>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onShareUserRecipe(viewingUserRecipe)}
                        aria-label="Partager la recette"
                      >
                        <Share2 className="h-4 w-4 text-primary" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
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
                  variant="outline"
                  onClick={() => {
                    setViewingRecipe(null);
                    setViewingUserRecipe(null);
                  }}
                >
                  Fermer
                </Button>
              </DialogFooter>
            </>
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
              onChange={e => {
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

      <Dialog open={!!sharedBasketToMerge} onOpenChange={(open) => !open && setSharedBasketToMerge(null)}>
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
    </>
  );
}
