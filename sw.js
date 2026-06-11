// Network-first service worker: keeps the app fresh while online and
// serves the last good copy of the shell and assets when offline.
const CACHE = 'bloodtrack-v1'

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      try {
        const fresh = await fetch(request)
        if (new URL(request.url).origin === self.location.origin && fresh.ok) {
          cache.put(request, fresh.clone())
        }
        return fresh
      } catch {
        const cached = await cache.match(request)
        if (cached) return cached
        if (request.mode === 'navigate') {
          const shell = await cache.match('./index.html')
          if (shell) return shell
        }
        return Response.error()
      }
    })
  )
})
