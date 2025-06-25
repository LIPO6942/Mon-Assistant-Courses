
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dices, Loader2, Gift } from "lucide-react";
import { cn } from "@/lib/utils";

const foodOptions = [
  "Quesadilla",
  "Burrito",
  "Fricassé",
  "Tacos Mexicain",
  "Tacos",
  "Maqloub",
  "Pizza",
  "Chapati",
  "Baguette farcie",
  "Lablebi royal",
  "Poulet prêt à porter",
];

export function LazyFoodWheel() {
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [spinningText, setSpinningText] = useState<string>("");

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSpinning) {
      interval = setInterval(() => {
        setSpinningText(foodOptions[Math.floor(Math.random() * foodOptions.length)]);
      }, 100);

      setTimeout(() => {
        clearInterval(interval);
        setIsSpinning(false);
        const finalResult = foodOptions[Math.floor(Math.random() * foodOptions.length)];
        setResult(finalResult);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isSpinning]);

  const handleSpin = () => {
    setResult(null);
    setIsSpinning(true);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Dices className="h-6 w-6 text-primary" />
          <CardTitle>J’ai la flemme...</CardTitle>
        </div>
        <CardDescription>
          Pas envie de cuisiner ? Laissez le hasard décider pour vous.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center gap-4 text-center min-h-[10rem]">
        {isSpinning ? (
          <>
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-2xl font-bold transition-all duration-100">
              {spinningText}
            </p>
          </>
        ) : result ? (
          <div className="flex flex-col items-center gap-2 animate-in fade-in zoom-in-50">
            <Gift className="h-8 w-8 text-accent" />
            <p className="text-sm text-muted-foreground">Et le gagnant est...</p>
            <p className="text-3xl font-bold text-primary">{result} !</p>
          </div>
        ) : (
          <p className="text-muted-foreground">Cliquez sur le bouton pour lancer la roue de la flemme !</p>
        )}
        
        <Button onClick={handleSpin} disabled={isSpinning} className="mt-4">
          <Dices className="mr-2 h-4 w-4" />
          {isSpinning ? "Ça tourne..." : "Faire tourner la roue"}
        </Button>
      </CardContent>
    </Card>
  );
}
