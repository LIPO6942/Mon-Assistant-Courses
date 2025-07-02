
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Shuffle, Dices } from 'lucide-react';
import type { Recipe } from '@/lib/types';
import { streetFoodOptions } from '@/lib/data';

interface RecipesViewProps {
  setViewingRecipe: (recipe: (Omit<Recipe, 'id'> & { id?: string }) | null) => void;
  discoverableRecipes: Recipe[];
  handleSaveRecipe: (recipe: Omit<Recipe, 'id'> & { id?: string }) => void;
}

export default function RecipesView({
  setViewingRecipe,
  discoverableRecipes,
  handleSaveRecipe,
}: RecipesViewProps) {
  const [suggestedRecipe, setSuggestedRecipe] = useState<Recipe | null>(null);
  const [selectedStreetFood, setSelectedStreetFood] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [displayedFood, setDisplayedFood] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup interval on component unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const findRandomRecipe = () => {
    const randomIndex = Math.floor(Math.random() * discoverableRecipes.length);
    setSuggestedRecipe(discoverableRecipes[randomIndex]);
  };

  const handleSpin = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    setSelectedStreetFood(null);

    const spinDuration = 2500; // 2.5 seconds
    const spinInterval = 100; // update every 100ms

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
        <p className='text-muted-foreground mb-6'>Cliquez sur le bouton pour obtenir une suggestion de recette au hasard !</p>
        <Button size="lg" onClick={findRandomRecipe}>
          <Shuffle className="mr-2 h-5 w-5" />
          Trouver une idée de recette
        </Button>

        {suggestedRecipe && (
          <div className='mt-8 max-w-md mx-auto text-left animate-in fade-in-50'>
              <Card key={suggestedRecipe.id} className="overflow-hidden flex flex-col bg-card shadow-lg rounded-xl border border-border/50">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="pr-2">
                      <CardTitle>{suggestedRecipe.title}</CardTitle>
                      <Badge variant="secondary" className="mt-2 w-fit">{suggestedRecipe.country}</Badge>
                    </div>
                    <Badge variant="outline" className="whitespace-nowrap">{suggestedRecipe.calories} kcal</Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground">{suggestedRecipe.description}</p>
                </CardContent>
                <CardFooter className="flex justify-between mt-auto bg-secondary/30 pt-4">
                  <Button onClick={() => setViewingRecipe(suggestedRecipe)}>Voir la recette</Button>
                  <Button 
                    variant="outline" 
                    onClick={() => handleSaveRecipe(suggestedRecipe)}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Sauvegarder
                  </Button>
                </CardFooter>
              </Card>
          </div>
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
                <p className="text-sm font-semibold text-accent-foreground/80 mt-4 animate-pulse">Alors, on se régale ?</p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
