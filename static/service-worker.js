const CACHE_NAME = "vision-cache-v1";
const OFFLINE_URL = "/";

const FILES_TO_CACHE = [
  "/",
  "/static/manifest.json",
  "/static/script.js",
  "/static/style.css",
  "/static/icons/icon-192.png",
  "/static/icons/icon-512.png",
  "/static/icons/icon-1024.png"
];

// Install
self.addEventListener("install", (evt) => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

// Activate - clean up old caches
self.addEventListener("activate", (evt) => {
  evt.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.map((key) => { if (key !== CACHE_NAME) return caches.delete(key); })
    ))
  );
  self.clients.claim();
});

// Fetch - Network-first, fallback to cache
self.addEventListener("fetch", (evt) => {
  // only handle GET requests
  if (evt.request.method !== "GET") return;

  evt.respondWith(
    fetch(evt.request)
      .then((res) => {
        // store a clone in cache
        const resClone = res.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(evt.request, resClone);
        });
        return res;
      })
      .catch(() => caches.match(evt.request).then((r) => r || caches.match(OFFLINE_URL)))
  );
});
