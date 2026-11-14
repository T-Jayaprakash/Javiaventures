// Javia app shell. Only the main pages and their assets are handled here;
// everything else, including /roofing/ and /demo/, goes straight to the network.
const CACHE = "javia-v4";
const SHELL = ["/", "/services/", "/work/", "/contact/", "/manifest.webmanifest", "/logo-light.png", "/icon-192.png", "/jayaprakash.jpg",
  "/work/racks.jpg", "/work/vpresidency.jpg", "/work/vks.jpg", "/work/jayple.jpg", "/work/idealneet.jpg", "/work/bhaibiryani.jpg"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  const isFont = url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com";
  const isShell = url.origin === location.origin && SHELL.includes(url.pathname);
  if (!isFont && !isShell) return;

  // Network first, so a new price or offer shows up as soon as it is published.
  e.respondWith(fetch(e.request).then((res) => {
    if (res.ok || res.type === "opaque") {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(e.request, copy));
    }
    return res;
  }).catch(() => caches.match(e.request, {ignoreSearch: true})));
});
