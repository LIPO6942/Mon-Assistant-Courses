
'use client';

import * as React from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import type { UserRecipe, RecipeIngredient } from '@/lib/types';
import { recipeCategories, units } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, Sparkles, Loader2, ChevronDown } from 'lucide-react';
import ImagePicker from './ImagePicker';
import { ocrRecipeFromImage } from '@/ai/flows/ocr-recipe-flow';
import type { Ingredient } from '@/lib/types';

interface UserRecipeFormProps {
  initialData: UserRecipe | null;
  onSave: (data: Omit<UserRecipe, 'id'> & { id?: string }) => void;
  formId: string;
  pantry: Ingredient[];
}

type FormData = Omit<UserRecipe, 'id' | 'preparationTime' | 'portions'> & {
  preparationTime: string;
  portions: string;
  id?: string;
};

export default function UserRecipeForm({ initialData, onSave, formId, pantry }: UserRecipeFormProps) {
  const [photoDataUri, setPhotoDataUri] = React.useState<string | undefined>(initialData?.photoDataUri);
  const [isOcrLoading, setIsOcrLoading] = React.useState(false);
  const [focusedIngredientIndex, setFocusedIngredientIndex] = React.useState<number | null>(null);

  const pantryNames = React.useMemo(() => {
    return Array.from(new Set(pantry.map(i => i.name))).sort();
  }, [pantry]);

  const { register, control, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      id: initialData?.id,
      title: initialData?.title || '',
      category: initialData?.category || 'Plat',
      ingredients: initialData?.ingredients || [{ name: '', quantity: 1, unit: 'pièce' }],
      preparation: initialData?.preparation || '',
      preparationTime: String(initialData?.preparationTime || '30'),
      portions: String(initialData?.portions || '2'),
      author: initialData?.author || '',
      tags: initialData?.tags || '',
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "ingredients",
  });

  const watchedIngredients = watch("ingredients");

  const handleOcr = async () => {
    if (!photoDataUri) return;
    setIsOcrLoading(true);
    try {
      const result = await ocrRecipeFromImage({ photoDataUri });
      // Merge with existing data instead of replacing everything if possible, 
      // but 'replace' for ingredients is cleaner for AI results.
      if (result.title) setValue('title', result.title);
      if (result.category) setValue('category', result.category);
      if (result.preparation) setValue('preparation', result.preparation);
      if (result.preparationTime) setValue('preparationTime', String(result.preparationTime));
      if (result.portions) setValue('portions', String(result.portions));
      if (result.tags) setValue('tags', result.tags);
      if (result.ingredients && result.ingredients.length > 0) {
        replace(result.ingredients);
      }
    } catch (error) {
      console.error("OCR Error:", error);
      alert("Erreur lors de l'analyse de la recette par l'IA.");
    } finally {
      setIsOcrLoading(false);
    }
  };

  const onSubmit = (data: FormData) => {
    onSave({
      ...data,
      photoDataUri,
      preparationTime: parseInt(data.preparationTime, 10) || 0,
      portions: parseInt(data.portions, 10) || 1,
    });
  };

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <ScrollArea className="h-[65vh] pr-6">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="flex-1">
              <Label>Photo du plat</Label>
              <ImagePicker photoDataUri={photoDataUri} setPhotoDataUri={setPhotoDataUri} />
            </div>
            {photoDataUri && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleOcr}
                disabled={isOcrLoading}
                className="rounded-full border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 transition-all font-bold gap-2 self-start sm:self-auto"
              >
                {isOcrLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                Remplissage Magique (IA)
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Nom de la recette</Label>
              <Input id="title" {...register("title", { required: "Le nom est requis" })} />
              {errors.title && <p className="text-sm text-destructive mt-1">{errors.title.message}</p>}
            </div>
            <div>
              <Label htmlFor="author">Auteur (facultatif)</Label>
              <Input id="author" {...register("author")} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="category">Catégorie</Label>
              <ControllerSelect
                control={control}
                name="category"
                items={recipeCategories}
                placeholder="Choisir une catégorie"
              />
            </div>
            <div>
              <Label htmlFor="preparationTime">Temps (min)</Label>
              <Input id="preparationTime" type="number" {...register("preparationTime", { required: "Le temps est requis" })} />
              {errors.preparationTime && <p className="text-sm text-destructive mt-1">{errors.preparationTime.message}</p>}
            </div>
            <div>
              <Label htmlFor="portions">Portions</Label>
              <Input id="portions" type="number" {...register("portions", { required: "Le nombre de portions est requis" })} />
              {errors.portions && <p className="text-sm text-destructive mt-1">{errors.portions.message}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="tags">Tags (facultatif, séparés par des virgules)</Label>
            <Input id="tags" {...register("tags")} placeholder="ex: vegan, rapide, sans gluten" />
          </div>

          <div>
            <Label>Ingrédients</Label>
            <div className="space-y-4 mt-1">
              {fields.map((field, index) => {
                const currentName = watchedIngredients[index]?.name || '';
                const suggestions = pantryNames.filter(name =>
                  name.toLowerCase().includes(currentName.toLowerCase()) &&
                  name.toLowerCase() !== currentName.toLowerCase()
                ).slice(0, 5);

                return (
                  <div key={field.id} className="relative space-y-2 pb-2 border-b border-dashed sm:border-none sm:pb-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex-1 min-w-[150px] relative">
                        <Input
                          placeholder="Nom (ex: Poulet, Tomate...)"
                          {...register(`ingredients.${index}.name`, { required: true })}
                          onFocus={() => setFocusedIngredientIndex(index)}
                          onBlur={() => setTimeout(() => setFocusedIngredientIndex(null), 200)}
                          className="w-full"
                        />
                        {focusedIngredientIndex === index && suggestions.length > 0 && (
                          <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white dark:bg-zinc-900 border rounded-lg shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                            {suggestions.map(name => (
                              <button
                                key={name}
                                type="button"
                                className="w-full text-left px-3 py-2 text-sm hover:bg-primary/5 hover:text-primary transition-colors flex items-center justify-between group"
                                onClick={() => {
                                  setValue(`ingredients.${index}.name`, name);
                                  setFocusedIngredientIndex(null);
                                }}
                              >
                                <span>{name}</span>
                                <ChevronDown className="h-3 w-3 opacity-0 group-hover:opacity-50" />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Input
                          type="number"
                          step="0.001"
                          placeholder="Qté"
                          {...register(`ingredients.${index}.quantity`, { required: true, valueAsNumber: true })}
                          className="w-20"
                        />
                        <ControllerSelect
                          control={control}
                          name={`ingredients.${index}.unit`}
                          items={[...units]}
                          placeholder="Unité"
                          className="w-24"
                        />
                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="shrink-0 hover:bg-destructive/10 hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => append({ name: '', quantity: 1, unit: 'pièce' })}
            >
              Ajouter un ingrédient
            </Button>
          </div>

          <div>
            <Label htmlFor="preparation">Étapes de préparation</Label>
            <Textarea
              id="preparation"
              {...register("preparation", { required: "La préparation est requise" })}
              rows={8}
            />
            {errors.preparation && <p className="text-sm text-destructive mt-1">{errors.preparation.message}</p>}
          </div>
        </div>
      </ScrollArea>
    </form>
  );
}

// Helper component to integrate ShadCN Select with React Hook Form
interface ControllerSelectProps {
  control: any;
  name: string;
  items: readonly string[];
  placeholder: string;
  className?: string;
}

function ControllerSelect({ control, name, items, placeholder, className }: ControllerSelectProps) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <Select onValueChange={field.onChange} defaultValue={field.value}>
          <SelectTrigger className={className}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {items.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    />
  );
}
