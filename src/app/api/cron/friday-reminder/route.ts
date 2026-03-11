import { NextResponse } from 'next/server';
import { adminDb, adminMessaging } from '@/lib/firebase-admin';

const WEEKLY_MESSAGES = [
    {
        title: "🛒 C'est le week-end !",
        body: "Avez-vous préparé votre panier de courses pour le week-end ?"
    },
    {
        title: "🍎 Envie de fraicheur ?",
        body: "C'est le moment de prévoir vos fruits et légumes pour la semaine."
    },
    {
        title: "🍳 Qu'est-ce qu'on mange ?",
        body: "Inspirez-vous de vos recettes préférées pour remplir votre panier !"
    },
    {
        title: "🛒 Prêt pour les courses !",
        body: "Organisez votre liste maintenant pour gagner du temps au magasin."
    },
    {
        title: "🥗 Manger sain ce week-end ?",
        body: "Ajoutez quelques ingrédients frais à votre panier de courses."
    },
    {
        title: "🛒 N'oubliez rien !",
        body: "Faites le tour de vos placards et complétez votre panier."
    },
    {
        title: "🥖 Le pain est sur la liste ?",
        body: "Pensez aux essentiels pour un week-end gourmand."
    },
    {
        title: "🍝 Soirée Pasta ?",
        body: "Vérifiez s'il vous reste de la sauce et du parmesan !"
    },
    {
        title: "🛒 Shopping malin",
        body: "Planifiez vos repas pour éviter le gaspillage alimentaire."
    },
    {
        title: "☕ Un bon petit-déjeuner ?",
        body: "Prévoyez tout ce qu'il faut pour un réveil en douceur demain."
    },
    {
        title: "🍕 Soirée Pizza en vue ?",
        body: "N'oubliez pas la pâte et votre garniture préférée !"
    },
    {
        title: "🧼 Les essentiels de la maison",
        body: "Produits ménagers, hygiène... avez-vous tout ce qu'il vous faut ?"
    }
];

export async function GET(request: Request) {
    // 1. Security Check
    const authHeader = request.headers.get('Authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (authHeader !== `Bearer ${cronSecret}`) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        // 2. Select message based on week number to ensure it changes every week
        const now = new Date();
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const pastDaysOfYear = (now.getTime() - startOfYear.getTime()) / 86400000;
        const weekIndex = Math.floor((pastDaysOfYear + startOfYear.getDay()) / 7);
        const selectedMessage = WEEKLY_MESSAGES[weekIndex % WEEKLY_MESSAGES.length];

        // 3. Fetch all users from Firestore who have FCM tokens
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
                        title: selectedMessage.title,
                        body: selectedMessage.body,
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
            messageSent: selectedMessage.title
        });

    } catch (error: any) {
        console.error('Weekly Notification Cron Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
