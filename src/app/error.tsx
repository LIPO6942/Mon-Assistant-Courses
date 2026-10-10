'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Captured client-side error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background text-foreground">
      <div className="max-w-md w-full p-6 rounded-3xl bg-card border border-border shadow-lg text-center flex flex-col items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl font-bold mb-1">Mise à jour en cours</h2>
          <p className="text-sm text-muted-foreground">
            Vos données sont conservées en toute sécurité. Cliquez sur le bouton ci-dessous pour recharger l'affichage.
          </p>
        </div>
        <div className="flex gap-3 w-full">
          <Button
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.reload();
              } else {
                reset();
              }
            }}
            className="w-full rounded-xl"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Recharger l'application
          </Button>
        </div>
      </div>
    </div>
  );
}
