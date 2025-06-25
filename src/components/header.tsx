import { Logo } from "@/components/icons";
import { RecipeSuggester } from "./recipe-suggester";

type HeaderProps = {
  ingredients: string[];
};

export function Header({ ingredients }: HeaderProps) {
  return (
    <header className="w-full bg-card border-b sticky top-0 z-10">
      <div className="container mx-auto flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <Logo className="h-8 w-8 text-primary" />
          <h1 className="text-xl md:text-2xl font-bold text-foreground">
            Mon Assistant de Courses
          </h1>
        </div>
        <RecipeSuggester ingredients={ingredients} />
      </div>
    </header>
  );
}
