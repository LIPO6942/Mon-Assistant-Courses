import { NextResponse } from 'next/server';
import { verifySignatureAppRouter } from '@upstash/qstash/nextjs';
import { adminDb, adminMessaging } from '@/lib/firebase-admin';

async function handler(request: Request) {
    console.log('[Reminder] Received notification request from QStash');
    try {
        const body = await request.json();
        console.log('[Reminder] Request body:', JSON.stringify(body));
        const { reminderId, userId } = body;

        if (!reminderId || !userId) {
            console.error('[Reminder] Missing reminderId or userId');
            return NextResponse.json({ error: 'Missing reminderId or userId' }, { status: 400 });
        }

        // 1. Read reminder from Firestore
        const reminderRef = adminDb
            .collection('reminders')
            .doc(userId)
            .collection('items')
            .doc(reminderId);

        const reminderSnap = await reminderRef.get();

        if (!reminderSnap.exists) {
            console.log(`[Reminder] Reminder ${reminderId} not found, skipping.`);
            return NextResponse.json({ message: 'Reminder not found' }, { status: 200 });
        }

        const reminder = reminderSnap.data()!;

        // 2. Guard: only send if still pending
        if (reminder.status !== 'pending') {
            console.log(`[Reminder] Reminder ${reminderId} is ${reminder.status}, skipping.`);
            return NextResponse.json({ message: `Reminder already ${reminder.status}` }, { status: 200 });
        }

        // 3. Get user FCM tokens
        const userDoc = await adminDb.collection('users').doc(userId).get();
        if (!userDoc.exists) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        const tokens: string[] = userDoc.data()?.fcmTokens || [];

        if (tokens.length > 0) {
            // 4. Build notification content
            const ingredientList = reminder.ingredientNames.join(', ');
            const purchaseTime = new Date(reminder.purchaseTime);
            const timeStr = purchaseTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

            const message = {
                data: {
                    title: '⏰ Rappel courses',
                    body: `N'oubliez pas d'acheter : ${ingredientList} dans ${reminder.leadTimeMinutes} min (prévu à ${timeStr})`,
                    type: 'ingredient_reminder',
                    reminderId,
                },
                tokens,
            };

            const response = await adminMessaging.sendEachForMulticast(message);
            console.log(`[Reminder] Sent to ${response.successCount} devices, ${response.failureCount} failed.`);

            // 5. Cleanup invalid tokens
            if (response.failureCount > 0) {
                const failedTokens: string[] = [];
                response.responses.forEach((resp: any, idx: number) => {
                    if (!resp.success) {
                        const code = resp.error?.code;
                        if (code === 'messaging/invalid-registration-token' ||
                            code === 'messaging/registration-token-not-registered') {
                            failedTokens.push(tokens[idx]);
                        }
                    }
                });
                if (failedTokens.length > 0) {
                    await adminDb.collection('users').doc(userId).update({
                        fcmTokens: tokens.filter(t => !failedTokens.includes(t))
                    });
                }
            }
        }

        // 6. Mark reminder as sent
        await reminderRef.update({ status: 'sent', sentAt: new Date().toISOString() });

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('[Reminder] Error sending reminder notification:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Wrap with QStash signature verification for security
export const POST = verifySignatureAppRouter(handler);
