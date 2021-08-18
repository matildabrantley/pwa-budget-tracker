const files_to_cache = [
    '/',
    '/index.html',
    '/assets/style.css',
    'https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.1/normalize.min.css',
  ];

const precache = 'precache';
const runtime = 'runtime';

self.addEventListener('install', (e) => {
  e.waitUntil( caches.open(precache)
    //caches must all be retrieved on install fails
      .then((cache) => cache.addAll(files_to_cache))
      .then(self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  const cachesUsed = [precache, runtime];
  e.waitUntil( caches.keys()
      //array.filter returns those caches not matching cachesUsed
      .then(cacheNames => cacheNames.filter(cacheName => !cachesUsed.includes(cacheName)))
      //and then deletes them
      .then(cachesToDelete => Promise.all(cachesToDelete.map(cacheToDelete => caches.delete(cacheToDelete))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.url.startsWith(self.location.origin)) {
    e.respondWith( caches.match(e.request)
    .then((cacheRes) => {
        //Use cache if it exists
        if (cacheRes != undefined)
          return cacheRes;
        //otherwise fallback to retrieving this resource from the network
        else {
          return caches.open(runtime).then((cache) => fetch(e.request)
            .then((res) => cache.put(e.request, res.clone())
            .then(() => res)));
        }
      })
    );
  }
  //cache API response
  else if (e.request.url.includes("/api/")) {
    e.respondWith( caches.open(runtime)
      .then(cache => {
         return fetch(e.request)
          .then(res => {
            cache.put(e.request, res.clone());
            return res;
          })
          .catch(() => caches.match(e.request));
      })
    );
    return;
  }

  //serve static assets for non-API requests
  e.respondWith( caches.open(precache)
    .then(cache => cache.match(e.request).then(res => res || fetch(e.request)))
  );
});

