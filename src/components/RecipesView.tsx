

'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Shuffle, Dices, Clock, Coins, Utensils, BookUser, Search, Tag, Sparkles, TrendingDown, ClipboardList, Check, Trash2, Plus, ChevronUp, ChevronDown } from 'lucide-react';
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
  onAddDbaratiItem: (text: string) => void;
  onToggleDbaratiItem: (id: string) => void;
  onDeleteDbaratiItem: (id: string) => void;
  onUpdateDbaratiItem: (id: string, text: string) => void;
  onMoveDbaratiItem: (id: string, direction: 'up' | 'down') => void;
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
  onDeleteDbaratiItem,
  onUpdateDbaratiItem,
  onMoveDbaratiItem,
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
  const [newDbaratiText, setNewDbaratiText] = useState('');
  const [isDbaratiSpinning, setIsDbaratiSpinning] = useState(false);
  const [dbaratiDisplayedItem, setDbaratiDisplayedItem] = useState<string | null>(null);
  const [dbaratiSelectedItem, setDbaratiSelectedItem] = useState<string | null>(null);

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
            <div className='py-4 px-4 rounded-xl bg-gradient-to-br from-secondary/50 via-card to-card border-2 border-border/50 shadow-lg'>
              <p className='text-muted-foreground mb-6 text-center max-w-2xl mx-auto'>Votre liste de plats à préparer. Notez ce que vous comptez cuisiner et cochez quand c'est fait !</p>

              {/* Add new item */}
              <form
                className="flex items-center gap-2 max-w-md mx-auto mb-6"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (newDbaratiText.trim()) {
                    onAddDbaratiItem(newDbaratiText);
                    setNewDbaratiText('');
                  }
                }}
              >
                <Input
                  placeholder="Ex: Couscous, Lablabi, Ojja..."
                  className="rounded-full h-10 flex-1"
                  value={newDbaratiText}
                  onChange={(e) => setNewDbaratiText(e.target.value)}
                />
                <Button type="submit" size="icon" className="rounded-full h-10 w-10 shrink-0" disabled={!newDbaratiText.trim()}>
                  <Plus className="h-5 w-5" />
                </Button>
              </form>

              {/* Random Wheel */}
              {(() => {
                const ONE_MONTH = 30 * 24 * 60 * 60 * 1000;
                const candidates = dbarati.filter(item => {
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

                  dbaratiIntervalRef.current = setInterval(() => {
                    const randomIdx = Math.floor(Math.random() * candidates.length);
                    setDbaratiDisplayedItem(candidates[randomIdx].text);
                  }, 100);

                  setTimeout(() => {
                    if (dbaratiIntervalRef.current) {
                      clearInterval(dbaratiIntervalRef.current);
                      dbaratiIntervalRef.current = null;
                    }
                    const finalChoice = candidates[Math.floor(Math.random() * candidates.length)];
                    setDbaratiSelectedItem(finalChoice.text);
                    setDbaratiDisplayedItem(null);
                    setIsDbaratiSpinning(false);
                  }, 2500);
                };

                return (
                  <div className="text-center mb-6 max-w-md mx-auto">
                    <Button
                      onClick={handleDbaratiSpin}
                      disabled={isDbaratiSpinning}
                      variant="outline"
                      className="rounded-full gap-2 border-primary/30 hover:bg-primary/5"
                      size="sm"
                    >
                      <Dices className={cn("h-4 w-4", isDbaratiSpinning && "animate-spin")} />
                      {isDbaratiSpinning ? 'Ça tourne...' : 'Qu\'est-ce que je prépare ?'}
                    </Button>
                    <div className="mt-4 h-16 flex flex-col justify-center items-center">
                      {isDbaratiSpinning && (
                        <p className="text-2xl font-bold text-primary transition-opacity duration-100 animate-in fade-in">
                          {dbaratiDisplayedItem}
                        </p>
                      )}
                      {!isDbaratiSpinning && dbaratiSelectedItem && (
                        <div className="animate-in fade-in-50 text-center">
                          <p className="text-muted-foreground text-sm">Aujourd'hui tu prépares...</p>
                          <p className="text-2xl font-bold text-primary mt-1">{dbaratiSelectedItem} 🍳</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* List */}
              {dbarati.length > 0 ? (
                <ul className="space-y-2 max-w-md mx-auto">
                  {dbarati.map((item, index) => (
                    <li
                      key={item.id}
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-xl border transition-all group",
                        item.done ? "bg-muted/30 border-border/30" : "bg-card border-border/50 hover:shadow-sm"
                      )}
                    >
                      <Checkbox
                        id={`dbarati-${item.id}`}
                        checked={item.done}
                        onCheckedChange={() => onToggleDbaratiItem(item.id)}
                        className="h-5 w-5 rounded-md border-primary/30 shrink-0 mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <label
                            htmlFor={`dbarati-${item.id}`}
                            className={cn(
                              "text-sm font-medium cursor-pointer block",
                              item.done && "line-through text-muted-foreground"
                            )}
                          >
                            {item.text}
                          </label>
                          {(() => {
                            const matchedRecipe = userRecipes.find(r => r.title.toLowerCase() === item.text.toLowerCase());
                            if (!matchedRecipe) return null;
                            return (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 rounded-full text-primary/60 hover:text-primary hover:bg-primary/10 -ml-1 mt-0.5"
                                onClick={() => onViewUserRecipe(matchedRecipe)}
                                title="Ouvrir la recette"
                              >
                                <BookUser className="h-3.5 w-3.5" />
                              </Button>
                            );
                          })()}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap mt-0.5">
                          {(item.prepCount || 0) > 0 && (
                            <span className="text-[10px] text-primary/60 font-semibold">
                              Préparé {item.prepCount} fois
                            </span>
                          )}
                          {item.lastPreparedAt && (
                            <>
                              {(item.prepCount || 0) > 0 && <span className="text-muted-foreground/30 text-[10px]">•</span>}
                              <span className="text-[10px] text-muted-foreground/70 italic">
                                Dernier: {new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' }).format(new Date(item.lastPreparedAt))}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 rounded text-muted-foreground hover:text-primary"
                          onClick={() => onMoveDbaratiItem(item.id, 'up')}
                          disabled={index === 0}
                          title="Monter"
                        >
                          <ChevronUp className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 rounded text-muted-foreground hover:text-primary"
                          onClick={() => onMoveDbaratiItem(item.id, 'down')}
                          disabled={index === dbarati.length - 1}
                          title="Descendre"
                        >
                          <ChevronDown className="h-3 w-3" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                        onClick={() => onDeleteDbaratiItem(item.id)}
                        title="Supprimer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className='text-muted-foreground text-center text-sm'>Aucun plat noté pour le moment.</p>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className='text-center py-8 px-4 rounded-xl bg-gradient-to-br from-primary/10 via-card to-card border-2 border-primary/20 shadow-lg'>
        <h2 className='text-2xl font-bold mb-2'>À court d'idées ?</h2>
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
                          {availabilityPercent}% d'ingrédients trouvés sur le marché
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
          filteredDiscoverableRecipes.length === 0 && <p className="text-muted-foreground mt-4 text-sm">Aucune recette ne correspond à vos filtres. Essayez d'en retirer un.</p>
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
