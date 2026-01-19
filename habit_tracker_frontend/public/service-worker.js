/* Simple offline-first service worker (no Workbox) */
const CACHE_NAME = "habit-tracker-shell-v2";
const SHELL_URLS = ["/", "/index.html", "/manifest.json", "/favicon.ico", "/robots.txt"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(SHELL_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  const isSameOrigin = url.origin === self.location.origin;

  // SPA navigation: fallback to cached index.html
  const accept = req.headers.get("accept") || "";
  const isNavigation = req.mode === "navigate" || accept.includes("text/html");
  if (isSameOrigin && isNavigation) {
    event.respondWith(
      caches.match("/index.html").then((cached) => {
        const net = fetch(req)
          .then((resp) => {
            const copy = resp.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put("/index.html", copy));
            return resp;
          })
          .catch(() => cached);
        return cached || net;
      })
    );
    return;
  }

  // Runtime cache: cache-first for same-origin GET requests
  if (isSameOrigin) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req)
          .then((resp) => {
            if (resp && resp.status === 200 && resp.type === "basic") {
              const copy = resp.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
            }
            return resp;
          })
          .catch(() => cached);
      })
    );
  }
});
