'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Minus, Plus, Users, Maximize2, Minimize2, CheckCircle2, ListFilter } from 'lucide-react';
import { cn, getProductStatus } from '@/lib/utils';
import type { RecipeIngredient, Ingredient, PurchaseHistory } from '@/lib/types';

interface RecipeContentProps {
    ingredients: RecipeIngredient[];
    preparation: string;
    basePortions: number;
    initialPortions: number;
    pantry: Ingredient[];
    purchaseHistory: PurchaseHistory;
}

export default function RecipeContent({
    ingredients,
    preparation,
    basePortions,
    initialPortions,
    pantry,
    purchaseHistory,
}: RecipeContentProps) {
    const [portions, setPortions] = React.useState(initialPortions);
    const [isFocusMode, setIsFocusMode] = React.useState(false);
    const [checkedSteps, setCheckedSteps] = React.useState<Set<number>>(new Set());

    const preparationSteps = React.useMemo(() =>
        preparation.split('\n').filter(line => line.trim() !== ''),
        [preparation]
    );

    const calculateAdjustedQuantity = (baseQuantity: number, basePortions: number, newPortions: number) => {
        if (!basePortions) return baseQuantity;
        const adjusted = (baseQuantity / basePortions) * newPortions;
        return parseFloat(adjusted.toFixed(3));
    };

    const handleToggleStep = (index: number) => {
        setCheckedSteps(prev => {
            const next = new Set(prev);
            if (next.has(index)) next.delete(index);
            else next.add(index);
            return next;
        });
    };

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Portions Control - Compact & Integrated */}
            <div className="px-4 py-2 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <Users className="h-3.5 w-3.5 text-primary" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Portions</span>
                </div>
                <div className="flex items-center gap-1 bg-white dark:bg-zinc-950 rounded-full border border-zinc-200 dark:border-zinc-800 p-0.5 shadow-sm">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-full"
                        onClick={() => setPortions(p => Math.max(1, p - 1))}
                    >
                        <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-6 text-center text-xs font-black">{portions}</span>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-full"
                        onClick={() => setPortions(p => p + 1)}
                    >
                        <Plus className="h-3 w-3" />
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-hidden relative">
                <ScrollArea className="h-full">
                    <div className="p-4 space-y-6">
                        {/* Ingredients Section */}
                        <section
                            className={cn(
                                "transition-all duration-500 ease-in-out origin-top",
                                isFocusMode ? "opacity-30 scale-[0.98] blur-[1px] pointer-events-none max-h-20 overflow-hidden" : "opacity-100"
                            )}
                        >
                            <div className="flex items-center gap-2 mb-3">
                                <ListFilter className="h-4 w-4 text-primary" />
                                <h3 className="text-xs font-black uppercase tracking-widest">Ingrédients</h3>
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                                {ingredients.map((ing, i) => {
                                    const pantryItem = pantry.find(p => p.name.toLowerCase() === ing.name.toLowerCase());
                                    let statusColor = 'bg-zinc-200 dark:bg-zinc-800';

                                    if (pantryItem) {
                                        const status = getProductStatus(purchaseHistory[pantryItem.id]);
                                        statusColor = status === 'green' ? 'bg-green-500' : 'bg-amber-500';
                                    } else {
                                        statusColor = 'bg-red-500';
                                    }

                                    return (
                                        <div key={i} className="flex items-center justify-between p-2 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-100 dark:border-zinc-800/50">
                                            <div className="flex items-center gap-2">
                                                <div className={cn("w-1.5 h-1.5 rounded-full", statusColor)} />
                                                <span className="text-sm font-medium">{ing.name}</span>
                                            </div>
                                            <span className="text-[10px] font-bold bg-white dark:bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-100 dark:border-zinc-800 shadow-xs">
                                                {calculateAdjustedQuantity(ing.quantity, basePortions, portions)} {ing.unit}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>

                        {/* Preparation Section */}
                        <section
                            className={cn(
                                "transition-all duration-500 ease-in-out",
                                isFocusMode ? "translate-y-[-40px]" : ""
                            )}
                        >
                            <div className="flex items-center justify-between mb-3 bg-white dark:bg-zinc-950 sticky top-0 z-10 py-1">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-primary" />
                                    <h3 className="text-xs font-black uppercase tracking-widest">Préparation</h3>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={cn(
                                        "h-7 px-2 text-[10px] font-black uppercase tracking-tighter rounded-full gap-1 transition-colors",
                                        isFocusMode ? "bg-primary text-white hover:bg-primary/90" : "bg-secondary hover:bg-secondary/80"
                                    )}
                                    onClick={() => setIsFocusMode(!isFocusMode)}
                                >
                                    {isFocusMode ? (
                                        <>
                                            <Minimize2 className="h-3 w-3" />
                                            Normal
                                        </>
                                    ) : (
                                        <>
                                            <Maximize2 className="h-3 w-3" />
                                            Mode Focus
                                        </>
                                    )}
                                </Button>
                            </div>

                            <div className="space-y-3">
                                {preparationSteps.map((step, index) => (
                                    <div
                                        key={index}
                                        className={cn(
                                            "flex items-start gap-3 p-3 rounded-xl border transition-all duration-300",
                                            checkedSteps.has(index)
                                                ? "bg-zinc-50 dark:bg-zinc-900/20 border-transparent opacity-40 scale-[0.99]"
                                                : "bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 shadow-sm"
                                        )}
                                    >
                                        <Checkbox
                                            id={`step-${index}`}
                                            checked={checkedSteps.has(index)}
                                            onCheckedChange={() => handleToggleStep(index)}
                                            className="mt-1 h-4 w-4 rounded-full border-2"
                                        />
                                        <label
                                            htmlFor={`step-${index}`}
                                            className={cn(
                                                "flex-1 text-sm leading-relaxed cursor-pointer font-medium",
                                                checkedSteps.has(index) ? "line-through text-muted-foreground" : "text-foreground"
                                            )}
                                        >
                                            {step}
                                        </label>
                                    </div>
                                ))}
                                {preparationSteps.length === 0 && (
                                    <div className="text-center py-8 text-xs text-muted-foreground italic">
                                        Aucune étape de préparation renseignée.
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
}
