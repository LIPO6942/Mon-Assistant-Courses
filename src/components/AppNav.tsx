
'use client';

import { Button } from '@/components/ui/button';
import { UtensilsCrossed, BookOpen, BrainCircuit } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AppNavProps {
  activeTab: 'pantry' | 'recipes' | 'chandyek';
  setActiveTab: (tab: 'pantry' | 'recipes' | 'chandyek') => void;
}

export default function AppNav({ activeTab, setActiveTab }: AppNavProps) {
  return (
    <nav className="bg-card/95 backdrop-blur-sm border-b sticky top-[69px] z-10">
      <div className="container mx-auto px-4 flex justify-center">
        <Button variant="ghost" onClick={() => setActiveTab('pantry')} className={cn(
            "flex-1 md:flex-none rounded-none h-12 border-b-2 font-semibold",
            activeTab === 'pantry' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-primary/80'
        )}>
            <UtensilsCrossed className="mr-2 h-4 w-4"/>Garde-Manger
        </Button>
        <Button variant="ghost" onClick={() => setActiveTab('recipes')} className={cn(
            "flex-1 md:flex-none rounded-none h-12 border-b-2 font-semibold",
            activeTab === 'recipes' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-primary/80'
        )}>
            <BookOpen className="mr-2 h-4 w-4"/>Recettes & Idées
        </Button>
        <Button variant="ghost" onClick={() => setActiveTab('chandyek')} className={cn(
            "flex-1 md:flex-none rounded-none h-12 border-b-2 font-semibold",
            activeTab === 'chandyek' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-primary/80'
        )}>
            <BrainCircuit className="mr-2 h-4 w-4"/>Ch3andek?
        </Button>
      </div>
    </nav>
  );
}
