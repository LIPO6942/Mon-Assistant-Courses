
'use client';

import { SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { History, Plus, Trash2 } from 'lucide-react';
import type { PurchaseHistory, Ingredient } from '@/lib/types';
import { cn, getProductStatus } from '@/lib/utils';
import { useState } from 'react';

interface QuickReorderSheetProps {
    purchaseHistory: PurchaseHistory;
    pantry: Ingredient[];
    onAddToBasket: (ingredient: Ingredient, quantity: number) => void;
    onDeleteFromHistory: (id: string) => void;
}

export default function QuickReorderSheet({ purchaseHistory, pantry, onAddToBasket, onDeleteFromHistory }: QuickReorderSheetProps) {
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const items = Object.entries(purchaseHistory)
        .filter(([id]) => pantry.some(ing => ing.id === id))
        .map(([id, records]) => ({
            id,
            record: records[records.length - 1], // Most recent record for display
            latestDate: new Date(records[records.length - 1].date).getTime(),
            ingredient: pantry.find(ing => ing.id === id)
        }))
        .sort((a, b) => b.latestDate - a.latestDate); // Sort by most recent first for re-order

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
                {items.length > 0 ? (
                    <ul className="space-y-4">
                        {items.map(({ id, record, ingredient }) => {
                            const isSelected = selectedId === id;

                            return (
                                <li
                                    key={id}
                                    className={cn(
                                        "bg-secondary/30 p-4 rounded-xl border border-border/50 transition-all cursor-pointer relative overflow-hidden",
                                        isSelected ? "ring-2 ring-primary bg-secondary/60" : "hover:bg-secondary/50"
                                    )}
                                    onClick={() => setSelectedId(isSelected ? null : id)}
                                >
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex-grow">
                                            <h4 className="font-semibold text-foreground leading-tight mb-1 flex items-center gap-2">
                                                {ingredient!.name}
                                                {(() => {
                                                    const status = getProductStatus(purchaseHistory[id]);
                                                    if (!status) return null;
                                                    return (
                                                        <span
                                                            className={cn(
                                                                "h-2 w-2 rounded-full",
                                                                status === 'green' && "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]",
                                                                status === 'orange' && "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]",
                                                                status === 'red' && "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"
                                                            )}
                                                        />
                                                    );
                                                })()}
                                            </h4>
                                            <div className="flex flex-col gap-0.5">
                                                <p className="text-sm text-primary font-medium">
                                                    Acheté le : {new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(record.date))}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Quantité : {record.quantity} {record.unit}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                                            {isSelected && (
                                                <Button
                                                    variant="destructive"
                                                    size="icon"
                                                    className="h-10 w-10 rounded-full shadow-md animate-in slide-in-from-right-2 duration-200"
                                                    onClick={() => {
                                                        if (window.confirm(`Supprimer l'historique de "${ingredient!.name}" ?`)) {
                                                            onDeleteFromHistory(id);
                                                            setSelectedId(null);
                                                        }
                                                    }}
                                                    title="Supprimer de l'historique"
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </Button>
                                            )}
                                            <Button
                                                size="icon"
                                                className="h-10 w-10 rounded-full shadow-md"
                                                onClick={() => onAddToBasket(ingredient!, record.quantity)}
                                                title="Rajouter au panier"
                                            >
                                                <Plus className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
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
