// This is the background service worker for Firebase Cloud Messaging.
// It must be located at the root of the public folder.

// Import Firebase scripts from CDN
importScripts('https://www.gstatic.com/firebasejs/11.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.0.0/firebase-messaging-compat.js');

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
    console.warn('[firebase-messaging-sw.js] Firebase config missing in URL params. If this is during local development, ensure you provide the config.');
}

// Initialize Firebase using the compat (v8) syntax inside the service worker
const app = firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);

    const notificationTitle = payload.notification?.title || 'Mon Assistant Courses';
    const notificationOptions = {
        body: payload.notification?.body || 'Nouvelle mise à jour',
        icon: '/icons/icon-192x192.png',
        data: payload.data
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
