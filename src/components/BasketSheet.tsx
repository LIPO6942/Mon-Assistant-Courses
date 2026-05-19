'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { sendBasketShare } from '@/lib/firestore-sync';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import type { BasketItem, PurchaseHistory } from '@/lib/types';
import { Minus, Plus, Trash2, Share2, History, Store, CheckCircle2, ListChecks } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { STORES } from '@/lib/stores';
import { StoreIcon, StoreOption } from '@/components/StoreIcon';
import { Checkbox } from './ui/checkbox';
import { cn, getProductStatus } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectSeparator,
} from '@/components/ui/select';
import { Input } from './ui/input';

interface BasketSheetProps {
  basket: BasketItem[];
  basketTotal: number;
  updateBasketQuantity: (id: string, newQuantity: number) => void;
  updateBasketItemPrice: (id: string, newPrice: number, remark?: string) => void;
  clearBasket: () => void;
  handleConfirmPurchase: (store?: string) => void;
  onShareBasket: () => void;
  onTogglePurchaseStatus: (id: string, itemPrice: number, itemQuantity: number) => void;
  purchaseHistory: PurchaseHistory;
}

export default function BasketSheet({
  basket,
  basketTotal,
  updateBasketQuantity,
  updateBasketItemPrice,
  clearBasket,
  handleConfirmPurchase,
  onShareBasket,
  onTogglePurchaseStatus,
  purchaseHistory,
}: BasketSheetProps) {
  const [isStoreDialogOpen, setIsStoreDialogOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<string>('');
  const [customStores, setCustomStores] = useState<string[]>([]);
  const [isAddingStore, setIsAddingStore] = useState(false);
  const [newStoreName, setNewStoreName] = useState('');
  const [lastSharedUser, setLastSharedUser] = useState<{ uid: string, name: string } | null>(null);
  const [editingPriceItem, setEditingPriceItem] = useState<{ id: string; name: string; currentPrice: number; unit: string; remark: string } | null>(null);
  const [newPriceStr, setNewPriceStr] = useState('');
  const [newRemarkStr, setNewRemarkStr] = useState('');
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const saved = localStorage.getItem('custom_stores');
    if (saved) {
      try {
        setCustomStores(JSON.parse(saved));
      } catch (e) { }
    }
  }, []);

  const saveCustomStore = (name: string) => {
    if (!name.trim()) return;
    const exists = STORES.some(s => s.name.toLowerCase() === name.toLowerCase()) ||
      customStores.some(s => s.toLowerCase() === name.toLowerCase());

    if (!exists) {
      const updated = [...customStores, name.trim()];
      setCustomStores(updated);
      localStorage.setItem('custom_stores', JSON.stringify(updated));
    }
  };

  useEffect(() => {
    const loadLastShared = () => {
      const stored = localStorage.getItem('lastSharedUser');
      if (stored) {
        try {
          setLastSharedUser(JSON.parse(stored));
          return;
        } catch (e) { }
      }
      setLastSharedUser(null);
    };
    loadLastShared();
    window.addEventListener('basketSharedInternally', loadLastShared);
    return () => window.removeEventListener('basketSharedInternally', loadLastShared);
  }, []);

  const handleQuickShare = async () => {
    if (!lastSharedUser || !user) return;
    const uncheckedItems = basket.filter(item => !item.purchased);
    if (uncheckedItems.length === 0) {
      alert("Aucun article non coché à partager.");
      return;
    }

    if (window.confirm(`Vous allez envoyer les ${uncheckedItems.length} articles non cochés de votre panier à ${lastSharedUser.name}. Confirmer ?`)) {
      try {
        await sendBasketShare(user.uid, user.displayName || "Un ami", lastSharedUser.uid, uncheckedItems);
        alert(`Panier envoyé à ${lastSharedUser.name} !`);
      } catch (err) {
        console.error("Quick share error:", err);
        alert("Erreur lors de l'envoi.");
      }
    }
  };

  const sortedBasket = basket.slice().sort((a, b) => {
    const aPurchased = a.purchased ?? false;
    const bPurchased = b.purchased ?? false;
    if (aPurchased === bPurchased) return 0;
    return aPurchased ? 1 : -1;
  });

  const purchasedItemCount = basket.filter(item => item.purchased).length;
  const purchasedTotal = basket.reduce((total, item) => 
    item.purchased ? total + item.price * item.quantity : total, 0
  );

  const handleClickValidate = () => {
    setSelectedStore('');
    setIsStoreDialogOpen(true);
  };

  const handleConfirmWithStore = () => {
    setIsStoreDialogOpen(false);
    let storeToUse = selectedStore;
    if (selectedStore === 'ADD_NEW_STORE' && newStoreName.trim()) {
      storeToUse = newStoreName.trim();
      saveCustomStore(storeToUse);
    }
    handleConfirmPurchase(storeToUse || undefined);
    setIsAddingStore(false);
    setNewStoreName('');
  };

  const handleToggleAll = () => {
    const allPurchased = basket.length > 0 && basket.every(item => item.purchased);
    basket.forEach(item => {
      if ((!!item.purchased) === allPurchased) {
        onTogglePurchaseStatus(item.id, item.price, item.quantity);
      }
    });
  };

  const handlePointerDown = (item: BasketItem) => {
    longPressTimerRef.current = setTimeout(() => {
      setEditingPriceItem({ id: item.id, name: item.name, currentPrice: item.price, unit: item.unit, remark: item.remark || '' });
      setNewPriceStr(item.price.toString());
      setNewRemarkStr(item.remark || '');
    }, 500); // 500ms long press
  };

  const handlePointerUpOrLeave = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  return (
    <>
      <SheetContent className="flex flex-col px-0 w-[94vw] sm:w-[400px] sm:max-w-md overflow-x-hidden border-l shadow-2xl">
        <SheetHeader className="px-4 pb-2">
          <div className="flex items-center w-full pr-8">
            <SheetTitle className="shrink-0">Mon Panier</SheetTitle>
            <div className="flex-1 flex justify-center items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleToggleAll} disabled={basket.length === 0} aria-label="Tout sélectionner">
                <ListChecks className="h-4 w-4 text-primary" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onShareBasket} disabled={basket.length === 0} aria-label="Partager le panier">
                <Share2 className="h-4 w-4 text-primary" />
              </Button>
              {lastSharedUser && (
                <Button
                  variant="outline"
                  className="h-8 w-8 rounded-full bg-primary/10 text-primary font-bold hover:bg-primary/20 p-0"
                  onClick={handleQuickShare}
                  title={`Envoyer à ${lastSharedUser.name} les articles non cochés`}
                >
                  {lastSharedUser.name.charAt(0).toUpperCase()}
                </Button>
              )}
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-grow my-4 px-2">
          {sortedBasket.length > 0 ? (
            <ul className="space-y-3">
              {sortedBasket.map(item => (
                <li key={item.id}
                  className={cn("flex flex-col gap-2 bg-secondary/50 p-3 rounded-md transition-opacity select-none", item.purchased && 'opacity-70')}
                  onPointerDown={() => handlePointerDown(item)}
                  onPointerUp={handlePointerUpOrLeave}
                  onPointerLeave={handlePointerUpOrLeave}
                >
                  <div className='flex justify-between items-start gap-4'>
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <Checkbox
                        id={item.id}
                        checked={!!item.purchased}
                        onCheckedChange={() => onTogglePurchaseStatus(item.id, item.price, item.quantity)}
                        className="h-5 w-5 rounded-md border-primary/30 shrink-0"
                      />
                      <label
                        htmlFor={item.id}
                        className={cn("text-sm font-semibold text-foreground cursor-pointer flex items-center gap-2 min-w-0", item.purchased && 'line-through text-muted-foreground')}
                      >
                        <span className="truncate">{item.name}</span>
                        {(() => {
                          const status = getProductStatus(purchaseHistory[item.id]);
                          if (!status) return null;
                          return (
                            <span
                              className={cn(
                                "h-2 w-2 rounded-full shrink-0",
                                status === 'green' && "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]",
                                status === 'orange' && "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]",
                                status === 'red' && "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"
                              )}
                              title={
                                status === 'green' ? "Nouvellement acheté" :
                                  status === 'orange' ? "Fréquence d'achat habituelle atteinte" :
                                    "En retard / Rupture probable"
                              }
                            />
                          );
                        })()}
                      </label>
                    </div>
                    <span className={cn('font-bold text-primary whitespace-nowrap shrink-0 pt-0.5', item.purchased && 'line-through text-muted-foreground')}>
                      {(item.price * item.quantity).toFixed(3)} DT
                    </span>
                  </div>
                  <div className='flex justify-between items-center gap-2 mt-1'>
                    <div className="flex items-center gap-2 min-w-0 flex-1 flex-wrap">
                      <span className={cn('text-xs text-muted-foreground whitespace-nowrap', item.purchased && 'line-through')}>
                        {item.price.toFixed(3)} DT / {item.unit}
                      </span>
                      {item.remark && (
                        <span className={cn("text-[9px] text-muted-foreground/80 italic ml-1 truncate max-w-[80px]", item.purchased && 'line-through')}>
                          ({item.remark})
                        </span>
                      )}
                      {purchaseHistory[item.id]?.length > 0 && (
                        <>
                          <span className="text-muted-foreground/30">•</span>
                          <div className="flex items-center gap-1.5 opacity-80 min-w-0">
                            <History className="h-2.5 w-2.5 text-primary/70 shrink-0" />
                            <div className="flex items-center gap-1 min-w-0">
                              <span className="text-[9px] text-muted-foreground font-medium italic leading-none truncate">
                                Acheté le {new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' }).format(new Date(purchaseHistory[item.id][purchaseHistory[item.id].length - 1].date))}
                              </span>
                              {purchaseHistory[item.id][purchaseHistory[item.id].length - 1].store && (
                                <div className="flex items-center gap-0.5 shrink-0 bg-background/50 px-1 rounded-sm border border-border/10">
                                  <StoreIcon storeName={purchaseHistory[item.id][purchaseHistory[item.id].length - 1].store!} size="xs" />
                                  <span className="text-[8px] text-primary/70 font-bold uppercase truncate max-w-[40px]">
                                    {purchaseHistory[item.id][purchaseHistory[item.id].length - 1].store}
                                  </span>
                                </div>
                              )}
                              {purchaseHistory[item.id][purchaseHistory[item.id].length - 1].remark && (
                                <span className="text-[9px] text-muted-foreground/70 italic ml-1 truncate max-w-[60px]">
                                  ({purchaseHistory[item.id][purchaseHistory[item.id].length - 1].remark})
                                </span>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                    <div className='flex items-center gap-2 shrink-0'>
                      <Button variant="ghost" size="icon" className='h-7 w-7 rounded-full' onClick={() => updateBasketQuantity(item.id, item.quantity - 1)} disabled={!!item.purchased}><Minus className='h-4 w-4' /></Button>
                      <span className='font-bold w-4 text-center text-sm'>{item.quantity}</span>
                      <Button variant="ghost" size="icon" className='h-7 w-7 rounded-full' onClick={() => updateBasketQuantity(item.id, item.quantity + 1)} disabled={!!item.purchased}><Plus className='h-4 w-4' /></Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-muted-foreground text-center mt-8">Votre panier est vide.</p>}
        </ScrollArea>

        {basket.length > 0 && (
          <SheetFooter className='pt-4 px-4 border-t flex-col gap-2 w-full'>
            <div className="flex justify-between items-center w-full border-b border-dashed pb-2 mb-1">
              <span className="text-base font-medium text-muted-foreground">Total achetés</span>
              <span className="text-xl font-semibold text-primary/80">{purchasedTotal.toFixed(3)} DT</span>
            </div>
            <div className="flex justify-between items-center w-full">
              <span className="text-lg font-semibold text-muted-foreground">
                {purchasedItemCount > 0 ? "Total restant" : "Total à payer"}
              </span>
              <span className="text-2xl font-bold text-primary">{basketTotal.toFixed(3)} DT</span>
            </div>
            <Button onClick={handleClickValidate} className="w-full" disabled={purchasedItemCount === 0}>
              Valider les {purchasedItemCount} articles achetés
            </Button>
            <Button variant="outline" onClick={clearBasket} className="w-full" disabled={basket.length === 0}><Trash2 className="h-4 w-4 mr-2" /> Vider</Button>
          </SheetFooter>
        )}
      </SheetContent>

      {/* Store selection dialog */}
      <Dialog open={isStoreDialogOpen} onOpenChange={setIsStoreDialogOpen}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Store className="h-5 w-5 text-primary" />
              </div>
              <DialogTitle className="text-lg">Où avez-vous fait vos courses ?</DialogTitle>
            </div>
            <DialogDescription className="text-sm text-muted-foreground">
              Optionnel — vous pouvez ignorer cette étape.
            </DialogDescription>
          </DialogHeader>

          <Select
            value={selectedStore}
            onValueChange={(val) => {
              setSelectedStore(val);
              setIsAddingStore(val === 'ADD_NEW_STORE');
            }}
          >
            <SelectTrigger className="w-full rounded-xl h-11">
              <SelectValue placeholder="Choisir un magasin..." />
            </SelectTrigger>
            <SelectContent>
              {STORES.map(store => (
                <SelectItem key={store.name} value={store.name}>
                  <StoreOption storeName={store.name} />
                </SelectItem>
              ))}
              {customStores.map(store => (
                <SelectItem key={store} value={store}>
                  <StoreOption storeName={store} />
                </SelectItem>
              ))}
              <SelectSeparator />
              <SelectItem value="ADD_NEW_STORE" className="text-primary font-bold">
                <div className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  <span>Autre magasin...</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          {isAddingStore && (
            <div className="space-y-2 mt-2 animate-in slide-in-from-top-2 duration-300">
              <label className="text-xs font-bold text-muted-foreground ml-1">Nom du magasin</label>
              <Input
                placeholder="Ex: Épicerie du coin, Monoprix City..."
                value={newStoreName}
                onChange={(e) => setNewStoreName(e.target.value)}
                className="rounded-xl h-11"
                autoFocus
              />
            </div>
          )}

          <DialogFooter className="flex-col gap-2 sm:flex-col mt-2">
            <Button
              onClick={handleConfirmWithStore}
              className="w-full rounded-xl gap-2"
              disabled={isAddingStore && !newStoreName.trim()}
            >
              <CheckCircle2 className="h-4 w-4" />
              {isAddingStore
                ? `Confirmer — ${newStoreName || '...'}`
                : selectedStore && selectedStore !== 'ADD_NEW_STORE'
                  ? `Confirmer — ${selectedStore}`
                  : 'Confirmer sans magasin'}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setIsStoreDialogOpen(false);
                setIsAddingStore(false);
              }}
              className="w-full text-muted-foreground text-xs"
            >
              Annuler
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Price dialog */}
      <Dialog open={!!editingPriceItem} onOpenChange={(open) => !open && setEditingPriceItem(null)}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle>Modifier le prix</DialogTitle>
            <DialogDescription>
              Ajuster le prix de l&apos;article &quot;{editingPriceItem?.name}&quot; avant de valider.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 space-y-4">
            <div>
              <label className="text-xs font-bold text-muted-foreground ml-1">Nouveau prix (DT)</label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  type="number"
                  step="0.001"
                  min="0"
                  value={newPriceStr}
                  onChange={e => setNewPriceStr(e.target.value)}
                  className="rounded-xl h-11 flex-1"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const num = parseFloat(newPriceStr);
                      if (!isNaN(num) && num >= 0 && editingPriceItem) {
                        updateBasketItemPrice(editingPriceItem.id, num, newRemarkStr);
                        setEditingPriceItem(null);
                      }
                    }
                  }}
                />
                <span className="text-xs text-muted-foreground whitespace-nowrap bg-secondary/50 px-3 py-2.5 rounded-xl border">
                  / {editingPriceItem?.unit}
                </span>
              </div>
            </div>
            
            <div>
              <label className="text-xs font-bold text-muted-foreground ml-1">Remarque (optionnelle)</label>
              <Input
                placeholder="Ex: indiquer la marque, la promotion"
                value={newRemarkStr}
                onChange={e => setNewRemarkStr(e.target.value)}
                className="rounded-xl mt-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const num = parseFloat(newPriceStr);
                    if (!isNaN(num) && num >= 0 && editingPriceItem) {
                      updateBasketItemPrice(editingPriceItem.id, num, newRemarkStr);
                      setEditingPriceItem(null);
                    }
                  }
                }}
              />
              <div className="flex flex-wrap gap-2 mt-3">
                {["Demi pot", "Marque", "En Promotion"].map(tag => (
                  <Badge 
                    key={tag}
                    variant="secondary" 
                    className="cursor-pointer hover:bg-secondary/80 text-[9px] px-1.5 py-0 font-normal"
                    onClick={() => setNewRemarkStr(prev => prev ? `${prev}, ${tag}` : tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-col mt-2">
            <Button
              className="w-full rounded-xl"
              onClick={() => {
                if (editingPriceItem) {
                  const num = parseFloat(newPriceStr);
                  if (!isNaN(num) && num >= 0) {
                    updateBasketItemPrice(editingPriceItem.id, num, newRemarkStr);
                    setEditingPriceItem(null);
                  }
                }
              }}
            >
              Enregistrer
            </Button>
            <Button
              variant="ghost"
              onClick={() => setEditingPriceItem(null)}
              className="w-full text-muted-foreground text-xs"
            >
              Annuler
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
