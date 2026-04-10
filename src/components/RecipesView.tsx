

'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Shuffle, Dices, Clock, Coins, Utensils, BookUser, Search, Tag, Sparkles, TrendingDown, ClipboardList, Check, Trash2, Plus, ChevronUp, ChevronDown, Loader2, X } from 'lucide-react';
import type { Recipe, UserRecipe, BasketItem, PurchaseHistory, CommunityPurchase, DbaratiItem } from '@/lib/types';
import { streetFoodOptions } from '@/lib/data';
import { cn, getProductStatus } from '@/lib/utils';
import Image from 'next/image';
import { listenCommunityPurchases } from '@/lib/firestore-sync';
import { calculateMarketPrices, calculateRecipeCost, getRecipeAvailabilityPercentage, formatPrice } from '@/lib/price-utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';

const normalizeString = (s: string) => 
  s.toLowerCase()
   .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove accents
   .replace(/['’\-]/g, " ") // replace apostrophes and dashes with space
   .replace(/[^a-z0-9 ]/g, "") // remove other special chars
   .trim();

interface RecipesViewProps {
  setViewingRecipe: (recipe: (Omit<Recipe, 'id'> & { id?: string; }) | null) => void;
  discoverableRecipes: Recipe[];
  handleSaveRecipe: (recipe: Omit<Recipe, 'id'> & { id?: string; }) => void;
  userRecipes: UserRecipe[];
  openUserRecipeForm: (recipe?: UserRecipe) => void;
  onViewUserRecipe: (recipe: UserRecipe | null) => void;
  basket: BasketItem[];
  purchaseHistory: PurchaseHistory;
  dbarati: DbaratiItem[];
  onAddDbaratiItem: (text: string, type?: 'plat' | 'entree', tag?: 'Soupe' | 'Salade' | 'Sauce', platTag?: 'Pates' | 'Sauces' | 'Sandwich' | 'Autres') => void;
  onToggleDbaratiItem: (id: string) => void;
  onMarkPrepared: (id: string) => void;
  onDeleteDbaratiItem: (id: string) => void;
  onUpdateDbaratiItem: (id: string, text: string) => void;
  onMoveDbaratiItem: (id: string, direction: 'up' | 'down') => void;
  onUpdateDbaratiItemPlatTag: (id: string, platTag: 'Pates' | 'Sauces' | 'Sandwich' | 'Autres') => void;
}

export default function RecipesView({
  setViewingRecipe,
  discoverableRecipes,
  handleSaveRecipe,
  userRecipes,
  openUserRecipeForm,
  onViewUserRecipe,
  basket,
  purchaseHistory,
  dbarati,
  onAddDbaratiItem,
  onToggleDbaratiItem,
  onMarkPrepared,
  onDeleteDbaratiItem,
  onUpdateDbaratiItem,
  onMoveDbaratiItem,
  onUpdateDbaratiItemPlatTag,
}: RecipesViewProps) {
  const [suggestedRecipes, setSuggestedRecipes] = useState<Recipe[]>([]);
  const [selectedStreetFood, setSelectedStreetFood] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [displayedFood, setDisplayedFood] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const dbaratiIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [filterQuick, setFilterQuick] = useState(false);
  const [filterEconomical, setFilterEconomical] = useState(false);
  const [communityPurchases, setCommunityPurchases] = useState<CommunityPurchase[]>([]);
  const [userRecipeTagFilter, setUserRecipeTagFilter] = useState('');
  const [isDbaratiSpinning, setIsDbaratiSpinning] = useState(false);
  const [dbaratiDisplayedItem, setDbaratiDisplayedItem] = useState<string | null>(null);
  const [dbaratiSelectedItem, setDbaratiSelectedItem] = useState<string | null>(null);
  const [dbaratiSelectedEmoji, setDbaratiSelectedEmoji] = useState<string>('🍳');

  // Entrees state
  const [newEntreeText, setNewEntreeText] = useState('');
  const [newEntreeTag, setNewEntreeTag] = useState<'Soupe' | 'Salade' | 'Sauce'>('Salade');
  const [activeEntreeFilter, setActiveEntreeFilter] = useState<'Toutes' | 'Soupe' | 'Salade' | 'Sauce'>('Toutes');
  const [isEntreesExpanded, setIsEntreesExpanded] = useState(false);

  // Plats state
  const [newPlatText, setNewPlatText] = useState('');
  const [newPlatTag, setNewPlatTag] = useState<'Pates' | 'Sauces' | 'Sandwich' | 'Autres'>('Autres');
  const [activePlatFilter, setActivePlatFilter] = useState<'Tous' | 'Pates' | 'Sauces' | 'Sandwich' | 'Autres'>('Tous');
  const [isPlatsExpanded, setIsPlatsExpanded] = useState(true);
  const [longPressItemId, setLongPressItemId] = useState<string | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  // ID of the plat whose history panel is open (inline)
  const [openHistoryId, setOpenHistoryId] = useState<string | null>(null);

  // Listen to community purchases for recipe cost calculations
  useEffect(() => {
    let isMounted = true;

    try {
      const unsubscribe = listenCommunityPurchases((data) => {
        if (isMounted) {
          setCommunityPurchases(data as CommunityPurchase[]);
        }
      });

      return () => {
        isMounted = false;
        unsubscribe();
      };
    } catch (err) {
      console.error("Error listening to community purchases:", err);
    }
  }, []);

  const filteredDiscoverableRecipes = useMemo(() => {
    return discoverableRecipes.filter(recipe => {
      const quickMatch = !filterQuick || (recipe.preparationTime !== undefined && recipe.preparationTime <= 15);
      const economicalMatch = !filterEconomical || !!recipe.isEconomical;
      return quickMatch && economicalMatch;
    });
  }, [discoverableRecipes, filterQuick, filterEconomical]);

  const filteredUserRecipes = useMemo(() => {
    if (!userRecipeTagFilter) return userRecipes;
    const filterTags = userRecipeTagFilter.toLowerCase().split(',').map(t => t.trim()).filter(Boolean);
    if (filterTags.length === 0) return userRecipes;

    return userRecipes.filter(recipe => {
      const recipeTags = (recipe.tags || '').toLowerCase().split(',').map(t => t.trim());
      return filterTags.every(ft => recipeTags.includes(ft));
    });

  }, [userRecipes, userRecipeTagFilter]);

  // Listen to community purchases for recipe cost calculations
  useEffect(() => {
    let isMounted = true;

    try {
      const unsubscribe = listenCommunityPurchases((data) => {
        if (isMounted) {
          setCommunityPurchases(data as CommunityPurchase[]);
        }
      });

      return () => {
        isMounted = false;
        unsubscribe();
      };
    } catch (err) {
      console.error("Error listening to community purchases:", err);
    }
  }, []);

  // Cleanup interval on component unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (dbaratiIntervalRef.current) {
        clearInterval(dbaratiIntervalRef.current);
      }
    };
  }, []);

  // Calculate market prices from community purchases
  const marketPrices = useMemo(() => {
    return calculateMarketPrices(communityPurchases);
  }, [communityPurchases]);

  // --- Basket-based Recommendations ---
  const basketBasedRecipes = useMemo(() => {
    const hasHistory = basket.length > 0 || Object.keys(purchaseHistory).length > 0;

    // 1. If history exists, use the matching algorithm
    if (hasHistory) {
      const matchedIngredientNames = new Set<string>();
      basket.forEach(item => matchedIngredientNames.add(item.name.toLowerCase()));

      return discoverableRecipes.map(recipe => {
        const matches = recipe.ingredients.filter(ing => {
          const name = ing.name.toLowerCase();
          if (matchedIngredientNames.has(name)) return true;
          const status = getProductStatus(purchaseHistory[ing.name] || purchaseHistory[ing.name.toLowerCase()]);
          return status === 'green' || status === 'orange';
        });

        return {
          recipe,
          matchCount: matches.length,
          matchPercentage: matches.length / recipe.ingredients.length,
          matchedNames: matches.map(m => m.name),
          isDiscovery: false
        };
      })
        .filter(m => m.matchCount > 0)
        .sort((a, b) => b.matchPercentage - a.matchPercentage)
        .slice(0, 4);
    }

    // 2. If NO history, show discovery recipes (random subset of 4)
    const shuffled = [...discoverableRecipes].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 4).map(recipe => ({
      recipe,
      matchCount: 0,
      matchPercentage: 0,
      matchedNames: [],
      isDiscovery: true
    }));
  }, [discoverableRecipes, basket, purchaseHistory]);

  const findRandomRecipes = () => {
    if (filteredDiscoverableRecipes.length === 0) {
      setSuggestedRecipes([]);
      return;
    }
    const shuffled = [...filteredDiscoverableRecipes].sort(() => 0.5 - Math.random());
    setSuggestedRecipes(shuffled.slice(0, 2));
  };

  const handleSpin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setSelectedStreetFood(null);

    const spinDuration = 2500;
    const spinInterval = 100;

    intervalRef.current = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * streetFoodOptions.length);
      setDisplayedFood(streetFoodOptions[randomIndex]);
    }, spinInterval);

    setTimeout(() => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      const finalChoice = streetFoodOptions[Math.floor(Math.random() * streetFoodOptions.length)];
      setSelectedStreetFood(finalChoice);
      setDisplayedFood(null);
      setIsSpinning(false);
    }, spinDuration);
  };

  return (
    <div className="space-y-8">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger>
            <div className="flex justify-center items-center gap-3 py-2 text-primary">
              <BookUser className="h-8 w-8 text-primary" />
              <h2 className='text-3xl font-bold'>Recetteti</h2>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className='text-center py-4 px-4 rounded-xl bg-gradient-to-br from-secondary/50 via-card to-card border-2 border-border/50 shadow-lg'>
              <p className='text-muted-foreground mb-6 max-w-2xl mx-auto'>Votre carnet de recettes personnel. Créez, modifiez et conservez vos propres créations culinaires ici-même.</p>

              <div className="relative mb-6 max-w-sm mx-auto">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Filtrer par tags (ex: vegan, rapide)..."
                  className="pl-11 rounded-full h-10"
                  value={userRecipeTagFilter}
                  onChange={(e) => setUserRecipeTagFilter(e.target.value)}
                />
              </div>

              {filteredUserRecipes.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
                  {filteredUserRecipes.map(recipe => (
                    <Card key={recipe.id} className="cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col" onClick={() => onViewUserRecipe(recipe)}>
                      <CardContent className='p-3 flex items-center gap-3'>
                        <div className="relative w-12 h-12 aspect-square shrink-0">
                          {recipe.photoDataUri ? (
                            <Image src={recipe.photoDataUri} alt={recipe.title} layout="fill" objectFit="cover" className="rounded-md" />
                          ) : (
                            <div className="w-full h-full bg-secondary flex items-center justify-center rounded-md">
                              <Utensils className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col overflow-hidden">
                          <CardTitle className='text-base font-semibold truncate'>{recipe.title}</CardTitle>
                          <div className="flex flex-wrap items-center gap-1 mt-1">
                            <Badge variant="outline" className="text-xs">{recipe.category}</Badge>
                            <Badge variant="outline" className="flex items-center gap-1 text-xs"><Clock className="h-3 w-3" />{recipe.preparationTime} min</Badge>
                            {recipe.tags && recipe.tags.split(',').map(tag => tag.trim() && (
                              <Badge key={tag.trim()} variant="secondary" className="text-xs flex items-center gap-1"><Tag className="h-3 w-3" />{tag.trim()}</Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className='text-muted-foreground mb-6'>{userRecipes.length > 0 ? "Aucune recette ne correspond à votre filtre." : "Vous n'avez pas encore créé de recette."}</p>
              )}

              <Button onClick={() => openUserRecipeForm()}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Créer ma recette
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* --- DBARATI SECTION --- */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="dbarati">
          <AccordionTrigger>
            <div className="flex justify-center items-center gap-3 py-2 text-primary">
              <ClipboardList className="h-8 w-8 text-primary" />
              <h2 className='text-3xl font-bold'>Dbarati</h2>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className='py-4 px-3 sm:px-5 rounded-2xl bg-gradient-to-br from-indigo-50/50 via-white to-rose-50/50 dark:from-indigo-950/20 dark:via-background dark:to-rose-950/20 border border-border/40 shadow-xl backdrop-blur-sm'>
              <div className='flex flex-col items-center mb-4'>
                <p className='text-muted-foreground text-center max-w-2xl text-xs sm:text-sm leading-relaxed'>
                  <span className="font-semibold text-primary">Dbarati</span> : Vos idées de repas et vos habitudes culinaires.
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <Badge variant="outline" className="text-[10px] sm:text-xs font-bold bg-white/50 dark:bg-zinc-900/50 text-muted-foreground/80 border-primary/10 px-2.5 py-0.5 rounded-full">
                    {dbarati.length} {dbarati.length > 1 ? 'idées' : 'idée'} enregistrée{dbarati.length > 1 ? 's' : ''}
                  </Badge>
                </div>
              </div>

              {/* --- MES CLASSIQUES --- */}
              {(() => {
                const classiques = dbarati
                  .filter(i => i.type !== 'entree' && (i.prepCount || 0) >= 2)
                  .sort((a, b) => (b.prepCount || 0) - (a.prepCount || 0))
                  .slice(0, 5);
                if (classiques.length === 0) return null;
                return (
                  <div className="max-w-4xl mx-auto mb-5 bg-amber-50/60 dark:bg-amber-950/10 rounded-2xl p-3 border border-amber-200/40 dark:border-amber-700/20 shadow-sm">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400 mb-2 flex items-center gap-1.5">
                      <span>🏆</span> Mes classiques
                    </p>
                    <div className="flex flex-col gap-1">
                      {classiques.map(c => (
                        <div key={c.id} className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-foreground truncate flex-1 mr-2">{c.text}</span>
                          <span className="text-amber-600 dark:text-amber-400 font-bold shrink-0">{c.prepCount}x</span>
                          {c.lastPreparedAt && (
                            <span className="text-muted-foreground ml-2 shrink-0">
                              {new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' }).format(new Date(c.lastPreparedAt))}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Entrées Section (Collapsible) - Moved Above Random Wheel */}
              <div className="max-w-4xl mx-auto mb-8 bg-white/30 dark:bg-zinc-900/10 rounded-2xl p-4 border border-border/20 shadow-sm">
                <button 
                  onClick={() => setIsEntreesExpanded(!isEntreesExpanded)}
                  className="w-full flex justify-between items-center py-2 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors focus:outline-none"
                >
                  <span className="flex items-center gap-2">
                    <Utensils className="h-4 w-4" /> Entrées
                    <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4 ml-2">
                      {dbarati.filter(i => i.type === 'entree').length}
                    </Badge>
                  </span>
                  {isEntreesExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                
                {isEntreesExpanded && (
                  <div className="animate-in slide-in-from-top-2 fade-in duration-300 pt-4">
                    
                    {/* Add new Entree - Multiline Layout */}
                    <div className="max-w-md mx-auto mb-6 scale-95 origin-top">
                      <form
                        className="flex flex-col gap-3"
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (newEntreeText.trim()) {
                            onAddDbaratiItem(newEntreeText, 'entree', newEntreeTag);
                            setNewEntreeText('');
                          }
                        }}
                      >
                         <Input
                          placeholder="Ajouter une entrée..."
                          className="rounded-xl h-10 text-sm border-primary/20 bg-background/50 w-full"
                          value={newEntreeText}
                          onChange={(e) => setNewEntreeText(e.target.value)}
                        />
                        
                        {newEntreeText.length > 0 && (
                          <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                            <div className="flex border border-primary/20 rounded-xl overflow-hidden shadow-sm h-10 flex-1">
                              {(['Soupe', 'Salade', 'Sauce'] as const).map(tag => (
                                <button
                                  key={tag}
                                  type="button"
                                  className={cn(
                                    "px-2 text-[10px] font-medium transition-colors border-r border-primary/10 last:border-r-0 hover:bg-primary/10",
                                    newEntreeTag === tag ? "bg-primary/10 text-primary font-bold" : "bg-card text-muted-foreground"
                                  )}
                                  onClick={() => setNewEntreeTag(tag)}
                                >
                                  {tag}
                                </button>
                              ))}
                            </div>
                            <Button 
                              type="submit" 
                              size="icon" 
                              className="h-10 w-10 rounded-xl shrink-0" 
                              disabled={!newEntreeText.trim()}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </form>
                    </div>

                    {/* Filters (Always visible if entrees exist) */}
                    {dbarati.filter(i => i.type === 'entree').length > 0 && (
                      <div className="flex gap-2 mb-4 overflow-x-auto pb-1.5 no-scrollbar px-1 snap-x scroll-smooth w-full">
                        {(['Toutes', 'Soupe', 'Salade', 'Sauce'] as const).map(filter => (
                          <Badge 
                            key={filter}
                            variant={activeEntreeFilter === filter ? "default" : "outline"}
                            className="shrink-0 cursor-pointer text-[10px] py-1 px-3 snap-center"
                            onClick={() => setActiveEntreeFilter(filter)}
                          >
                            {filter}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Entrees List */}
                    {dbarati.filter(i => i.type === 'entree').length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-4xl mx-auto scale-95 origin-top">
                        {[...dbarati]
                          .filter(i => i.type === 'entree')
                          .filter(i => activeEntreeFilter === 'Toutes' || i.tag === activeEntreeFilter)
                          .sort((a, b) => Number(a.done) - Number(b.done))
                          .map((item) => (
                          <div
                            key={item.id}
                            className={cn(
                              "relative p-2 rounded-lg border transition-all duration-300 group flex items-center justify-between",
                              item.done 
                                ? "bg-muted/40 border-border/40 opacity-70" 
                                : "bg-white dark:bg-card border-border/60 hover:border-primary/40 hover:shadow-sm"
                            )}
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <Checkbox
                                id={`dbarati-${item.id}`}
                                checked={item.done}
                                onCheckedChange={() => onToggleDbaratiItem(item.id)}
                                className="h-4 w-4 rounded border-primary/20 data-[state=checked]:bg-primary shrink-0"
                              />
                               <label
                                htmlFor={`dbarati-${item.id}`}
                                className={cn(
                                  "text-xs font-semibold cursor-pointer truncate flex-1",
                                  item.done ? "line-through text-muted-foreground" : "text-foreground"
                                )}
                              >
                                {item.text}
                              </label>
                              {item.tag && (
                                <Badge variant="secondary" className="text-[8px] px-1 py-0 h-3 font-medium opacity-70 shrink-0">
                                  {item.tag}
                                </Badge>
                              )}
                            </div>
                             <div className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 rounded text-muted-foreground hover:text-destructive"
                                  onClick={() => onDeleteDbaratiItem(item.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 rounded-xl border border-dashed border-border/40 bg-muted/5 scale-95">
                        <p className='text-muted-foreground font-medium text-[11px]'>Aucune entrée ajoutée.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Random Wheel UI - Compact */}
              {(() => {
                const ONE_MONTH = 30 * 24 * 60 * 60 * 1000;
                const candidates = dbarati.filter(item => {
                  if (item.type === 'entree') return false;
                  if (!item.done) return true;
                  if (item.lastPreparedAt) {
                    return (Date.now() - new Date(item.lastPreparedAt).getTime()) > ONE_MONTH;
                  }
                  return true;
                });

                if (candidates.length < 2) return null;

                const handleDbaratiSpin = () => {
                  if (isDbaratiSpinning) return;
                  setIsDbaratiSpinning(true);
                  setDbaratiSelectedItem(null);

                  const foodEmojis = ['🍳', '🥗', '🍝', '🍕', '🍱', '🍔', '🥙', '🍛', '🥘', '🍲', '🍜', '🍚', '🍗', '🐟', '🍤'];

                  dbaratiIntervalRef.current = setInterval(() => {
                    const randomIdx = Math.floor(Math.random() * candidates.length);
                    setDbaratiDisplayedItem(candidates[randomIdx].text);
                  }, 80);

                  setTimeout(() => {
                    if (dbaratiIntervalRef.current) {
                      clearInterval(dbaratiIntervalRef.current);
                      dbaratiIntervalRef.current = null;
                    }
                    const finalChoice = candidates[Math.floor(Math.random() * candidates.length)];
                    setDbaratiSelectedItem(finalChoice.text);
                    setDbaratiSelectedEmoji(foodEmojis[Math.floor(Math.random() * foodEmojis.length)]);
                    setDbaratiDisplayedItem(null);
                    setIsDbaratiSpinning(false);
                  }, 2500);
                };

                return (
                  <div className="relative mb-6 p-3 rounded-2xl bg-primary/5 border border-primary/10 overflow-hidden text-center group">
                    <div className="absolute -top-12 -right-12 w-20 h-20 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all duration-700" />
                    <div className="absolute -bottom-12 -left-12 w-20 h-20 bg-rose-400/10 rounded-full blur-2xl group-hover:bg-rose-400/20 transition-all duration-700" />

                    <div className="flex flex-col items-center gap-2">
                      <Button
                        onClick={handleDbaratiSpin}
                        disabled={isDbaratiSpinning}
                        size="sm"
                        className={cn(
                          "rounded-full px-4 py-1.5 h-8 font-bold shadow-sm transition-all duration-300 text-xs",
                          isDbaratiSpinning ? "bg-muted cursor-not-allowed" : "bg-gradient-to-r from-primary to-indigo-600 hover:shadow-primary/20 hover:scale-105 active:scale-95"
                        )}
                      >
                        {isDbaratiSpinning ? (
                          <span className="flex items-center gap-1.5">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Un instant...
                          </span>
                        ) : (
                          <><Dices className="h-3.5 w-3.5 mr-1.5" /> Qu&apos;est-ce qu&apos;on mange ?</>
                        )}
                      </Button>

                      <div className="h-8 flex flex-col justify-center items-center">
                        {isDbaratiSpinning && (
                          <div className="animate-in zoom-in-75 duration-200">
                            <p className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-600 truncate max-w-[240px]">
                              {dbaratiDisplayedItem}
                            </p>
                          </div>
                        )}
                        {!isDbaratiSpinning && dbaratiSelectedItem && (
                          <div className="animate-in fade-in-50 zoom-in-95 duration-500 text-center">
                            <div className="flex items-center justify-center gap-3">
                              <p className="text-xl font-black text-primary drop-shadow-sm flex items-center gap-2">
                                {dbaratiSelectedItem} <span className="text-lg animate-bounce">{dbaratiSelectedEmoji}</span>
                              </p>
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-8 w-8 rounded-full border-primary/20 text-primary hover:bg-primary hover:text-white transition-all shadow-sm"
                                title="Marquer comme préparé"
                                onClick={() => {
                                  // Find item among all, not just candidates, to safely toggle
                                  const normalizedSelected = normalizeString(dbaratiSelectedItem || '');
                                  const item = candidates.find(c => normalizeString(c.text) === normalizedSelected);
                                  if (item) onToggleDbaratiItem(item.id);
                                }}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Plats Section (Collapsible) */}
              <div className="max-w-4xl mx-auto mb-6 bg-white/30 dark:bg-zinc-900/10 rounded-2xl p-4 border border-border/20 shadow-sm">
                <button
                  onClick={() => setIsPlatsExpanded(!isPlatsExpanded)}
                  className="w-full flex justify-between items-center py-2 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors focus:outline-none"
                >
                  <span className="flex items-center gap-2">
                    <Utensils className="h-4 w-4" /> Plats
                    <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4 ml-2">
                      {dbarati.filter(i => i.type !== 'entree').length}
                    </Badge>
                  </span>
                  {isPlatsExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>

                {isPlatsExpanded && (
                  <div className="animate-in slide-in-from-top-2 fade-in duration-300 pt-4">

                    {/* Add new Plat - Multiline Layout */}
                    <div className="max-w-md mx-auto mb-6 scale-95 origin-top">
                      <form
                        className="flex flex-col gap-3"
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (newPlatText.trim()) {
                            onAddDbaratiItem(newPlatText, 'plat', undefined, newPlatTag);
                            setNewPlatText('');
                          }
                        }}
                      >
                        <Input
                          placeholder="Un plat ? Couscous, Pasta..."
                          className="rounded-xl h-10 text-sm border-primary/20 bg-background/50 w-full"
                          value={newPlatText}
                          onChange={(e) => setNewPlatText(e.target.value)}
                        />

                        {newPlatText.length > 0 && (
                          <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                            <div className="flex border border-primary/20 rounded-xl overflow-hidden shadow-sm h-10 flex-1">
                              {(['Pates', 'Sauces', 'Sandwich', 'Autres'] as const).map(tag => (
                                <button
                                  key={tag}
                                  type="button"
                                  className={cn(
                                    "px-2 text-[10px] font-medium transition-colors border-r border-primary/10 last:border-r-0 hover:bg-primary/10 flex-1",
                                    newPlatTag === tag ? "bg-primary/10 text-primary font-bold" : "bg-card text-muted-foreground"
                                  )}
                                  onClick={() => setNewPlatTag(tag)}
                                >
                                  {tag}
                                </button>
                              ))}
                            </div>
                            <Button
                              type="submit"
                              size="icon"
                              className="h-10 w-10 rounded-xl shrink-0"
                              disabled={!newPlatText.trim()}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </form>
                    </div>

                    {/* Filters (Always visible if plats exist) */}
                    {dbarati.filter(i => i.type !== 'entree').length > 0 && (
                      <div className="flex gap-2 mb-4 overflow-x-auto pb-1.5 no-scrollbar px-1 snap-x scroll-smooth w-full">
                        {(['Tous', 'Pates', 'Sauces', 'Sandwich', 'Autres'] as const).map(filter => (
                          <Badge
                            key={filter}
                            variant={activePlatFilter === filter ? "default" : "outline"}
                            className="shrink-0 cursor-pointer text-[10px] py-1 px-3 snap-center"
                            onClick={() => setActivePlatFilter(filter)}
                          >
                            {filter}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Plats List */}
                    {dbarati.filter(i => i.type !== 'entree').length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-4xl mx-auto scale-95 origin-top">
                        {[...dbarati]
                          .filter(i => i.type !== 'entree')
                          .filter(i => activePlatFilter === 'Tous' || i.platTag === activePlatFilter)
                          .sort((a, b) => Number(a.done) - Number(b.done))
                          .map((item, index) => {
                            const normalizedItemText = normalizeString(item.text);
                            const matchedRecipe = userRecipes.find(r => normalizeString(r.title) === normalizedItemText);
                            const isLongPressed = longPressItemId === item.id;

                            return (
                              <div
                                key={item.id}
                                className={cn(
                                  "relative p-3 rounded-xl border transition-all duration-300 group flex flex-col",
                                  item.done
                                    ? "bg-muted/40 border-border/40 opacity-90 scale-[0.98]"
                                    : "bg-white dark:bg-card border-border/60 hover:border-primary/40 hover:shadow-lg"
                                )}
                                onMouseDown={() => {
                                  longPressTimer.current = setTimeout(() => {
                                    setLongPressItemId(item.id);
                                  }, 500);
                                }}
                                onMouseUp={() => {
                                  if (longPressTimer.current) clearTimeout(longPressTimer.current);
                                }}
                                onMouseLeave={() => {
                                  if (longPressTimer.current) clearTimeout(longPressTimer.current);
                                }}
                                onTouchStart={() => {
                                  longPressTimer.current = setTimeout(() => {
                                    setLongPressItemId(item.id);
                                  }, 500);
                                }}
                                onTouchEnd={() => {
                                  if (longPressTimer.current) clearTimeout(longPressTimer.current);
                                }}
                              >
                                {/* Long-press native tag picker overlay */}
                                {isLongPressed && (
                                  <div className="absolute inset-0 z-10 bg-background/95 rounded-xl flex items-center justify-between px-4 animate-in fade-in duration-150 border-2 border-primary/20 shadow-sm">
                                    <div className="flex items-center gap-2 flex-1">
                                      <Tag className="h-3.5 w-3.5 text-primary" />
                                      <select 
                                        className="w-full bg-transparent text-sm font-bold text-primary outline-none focus:ring-0 cursor-pointer appearance-none"
                                        value={item.platTag || ''}
                                        onChange={(e) => {
                                          if(e.target.value) {
                                            onUpdateDbaratiItemPlatTag(item.id, e.target.value as any);
                                            setLongPressItemId(null);
                                          }
                                        }}
                                        onBlur={() => setLongPressItemId(null)}
                                        autoFocus
                                      >
                                        <option value="" disabled hidden>Choisir un tag...</option>
                                        <option value="Pates">Pâtes</option>
                                        <option value="Sauces">Sauces</option>
                                        <option value="Sandwich">Sandwich</option>
                                        <option value="Autres">Autres</option>
                                      </select>
                                    </div>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-8 w-8 rounded-full text-muted-foreground hover:bg-muted"
                                      onClick={() => setLongPressItemId(null)}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                )}

                                <div className="flex items-start gap-2.5">
                                  <div className="flex flex-col items-center justify-start gap-2 mt-0.5">
                                    <Checkbox
                                      id={`dbarati-${item.id}`}
                                      checked={item.done}
                                      onCheckedChange={() => onToggleDbaratiItem(item.id)}
                                      className="h-5 w-5 rounded-md border-2 border-primary/10 data-[state=checked]:bg-primary data-[state=checked]:border-primary shrink-0"
                                    />
                                    {/* Bouton +1 : visible dès que le plat a au moins 1 préparation enregistrée, ou est actuellement coché */}
                                    {(item.done || (item.prepCount || 0) > 0) && (
                                      <button
                                        title="Marquer une nouvelle préparation"
                                        onClick={(e) => { e.stopPropagation(); onMarkPrepared(item.id); }}
                                        className="inline-flex items-center justify-center bg-primary/15 hover:bg-primary/30 text-primary border border-primary/30 rounded-full h-5 px-1.5 min-w-[24px] text-[9px] font-black leading-none transition-colors shadow-sm"
                                      >
                                        +1
                                      </button>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start gap-1.5 flex-wrap mt-[2px]">
                                      <label
                                        htmlFor={`dbarati-${item.id}`}
                                        className={cn(
                                          "text-sm font-bold cursor-pointer transition-all leading-tight break-words max-w-full",
                                          (() => {
                                            if (!item.done || !item.lastPreparedAt) return "text-foreground";
                                            const daysSince = (Date.now() - new Date(item.lastPreparedAt).getTime()) / (1000 * 60 * 60 * 24);
                                            if (daysSince <= 7) return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 px-1.5 py-0.5 rounded";
                                            if (daysSince <= 15) return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 px-1.5 py-0.5 rounded";
                                            if (daysSince <= 30) return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-1.5 py-0.5 rounded";
                                            return "text-muted-foreground";
                                          })()
                                        )}
                                      >
                                        {item.text}
                                      </label>
                                      {item.platTag && (
                                        <Badge variant="secondary" className="text-[7.5px] px-1 py-0 h-[11px] leading-none flex items-center font-bold opacity-60 shrink-0">
                                          {item.platTag}
                                        </Badge>
                                      )}
                                      {matchedRecipe && (
                                        <Badge
                                          variant="secondary"
                                          className="h-4 px-1 text-[8px] font-black uppercase tracking-tighter cursor-pointer hover:bg-primary hover:text-white transition-colors shrink-0 whitespace-nowrap mt-0.5"
                                          onClick={() => onViewUserRecipe(matchedRecipe)}
                                        >
                                          📖 Recette
                                        </Badge>
                                      )}
                                    </div>

                                      <div className="flex items-center gap-1.5 mt-1 flex-nowrap whitespace-nowrap">
                                        {(item.prepCount || 0) > 0 && (
                                          <span className="bg-primary/5 text-primary px-1.5 py-0 rounded-full text-[9px] font-bold shrink-0">
                                            {item.prepCount}x
                                          </span>
                                        )}
                                        {item.lastPreparedAt && (
                                          <span className="text-[10px] text-muted-foreground italic truncate">
                                            {new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' }).format(new Date(item.lastPreparedAt))}
                                            <span className="opacity-70 ml-1">
                                              (il y a {Math.floor((Date.now() - new Date(item.lastPreparedAt).getTime()) / (1000 * 60 * 60 * 24))} j)
                                            </span>
                                          </span>
                                        )}

                                        {/* Bouton historique : visible seulement si ≥2 préparations */}
                                        {(item.prepHistory?.length || 0) >= 2 && (
                                          <button
                                            title="Voir l'historique"
                                            onClick={(e) => { e.stopPropagation(); setOpenHistoryId(openHistoryId === item.id ? null : item.id); }}
                                            className="inline-flex items-center justify-center text-muted-foreground hover:text-primary text-[11px] rounded-full px-1 py-0.5 transition-colors shrink-0"
                                          >
                                            📅
                                          </button>
                                        )}
                                      </div>
                                    {/* Mini-historique inline */}
                                    {openHistoryId === item.id && item.prepHistory && item.prepHistory.length > 0 && (
                                      <div className="mt-1.5 text-[9px] text-muted-foreground bg-muted/30 rounded-lg px-2 py-1.5 space-y-0.5 animate-in fade-in slide-in-from-top-1 duration-200">
                                        {[...item.prepHistory].reverse().map((date, i) => (
                                          <div key={i} className="flex items-center gap-1">
                                            <span className="w-1 h-1 rounded-full bg-primary/40 shrink-0" />
                                            {new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: '2-digit' }).format(new Date(date))}
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 rounded-md text-muted-foreground hover:text-primary"
                                      onClick={() => onMoveDbaratiItem(item.id, 'up')}
                                      disabled={index === 0}
                                    >
                                      <ChevronUp className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 rounded-md text-muted-foreground hover:text-destructive"
                                      onClick={() => onDeleteDbaratiItem(item.id)}
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    ) : (
                      <div className="text-center py-4 rounded-xl border border-dashed border-border/40 bg-muted/5 scale-95">
                        <p className='text-muted-foreground font-medium text-[11px]'>Aucun plat ajouté.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>




            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className='text-center py-8 px-4 rounded-xl bg-gradient-to-br from-primary/10 via-card to-card border-2 border-primary/20 shadow-lg'>
        <h2 className='text-2xl font-bold mb-2'>À court d&apos;idées ?</h2>
        <p className='text-muted-foreground mb-4'>Utilisez les filtres pour affiner les suggestions aléatoires !</p>

        <div className="flex flex-wrap justify-center gap-4 mb-6">
          <Button
            size="sm"
            variant={filterQuick ? "secondary" : "outline"}
            onClick={() => setFilterQuick(!filterQuick)}
            className={cn(filterQuick && 'ring-2 ring-primary')}
          >
            <Clock className="mr-2 h-4 w-4" /> Je suis pressé(e)
          </Button>
          <Button
            size="sm"
            variant={filterEconomical ? "secondary" : "outline"}
            onClick={() => setFilterEconomical(!filterEconomical)}
            className={cn(filterEconomical && 'ring-2 ring-primary')}
          >
            <Coins className="mr-2 h-4 w-4" /> Économique
          </Button>
        </div>

        <Button
          onClick={findRandomRecipes}
          className="h-11 rounded-md px-4 sm:px-8 text-sm sm:text-base whitespace-normal sm:whitespace-nowrap"
        >
          <Shuffle className="mr-2 h-5 w-5 shrink-0" />
          Trouver une idée de recette
        </Button>

        {basketBasedRecipes.length > 0 && (
          <div className="mt-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-4 flex items-center gap-2 justify-center">
              <Sparkles className="h-4 w-4" />
              {basketBasedRecipes[0].isDiscovery ? "Découverte du jour" : "Basé sur votre panier & achats"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {basketBasedRecipes.map(({ recipe, matchedNames, isDiscovery }) => {
                const recipeCost = calculateRecipeCost(recipe.ingredients, marketPrices);
                const availabilityPercent = getRecipeAvailabilityPercentage(recipe.ingredients, marketPrices);
                
                return (
                <Card
                  key={recipe.id}
                  className={cn(
                    "cursor-pointer hover:shadow-md transition-all border-primary/20 bg-primary/5 group relative",
                    isDiscovery ? "border-zinc-200 bg-zinc-50/50" : "border-primary/20 bg-primary/5"
                  )}
                  onClick={() => setViewingRecipe(recipe)}
                >
                  <CardHeader className="p-3 pb-0">
                    <CardTitle className="text-sm group-hover:text-primary transition-colors">{recipe.title}</CardTitle>
                    <Badge variant="outline" className="text-[8px] w-fit h-4 px-1 absolute top-2 right-2 opacity-50">{recipe.country}</Badge>
                  </CardHeader>
                  <CardContent className="p-3 pt-2">
                    <p className="text-[10px] text-muted-foreground line-clamp-2 mb-2">{recipe.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {isDiscovery ? (
                        <div className="text-[9px] text-muted-foreground italic flex items-center gap-1">
                          <PlusCircle className="h-2 w-2" />
                          Nouvelle idée à tester
                        </div>
                      ) : (
                        matchedNames.slice(0, 3).map(name => (
                          <div key={name} className="flex items-center gap-1 bg-background px-1.5 py-0.5 rounded text-[9px] border border-primary/10">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            {name}
                          </div>
                        ))
                      )}
                      {!isDiscovery && matchedNames.length > 3 && <span className="text-[9px] text-muted-foreground">+{matchedNames.length - 3}</span>}
                    </div>
                    {recipeCost.totalCost !== null && (
                      <div className="mt-2 text-[9px] font-bold text-green-700 dark:text-green-400">
                        Est. {formatPrice(recipeCost.totalCost)}
                      </div>
                    )}
                  </CardContent>
                </Card>
                );
              })}
            </div>
          </div>
        )}

        {suggestedRecipes.length > 0 ? (
          <div className='mt-8 max-w-4xl mx-auto text-left animate-in fade-in-50 grid grid-cols-1 md:grid-cols-2 gap-6'>
            {suggestedRecipes.map(recipe => {
              const recipeCost = calculateRecipeCost(recipe.ingredients, marketPrices);
              const availabilityPercent = getRecipeAvailabilityPercentage(recipe.ingredients, marketPrices);
              
              return (
              <Card key={recipe.id} className="overflow-hidden flex flex-col bg-card shadow-lg rounded-xl border border-border/50">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="pr-2 flex-1">
                      <CardTitle>{recipe.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <Badge variant="secondary" className="w-fit">{recipe.country}</Badge>
                        {recipe.preparationTime !== undefined && (
                          <Badge variant="outline" className="flex items-center gap-1"><Clock className="h-3 w-3" />{recipe.preparationTime} min</Badge>
                        )}
                        {recipe.isEconomical && <Badge variant="outline" className="flex items-center gap-1"><Coins className="h-3 w-3" />Éco</Badge>}
                        {recipeCost.totalCost !== null && (
                          <Badge className="flex items-center gap-1 bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/30">
                            <TrendingDown className="h-3 w-3" />
                            {formatPrice(recipeCost.totalCost)}
                          </Badge>
                        )}
                      </div>
                      {communityPurchases.length > 0 && availabilityPercent < 100 && (
                        <p className="text-[11px] text-muted-foreground mt-1">
                          {availabilityPercent}% d&apos;ingrédients trouvés sur le marché
                        </p>
                      )}
                    </div>
                    {recipe.calories !== undefined && (
                      <Badge variant="outline" className="whitespace-nowrap">{recipe.calories} kcal</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground">{recipe.description}</p>
                </CardContent>
                <CardFooter className="flex justify-between mt-auto bg-secondary/30 pt-4 gap-2">
                  <Button onClick={() => setViewingRecipe(recipe)}>Voir la recette</Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleSaveRecipe(recipe)}
                  >
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            );
            })}
          </div>
        ) : (
          filteredDiscoverableRecipes.length === 0 && <p className="text-muted-foreground mt-4 text-sm">Aucune recette ne correspond à vos filtres. Essayez d&apos;en retirer un.</p>
        )}
      </div>

      <div className='text-center py-8 px-4 rounded-xl bg-gradient-to-br from-accent/10 via-card to-card border-2 border-accent/20 shadow-lg'>
        <h2 className='text-2xl font-bold mb-2'>J’ai pas envie de cuisiner</h2>
        <p className='text-muted-foreground mb-6'>Pas le courage ? Laissez le hasard décider de votre prochain plat à emporter !</p>
        <div className="flex justify-center">
          <Button size="lg" onClick={handleSpin} className="bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isSpinning}>
            <Dices className={`mr-2 h-5 w-5 ${isSpinning ? 'animate-spin' : ''}`} />
            {isSpinning ? 'Ça tourne...' : 'Lancer la roue de la flemme !'}
          </Button>
        </div>

        <div className="mt-8 h-24 flex flex-col justify-center items-center">
          {isSpinning && (
            <p className="text-4xl font-bold text-primary transition-opacity duration-100 animate-in fade-in">
              {displayedFood}
            </p>
          )}
          {!isSpinning && selectedStreetFood && (
            <div className="animate-in fade-in-50 text-center">
              <p className="text-muted-foreground">Et le gagnant est...</p>
              <p className="text-4xl font-bold text-primary mt-2">{selectedStreetFood}</p>
              <p className="text-sm font-semibold text-accent/80 mt-4 animate-pulse">Alors, on se régale ?</p>

              <Button
                variant="outline"
                className="mt-6 gap-2"
                onClick={() => {
                  const query = encodeURIComponent(selectedStreetFood);
                  window.open(`https://kol-youm-app.vercel.app/khrouj?category=fast-food&query=${query}`, '_blank');
                }}
              >
                <Utensils className="h-4 w-4" />
                Manger ça dehors
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
