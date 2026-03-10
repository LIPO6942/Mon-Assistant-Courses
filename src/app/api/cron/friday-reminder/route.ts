import { NextResponse } from 'next/server';
import { adminDb, adminMessaging } from '@/lib/firebase-admin';

export async function GET(request: Request) {
    // 1. Security Check
    const authHeader = request.headers.get('Authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (authHeader !== `Bearer ${cronSecret}`) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        // 2. Fetch all users from Firestore who have FCM tokens
        const usersSnapshot = await adminDb.collection('users').get();

        let totalTokens = 0;
        const sendPromises = [];

        for (const doc of usersSnapshot.docs) {
            const userData = doc.data();
            const tokens: string[] = userData.fcmTokens || [];

            if (tokens.length > 0) {
                totalTokens += tokens.length;

                // Construct message
                const message = {
                    data: {
                        title: '🛒 C\'est le week-end !',
                        body: 'Avez-vous préparé votre panier de courses pour le week-end ?',
                        type: 'weekly_reminder'
                    },
                    tokens: tokens,
                };

                sendPromises.push(adminMessaging.sendEachForMulticast(message));
            }
        }

        if (sendPromises.length === 0) {
            return NextResponse.json({ message: 'No tokens found to notify' });
        }

        // 3. Send all notifications
        const results = await Promise.all(sendPromises);

        const successCount = results.reduce((acc, res) => acc + res.successCount, 0);
        const failureCount = results.reduce((acc, res) => acc + res.failureCount, 0);

        return NextResponse.json({
            success: true,
            totalUsersTargeted: sendPromises.length,
            totalTokens: totalTokens,
            successCount,
            failureCount
        });

    } catch (error: any) {
        console.error('Weekly Notification Cron Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
