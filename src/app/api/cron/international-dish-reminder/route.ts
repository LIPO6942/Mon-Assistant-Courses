import { NextResponse } from 'next/server';
import { adminDb, adminMessaging } from '@/lib/firebase-admin';
import { discoverableRecipes } from '@/lib/data';

export async function GET(request: Request) {
    // 1. Security Check
    const authHeader = request.headers.get('Authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (authHeader !== `Bearer ${cronSecret}`) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        // 2. Select international recipe based on year & month
        const now = new Date();
        const monthIndex = now.getFullYear() * 12 + now.getMonth();
        const internationalRecipes = discoverableRecipes.filter(r => r.country && !r.country.toLowerCase().includes('tunisie'));

        if (internationalRecipes.length === 0) {
            return NextResponse.json({ message: 'No international recipes found' });
        }

        const selectedRecipe = internationalRecipes[monthIndex % internationalRecipes.length];

        // 3. Fetch all users from Firestore who have FCM tokens
        const usersSnapshot = await adminDb.collection('users').get();

        let totalTokens = 0;
        const sendPromises = [];

        for (const doc of usersSnapshot.docs) {
            const userData = doc.data();
            const tokens: string[] = userData.fcmTokens || [];

            if (tokens.length > 0) {
                totalTokens += tokens.length;

                const message = {
                    data: {
                        title: `🌍 Escapade du 20 : ${selectedRecipe.title}`,
                        body: `[${selectedRecipe.country}] Découvrez ce classique international et cuisinez-le en vidéo !`,
                        recipeId: selectedRecipe.id,
                        url: `/?recipeId=${selectedRecipe.id}`,
                        type: 'international_dish_monthly'
                    },
                    tokens: tokens,
                };

                sendPromises.push(adminMessaging.sendEachForMulticast(message));
            }
        }

        if (sendPromises.length === 0) {
            return NextResponse.json({
                message: 'No tokens found to notify',
                selectedRecipe: selectedRecipe.title,
                country: selectedRecipe.country
            });
        }

        // 4. Send all notifications
        const results = await Promise.all(sendPromises);
        const successCount = results.reduce((acc: number, res: any) => acc + res.successCount, 0);
        const failureCount = results.reduce((acc: number, res: any) => acc + res.failureCount, 0);

        return NextResponse.json({
            success: true,
            totalUsersTargeted: sendPromises.length,
            totalTokens: totalTokens,
            successCount,
            failureCount,
            featuredDish: selectedRecipe.title,
            country: selectedRecipe.country,
            recipeId: selectedRecipe.id
        });

    } catch (error: any) {
        console.error('International Dish Notification Cron Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
