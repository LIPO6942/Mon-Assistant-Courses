
'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import IngredientForm from './IngredientForm';
import CategoryForm from './CategoryForm';
import type { Ingredient, Recipe, CategoryDef } from '@/lib/types';
import type { ChandyekOutput } from '@/ai/types';

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

  isSuggestionsDialogOpen: boolean;
  setSuggestionsDialogOpen: (isOpen: boolean) => void;
  suggestions: ChandyekOutput | null;
  isChandyekLoading: boolean;
  chandyekError: string | null;
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
    isSuggestionsDialogOpen,
    setSuggestionsDialogOpen,
    suggestions,
    isChandyekLoading,
    chandyekError,
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

      <Dialog open={isSuggestionsDialogOpen} onOpenChange={setSuggestionsDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Suggestions de Recettes</DialogTitle>
                <DialogDescription>
                    Voici quelques idées basées sur vos ingrédients. Saha !
                </DialogDescription>
            </DialogHeader>
            <div className="my-4 min-h-[240px] flex items-center justify-center rounded-md border border-dashed">
                {isChandyekLoading ? (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground animate-pulse">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p>Analyse en cours...</p>
                    </div>
                ) : chandyekError ? (
                    <div className="text-center text-destructive p-4">
                        <p className="font-semibold">Une erreur est survenue</p>
                        <p className="text-sm mt-1">{chandyekError}</p>
                    </div>
                ) : (
                    <ScrollArea className="h-72 w-full pr-4">
                        <div className="space-y-4">
                            {suggestions?.suggestions.map((recipe, index) => (
                                <Card key={index} className="bg-secondary/50">
                                    <CardHeader className="p-4">
                                        <CardTitle className="text-lg">{recipe.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-0">
                                        <p className="text-sm text-muted-foreground">{recipe.description}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </ScrollArea>
                )}
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setSuggestionsDialogOpen(false)}>Fermer</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
