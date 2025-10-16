const CACHE_NAME = 'finance-tracker-v1';
const FILES_TO_CACHE = [
  '/', '/index.html', '/styles/main.css', '/scripts/ui.js', '/scripts/storage.js'
  // add other static assets and fonts you need cached
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(resp => resp || fetch(event.request))
  );
});
