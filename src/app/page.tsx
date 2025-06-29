
import { ChefHat } from 'lucide-react';

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
      <div className="text-center">
        <div className="inline-block p-4 bg-primary/10 rounded-full mb-4">
          <ChefHat className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Mon Assistant Cuisine</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          L'application a été réinitialisée. Nous sommes prêts à reconstruire, sur des bases saines.
        </p>
      </div>
    </main>
  );
}
