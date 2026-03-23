import { useState, useEffect, useCallback } from 'react';
import { messaging, auth, firestoreDb } from './firebase';
import { getToken, onMessage } from 'firebase/messaging';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';

export function usePushNotifications() {
    const [token, setToken] = useState<string | null>(null);
    const [permission, setPermission] = useState<NotificationPermission>('default');

    const saveTokenToFirestore = useCallback(async (fcmToken: string) => {
        const user = auth.currentUser;
        if (!user) return;

        try {
            const userRef = doc(firestoreDb, 'users', user.uid);
            await updateDoc(userRef, {
                fcmTokens: arrayUnion(fcmToken),
                lastFCMUpdate: new Date().toISOString()
            });
            console.log('FCM Token saved to Firestore');
        } catch (error) {
            console.error('Error saving FCM token:', error);
        }
    }, []);

    const requestPermission = useCallback(async () => {
        if (!messaging) return;

        try {
            const status = await Notification.requestPermission();
            setPermission(status);

            if (status === 'granted') {
                // Register Service Worker with config as query params
                if ('serviceWorker' in navigator) {
                    const config = {
                        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
                        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
                        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
                        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
                        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
                    };

                    const queryString = new URLSearchParams(config as any).toString();
                    const swUrl = `/firebase-messaging-sw.js?${queryString}`;

                    console.log('Registering Service Worker for FCM...');
                    const registration = await navigator.serviceWorker.register(swUrl);
                    console.log('Service Worker registered successfully:', registration.scope);

                    // Wait for the service worker to be active before requesting token
                    const sw = registration.installing || registration.waiting || registration.active;
                    if (sw && sw.state !== 'activated') {
                        await new Promise<void>((resolve) => {
                            sw.addEventListener('statechange', function handler() {
                                if (sw.state === 'activated') {
                                    sw.removeEventListener('statechange', handler);
                                    resolve();
                                }
                            });
                        });
                        console.log('Service Worker is now active.');
                    }

                    console.log('Requesting FCM token with VAPID Key:', process.env.NEXT_PUBLIC_VAPID_KEY ? 'Present' : 'Missing');
                    const currentToken = await getToken(messaging, {
                        vapidKey: process.env.NEXT_PUBLIC_VAPID_KEY,
                        serviceWorkerRegistration: registration
                    });

                    if (currentToken) {
                        console.log('FCM Token generated successfully');
                        setToken(currentToken);
                        await saveTokenToFirestore(currentToken);
                    } else {
                        console.warn('No registration token available. Request permission to generate one.');
                    }
                }
            }
        } catch (error) {
            console.error('An error occurred while retrieving token:', error);
        }
    }, [saveTokenToFirestore]);

    const resetPushNotifications = useCallback(async () => {
        const user = auth.currentUser;
        if (!user || !token) return;

        try {
            // Firestore cleanup is tricky with arrayUnion but we can't easily arrayRemove specific token without knowing it
            // However, we can just request a new one which will re-run saveTokenToFirestore
            // To be thorough, we unregister the SW part if possible, or just re-request.
            console.log('Resetting push notifications...');
            
            // Re-request permission (will skip if already granted but re-runs token fetch)
            await requestPermission();
        } catch (error) {
            console.error('Error resetting push notifications:', error);
        }
    }, [token, requestPermission]);

    useEffect(() => {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            setPermission(Notification.permission);

            // Handle foreground messages
            if (messaging) {
                const unsubscribe = onMessage(messaging, (payload) => {
                    console.log('Foreground message received:', payload);
                    // You could show a custom toast here if you want
                });
                return () => unsubscribe();
            }
        }
    }, []);

    // Automatically request/refresh token if permission is already granted when user logs in
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user && Notification.permission === 'granted') {
                requestPermission();
            }
        });
        return () => unsubscribe();
    }, [requestPermission]);

    const disablePushNotifications = useCallback(async () => {
        const user = auth.currentUser;
        if (!user || !token) return;

        try {
            const { arrayRemove } = await import('firebase/firestore');
            const userRef = doc(firestoreDb, 'users', user.uid);
            await updateDoc(userRef, {
                fcmTokens: arrayRemove(token)
            });
            setToken(null);
            console.log('FCM Token removed from Firestore');
        } catch (error) {
            console.error('Error disabling push notifications:', error);
        }
    }, [token]);

    return { token, permission, requestPermission, resetPushNotifications, disablePushNotifications };
}


