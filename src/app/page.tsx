'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';

type Item = {
  id: number;
  name: string;
};

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [newItem, setNewItem] = useState('');
  const [nextId, setNextId] = useState(1);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItem.trim() !== '') {
      setItems([...items, { id: nextId, name: newItem.trim() }]);
      setNewItem('');
      setNextId(nextId + 1);
    }
  };

  const handleRemoveItem = (idToRemove: number) => {
    setItems(items.filter((item) => item.id !== idToRemove));
  };

  return (
    <main className="flex justify-center items-start min-h-screen p-4 sm:p-8 md:p-12 lg:p-24 bg-background">
      <div className="w-full max-w-2xl">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight lg:text-5xl text-primary-foreground bg-primary p-4 rounded-lg shadow-md">
            Mon Assistant de Courses
          </h1>
        </header>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Ajouter un article</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddItem} className="flex gap-2">
              <Input
                type="text"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder="Ex: Lait, Œufs, Pain..."
                className="flex-grow"
              />
              <Button type="submit" size="icon" aria-label="Ajouter l'article">
                <Plus className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>

        {items.length > 0 && (
          <Card className="mt-8 shadow-lg">
            <CardHeader>
              <CardTitle>Ma Liste</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between bg-secondary p-3 rounded-md"
                  >
                    <span className="text-secondary-foreground">{item.name}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveItem(item.id)}
                      aria-label={`Supprimer ${item.name}`}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
