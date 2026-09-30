// Minimal service worker so browsers treat Library Nest as an installable app.
// Always goes to the network first; falls back to a cached copy of the page when offline.
var CACHE = 'library-nest-v1';

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(['/', '/manifest.webmanifest', '/icons/icon-192.png', '/icons/icon-512.png']); }));
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== self.location.origin) return;
  e.respondWith(fetch(e.request).catch(function () {
    return caches.match(e.request).then(function (r) { return r || caches.match('/'); });
  }));
});
