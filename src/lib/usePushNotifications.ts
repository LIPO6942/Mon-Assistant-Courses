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
                if ('serviceWorker' in navigator) {
                    // Reuse the existing SW registered by PWAHandler instead of registering again
                    const registration = await navigator.serviceWorker.ready;
                    console.log('Using existing Service Worker for FCM:', registration.scope);

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


