
'use client';

import { Button } from '@/components/ui/button';
import { UtensilsCrossed, BookOpen, BrainCircuit, HeartPulse } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';

interface AppNavProps {
  activeTab: 'pantry' | 'recipes' | 'chandyek' | 'guide';
  setActiveTab: (tab: 'pantry' | 'recipes' | 'chandyek' | 'guide') => void;
  chandyekIngredientCount: number;
}

export default function AppNav({ activeTab, setActiveTab, chandyekIngredientCount }: AppNavProps) {
  return (
    <nav className="bg-card/95 backdrop-blur-sm border-b sticky top-[69px] z-10">
      <div className="overflow-x-auto whitespace-nowrap">
        <div className="container mx-auto px-2 flex justify-start sm:justify-center">
            <Button variant="ghost" onClick={() => setActiveTab('pantry')} className={cn(
                "shrink-0 rounded-none h-12 border-b-2 font-semibold px-4",
                activeTab === 'pantry' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-primary/80'
            )}>
                <UtensilsCrossed className="mr-2 h-4 w-4"/>Garde-Manger
            </Button>
            <Button variant="ghost" onClick={() => setActiveTab('recipes')} className={cn(
                "shrink-0 rounded-none h-12 border-b-2 font-semibold px-4",
                activeTab === 'recipes' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-primary/80'
            )}>
                <BookOpen className="mr-2 h-4 w-4"/>Recettes & Idées
            </Button>
            <Button variant="ghost" onClick={() => setActiveTab('chandyek')} className={cn(
                "relative shrink-0 rounded-none h-12 border-b-2 font-semibold px-4",
                activeTab === 'chandyek' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-primary/80'
            )}>
                <BrainCircuit className="mr-2 h-4 w-4"/>Ch3andek?
                {chandyekIngredientCount > 0 && (
                    <Badge variant="destructive" className="absolute top-2 right-2 h-5 w-5 justify-center p-0">{chandyekIngredientCount}</Badge>
                )}
            </Button>
            <Button variant="ghost" onClick={() => setActiveTab('guide')} className={cn(
                "shrink-0 rounded-none h-12 border-b-2 font-semibold px-4",
                activeTab === 'guide' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-primary/80'
            )}>
                <HeartPulse className="mr-2 h-4 w-4"/>Guide Santé
            </Button>
        </div>
      </div>
    </nav>
  );
}
