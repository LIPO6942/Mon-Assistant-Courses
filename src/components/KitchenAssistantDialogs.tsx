
'use client';

import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Minus, Plus } from 'lucide-react';
import IngredientForm from './IngredientForm';
import CategoryForm from './CategoryForm';
import HealthConditionManager from './HealthConditionManager';
import type { Ingredient, Recipe, CategoryDef, HealthConditionCategory, HealthCondition } from '@/lib/types';

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

  viewingRecipe: (Omit<Recipe, 'id'> & { id?: string }) | null;
  setViewingRecipe: (recipe: (Omit<Recipe, 'id'> & { id?: string }) | null) => void;

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
    onAddToBasket
  } = props;

  const [quantityInput, setQuantityInput] = React.useState('1');

  React.useEffect(() => {
    if (isQuantityDialogOpen) {
      setQuantityInput('1');
    }
  }, [isQuantityDialogOpen]);

  const handleConfirmQuantity = () => {
    const quantity = parseFloat(quantityInput);
    if (!isNaN(quantity) && quantity > 0 && ingredientForQuantity) {
      onAddToBasket(ingredientForQuantity, quantity);
    }
  };
  
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
      
      <Dialog open={!!viewingRecipe} onOpenChange={(open) => !open && setViewingRecipe(null)}>
        <DialogContent className="max-w-lg">
            {viewingRecipe && (
              <>
                <DialogHeader>
                  <DialogTitle>{viewingRecipe.title}</DialogTitle>
                  <DialogDescription>{viewingRecipe.country} - Environ {viewingRecipe.calories} kcal - {viewingRecipe.description}</DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-72 my-2 border rounded-md p-4">
                    <h4 className='font-semibold'>Ingrédients :</h4>
                    <ul className='list-disc pl-5 text-sm space-y-1 my-2'>
                        {viewingRecipe.ingredients.map(ing => <li key={ing.name}>{ing.quantity} {ing.unit} de {ing.name}</li>)}
                    </ul>
                    <h4 className='font-semibold mt-4'>Préparation :</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap mt-2">{viewingRecipe.preparation}</p>
                </ScrollArea>
                <DialogFooter>
                  <DialogClose asChild><Button type="button">Fermer</Button></DialogClose>
                </DialogFooter>
              </>
            )}
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
