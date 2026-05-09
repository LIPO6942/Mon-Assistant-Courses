// This is the background service worker for Firebase Cloud Messaging.
// It must NOT use skipWaiting() or clients.claim() to avoid interfering with the offline caching service worker.

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

if (firebaseConfig.apiKey) {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    const messaging = firebase.messaging();
    
    messaging.onBackgroundMessage((payload) => {
        console.log('[firebase-messaging-sw.js] Received background message ', payload);
        const notificationTitle = payload.data?.title || 'Mon Assistant Courses';
        const notificationOptions = {
            body: payload.data?.body || 'Nouvelle mise à jour',
            icon: '/icon-192x192.png',
            badge: '/badge-icon.png',
            data: payload.data
        };
        self.registration.showNotification(notificationTitle, notificationOptions);
    });
}

// Open the app when the user clicks on a notification
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if ('focus' in client) return client.focus();
            }
            return clients.openWindow('/');
        })
    );
});
