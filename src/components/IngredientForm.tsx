
'use client';

import * as React from 'react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShoppingBasket } from 'lucide-react';
import type { Ingredient, CategoryDef } from '@/lib/types';
import { units } from '@/lib/types';

interface IngredientFormProps {
  ingredient: Partial<Ingredient> | null;
  categories: CategoryDef[];
  onSave: (data: Omit<Ingredient, 'id'> & { id?: string; addToBasket?: boolean; basketQuantity?: number }) => void;
  formId: string;
}

export default function IngredientForm({ ingredient, categories, onSave, formId }: IngredientFormProps) {
  const [formData, setFormData] = useState({
    name: ingredient?.name || '',
    category: ingredient?.category || categories[0]?.name || 'Autre',
    price: ingredient?.price !== undefined ? String(ingredient.price) : '',
    unit: ingredient?.unit || 'pièce',
  });
  const [addToBasket, setAddToBasket] = useState(false);
  const [basketQuantity, setBasketQuantity] = useState('1');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      price: parseFloat(formData.price) || 0,
      id: ingredient?.id,
      addToBasket: !ingredient?.id ? addToBasket : false,
      basketQuantity: !ingredient?.id && addToBasket ? (parseFloat(basketQuantity) || 1) : undefined,
    });
  };

  return (
    <form id={formId} onSubmit={handleSubmit} className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="name" className="text-right">
          Nom
        </Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="col-span-3"
          required
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="category" className="text-right">
          Catégorie
        </Label>
        <Select
          value={formData.category}
          onValueChange={(value) => setFormData({ ...formData, category: value })}
        >
          <SelectTrigger className="col-span-3">
            <SelectValue placeholder="Choisir" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.name}>
                {cat.name}
              </SelectItem>
            ))}
            <SelectItem value="Autre">Autre</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="price" className="text-right">
          Prix (DT)
        </Label>
        <Input
          id="price"
          type="number"
          step="0.001"
          min="0"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          className="col-span-3"
          required
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="unit" className="text-right">
          Unité
        </Label>
        <Select
          value={formData.unit}
          onValueChange={(value) => setFormData({ ...formData, unit: value })}
        >
          <SelectTrigger className="col-span-3">
            <SelectValue placeholder="Choisir" />
          </SelectTrigger>
          <SelectContent>
            {[...units].map((unit) => (
              <SelectItem key={unit} value={unit}>
                {unit}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!ingredient?.id && (
        <div className="mt-2 pt-3 border-t border-border/50">
          <div className="rounded-xl border border-primary/25 bg-primary/5 p-3.5 flex flex-col gap-2.5 shadow-xs">
            <label htmlFor="addToBasket" className="flex items-center gap-3 cursor-pointer select-none">
              <Checkbox
                id="addToBasket"
                checked={addToBasket}
                onCheckedChange={(checked) => setAddToBasket(!!checked)}
                className="h-5 w-5 data-[state=checked]:bg-primary"
              />
              <div className="flex items-center gap-2">
                <ShoppingBasket className="h-4 w-4 text-primary shrink-0" />
                <span className="text-sm font-semibold text-foreground">
                  Ajouter également au panier
                </span>
              </div>
            </label>
            {addToBasket && (
              <div className="flex items-center gap-2 pl-8 pt-1 animate-in fade-in-50 duration-200">
                <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Quantité :</span>
                <Input
                  type="number"
                  step="any"
                  min="0.1"
                  value={basketQuantity}
                  onChange={(e) => setBasketQuantity(e.target.value)}
                  className="h-8 w-24 bg-background text-sm font-semibold"
                />
                <span className="text-xs text-muted-foreground">{formData.unit}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </form>
  );
}
