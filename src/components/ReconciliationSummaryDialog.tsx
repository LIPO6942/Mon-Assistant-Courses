'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  CheckCircle2,
  RotateCcw,
  ShoppingBag,
  Sparkles,
  BrainCircuit,
  Store,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ReconciledItemSummary {
  name: string;
  purchasedQty: number;
  remainingQty: number;
  unit: string;
  price: number;
}

export interface ReconciliationReport {
  storeName?: string;
  purchaseDate: string;
  totalAmount: number;
  fullyPurchased: ReconciledItemSummary[];
  partiallyPurchased: ReconciledItemSummary[];
  unmatchedInBasket: string[];
  chandyekAdded: string[];
  priceUpdatesCount: number;
}

interface ReconciliationSummaryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: ReconciliationReport | null;
  onUndo: () => void;
}

export function ReconciliationSummaryDialog({
  open,
  onOpenChange,
  report,
  onUndo,
}: ReconciliationSummaryDialogProps) {
  if (!report) return null;

  const totalActioned = report.fullyPurchased.length + report.partiallyPurchased.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-lg rounded-3xl p-0 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <DialogHeader className="p-6 pb-3 border-b bg-primary/5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-md">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-lg font-bold">
                Courses validées avec succès !
              </DialogTitle>
              <DialogDescription className="text-xs mt-0.5 flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-foreground">
                  {report.storeName || 'Ticket de caisse'}
                </span>
                {report.totalAmount > 0 && (
                  <Badge variant="outline" className="text-[11px] font-bold px-2 py-0 border-primary/30">
                    {report.totalAmount.toFixed(3)} DT
                  </Badge>
                )}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <ScrollArea className="flex-1 p-6 space-y-5 overflow-y-auto">
          {/* Summary Banner */}
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-3.5 mb-4">
            <p className="text-xs font-medium text-emerald-800 dark:text-emerald-300 leading-relaxed">
              ✨ <strong>{totalActioned} article{totalActioned > 1 ? 's' : ''}</strong> du panier {totalActioned > 1 ? 'ont été validés' : 'a été validé'} automatiquement et {totalActioned > 1 ? 'ajoutés' : 'ajouté'} à votre historique d&apos;achat.
            </p>
          </div>

          {/* Section 1: Fully purchased items (retirés du panier) */}
          {report.fullyPurchased.length > 0 && (
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  Achetés & Retirés du panier ({report.fullyPurchased.length})
                </span>
              </div>
              <div className="space-y-1.5">
                {report.fullyPurchased.map((it, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-secondary/50 border border-border/40 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{it.name}</span>
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-normal">
                        x{it.purchasedQty} {it.unit}
                      </Badge>
                    </div>
                    <span className="font-bold text-primary">
                      {(it.price * it.purchasedQty).toFixed(3)} DT
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 2: Partially purchased items (reste conservé) */}
          {report.partiallyPurchased.length > 0 && (
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <Layers className="h-3.5 w-3.5" />
                  Achetés partiellement ({report.partiallyPurchased.length})
                </span>
              </div>
              <div className="space-y-1.5">
                {report.partiallyPurchased.map((it, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col gap-1 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">{it.name}</span>
                      <span className="font-bold text-primary">
                        {(it.price * it.purchasedQty).toFixed(3)} DT
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>Acheté : <strong>{it.purchasedQty}</strong> {it.unit}</span>
                      <span className="text-amber-700 dark:text-amber-300 font-semibold">
                        Reste dans le panier : <strong>{it.remainingQty}</strong> {it.unit}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 3: Ch3andek additions */}
          {report.chandyekAdded.length > 0 && (
            <div className="space-y-2 mb-4">
              <span className="text-xs font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1.5 uppercase tracking-wider">
                <BrainCircuit className="h-3.5 w-3.5" />
                Ajoutés au stock Ch3andek ({report.chandyekAdded.length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {report.chandyekAdded.map((name, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20"
                  >
                    ✓ {name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Section 4: Unmatched remaining in basket */}
          {report.unmatchedInBasket.length > 0 && (
            <div className="p-3 rounded-2xl bg-muted/40 border text-xs text-muted-foreground space-y-1">
              <span className="font-semibold text-foreground">
                Toujours en attente dans votre panier ({report.unmatchedInBasket.length}) :
              </span>
              <p className="line-clamp-2">
                {report.unmatchedInBasket.join(', ')}
              </p>
            </div>
          )}
        </ScrollArea>

        {/* Footer with Undo Action */}
        <DialogFooter className="p-4 border-t bg-muted/20 flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onUndo}
            className="w-full sm:w-auto rounded-xl text-xs text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30 gap-1.5 font-medium"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Annuler l&apos;action
          </Button>

          <Button
            onClick={() => onOpenChange(false)}
            className="w-full sm:flex-1 rounded-xl text-xs font-bold"
          >
            C&apos;est parfait !
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

