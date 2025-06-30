
'use client';

import * as React from 'react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Ingredient, CategoryDef } from '@/lib/types';
import { units } from '@/lib/types';

interface IngredientFormProps {
  ingredient: Partial<Ingredient> | null;
  categories: CategoryDef[];
  onSave: (data: Omit<Ingredient, 'id'> & { id?: string }) => void;
  formId: string;
}

export default function IngredientForm({ ingredient, categories, onSave, formId }: IngredientFormProps) {
  const [formData, setFormData] = useState({
    name: ingredient?.name || '',
    category: ingredient?.category || categories[0]?.name || 'Autre',
    price: ingredient?.price !== undefined ? String(ingredient.price) : '',
    unit: ingredient?.unit || 'pièce',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      price: parseFloat(formData.price) || 0,
      id: ingredient?.id,
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
          step="0.1"
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
    </form>
  );
}
