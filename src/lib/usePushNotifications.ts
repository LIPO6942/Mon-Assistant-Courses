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
                const currentToken = await getToken(messaging, {
                    vapidKey: process.env.NEXT_PUBLIC_VAPID_KEY
                });

                if (currentToken) {
                    setToken(currentToken);
                    await saveTokenToFirestore(currentToken);
                } else {
                    console.log('No registration token available. Request permission to generate one.');
                }
            }
        } catch (error) {
            console.error('An error occurred while retrieving token:', error);
        }
    }, [saveTokenToFirestore]);

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

    return { token, permission, requestPermission };
}
