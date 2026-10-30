'use client';

import { useState, useRef, type ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Camera, Loader2, UploadCloud, ReceiptText, Sparkles, AlertCircle } from 'lucide-react';
import { compressImage, fileToDataUrl, normalizeUnit, computeStandardUnitPrice } from '@/lib/receipt-utils';
import { extractReceiptFromImage } from '@/ai/flows/extract-receipt-flow';
import { Receipt, ReceiptLine } from '@/lib/types';
import { cleanProductName } from '@/lib/smart-matching';

interface UploadReceiptDialogProps {
  children?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onReceiptProcessed: (receipt: Receipt) => void;
}

export function UploadReceiptDialog({
  children,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  onReceiptProcessed,
}: UploadReceiptDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = (v: boolean) => {
    if (isControlled && setControlledOpen) setControlledOpen(v);
    else setInternalOpen(v);
    if (!v) {
      setIsProcessing(false);
      setProcessingMessage('');
      setError(null);
    }
  };

  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  async function processReceiptFile(file: File) {
    try {
      setIsProcessing(true);
      setError(null);

      let finalDataUri: string;
      setProcessingMessage('Optimisation et préparation de l\'image...');
      try {
        const compressed = await compressImage(file, 0.7, 1280, 1280);
        finalDataUri = compressed.dataUrl;
      } catch (e) {
        console.warn('Compression échouée, utilisation originale', e);
        finalDataUri = await fileToDataUrl(file);
      }

      setProcessingMessage('Analyse IA du ticket en cours (Groq Vision)...');

      const result = await extractReceiptFromImage({ receiptDataUri: finalDataUri });

      if (!result.success) {
        throw new Error(result.error);
      }

      const res = result.data;

      if (!res || !res.lines || res.lines.length === 0) {
        throw new Error("L'IA n'a détecté aucun article sur ce ticket. Veuillez réessayer avec une photo plus nette.");
      }

      setProcessingMessage('Ticket lu avec succès ! Préparation des données...');

      // Construire les lignes nettoyées
      const lines: ReceiptLine[] = (res.lines || []).map((l, idx) => {
        const rawLabel = l.rawLabel || 'Article';
        const normalized = l.normalizedLabel || cleanProductName(rawLabel);
        const normUnit = normalizeUnit(l.quantity, l.unit, rawLabel);

        const lineObj: ReceiptLine = {
          id: l.id || `ln-${Date.now()}-${idx}`,
          rawLabel,
          normalizedLabel: normalized,
          category: l.category || 'Alimentation / Divers',
          quantity: l.quantity && l.quantity > 0 ? l.quantity : 1,
          unit: l.unit || normUnit.stdUnit || 'pcs',
          unitPrice: l.unitPrice,
          lineTotal: l.lineTotal,
          barcode: l.barcode,
          stdUnit: normUnit.stdUnit,
          stdQty: normUnit.stdQty,
        };

        lineObj.standardUnitPrice = computeStandardUnitPrice(lineObj);
        return lineObj;
      });

      // Fusion des doublons évidents sur le ticket
      const mergedMap: Record<string, ReceiptLine> = {};
      lines.forEach((l) => {
        const key = (l.normalizedLabel || l.rawLabel).trim().toLowerCase();
        if (!mergedMap[key]) {
          mergedMap[key] = { ...l };
        } else {
          const ex = mergedMap[key];
          ex.quantity = (ex.quantity || 0) + (l.quantity || 0);
          if (l.lineTotal != null) {
            ex.lineTotal = parseFloat(((ex.lineTotal || 0) + l.lineTotal).toFixed(3));
          }
          if (ex.unitPrice && ex.quantity) {
            ex.lineTotal = parseFloat((ex.unitPrice * ex.quantity).toFixed(3));
          }
        }
      });

      const mergedLines = Object.values(mergedMap);

      const receipt: Receipt = {
        id: `rcpt-${Date.now()}`,
        storeName: res.storeName || 'Magasin Inconnu',
        purchaseAt: (() => {
          // Valider la date renvoyée par l'IA : si absente, invalide,
          // trop ancienne (> 90 jours) ou dans le futur → date d'aujourd'hui
          if (!res.purchaseAt) return new Date().toISOString();
          const parsed = new Date(res.purchaseAt);
          if (isNaN(parsed.getTime())) return new Date().toISOString();
          const now = Date.now();
          const diffMs = now - parsed.getTime();
          const NINETY_DAYS = 90 * 24 * 60 * 60 * 1000;
          if (diffMs > NINETY_DAYS || diffMs < -24 * 60 * 60 * 1000) {
            // Date trop ancienne ou dans le futur → probablement hallucinée
            return new Date().toISOString();
          }
          return parsed.toISOString();
        })(),
        currency: res.currency || 'TND',
        total: res.total || mergedLines.reduce((acc, l) => acc + (l.lineTotal || 0), 0),
        subtotal: res.subtotal,
        taxTotal: res.taxTotal,
        ocrText: res.ocrText,
        status: 'parsed',
        confidence: res.confidence || 0.85,
        lines: mergedLines,
      };

      onReceiptProcessed(receipt);
      setOpen(false);
    } catch (err: any) {
      console.error('Erreur scan reçu:', err);
      setError(err.message || 'Une erreur est survenue lors de la lecture du ticket.');
    } finally {
      setIsProcessing(false);
      setProcessingMessage('');
    }
  }

  function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) {
      processReceiptFile(f);
      e.target.value = '';
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-md p-6 overflow-hidden rounded-2xl">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <ReceiptText className="h-5 w-5" />
            </div>
            <DialogTitle className="text-xl font-bold">Scanner un ticket</DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Photographiez ou importez votre ticket (Carrefour, Monoprix, MG, etc.). L&apos;IA extraira les articles, prix et totaux.
          </DialogDescription>
        </DialogHeader>

        {/* Inputs cachés pour caméra et fichier */}
        <input
          type="file"
          ref={cameraInputRef}
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileSelected}
        />
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*,application/pdf"
          className="hidden"
          onChange={handleFileSelected}
        />

        <div className="py-4">
          {isProcessing ? (
            <div className="flex flex-col items-center justify-center p-8 text-center space-y-4 bg-muted/30 rounded-2xl border border-dashed border-primary/30 animate-pulse">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-sm text-foreground">{processingMessage}</p>
                <p className="text-xs text-muted-foreground">Veuillez patienter quelques secondes...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {error && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-destructive/10 text-destructive text-xs border border-destructive/20">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">{error}</p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="h-28 flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed hover:border-primary hover:bg-primary/5 transition-all text-foreground"
                  onClick={() => cameraInputRef.current?.click()}
                >
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Camera className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-semibold">Prendre une photo</span>
                  <span className="text-[10px] text-muted-foreground">Appareil photo direct</span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="h-28 flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed hover:border-primary hover:bg-primary/5 transition-all text-foreground"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center text-accent-foreground">
                    <UploadCloud className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-semibold">Galerie ou Fichier</span>
                  <span className="text-[10px] text-muted-foreground">Images ou PDF</span>
                </Button>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs">
                <Sparkles className="h-4 w-4 shrink-0 text-blue-500" />
                <p>
                  Les produits détectés seront automatiquement enregistrés dans votre historique et pourront actualiser votre garde-manger.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="sm:justify-end">
          <Button
            type="button"
            variant="ghost"
            disabled={isProcessing}
            onClick={() => setOpen(false)}
            className="rounded-xl text-xs"
          >
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
