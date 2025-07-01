
const CACHE_NAME = 'mon-assistant-courses-cache-v1';
const urlsToCache = [
  '/',
  '/styles/globals.css', // Assurez-vous que les chemins correspondent à votre structure
  '/app/page.tsx',      // idem
  // Ajoutez d'autres ressources statiques importantes ici (JS, images de base, etc.)
  // NE PAS mettre en cache manifest.json ici, pour pouvoir le mettre à jour facilement.
];

// Étape 1: Installation du Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installation...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Mise en cache des fichiers de base');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        return self.skipWaiting(); // Force le nouveau SW à devenir actif immédiatement
      })
  );
});

// Étape 2: Activation du Service Worker et nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activation...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Suppression de l\'ancien cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
        return self.clients.claim(); // Prend le contrôle de la page immédiatement
    })
  );
});

// Étape 3: Interception des requêtes réseau (stratégie "Cache d'abord, puis réseau")
self.addEventListener('fetch', (event) => {
  // On ne met pas en cache les requêtes non-GET (POST, PUT, etc.)
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Pour les requêtes de navigation (pages HTML), on privilégie le réseau pour avoir la version la plus fraîche,
  // avec un fallback sur le cache en cas d'échec (hors ligne).
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match('/')) // Fallback vers la page d'accueil en cache
    );
    return;
  }

  // Pour les autres ressources (CSS, JS, images), on utilise la stratégie "Cache d'abord"
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Si la ressource est dans le cache, on la retourne
        if (response) {
          return response;
        }

        // Sinon, on va la chercher sur le réseau
        return fetch(event.request).then(
          (networkResponse) => {
            // Et on la met en cache pour les prochaines fois
            // On vérifie qu'on a bien une réponse valide avant de la mettre en cache
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            // Important: On clone la réponse. Une réponse est un flux (Stream)
            // et ne peut être consommée qu'une seule fois.
            const responseToCache = networkResponse.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          }
        );
      })
      .catch(() => {
        // En cas d'erreur (ex: pas de réseau et pas dans le cache),
        // on pourrait retourner une image ou une ressource de fallback
        // Pour l'instant, on laisse l'erreur se produire
      })
  );
});
