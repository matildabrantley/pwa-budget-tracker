const files_to_cache = [
    '/',
    '/index.html',
    '/assets/style.css',
    'https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.1/normalize.min.css',
  ];

const precache = 'precache';
const runtime = 'runtime';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(precache)
      .then((cache) => cache.addAll(files_to_cache))
      .then(self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  const cachesUsed = [precache, runtime];
  event.waitUntil(
    caches.keys()
      .then(cacheNames => cacheNames.filter(cacheName => !cachesUsed.includes(cacheName)))
      .then(cachesToDelete => Promise.all(cachesToDelete.map(cacheToDelete => caches.delete(cacheToDelete))))
      .then(() => self.clients.claim())
  );
});