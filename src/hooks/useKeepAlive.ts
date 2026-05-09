'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useOnlineStatus } from './useOnlineStatus';

const KEEP_ALIVE_INTERVAL = 30000;       // 30 s quand l'onglet est actif
const KEEP_ALIVE_INTERVAL_BG = 60000;    // 60 s quand l'onglet est en arrière-plan

interface PendingShare {
    id: string;
    fromUid: string;
    fromName: string;
    toUid: string;
    items: any[];
    status: string;
    createdAt: string;
}

export function useKeepAlive() {
    const { user } = useAuth();
    const isOnline = useOnlineStatus();
    const [lastPollAt, setLastPollAt] = useState<Date | null>(null);
    const [isPolling, setIsPolling] = useState(false);
    const [pendingShares, setPendingShares] = useState<PendingShare[]>([]);

    const notifiedShareIds = useRef<Set<string>>(new Set());
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const isHiddenRef = useRef(false);

    const poll = useCallback(async () => {
        if (!user?.uid || !isOnline) return;

        setIsPolling(true);
        try {
            const res = await fetch('/api/poll', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.uid })
            });

            if (!res.ok) {
                console.warn('[KeepAlive] Poll failed:', res.status);
                return;
            }

            const data = await res.json();
            const shares: PendingShare[] = data.shares || [];
            setPendingShares(shares);
            setLastPollAt(new Date());

            // Notifier les nouveaux partages non encore notifiés
            shares.forEach((share) => {
                if (!notifiedShareIds.current.has(share.id)) {
                    notifiedShareIds.current.add(share.id);

                    // 1. Dispatcher un événement pour la UI in-app (KitchenAssistantPage)
                    window.dispatchEvent(
                        new CustomEvent('basketSharePolled', { detail: share })
                    );

                    // 2. Notification via Service Worker (fonctionne aussi en arrière-plan / PWA veille)
                    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
                        if ('serviceWorker' in navigator) {
                            navigator.serviceWorker.getRegistration().then((reg) => {
                                if (reg) {
                                    // Passer par le SW pour afficher la notif — visible même en veille
                                    reg.showNotification('🛒 Panier partagé !', {
                                        body: `${share.fromName} vous a partagé un panier de courses.`,
                                        icon: '/icon-192x192.png',
                                        badge: '/icon-192x192.png',
                                        tag: share.id,
                                        requireInteraction: true,
                                        data: { shareId: share.id, type: 'basket_share' }
                                    } as NotificationOptions);
                                } else {
                                    // Fallback si pas de SW actif (desktop)
                                    new Notification('🛒 Panier partagé !', {
                                        body: `${share.fromName} vous a partagé un panier de courses.`,
                                        icon: '/icon-192x192.png',
                                        tag: share.id,
                                    });
                                }
                            }).catch(() => {
                                new Notification('🛒 Panier partagé !', {
                                    body: `${share.fromName} vous a partagé un panier de courses.`,
                                    icon: '/icon-192x192.png',
                                    tag: share.id,
                                });
                            });
                        } else {
                            new Notification('🛒 Panier partagé !', {
                                body: `${share.fromName} vous a partagé un panier de courses.`,
                                icon: '/icon-192x192.png',
                                tag: share.id,
                            });
                        }
                    }
                }
            });

        } catch (err) {
            console.error('[KeepAlive] Polling error:', err);
        } finally {
            setIsPolling(false);
        }
    }, [user?.uid, isOnline]);

    useEffect(() => {
        if (!user?.uid || !isOnline) {
            // Cleanup si déconnecté ou offline
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            return;
        }

        // Poll initial
        poll();

        // Si les notifications push sont activées, on ne fait pas de polling régulier (économie de batterie/data)
        // On s'appuie sur le push FCM en background, et on rafraîchit au retour sur l'onglet
        const hasPushEnabled = typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted';

        if (!hasPushEnabled) {
            // Démarrer l'intervalle classique pour ceux sans notifications push
            intervalRef.current = setInterval(() => {
                poll();
            }, KEEP_ALIVE_INTERVAL);
        }

        // Gérer la visibilité de l'onglet
        const handleVisibilityChange = () => {
            if (document.hidden) {
                isHiddenRef.current = true;
            } else {
                isHiddenRef.current = false;
                // Poll immédiatement au retour sur l'onglet (permet de récupérer l'état si l'app a été ouverte via une notif)
                poll();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [user?.uid, isOnline, poll]);

    return { lastPollAt, isPolling, pendingShares };
}
