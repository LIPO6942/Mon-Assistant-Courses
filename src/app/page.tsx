'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Wand2, Loader2, AlertCircle } from 'lucide-react';
import { generateShoppingList } from '@/ai/flows/generate-list-flow';

// Définit le type d'un article avec une catégorie
type Item = {
  id: number;
  name: string;
  category: string;
};

// Définit les catégories disponibles
const categories = [
  'Fruits et Légumes',
  'Viandes et Poissons',
  'Produits Laitiers',
  'Boulangerie',
  'Épicerie',
  'Boissons',
  'Maison',
  'Autre',
];

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<string>(
    categories[0]
  );
  const [nextId, setNextId] = useState(1);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItemName.trim() !== '') {
      setItems([
        ...items,
        {
          id: nextId,
          name: newItemName.trim(),
          category: newItemCategory,
        },
      ]);
      setNewItemName('');
      setNextId(nextId + 1);
    }
  };

  const handleRemoveItem = (idToRemove: number) => {
    setItems(items.filter((item) => item.id !== idToRemove));
  };

  const handleGenerateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    setIsLoading(true);
    setAiError(null);
    try {
      const result = await generateShoppingList({ prompt: aiPrompt });
      if (result && result.items) {
        const newItems = result.items.map((item, index) => ({
          ...item,
          id: nextId + index,
        }));
        setItems((prevItems) => [...prevItems, ...newItems]);
        setNextId((prevId) => prevId + newItems.length);
        setAiPrompt('');
      } else {
        throw new Error("La réponse de l'IA était vide ou mal formée.");
      }
    } catch (error) {
      console.error('Erreur lors de la génération de la liste :', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      setAiError(
        `Une erreur est survenue. Cela est souvent dû à une clé API manquante ou invalide. (Détail: ${errorMessage})`
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Regroupe les articles par catégorie pour l'affichage
  const groupedItems = items.reduce(
    (acc, item) => {
      (acc[item.category] = acc[item.category] || []).push(item);
      return acc;
    },
    {} as Record<string, Item[]>
  );

  // Trie les catégories pour qu'elles apparaissent dans l'ordre prédéfini
  const sortedCategories = Object.keys(groupedItems).sort((a, b) => {
    return categories.indexOf(a) - categories.indexOf(b);
  });

  return (
    <main className="flex justify-center items-start min-h-screen p-4 sm:p-8 md:p-12 lg:p-24">
      <div className="w-full max-w-2xl space-y-8">
        <header className="text-center">
          <h1 className="text-4xl font-bold tracking-tight lg:text-5xl text-primary-foreground bg-primary p-4 rounded-lg shadow-md">
            Mon Assistant de Courses
          </h1>
        </header>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="text-accent" />
              Générer une liste avec l'IA
            </CardTitle>
            <CardDescription>
              Décrivez un repas ou un besoin (ex: "crêpes pour 4 personnes") et
              laissez l'IA créer votre liste.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleGenerateList}
              className="flex flex-col gap-4"
            >
              <div className="flex items-center gap-4">
                <Input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Ex: Ingrédients pour une quiche lorraine"
                  disabled={isLoading}
                />
                <Button type="submit" size="icon" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Wand2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {aiError && (
                <div className="p-3 rounded-md border border-destructive/50 bg-destructive/10 text-destructive text-sm flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <p>{aiError}</p>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Ajouter un article manuellement</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleAddItem}
              className="flex flex-col sm:flex-row items-end gap-4"
            >
              <div className="flex-grow grid gap-2 w-full">
                <Label htmlFor="item-name">Nom de l'article</Label>
                <Input
                  id="item-name"
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="Ex: Lait, Œufs, Pain..."
                />
              </div>
              <div className="grid gap-2 w-full sm:w-auto">
                <Label htmlFor="item-category">Catégorie</Label>
                <Select
                  value={newItemCategory}
                  onValueChange={setNewItemCategory}
                >
                  <SelectTrigger
                    id="item-category"
                    className="w-full sm:w-[180px]"
                  >
                    <SelectValue placeholder="Catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="submit"
                size="icon"
                aria-label="Ajouter l'article"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>

        {items.length > 0 && (
          <Card className="mt-8 shadow-lg">
            <CardHeader>
              <CardTitle>Ma Liste de Courses</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {sortedCategories.map((category) => (
                <div key={category}>
                  <h3 className="text-lg font-semibold text-primary mb-3 border-b-2 border-primary/20 pb-1">
                    {category}
                  </h3>
                  <ul className="space-y-3">
                    {groupedItems[category].map((item) => (
                      <li
                        key={item.id}
                        className="flex items-center justify-between bg-secondary p-3 rounded-md"
                      >
                        <span className="text-secondary-foreground">
                          {item.name}
                        </span>
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
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
