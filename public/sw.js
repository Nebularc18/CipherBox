const CACHE_NAME = 'cipherforge-shell-v1'
const APP_SHELL = [
  './',
  './index.html',
  './favicon.svg',
  './manifest.webmanifest',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName)),
      ))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const request = event.request

  if (request.method !== 'GET') {
    return
  }

  const requestUrl = new URL(request.url)

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone()
            return caches.open(CACHE_NAME)
              .then((cache) => cache.put('./', copy))
              .then(() => response)
          }

          return response
        })
        .catch(() => caches.match(request).then((cached) => cached ?? caches.match('./'))),
    )
    return
  }

  if (requestUrl.origin !== self.location.origin) {
    return
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        return cached
      }

      return fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone()
          return caches.open(CACHE_NAME)
            .then((cache) => cache.put(request, copy))
            .then(() => response)
        }

        return response
      })
    }),
  )
})
