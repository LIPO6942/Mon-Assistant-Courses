export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="w-full max-w-5xl items-center justify-between text-center">
        <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
          Mon Assistant de Courses
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Bienvenue ! Commencez par ajouter des articles à votre liste.
        </p>
      </div>
    </main>
  );
}
