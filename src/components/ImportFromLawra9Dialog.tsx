
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ShoppingBag, Check, AlertCircle, RefreshCw, ArrowRight } from 'lucide-react';
import { SmartMatchingService } from '@/lib/smart-matching';
import { Ingredient, Lawra9ImportData, Lawra9Product } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MatchedProduct {
    raw: Lawra9Product;
    match?: Ingredient;
    confidence: number;
    isSelected: boolean;
    status: 'exact' | 'fuzzy' | 'new';
}

interface ImportFromLawra9DialogProps {
    allIngredients: Ingredient[];
    onUpdatePrices: (updates: { id: string; price: number }[]) => void;
    onAddIngredients: (newIngredients: Omit<Ingredient, 'id'>[]) => void;
}

export function ImportFromLawra9Dialog({ allIngredients, onUpdatePrices, onAddIngredients }: ImportFromLawra9DialogProps) {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState<'input' | 'review'>('input');
    const [jsonInput, setJsonInput] = useState('');
    const [matchedProducts, setMatchedProducts] = useState<MatchedProduct[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleProcessJSON = async () => {
        try {
            setIsProcessing(true);
            const data: Lawra9ImportData = JSON.parse(jsonInput);

            if (!data.products || !Array.isArray(data.products)) {
                throw new Error("Format invalide");
            }

            const results = await Promise.all(data.products.map(async (p) => {
                const { ingredient, confidence } = await SmartMatchingService.findMatch(p.name, allIngredients);

                let status: 'exact' | 'fuzzy' | 'new' = 'new';
                if (confidence === 1) status = 'exact';
                else if (confidence > 0.4) status = 'fuzzy';

                return {
                    raw: p,
                    match: ingredient,
                    confidence,
                    isSelected: true,
                    status
                } as MatchedProduct;
            }));

            setMatchedProducts(results);
            setStep('review');
        } catch (e) {
            alert("Erreur : Le format du texte collé n'est pas reconnu.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleImport = async () => {
        const toUpdate: { id: string; price: number }[] = [];
        const toAdd: Omit<Ingredient, 'id'>[] = [];

        for (const m of matchedProducts) {
            if (!m.isSelected) continue;

            if (m.match) {
                toUpdate.push({ id: m.match.id, price: m.raw.price });
                // Enregistrer l'alias si c'était une recherche floue
                if (m.status === 'fuzzy') {
                    await SmartMatchingService.saveAlias(m.raw.name, m.match.id);
                }
            } else {
                toAdd.push({
                    name: m.raw.name,
                    price: m.raw.price,
                    unit: m.raw.unit,
                    category: m.raw.category
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
                    <ShoppingBag className="h-4 w-4" />
                    <span className="hidden sm:inline">Importer de Lawra9</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle className="flex items-center gap-2 text-2xl font-bold">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <ShoppingBag className="h-5 w-5 text-primary" />
                        </div>
                        Importation intelligente
                    </DialogTitle>
                    <DialogDescription>
                        {step === 'input'
                            ? "Collez ici les données exportées depuis Lawra9 pour mettre à jour vos prix."
                            : "Vérifiez les correspondances trouvées par l'IA."}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-hidden px-6 py-2">
                    {step === 'input' ? (
                        <div className="space-y-4">
                            <Textarea
                                placeholder="Collez le JSON ici..."
                                className="min-h-[300px] font-mono text-xs bg-muted/30 focus:ring-1"
                                value={jsonInput}
                                onChange={(e) => setJsonInput(e.target.value)}
                            />
                            <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs">
                                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                                <p>Dans Lawra9, cliquez sur le bouton 🛒 d'un ticket pour copier les données, puis collez-les ici.</p>
                            </div>
                        </div>
                    ) : (
                        <ScrollArea className="h-[450px] pr-4">
                            <div className="space-y-3">
                                {matchedProducts.map((p, i) => (
                                    <div
                                        key={i}
                                        className={cn(
                                            "flex items-center gap-4 p-3 rounded-xl border transition-all cursor-pointer",
                                            p.isSelected ? "bg-card border-border shadow-sm" : "bg-muted/30 border-transparent opacity-60"
                                        )}
                                        onClick={() => {
                                            const next = [...matchedProducts];
                                            next[i].isSelected = !next[i].isSelected;
                                            setMatchedProducts(next);
                                        }}
                                    >
                                        <div className={cn(
                                            "h-5 w-5 rounded-full flex items-center justify-center border transition-all",
                                            p.isSelected ? "bg-primary border-primary text-white" : "border-muted-foreground"
                                        )}>
                                            {p.isSelected && <Check className="h-3 w-3" />}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-bold text-sm truncate">{p.raw.name}</span>
                                                <span className="text-xs font-mono bg-secondary px-1.5 py-0.5 rounded text-secondary-foreground">
                                                    {p.raw.price.toFixed(3)}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                {p.match ? (
                                                    <>
                                                        <ArrowRight className="h-3 w-3" />
                                                        <span className={cn(
                                                            "font-medium px-2 py-0.5 rounded-full",
                                                            p.status === 'exact' ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                                                        )}>
                                                            {p.match.name}
                                                        </span>
                                                        {p.status === 'fuzzy' && <span className="italic">(Suggéré)</span>}
                                                    </>
                                                ) : (
                                                    <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded-full font-medium">✨ Nouveau produit</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    )}
                </div>

                <DialogFooter className="p-6 bg-muted/20 border-t">
                    {step === 'input' ? (
                        <>
                            <Button variant="ghost" onClick={() => setOpen(false)}>Annuler</Button>
                            <Button
                                disabled={!jsonInput || isProcessing}
                                onClick={handleProcessJSON}
                                className="px-8 shadow-lg shadow-primary/20"
                            >
                                {isProcessing ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Analyser les données
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="ghost" onClick={() => setStep('input')}>Retour</Button>
                            <Button onClick={handleImport} className="px-8 shadow-lg shadow-primary/20 font-bold">
                                Mettre à jour {matchedProducts.filter(m => m.isSelected).length} produits
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
