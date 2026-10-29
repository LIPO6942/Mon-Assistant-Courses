import admin from 'firebase-admin';

function initFirebaseAdmin() {
    if (!admin.apps.length) {
        try {
            const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
            const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
            const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

            if (projectId && clientEmail && privateKey) {
                admin.initializeApp({
                    credential: admin.credential.cert({
                        projectId,
                        clientEmail,
                        privateKey,
                    }),
                });
                console.log('Firebase Admin initialized successfully');
            } else {
                console.warn('Firebase Admin credentials missing or incomplete in environment');
            }
        } catch (error) {
            console.error('Firebase Admin initialization error', error);
        }
    }
    return admin;
}

export const adminDb = new Proxy({} as FirebaseFirestore.Firestore, {
    get(_target, prop) {
        initFirebaseAdmin();
        if (!admin.apps.length) {
            throw new Error('Firebase Admin Firestore is not initialized (missing environment credentials).');
        }
        const db = admin.firestore();
        const value = (db as any)[prop];
        return typeof value === 'function' ? value.bind(db) : value;
    },
});

export const adminMessaging = new Proxy({} as admin.messaging.Messaging, {
    get(_target, prop) {
        initFirebaseAdmin();
        if (!admin.apps.length) {
            throw new Error('Firebase Admin Messaging is not initialized (missing environment credentials).');
        }
        const messaging = admin.messaging();
        const value = (messaging as any)[prop];
        return typeof value === 'function' ? value.bind(messaging) : value;
    },
});

export default admin;

