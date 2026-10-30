'use client';

import { useState, useEffect } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CheckCircle2,
  XCircle,
  PlusCircle,
  RefreshCw,
  PackageSearch,
  Sparkles,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { Receipt, ReceiptLine, Ingredient, CategoryDef } from '@/lib/types';
import { SmartMatchingService, isReceiptNoise, cleanReceiptLabel } from '@/lib/smart-matching';
import { cn } from '@/lib/utils';

// ─── Types internes ─────────────────────────────────────────────────────────

interface MatchedLine {
  line: ReceiptLine;
  ingredient: Ingredient;
  newPrice: number;
  oldPrice: number;
  confirmed: boolean; // true = l'utilisateur veut mettre à jour ce prix
}

interface UnmatchedLine {
  line: ReceiptLine;
  suggestedName: string;
  selectedCategory: string;
  include: boolean; // true = l'utilisateur veut ajouter ce produit
}

interface ReceiptSyncDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receipt: Receipt | null;
  pantry: Ingredient[];
  categories: CategoryDef[];
  onConfirm: (
    priceUpdates: { id: string; price: number; ingredientId: string; newPrice: number; line: ReceiptLine }[],
    newIngredients: Omit<Ingredient, 'id'>[],
    receipt: Receipt
  ) => void;
}

// ─── Composant principal ────────────────────────────────────────────────────

export function ReceiptSyncDialog({
  open,
  onOpenChange,
  receipt,
  pantry,
  categories,
  onConfirm,
}: ReceiptSyncDialogProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [matched, setMatched] = useState<MatchedLine[]>([]);
  const [unmatched, setUnmatched] = useState<UnmatchedLine[]>([]);

  // Lancer l'analyse dès que la dialog s'ouvre avec un reçu
  useEffect(() => {
    if (!open || !receipt) return;

    setIsAnalyzing(true);
    setMatched([]);
    setUnmatched([]);

    const analyze = async () => {
      const newMatched: MatchedLine[] = [];
      const newUnmatched: UnmatchedLine[] = [];

      const lines = receipt.lines || [];

      for (const line of lines) {
        const label = line.normalizedLabel || line.rawLabel || '';

        // Ignorer le bruit de ticket (timbre, TVA, remise…)
        if (isReceiptNoise(label) || isReceiptNoise(line.rawLabel || '')) continue;

        // Calcul du nouveau prix (logique actuelle conservée)
        const newPrice =
          line.unitPrice != null
            ? line.unitPrice
            : line.lineTotal != null && line.quantity != null && line.quantity > 0
            ? parseFloat((line.lineTotal / line.quantity).toFixed(3))
            : 0;

        if (newPrice <= 0) continue;

        // Matching intelligent contre le garde-manger
        const result = await SmartMatchingService.findMatch(label, pantry);

        if (result.ingredient && result.confidence >= 0.4) {
          newMatched.push({
            line,
            ingredient: result.ingredient,
            newPrice,
            oldPrice: result.ingredient.price,
            confirmed: true,
          });
        } else {
          // Produit non trouvé → proposer de l'ajouter
          const suggestedName = cleanReceiptLabel(line.normalizedLabel || line.rawLabel || label);
          if (!suggestedName || suggestedName.length < 2) continue;

          // Deviner la catégorie à partir de celle du ticket si possible
          const guessedCategory =
            line.category && categories.some(c => c.name === line.category)
              ? line.category
              : categories[0]?.name || 'Autre';

          newUnmatched.push({
            line,
            suggestedName,
            selectedCategory: guessedCategory,
            include: false, // désactivé par défaut, l'utilisateur coche ce qu'il veut
          });
        }
      }

      setMatched(newMatched);
      setUnmatched(newUnmatched);
      setIsAnalyzing(false);
    };

    analyze();
  }, [open, receipt, pantry, categories]);

  // ─── Handlers ─────────────────────────────────────────────────────────────

  function toggleMatchedConfirm(index: number) {
    setMatched(prev =>
      prev.map((m, i) => (i === index ? { ...m, confirmed: !m.confirmed } : m))
    );
  }

  function toggleAllMatched() {
    const allConfirmed = matched.every(m => m.confirmed);
    setMatched(prev => prev.map(m => ({ ...m, confirmed: !allConfirmed })));
  }

  function toggleUnmatchedInclude(index: number) {
    setUnmatched(prev =>
      prev.map((u, i) => (i === index ? { ...u, include: !u.include } : u))
    );
  }

  function toggleAllUnmatched() {
    const allIncluded = unmatched.every(u => u.include);
    setUnmatched(prev => prev.map(u => ({ ...u, include: !allIncluded })));
  }

  function setUnmatchedCategory(index: number, category: string) {
    setUnmatched(prev =>
      prev.map((u, i) => (i === index ? { ...u, selectedCategory: category } : u))
    );
  }

  function setUnmatchedName(index: number, name: string) {
    setUnmatched(prev =>
      prev.map((u, i) => (i === index ? { ...u, suggestedName: name } : u))
    );
  }

  function handleConfirm() {
    if (!receipt) return;

    const priceUpdates = matched
      .filter(m => m.confirmed)
      .map(m => ({
        id: m.ingredient.id,
        price: m.newPrice,
        ingredientId: m.ingredient.id,
        newPrice: m.newPrice,
        line: m.line,
      }));

    const newIngredients: Omit<Ingredient, 'id'>[] = unmatched
      .filter(u => u.include && u.suggestedName.trim().length > 0)
      .map(u => ({
        name: u.suggestedName.trim(),
        category: u.selectedCategory || categories[0]?.name || 'Autre',
        price: u.line.unitPrice ?? 0,
        unit: u.line.unit || 'pièce',
      }));

    onConfirm(priceUpdates, newIngredients, receipt);
    onOpenChange(false);
  }

  // ─── Statistiques ─────────────────────────────────────────────────────────

  const confirmedCount = matched.filter(m => m.confirmed).length;
  const includedCount = unmatched.filter(u => u.include).length;
  const totalActions = confirmedCount + includedCount;

  // ─── Rendu ────────────────────────────────────────────────────────────────

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl h-[90vh] flex flex-col p-0 overflow-hidden rounded-2xl">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-3 border-b">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">
                Synchronisation Garde-Manger
              </DialogTitle>
              <DialogDescription className="text-xs mt-0.5">
                {receipt?.storeName || 'Ticket'} · Validation produit par produit
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Corps scrollable */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <div className="px-6 py-4 space-y-6">

            {/* État : analyse en cours */}
            {isAnalyzing && (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm font-medium">Analyse des produits en cours…</p>
              </div>
            )}

            {/* Section A — Produits trouvés dans le garde-manger */}
            {!isAnalyzing && matched.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-bold text-foreground">
                      Mise à jour des prix
                    </h3>
                    <Badge variant="secondary" className="text-[10px] font-bold">
                      {matched.length} produit{matched.length > 1 ? 's' : ''} trouvé{matched.length > 1 ? 's' : ''}
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-[11px] rounded-lg px-2.5 text-primary hover:text-primary hover:bg-primary/10"
                    onClick={toggleAllMatched}
                  >
                    {matched.every(m => m.confirmed) ? 'Tout désélectionner' : 'Tout sélectionner'}
                  </Button>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Cochez les produits dont vous souhaitez mettre à jour le prix dans votre garde-manger.
                </p>

                <div className="divide-y divide-border/40 rounded-xl border overflow-hidden">
                  {matched.map((m, idx) => {
                    const priceChanged = Math.abs(m.newPrice - m.oldPrice) > 0.001;
                    const priceDiff = m.newPrice - m.oldPrice;
                    return (
                      <button
                        key={m.line.id || idx}
                        onClick={() => toggleMatchedConfirm(idx)}
                        className={cn(
                          'w-full text-left px-4 py-3 flex items-center gap-3 transition-colors',
                          m.confirmed
                            ? 'bg-green-50 dark:bg-green-950/20 hover:bg-green-100 dark:hover:bg-green-950/30'
                            : 'bg-muted/30 hover:bg-muted/50'
                        )}
                      >
                        {/* Icône statut */}
                        <div className="shrink-0">
                          {m.confirmed ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-muted-foreground/50" />
                          )}
                        </div>

                        {/* Infos produit */}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-foreground truncate">
                            {m.ingredient.name}
                          </p>
                          <p className="text-[10px] text-muted-foreground italic truncate">
                            Brut ticket : {m.line.normalizedLabel || m.line.rawLabel}
                          </p>
                        </div>

                        {/* Prix ancien → nouveau */}
                        <div className="shrink-0 text-right space-y-0.5">
                          <div className="flex items-center gap-1.5 justify-end">
                            <span className="text-xs text-muted-foreground line-through">
                              {m.oldPrice.toFixed(3)} DT
                            </span>
                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                            <span className={cn(
                              'text-sm font-bold',
                              m.confirmed ? 'text-green-700 dark:text-green-400' : 'text-foreground'
                            )}>
                              {m.newPrice.toFixed(3)} DT
                            </span>
                          </div>
                          {priceChanged && (
                            <span className={cn(
                              'text-[10px] font-semibold',
                              priceDiff > 0 ? 'text-red-500' : 'text-green-600'
                            )}>
                              {priceDiff > 0 ? '+' : ''}{priceDiff.toFixed(3)} DT
                            </span>
                          )}
                          {!priceChanged && (
                            <span className="text-[10px] text-muted-foreground">Inchangé</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Section B — Produits non trouvés : proposition d'ajout */}
            {!isAnalyzing && unmatched.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PackageSearch className="h-4 w-4 text-amber-500" />
                    <h3 className="text-sm font-bold text-foreground">
                      Nouveaux produits
                    </h3>
                    <Badge variant="outline" className="text-[10px] font-bold border-amber-400 text-amber-600">
                      {unmatched.length} non trouvé{unmatched.length > 1 ? 's' : ''}
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-[11px] rounded-lg px-2.5 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/20"
                    onClick={toggleAllUnmatched}
                  >
                    {unmatched.every(u => u.include) ? 'Tout désélectionner' : 'Tout sélectionner'}
                  </Button>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Ces produits ne sont pas encore dans votre garde-manger. Cochez ceux que vous souhaitez ajouter et choisissez leur catégorie.
                </p>

                <div className="space-y-2">
                  {unmatched.map((u, idx) => (
                    <div
                      key={u.line.id || idx}
                      className={cn(
                        'rounded-xl border overflow-hidden transition-colors',
                        u.include
                          ? 'border-primary/30 bg-primary/5'
                          : 'border-border bg-muted/20'
                      )}
                    >
                      {/* Ligne header cliquable */}
                      <button
                        onClick={() => toggleUnmatchedInclude(idx)}
                        className="w-full text-left px-4 py-3 flex items-center gap-3"
                      >
                        <div className="shrink-0">
                          {u.include ? (
                            <PlusCircle className="h-5 w-5 text-primary" />
                          ) : (
                            <PlusCircle className="h-5 w-5 text-muted-foreground/40" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-foreground truncate">
                            {u.suggestedName}
                          </p>
                          <p className="text-[10px] text-muted-foreground italic truncate">
                            Brut : {u.line.rawLabel}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <span className="text-sm font-bold text-foreground">
                            {(u.line.unitPrice ?? 0).toFixed(3)} DT
                          </span>
                          <p className="text-[10px] text-muted-foreground">
                            {u.line.unit || 'pièce'}
                          </p>
                        </div>
                      </button>

                      {/* Options d'ajout (visible seulement si coché) */}
                      {u.include && (
                        <div className="px-4 pb-3 space-y-2 animate-in slide-in-from-top-1 duration-200">
                          {/* Nom éditable */}
                          <div>
                            <label className="text-[10px] font-bold text-muted-foreground block mb-1">
                              Nom dans le garde-manger
                            </label>
                            <input
                              className="w-full h-8 px-3 text-xs rounded-lg border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                              value={u.suggestedName}
                              onChange={(e) => setUnmatchedName(idx, e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>

                          {/* Sélecteur de catégorie */}
                          <div>
                            <label className="text-[10px] font-bold text-muted-foreground block mb-1">
                              Catégorie
                            </label>
                            <Select
                              value={u.selectedCategory}
                              onValueChange={(val) => setUnmatchedCategory(idx, val)}
                            >
                              <SelectTrigger className="h-8 text-xs rounded-lg bg-background">
                                <SelectValue placeholder="Choisir une catégorie" />
                              </SelectTrigger>
                              <SelectContent>
                                {categories.map(cat => (
                                  <SelectItem key={cat.id} value={cat.name} className="text-xs">
                                    {cat.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* État : rien trouvé */}
            {!isAnalyzing && matched.length === 0 && unmatched.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 gap-3 text-center text-muted-foreground">
                <PackageSearch className="h-10 w-10 opacity-40" />
                <p className="text-sm font-semibold">Aucun produit à synchroniser</p>
                <p className="text-xs max-w-xs">
                  Toutes les lignes de ce ticket ont été filtrées (bruit de caisse, taxes, etc.) ou les produits ne correspondent à aucune règle connue.
                </p>
              </div>
            )}

          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-muted-foreground">
            {!isAnalyzing && (
              <>
                {confirmedCount > 0 && (
                  <span className="text-green-600 font-semibold">
                    {confirmedCount} prix à mettre à jour
                  </span>
                )}
                {confirmedCount > 0 && includedCount > 0 && <span className="mx-1">·</span>}
                {includedCount > 0 && (
                  <span className="text-primary font-semibold">
                    {includedCount} produit{includedCount > 1 ? 's' : ''} à ajouter
                  </span>
                )}
                {totalActions === 0 && <span>Aucune action sélectionnée</span>}
              </>
            )}
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="ghost"
              className="rounded-xl text-xs flex-1 sm:flex-none"
              onClick={() => onOpenChange(false)}
              disabled={isAnalyzing}
            >
              Annuler
            </Button>
            <Button
              className="rounded-xl text-xs flex-1 sm:flex-none gap-1.5"
              onClick={handleConfirm}
              disabled={isAnalyzing || totalActions === 0}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Valider ({totalActions})
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

