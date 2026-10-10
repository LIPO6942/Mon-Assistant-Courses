import { NextResponse } from 'next/server';
import { adminDb, adminMessaging } from '@/lib/firebase-admin';
import { discoverableRecipes } from '@/lib/data';

const normalize = (s: string) =>
    s.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/['’\-]/g, ' ')
        .replace(/[^a-z0-9 ]/g, '')
        .trim();

const STOP_WORDS = new Set([
    'de', 'des', 'du', 'au', 'aux', 'a', 'et', 'le', 'la', 'les', 'un', 'une', 'd', 'l',
    'en', 'pour', 'avec', 'sans', 'sur', 'dans', 'frais', 'fraiche', 'moulu', 'hache', 'rape', 'blanc', 'rouge'
]);

function extractSignificantTokens(name: string): string[] {
    return normalize(name)
        .split(/\s+/)
        .filter(t => t.length >= 3 && !STOP_WORDS.has(t));
}

export async function GET(request: Request) {
    // 1. Security Check
    const authHeader = request.headers.get('Authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (authHeader !== `Bearer ${cronSecret}`) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        // 2. Filter 100 international recipes (excluding local Tunisian dishes)
        const internationalRecipes = discoverableRecipes.filter(
            r => r.country && !r.country.toLowerCase().includes('tunisie')
        );

        if (internationalRecipes.length === 0) {
            return NextResponse.json({ message: 'No international recipes found' });
        }

        // Default rotation recipe for Month (Scenario B fallback)
        const now = new Date();
        const monthIndex = now.getFullYear() * 12 + now.getMonth();
        const defaultMonthlyRecipe = internationalRecipes[monthIndex % internationalRecipes.length];

        // 3. Fetch all users from Firestore
        const usersSnapshot = await adminDb.collection('users').get();

        let totalTokens = 0;
        let personalizedMatches = 0;
        let fallbacksUsed = 0;
        const sendPromises = [];

        for (const doc of usersSnapshot.docs) {
            const userId = doc.id;
            const userData = doc.data();
            const tokens: string[] = userData.fcmTokens || [];

            if (tokens.length === 0) continue;

            totalTokens += tokens.length;

            // Fetch user's pantry, basket and purchase history in parallel
            const [pantrySnap, basketSnap, historySnap] = await Promise.all([
                adminDb.collection('users').doc(userId).collection('data').doc('pantry').get().catch(() => null),
                adminDb.collection('users').doc(userId).collection('data').doc('basket').get().catch(() => null),
                adminDb.collection('users').doc(userId).collection('data').doc('purchaseHistory').get().catch(() => null),
            ]);

            const userTokens = new Set<string>();

            // 1. Pantry items
            const pantryItems: any[] = pantrySnap?.data()?.items || [];
            pantryItems.forEach(item => {
                if (item?.name) {
                    extractSignificantTokens(item.name).forEach(t => userTokens.add(t));
                }
            });

            // 2. Basket items
            const basketItems: any[] = basketSnap?.data()?.items || [];
            basketItems.forEach(item => {
                if (item?.name) {
                    extractSignificantTokens(item.name).forEach(t => userTokens.add(t));
                }
            });

            // 3. Purchase history
            const historyData = historySnap?.data()?.data || {};
            Object.keys(historyData).forEach(name => {
                extractSignificantTokens(name).forEach(t => userTokens.add(t));
            });

            // Evaluate best matching international recipe
            let bestRecipeMatch: {
                recipe: (typeof internationalRecipes)[0];
                matchedNames: string[];
                matchCount: number;
                matchRatio: number;
            } | null = null;

            if (userTokens.size > 0) {
                for (const recipe of internationalRecipes) {
                    const matched: string[] = [];
                    recipe.ingredients.forEach(ing => {
                        const ingTokens = extractSignificantTokens(ing.name);
                        const hasMatch = ingTokens.some(token => userTokens.has(token));
                        if (hasMatch) {
                            matched.push(ing.name);
                        }
                    });

                    const matchCount = matched.length;
                    const matchRatio = matchCount / recipe.ingredients.length;

                    if (matchCount > 0) {
                        if (
                            !bestRecipeMatch ||
                            matchCount > bestRecipeMatch.matchCount ||
                            (matchCount === bestRecipeMatch.matchCount && matchRatio > bestRecipeMatch.matchRatio)
                        ) {
                            bestRecipeMatch = {
                                recipe,
                                matchedNames: matched,
                                matchCount,
                                matchRatio,
                            };
                        }
                    }
                }
            }

            let title = '';
            let body = '';
            let selectedRecipe = defaultMonthlyRecipe;

            if (bestRecipeMatch && bestRecipeMatch.matchCount > 0) {
                // Scénario A : Ingrédients détectés chez l'utilisateur (Score > 0)
                personalizedMatches++;
                selectedRecipe = bestRecipeMatch.recipe;
                title = `🌍 Escapade du 20 : ${selectedRecipe.title}`;

                const countDisplay = `${bestRecipeMatch.matchCount}/${selectedRecipe.ingredients.length}`;
                if (bestRecipeMatch.matchedNames.length >= 2) {
                    body = `Vous avez déjà ${bestRecipeMatch.matchedNames.slice(0, 2).join(' et ')} ! Découvrez ce délice [${selectedRecipe.country}] (${countDisplay} ingrédients prêts).`;
                } else {
                    body = `Vous avez déjà ${bestRecipeMatch.matchedNames[0]} chez vous ! Découvrez ce classique [${selectedRecipe.country}] en vidéo.`;
                }
            } else {
                // Scénario B : Aucun ingrédient stocké ou nouveau compte (Découverte mensuelle)
                fallbacksUsed++;
                selectedRecipe = defaultMonthlyRecipe;
                title = `🌍 Escapade du 20 : ${defaultMonthlyRecipe.title}`;
                body = `[${defaultMonthlyRecipe.country}] Envie d'évasion ce mois-ci ? Découvrez ce classique international et cuisinez-le en vidéo !`;
            }

            const message = {
                data: {
                    title,
                    body,
                    recipeId: selectedRecipe.id,
                    url: `/?recipeId=${selectedRecipe.id}`,
                    type: 'international_dish_monthly'
                },
                tokens: tokens,
            };

            sendPromises.push(adminMessaging.sendEachForMulticast(message));
        }

        if (sendPromises.length === 0) {
            return NextResponse.json({
                message: 'No tokens found to notify',
                defaultMonthlyDish: defaultMonthlyRecipe.title,
                country: defaultMonthlyRecipe.country
            });
        }

        // 4. Send all notifications
        const results = await Promise.all(sendPromises);
        const successCount = results.reduce((acc: number, res: any) => acc + res.successCount, 0);
        const failureCount = results.reduce((acc: number, res: any) => acc + res.failureCount, 0);

        return NextResponse.json({
            success: true,
            totalUsersTargeted: sendPromises.length,
            totalTokens,
            personalizedMatches,
            fallbacksUsed,
            successCount,
            failureCount,
            defaultMonthlyDish: defaultMonthlyRecipe.title,
            country: defaultMonthlyRecipe.country
        });

    } catch (error: any) {
        console.error('International Dish Notification Cron Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
