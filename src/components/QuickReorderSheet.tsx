
'use client';

import { SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { History, Plus, Trash2, LayoutGrid, Store } from 'lucide-react';
import type { PurchaseHistory, Ingredient, DbaratiItem } from '@/lib/types';
import { cn, getProductStatus } from '@/lib/utils';
import { useState, useMemo } from 'react';
import { StoreIcon } from '@/components/StoreIcon';

interface QuickReorderSheetProps {
    purchaseHistory: PurchaseHistory;
    pantry: Ingredient[];
    onAddToBasket: (ingredient: Ingredient, quantity: number) => void;
    onDeleteFromHistory: (id: string) => void;
    dbarati?: DbaratiItem[];
}

export default function QuickReorderSheet({ purchaseHistory, pantry, onAddToBasket, onDeleteFromHistory, dbarati }: QuickReorderSheetProps) {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [viewByStore, setViewByStore] = useState(false);

    const rawItems = useMemo(() => {
        return Object.entries(purchaseHistory)
            .filter(([id]) => pantry.some(ing => ing.id === id))
            .map(([id, records]) => ({
                id,
                records,
                latestDate: new Date(records[records.length - 1].date).getTime(),
                latestRecord: records[records.length - 1],
                ingredient: pantry.find(ing => ing.id === id)
            }))
            .sort((a, b) => b.latestDate - a.latestDate); // Sort by most recent first for re-order
    }, [purchaseHistory, pantry]);

    const groupedItems = useMemo(() => {
        if (!viewByStore) return { 'Toutes les commandes': rawItems };

        const groups: Record<string, typeof rawItems> = {};
        rawItems.forEach(item => {
            const store = item.latestRecord.store || 'Sans magasin';
            if (!groups[store]) groups[store] = [];
            groups[store].push(item);
        });
        return groups;
    }, [rawItems, viewByStore]);

    const hasItems = rawItems.length > 0;

    return (
        <SheetContent side="right" className="flex flex-col w-[92vw] sm:w-full sm:max-w-md px-3 sm:px-6 overflow-hidden">
            <SheetHeader className="pr-8 sm:pr-0 shrink-0">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                        <History className="h-5 w-5 text-primary shrink-0" />
                        <SheetTitle className="text-base sm:text-lg font-bold truncate">Historique d&apos;achats</SheetTitle>
                    </div>
                    {hasItems && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                                "h-8 w-8 rounded-full transition-all shrink-0",
                                viewByStore ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-secondary"
                            )}
                            onClick={() => setViewByStore(!viewByStore)}
                            title={viewByStore ? "Vue par défaut" : "Grouper par magasin"}
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </Button>
                    )}
                </div>
                <SheetDescription className="text-xs sm:text-sm">
                    Retrouvez l&apos;historique complet de vos achats et rajoutez vos articles au panier en un clic.
                </SheetDescription>
            </SheetHeader>

            <ScrollArea className="flex-grow my-3 w-full pr-1 overflow-x-hidden">
                {hasItems ? (
                    <div className="space-y-6 w-full max-w-full overflow-hidden px-0.5">
                        {Object.entries(groupedItems).map(([storeName, storeItems]) => (
                            <div key={storeName} className="space-y-2.5 w-full max-w-full">
                                {viewByStore && (
                                    <div className="flex items-center gap-2 px-1 sticky top-0 z-10 bg-background/95 backdrop-blur py-1.5">
                                        <div className="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                            <Store className="h-3 w-3 text-primary" />
                                        </div>
                                        <h3 className="text-[11px] font-black uppercase tracking-wider text-primary/80 truncate">
                                            {storeName}
                                        </h3>
                                        <div className="h-[1px] flex-1 bg-gradient-to-r from-primary/20 to-transparent" />
                                    </div>
                                )}
                                <ul className="space-y-3 w-full max-w-full">
                                    {storeItems.map(({ id, records, ingredient }) => {
                                        const isSelected = selectedId === id;
                                        // Sort records date descending for the history view
                                        const sortedRecords = [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                                        const latestRecord = sortedRecords[0];

                                        return (
                                            <li
                                                key={id}
                                                className={cn(
                                                    "bg-secondary/30 p-3 sm:p-4 rounded-2xl border border-border/50 transition-all cursor-pointer relative overflow-hidden w-full max-w-full",
                                                    isSelected ? "ring-2 ring-primary bg-secondary/60" : "hover:bg-secondary/50"
                                                )}
                                                onClick={() => setSelectedId(isSelected ? null : id)}
                                            >
                                                <div className="flex justify-between items-start gap-2.5 sm:gap-4 w-full min-w-0">
                                                    <div className="flex-1 min-w-0 overflow-hidden">
                                                        <h4 className="font-bold text-foreground leading-tight mb-1.5 flex items-center gap-1.5 text-sm sm:text-base min-w-0">
                                                            <span className="truncate flex-1 min-w-0">{ingredient!.name}</span>
                                                            {(() => {
                                                                const status = getProductStatus(purchaseHistory[id], ingredient?.name, dbarati);
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
                                                            <div className="flex flex-col gap-0.5 min-w-0">
                                                                <p className="text-xs sm:text-sm text-primary font-semibold flex items-center gap-1.5 truncate">
                                                                    <History className="h-3.5 w-3.5 opacity-70 shrink-0" />
                                                                    <span className="truncate">Dernier achat: {new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' }).format(new Date(latestRecord.date))}</span>
                                                                </p>
                                                                <div className="text-[11px] sm:text-xs text-muted-foreground font-medium flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                                                                    <span>{latestRecord.quantity} {latestRecord.unit}</span>
                                                                    <span>•</span>
                                                                    <span className="font-bold text-foreground">{((latestRecord.price || 0) * (latestRecord.quantity || 1)).toFixed(3)} DT</span>
                                                                </div>
                                                                {latestRecord.remark && (
                                                                    <span className="text-[10px] text-muted-foreground/80 italic line-clamp-1">
                                                                        ({latestRecord.remark})
                                                                    </span>
                                                                )}
                                                                {latestRecord.scannedFromReceipt && (
                                                                    <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded-md mt-1 w-fit border border-emerald-200/50 dark:border-emerald-800/50 max-w-full truncate">
                                                                        🧾 {latestRecord.receiptInfo || 'Validé par ticket'}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <div className="space-y-2 mt-3 animate-in fade-in slide-in-from-top-2 duration-300 min-w-0">
                                                                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-1">Historique des achats</div>
                                                                <div className="space-y-1.5 min-w-0">
                                                                    {sortedRecords.slice(0, 5).map((record, idx) => (
                                                                        <div key={idx} className="flex items-center justify-between text-xs sm:text-sm p-2 rounded-xl bg-background/50 border border-border/20 gap-2 min-w-0">
                                                                            <div className="flex flex-col min-w-0 flex-1">
                                                                                <span className="font-medium text-foreground text-xs truncate">
                                                                                    {new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(record.date))}
                                                                                </span>
                                                                                {record.store && (
                                                                                    <span className="flex items-center gap-1 text-[10px] text-primary/70 font-medium italic truncate mt-0.5">
                                                                                        <StoreIcon storeName={record.store} size="xs" />
                                                                                        <span className="truncate">{record.store}</span>
                                                                                    </span>
                                                                                )}
                                                                                {record.remark && (
                                                                                    <span className="text-[9px] text-muted-foreground/70 italic truncate mt-0.5">
                                                                                        ({record.remark})
                                                                                    </span>
                                                                                )}
                                                                                {record.scannedFromReceipt && (
                                                                                    <span className="inline-flex items-center gap-1 text-[8px] sm:text-[9px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded-md mt-0.5 w-fit border border-emerald-200/50 dark:border-emerald-800/50 truncate max-w-full">
                                                                                        🧾 {record.receiptInfo || 'Validé par ticket'}
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                            <span className="font-mono font-bold text-primary shrink-0 text-xs sm:text-sm whitespace-nowrap">
                                                                                {record.quantity} {record.unit}
                                                                            </span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col items-center gap-2 shrink-0 pt-0.5" onClick={(e) => e.stopPropagation()}>
                                                        <Button
                                                            size="icon"
                                                            className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl shadow-md bg-primary hover:bg-primary/90 text-primary-foreground transform active:scale-95 transition-all shrink-0"
                                                            onClick={() => onAddToBasket(ingredient!, latestRecord.quantity)}
                                                            title="Rajouter au panier"
                                                        >
                                                            <Plus className="h-5 w-5" />
                                                        </Button>

                                                        {isSelected && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 animate-in zoom-in duration-200 shrink-0"
                                                                onClick={() => {
                                                                    if (window.confirm(`Supprimer l'historique de "${ingredient!.name}" ?`)) {
                                                                        onDeleteFromHistory(id);
                                                                        setSelectedId(null);
                                                                    }
                                                                }}
                                                                title="Supprimer"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        )}

                                                    </div>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        ))}
                    </div>
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
