import { NextResponse } from 'next/server';
import { Client } from '@upstash/qstash';
import { adminDb } from '@/lib/firebase-admin';

const qstash = new Client({ token: process.env.QSTASH_TOKEN! });

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: Request) {
    try {
        const { userId, ingredientNames, purchaseTime, leadTimeMinutes } = await request.json();

        if (!userId || !ingredientNames?.length || !purchaseTime) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Calculate notification time
        const purchaseDate = new Date(purchaseTime);
        const notifyDate = new Date(purchaseDate.getTime() - leadTimeMinutes * 60 * 1000);

        if (notifyDate <= new Date()) {
            return NextResponse.json({ error: 'Notification time is in the past' }, { status: 400 });
        }

        // 2. Save reminder to Firestore (pending)
        const reminderData = {
            userId,
            ingredientNames,
            purchaseTime,
            notifyTime: notifyDate.toISOString(),
            leadTimeMinutes,
            status: 'pending',
            createdAt: new Date().toISOString(),
        };

        const colRef = adminDb.collection('reminders').doc(userId).collection('items');
        const docRef = await colRef.add(reminderData);
        const reminderId = docRef.id;

        // 3. Schedule QStash job with forced protocol and logs
        let host = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL || 'localhost:3000';
        
        if (!host.startsWith('http')) {
            host = host.includes('localhost') ? `http://${host}` : `https://${host}`;
        }
        
        const targetUrl = `${host.replace(/\/$/, '')}/api/reminders/send`;
        
        console.log(`[Reminder] Scheduling QStash:`);
        console.log(` - Target URL: ${targetUrl}`);
        console.log(` - Current Server Time: ${new Date().toISOString()}`);
        console.log(` - Scheduled Notify Time: ${notifyDate.toISOString()}`);

        const qstashResponse = await qstash.publishJSON({
            url: targetUrl,
            body: { reminderId, userId },
            notBefore: Math.floor(notifyDate.getTime() / 1000), // Unix timestamp in seconds
        });

        console.log(` - QStash Response ID: ${qstashResponse.messageId}`);

        // 4. Update Firestore with qstashMessageId for reference
        await docRef.update({ qstashMessageId: qstashResponse.messageId });

        return NextResponse.json({
            success: true,
            reminderId,
            notifyTime: notifyDate.toISOString(),
            qstashMessageId: qstashResponse.messageId,
        });

    } catch (error: any) {
        console.error('Error creating reminder:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// GET: fetch user's pending reminders
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
        }

        const snap = await adminDb
            .collection('reminders')
            .doc(userId)
            .collection('items')
            .where('status', '==', 'pending')
            .get();

        const reminders = snap.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .sort((a: any, b: any) => new Date(a.notifyTime).getTime() - new Date(b.notifyTime).getTime());
            
        return NextResponse.json({ reminders });

    } catch (error: any) {
        console.error('Error fetching reminders:', error);
        return NextResponse.json({ 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            reminders: [] 
        }, { status: 500 });
    }
}

// DELETE: cancel a reminder
export async function DELETE(request: Request) {
    try {
        const { userId, reminderId } = await request.json();

        if (!userId || !reminderId) {
            return NextResponse.json({ error: 'Missing userId or reminderId' }, { status: 400 });
        }

        await adminDb
            .collection('reminders')
            .doc(userId)
            .collection('items')
            .doc(reminderId)
            .update({ status: 'cancelled' });

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Error cancelling reminder:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
