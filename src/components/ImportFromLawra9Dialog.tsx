'use client';

import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ShoppingBag, Check, AlertCircle, RefreshCw, ArrowRight, Camera, UploadCloud, Loader2, Sparkles } from 'lucide-react';
import { SmartMatchingService, cleanProductName, mapLawra9Category } from '@/lib/smart-matching';
import { Ingredient, Lawra9ImportData, Lawra9Product, CategoryDef, Receipt } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UploadReceiptDialog } from './UploadReceiptDialog';

interface MatchedProduct {
    raw: Lawra9Product;
    match?: Ingredient;
    confidence: number;
    isSelected: boolean;
    status: 'exact' | 'fuzzy' | 'new';
    targetCategory: string; // The category it will be added to/updated in
}

interface ImportFromLawra9DialogProps {
    allIngredients: Ingredient[];
    categories: CategoryDef[];
    onUpdatePrices: (updates: { id: string; price: number }[]) => void;
    onAddIngredients: (newIngredients: Omit<Ingredient, 'id'>[]) => void;
    onSaveReceipt?: (receipt: Receipt) => void;
}

export function ImportFromLawra9Dialog({ allIngredients, categories, onUpdatePrices, onAddIngredients, onSaveReceipt }: ImportFromLawra9DialogProps) {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState<'input' | 'review'>('input');
    const [jsonInput, setJsonInput] = useState('');
    const [matchedProducts, setMatchedProducts] = useState<MatchedProduct[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    const onCategoryChange = (index: number, newCategory: string) => {
        setMatchedProducts(prev => {
            const next = [...prev];
            next[index] = { ...next[index], targetCategory: newCategory };
            return next;
        });
    };

    const toggleAll = (select: boolean) => {
        setMatchedProducts(prev => prev.map(p => ({ ...p, isSelected: select })));
    };

    const processProductList = async (products: Lawra9Product[], receipt?: Receipt) => {
        try {
            setIsProcessing(true);
            if (receipt && onSaveReceipt) {
                onSaveReceipt(receipt);
            }

            const results = await Promise.all(products.map(async (p) => {
                const { ingredient, confidence } = await SmartMatchingService.findMatch(p.name, allIngredients);

                let status: 'exact' | 'fuzzy' | 'new' = 'new';
                if (confidence === 1) status = 'exact';
                else if (confidence > 0.4) status = 'fuzzy';

                return {
                    raw: { ...p, name: cleanProductName(p.name) },
                    match: ingredient,
                    confidence,
                    isSelected: true,
                    status,
                    targetCategory: ingredient ? ingredient.category : mapLawra9Category(p.category)
                } as MatchedProduct;
            }));

            setMatchedProducts(results);
            setStep('review');
        } catch (e) {
            alert("Erreur lors de l'analyse des produits.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReceiptScanned = (receipt: Receipt) => {
        const products: Lawra9Product[] = (receipt.lines || []).map(ln => ({
            name: ln.normalizedLabel || ln.rawLabel,
            price: ln.unitPrice ?? (ln.lineTotal && ln.quantity ? ln.lineTotal / ln.quantity : 0),
            unit: ln.unit || 'pcs',
            category: ln.category || 'Alimentation / Divers'
        }));

        processProductList(products, receipt);
    };

    const handleProcessJSON = async () => {
        try {
            const data: Lawra9ImportData = JSON.parse(jsonInput);
            if (!data.products || !Array.isArray(data.products)) {
                throw new Error("Format invalide");
            }
            await processProductList(data.products);
        } catch (e) {
            alert("Erreur : Le format du texte collé n'est pas reconnu.");
        }
    };

    const handleImport = async () => {
        const toUpdate: { id: string; price: number }[] = [];
        const toAdd: Omit<Ingredient, 'id'>[] = [];

        for (const m of matchedProducts) {
            if (!m.isSelected) continue;

            if (m.match) {
                toUpdate.push({ id: m.match.id, price: m.raw.price });
                if (m.status === 'fuzzy') {
                    await SmartMatchingService.saveAlias(m.raw.name, m.match.id);
                }
            } else {
                toAdd.push({
                    name: m.raw.name,
                    price: m.raw.price,
                    unit: m.raw.unit,
                    category: m.targetCategory
                });
            }
        }

        if (toUpdate.length > 0) onUpdatePrices(toUpdate);
        if (toAdd.length > 0) onAddIngredients(toAdd);

        setOpen(false);
        setStep('input');
        setJsonInput('');
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="h-11 rounded-full px-5 border-dashed gap-2 hover:bg-accent hover:text-accent-foreground transition-all">
                    <Camera className="h-4 w-4" />
                    <span className="hidden sm:inline">Scanner un ticket</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-2xl">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle className="flex items-center gap-2 text-2xl font-bold">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Sparkles className="h-5 w-5 text-primary" />
                        </div>
                        Scanner & Importer un ticket
                    </DialogTitle>
                    <DialogDescription>
                        {step === 'input'
                            ? "Prenez en photo votre ticket pour extraire les prix et mettre à jour votre garde-manger."
                            : "Vérifiez les correspondances trouvées par l'IA avec vos ingrédients."}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-hidden px-6 py-2">
                    {step === 'input' ? (
                        <div className="space-y-4">
                            {/* Option 1: Scan direct par caméra ou upload */}
                            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-3 text-center flex flex-col items-center justify-center">
                                <h4 className="font-bold text-sm text-foreground">Scan automatique par IA</h4>
                                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                                    Prenez une photo de votre ticket (Carrefour, Monoprix, MG, etc.). L&apos;IA Groq extrait tous les produits.
                                </p>
                                <div className="w-full flex justify-center">
                                    <UploadReceiptDialog onReceiptProcessed={handleReceiptScanned}>
                                        <Button className="w-full sm:w-auto rounded-full gap-2 px-6 shadow-md mx-auto">
                                            <Camera className="h-4 w-4" />
                                            Prendre une photo / Choisir un fichier
                                        </Button>
                                    </UploadReceiptDialog>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="h-px bg-border flex-1" />
                                <span className="text-[11px] font-semibold text-muted-foreground uppercase">Ou coller du JSON</span>
                                <div className="h-px bg-border flex-1" />
                            </div>

                            {/* Option 2: Ancien copier/coller JSON */}
                            <Textarea
                                placeholder="Collez le JSON ici si vous préférez la méthode manuelle..."
                                className="min-h-[120px] font-mono text-xs bg-muted/30 focus:ring-1 rounded-xl"
                                value={jsonInput}
                                onChange={(e) => setJsonInput(e.target.value)}
                            />

                            {jsonInput.trim().length > 0 && (
                                <Button
                                    onClick={handleProcessJSON}
                                    disabled={isProcessing}
                                    className="w-full rounded-xl gap-2"
                                >
                                    {isProcessing && <Loader2 className="h-4 w-4 animate-spin" />}
                                    Analyser le JSON collé
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col h-[500px] overflow-hidden">
                            <div className="flex justify-between items-center mb-4 px-1 flex-shrink-0 gap-2">
                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest truncate">{matchedProducts.length} produits détectés</span>
                                <div className="flex gap-2 shrink-0">
                                    <Button variant="ghost" size="sm" className="h-8 w-8 px-0 sm:w-auto sm:px-3" onClick={() => toggleAll(true)} title="Tout sélectionner">
                                        <div className="flex items-center gap-2">
                                            <Check className="h-4 w-4" />
                                            <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-wider">Tout</span>
                                        </div>
                                    </Button>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 px-0 sm:w-auto sm:px-3" onClick={() => toggleAll(false)} title="Tout désélectionner">
                                        <div className="flex items-center gap-2">
                                            <span className="h-3 w-3 rounded-[2px] border border-current" />
                                            <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-wider">Aucun</span>
                                        </div>
                                    </Button>
                                </div>
                            </div>
                            <ScrollArea className="flex-1 pr-4">
                                <div className="space-y-3">
                                    {matchedProducts.map((p, i) => (
                                        <div
                                            key={i}
                                            className={cn(
                                                "flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer overflow-hidden",
                                                p.isSelected ? "bg-card border-border shadow-sm" : "bg-muted/30 border-transparent opacity-60"
                                            )}
                                            onClick={() => {
                                                const next = [...matchedProducts];
                                                next[i].isSelected = !next[i].isSelected;
                                                setMatchedProducts(next);
                                            }}
                                        >
                                            <div className={cn(
                                                "h-5 w-5 shrink-0 rounded-full flex items-center justify-center border transition-all",
                                                p.isSelected ? "bg-primary border-primary text-white" : "border-muted-foreground"
                                            )}>
                                                {p.isSelected && <Check className="h-3 w-3" />}
                                            </div>

                                            <div className="flex-1 min-w-0 overflow-hidden">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-bold text-sm truncate block">
                                                        {p.match ? p.match.name : p.raw.name}
                                                    </span>
                                                    <div className="flex flex-col sm:flex-row sm:items-center items-end gap-0.5 sm:gap-1.5 ml-auto shrink-0 text-[10px]">
                                                        {p.match && (
                                                            <span className="line-through text-muted-foreground">
                                                                {p.match.price.toFixed(3)} DT
                                                            </span>
                                                        )}
                                                        <span className="font-black text-primary">
                                                            {p.raw.price.toFixed(3)} DT
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 text-xs">
                                                    <span className={cn(
                                                        "text-[9px] px-1.5 py-0.5 rounded font-black tracking-wider uppercase",
                                                        p.status === 'exact' && "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
                                                        p.status === 'fuzzy' && "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
                                                        p.status === 'new' && "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300"
                                                    )}>
                                                        {p.status === 'exact' ? 'Exact' : p.status === 'fuzzy' ? 'Ressemblant' : 'Nouveau'}
                                                    </span>

                                                    {p.status === 'new' && (
                                                        <div className="ml-auto" onClick={(e) => e.stopPropagation()}>
                                                            <Select
                                                                value={p.targetCategory}
                                                                onValueChange={(val) => onCategoryChange(i, val)}
                                                            >
                                                                <SelectTrigger className="h-6 text-[10px] px-2 py-0 min-w-[110px] rounded-lg">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent className="max-h-[200px]">
                                                                    {categories.map(c => (
                                                                        <SelectItem key={c.id} value={c.name} className="text-xs">
                                                                            {c.name}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    )}
                </div>

                <DialogFooter className="p-4 bg-muted/20 border-t flex items-center justify-between">
                    {step === 'review' ? (
                        <>
                            <Button variant="ghost" onClick={() => setStep('input')} className="rounded-xl text-xs">
                                Retour
                            </Button>
                            <Button onClick={handleImport} className="rounded-xl gap-2 text-xs">
                                Importer la sélection ({matchedProducts.filter(p => p.isSelected).length})
                                <ArrowRight className="h-3.5 w-3.5" />
                            </Button>
                        </>
                    ) : (
                        <Button variant="ghost" onClick={() => setOpen(false)} className="rounded-xl text-xs ml-auto">
                            Fermer
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
