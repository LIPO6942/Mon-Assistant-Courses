
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dices, Loader2, Gift, Wallet } from "lucide-react";

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

const payers = ["Moslem", "Ran"];

const generateFunnyMessage = (winner: string, loser: string) => {
    const messages = [
        `Aujourd'hui, c'est ${winner} qui régale ! ${loser}, tu as une dette morale.`,
        `La roue a parlé... ${winner}, sors la carte bleue ! ${loser}, la prochaine est pour toi.`,
        `Le sort en est jeté : ${winner} paie ! ${loser}, n'oublie pas de dire merci.`,
        `Félicitations ${winner} ! Tu as gagné le droit de payer. ${loser}, savoure ta victoire.`,
        `C'est officiel, ${winner} est le sponsor du jour. ${loser}, profite du festin.`,
    ];
    return messages[Math.floor(Math.random() * messages.length)];
};


export function LazyFoodWheel() {
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [spinningText, setSpinningText] = useState<string>("");
  const [payer, setPayer] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");

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
        
        const payingPerson = payers[Math.floor(Math.random() * payers.length)];
        const otherPerson = payers.find(p => p !== payingPerson)!;
        setPayer(payingPerson);
        setMessage(generateFunnyMessage(payingPerson, otherPerson));

      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isSpinning]);

  const handleSpin = () => {
    setResult(null);
    setPayer(null);
    setMessage("");
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
            <p className="text-sm text-muted-foreground">Et le plat choisi est...</p>
            <p className="text-3xl font-bold text-primary">{result} !</p>

            {payer && (
                <div className="mt-4 text-center p-3 bg-primary/10 rounded-lg w-full">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <Wallet className="h-5 w-5" />
                        <p className="font-semibold">{message}</p>
                    </div>
                </div>
            )}
          </div>
        ) : (
          <p className="text-muted-foreground">Cliquez sur le bouton pour laisser le destin choisir !</p>
        )}
        
        <Button onClick={handleSpin} disabled={isSpinning} className="mt-4">
          <Dices className="mr-2 h-4 w-4" />
          {isSpinning ? "Ça tourne..." : "Qui va payer ?"}
        </Button>
      </CardContent>
    </Card>
  );
}
