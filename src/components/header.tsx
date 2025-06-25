
import { Logo } from "@/components/icons";
import { RecipeSuggester } from "./recipe-suggester";
import { Button } from "./ui/button";
import { PartyPopper, Bookmark } from "lucide-react";

type HeaderProps = {
  ingredients: { name: string; price: number | null; }[];
  onCountryRecipeClick: () => void;
  onFavoritesClick: () => void;
};

export function Header({ ingredients, onCountryRecipeClick, onFavoritesClick }: HeaderProps) {
  return (
    <header className="w-full bg-card border-b sticky top-0 z-10">
      <div className="container mx-auto flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <Logo className="h-8 w-8 text-primary" />
          <h1 className="text-xl md:text-2xl font-bold text-foreground">
            Mon Assistant de Courses
          </h1>
        </div>
        <div className="flex items-center gap-2">
            <RecipeSuggester ingredients={ingredients} />
            <Button variant="outline" onClick={onCountryRecipeClick}>
                <PartyPopper className="mr-2 h-4 w-4 text-accent" />
                Me surprendre !
            </Button>
            <Button variant="ghost" size="icon" onClick={onFavoritesClick} aria-label="Recettes favorites">
                <Bookmark />
            </Button>
        </div>
      </div>
    </header>
  );
}
