'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { TrendingDown, Search, Store, Calendar, ArrowUpDown, Filter, AlertCircle, RefreshCw, Zap, Trash2, X } from 'lucide-react';
import { listenCommunityPurchases, deleteCommunityPurchase } from '@/lib/firestore-sync';
import { useAuth } from '@/context/AuthContext';
import type { CommunityPurchase } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { StoreIcon } from './StoreIcon';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

export default function MarketPricesView() {
    const { user } = useAuth();
    const [purchases, setPurchases] = useState<CommunityPurchase[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStore, setSelectedStore] = useState<string>('all');
    const [sortBy, setSortBy] = useState<'date' | 'price'>('date');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Deletion states
    const [purchaseToDelete, setPurchaseToDelete] = useState<CommunityPurchase | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        let isMounted = true;
        setLoading(true);
        setError(null);

        // Tentative de connexion au flux temps réel
        try {
            const unsubscribe = listenCommunityPurchases((data) => {
                if (!isMounted) return;
                setPurchases(data as CommunityPurchase[]);
                setLoading(false);
                setError(null);
            });

            // Sécurité : si on n'a rien reçu après 10 secondes, on arrête le chargement (éventuellement vide)
            const timeoutId = setTimeout(() => {
                if (isMounted && loading) {
                    setLoading(false);
                }
            }, 10000);

            return () => {
                isMounted = false;
                unsubscribe();
                clearTimeout(timeoutId);
            };
        } catch (err) {
            console.error("Firestore initialization error:", err);
            if (isMounted) {
                setError("Impossible de charger le flux communautaire. Vérifiez votre connexion.");
                setLoading(false);
            }
        }
    }, []);

    const filteredPurchases = useMemo(() => {
        return purchases
            .filter(p => {
                const searchLower = searchQuery.toLowerCase();
                const matchesSearch = p.ingredientName.toLowerCase().includes(searchLower) || (p.store || '').toLowerCase().includes(searchLower);
                const matchesStore = selectedStore === 'all' || p.store === selectedStore;
                return matchesSearch && matchesStore;
            })
            .sort((a, b) => {
                if (sortBy === 'price') {
                    return a.price - b.price;
                }
                return new Date(b.date).getTime() - new Date(a.date).getTime();
            });
    }, [purchases, searchQuery, selectedStore, sortBy]);

    const stores = useMemo(() => {
        const s = new Set<string>();
        purchases.forEach(p => {
            if (p.store) s.add(p.store);
        });
        return Array.from(s).sort();
    }, [purchases]);

    const formatRelativeDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInMins = Math.floor(diffInMs / (1000 * 60));
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

        if (diffInMins < 5) return "À l'instant";
        if (diffInMins < 60) return `Il y a ${diffInMins} min`;
        if (diffInHours < 24) return `Il y a ${diffInHours}h`;
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays === 1) return "Hier";
        return `Il y a ${diffInDays} jours`;
    };

    const handleDelete = async () => {
        if (!purchaseToDelete) return;

        setIsDeleting(true);
        try {
            await deleteCommunityPurchase(purchaseToDelete.id);
            setPurchaseToDelete(null);
        } catch (err) {
            alert("Erreur lors de la suppression. Veuillez réessayer.");
        } finally {
            setIsDeleting(false);
        }
    };

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-in zoom-in duration-300">
                <div className="bg-destructive/10 p-4 rounded-full mb-4">
                    <AlertCircle className="h-10 w-10 text-destructive" />
                </div>
                <h3 className="text-xl font-bold mb-2">Oups ! Une erreur est survenue</h3>
                <p className="text-muted-foreground mb-6 max-w-sm">{error}</p>
                <Button onClick={() => window.location.reload()} className="rounded-2xl gap-2 shadow-lg shadow-primary/20">
                    <RefreshCw className="h-4 w-4" /> Réessayer
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 lg:py-12 space-y-8 max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header with gradient and badge */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wider uppercase border border-primary/20">
                        <Zap className="h-3 w-3 fill-current" />
                        Live Community Feed
                    </div>
                    <h2 className="text-4xl lg:text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-600 to-indigo-600">
                        Prix du Marché
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-2xl font-medium leading-relaxed">
                        Consultez les prix réels payés par les membres de la communauté aujourd'hui pour faire de meilleures économies.
                    </p>
                </div>

                {purchases.length > 0 && (
                    <div className="flex items-center gap-2 text-sm font-semibold text-primary bg-primary/5 px-4 py-2 rounded-2xl border border-primary/10">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        {purchases.length} contributions partagées
                    </div>
                )}
            </div>

            {/* Premium Search & Filter Bar */}
            <div className="bg-card/40 backdrop-blur-xl p-2 rounded-[2.5rem] border border-border/50 shadow-2xl shadow-primary/5 ring-1 ring-white/10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                    <div className="relative md:col-span-2 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Produit, ingrédient ou magasin..."
                            className="h-14 pl-12 rounded-[2rem] bg-background/50 border-none focus-visible:ring-2 focus-visible:ring-primary/20 text-lg font-medium placeholder:text-muted-foreground/50 transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-2">
                        <Select value={selectedStore} onValueChange={setSelectedStore}>
                            <SelectTrigger className="h-14 rounded-[2rem] bg-background/50 border-none px-6 font-semibold focus:ring-2 focus:ring-primary/20 transition-all">
                                <div className="flex items-center gap-2">
                                    <Store className="h-4 w-4 text-primary" />
                                    <SelectValue placeholder="Magasin" />
                                </div>
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-border/50 shadow-2xl">
                                <SelectItem value="all">Tous les magasins</SelectItem>
                                {stores.map(store => (
                                    <SelectItem key={store} value={store}>{store}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                            <SelectTrigger className="h-14 rounded-[2rem] bg-background/50 border-none px-6 font-semibold focus:ring-2 focus:ring-primary/20 transition-all">
                                <div className="flex items-center gap-2">
                                    <ArrowUpDown className="h-4 w-4 text-primary" />
                                    <SelectValue placeholder="Tri" />
                                </div>
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-border/50 shadow-2xl">
                                <SelectItem value="date">Les plus récents</SelectItem>
                                <SelectItem value="price">Prix le plus bas</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 space-y-6">
                    <div className="relative">
                        <div className="h-20 w-20 rounded-full border-4 border-primary/10 border-t-primary animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <TrendingDown className="h-8 w-8 text-primary animate-pulse" />
                        </div>
                    </div>
                    <div className="space-y-1 text-center">
                        <p className="text-xl font-bold tracking-tight">Synchronisation communautaire...</p>
                        <p className="text-muted-foreground animate-pulse font-medium">Récupération des derniers prix en temps réel</p>
                    </div>
                </div>
            ) : filteredPurchases.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-500">
                    {filteredPurchases.map((purchase) => {
                        const isOwner = user && purchase.userId === user.uid;

                        return (
                            <Card
                                key={purchase.id}
                                className="overflow-hidden border-border/20 bg-gradient-to-br from-white to-zinc-50/50 dark:from-zinc-900 dark:to-zinc-950/50 backdrop-blur-md rounded-[2.5rem] hover:ring-2 hover:ring-primary/20 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 group relative"
                            >
                                {/* Owner badge */}
                                {isOwner && (
                                    <div className="absolute top-4 right-12 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] font-black uppercase tracking-wider z-10 border border-primary/20">
                                        Ma Contribution
                                    </div>
                                )}

                                {/* Delete button for owner */}
                                {isOwner && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setPurchaseToDelete(purchase);
                                        }}
                                        className="absolute top-4 right-4 h-7 w-7 flex items-center justify-center rounded-full bg-destructive/10 text-destructive opacity-0 group-hover:opacity-100 transition-all hover:bg-destructive hover:text-destructive-foreground z-20"
                                        title="Retirer ma contribution"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                )}

                                {/* Accent line on top */}
                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                <CardHeader className="p-8 pb-4 flex flex-row items-start justify-between space-y-0">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <div className="h-10 w-10 flex items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-transform group-hover:scale-110 duration-500">
                                                <TrendingDown className="h-5 w-5" />
                                            </div>
                                            <div className="flex flex-col">
                                                <CardTitle className="text-xl font-bold tracking-tight group-hover:text-primary transition-colors">
                                                    {purchase.ingredientName}
                                                </CardTitle>
                                                <CardDescription className="flex items-center gap-1.5 font-bold text-primary/80">
                                                    <Calendar className="h-4 w-4" />
                                                    {formatRelativeDate(purchase.date)}
                                                </CardDescription>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right flex flex-col items-end pt-1">
                                        <div className="text-3xl font-black text-foreground group-hover:text-primary transition-colors">
                                            {purchase.price.toFixed(3)}
                                            <span className="text-sm font-black ml-1 text-muted-foreground italic">DT</span>
                                        </div>
                                        <Badge variant="secondary" className="mt-1 rounded-full px-3 py-0.5 text-[10px] font-black uppercase tracking-widest bg-zinc-200 dark:bg-zinc-800 border-none">
                                            Par {purchase.unit}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-8 pt-0">
                                    <div className="flex items-center justify-between mt-6 pt-6 border-t border-border/10">
                                        <div className="flex items-center gap-3">
                                            {purchase.store ? (
                                                <div className="flex items-center gap-2 px-4 py-2 bg-background/50 backdrop-blur-sm rounded-2xl border border-border/20 shadow-sm transition-transform group-hover:translate-x-1 duration-500">
                                                    <StoreIcon storeName={purchase.store} size="sm" />
                                                    <span className="text-sm font-bold tracking-tight">{purchase.store}</span>
                                                </div>
                                            ) : (
                                                <div className="text-sm text-muted-foreground/60 italic font-medium px-4 py-2">Magasin non précisé</div>
                                            )}
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">Achat groupé</span>
                                            <span className="text-lg font-bold">× {purchase.quantity}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-32 text-center space-y-8 bg-card/10 backdrop-blur-sm rounded-[3rem] border border-dashed border-border/10 animate-in zoom-in duration-500">
                    <div className="h-24 w-24 bg-gradient-to-br from-primary/20 to-primary/5 rounded-[2.5rem] flex items-center justify-center rotate-12 shadow-inner ring-1 ring-primary/20">
                        <TrendingDown className="h-10 w-10 text-primary opacity-40 -rotate-12" />
                    </div>
                    <div className="space-y-3 max-w-sm">
                        <h3 className="text-2xl font-black tracking-tight">Aucun prix détecté</h3>
                        <p className="text-muted-foreground text-sm font-medium leading-relaxed">
                            Le flux communautaire est actuellement vide pour cette recherche.
                            <br />Soyez le premier à partager vos trouvailles lors de votre prochain achat !
                        </p>
                    </div>
                    <Button variant="outline" className="rounded-2xl border-primary/20 hover:bg-primary/5 font-bold" onClick={() => setSearchQuery('')}>
                        Voir tout le fil
                    </Button>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!purchaseToDelete} onOpenChange={(open) => !open && !isDeleting && setPurchaseToDelete(null)}>
                <DialogContent className="rounded-[2rem] max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black flex items-center gap-2">
                            <AlertCircle className="h-6 w-6 text-destructive" />
                            Retirer le prix ?
                        </DialogTitle>
                        <DialogDescription className="font-medium pt-2 leading-relaxed">
                            Êtes-vous sûr de vouloir retirer votre contribution pour <strong>{purchaseToDelete?.ingredientName}</strong> ?
                            Celle-ci disparaîtra du flux pour tout le monde.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex flex-row gap-2 mt-6">
                        <Button
                            variant="ghost"
                            className="flex-1 h-12 rounded-xl font-bold"
                            disabled={isDeleting}
                            onClick={() => setPurchaseToDelete(null)}
                        >
                            Annuler
                        </Button>
                        <Button
                            variant="destructive"
                            className="flex-1 h-12 rounded-xl font-bold shadow-lg shadow-destructive/20"
                            disabled={isDeleting}
                            onClick={handleDelete}
                        >
                            {isDeleting ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Retirer"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
