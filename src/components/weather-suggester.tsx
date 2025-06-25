'use client';

import { useState } from 'react';
import {
  suggestMealByWeather,
  SuggestMealByWeatherOutput,
} from '@/ai/flows/suggest-meal-by-weather';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sun, Cloud, CloudRain, Lightbulb } from 'lucide-react';

const weatherIcons: Record<string, React.ElementType> = {
  sunny: Sun,
  cloudy: Cloud,
  rainy: CloudRain,
};

export function WeatherSuggester() {
  const [location, setLocation] = useState('Paris');
  const [suggestion, setSuggestion] = useState<SuggestMealByWeatherOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [suggestedLocation, setSuggestedLocation] = useState('Paris');


  const handleSuggest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim()) {
      toast({
        variant: 'destructive',
        title: 'Lieu manquant',
        description: 'Veuillez entrer une ville.',
      });
      return;
    }

    setIsLoading(true);
    setSuggestion(null);
    try {
      const result = await suggestMealByWeather({ location: location.trim() });
      setSuggestion(result);
      setSuggestedLocation(location.trim());
    } catch (error) {
      console.error('Failed to suggest meal:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur de suggestion',
        description:
          'Impossible de récupérer la suggestion météo. Veuillez réessayer.',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const WeatherIcon = suggestion ? weatherIcons[suggestion.weather.condition.toLowerCase()] || Cloud : null;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-accent"/>
            <CardTitle>Suggestion Météo du Jour</CardTitle>
        </div>
        <CardDescription>
            Recevez une idée de plat et boisson adaptée à la météo de votre ville.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSuggest} className="flex flex-col sm:flex-row gap-2 mb-4">
          <Input
            type="text"
            placeholder="Entrez votre ville..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="flex-grow"
            aria-label="Votre ville"
          />
          <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
            {isLoading ? (
              <Loader2 className="animate-spin" />
            ) : (
              'Obtenir la suggestion'
            )}
          </Button>
        </form>
        
        {suggestion && !isLoading && (
            <div className="mt-4 p-4 bg-accent/10 border border-accent/20 rounded-lg text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                    {WeatherIcon && <WeatherIcon className="h-6 w-6 text-accent" />}
                    <p className="font-semibold capitalize">
                        Aujourd'hui à {suggestedLocation}, il fait {suggestion.weather.temperature}°C ({suggestion.weather.frenchCondition}).
                    </p>
                </div>
                <p className="text-foreground">{suggestion.mealIdea}</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
