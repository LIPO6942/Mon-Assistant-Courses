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
        // Register the offline service worker
        navigator.serviceWorker.register('/sw.js').then(
          (registration) => {
            console.log('Main SW registered: ', registration.scope);
          },
          (registrationError) => {
            console.log('Main SW registration failed: ', registrationError);
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
