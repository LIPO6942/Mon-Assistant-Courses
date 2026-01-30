import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CategoryDef, Ingredient, PurchaseHistory } from "@/lib/types";
import { TrendingDown, TrendingUp, Minus, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryPriceEvolutionDialogProps {
    category: CategoryDef | null;
    isOpen: boolean;
    onClose: () => void;
    pantry: Ingredient[];
    purchaseHistory: PurchaseHistory;
}

export default function CategoryPriceEvolutionDialog({
    category,
    isOpen,
    onClose,
    pantry,
    purchaseHistory,
}: CategoryPriceEvolutionDialogProps) {
    if (!category) return null;

    // Filter ingredients belonging to this category that have purchase history
    const relevantIngredients = pantry.filter(
        (item) =>
            item.category === category.name &&
            purchaseHistory[item.id] &&
            purchaseHistory[item.id].length > 0
    );

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md max-h-[85vh] flex flex-col p-0">
                <DialogHeader className="p-6 pb-2 shrink-0">
                    <DialogTitle className="text-xl flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        Évolution des prix - {category.name}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-hidden">
                    <ScrollArea className="h-full p-6 pt-0">
                        {relevantIngredients.length === 0 ? (
                            <div className="text-center py-10 text-muted-foreground">
                                <p>Aucun historique d'achat pour cette catégorie.</p>
                                <p className="text-xs mt-1">
                                    L'historique se remplira au fur et à mesure de vos achats.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {relevantIngredients.map((item) => {
                                    const history = [...purchaseHistory[item.id]].sort(
                                        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
                                    );

                                    // Get the latest price (current reference price in pantry)
                                    const currentPrice = item.price;

                                    // Find visible price history (only records with price recorded)
                                    const priceHistory = history.filter(h => h.price !== undefined);

                                    return (
                                        <div key={item.id} className="border rounded-xl p-4 bg-muted/20">
                                            <div className="flex justify-between items-start mb-3">
                                                <h4 className="font-bold text-base">{item.name}</h4>
                                                <div className="text-right">
                                                    <span className="block font-mono font-bold text-primary">
                                                        {currentPrice.toFixed(3)} DT
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground">
                                                        Prix actuel
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Historique</div>
                                                {priceHistory.length === 0 ? (
                                                    <p className="text-xs italic text-muted-foreground">Pas encore de prix enregistrés.</p>
                                                ) : (
                                                    priceHistory.slice(0, 5).map((record, idx) => (
                                                        <div key={idx} className="flex items-center justify-between text-sm py-1 border-b border-border/50 last:border-0">
                                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                                <Calendar className="h-3 w-3 opacity-70" />
                                                                <span>{new Date(record.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-mono font-medium">{record.price?.toFixed(3)} DT</span>
                                                                {/* Comparaison simple avec le prix suivant (plus ancien) si dispo */}
                                                                {idx < priceHistory.length - 1 && (
                                                                    (() => {
                                                                        const oldPrice = priceHistory[idx + 1].price;
                                                                        if (!oldPrice) return null;
                                                                        const diff = (record.price || 0) - oldPrice;
                                                                        if (Math.abs(diff) < 0.001) return <Minus className="h-3 w-3 text-muted-foreground" />;
                                                                        return diff > 0
                                                                            ? <TrendingUp className="h-3 w-3 text-red-500" />
                                                                            : <TrendingDown className="h-3 w-3 text-green-500" />;
                                                                    })()
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </ScrollArea>
                </div>
            </DialogContent>
        </Dialog>
    );
}
