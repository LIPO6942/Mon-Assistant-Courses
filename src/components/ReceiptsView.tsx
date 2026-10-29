'use client';

import { useState, useMemo } from 'react';
import { Receipt, ReceiptLine, Ingredient, CategoryDef } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ReceiptText,
  Calendar,
  Store,
  Trash2,
  Pencil,
  ListChecks,
  ShoppingBag,
  Camera,
  Coins,
  Receipt as ReceiptIcon,
  ShoppingBasket,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';
import { UploadReceiptDialog } from './UploadReceiptDialog';
import { computeReceiptKpis } from '@/lib/receipt-utils';
import { cn } from '@/lib/utils';

interface ReceiptsViewProps {
  receipts: Receipt[];
  onAddReceipt: (receipt: Receipt) => void;
  onUpdateReceipt: (id: string, updated: Partial<Receipt>) => void;
  onDeleteReceipt: (id: string) => void;
  onSyncWithPantry: (receipt: Receipt) => void;
}

export default function ReceiptsView({
  receipts,
  onAddReceipt,
  onUpdateReceipt,
  onDeleteReceipt,
  onSyncWithPantry,
}: ReceiptsViewProps) {
  const [expandedReceiptId, setExpandedReceiptId] = useState<string | null>(null);

  // Édition de base (Magasin & Date)
  const [basicEditorOpen, setBasicEditorOpen] = useState(false);
  const [editingReceiptId, setEditingReceiptId] = useState<string | null>(null);
  const [editStoreName, setEditStoreName] = useState('');
  const [editDate, setEditDate] = useState('');

  // Édition des lignes
  const [lineEditorOpen, setLineEditorOpen] = useState(false);
  const [lineDrafts, setLineDrafts] = useState<ReceiptLine[]>([]);
  const [lineReceiptId, setLineReceiptId] = useState<string | null>(null);

  // Recherche
  const [searchQuery, setSearchQuery] = useState('');

  const kpis = useMemo(() => computeReceiptKpis(receipts), [receipts]);

  const filteredReceipts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const sorted = [...receipts].sort((a, b) => {
      const da = new Date(a.purchaseAt || 0).getTime();
      const db = new Date(b.purchaseAt || 0).getTime();
      return db - da;
    });
    if (!q) return sorted;
    return sorted.filter(
      (r) =>
        (r.storeName || '').toLowerCase().includes(q) ||
        (r.lines || []).some((l) => (l.normalizedLabel || l.rawLabel).toLowerCase().includes(q))
    );
  }, [receipts, searchQuery]);

  function formatDate(iso?: string) {
    if (!iso) return 'Date inconnue';
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return iso;
      return d.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return iso;
    }
  }

  function openBasicEditor(rcpt: Receipt) {
    setEditingReceiptId(rcpt.id);
    setEditStoreName(rcpt.storeName || '');
    setEditDate(rcpt.purchaseAt ? rcpt.purchaseAt.split('T')[0] : '');
    setBasicEditorOpen(true);
  }

  function saveBasicEditor() {
    if (!editingReceiptId) return;
    onUpdateReceipt(editingReceiptId, {
      storeName: editStoreName.trim() || 'Magasin Inconnu',
      purchaseAt: editDate ? new Date(editDate).toISOString() : new Date().toISOString(),
    });
    setBasicEditorOpen(false);
  }

  function openLineEditor(rcpt: Receipt) {
    setLineReceiptId(rcpt.id);
    setLineDrafts(JSON.parse(JSON.stringify(rcpt.lines || [])));
    setLineEditorOpen(true);
  }

  function setDraftField(index: number, field: 'quantity' | 'unitPrice' | 'lineTotal', val: string) {
    setLineDrafts((prev) => {
      const next = [...prev];
      const row = { ...next[index] };
      const num = val === '' ? undefined : parseFloat(val);
      row[field] = Number.isFinite(num) ? num : undefined;

      // Recalcul auto si quantity et unitPrice sont présents
      if (row.quantity && row.unitPrice && field !== 'lineTotal') {
        row.lineTotal = parseFloat((row.quantity * row.unitPrice).toFixed(3));
      } else if (row.lineTotal && row.quantity && field === 'lineTotal' && row.quantity > 0) {
        row.unitPrice = parseFloat((row.lineTotal / row.quantity).toFixed(3));
      }

      next[index] = row;
      return next;
    });
  }

  function deleteDraftLine(index: number) {
    setLineDrafts((prev) => prev.filter((_, i) => i !== index));
  }

  function saveLineEditor() {
    if (!lineReceiptId) return;
    const newTotal = lineDrafts.reduce((acc, l) => acc + (l.lineTotal || 0), 0);
    onUpdateReceipt(lineReceiptId, {
      lines: lineDrafts,
      total: parseFloat(newTotal.toFixed(3)),
    });
    setLineEditorOpen(false);
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl space-y-6 pb-20">
      {/* Header & KPI */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Tickets
            </h1>
            <Badge variant="secondary" className="font-bold">
              {receipts.length}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Scannez vos tickets pour archiver vos achats et mettre à jour automatiquement vos prix.
          </p>
        </div>

        <UploadReceiptDialog onReceiptProcessed={onAddReceipt}>
          <Button className="rounded-full shadow-md gap-2 h-11 px-5">
            <Camera className="h-4 w-4" />
            <span>Scanner un ticket</span>
          </Button>
        </UploadReceiptDialog>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="rounded-2xl border bg-card/60 backdrop-blur-sm shadow-sm p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Dépenses Totales
            </span>
            <Coins className="h-4 w-4 text-primary" />
          </div>
          <div className="text-xl sm:text-2xl font-black mt-2">
            {kpis.totalSpend.toFixed(3)} <span className="text-xs font-normal text-muted-foreground">DT</span>
          </div>
        </Card>

        <Card className="rounded-2xl border bg-card/60 backdrop-blur-sm shadow-sm p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Tickets
            </span>
            <ReceiptIcon className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black mt-2">{kpis.count}</div>
        </Card>

        <Card className="rounded-2xl border bg-card/60 backdrop-blur-sm shadow-sm p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Panier Moyen
            </span>
            <ShoppingBasket className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black mt-2">
            {kpis.avgBasket.toFixed(3)} <span className="text-xs font-normal text-muted-foreground">DT</span>
          </div>
        </Card>

        <Card className="rounded-2xl border bg-card/60 backdrop-blur-sm shadow-sm p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Articles Achetés
            </span>
            <ShoppingBag className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black mt-2">{kpis.totalItems}</div>
        </Card>
      </div>

      {/* Barre de recherche */}
      {receipts.length > 0 && (
        <div className="relative">
          <Input
            type="search"
            placeholder="Rechercher par magasin ou produit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-full pl-4 pr-10 h-10 text-sm bg-card/50"
          />
        </div>
      )}

      {/* Liste des tickets */}
      {filteredReceipts.length === 0 ? (
        <Card className="rounded-3xl border border-dashed p-10 text-center bg-card/40 flex flex-col items-center justify-center">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4">
            <ReceiptText className="h-8 w-8" />
          </div>
          <h3 className="font-bold text-lg mb-1">Aucun ticket pour le moment</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-6">
            Prenez en photo votre ticket (Carrefour, Monoprix, MG, etc.) pour commencer à suivre vos dépenses.
          </p>
          <div className="w-full flex items-center justify-center">
            <UploadReceiptDialog onReceiptProcessed={onAddReceipt}>
              <Button className="rounded-full gap-2 px-6 shadow-md hover:shadow-lg transition-all mx-auto">
                <Camera className="h-4 w-4" />
                Scanner mon premier ticket
              </Button>
            </UploadReceiptDialog>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredReceipts.map((rcpt) => {
            const isExpanded = expandedReceiptId === rcpt.id;
            return (
              <Card
                key={rcpt.id}
                className="rounded-2xl border bg-card/80 backdrop-blur-sm shadow-sm overflow-hidden transition-all hover:shadow-md"
              >
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Info principale */}
                  <div className="flex items-start gap-3.5">
                    <div className="h-11 w-11 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                      <Store className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-base sm:text-lg text-foreground">
                          {rcpt.storeName || 'Magasin Inconnu'}
                        </span>
                        <Badge variant="outline" className="text-[10px] uppercase font-bold">
                          {rcpt.lines?.length || 0} articles
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(rcpt.purchaseAt)}
                        </span>
                        <span className="font-mono">•</span>
                        <span className="font-bold text-foreground">
                          {(rcpt.total || 0).toFixed(3)} {rcpt.currency || 'DT'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Boutons d'action */}
                  <div className="flex items-center gap-1.5 self-end sm:self-center">
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-xl h-9 text-xs gap-1.5 hover:bg-primary/10 hover:text-primary transition-all"
                      title="Mettre à jour les prix du garde-manger"
                      onClick={() => onSyncWithPantry(rcpt)}
                    >
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                      <span className="hidden sm:inline">Garde-manger</span>
                    </Button>

                    <Button
                      size="icon"
                      variant="ghost"
                      className="rounded-xl h-9 w-9 text-muted-foreground hover:text-foreground"
                      title="Modifier magasin & date"
                      onClick={() => openBasicEditor(rcpt)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>

                    <Button
                      size="icon"
                      variant="ghost"
                      className="rounded-xl h-9 w-9 text-muted-foreground hover:text-foreground"
                      title="Modifier les lignes du ticket"
                      onClick={() => openLineEditor(rcpt)}
                    >
                      <ListChecks className="h-4 w-4" />
                    </Button>

                    <Button
                      size="icon"
                      variant="ghost"
                      className="rounded-xl h-9 w-9 text-destructive hover:bg-destructive/10"
                      title="Supprimer ce ticket"
                      onClick={() => {
                        if (confirm('Voulez-vous vraiment supprimer ce ticket ?')) {
                          onDeleteReceipt(rcpt.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>

                    <Button
                      size="icon"
                      variant="ghost"
                      className="rounded-xl h-9 w-9 ml-1"
                      onClick={() => setExpandedReceiptId(isExpanded ? null : rcpt.id)}
                    >
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {/* Section dépliée : liste des lignes */}
                {isExpanded && (
                  <div className="bg-muted/20 border-t px-4 py-3 sm:px-6">
                    <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                      Articles sur le ticket
                    </div>
                    <div className="divide-y divide-border/40">
                      {(rcpt.lines || []).map((line, idx) => (
                        <div key={line.id || idx} className="py-2 flex items-center justify-between text-xs">
                          <div className="flex-1 pr-4">
                            <p className="font-semibold text-foreground">
                              {line.normalizedLabel || line.rawLabel}
                            </p>
                            {line.normalizedLabel && line.normalizedLabel !== line.rawLabel && (
                              <p className="text-[10px] text-muted-foreground italic truncate">
                                Brut: {line.rawLabel}
                              </p>
                            )}
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-muted-foreground mr-3">
                              {line.quantity || 1} {line.unit || 'pcs'}
                              {line.unitPrice != null && ` × ${line.unitPrice.toFixed(3)}`}
                            </span>
                            <span className="font-bold text-foreground">
                              {line.lineTotal != null
                                ? line.lineTotal.toFixed(3)
                                : line.unitPrice && line.quantity
                                ? (line.unitPrice * line.quantity).toFixed(3)
                                : '0.000'}{' '}
                              DT
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal Édition Magasin & Date */}
      <Dialog open={basicEditorOpen} onOpenChange={setBasicEditorOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Modifier le ticket</DialogTitle>
            <DialogDescription>Ajustez l&apos;enseigne et la date d&apos;achat du ticket.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-bold text-muted-foreground block mb-1.5">
                Nom du magasin
              </label>
              <Input
                value={editStoreName}
                onChange={(e) => setEditStoreName(e.target.value)}
                placeholder="Ex: Carrefour, Monoprix, MG..."
                className="rounded-xl"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground block mb-1.5">
                Date d&apos;achat
              </label>
              <Input
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                className="rounded-xl"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setBasicEditorOpen(false)} className="rounded-xl">
              Annuler
            </Button>
            <Button onClick={saveBasicEditor} className="rounded-xl">
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Édition des Lignes */}
      <Dialog open={lineEditorOpen} onOpenChange={setLineEditorOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[85vh] flex flex-col p-0 overflow-hidden rounded-2xl">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle>Modifier les articles du ticket</DialogTitle>
            <DialogDescription>
              Ajustez les quantités, prix unitaires ou supprimez des lignes. Les totaux sont recalculés automatiquement.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-2 divide-y divide-border/40">
            {lineDrafts.map((line, idx) => (
              <div key={line.id || idx} className="py-3 flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="flex-1 min-w-0">
                  <Input
                    value={line.normalizedLabel || line.rawLabel}
                    onChange={(e) => {
                      const v = e.target.value;
                      setLineDrafts((prev) => {
                        const next = [...prev];
                        next[idx] = { ...next[idx], normalizedLabel: v };
                        return next;
                      });
                    }}
                    className="h-9 text-xs rounded-xl font-semibold"
                  />
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="w-20">
                    <label className="text-[10px] text-muted-foreground block">Quantité</label>
                    <Input
                      type="number"
                      step="any"
                      value={line.quantity ?? ''}
                      onChange={(e) => setDraftField(idx, 'quantity', e.target.value)}
                      className="h-8 text-xs rounded-xl"
                    />
                  </div>
                  <div className="w-24">
                    <label className="text-[10px] text-muted-foreground block">Prix Unit.</label>
                    <Input
                      type="number"
                      step="0.001"
                      value={line.unitPrice ?? ''}
                      onChange={(e) => setDraftField(idx, 'unitPrice', e.target.value)}
                      className="h-8 text-xs rounded-xl"
                    />
                  </div>
                  <div className="w-24">
                    <label className="text-[10px] text-muted-foreground block">Total Ligne</label>
                    <Input
                      type="number"
                      step="0.001"
                      value={line.lineTotal ?? ''}
                      onChange={(e) => setDraftField(idx, 'lineTotal', e.target.value)}
                      className="h-8 text-xs rounded-xl font-bold"
                    />
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-destructive self-end rounded-xl"
                    onClick={() => deleteDraftLine(idx)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <DialogFooter className="p-4 bg-muted/20 border-t flex items-center justify-between">
            <div className="text-xs font-bold text-foreground">
              Total recalculé :{' '}
              {lineDrafts
                .reduce((acc, l) => acc + (l.lineTotal || 0), 0)
                .toFixed(3)}{' '}
              DT
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setLineEditorOpen(false)} className="rounded-xl text-xs">
                Annuler
              </Button>
              <Button onClick={saveLineEditor} className="rounded-xl text-xs">
                Enregistrer les modifications
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
