
'use client';

import { useState, useEffect } from 'react';
import {
  suggestMealByWeather,
  SuggestMealByWeatherOutput,
} from '@/ai/flows/suggest-meal-by-weather';
import {
  generateFoodQuiz,
  GenerateFoodQuizOutput,
} from '@/ai/flows/generate-food-quiz';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Sun, Cloud, CloudRain, UtensilsCrossed, BrainCircuit, CheckCircle, XCircle } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { Separator } from './ui/separator';

const weatherIcons: Record<string, React.ElementType> = {
  sunny: Sun,
  cloudy: Cloud,
  rainy: CloudRain,
};

const DEFAULT_LOCATION = 'Tunis';

export function WeatherSuggester() {
  const [mealSuggestion, setMealSuggestion] = useState<SuggestMealByWeatherOutput | null>(null);
  const [quiz, setQuiz] = useState<GenerateFoodQuizOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSuggestions = async () => {
      setIsLoading(true);
      // Reset quiz state for re-fetches if any
      setQuiz(null);
      setIsAnswered(false);
      setSelectedAnswer(null);

      try {
        const [mealResult, quizResult] = await Promise.all([
          suggestMealByWeather({ location: DEFAULT_LOCATION }),
          generateFoodQuiz(),
        ]);
        setMealSuggestion(mealResult);
        setQuiz(quizResult);
      } catch (error) {
        // Only show toast if it's not an offline error
        if ((error as any)?.code !== 'unavailable') {
          console.error('Failed to fetch daily suggestions:', error);
          toast({
            variant: 'destructive',
            title: 'Erreur de suggestion',
            description:
              'Impossible de récupérer les suggestions du jour.',
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const WeatherIcon = mealSuggestion ? weatherIcons[mealSuggestion.weather.condition.toLowerCase()] || Cloud : null;

  const handleAnswer = (index: number) => {
    if (isAnswered) return;
    setSelectedAnswer(index);
    setIsAnswered(true);
  };

  const renderQuiz = () => {
    if (!quiz) return null;

    return (
      <div className="space-y-4 pt-4">
        <div className="flex items-center gap-3">
          <BrainCircuit className="h-6 w-6 text-primary" />
          <h4 className="font-semibold text-lg">Le Quiz du Jour</h4>
        </div>
        <p className="font-medium text-foreground">{quiz.question}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {quiz.options.map((option, index) => {
            const isCorrect = index === quiz.correctAnswerIndex;
            const isSelected = index === selectedAnswer;

            return (
              <Button
                key={index}
                variant="outline"
                className={cn(
                  "h-auto py-2 justify-start text-left whitespace-normal transition-colors duration-300 relative",
                  {
                    "bg-destructive/20 border-destructive text-destructive hover:bg-destructive/20 disabled:opacity-100": isAnswered && isSelected && !isCorrect,
                    "bg-primary/20 border-primary text-primary hover:bg-primary/20 disabled:opacity-100": isAnswered && isCorrect,
                  }
                )}
                onClick={() => handleAnswer(index)}
                disabled={isAnswered}
              >
                <span className="mr-2 font-bold">{String.fromCharCode(65 + index)}.</span>
                <span className="flex-1">{option}</span>
                {isAnswered && isCorrect && <CheckCircle className="ml-auto h-5 w-5 text-primary" />}
                {isAnswered && isSelected && !isCorrect && <XCircle className="ml-auto h-5 w-5 text-destructive" />}
              </Button>
            );
          })}
        </div>
        {isAnswered && (
          <div className="p-3 bg-primary/10 rounded-lg animate-in fade-in">
            <p className="font-semibold text-sm text-primary">
              {selectedAnswer === quiz.correctAnswerIndex
                ? 'Absolument !'
                : `Pas tout à fait... La bonne réponse était "${quiz.options[quiz.correctAnswerIndex]}".`}
            </p>
            <p className="text-sm text-muted-foreground italic mt-1">{quiz.funFact}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <UtensilsCrossed className="h-6 w-6 text-primary" />
          <CardTitle>Suggestions du Jour</CardTitle>
        </div>
        <CardDescription>Idées, météo et un petit quiz pour égayer votre journée.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Separator className="my-6"/>
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-6 w-3/4" />
            <div className="grid grid-cols-2 gap-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        ) : (
          <>
            {mealSuggestion ? (
              <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg text-center">
                <div className="flex items-center justify-center gap-2 mb-2 font-semibold">
                  {WeatherIcon && <WeatherIcon className="h-5 w-5 text-accent" />}
                  <span>
                    Météo à {DEFAULT_LOCATION}: {mealSuggestion.weather.temperature}°C, {mealSuggestion.weather.frenchCondition}
                  </span>
                </div>
                <p className="text-foreground">{mealSuggestion.mealIdea}</p>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm text-center">
                Impossible de charger la suggestion de repas du jour.
              </p>
            )}

            <Separator className="my-6"/>

            {quiz ? renderQuiz() : (
               <p className="text-muted-foreground text-sm text-center">
                Impossible de charger le quiz du jour.
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
