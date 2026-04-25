import { NextResponse } from 'next/server';
import { Client } from '@upstash/qstash';
import { adminDb } from '@/lib/firebase-admin';

const qstash = new Client({ token: process.env.QSTASH_TOKEN! });

const BASKET_ABANDONMENT_THRESHOLD = 6; // nombre de produits distincts
const DELAY_DAYS = 7;                   // délai avant notification

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// POST : crée (ou remplace) un reminder d'abandon de panier pour l'utilisateur
export async function POST(request: Request) {
    try {
        const { userId, itemNames } = await request.json();

        if (!userId || !itemNames?.length) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        if (itemNames.length < BASKET_ABANDONMENT_THRESHOLD) {
            return NextResponse.json({ error: `Basket has fewer than ${BASKET_ABANDONMENT_THRESHOLD} items` }, { status: 400 });
        }

        const now = new Date();
        const notifyAt = new Date(now.getTime() + DELAY_DAYS * 24 * 60 * 60 * 1000);

        // Calculer l'URL cible pour QStash
        const requestHost = request.headers.get('host') || process.env.VERCEL_URL || 'localhost:3000';
        const protocol = requestHost.includes('localhost') ? 'http' : 'https';
        const targetUrl = `${protocol}://${requestHost}/api/cron/basket-abandonment`;

        console.log(`[BasketAbandonment] Scheduling QStash for user ${userId}`);
        console.log(` - Notify at: ${notifyAt.toISOString()}`);
        console.log(` - Items (${itemNames.length}): ${itemNames.slice(0, 3).join(', ')}...`);

        // Annuler tout reminder précédent (status: cancelled) avant d'en créer un nouveau
        const docRef = adminDb.collection('basketAbandonmentReminders').doc(userId);
        const existing = await docRef.get();
        if (existing.exists && existing.data()?.status === 'pending') {
            console.log(` - Replacing existing pending reminder`);
        }

        // Sauvegarder dans Firestore AVANT de scheduler QStash
        // (on met un placeholder, on mettra à jour avec le messageId après)
        await docRef.set({
            userId,
            itemNames,
            itemCount: itemNames.length,
            scheduledAt: now.toISOString(),
            notifyAt: notifyAt.toISOString(),
            status: 'pending',
            qstashMessageId: null,
        });

        // Scheduler dans QStash
        const qstashResponse = await qstash.publishJSON({
            url: targetUrl,
            body: { userId },
            notBefore: Math.floor(notifyAt.getTime() / 1000),
        });

        console.log(` - QStash Message ID: ${qstashResponse.messageId}`);

        // Mettre à jour avec le messageId QStash
        await docRef.update({ qstashMessageId: qstashResponse.messageId });

        return NextResponse.json({
            success: true,
            notifyAt: notifyAt.toISOString(),
            qstashMessageId: qstashResponse.messageId,
        });

    } catch (error: any) {
        console.error('[BasketAbandonment] Error creating reminder:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE : annule le reminder actif de l'utilisateur
export async function DELETE(request: Request) {
    try {
        const { userId } = await request.json();

        if (!userId) {
            return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
        }

        const docRef = adminDb.collection('basketAbandonmentReminders').doc(userId);
        const existing = await docRef.get();

        if (!existing.exists || existing.data()?.status !== 'pending') {
            // Pas de reminder actif, rien à faire
            return NextResponse.json({ success: true, message: 'No active reminder to cancel' });
        }

        await docRef.update({ status: 'cancelled' });
        console.log(`[BasketAbandonment] Cancelled reminder for user ${userId}`);

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('[BasketAbandonment] Error cancelling reminder:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
