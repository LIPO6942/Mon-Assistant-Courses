'use client';

import { useEffect, useState } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export function PWAHandler() {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    // 1. Service Worker Registration
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        // Build the same config query string to ensure consistent registration
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

        navigator.serviceWorker.register(swUrl).then(
          (registration) => {
            console.log('Master SW registered: ', registration.scope);
          },
          (registrationError) => {
            console.log('Master SW registration failed: ', registrationError);
          }
        );
      });
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
