import { NextResponse } from 'next/server';
import { verifySignatureAppRouter } from '@upstash/qstash/nextjs';
import { adminDb, adminMessaging } from '@/lib/firebase-admin';

async function handler(request: Request) {
    console.log('[BasketAbandonment] Received notification request from QStash');
    try {
        const body = await request.json();
        const { userId } = body;

        if (!userId) {
            console.error('[BasketAbandonment] Missing userId');
            return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
        }

        // 1. Lire le reminder depuis Firestore
        const docRef = adminDb.collection('basketAbandonmentReminders').doc(userId);
        const snap = await docRef.get();

        if (!snap.exists) {
            console.log(`[BasketAbandonment] No reminder found for user ${userId}, skipping.`);
            return NextResponse.json({ message: 'Reminder not found' }, { status: 200 });
        }

        const reminder = snap.data()!;

        // 2. Garde-fou : n'envoyer que si le status est toujours 'pending'
        if (reminder.status !== 'pending') {
            console.log(`[BasketAbandonment] Reminder for ${userId} is '${reminder.status}', skipping.`);
            return NextResponse.json({ message: `Reminder already ${reminder.status}` }, { status: 200 });
        }

        // 3. Récupérer les tokens FCM de l'utilisateur
        const userDoc = await adminDb.collection('users').doc(userId).get();
        const tokens: string[] = userDoc.data()?.fcmTokens || [];
        console.log(`[BasketAbandonment] Found ${tokens.length} FCM tokens for user ${userId}`);

        if (tokens.length > 0) {
            // 4. Construire le contenu de la notification
            const itemCount = reminder.itemCount as number;
            const itemNames = (reminder.itemNames as string[]).slice(0, 3);
            const itemPreview = itemNames.join(', ') + (itemCount > 3 ? `... et ${itemCount - 3} autres` : '');

            const message = {
                data: {
                    title: '🛒 Votre panier vous attend !',
                    body: `Vous avez ${itemCount} article${itemCount > 1 ? 's' : ''} non achetés : ${itemPreview}`,
                    type: 'basket_abandonment',
                    click_action: '/',
                },
                tokens,
            };

            const response = await adminMessaging.sendEachForMulticast(message);
            console.log(`[BasketAbandonment] Sent to ${response.successCount} devices, ${response.failureCount} failed.`);

            // 5. Nettoyer les tokens invalides
            if (response.failureCount > 0) {
                const failedTokens: string[] = [];
                response.responses.forEach((resp: any, idx: number) => {
                    if (!resp.success) {
                        const code = resp.error?.code;
                        if (
                            code === 'messaging/invalid-registration-token' ||
                            code === 'messaging/registration-token-not-registered'
                        ) {
                            failedTokens.push(tokens[idx]);
                        }
                    }
                });
                if (failedTokens.length > 0) {
                    await adminDb.collection('users').doc(userId).update({
                        fcmTokens: tokens.filter(t => !failedTokens.includes(t)),
                    });
                }
            }
        } else {
            console.log(`[BasketAbandonment] No FCM tokens for user ${userId}, marking as sent anyway.`);
        }

        // 6. Marquer comme envoyé
        await docRef.update({ status: 'sent', sentAt: new Date().toISOString() });

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('[BasketAbandonment] Error sending notification:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Sécurisé par la vérification de signature QStash
export const POST = verifySignatureAppRouter(handler);
