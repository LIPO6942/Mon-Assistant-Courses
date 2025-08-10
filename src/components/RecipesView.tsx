
'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Shuffle, Dices, Clock, Coins } from 'lucide-react';
import type { Recipe } from '@/lib/types';
import { streetFoodOptions } from '@/lib/data';
import { cn } from '@/lib/utils';

interface RecipesViewProps {
  setViewingRecipe: (recipe: (Omit<Recipe, 'id'> & { id?: string; }) | null) => void;
  discoverableRecipes: Recipe[];
  handleSaveRecipe: (recipe: Omit<Recipe, 'id'> & { id?: string; }) => void;
}

export default function RecipesView({
  setViewingRecipe,
  discoverableRecipes,
  handleSaveRecipe,
}: RecipesViewProps) {
  const [suggestedRecipes, setSuggestedRecipes] = useState<Recipe[]>([]);
  const [selectedStreetFood, setSelectedStreetFood] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [displayedFood, setDisplayedFood] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const [filterQuick, setFilterQuick] = useState(false);
  const [filterEconomical, setFilterEconomical] = useState(false);

  const filteredRecipes = useMemo(() => {
    return discoverableRecipes.filter(recipe => {
      const quickMatch = !filterQuick || (recipe.preparationTime <= 15);
      const economicalMatch = !filterEconomical || recipe.isEconomical;
      return quickMatch && economicalMatch;
    });
  }, [discoverableRecipes, filterQuick, filterEconomical]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const findRandomRecipes = () => {
    if (filteredRecipes.length === 0) {
        setSuggestedRecipes([]);
        return;
    }
    const shuffled = [...filteredRecipes].sort(() => 0.5 - Math.random());
    setSuggestedRecipes(shuffled.slice(0, 2));
  };

  const handleSpin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setSelectedStreetFood(null);

    const spinDuration = 2500;
    const spinInterval = 100;

    intervalRef.current = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * streetFoodOptions.length);
      setDisplayedFood(streetFoodOptions[randomIndex]);
    }, spinInterval);

    setTimeout(() => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      const finalChoice = streetFoodOptions[Math.floor(Math.random() * streetFoodOptions.length)];
      setSelectedStreetFood(finalChoice);
      setDisplayedFood(null);
      setIsSpinning(false);
    }, spinDuration);
  };

  return (
    <div className="space-y-8">
      <div className='text-center py-8 px-4 rounded-xl bg-gradient-to-br from-primary/10 via-card to-card border-2 border-primary/20 shadow-lg'>
        <h2 className='text-2xl font-bold mb-2'>À court d'idées ?</h2>
        <p className='text-muted-foreground mb-4'>Utilisez les filtres pour affiner les suggestions aléatoires !</p>
        
        <div className="flex justify-center gap-4 mb-6">
            <Button 
                size="sm"
                variant={filterQuick ? "secondary" : "outline"} 
                onClick={() => setFilterQuick(!filterQuick)}
                className={cn(filterQuick && 'ring-2 ring-primary')}
            >
                <Clock className="mr-2 h-4 w-4"/> Je suis pressé(e)
            </Button>
            <Button 
                size="sm"
                variant={filterEconomical ? "secondary" : "outline"}
                onClick={() => setFilterEconomical(!filterEconomical)}
                className={cn(filterEconomical && 'ring-2 ring-primary')}
            >
                <Coins className="mr-2 h-4 w-4"/> Économique
            </Button>
        </div>

        <Button size="lg" onClick={findRandomRecipes}>
          <Shuffle className="mr-2 h-5 w-5" />
          Trouver une idée de recette
        </Button>

        {suggestedRecipes.length > 0 ? (
          <div className='mt-8 max-w-4xl mx-auto text-left animate-in fade-in-50 grid grid-cols-1 md:grid-cols-2 gap-6'>
              {suggestedRecipes.map(recipe => (
                <Card key={recipe.id} className="overflow-hidden flex flex-col bg-card shadow-lg rounded-xl border border-border/50">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="pr-2">
                        <CardTitle>{recipe.title}</CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                           <Badge variant="secondary" className="w-fit">{recipe.country}</Badge>
                           <Badge variant="outline" className="flex items-center gap-1"><Clock className="h-3 w-3"/>{recipe.preparationTime} min</Badge>
                           {recipe.isEconomical && <Badge variant="outline" className="flex items-center gap-1"><Coins className="h-3 w-3"/>Éco</Badge>}
                        </div>
                      </div>
                      <Badge variant="outline" className="whitespace-nowrap">{recipe.calories} kcal</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground">{recipe.description}</p>
                  </CardContent>
                  <CardFooter className="flex justify-between mt-auto bg-secondary/30 pt-4 gap-2">
                    <Button onClick={() => setViewingRecipe(recipe)}>Voir la recette</Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => handleSaveRecipe(recipe)}
                    >
                      <PlusCircle className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
          </div>
        ) : (
            filteredRecipes.length === 0 && <p className="text-muted-foreground mt-4 text-sm">Aucune recette ne correspond à vos filtres. Essayez d'en retirer un.</p>
        )}
      </div>

      <div className='text-center py-8 px-4 rounded-xl bg-gradient-to-br from-accent/10 via-card to-card border-2 border-accent/20 shadow-lg'>
        <h2 className='text-2xl font-bold mb-2'>J’ai pas envie de cuisiner</h2>
        <p className='text-muted-foreground mb-6'>Pas le courage ? Laissez le hasard décider de votre prochain plat à emporter !</p>
        <Button size="lg" onClick={handleSpin} className="bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isSpinning}>
          <Dices className={`mr-2 h-5 w-5 ${isSpinning ? 'animate-spin' : ''}`} />
          {isSpinning ? 'Ça tourne...' : 'Lancer la roue de la flemme !'}
        </Button>
        
        <div className="mt-8 h-24 flex flex-col justify-center items-center">
            {isSpinning && (
              <p className="text-4xl font-bold text-primary transition-opacity duration-100 animate-in fade-in">
                {displayedFood}
              </p>
            )}
            {!isSpinning && selectedStreetFood && (
              <div className="animate-in fade-in-50 text-center">
                <p className="text-muted-foreground">Et le gagnant est...</p>
                <p className="text-4xl font-bold text-primary mt-2">{selectedStreetFood}</p>
                <p className="text-sm font-semibold text-accent/80 mt-4 animate-pulse">Alors, on se régale ?</p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
