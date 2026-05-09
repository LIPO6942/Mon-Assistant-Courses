import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(request: Request) {
    try {
        const { userId } = await request.json();

        if (!userId) {
            return NextResponse.json({ error: 'userId is required' }, { status: 400 });
        }

        const sharesSnap = await adminDb
            .collection('basket_shares')
            .where('toUid', '==', userId)
            .where('status', '==', 'pending')
            .orderBy('createdAt', 'desc')
            .limit(10)
            .get();

        const shares = sharesSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return NextResponse.json({ shares, count: shares.length });

    } catch (error: any) {
        console.error('[Poll API] Error fetching pending shares:', error);
        return NextResponse.json({ error: error.message, shares: [], count: 0 }, { status: 500 });
    }
}
