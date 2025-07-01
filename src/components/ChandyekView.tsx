'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Loader2, Salad } from 'lucide-react';
import type { ChandyekOutput } from '@/ai/types';

interface ChandyekViewProps {
  suggestions: ChandyekOutput | null;
  isLoading: boolean;
  handleSuggestRecipes: (ingredients: string) => void;
}

export default function ChandyekView({ suggestions, isLoading, handleSuggestRecipes }: ChandyekViewProps) {
  const [ingredients, setIngredients] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ingredients.trim()) {
      handleSuggestRecipes(ingredients.trim());
    }
  };

  return (
    <div className="space-y-8">
      <Card className="max-w-2xl mx-auto shadow-lg border-border/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center gap-2 mb-2">
            <Salad className="h-8 w-8 text-primary"/>
            <CardTitle className="text-3xl font-bold">Ch3andek?</CardTitle>
          </div>
          <CardDescription>
            Listez les ingrédients que vous avez sous la main, et notre assistant IA vous proposera des recettes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              placeholder="Ex: poulet, riz, carottes, oignon, crème..."
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              rows={4}
              className="text-base"
              disabled={isLoading}
            />
            <Button type="submit" className="w-full" size="lg" disabled={isLoading || !ingredients.trim()}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  <span>Analyse en cours...</span>
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  <span>Trouver des recettes</span>
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {suggestions && suggestions.suggestions.length > 0 && (
        <div className="max-w-2xl mx-auto space-y-4 animate-in fade-in-50">
          <h2 className="text-2xl font-bold text-center">Bismillah! Voici quelques idées :</h2>
          {suggestions.suggestions.map((recipe, index) => (
            <Card key={index} className="bg-card">
              <CardHeader>
                <CardTitle>{recipe.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{recipe.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
