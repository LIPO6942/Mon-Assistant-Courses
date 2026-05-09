'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useOnlineStatus } from './useOnlineStatus';

const KEEP_ALIVE_INTERVAL = 30000; // 30 secondes

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

                    // 2. Notification native si permission accordée et onglet visible ou caché
                    if (typeof window !== 'undefined' && 'Notification' in window) {
                        if (Notification.permission === 'granted') {
                            new Notification('🛒 Panier partagé !', {
                                body: `${share.fromName} vous a partagé un panier de courses.`,
                                icon: '/icon-192x192.png',
                                tag: share.id,
                                data: { shareId: share.id, type: 'basket_share' }
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

        // Démarrer l'intervalle
        intervalRef.current = setInterval(() => {
            if (!isHiddenRef.current) {
                poll();
            }
        }, KEEP_ALIVE_INTERVAL);

        // Gérer la visibilité de l'onglet (intelligence du polling)
        const handleVisibilityChange = () => {
            if (document.hidden) {
                isHiddenRef.current = true;
            } else {
                isHiddenRef.current = false;
                // Poll immédiatement au retour sur l'onglet
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
