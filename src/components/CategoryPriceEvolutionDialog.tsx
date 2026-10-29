import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CategoryDef, Ingredient, PurchaseHistory } from "@/lib/types";
import { TrendingDown, TrendingUp, Minus, Calendar, Tag, Award, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { getBrandLogoUrl } from "@/lib/brand-catalog";

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
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<Record<string, string>>({});

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
      <DialogContent className="sm:max-w-md max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2 shrink-0">
          <DialogTitle className="text-xl flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Évolution des prix - {category.name}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-grow overflow-hidden">
          <ScrollArea className="h-[calc(85vh-80px)]">
            <div className="p-6 pt-0">
              {relevantIngredients.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <p>Aucun historique d&apos;achat pour cette catégorie.</p>
                  <p className="text-xs mt-1">
                    L&apos;historique se remplira au fur et à mesure de vos achats.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {relevantIngredients.map((item) => {
                    const fullHistory = [...purchaseHistory[item.id]].sort(
                      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
                    );

                    // Find visible price history
                    const allPriceHistory = fullHistory.filter(h => h.price !== undefined);

                    // Extract all unique brands recorded for this ingredient
                    const recordedBrands = Array.from(
                      new Set(
                        allPriceHistory
                          .map(h => h.brand?.trim())
                          .filter((b): b is string => Boolean(b))
                      )
                    );

                    // Current filter for this ingredient
                    const activeBrand = selectedBrandFilter[item.id] || 'ALL';

                    // Filtered history based on chosen brand
                    const priceHistory = activeBrand === 'ALL'
                      ? allPriceHistory
                      : allPriceHistory.filter(h => (h.brand || '').toLowerCase() === activeBrand.toLowerCase());

                    // Compute brand comparison if 2+ distinct brands have recorded prices
                    const brandComparison = (() => {
                      if (recordedBrands.length < 2) return null;

                      const latestByBrand: { brand: string; price: number; date: string }[] = [];
                      recordedBrands.forEach(b => {
                        const rec = allPriceHistory.find(h => (h.brand || '').toLowerCase() === b.toLowerCase());
                        if (rec && rec.price !== undefined) {
                          latestByBrand.push({ brand: b, price: rec.price, date: rec.date });
                        }
                      });

                      if (latestByBrand.length < 2) return null;

                      latestByBrand.sort((a, b) => a.price - b.price);
                      const cheapest = latestByBrand[0];
                      const mostExpensive = latestByBrand[latestByBrand.length - 1];
                      const diff = mostExpensive.price - cheapest.price;

                      // Écart temporel entre les deux derniers achats de ces marques
                      const timeDiffMs = Math.abs(new Date(cheapest.date).getTime() - new Date(mostExpensive.date).getTime());
                      const diffDays = Math.round(timeDiffMs / (1000 * 60 * 60 * 24));
                      const isTimeComparable = diffDays <= 90; // Comparables si espacés de moins de 3 mois

                      return {
                        cheapest,
                        mostExpensive,
                        diff,
                        diffDays,
                        isTimeComparable,
                        hasSavings: diff > 0.005
                      };
                    })();

                    return (
                      <div key={item.id} className="border rounded-2xl p-4 bg-muted/20 space-y-3">
                        {/* Header: Item name & current price */}
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-base leading-tight">{item.name}</h4>
                            {item.preferredBrand && (() => {
                              const logo = getBrandLogoUrl(item.preferredBrand, item.name, item.category);
                              return (
                                <span className="text-[10px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                                  {logo ? (
                                    <img
                                      src={logo}
                                      alt={item.preferredBrand}
                                      className="w-3.5 h-3.5 rounded-full object-cover shrink-0 border border-black/10"
                                      loading="lazy"
                                    />
                                  ) : (
                                    <Tag className="h-2.5 w-2.5 text-primary" />
                                  )}
                                  Marque habituelle : <strong className="text-foreground">{item.preferredBrand}</strong>
                                </span>
                              );
                            })()}
                          </div>
                          <div className="text-right">
                            <span className="block font-mono font-bold text-primary">
                              {item.price.toFixed(3)} DT
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              Prix actuel
                            </span>
                          </div>
                        </div>

                        {/* Brand Comparison Callout if available */}
                        {brandComparison && (
                          brandComparison.isTimeComparable && brandComparison.hasSavings ? (
                            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-2.5 text-xs text-green-800 dark:text-green-300 flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <Award className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
                                <span className="truncate">
                                  <strong>{brandComparison.cheapest.brand}</strong> plus avantageux ({brandComparison.cheapest.price.toFixed(3)} DT) vs {brandComparison.mostExpensive.brand} ({brandComparison.mostExpensive.price.toFixed(3)} DT)
                                </span>
                              </div>
                              <span className="font-bold whitespace-nowrap bg-green-500/20 px-1.5 py-0.5 rounded text-[10px]">
                                -{brandComparison.diff.toFixed(3)} DT
                              </span>
                            </div>
                          ) : !brandComparison.isTimeComparable ? (
                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-2.5 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
                              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                              <span className="text-[11px] leading-tight">
                                Achats espacés de <strong>{Math.round(brandComparison.diffDays / 30)} mois</strong> ({brandComparison.cheapest.brand} et {brandComparison.mostExpensive.brand}). Comparaison directe non représentative en raison de l&apos;inflation.
                              </span>
                            </div>
                          ) : null
                        )}

                        {/* Brand Filter Tabs if multiple brands exist */}
                        {recordedBrands.length > 0 && (
                          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                            <button
                              type="button"
                              onClick={() => setSelectedBrandFilter(prev => ({ ...prev, [item.id]: 'ALL' }))}
                              className={cn(
                                "text-[11px] font-bold px-2.5 py-1 rounded-full transition-all shrink-0 cursor-pointer border",
                                activeBrand === 'ALL'
                                  ? "bg-primary text-primary-foreground border-primary shadow-xs"
                                  : "bg-background text-muted-foreground hover:bg-muted border-border/60"
                              )}
                            >
                              Toutes ({allPriceHistory.length})
                            </button>
                            {recordedBrands.map(brandName => {
                              const isSelected = activeBrand.toLowerCase() === brandName.toLowerCase();
                              const count = allPriceHistory.filter(h => (h.brand || '').toLowerCase() === brandName.toLowerCase()).length;
                              return (
                                <button
                                  key={brandName}
                                  type="button"
                                  onClick={() => setSelectedBrandFilter(prev => ({ ...prev, [item.id]: brandName }))}
                                  className={cn(
                                    "text-[11px] font-bold px-2.5 py-1 rounded-full transition-all shrink-0 cursor-pointer border flex items-center gap-1",
                                    isSelected
                                      ? "bg-primary text-primary-foreground border-primary shadow-xs"
                                      : "bg-background text-muted-foreground hover:bg-muted border-border/60"
                                  )}
                                >
                                  <span>{brandName}</span>
                                  <span className="opacity-70 text-[9px]">({count})</span>
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* Price History List */}
                        <div className="space-y-1.5 pt-1">
                          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Historique des prix {activeBrand !== 'ALL' && `(${activeBrand})`}
                          </div>
                          {priceHistory.length === 0 ? (
                            <p className="text-xs italic text-muted-foreground">Pas encore de prix enregistrés pour cette marque.</p>
                          ) : (
                            priceHistory.slice(0, 6).map((record, idx) => (
                              <div key={idx} className="flex items-center justify-between text-sm py-1.5 border-b border-border/40 last:border-0 gap-2">
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                  <div className="flex items-center gap-1 text-muted-foreground text-xs shrink-0">
                                    <Calendar className="h-3 w-3 opacity-70" />
                                    <span>{new Date(record.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                                  </div>
                                  {record.brand && (
                                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-primary/10 text-primary border border-primary/20 shrink-0 truncate max-w-[100px]">
                                      {record.brand}
                                    </span>
                                  )}
                                  {record.store && (
                                    <span className="text-[9px] text-muted-foreground/75 font-medium shrink-0">
                                      @{record.store}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="font-mono font-medium">{record.price?.toFixed(3)} DT</span>
                                  {/* Compare with next price */}
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
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
