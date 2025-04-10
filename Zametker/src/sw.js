// sw.js
const CACHE_NAME = 'my-app-cache-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/assets/icon-app.svg',
  '/assets/logo512.png',
  '/assets/logo128.png',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // IMPORTANT: Clone the request. This is essential to make the
        // request work once when the service worker is serving the
        // response and once when it is passing on the request to the
        // network.
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          response => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // IMPORTANT: Clone the response. This is necessary because the response is a stream
            // and because we want the browser to consume the response
            // as well as the cache.
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) { // CACHE_NAME из предыдущего шага
            return caches.delete(cacheName); // Удаляем старые кеши
          }
        })
      );
    })
  );

  self.skipWaiting(); // Немедленно активируем новый service worker
  return self.clients.claim(); // Берем под контроль все открытые вкладки
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});