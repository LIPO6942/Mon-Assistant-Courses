import { useEffect, useRef } from 'react';
import type { BasketItem } from '@/lib/types';

const BASKET_THRESHOLD = 6; // nombre de produits distincts pour déclencher le rappel
const LS_KEY = 'basketAbandonmentActive'; // clé localStorage pour éviter les doublons

/**
 * Hook qui surveille le panier et déclenche un rappel via QStash après 7 jours
 * si le panier contient ≥ 6 produits distincts non achetés.
 *
 * - Si le panier atteint 6 produits distincts → POST /api/basket-abandonment
 * - Si le panier passe sous 6 produits ou est vidé → DELETE /api/basket-abandonment
 */
export function useBasketAbandonmentReminder(basket: BasketItem[], userId: string | undefined) {
    // Utiliser une ref pour suivre si un reminder est déjà actif côté client
    // sans déclencher de re-render inutile
    const isReminderActive = useRef<boolean>(false);
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        // Restaurer l'état actif depuis localStorage au montage
        const stored = localStorage.getItem(LS_KEY);
        isReminderActive.current = stored === 'true';
    }, []);

    useEffect(() => {
        // Pas d'utilisateur connecté → rien à faire
        if (!userId) return;

        // Compter les produits distincts NON achetés dans le panier
        const unpurchasedItems = basket.filter(item => !item.purchased);
        const unpurchasedCount = unpurchasedItems.length;

        // Debounce pour éviter de spammer l'API lors d'ajouts rapides successifs
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        debounceTimer.current = setTimeout(async () => {
            if (unpurchasedCount >= BASKET_THRESHOLD && !isReminderActive.current) {
                // Seuil atteint et aucun reminder actif → créer le reminder
                console.log(`[BasketAbandonment] Basket reached ${unpurchasedCount} items. Scheduling 7-day reminder.`);
                try {
                    const res = await fetch('/api/basket-abandonment', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            userId,
                            itemNames: unpurchasedItems.map(i => i.name),
                        }),
                    });

                    if (res.ok) {
                        isReminderActive.current = true;
                        localStorage.setItem(LS_KEY, 'true');
                        console.log('[BasketAbandonment] Reminder scheduled successfully.');
                    } else {
                        console.warn('[BasketAbandonment] Failed to schedule reminder:', await res.text());
                    }
                } catch (err) {
                    console.error('[BasketAbandonment] Error scheduling reminder:', err);
                }

            } else if (unpurchasedCount < BASKET_THRESHOLD && isReminderActive.current) {
                // Panier retombé sous le seuil → annuler le reminder
                console.log(`[BasketAbandonment] Basket now has ${unpurchasedCount} items. Cancelling reminder.`);
                try {
                    const res = await fetch('/api/basket-abandonment', {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ userId }),
                    });

                    if (res.ok) {
                        isReminderActive.current = false;
                        localStorage.removeItem(LS_KEY);
                        console.log('[BasketAbandonment] Reminder cancelled successfully.');
                    } else {
                        console.warn('[BasketAbandonment] Failed to cancel reminder:', await res.text());
                    }
                } catch (err) {
                    console.error('[BasketAbandonment] Error cancelling reminder:', err);
                }
            }
        }, 1500); // délai de 1.5s pour laisser le state se stabiliser

        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
    }, [basket, userId]);
}
