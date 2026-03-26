const CACHE_NAME = 'mac-master-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/favicon.ico',
];

// --- 1. OFFLINE CACHING & CONTROLLER LOGIC ---

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Use { cache: 'reload' } to ensure we get fresh assets
      return Promise.all(
        ASSETS_TO_CACHE.map(url => {
            return fetch(url, { cache: 'reload' })
                .then(response => {
                    if (response.ok) return cache.put(url, response);
                    throw new Error(`Failed to cache ${url}`);
                })
                .catch(err => console.log('Pre-cache error:', err));
        })
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  
  // Skip external APIs and extensions
  if (
    url.origin.includes('extension') || 
    url.origin.includes('firebase') || 
    url.pathname.startsWith('/api/') ||
    url.origin.includes('google')
  ) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Return cached response if found
      if (cachedResponse) return cachedResponse;

      // Otherwise fetch and cache
      return fetch(event.request).then((response) => {
        // Only cache successful same-origin responses
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      }).catch(() => {
        // On failure (offline), try to return the cached root for navigation
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
      });
    })
  );
});

// --- 2. FIREBASE MESSAGING LOGIC ---

try {
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
            console.log('[sw.js] Received messaging: ', payload);
            const notificationTitle = payload.data?.title || 'Mon Assistant Courses';
            const notificationOptions = {
                body: payload.data?.body || 'Nouvelle mise à jour',
                icon: '/icon-192x192.png',
                data: payload.data
            };
            self.registration.showNotification(notificationTitle, notificationOptions);
        });
    }

    self.addEventListener('notificationclick', (event) => {
        event.notification.close();
        event.waitUntil(
            clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
                for (const client of clientList) {
                    if (client.url === '/' && 'focus' in client) return client.focus();
                }
                return clients.openWindow('/');
            })
        );
    });
} catch (e) {
    console.error('Firebase scripts failed to load in SW:', e);
}
