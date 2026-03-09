import { NextResponse } from 'next/server';
import { adminDb, adminMessaging } from '@/lib/firebase-admin';

export async function POST(request: Request) {
    try {
        const { targetUserId, title, body, data } = await request.json();

        if (!targetUserId) {
            return NextResponse.json({ error: 'Target User ID is required' }, { status: 400 });
        }

        // 1. Get user's FCM tokens from Firestore
        const userDoc = await adminDb.collection('users').doc(targetUserId).get();

        if (!userDoc.exists) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const userData = userDoc.data();
        const tokens: string[] = userData?.fcmTokens || [];

        if (tokens.length === 0) {
            return NextResponse.json({ message: 'No notification tokens found for this user' }, { status: 200 });
        }

        // 2. Send data-only notification to all tokens
        // Do NOT include a 'notification' field – FCM auto-displays it AND onBackgroundMessage also shows one = duplicates
        const message = {
            data: {
                title: title || 'Mon Assistant Courses',
                body: body || 'Vous avez reçu une nouvelle mise à jour.',
                ...(data || {}),
            },
            tokens: tokens,
        };

        const response = await adminMessaging.sendEachForMulticast(message);

        // 3. Optional: Cleanup invalid tokens
        if (response.failureCount > 0) {
            const failedTokens: string[] = [];
            response.responses.forEach((resp: { success: boolean; error?: any }, idx: number) => {
                if (!resp.success) {
                    const error = resp.error as any;
                    if (error?.code === 'messaging/invalid-registration-token' ||
                        error?.code === 'messaging/registration-token-not-registered') {
                        failedTokens.push(tokens[idx]);
                    }
                }
            });

            if (failedTokens.length > 0) {
                await adminDb.collection('users').doc(targetUserId).update({
                    fcmTokens: tokens.filter(t => !failedTokens.includes(t))
                });
            }
        }

        return NextResponse.json({
            success: true,
            successCount: response.successCount,
            failureCount: response.failureCount
        });

    } catch (error: any) {
        console.error('Push notification error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
