'use client';

import { useState, useEffect } from 'react';
import { Download, Smartphone, X, CheckCircle2, Share, PlusSquare, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export function PWAInstallBanner() {
  const [isStandalone, setIsStandalone] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [dismissed, setDismissed] = useState(true);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Vérification absolue : si déjà installé ou déjà enregistré comme installé, NE PLUS JAMAIS MONTRER
    const isInstalledPermanently = localStorage.getItem('pwa_installed_permanent') === 'true';

    // 2. Détection du mode standalone (PWA en cours d'exécution sur smartphone ou desktop)
    const isStandaloneMode =
      isInstalledPermanently ||
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: fullscreen)').matches ||
      window.matchMedia('(display-mode: minimal-ui)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');

    if (isStandaloneMode) {
      setIsStandalone(true);
      return;
    }

    setIsStandalone(false);

    // 3. Détection iOS Safari
    const userAgent = window.navigator.userAgent || '';
    const isAppleDevice = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
    setIsIOS(isAppleDevice);

    // 4. Gestion de la visibilité pour un nouveau visiteur
    const dismissedUntil = localStorage.getItem('pwa_banner_dismissed_until');
    const isFromQR = window.location.search.includes('src=qr');

    if (isFromQR) {
      // Priorité maximale : si l'utilisateur arrive du QR code, afficher immédiatement
      setDismissed(false);
    } else if (dismissedUntil && Date.now() < parseInt(dismissedUntil, 10)) {
      setDismissed(true);
    } else {
      setDismissed(false);
    }

    // 5. Écoute de l'événement natif d'installation (Android / Chrome / Edge / Samsung)
    const handleBeforeInstallPrompt = (e: any) => {
      // Vérifier à nouveau si déjà marqué installé
      if (localStorage.getItem('pwa_installed_permanent') === 'true') {
        return;
      }
      e.preventDefault();
      setDeferredPrompt(e);
      setDismissed(false);
    };

    // 6. Événement déclenché dès que l'installation PWA est confirmée
    const handleAppInstalled = () => {
      // Mémoriser de façon permanente que l'app est installée : elle ne réapparaîtra PLUS
      localStorage.setItem('pwa_installed_permanent', 'true');
      setIsStandalone(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // CONDITION STRICTE : Si déjà installé ou masqué, ne rien afficher
  if (isStandalone || dismissed) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }

    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          // L'utilisateur a cliqué sur "Installer" -> Marquer définitivement et faire disparaître le bouton
          localStorage.setItem('pwa_installed_permanent', 'true');
          setIsStandalone(true);
        }
        setDeferredPrompt(null);
      } catch (err) {
        console.error('Install prompt error:', err);
      }
    } else {
      setShowIOSGuide(true);
    }
  };

  const handleIOSConfirmed = () => {
    // L'utilisateur confirme avoir ajouté l'icône sur son iPhone
    localStorage.setItem('pwa_installed_permanent', 'true');
    setIsStandalone(true);
    setShowIOSGuide(false);
  };

  const handleDismiss = () => {
    setDismissed(true);
    // Masquer temporairement pendant 3 jours
    localStorage.setItem('pwa_banner_dismissed_until', String(Date.now() + 3 * 24 * 60 * 60 * 1000));
  };

  return (
    <>
      {/* Bannière Flottante Visible pour Nouveaux Utilisateurs */}
      <div className={cn(
        "fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50",
        "bg-card/95 backdrop-blur-xl border-2 border-primary/40 shadow-2xl rounded-2xl p-4",
        "animate-in fade-in slide-in-from-bottom-5 duration-300"
      )}>
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-primary to-emerald-400 text-primary-foreground flex items-center justify-center shrink-0 shadow-md">
            <Smartphone className="h-5 w-5" />
          </div>

          <div className="flex-1 min-w-0 pr-1">
            <div className="flex items-center gap-1.5">
              <h4 className="text-sm font-bold text-foreground">
                Installer l'application
              </h4>
              <span className="inline-flex items-center text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-primary/10 text-primary border border-primary/20">
                PWA
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
              Profitez d'un accès en 1 clic sur votre écran d'accueil, en plein écran et sans connexion requise.
            </p>

            <div className="flex items-center gap-2 mt-3">
              <Button
                size="sm"
                onClick={handleInstallClick}
                className="h-8 rounded-xl px-3.5 text-xs font-bold shadow-sm gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Download className="h-3.5 w-3.5" />
                Télécharger l'app
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
                className="h-8 rounded-xl px-2.5 text-xs text-muted-foreground hover:text-foreground"
              >
                Plus tard
              </Button>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="text-muted-foreground hover:text-foreground p-1 rounded-lg transition-colors -mr-1 -mt-1"
            title="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Guide d'installation pas-à-pas pour iOS Safari */}
      <Dialog open={showIOSGuide} onOpenChange={setShowIOSGuide}>
        <DialogContent className="max-w-sm rounded-3xl p-6">
          <DialogHeader className="text-center sm:text-center pb-2">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-2 shadow-inner">
              <Smartphone className="h-6 w-6" />
            </div>
            <DialogTitle className="text-lg font-bold">
              Ajouter à l'écran d'accueil
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Sur votre iPhone ou iPad, 3 étapes simples suffisent :
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="flex items-start gap-3 bg-secondary/60 p-3 rounded-2xl border border-border/40">
              <div className="h-6 w-6 rounded-lg bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center shrink-0">
                1
              </div>
              <div className="text-xs leading-relaxed">
                Touchez le bouton de <strong>Partage</strong> en bas de Safari (l'icône carrée avec une flèche <Share className="inline h-3.5 w-3.5 mx-0.5" />).
              </div>
            </div>

            <div className="flex items-start gap-3 bg-secondary/60 p-3 rounded-2xl border border-border/40">
              <div className="h-6 w-6 rounded-lg bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center shrink-0">
                2
              </div>
              <div className="text-xs leading-relaxed">
                Faites défiler le menu et touchez <strong>« Sur l'écran d'accueil »</strong>.
              </div>
            </div>

            <div className="flex items-start gap-3 bg-secondary/60 p-3 rounded-2xl border border-border/40">
              <div className="h-6 w-6 rounded-lg bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center shrink-0">
                3
              </div>
              <div className="text-xs leading-relaxed">
                Appuyez sur <strong>« Ajouter »</strong> en haut à droite. Votre application est installée !
              </div>
            </div>
          </div>

          <Button
            onClick={handleIOSConfirmed}
            className="w-full rounded-xl h-10 text-xs font-bold mt-2 gap-1.5"
          >
            <CheckCircle2 className="h-4 w-4" />
            C'est fait, j'ai installé l'app
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
