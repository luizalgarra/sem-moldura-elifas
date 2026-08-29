/* Elifas Andreato — Além da Moldura
   Service worker do catálogo. Suba CACHE_VERSION para invalidar tudo. */

const CACHE_VERSION = "v1";
const SHELL = `shell-${CACHE_VERSION}`;
const ASSETS = `assets-${CACHE_VERSION}`;
const IMAGES = `images-${CACHE_VERSION}`;
const AUDIO = `audio-${CACHE_VERSION}`;

const OFFLINE_URL = "/offline.html";
const IMAGE_LIMIT = 250;
const AUDIO_LIMIT = 60;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL)
      .then((c) => c.addAll(["/", OFFLINE_URL]))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  const keep = new Set([SHELL, ASSETS, IMAGES, AUDIO]);
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => !keep.has(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

async function trim(cacheName, limit) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > limit) {
    await Promise.all(keys.slice(0, keys.length - limit).map((k) => cache.delete(k)));
  }
}

async function cacheFirst(request, cacheName, limit) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(request);
  if (hit) return hit;
  const res = await fetch(request);
  if (res.ok || res.type === "opaque") {
    cache.put(request, res.clone());
    if (limit) trim(cacheName, limit);
  }
  return res;
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(request);
  const network = fetch(request)
    .then((res) => {
      if (res.ok) cache.put(request, res.clone());
      return res;
    })
    .catch(() => hit);
  return hit || network;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // 1. Navegações: network-first.
  //    A exposição fica no ar até 20/09 e o conteúdo pode ser corrigido durante a mostra.
  //    Cache-first aqui congelaria o catálogo numa versão velha no telefone do visitante.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(SHELL).then((c) => c.put(request, copy));
          return res;
        })
        .catch(async () => (await caches.match(request)) || caches.match(OFFLINE_URL))
    );
    return;
  }

  // 2. Áudio-descrição
  if (/\.(mp3|m4a|aac|ogg|wav)$/i.test(url.pathname)) {
    event.respondWith(cacheFirst(request, AUDIO, AUDIO_LIMIT));
    return;
  }

  // 3. Imagens das obras
  if (url.pathname.startsWith("/__l5e/") || /\.(png|jpe?g|webp|avif|svg)$/i.test(url.pathname)) {
    event.respondWith(cacheFirst(request, IMAGES, IMAGE_LIMIT));
    return;
  }

  // 4. JS e CSS com hash no nome
  if (url.pathname.startsWith("/assets/")) {
    event.respondWith(staleWhileRevalidate(request, ASSETS));
  }
});
