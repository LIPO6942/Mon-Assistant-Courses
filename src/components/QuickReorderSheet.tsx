
'use client';

import { SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { History, Plus, Trash2 } from 'lucide-react';
import type { PurchaseHistory, Ingredient } from '@/lib/types';
import { cn, getProductStatus } from '@/lib/utils';
import { useState } from 'react';
import { StoreIcon } from '@/components/StoreIcon';

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
            records,
            latestDate: new Date(records[records.length - 1].date).getTime(),
            ingredient: pantry.find(ing => ing.id === id)
        }))
        .sort((a, b) => b.latestDate - a.latestDate); // Sort by most recent first for re-order

    return (
        <SheetContent side="right" className="flex flex-col w-[95%] sm:max-w-md px-4 sm:px-6">
            <SheetHeader className="pr-8 sm:pr-0">
                <div className="flex items-center gap-2">
                    <History className="h-5 w-5 text-primary" />
                    <SheetTitle>Re-commande Rapide</SheetTitle>
                </div>
                <SheetDescription className="text-xs sm:text-sm">
                    Retrouvez vos articles récemment achetés et rajoutez-les au panier en un clic.
                </SheetDescription>
            </SheetHeader>

            <ScrollArea className="flex-grow my-4 -mr-2 pr-2">
                {items.length > 0 ? (
                    <ul className="space-y-4">
                        {items.map(({ id, records, ingredient }) => {
                            const isSelected = selectedId === id;
                            // Sort records date descending for the history view
                            const sortedRecords = [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                            const latestRecord = sortedRecords[0];

                            return (
                                <li
                                    key={id}
                                    className={cn(
                                        "bg-secondary/30 p-4 rounded-3xl border border-border/50 transition-all cursor-pointer relative overflow-hidden",
                                        isSelected ? "ring-2 ring-primary bg-secondary/60" : "hover:bg-secondary/50"
                                    )}
                                    onClick={() => setSelectedId(isSelected ? null : id)}
                                >
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex-grow min-w-0">
                                            <h4 className="font-bold text-foreground leading-tight mb-2 flex items-center gap-2 text-lg">
                                                <span className="truncate">{ingredient!.name}</span>
                                                {(() => {
                                                    const status = getProductStatus(purchaseHistory[id]);
                                                    if (!status) return null;
                                                    return (
                                                        <span
                                                            className={cn(
                                                                "h-2.5 w-2.5 rounded-full shrink-0",
                                                                status === 'green' && "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]",
                                                                status === 'orange' && "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]",
                                                                status === 'red' && "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"
                                                            )}
                                                        />
                                                    );
                                                })()}
                                            </h4>
                                            {!isSelected ? (
                                                <div className="flex flex-col gap-1">
                                                    <p className="text-sm text-primary font-semibold flex items-center gap-1.5">
                                                        <History className="h-3.5 w-3.5 opacity-70" />
                                                        Dernier achat: {new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' }).format(new Date(latestRecord.date))}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground font-medium">
                                                        {latestRecord.quantity} {latestRecord.unit} • {((latestRecord.price || 0) * (latestRecord.quantity || 1)).toFixed(3)} DT
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="space-y-3 mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-1">Historique des achats</div>
                                                    <div className="space-y-2">
                                                        {sortedRecords.slice(0, 5).map((record, idx) => (
                                                            <div key={idx} className="flex items-center justify-between text-sm p-2 rounded-xl bg-background/40 border border-border/10">
                                                                <div className="flex flex-col">
                                                                    <span className="font-medium text-muted-foreground">
                                                                        {new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(record.date))}
                                                                    </span>
                                                                    {record.store && (
                                                                        <span className="flex items-center gap-1 text-[10px] text-primary/60 font-medium italic -mt-0.5">
                                                                            <StoreIcon storeName={record.store} size="xs" />
                                                                            {record.store}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <span className="font-mono font-bold text-primary">
                                                                    {record.quantity} {record.unit}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col items-center gap-2 shrink-0 pt-1" onClick={(e) => e.stopPropagation()}>
                                            <Button
                                                size="icon"
                                                className="h-12 w-12 rounded-2xl shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground transform active:scale-95 transition-all"
                                                onClick={() => onAddToBasket(ingredient!, latestRecord.quantity)}
                                                title="Rajouter au panier"
                                            >
                                                <Plus className="h-6 w-6" />
                                            </Button>

                                            {isSelected && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-10 w-10 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 animate-in zoom-in duration-200"
                                                    onClick={() => {
                                                        if (window.confirm(`Supprimer l'historique de "${ingredient!.name}" ?`)) {
                                                            onDeleteFromHistory(id);
                                                            setSelectedId(null);
                                                        }
                                                    }}
                                                    title="Supprimer"
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </Button>
                                            )}

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
