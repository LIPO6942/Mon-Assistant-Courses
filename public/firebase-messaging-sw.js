import { initializeApp } from 'firebase/app';
import { getMessaging, onBackgroundMessage } from 'firebase/messaging/sw';

// This is the background service worker for Firebase Cloud Messaging.
// It must be located at the root of the public folder.

const params = new URLSearchParams(self.location.search);

const firebaseConfig = {
    apiKey: params.get('apiKey'),
    authDomain: params.get('authDomain'),
    projectId: params.get('projectId'),
    storageBucket: params.get('storageBucket'),
    messagingSenderId: params.get('messagingSenderId'),
    appId: params.get('appId'),
};

if (!firebaseConfig.apiKey) {
    console.warn('[firebase-messaging-sw.js] Firebase config missing in URL params. This might be due to a page refresh or direct navigation.');
}

// We receive the config via query params from the registration to avoid hardcoding or double-maintenance
// But since Service Worker environment doesn't easily have access to process.env, 
// we'll use a simpler script or the user can hardcode after deployment.
// Standard way for Firebase:
const app = initializeApp(firebaseConfig);

const messaging = getMessaging(app);

onBackgroundMessage(messaging, (payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/icons/icon-192x192.png', // Adjust as needed
        data: payload.data
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
