
'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import IngredientForm from './IngredientForm';
import CategoryForm from './CategoryForm';
import type { Ingredient, Recipe, CategoryDef } from '@/lib/types';

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

  viewingRecipe: Recipe | null;
  setViewingRecipe: (recipe: Recipe | null) => void;
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
  } = props;
  
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
    </>
  );
}
