
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Dices, Loader2, Wallet, Truck, Store } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { cn } from "@/lib/utils";

type LazyFoodWheelProps = {
  isQuizAnsweredCorrectly: boolean;
};

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
const locationOptions = ["avec livraison", "sur place"];

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


export function LazyFoodWheel({ isQuizAnsweredCorrectly }: LazyFoodWheelProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [spinningText, setSpinningText] = useState<string>("");
  const [payer, setPayer] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");
  const [locationType, setLocationType] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSpinning) {
      const currentFoodOptions = isQuizAnsweredCorrectly
        ? [...foodOptions, "Demande ce que tu veux"]
        : foodOptions;

      interval = setInterval(() => {
        setSpinningText(currentFoodOptions[Math.floor(Math.random() * currentFoodOptions.length)]);
      }, 100);

      setTimeout(() => {
        clearInterval(interval);
        setIsSpinning(false);
        const finalResult = currentFoodOptions[Math.floor(Math.random() * currentFoodOptions.length)];
        setResult(finalResult);
        
        const payingPerson = payers[Math.floor(Math.random() * payers.length)];
        const otherPerson = payers.find(p => p !== payingPerson)!;
        
        if (finalResult === "Demande ce que tu veux") {
          setPayer(otherPerson); // The other person pays
          setMessage(`Quiz réussi ! Demande ce que tu veux, c'est ${otherPerson} qui régale !`);
          setLocationType(null);
        } else {
          setPayer(payingPerson);
          setMessage(generateFunnyMessage(payingPerson, otherPerson));
          const finalLocationType = locationOptions[Math.floor(Math.random() * locationOptions.length)];
          setLocationType(finalLocationType);
        }

      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isSpinning, isQuizAnsweredCorrectly]);

  const handleSpin = () => {
    setResult(null);
    setPayer(null);
    setMessage("");
    setLocationType(null);
    setIsSpinning(true);
  };
  
  const content = (
    <div className="text-center min-h-[8rem] flex flex-col justify-center">
        {isSpinning ? (
          <div className="flex items-center justify-center gap-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-xl font-bold transition-all duration-100">
              {spinningText}
            </p>
          </div>
        ) : result ? (
          <div className="flex flex-col items-center gap-2 animate-in fade-in zoom-in-50">
            <p className="text-2xl font-bold text-primary">{result} !</p>
            {locationType && (
                <div className="flex items-center gap-2 text-md font-semibold text-muted-foreground capitalize">
                    {locationType === 'avec livraison' ? <Truck className="h-5 w-5 text-primary" /> : <Store className="h-5 w-5 text-primary" />}
                    <span>{locationType}</span>
                </div>
            )}
            {payer && (
                <div className="mt-2 text-center p-2 bg-primary/10 rounded-lg w-full">
                    <div className="flex items-center justify-center gap-2 text-sm">
                        <Wallet className="h-4 w-4" />
                        <p className="font-semibold">{message}</p>
                    </div>
                </div>
            )}
          </div>
        ) : isQuizAnsweredCorrectly ? (
            <div className="flex items-center justify-center">
              <p className="text-sm text-primary font-semibold animate-in fade-in">
                Bravo pour le quiz ! Une surprise vous attend peut-être...
              </p>
            </div>
        ) : (
          <div className="flex items-center justify-center">
            <p className="text-muted-foreground text-sm">Cliquez sur "Lancer" pour trouver quoi manger !</p>
          </div>
        )}
      </div>
  );

  return (
    <>
       {/* Mobile collapsible version */}
       <div className="lg:hidden">
        <Accordion type="single" collapsible defaultValue="flemme" className="w-full">
          <AccordionItem value="flemme" className="border rounded-lg bg-card text-card-foreground shadow-sm">
            <AccordionTrigger className="p-4 hover:no-underline [&[data-state=open]]:pb-2">
               <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-3">
                  <Dices className="h-6 w-6 text-primary flex-shrink-0" />
                  <div className="text-left">
                    <h3 className="text-base font-semibold leading-none tracking-tight">J’ai la flemme...</h3>
                    <p className="text-xs text-muted-foreground mt-1">Pas envie de cuisiner ?</p>
                  </div>
                </div>
                <div
                  role="button"
                  aria-disabled={isSpinning}
                  onClick={(e) => {
                    if (isSpinning) return;
                    e.stopPropagation();
                    handleSpin();
                  }}
                  className={cn(
                    buttonVariants({ size: "sm" }),
                    "shrink-0",
                    "inline-flex items-center justify-center gap-2",
                    isSpinning && "pointer-events-none opacity-50"
                  )}
                >
                  <Dices className="h-4 w-4" />
                  {isSpinning ? "..." : "Lancer"}
                </div>
               </div>
            </AccordionTrigger>
            <AccordionContent className="p-4 pt-0">
              {content}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Desktop static version */}
      <Card className="hidden lg:block">
        <CardHeader className="flex flex-row items-center justify-between p-4 md:p-6 space-y-0">
          <div className="flex items-center gap-3">
            <Dices className="h-6 w-6 text-primary flex-shrink-0" />
            <div>
              <CardTitle className="text-lg md:text-xl">J’ai la flemme...</CardTitle>
              <CardDescription className="text-xs md:text-sm">Pas envie de cuisiner ?</CardDescription>
            </div>
          </div>
          <Button onClick={handleSpin} disabled={isSpinning} size="sm" className="shrink-0">
            <Dices className="mr-2 h-4 w-4" />
            {isSpinning ? "..." : "Lancer"}
          </Button>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          {content}
        </CardContent>
      </Card>
    </>
  );
}
