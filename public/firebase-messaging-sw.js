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

    // Data-only messages: title/body are in payload.data
    const notificationTitle = payload.data?.title || 'Mon Assistant Courses';
    const notificationOptions = {
        body: payload.data?.body || 'Nouvelle mise à jour',
        icon: '/icon-192x192.png',
        data: payload.data
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// Open the app when the user clicks on a notification
self.addEventListener('notificationclick', (event) => {
    console.log('[firebase-messaging-sw.js] Notification click received.');
    event.notification.close();

    // Try to focus an existing window or open a new one
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if (client.url.includes('mon-assistant-courses') && 'focus' in client) {
                    return client.focus();
                }
            }
            return clients.openWindow('/');
        })
    );
});
