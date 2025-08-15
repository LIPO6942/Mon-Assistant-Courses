
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
import { Trash2 } from 'lucide-react';
import ImagePicker from './ImagePicker';

interface UserRecipeFormProps {
  initialData: UserRecipe | null;
  onSave: (data: Omit<UserRecipe, 'id'> & { id?: string }) => void;
  formId: string;
}

type FormData = Omit<UserRecipe, 'id' | 'preparationTime' | 'portions'> & {
  preparationTime: string;
  portions: string;
  id?: string;
};

export default function UserRecipeForm({ initialData, onSave, formId }: UserRecipeFormProps) {
  const [photoDataUri, setPhotoDataUri] = React.useState<string | undefined>(initialData?.photoDataUri);

  const { register, control, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      id: initialData?.id,
      title: initialData?.title || '',
      category: initialData?.category || 'Plat',
      ingredients: initialData?.ingredients || [{ name: '', quantity: 1, unit: 'pièce' }],
      preparation: initialData?.preparation || '',
      preparationTime: String(initialData?.preparationTime || '30'),
      portions: String(initialData?.portions || '4'),
      author: initialData?.author || '',
      tags: initialData?.tags || '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "ingredients",
  });

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
            <div>
              <Label>Photo du plat</Label>
              <ImagePicker photoDataUri={photoDataUri} setPhotoDataUri={setPhotoDataUri} />
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
                <Input id="tags" {...register("tags")} placeholder="ex: vegan, rapide, sans gluten"/>
            </div>

            <div>
              <Label>Ingrédients</Label>
              <div className="space-y-2 mt-1">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2">
                    <Input
                      placeholder="Nom"
                      {...register(`ingredients.${index}.name`, { required: true })}
                      className="w-1/2"
                    />
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="Qté"
                      {...register(`ingredients.${index}.quantity`, { required: true, valueAsNumber: true })}
                      className="w-1/4"
                    />
                     <ControllerSelect
                        control={control}
                        name={`ingredients.${index}.unit`}
                        items={[...units]}
                        placeholder="Unité"
                        className="w-1/4"
                     />
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
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
