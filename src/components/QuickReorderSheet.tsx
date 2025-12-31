
'use client';

import { SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { History, Plus } from 'lucide-react';
import type { PurchaseHistory, Ingredient } from '@/lib/types';

interface QuickReorderSheetProps {
    purchaseHistory: PurchaseHistory;
    pantry: Ingredient[];
    onAddToBasket: (ingredient: Ingredient, quantity: number) => void;
}

export default function QuickReorderSheet({ purchaseHistory, pantry, onAddToBasket }: QuickReorderSheetProps) {
    const historyItems = Object.entries(purchaseHistory)
        .map(([id, record]) => {
            const ingredient = pantry.find(ing => ing.id === id);
            return { id, record, ingredient };
        })
        .filter(item => item.ingredient)
        .sort((a, b) => new Date(a.record.date).getTime() - new Date(b.record.date).getTime());

    return (
        <SheetContent side="right" className="flex flex-col w-[90%] sm:max-w-md">
            <SheetHeader>
                <div className="flex items-center gap-2">
                    <History className="h-5 w-5 text-primary" />
                    <SheetTitle>Re-commande Rapide</SheetTitle>
                </div>
                <SheetDescription>
                    Retrouvez vos articles récemment achetés et rajoutez-les au panier en un clic.
                </SheetDescription>
            </SheetHeader>

            <ScrollArea className="flex-grow my-4 pr-4">
                {historyItems.length > 0 ? (
                    <ul className="space-y-4">
                        {historyItems.map(({ id, record, ingredient }) => (
                            <li key={id} className="bg-secondary/30 p-4 rounded-xl border border-border/50 transition-all hover:bg-secondary/50">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex-grow">
                                        <h4 className="font-semibold text-foreground leading-tight mb-1">{ingredient!.name}</h4>
                                        <div className="flex flex-col gap-0.5">
                                            <p className="text-sm text-primary font-medium">
                                                Acheté le : {new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(record.date))}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Quantité : {record.quantity} {record.unit}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        size="icon"
                                        className="h-10 w-10 rounded-full shadow-md shrink-0"
                                        onClick={() => onAddToBasket(ingredient!, record.quantity)}
                                        title="Rajouter au panier"
                                    >
                                        <Plus className="h-5 w-5" />
                                    </Button>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="flex flex-col items-center justify-center h-40 text-center space-y-2">
                        <History className="h-10 w-10 text-muted-foreground/30" />
                        <p className="text-sm text-muted-foreground">Aucun achat récent trouvé.</p>
                    </div>
                )}
            </ScrollArea>
        </SheetContent>
    );
}
