const FILES_TO_CACHE = [
  "/",
 "/index.html",
 "/index.js",
 "/db.js",
 "/styles.css",
 "icons/icon-192x192.png",
 "icons/icon-512x512.png",
 "/manifest.webmanifest",
 "/service-worker.js",
];

const STATIC_PRECACHE = "static-precache";
const RUNTIME = "runtime-cache";

self.addEventListener('install', (e) => {
  e.waitUntil( caches.open(PRECACHE)
    //caches must all be retrieved on install fails
      .then((cache) => cache.addAll(FILES_TO_CACHE))
      .then(self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  const cachesUsed = [PRECACHE, RUNTIME];
  e.waitUntil( caches.keys()
      //array.filter returns those caches not matching cachesUsed
      .then(cacheNames => cacheNames.filter(cacheName => !cachesUsed.includes(cacheName)))
      //and then deletes them
      .then(cachesToDelete => Promise.all(cachesToDelete.map(cacheToDelete => caches.delete(cacheToDelete))))
      .then(() => self.clients.claim())
  );
});

// self.addEventListener("fetch", e => {
//  // return out of function if GET isn't request or it's window's location
//  if (e.request.method !== "GET" || e.request.url.startsWith(self.location.origin)) {
//    e.respondWith(fetch(e.request));
//    return;
//  }

//   //cache API response
//   if (e.request.url.includes("/api/")) {
//     e.respondWith( caches.open(runtime)
//       .then(cache => {
//          return fetch(e.request)
//           .then(response => {
//             console.log("Response is..." + res);
//             //on successful response, copy into cache
//             if (res.status === 200)
//               cache.put(e.request, res.clone());
//             return res;
//           })
//           //network offline, request from cache
//           .catch(() => caches.match(e.request));
//       })
//     );
//     return;
//   }

 //serve static assets for non-API requests
 e.respondWith(
   caches.match(e.request).then(cachedResponse => {
     if (cachedResponse) {
       return cachedResponse;
     }

     //Cache doesn't have requested resource, so try it with network.
     return caches.open(RUNTIME)
      .then(cache => fetch(e.request)
        .then(res => cache.put(e.request, res.clone())
          .then(() => res))
      );
   })
 );
});