importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

const CACHE_NAME = 'mac-master-v3';
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/favicon.ico',
];

// --- 1. BACKGROUND SYNC (OFFLINE QUEUE) ---
if (typeof workbox !== 'undefined') {
  const bgSyncPlugin = new workbox.backgroundSync.BackgroundSyncPlugin('mac-offline-queue', {
    maxRetentionTime: 24 * 60, // Réessaie pendant 24h max
  });

  // Met en file d'attente les requêtes POST vers /api/notify (ex: remerciements) si hors-ligne
  workbox.routing.registerRoute(
    /\/api\/notify/,
    new workbox.strategies.NetworkOnly({
      plugins: [bgSyncPlugin],
    }),
    'POST'
  );
}

// --- 2. OFFLINE CACHING & CONTROLLER LOGIC ---

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
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
  
  if (
    url.origin.includes('extension') || 
    url.origin.includes('firebase') || 
    url.pathname.startsWith('/api/') ||
    url.origin.includes('google')
  ) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request).then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      }).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
      });
    })
  );
});

// --- 2. FIREBASE MESSAGING LOGIC ---

let firebaseLoaded = false;

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
        firebaseLoaded = true;
        
        messaging.onBackgroundMessage((payload) => {
            console.log('[sw.js] Received messaging: ', payload);
            const notificationTitle = payload.data?.title || 'Mon Assistant Courses';
            const notificationOptions = {
                body: payload.data?.body || 'Nouvelle mise à jour',
                icon: '/icon-192x192.png',
                badge: '/icon-192x192.png',
                tag: payload.data?.shareId || payload.data?.type || 'default',
                requireInteraction: true,
                data: payload.data
            };
            self.registration.showNotification(notificationTitle, notificationOptions);
        });
    }
} catch (e) {
    console.error('Firebase scripts failed to load in SW:', e);
}

// --- 3. NATIVE PUSH FALLBACK (ne s'exécute que si Firebase n'a pas chargé) ---
// Cela évite les doublons : si firebaseLoaded est true, onBackgroundMessage gère tout.

self.addEventListener('push', (event) => {
    if (firebaseLoaded) {
        // Firebase messaging gère déjà l'affichage via onBackgroundMessage
        return;
    }

    console.log('[sw.js] Push fallback (Firebase not loaded):', event);
    
    let payload = {};
    try {
        payload = event.data ? event.data.json() : {};
    } catch (e) {
        payload = { data: { title: 'Mon Assistant Courses', body: event.data ? event.data.text() : 'Nouvelle mise à jour' } };
    }

    const title = payload.data?.title || payload.notification?.title || 'Mon Assistant Courses';
    const body = payload.data?.body || payload.notification?.body || 'Nouvelle mise à jour';
    const tag = payload.data?.shareId || payload.data?.type || 'default';

    event.waitUntil(
        self.registration.showNotification(title, {
            body: body,
            icon: '/icon-192x192.png',
            badge: '/icon-192x192.png',
            tag: tag,
            requireInteraction: true,
            data: payload.data || payload
        })
    );
});

// --- 4. NOTIFICATION CLICK (deep linking vers l'app) ---

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const notificationData = event.notification.data || {};
    const type = notificationData.type || '';
    const shareId = notificationData.shareId || '';
    
    // Build target URL with deep link params if it's a basket share
    let targetUrl = '/';
    if (type === 'basket_share' && shareId) {
        targetUrl = `/?shareId=${shareId}`;
    }

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // If a client (tab/PWA) is already open, focus it and navigate
            for (const client of clientList) {
                if (new URL(client.url).origin === self.location.origin && 'focus' in client) {
                    client.focus();
                    if ('navigate' in client) {
                        client.navigate(targetUrl);
                    }
                    return;
                }
            }
            // Otherwise open a new window
            return clients.openWindow(targetUrl);
        })
    );
});
