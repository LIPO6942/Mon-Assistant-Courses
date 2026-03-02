
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { TrendingDown, Search, Store, Calendar, ArrowUpDown, Filter } from 'lucide-react';
import { listenCommunityPurchases } from '@/lib/firestore-sync';
import type { CommunityPurchase } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { StoreIcon } from './StoreIcon';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function MarketPricesView() {
    const [purchases, setPurchases] = useState<CommunityPurchase[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStore, setSelectedStore] = useState<string>('all');
    const [sortBy, setSortBy] = useState<'date' | 'price'>('date');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = listenCommunityPurchases((data) => {
            setPurchases(data as CommunityPurchase[]);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const filteredPurchases = useMemo(() => {
        return purchases
            .filter(p => {
                const matchesSearch = p.ingredientName.toLowerCase().includes(searchQuery.toLowerCase());
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
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

        if (diffInHours < 1) return "À l'instant";
        if (diffInHours < 24) return `Il y a ${diffInHours}h`;
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays === 1) return "Hier";
        return `Il y a ${diffInDays} jours`;
    };

    return (
        <div className="container mx-auto px-4 py-6 space-y-6 max-w-4xl animate-in fade-in duration-500">
            <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-bold flex items-center gap-2 text-primary">
                    <TrendingDown className="h-6 w-6" />
                    Prix du Marché
                </h2>
                <p className="text-muted-foreground text-sm">
                    Consultez les prix payés par la communauté en temps réel pour optimiser vos courses.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="relative md:col-span-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher un produit..."
                        className="pl-10 rounded-2xl bg-card border-border/50"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <Select value={selectedStore} onValueChange={setSelectedStore}>
                    <SelectTrigger className="rounded-2xl bg-card border-border/50">
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-muted-foreground" />
                            <SelectValue placeholder="Tous les magasins" />
                        </div>
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                        <SelectItem value="all">Tous les magasins</SelectItem>
                        {stores.map(store => (
                            <SelectItem key={store} value={store}>{store}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                    <SelectTrigger className="rounded-2xl bg-card border-border/50">
                        <div className="flex items-center gap-2">
                            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                            <SelectValue placeholder="Trier par" />
                        </div>
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                        <SelectItem value="date">Plus récents</SelectItem>
                        <SelectItem value="price">Prix le plus bas</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : filteredPurchases.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredPurchases.map((purchase) => (
                        <Card key={purchase.id} className="overflow-hidden border-border/50 bg-card/60 backdrop-blur-sm rounded-3xl hover:bg-card/80 transition-all hover:shadow-lg group">
                            <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
                                <div className="flex flex-col gap-1">
                                    <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors">
                                        {purchase.ingredientName}
                                    </CardTitle>
                                    <CardDescription className="flex items-center gap-1.5 font-medium">
                                        <Calendar className="h-3.5 w-3.5" />
                                        {formatRelativeDate(purchase.date)}
                                    </CardDescription>
                                </div>
                                <div className="text-right">
                                    <div className="text-xl font-black text-primary">
                                        {purchase.price.toFixed(3)} DT
                                    </div>
                                    <div className="text-[10px] font-bold text-muted-foreground uppercase">
                                        Par {purchase.unit}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="flex items-center justify-between mt-2 pt-3 border-t border-border/20">
                                    <div className="flex items-center gap-2">
                                        {purchase.store ? (
                                            <div className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 rounded-full text-primary text-xs font-bold">
                                                <StoreIcon storeName={purchase.store} size="xs" />
                                                {purchase.store}
                                            </div>
                                        ) : (
                                            <div className="text-xs text-muted-foreground italic font-medium">Magasin non précisé</div>
                                        )}
                                    </div>
                                    <Badge variant="outline" className="text-[10px] bg-background/50 border-border/30 rounded-full font-bold">
                                        Qte: {purchase.quantity}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-secondary/20 rounded-3xl border border-dashed border-border/50">
                    <TrendingDown className="h-12 w-12 text-muted-foreground/30" />
                    <div className="space-y-1">
                        <h3 className="font-bold text-lg">Aucun prix trouvé</h3>
                        <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                            Soyez le premier à partager vos trouvailles en validant vos achats !
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
