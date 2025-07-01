// A version number is used to bust the cache when you deploy new versions.
const CACHE_NAME = 'kitchen-assistant-cache-v2';

// A list of files to cache when the service worker is installed.
const urlsToCache = [
  '/', // The root of the app
];

// The install event is fired when the service worker is first installed.
self.addEventListener('install', (event) => {
  // We wait until the cache is opened and the app shell is cached.
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache and caching app shell');
      return cache.addAll(urlsToCache);
    })
  );
});

// The activate event is fired when the service worker is activated.
// This is a good place to clean up old caches.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // If a cache's name is different from our current cache name, delete it.
          if (cacheName !== CACHE_NAME) {
            console.log('Service worker: clearing old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// The fetch event is fired for every request the page makes.
self.addEventListener('fetch', (event) => {
  // We're using a "cache-first" strategy.
  event.respondWith(
    caches.match(event.request).then((response) => {
      // If we have a cached response, return it.
      if (response) {
        return response;
      }
      // Otherwise, fetch the resource from the network.
      return fetch(event.request);
    })
  );
});
