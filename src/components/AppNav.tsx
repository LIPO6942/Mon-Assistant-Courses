
'use client';

import { Button } from '@/components/ui/button';
import { UtensilsCrossed, BookOpen } from 'lucide-react';

interface AppNavProps {
  activeTab: 'pantry' | 'recipes';
  setActiveTab: (tab: 'pantry' | 'recipes') => void;
}

export default function AppNav({ activeTab, setActiveTab }: AppNavProps) {
  return (
    <nav className="bg-card/50 border-b">
      <div className="container mx-auto px-4 flex justify-center gap-2">
        <Button variant={activeTab === 'pantry' ? 'secondary': 'ghost'} onClick={() => setActiveTab('pantry')} className="flex-1 md:flex-none"><UtensilsCrossed className="mr-2 h-4 w-4"/>Garde-Manger</Button>
        <Button variant={activeTab === 'recipes' ? 'secondary': 'ghost'} onClick={() => setActiveTab('recipes')} className="flex-1 md:flex-none"><BookOpen className="mr-2 h-4 w-4"/>Recettes & Idées</Button>
      </div>
    </nav>
  );
}
