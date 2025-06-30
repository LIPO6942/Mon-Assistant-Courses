
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, PlusCircle, Pencil, Trash2, Search } from 'lucide-react';
import type { Ingredient, CategoryDef } from '@/lib/types';

interface PantryViewProps {
  groupedIngredients: Record<string, Ingredient[]>;
  categories: CategoryDef[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  addToBasket: (ingredient: Ingredient) => void;
  openAddDialog: (category?: string) => void;
  openEditDialog: (ingredient: Ingredient) => void;
  handleDeleteIngredient: (id: string) => void;
  openCategoryDialog: (category?: CategoryDef) => void;
  handleDeleteCategory: (id: string) => void;
}

export default function PantryView({
  groupedIngredients,
  categories,
  searchQuery,
  setSearchQuery,
  addToBasket,
  openAddDialog,
  openEditDialog,
  handleDeleteIngredient,
  openCategoryDialog,
  handleDeleteCategory,
}: PantryViewProps) {
  return (
    <div>
      <div className="relative mb-6">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input type="search" placeholder="Rechercher un ingrédient..." className="pl-11 rounded-full" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {Object.entries(groupedIngredients).filter(([, items]) => items.length > 0).map(([categoryName, items]) => {
          const category = categories.find(c => c.name === categoryName) || { id: 'c-autre', name: 'Autre' };
          return (
            <Card key={category.id} className="flex flex-col bg-card shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-primary">{category.name}</CardTitle>
                {category.name !== 'Autre' && <div className="flex items-center">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openCategoryDialog(category)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteCategory(category.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>}
              </CardHeader>
              <CardContent className="flex-grow">
                <ScrollArea className="h-64">
                  <ul className="space-y-2 pr-3">
                    {items.map(item => (
                      <li key={item.id} className="flex items-center justify-between p-2 rounded-md hover:bg-secondary/50 transition-colors">
                        <div>
                          <span className='font-medium'>{item.name}</span>
                          <p className='text-sm text-muted-foreground'>{item.price.toFixed(2)} DT / {item.unit}</p>
                        </div>
                        <div className='flex items-center gap-1'>
                          <Button variant="ghost" size="icon" className='h-8 w-8 rounded-full' onClick={() => addToBasket(item)}><Plus className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className='h-8 w-8 rounded-full' onClick={() => openEditDialog(item)}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className='h-8 w-8 rounded-full' onClick={() => handleDeleteIngredient(item.id)}><Trash2 className="h-4 w-4 text-destructive/80" /></Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => openAddDialog(category.name)}><PlusCircle className="mr-2 h-4 w-4" /> Ajouter un produit</Button>
              </CardFooter>
            </Card>
          )
        })}
        <Card className="flex flex-col items-center justify-center border-2 border-dashed bg-card/50 hover:border-primary hover:text-primary transition-colors cursor-pointer min-h-[300px]" onClick={() => openCategoryDialog()}>
          <PlusCircle className="h-10 w-10 mb-2" />
          <span className="font-semibold">Ajouter une catégorie</span>
        </Card>
      </div>
    </div>
  );
}
