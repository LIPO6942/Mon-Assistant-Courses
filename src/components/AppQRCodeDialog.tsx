'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { QrCode, Copy, Check, Download, Share2, Sparkles } from 'lucide-react';

interface AppQRCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AppQRCodeDialog({ open, onOpenChange }: AppQRCodeDialogProps) {
  const [copied, setCopied] = useState(false);
  const appUrl = 'https://mon-assistant-courses.vercel.app?src=qr';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText('https://mon-assistant-courses.vercel.app');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'Mon Assistant Courses (MAC)',
          text: 'Découvrez Mon Assistant Courses : scannez vos tickets, gérez vos stocks et cuisinez malin !',
          url: appUrl,
        });
      } catch {
        // user cancelled
      }
    } else {
      handleCopy();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm sm:max-w-md rounded-3xl p-6 overflow-hidden max-h-[92vh] flex flex-col">
        <DialogHeader className="text-center sm:text-center pb-1">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-emerald-400 text-primary-foreground flex items-center justify-center mb-2 shadow-lg shadow-primary/20">
            <QrCode className="h-6 w-6" />
          </div>
          <DialogTitle className="text-xl font-bold flex items-center justify-center gap-2">
            Mon Assistant Courses
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground max-w-xs mx-auto">
            Scannez ce QR Code avec votre appareil photo pour ouvrir l&apos;application et l&apos;installer sur votre écran d&apos;accueil.
          </DialogDescription>
        </DialogHeader>

        {/* QR Code Presentation Card with Creative Scanner Reticle */}
        <div className="flex flex-col items-center justify-center py-2">
          <div className="relative p-4 rounded-3xl bg-white shadow-xl border-2 border-emerald-500/20 flex flex-col items-center group">
            {/* 4 Scanner Corner Brackets for a sleek modern look */}
            <span className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-primary rounded-tl-md" />
            <span className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-primary rounded-tr-md" />
            <span className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-primary rounded-bl-md" />
            <span className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-primary rounded-br-md" />

            {/* Inner QR SVG with embedded logo */}
            <div className="relative w-52 h-52 sm:w-60 sm:h-60 flex items-center justify-center">
              <img
                src="/app-qr-code.svg"
                alt="QR Code Mon Assistant Courses"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="mt-1 text-center">
              <span className="text-[11px] font-bold text-emerald-800 tracking-tight bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                mon-assistant-courses.vercel.app
              </span>
            </div>
          </div>
        </div>

        {/* Creative Tips Box (Petites astuces créatives) */}
        <div className="bg-gradient-to-r from-emerald-500/10 via-primary/10 to-teal-500/10 border border-primary/25 rounded-2xl p-3 space-y-2 text-left">
          <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>Petites astuces créatives :</span>
          </div>
          <ul className="text-[11px] text-muted-foreground space-y-1 leading-snug">
            <li className="flex items-start gap-1.5">
              <span className="text-primary font-bold shrink-0">📸</span>
              <span><strong>Scan depuis le panier :</strong> Scannez votre ticket en sortant de caisse : il coche vos articles, garde les reliquats et met à jour les prix en 1 tap.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-primary font-bold shrink-0">🍳</span>
              <span><strong>Module Ch3andek :</strong> Vos achats alimentent vos stocks disponibles pour vous suggérer instantanément des recettes adaptées.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-primary font-bold shrink-0">📲</span>
              <span><strong>App PWA instantanée :</strong> Un bouton visible vous propose d&apos;ajouter l&apos;icône sur votre smartphone, utilisable hors-ligne sans passer par les stores.</span>
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <Button
            variant="outline"
            className="rounded-xl h-10 text-xs gap-1.5 font-medium"
            onClick={handleCopy}
          >
            {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Lien copié !' : 'Copier le lien'}
          </Button>

          <Button
            variant="outline"
            className="rounded-xl h-10 text-xs gap-1.5 font-medium"
            onClick={handleShare}
          >
            <Share2 className="h-3.5 w-3.5" />
            Partager
          </Button>
        </div>

        <div className="flex items-center justify-center gap-2 pt-1 border-t text-center">
          <a
            href="/app-qr-code.svg"
            download="qr-mon-assistant-courses.svg"
            className="text-[11px] text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors py-1"
          >
            <Download className="h-3 w-3" /> Télécharger SVG avec Logo
          </a>
          <span className="text-muted-foreground/30">•</span>
          <a
            href="/app-qr-code.png"
            download="qr-mon-assistant-courses.png"
            className="text-[11px] text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors py-1"
          >
            <Download className="h-3 w-3" /> Télécharger PNG
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}
