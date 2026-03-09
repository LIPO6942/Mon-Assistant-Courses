import { initializeApp } from 'firebase/app';
import { getMessaging, onBackgroundMessage } from 'firebase/messaging/sw';

// This is the background service worker for Firebase Cloud Messaging.
// It must be located at the root of the public folder.

const firebaseConfig = {
    apiKey: self.location.search.split('apiKey=')[1]?.split('&')[0],
    authDomain: self.location.search.split('authDomain=')[1]?.split('&')[0],
    projectId: self.location.search.split('projectId=')[1]?.split('&')[0],
    storageBucket: self.location.search.split('storageBucket=')[1]?.split('&')[0],
    messagingSenderId: self.location.search.split('messagingSenderId=')[1]?.split('&')[0],
    appId: self.location.search.split('appId=')[1]?.split('&')[0],
};

// We receive the config via query params from the registration to avoid hardcoding or double-maintenance
// But since Service Worker environment doesn't easily have access to process.env, 
// we'll use a simpler script or the user can hardcode after deployment.
// Standard way for Firebase:
const app = initializeApp({
    apiKey: true, // placeholders, we usually hardcode these or use a builder
    // Due to the complexity of dynamic config in SW without a build step, 
    // we'll guide the user to fill this in or provide a script to generate it.
});

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
