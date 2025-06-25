'use client';

import { useState, useEffect } from 'react';
import {
  suggestMealByWeather,
  SuggestMealByWeatherOutput,
} from '@/ai/flows/suggest-meal-by-weather';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Sun, Cloud, CloudRain, UtensilsCrossed } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

const weatherIcons: Record<string, React.ElementType> = {
  sunny: Sun,
  cloudy: Cloud,
  rainy: CloudRain,
};

const DEFAULT_LOCATION = 'Tunis';

export function WeatherSuggester() {
  const [suggestion, setSuggestion] = useState<SuggestMealByWeatherOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSuggestion = async () => {
      setIsLoading(true);
      try {
        const result = await suggestMealByWeather({ location: DEFAULT_LOCATION });
        setSuggestion(result);
      } catch (error) {
        console.error('Failed to suggest meal:', error);
        toast({
          variant: 'destructive',
          title: 'Erreur de suggestion',
          description:
            'Impossible de récupérer la suggestion météo du jour.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestion();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast]);
  
  const WeatherIcon = suggestion ? weatherIcons[suggestion.weather.condition.toLowerCase()] || Cloud : null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
            <UtensilsCrossed className="h-6 w-6 text-primary"/>
            <CardTitle>Suggestion du Jour</CardTitle>
        </div>
        <CardDescription>
            Idée de repas basée sur la météo à {DEFAULT_LOCATION}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
            <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </div>
        ) : suggestion ? (
            <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg text-center">
                <div className="flex items-center justify-center gap-2 mb-2 font-semibold">
                    {WeatherIcon && <WeatherIcon className="h-5 w-5 text-accent" />}
                    <span>
                        {suggestion.weather.temperature}°C, {suggestion.weather.frenchCondition}
                    </span>
                </div>
                <p className="text-foreground">{suggestion.mealIdea}</p>
            </div>
        ) : (
            <p className="text-muted-foreground text-sm text-center">
                Impossible de charger la suggestion du jour.
            </p>
        )}
      </CardContent>
    </Card>
  );
}
