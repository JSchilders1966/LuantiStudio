// ─────────────────────────────────────────────
// LuantiStudio — service worker (PWA offline app-shell)
// ─────────────────────────────────────────────

const CACHE_VERSION = 'v3';
const CACHE_NAME = `luantistudio-${CACHE_VERSION}`;

const APP_SHELL = [
  './',
  './index.html',
  './style.css',
  './manifest.json',
  './js/i18n.js',
  './js/ui.js',
  './js/storage.js',
  './js/blocks.js',
  './js/generator.js',
  './js/examples.js',
  './js/app.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
];

// Extern geladen libraries — best-effort gecached zodat de app ook
// offline (of vanaf het eerste bezoek in een PWA-venster) blijft werken.
const CDN_ASSETS = [
  'https://unpkg.com/blockly/blockly_compressed.js',
  'https://unpkg.com/blockly/blocks_compressed.js',
  'https://unpkg.com/blockly/msg/en.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/codemirror.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/codemirror.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/mode/lua/lua.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/addon/edit/matchbrackets.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/addon/selection/active-line.min.js',
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(APP_SHELL);
    await Promise.all(CDN_ASSETS.map(async url => {
      try {
        const resp = await fetch(url, { mode: 'no-cors' });
        await cache.put(url, resp);
      } catch (e) {
        // Geen internet tijdens install — wordt bij eerstvolgend
        // succesvol bezoek alsnog gecached via de fetch-handler.
      }
    }));
  })());
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n)));
    await self.clients.claim();
  })());
});

// Same-origin app-bestanden (HTML/CSS/JS/manifest): network-first, met
// cache als offline-fallback. Cache-first zou hier betekenen dat een
// code-update NOOIT bij een terugkerende gebruiker aankomt totdat de
// cache handmatig geleegd wordt — dat leverde tijdens ontwikkeling al
// verwarrende "het werkt niet"-situaties op met verouderde JS.
// Cross-origin CDN-bestanden zijn gepind op een exacte versie in de URL
// en veranderen dus nooit; die blijven cache-first voor snelheid/offline.
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const isSameOrigin = new URL(event.request.url).origin === self.location.origin;

  event.respondWith((async () => {
    if (isSameOrigin) {
      try {
        const response = await fetch(event.request);
        if (response && response.ok) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(event.request, response.clone());
        }
        return response;
      } catch (err) {
        const cached = await caches.match(event.request, { ignoreVary: true });
        if (cached) return cached;
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
        throw err;
      }
    }

    const cached = await caches.match(event.request, { ignoreVary: true });
    if (cached) return cached;
    try {
      const response = await fetch(event.request);
      if (response && (response.ok || response.type === 'opaque')) {
        const cache = await caches.open(CACHE_NAME);
        cache.put(event.request, response.clone());
      }
      return response;
    } catch (err) {
      throw err;
    }
  })());
});
