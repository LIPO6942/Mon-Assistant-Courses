
'use client';

import * as React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Trash2, Pencil, Check, X } from 'lucide-react';
import type { HealthCondition, HealthConditionCategory } from '@/lib/types';
import { cn } from '@/lib/utils';

interface HealthConditionManagerProps {
  healthConditions: HealthConditionCategory[];
  onSaveCategory: (id: string | null, name: string) => void;
  onDeleteCategory: (id: string) => void;
  onSaveCondition: (categoryId: string, condition: { id: string | null; name: string }) => void;
  onDeleteCondition: (categoryId: string, conditionId: string) => void;
}

export default function HealthConditionManager({
  healthConditions,
  onSaveCategory,
  onDeleteCategory,
  onSaveCondition,
  onDeleteCondition,
}: HealthConditionManagerProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(healthConditions[0]?.id || null);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');

  const [editingConditionId, setEditingConditionId] = useState<string | null>(null);
  const [editingConditionName, setEditingConditionName] = useState('');
  const [newConditionName, setNewConditionName] = useState('');

  const selectedCategory = healthConditions.find(c => c.id === selectedCategoryId);

  const handleEditCategory = (category: HealthConditionCategory) => {
    setEditingCategoryId(category.id);
    setEditingCategoryName(category.name);
  };

  const handleSaveEditedCategory = () => {
    if (editingCategoryId) {
      onSaveCategory(editingCategoryId, editingCategoryName);
      setEditingCategoryId(null);
      setEditingCategoryName('');
    }
  };

  const handleAddNewCategory = () => {
    onSaveCategory(null, newCategoryName);
    setNewCategoryName('');
  };

  const handleEditCondition = (condition: HealthCondition) => {
    setEditingConditionId(condition.id);
    setEditingConditionName(condition.name);
  };
  
  const handleSaveEditedCondition = () => {
    if (editingConditionId && selectedCategoryId) {
      onSaveCondition(selectedCategoryId, { id: editingConditionId, name: editingConditionName });
      setEditingConditionId(null);
      setEditingConditionName('');
    }
  };

  const handleAddNewCondition = () => {
    if (selectedCategoryId) {
      onSaveCondition(selectedCategoryId, { id: null, name: newConditionName });
      setNewConditionName('');
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-1 max-h-[60vh] overflow-y-auto">
      {/* Categories Column */}
      <Card>
        <CardHeader><CardTitle>Catégories</CardTitle></CardHeader>
        <CardContent>
          <ScrollArea className="h-72 pr-4">
            <ul className="space-y-2">
              {healthConditions.map(category => (
                <li
                  key={category.id}
                  className={cn(
                    "flex items-center justify-between p-2 rounded-md cursor-pointer",
                    selectedCategoryId === category.id ? 'bg-primary/20' : 'hover:bg-secondary'
                  )}
                  onClick={() => setSelectedCategoryId(category.id)}
                >
                  {editingCategoryId === category.id ? (
                    <div className="flex items-center gap-2 w-full">
                      <Input value={editingCategoryName} onChange={e => setEditingCategoryName(e.target.value)} className="h-8"/>
                      <Button size="icon" className="h-8 w-8" onClick={handleSaveEditedCategory}><Check className="h-4 w-4"/></Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditingCategoryId(null)}><X className="h-4 w-4"/></Button>
                    </div>
                  ) : (
                    <>
                      <span>{category.name}</span>
                      <div className="flex items-center">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); handleEditCategory(category); }}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); onDeleteCategory(category.id); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </ScrollArea>
          <div className="flex items-center gap-2 mt-4">
            <Input placeholder="Nouvelle catégorie..." value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} />
            <Button onClick={handleAddNewCategory} disabled={!newCategoryName.trim()}>
              <Plus className="h-4 w-4 mr-2"/>Ajouter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Conditions Column */}
      <Card>
        <CardHeader><CardTitle>Conditions pour "{selectedCategory?.name || '...'}"</CardTitle></CardHeader>
        <CardContent>
          <ScrollArea className="h-72 pr-4">
            {selectedCategory ? (
              <ul className="space-y-2">
                {selectedCategory.conditions.map(condition => (
                  <li key={condition.id} className="flex items-center justify-between p-2 rounded-md hover:bg-secondary">
                     {editingConditionId === condition.id ? (
                      <div className="flex items-center gap-2 w-full">
                        <Input value={editingConditionName} onChange={e => setEditingConditionName(e.target.value)} className="h-8"/>
                        <Button size="icon" className="h-8 w-8" onClick={handleSaveEditedCondition}><Check className="h-4 w-4"/></Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditingConditionId(null)}><X className="h-4 w-4"/></Button>
                      </div>
                     ) : (
                      <>
                        <span>{condition.name}</span>
                        <div className="flex items-center">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditCondition(condition)}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDeleteCondition(selectedCategory.id, condition.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            ) : <p className="text-muted-foreground text-center pt-10">Sélectionnez une catégorie</p>}
          </ScrollArea>
           <div className="flex items-center gap-2 mt-4">
            <Input placeholder="Nouvelle condition..." value={newConditionName} onChange={e => setNewConditionName(e.target.value)} disabled={!selectedCategory} />
            <Button onClick={handleAddNewCondition} disabled={!selectedCategory || !newConditionName.trim()}>
              <Plus className="h-4 w-4 mr-2"/>Ajouter
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
