// Service worker minimal : nécessaire pour que Chrome/Android propose
// "Ajouter à l'écran d'accueil" comme une vraie icône d'application (PWA).
const CACHE_NAME = 'esb-kick-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
