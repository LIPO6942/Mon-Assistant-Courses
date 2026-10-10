
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
    <form id={formId} onSubmit={handleSubmit} className="grid gap-3 py-2">
      <div className="grid grid-cols-4 items-center gap-3">
        <Label htmlFor="name" className="text-right text-xs sm:text-sm">
          Nom
        </Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="col-span-3 h-9 text-sm"
          required
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-3">
        <Label htmlFor="category" className="text-right text-xs sm:text-sm">
          Catégorie
        </Label>
        <Select
          value={formData.category}
          onValueChange={(value) => setFormData({ ...formData, category: value })}
        >
          <SelectTrigger className="col-span-3 h-9 text-sm">
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
      <div className="grid grid-cols-4 items-center gap-3">
        <Label htmlFor="price" className="text-right text-xs sm:text-sm">
          Prix (DT)
        </Label>
        <Input
          id="price"
          type="number"
          step="0.001"
          min="0"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          className="col-span-3 h-9 text-sm"
          required
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-3">
        <Label htmlFor="unit" className="text-right text-xs sm:text-sm">
          Unité
        </Label>
        <Select
          value={formData.unit}
          onValueChange={(value) => setFormData({ ...formData, unit: value })}
        >
          <SelectTrigger className="col-span-3 h-9 text-sm">
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
        <div className="mt-1 pt-2 border-t border-border/40">
          <div className="rounded-xl border border-primary/25 bg-primary/5 px-3 py-2 flex items-center justify-between gap-2 shadow-xs">
            <label htmlFor="addToBasket" className="flex items-center gap-2 cursor-pointer select-none min-w-0 flex-1">
              <Checkbox
                id="addToBasket"
                checked={addToBasket}
                onCheckedChange={(checked) => setAddToBasket(!!checked)}
                className="h-4 w-4 shrink-0 data-[state=checked]:bg-primary"
              />
              <ShoppingBasket className="h-4 w-4 text-primary shrink-0" />
              <span className="text-xs sm:text-sm font-semibold text-foreground whitespace-nowrap">
                Ajouter au panier
              </span>
            </label>
            {addToBasket && (
              <div className="flex items-center gap-1.5 shrink-0 animate-in fade-in-50 duration-150">
                <Input
                  type="number"
                  step="any"
                  min="0.1"
                  value={basketQuantity}
                  onChange={(e) => setBasketQuantity(e.target.value)}
                  className="h-7 w-16 bg-background text-xs font-bold text-center px-1"
                />
                <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                  {formData.unit}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </form>
  );
}
