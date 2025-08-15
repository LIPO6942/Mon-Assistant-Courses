

'use client';

import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Minus, Plus, Pencil, Trash2, Users } from 'lucide-react';
import IngredientForm from './IngredientForm';
import CategoryForm from './CategoryForm';
import HealthConditionManager from './HealthConditionManager';
import type { Ingredient, Recipe, CategoryDef, HealthConditionCategory, UserRecipe, RecipeIngredient } from '@/lib/types';
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
  } = props;

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
    // Format to max 2 decimal places, and remove trailing zeros
    return parseFloat(adjusted.toFixed(2));
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
  const preparationSteps = currentRecipe?.preparation.split('\n').filter(line => line.trim() !== '') || [];

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
            <CategoryForm key={editingCategory?.id || 'new-cat'} category={editingCategory} onSave={handleSaveCategory} formId="category-form"/>
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
                    <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden">
                       <Image src={(currentRecipe as UserRecipe).photoDataUri!} alt={currentRecipe.title} layout="fill" objectFit="cover" />
                    </div>
                  )}
                  <DialogTitle>{currentRecipe.title}</DialogTitle>
                  <DialogDescription>
                    {'country' in currentRecipe ? `${currentRecipe.country} - ` : ''}
                    {'calories' in currentRecipe ? `Environ ${currentRecipe.calories} kcal` : ''}
                    {'description' in currentRecipe ? ` - ${currentRecipe.description}` : ''}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="flex items-center gap-4 my-2">
                  <Label htmlFor="portions" className="flex items-center gap-2"><Users className='h-4 w-4'/> Portions :</Label>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" className='h-8 w-8' onClick={() => setPortions(p => Math.max(1, p - 1))}><Minus className='h-4 w-4'/></Button>
                    <Input id="portions" type="number" value={portions} onChange={e => setPortions(Math.max(1, parseInt(e.target.value, 10) || 1))} className="w-16 h-8 text-center font-bold" />
                    <Button variant="outline" size="icon" className='h-8 w-8' onClick={() => setPortions(p => p + 1)}><Plus className='h-4 w-4'/></Button>
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
                </ScrollArea>
                <DialogFooter className='justify-between w-full'>
                   <div>
                    {viewingUserRecipe && (
                      <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onDeleteUserRecipe(viewingUserRecipe.id); setViewingUserRecipe(null); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    )}
                  </div>
                  <div>
                    <Button type="button" variant="outline" className='mr-2' onClick={() => { setViewingRecipe(null); setViewingUserRecipe(null); }}>Fermer</Button>
                  </div>
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
                    const next = Math.max(0.1, parseFloat((current - 0.1).toFixed(2)));
                    setQuantityInput(String(next));
                }}><Minus className="h-4 w-4"/></Button>
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
                  const next = parseFloat((current + 0.1).toFixed(2));
                  setQuantityInput(String(next));
                }}><Plus className="h-4 w-4"/></Button>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setQuantityDialogOpen(false)}>Annuler</Button>
                <Button onClick={handleConfirmQuantity} disabled={!(parseFloat(quantityInput) > 0)}>Ajouter au panier</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
