'use client';

import { useEffect, useState } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useKeepAlive } from '@/hooks/useKeepAlive';

export function PWAHandler() {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Active le polling intelligent pour récupérer les partages de panier en attente
  useKeepAlive();

  useEffect(() => {
    // 1. Service Worker Registration (critical for background push notifications)
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const registerSW = () => {
        const config = {
          apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
          authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
          messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
          appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
        };
        const queryString = new URLSearchParams(config as any).toString();
        const swUrl = `/sw.js?${queryString}`;

        navigator.serviceWorker.register(swUrl, { scope: '/' }).then(
          (registration) => {
            console.log('[PWAHandler] Master SW registered:', registration.scope);
            
            // Listen for SW updates to keep it fresh
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  console.log('[PWAHandler] SW state changed:', newWorker.state);
                });
              }
            });
          },
          (registrationError) => {
            console.error('[PWAHandler] Master SW registration failed:', registrationError);
          }
        );
      };

      if (document.readyState === 'complete') {
        registerSW();
      } else {
        window.addEventListener('load', registerSW);
      }
    }

    // 2. Online/Offline status listeners
    const handleOnline = () => {
      setIsOnline(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Show a small banner if offline
  if (!isOnline) {
    return (
      <div className={cn(
        "fixed bottom-20 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2",
        "bg-red-600 text-white px-4 py-2 rounded-full shadow-lg animate-bounce text-sm font-medium"
      )}>
        <WifiOff size={16} />
        <span>Mode Hors-ligne</span>
      </div>
    );
  }

  return null;
}
