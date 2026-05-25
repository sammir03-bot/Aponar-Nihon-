const STATIC_CACHE = "aponar-nihon-static-v3";
const DYNAMIC_CACHE = "aponar-nihon-dynamic-v3";

const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/logo.png",
  "/aponar-nihon(1).png"
];

const MAX_DYNAMIC_CACHE_ITEMS = 120;

// Cache size limit
async function trimCache(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();

  if (keys.length > maxItems) {
    await cache.delete(keys[0]);
    await trimCache(cacheName, maxItems);
  }
}

// Install
self.addEventListener("install", (event) => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// Activate
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => {
        return Promise.all(
          keys.map((key) => {
            if (key !== STATIC_CACHE && key !== DYNAMIC_CACHE) {
              return caches.delete(key);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Manual update support
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// Fetch
self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Only cache same-origin files
  const isSameOrigin = url.origin === self.location.origin;

  // HTML pages => Network First
  if (
    request.mode === "navigate" ||
    (request.headers.get("accept") || "").includes("text/html")
  ) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (isSameOrigin && networkResponse && networkResponse.ok) {
            const copy = networkResponse.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, copy);
              trimCache(DYNAMIC_CACHE, MAX_DYNAMIC_CACHE_ITEMS);
            });
          }

          return networkResponse;
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            return (
              cached ||
              caches.match("/index.html") ||
              caches.match("/")
            );
          });
        })
    );
    return;
  }

  // CSS & JS => Stale While Revalidate
  if (
    isSameOrigin &&
    (url.pathname.endsWith(".css") || url.pathname.endsWith(".js"))
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.ok) {
              const copy = networkResponse.clone();
              caches.open(DYNAMIC_CACHE).then((cache) => {
                cache.put(request, copy);
                trimCache(DYNAMIC_CACHE, MAX_DYNAMIC_CACHE_ITEMS);
              });
            }

            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // Images => Cache First
  if (
    isSameOrigin &&
    (
      request.destination === "image" ||
      url.pathname.endsWith(".png") ||
      url.pathname.endsWith(".jpg") ||
      url.pathname.endsWith(".jpeg") ||
      url.pathname.endsWith(".webp") ||
      url.pathname.endsWith(".svg")
    )
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;

        return fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.ok) {
              const copy = networkResponse.clone();
              caches.open(DYNAMIC_CACHE).then((cache) => {
                cache.put(request, copy);
                trimCache(DYNAMIC_CACHE, MAX_DYNAMIC_CACHE_ITEMS);
              });
            }

            return networkResponse;
          })
          .catch(() => caches.match("/logo.png"));
      })
    );
    return;
  }

  // Default => Network First
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        if (isSameOrigin && networkResponse && networkResponse.ok) {
          const copy = networkResponse.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, copy);
            trimCache(DYNAMIC_CACHE, MAX_DYNAMIC_CACHE_ITEMS);
          });
        }

        return networkResponse;
      })
      .catch(() => caches.match(request))
  );
});
