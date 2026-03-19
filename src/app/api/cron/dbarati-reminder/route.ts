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
        const now = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);
        
        // We compare dates without time for the "30 days ago" match
        const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

        // 2. Fetch all users from Firestore
        const usersSnapshot = await adminDb.collection('users').get();
        
        const results = {
            totalUsersHandled: 0,
            notificationsSent: 0,
            failures: 0
        };

        const notificationPromises = [];

        for (const userDoc of usersSnapshot.docs) {
            const userId = userDoc.id;
            const userData = userDoc.data();
            const tokens: string[] = userData.fcmTokens || [];

            if (tokens.length === 0) continue;

            results.totalUsersHandled++;

            // 3. Fetch user's dbarati data
            const dbaratiSnap = await adminDb.collection('users').doc(userId).collection('data').doc('dbarati').get();
            
            if (!dbaratiSnap.exists) continue;

            const dbaratiItems: any[] = dbaratiSnap.data()?.items || [];
            
            // 4. Find items prepared exactly 30 days ago
            const itemsToRemind = dbaratiItems.filter(item => {
                if (!item.lastPreparedAt || !item.done) return false;
                
                const preparedDate = new Date(item.lastPreparedAt).toISOString().split('T')[0];
                return preparedDate === thirtyDaysAgoStr;
            });

            if (itemsToRemind.length > 0) {
                // Send a combined notification if multiple items match
                const dishNames = itemsToRemind.map(i => i.text).join(', ');
                const title = itemsToRemind.length > 1 ? "🍳 Vos classiques du mois !" : "🍳 Envie d'un classique ?";
                const body = itemsToRemind.length > 1 
                    ? `Vous avez préparé ces plats il y a un mois : ${dishNames}. Envie de les refaire ?`
                    : `Vous avez préparé "${dishNames}" il y a un mois. C'est peut-être le moment de le refaire !`;

                const message = {
                    data: {
                        title,
                        body,
                        type: 'dbarati_reminder',
                        dishNames: dishNames
                    },
                    tokens: tokens,
                };

                notificationPromises.push(
                    adminMessaging.sendEachForMulticast(message)
                        .then(res => {
                            results.notificationsSent += res.successCount;
                            results.failures += res.failureCount;
                        })
                );
            }
        }

        await Promise.all(notificationPromises);

        return NextResponse.json({
            success: true,
            ...results,
            targetDate: thirtyDaysAgoStr
        });

    } catch (error: any) {
        console.error('Dbarati Reminder Cron Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
