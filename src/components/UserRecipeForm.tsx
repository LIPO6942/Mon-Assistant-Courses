
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
import { cn } from '@/lib/utils';
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

  const [activeTab, setActiveTab] = React.useState<'info' | 'ingredients' | 'preparation'>('info');

  const onSubmit = (data: FormData) => {
    onSave({
      ...data,
      photoDataUri,
      preparationTime: parseInt(data.preparationTime, 10) || 0,
      portions: parseInt(data.portions, 10) || 1,
    });
  };

  const categoriesWithIcons = {
    'Plat': '🥘',
    'Entrée': '🥗',
    'Dessert': '🍰',
    'Petit Déjeuner': '🥐',
    'Boisson': '🍹',
    'Autre': '🍴'
  };

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Premium Tabs */}
      <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl gap-1">
        {(['info', 'ingredients', 'preparation'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all capitalize",
              activeTab === tab
                ? "bg-white dark:bg-zinc-700 shadow-sm text-primary"
                : "text-muted-foreground hover:bg-white/50 dark:hover:bg-zinc-700/50"
            )}
          >
            {tab === 'info' ? 'Infos' : tab}
          </button>
        ))}
      </div>

      <ScrollArea className="h-[60vh] pr-4">
        <div className="space-y-6 pt-2">
          {activeTab === 'info' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
              <div className="relative group">
                <Label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Photo de la recette</Label>
                <div className="relative">
                  <ImagePicker photoDataUri={photoDataUri} setPhotoDataUri={setPhotoDataUri} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="title" className="text-sm font-semibold">Titre de la recette</Label>
                  <Input id="title" className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:ring-primary" placeholder="ex: Lasagnes à la bolognaise" {...register("title", { required: "Le nom est requis" })} />
                  {errors.title && <p className="text-[10px] text-destructive font-medium uppercase">{errors.title.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="author" className="text-sm font-semibold">Auteur</Label>
                  <Input id="author" className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800" placeholder="Ton nom ou un chef" {...register("author")} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                <div className="space-y-1.5">
                  <Label htmlFor="category" className="text-xs font-bold uppercase text-muted-foreground">Catégorie</Label>
                  <ControllerSelect
                    control={control}
                    name="category"
                    items={recipeCategories}
                    placeholder="Choisir"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="preparationTime" className="text-xs font-bold uppercase text-muted-foreground">Temps (min)</Label>
                  <Input id="preparationTime" type="number" className="bg-white dark:bg-zinc-900" {...register("preparationTime", { required: "Requis" })} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="portions" className="text-xs font-bold uppercase text-muted-foreground">Portions</Label>
                  <Input id="portions" type="number" className="bg-white dark:bg-zinc-900" {...register("portions", { required: "Requis" })} />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="tags" className="text-sm font-semibold">Tags</Label>
                <Input id="tags" className="bg-zinc-50 dark:bg-zinc-900" {...register("tags")} placeholder="vegan, rapide, detox..." />
              </div>
            </div>
          )}

          {activeTab === 'ingredients' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-[10px]">{fields.length}</span>
                  Liste des ingrédients
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-full border-primary/20 hover:bg-primary/5 hover:text-primary transition-colors text-xs"
                  onClick={() => {
                    append({ name: '', quantity: 1, unit: 'pièce' });
                  }}
                >
                  Ajouter
                </Button>
              </div>

              <div className="space-y-3">
                {fields.map((field, index) => {
                  const currentName = watchedIngredients[index]?.name || '';
                  const suggestions = pantryNames.filter(name =>
                    name.toLowerCase().includes(currentName.toLowerCase()) &&
                    name.toLowerCase() !== currentName.toLowerCase()
                  ).slice(0, 5);

                  return (
                    <div key={field.id} className="group relative bg-white dark:bg-zinc-900 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all">
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex-1 min-w-[150px] relative">
                          <Input
                            placeholder="Nom..."
                            className="w-full bg-transparent p-0 h-8 border-none focus-visible:ring-0 shadow-none font-medium text-base sm:text-sm"
                            {...register(`ingredients.${index}.name`, { required: true })}
                            onFocus={() => setFocusedIngredientIndex(index)}
                            onBlur={() => setTimeout(() => setFocusedIngredientIndex(null), 200)}
                          />
                          {focusedIngredientIndex === index && suggestions.length > 0 && (
                            <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-900 border rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95">
                              {suggestions.map(name => (
                                <button
                                  key={name}
                                  type="button"
                                  className="w-full text-left px-3 py-2 text-sm hover:bg-primary/10 hover:text-primary transition-colors flex items-center justify-between"
                                  onClick={() => {
                                    setValue(`ingredients.${index}.name`, name);
                                    setFocusedIngredientIndex(null);
                                  }}
                                >
                                  <span>{name}</span>
                                  <ChevronDown className="h-3 w-3 opacity-30" />
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800 p-1 rounded-lg">
                          <Input
                            type="number"
                            step="0.001"
                            className="w-16 h-7 bg-transparent border-none text-center p-0 focus-visible:ring-0 shadow-none"
                            {...register(`ingredients.${index}.quantity`, { required: true, valueAsNumber: true })}
                          />
                          <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-700" />
                          <ControllerSelect
                            control={control}
                            name={`ingredients.${index}.unit`}
                            items={[...units]}
                            placeholder="Unt."
                            className="w-20 h-7 bg-transparent border-none p-0 focus:ring-0 shadow-none text-xs"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                          className="h-8 w-8 text-zinc-300 hover:text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'preparation' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
              <div className="space-y-2">
                <Label htmlFor="preparation" className="text-sm font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  Étapes de préparation
                </Label>
                <div className="relative">
                  <Textarea
                    id="preparation"
                    placeholder="Écris ici les étapes, l'IA les formatera si tu utilises le remplissage magique..."
                    className="min-h-[300px] bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:ring-primary rounded-2xl resize-none p-4 leading-relaxed"
                    {...register("preparation", { required: "La préparation est requise" })}
                  />
                </div>
                {errors.preparation && <p className="text-[10px] text-destructive font-semibold uppercase">{errors.preparation.message}</p>}
              </div>
            </div>
          )}
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
