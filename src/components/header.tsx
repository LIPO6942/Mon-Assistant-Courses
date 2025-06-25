
import { Logo } from "@/components/icons";
import { RecipeSuggester } from "./recipe-suggester";
import { Button } from "./ui/button";
import { PartyPopper, Bookmark, ShoppingCart } from "lucide-react";

type HeaderProps = {
  ingredients: { name: string; price: number | null; }[];
  onCountryRecipeClick: () => void;
  onFavoritesClick: () => void;
  onCartClick: () => void;
};

export function Header({ ingredients, onCountryRecipeClick, onFavoritesClick, onCartClick }: HeaderProps) {
  return (
    <header className="w-full bg-card border-b sticky top-0 z-10">
      <div className="container mx-auto flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <Logo className="h-8 w-8 text-primary flex-shrink-0" />
          <h1 className="text-lg sm:text-xl font-bold text-foreground">
            <span className="sm:hidden">MAC</span>
            <span className="hidden sm:inline">Mon Assistant de Courses</span>
          </h1>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
            <RecipeSuggester ingredients={ingredients} />
            <Button variant="outline" onClick={onCountryRecipeClick}>
                <PartyPopper className="h-4 w-4 text-accent sm:mr-2" />
                <span className="hidden sm:inline">Me surprendre !</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={onFavoritesClick} aria-label="Recettes favorites">
                <Bookmark />
            </Button>
            <Button variant="ghost" size="icon" onClick={onCartClick} aria-label="Panier">
                <ShoppingCart />
            </Button>
        </div>
      </div>
    </header>
  );
}
