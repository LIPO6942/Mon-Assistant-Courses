
'use client';

import * as React from 'react';
import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getNutritionalAdvice } from '@/ai/flows/nutritional-guide-flow';
import type { NutritionalGuideOutput } from '@/ai/types';
import type { HealthConditionCategory } from '@/lib/types';
import { HeartPulse, Lightbulb, Loader2, Terminal, Settings } from 'lucide-react';
import ReactMarkdown from 'react-markdown';


interface NutritionalGuideViewProps {
  healthConditions: HealthConditionCategory[];
  openHealthConditionManager: () => void;
}

export default function NutritionalGuideView({ healthConditions, openHealthConditionManager }: NutritionalGuideViewProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedCondition, setSelectedCondition] = useState<string>('');
  const [query, setQuery] = useState<string>('');
  const [advice, setAdvice] = useState<NutritionalGuideOutput | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const selectedCategory = useMemo(() => {
    return healthConditions.find(c => c.id === selectedCategoryId);
  }, [selectedCategoryId, healthConditions]);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setSelectedCondition('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCondition || !query) {
      setError("Veuillez sélectionner une condition et décrire votre repas.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setAdvice(null);

    try {
      const result = await getNutritionalAdvice({ condition: selectedCondition, query });
      setAdvice(result);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Une erreur inattendue est survenue.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <Card className="shadow-lg border-border/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        <CardHeader className="text-center">
            <div className="flex justify-center items-center gap-3 mb-2">
                <HeartPulse className="h-10 w-10 text-primary"/>
                <CardTitle className="text-3xl font-bold">Votre Guide Alimentaire Personnalisé</CardTitle>
            </div>
            <CardDescription className="text-base">
                Recevez des conseils nutritionnels adaptés à votre santé et à vos envies.
            </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <div className='flex justify-between items-center'>
                  <Label htmlFor="condition-category-select" className='text-lg'>1. Catégorie</Label>
                  <Button type="button" variant="outline" size="sm" onClick={openHealthConditionManager}>
                    <Settings className="h-4 w-4 mr-2" /> Gérer
                  </Button>
                </div>
                <Select value={selectedCategoryId} onValueChange={handleCategoryChange}>
                  <SelectTrigger id="condition-category-select" className="w-full h-11">
                    <SelectValue placeholder="Choisir une catégorie..." />
                  </SelectTrigger>
                  <SelectContent>
                    {healthConditions.map((group) => (
                      <SelectItem key={group.id} value={group.id}>{group.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="condition-select" className='text-lg'>2. Condition</Label>
                <Select value={selectedCondition} onValueChange={setSelectedCondition} disabled={!selectedCategory}>
                  <SelectTrigger id="condition-select" className="w-full h-11">
                    <SelectValue placeholder="Choisir une condition..." />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedCategory?.conditions.map(condition => (
                      <SelectItem key={condition.id} value={condition.name}>{condition.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="meal-query" className='text-lg'>3. Décrivez votre repas ou ingrédient</Label>
              <Textarea
                id="meal-query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ex: 'un plat de pâtes', 'du saumon', 'une salade pour le déjeuner'..."
                rows={3}
              />
            </div>

            <div className='text-center'>
              <Button type="submit" size="lg" disabled={isLoading || !selectedCondition || !query}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Analyse en cours...
                  </>
                ) : (
                   <>
                    <Lightbulb className="mr-2 h-5 w-5" />
                    Obtenir un conseil
                   </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {advice && (
        <Card className="animate-in fade-in-50">
            <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                    <Lightbulb className='text-primary'/>
                    Mes Recommandations pour vous
                </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm md:prose-base max-w-none prose-headings:text-primary prose-strong:text-foreground">
                <ReactMarkdown>{advice.advice}</ReactMarkdown>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
