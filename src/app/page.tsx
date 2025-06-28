
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter
} from "@/components/ui/sheet";
import { ChefHat, ShoppingCart, Sparkles, Dices, Plus } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
          <div className="flex gap-2 items-center">
             <ChefHat className="h-6 w-6 text-primary" />
             <h1 className="text-2xl font-bold tracking-tight text-primary-foreground">Mon Assistant Cuisine</h1>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-2">
            <Button variant="ghost" size="icon">
              <Sparkles className="h-5 w-5 text-accent" />
              <span className="sr-only">Surprends-moi</span>
            </Button>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  <span className="sr-only">Ouvrir le panier</span>
                </Button>
              </SheetTrigger>
              <SheetContent className="flex flex-col h-full">
                <SheetHeader>
                  <SheetTitle>Mon Panier</SheetTitle>
                </SheetHeader>
                <div className="flex-grow overflow-y-auto py-4">
                  <p className="text-muted-foreground text-center pt-10">Votre panier est vide.</p>
                </div>
                <SheetFooter className="border-t pt-4">
                  <div className="w-full space-y-4">
                     <div className="flex justify-between font-semibold text-base">
                        <span>Total</span>
                        <span>0.00 DT</span>
                    </div>
                  </div>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      
      <main className="container py-8 space-y-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Gérer mes produits</CardTitle>
            <CardDescription>Recherchez, ajoutez et modifiez vos produits et catégories.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Les fonctionnalités de gestion des produits seront bientôt de retour.</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Dices className="text-accent" /> La flemme de cuisiner ?</CardTitle>
            <CardDescription>Cliquez sur le bouton pour choisir un plat rapide au hasard.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" disabled>
              <Dices className="mr-2 h-4 w-4" /> Lance ta chance
            </Button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="shadow-lg flex flex-col">
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle>Catégorie</CardTitle>
                <Button variant="outline" size="icon" disabled>
                  <Plus className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="flex-grow">
                 <p className="text-sm text-muted-foreground text-center pt-4">Les produits apparaîtront ici.</p>
              </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}
