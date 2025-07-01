'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Loader2, Salad } from 'lucide-react';

interface ChandyekViewProps {
  isLoading: boolean;
  handleSuggestRecipes: () => void;
  ingredients: string;
  setIngredients: (value: string) => void;
}

export default function ChandyekView({ isLoading, handleSuggestRecipes, ingredients, setIngredients }: ChandyekViewProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ingredients.trim()) {
      handleSuggestRecipes();
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
            Listez les ingrédients ou ajoutez-les depuis votre garde-manger. L'IA vous proposera des recettes !
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
    </div>
  );
}
