
'use client';

import * as React from 'react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { CategoryDef } from '@/lib/types';

interface CategoryFormProps {
  category: Pick<CategoryDef, 'name'> & { id?: string } | null;
  onSave: (data: { id?: string; name: string }) => void;
  formId: string;
}

export default function CategoryForm({ category, onSave, formId }: CategoryFormProps) {
  const [name, setName] = useState(category?.name || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave({ id: category?.id, name: name.trim() });
    }
  };

  return (
    <form id={formId} onSubmit={handleSubmit} className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="cat-name" className="text-right">
          Nom
        </Label>
        <Input
          id="cat-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="col-span-3"
          required
        />
      </div>
    </form>
  );
}
