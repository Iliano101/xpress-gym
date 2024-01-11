const cacheName = "gym-v1";
const staticAssets = [
    "./",
    "./index.html",
    "./style.css",
    "./index.js",
    "./sw.js",
    "./manifest.webmanifest",
    "./assets/512px-icon.png",
    "./assets/maskable-icon.png",
    "./assets/svg-icon.svg"
];


self.addEventListener("install", async err => {
    caches.delete(cacheName);
    const cache = await caches.open(cacheName);
    await cache.addAll(staticAssets);
    return self.skipWaiting();
});


self.addEventListener("activate", event => {
    self.clients.claim();
});


self.addEventListener("fetch", async event => {
    const req = event.request;
    const url = new URL(req.url);

    if (url.origin === location.origin) {
        event.respondWith(cacheFirst(req));
    }
    else {
        event.respondWith(networkAndCache(req));
    }
});

async function cacheFirst(req) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(req);
    return cached || fetch(req);
}

async function networkAndCache(req) {
    const cache = await caches.open(cacheName);
    try {
        const fresh = await fetch(req);
        await cache.put(req, fresh.clone());
        return fresh;
    }
    catch (err) {
        const cached = await cache.match(req);
        return cached;
    }
}