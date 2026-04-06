'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { TrendingDown, Search, Store, Calendar, ArrowUpDown, Filter, AlertCircle, RefreshCw, Zap, Trash2, X, BarChart3 } from 'lucide-react';
import { listenCommunityPurchases, deleteCommunityPurchase } from '@/lib/firestore-sync';
import { useAuth } from '@/context/AuthContext';
import type { CommunityPurchase } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { StoreIcon, StoreOption } from './StoreIcon';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

interface IngredientPriceStats {
    ingredientName: string;
    normalizedName: string;
    avgPrice: number;
    unit: string;
    count: number;
    stores: string[];
    minPrice: number;
    maxPrice: number;
}

interface StoreStat {
    store: string;
    uniqueItems: number;
    avgPricePerItem: number;
    topItems: Array<{ name: string; avgPrice: number; count: number; unit: string }>;
}

export default function MarketPricesView() {
    const { user } = useAuth();
    const [purchases, setPurchases] = useState<CommunityPurchase[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStore, setSelectedStore] = useState<string>('all');
    const [sortBy, setSortBy] = useState<'date' | 'price'>('date');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'all' | 'byStore'>('all');

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
                
                const typedData = data as CommunityPurchase[];
                const storeNameMap = new Map<string, string>();
                
                // Normaliser les noms de magasins (regrouper les mêmes enseignes avec des casses différentes)
                typedData.forEach(p => {
                    if (p.store) {
                        const cleanStoreName = p.store.trim().replace(/\s+/g, ' ');
                        const normalized = cleanStoreName.toLowerCase();

                        if (!storeNameMap.has(normalized)) {
                            storeNameMap.set(normalized, cleanStoreName);
                        } else {
                            const existing = storeNameMap.get(normalized)!;
                            // Préférer la version avec une majuscule au début
                            if (cleanStoreName[0] && cleanStoreName[0] === cleanStoreName[0].toUpperCase() && existing[0] && existing[0] === existing[0].toLowerCase()) {
                                storeNameMap.set(normalized, cleanStoreName);
                            }
                        }
                    }
                });
                
                const normalizedData = typedData.map(p => {
                    if (p.store) {
                        const cleanStoreName = p.store.trim().replace(/\s+/g, ' ');
                        const normalized = cleanStoreName.toLowerCase();
                        return { ...p, store: storeNameMap.get(normalized) || cleanStoreName };
                    }
                    return p;
                });

                setPurchases(normalizedData);
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Compute price statistics for ingredients
    const ingredientStats = useMemo(() => {
        const statsMap = new Map<string, IngredientPriceStats>();

        purchases.forEach(p => {
            const key = `${p.normalizedName || p.ingredientName}|${p.unit}`;
            const existing = statsMap.get(key);

            if (existing) {
                existing.count += 1;
                existing.avgPrice = (existing.avgPrice * (existing.count - 1) + p.price) / existing.count;
                existing.minPrice = Math.min(existing.minPrice, p.price);
                existing.maxPrice = Math.max(existing.maxPrice, p.price);
                if (p.store && !existing.stores.includes(p.store)) {
                    existing.stores.push(p.store);
                }
            } else {
                statsMap.set(key, {
                    ingredientName: p.ingredientName,
                    normalizedName: p.normalizedName || p.ingredientName,
                    avgPrice: p.price,
                    unit: p.unit,
                    count: 1,
                    stores: p.store ? [p.store] : [],
                    minPrice: p.price,
                    maxPrice: p.price,
                });
            }
        });

        return Array.from(statsMap.values());
    }, [purchases]);

    // Compute store statistics for "by store" view
    const storeStats = useMemo(() => {
        const stats = new Map<string, StoreStat>();
        const ingredientsByStore = new Map<string, Map<string, { prices: number[]; count: number; unit: string }>>();

        purchases.forEach(p => {
            const store = p.store || 'Sans magasin';

            if (!stats.has(store)) {
                stats.set(store, {
                    store,
                    uniqueItems: 0,
                    avgPricePerItem: 0,
                    topItems: [],
                });
                ingredientsByStore.set(store, new Map());
            }

            const storeIngredients = ingredientsByStore.get(store)!;
            const key = p.normalizedName || p.ingredientName;

            if (!storeIngredients.has(key)) {
                storeIngredients.set(key, { prices: [], count: 0, unit: p.unit });
            }

            const ing = storeIngredients.get(key)!;
            ing.prices.push(p.price);
            ing.count += 1;
        });

        // Calculate stats for each store
        ingredientsByStore.forEach((ingredients, store) => {
            let totalPrice = 0;
            const topItems: Array<{ name: string; avgPrice: number; count: number; unit: string }> = [];

            ingredients.forEach((data, name) => {
                const avgPrice = data.prices.reduce((a, b) => a + b, 0) / data.prices.length;
                totalPrice += avgPrice;
                topItems.push({
                    name,
                    avgPrice,
                    count: data.count,
                    unit: data.unit,
                });
            });

            topItems.sort((a, b) => b.count - a.count);

            const stat = stats.get(store)!;
            stat.uniqueItems = ingredients.size;
            stat.avgPricePerItem = totalPrice / ingredients.size;
            stat.topItems = topItems.slice(0, 5);
        });

        return Array.from(stats.values()).sort((a, b) => b.uniqueItems - a.uniqueItems);
    }, [purchases]);

    const filteredPurchases = useMemo(() => {
        if (viewMode === 'byStore') {
            return [];  // Not used in byStore mode
        }

        console.log('[MarketView] Raw purchases from Firestore:', purchases.length);
        const filtered = purchases
            .filter(p => {
                const searchLower = searchQuery.toLowerCase();
                const nameToSearch = (p.normalizedName || p.ingredientName || '').toLowerCase();
                const matchesSearch = nameToSearch.includes(searchLower) || (p.store || '').toLowerCase().includes(searchLower);
                const matchesStore = selectedStore === 'all' || p.store === selectedStore;
                return matchesSearch && matchesStore;
            })
            .sort((a, b) => {
                if (sortBy === 'price') return a.price - b.price;
                return new Date(b.date).getTime() - new Date(a.date).getTime();
            });

        // Group by normalized name (avoid duplicates)
        const map = new Map<string, typeof filtered[0]>();
        filtered.forEach(p => {
            const key = p.normalizedName || p.ingredientName;
            const existing = map.get(key);
            if (!existing || new Date(p.date) > new Date(existing.date)) {
                map.set(key, p);
            }
        });
        const result = Array.from(map.values());
        console.log('[MarketView] Final displayed items count:', result.length);
        return result;
    }, [purchases, searchQuery, selectedStore, sortBy, viewMode]);

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
                        Live Feed
                    </div>
                    <h2 className="text-4xl lg:text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-600 to-indigo-600">
                        Prix du Marché
                    </h2>
                    <p className="text-muted-foreground text-sm sm:text-base max-w-xl font-medium leading-tight">
                        Comparez les prix réels payés par la communauté pour optimiser vos économies.
                    </p>
                </div>

                {purchases.length > 0 && (
                    <div className="flex items-center gap-2 text-sm font-semibold text-primary bg-primary/5 px-4 py-2 rounded-2xl border border-primary/10">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        {purchases.length} partages
                    </div>
                )}
            </div>

            {/* Compact Filter Bar */}
            <div className="bg-card/40 backdrop-blur-xl p-1.5 rounded-3xl border border-border/50 shadow-xl shadow-primary/5 ring-1 ring-white/10 sticky top-[69px] z-20 md:static">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-1.5">
                    {viewMode === 'all' && (
                        <>
                            <div className="relative md:col-span-2 group">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <Input
                                    placeholder="Rechercher..."
                                    className="h-10 sm:h-12 pl-10 rounded-2xl bg-background/50 border-none focus-visible:ring-2 focus-visible:ring-primary/20 text-sm font-medium transition-all"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-2 md:col-span-2 gap-1.5">
                                <Select value={selectedStore} onValueChange={setSelectedStore}>
                                    <SelectTrigger className="h-10 sm:h-12 rounded-2xl bg-background/50 border-none px-3 font-bold text-xs focus:ring-1 focus:ring-primary/20 transition-all">
                                        <div className="flex items-center gap-1.5 truncate">
                                            <Store className="h-3.5 w-3.5 text-primary shrink-0" />
                                            <span className="truncate max-w-[70px] sm:max-w-none">
                                                {selectedStore === 'all' ? 'Magasins' : selectedStore}
                                            </span>
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-border/50 shadow-2xl">
                                        <SelectItem value="all">Tous les magasins</SelectItem>
                                        {stores.map(store => (
                                            <SelectItem key={store} value={store}>
                                                <StoreOption storeName={store} />
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                                    <SelectTrigger className="h-10 sm:h-12 rounded-2xl bg-background/50 border-none px-3 font-bold text-xs focus:ring-1 focus:ring-primary/20 transition-all">
                                        <div className="flex items-center gap-1.5 truncate">
                                            <ArrowUpDown className="h-3.5 w-3.5 text-primary shrink-0" />
                                            <span className="truncate">
                                                {sortBy === 'date' ? 'Récents' : 'Prix bas'}
                                            </span>
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-border/50 shadow-2xl">
                                        <SelectItem value="date">Récents</SelectItem>
                                        <SelectItem value="price">Prix bas</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </>
                    )}
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
            ) : (
                <>
                    {/* View Mode Toggle */}
                    <div className="flex gap-2 mb-6">
                        <Button
                            onClick={() => setViewMode('all')}
                            variant={viewMode === 'all' ? 'default' : 'outline'}
                            className="rounded-full gap-2"
                            size="sm"
                        >
                            <TrendingDown className="h-4 w-4" />
                            Tous les prix
                        </Button>
                        <Button
                            onClick={() => setViewMode('byStore')}
                            variant={viewMode === 'byStore' ? 'default' : 'outline'}
                            className="rounded-full gap-2"
                            size="sm"
                        >
                            <BarChart3 className="h-4 w-4" />
                            Par magasin
                        </Button>
                    </div>

                    {viewMode === 'all' ? (
                        // All Prices View
                        filteredPurchases.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-500">
                                {filteredPurchases.map((purchase) => {
                                    const isOwner = user && purchase.userId === user.uid;

                                    return (
                                        <Card
                                            key={purchase.id}
                                            className="overflow-hidden border-border/20 bg-gradient-to-br from-white to-zinc-50/50 dark:from-zinc-900 dark:to-zinc-950/50 backdrop-blur-md rounded-3xl hover:ring-2 hover:ring-primary/20 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 group relative"
                                        >
                                            {/* Owner badge */}
                                            {isOwner && (
                                                <div className="absolute top-3 right-10 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[8px] font-black uppercase tracking-wider z-10 border border-primary/20">
                                                    Moi
                                                </div>
                                            )}

                                            {/* Delete button for owner */}
                                            {isOwner && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setPurchaseToDelete(purchase);
                                                    }}
                                                    className="absolute top-3 right-3 h-6 w-6 flex items-center justify-center rounded-full bg-destructive/10 text-destructive opacity-0 group-hover:opacity-100 transition-all hover:bg-destructive hover:text-destructive-foreground z-20"
                                                    title="Retirer"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </button>
                                            )}

                                            <CardHeader className="p-4 sm:p-5 pb-2 flex flex-row items-start justify-between space-y-0">
                                                <div className="space-y-2 min-w-0 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-8 w-8 shrink-0 flex items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform duration-500">
                                                            <TrendingDown className="h-4 w-4" />
                                                        </div>
                                                        <div className="flex flex-col min-w-0">
                                                            <CardTitle className="text-base sm:text-lg font-bold tracking-tight whitespace-normal break-words group-hover:text-primary transition-colors">
                                                                {purchase.ingredientName}
                                                            </CardTitle>
                                                            <CardDescription className="flex items-center gap-1 font-semibold text-[10px] sm:text-xs text-primary/80">
                                                                <Calendar className="h-3 w-3" />
                                                                {formatRelativeDate(purchase.date)}
                                                            </CardDescription>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right flex flex-col items-end pt-0.5 ml-2">
                                                    <div className="text-lg sm:text-2xl font-black text-foreground group-hover:text-primary transition-colors whitespace-nowrap">
                                                        {purchase.price.toFixed(3)}
                                                        <span className="text-[10px] font-black ml-0.5 text-muted-foreground italic">DT</span>
                                                    </div>
                                                    <Badge variant="secondary" className="mt-0.5 rounded-full px-2 py-0 text-[8px] font-black uppercase tracking-wider bg-zinc-200 dark:bg-zinc-800 border-none">
                                                        / {purchase.unit}
                                                    </Badge>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="p-4 sm:p-5 pt-0">
                                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/10">
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        {purchase.store ? (
                                                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-background/50 backdrop-blur-sm rounded-xl border border-border/20 shadow-sm min-w-0">
                                                                <StoreIcon storeName={purchase.store} size="xs" />
                                                                <span className="text-[10px] sm:text-xs font-bold tracking-tight truncate">{purchase.store}</span>
                                                            </div>
                                                        ) : (
                                                            <div className="text-[10px] text-muted-foreground/60 italic font-medium">Magasin non précisé</div>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col items-end shrink-0">
                                                        <span className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest leading-none">Quantité</span>
                                                        <span className="text-sm sm:text-lg font-bold leading-tight">× {purchase.quantity}</span>
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
                        )
                    ) : (
                        // By Store View
                        storeStats.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
                                {storeStats.map((store) => (
                                    <Card
                                        key={store.store}
                                        className="overflow-hidden border-border/20 bg-gradient-to-br from-white to-zinc-50/50 dark:from-zinc-900 dark:to-zinc-950/50 backdrop-blur-md rounded-3xl hover:ring-2 hover:ring-primary/20 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 group"
                                    >
                                        <CardHeader className="p-4 sm:p-5 pb-3">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <StoreIcon storeName={store.store} size="sm" />
                                                    <div className="min-w-0 flex-1">
                                                        <CardTitle className="text-base sm:text-lg font-bold tracking-tight truncate group-hover:text-primary transition-colors">
                                                            {store.store}
                                                        </CardTitle>
                                                        <CardDescription className="text-xs font-medium">
                                                            {store.uniqueItems} articles différents
                                                        </CardDescription>
                                                    </div>
                                                </div>
                                                <div className="rounded-lg bg-primary/10 px-2.5 py-1 text-center shrink-0">
                                                    <div className="text-xs font-bold text-muted-foreground">Moy.</div>
                                                    <div className="text-sm font-black text-primary">
                                                        {store.avgPricePerItem.toFixed(2)} DT
                                                    </div>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-4 sm:p-5 pt-0">
                                            <div className="space-y-2">
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Articles populaires</p>
                                                <div className="space-y-1.5">
                                                    {store.topItems.map((item) => (
                                                        <div key={item.name} className="flex items-center justify-between p-2 rounded-lg bg-background/50 border border-border/10 group/item hover:border-primary/30 transition-all">
                                                            <div className="min-w-0 flex-1">
                                                                <p className="text-xs font-bold truncate text-foreground group-hover/item:text-primary transition-colors">
                                                                    {item.name}
                                                                </p>
                                                                <p className="text-[9px] text-muted-foreground/60">
                                                                    {item.count} contribution{item.count > 1 ? 's' : ''}
                                                                </p>
                                                            </div>
                                                            <div className="text-right shrink-0 ml-2">
                                                                <p className="text-sm font-black text-foreground">
                                                                    {item.avgPrice.toFixed(3)}
                                                                </p>
                                                                <p className="text-[8px] text-muted-foreground/60">/ {item.unit}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-32 text-center space-y-8 bg-card/10 backdrop-blur-sm rounded-[3rem] border border-dashed border-border/10 animate-in zoom-in duration-500">
                                <div className="h-24 w-24 bg-gradient-to-br from-primary/20 to-primary/5 rounded-[2.5rem] flex items-center justify-center rotate-12 shadow-inner ring-1 ring-primary/20">
                                    <BarChart3 className="h-10 w-10 text-primary opacity-40 -rotate-12" />
                                </div>
                                <div className="space-y-3 max-w-sm">
                                    <h3 className="text-2xl font-black tracking-tight">Aucune donnée par magasin</h3>
                                    <p className="text-muted-foreground text-sm font-medium leading-relaxed">
                                        Pas assez d&apos;informations pour afficher les statistiques par magasin.
                                    </p>
                                </div>
                            </div>
                        )
                    )}
                </>
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
