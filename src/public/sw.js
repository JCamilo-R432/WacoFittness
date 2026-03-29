// WacoPro Fitness — Service Worker v2.0
// Offline-first strategy with stale-while-revalidate

const CACHE_NAME = 'wacopro-v2';
const STATIC_CACHE = 'wacopro-static-v2';
const API_CACHE = 'wacopro-api-v2';

// Assets to pre-cache on install
const PRECACHE_ASSETS = [
  '/dashboard',
  '/workout-builder',
  '/exercise-library',
  '/meal-planner',
  '/recovery',
  '/periodized-plans',
  '/manifest.json',
];

// API endpoints to cache (stale-while-revalidate)
const CACHEABLE_API_PATTERNS = [
  /\/api\/training\/workouts/,
  /\/api\/nutrition\/foods/,
  /\/api\/training\/exercises/,
  /\/api\/supplements\/catalog/,
  /\/api\/auth\/me/,
];

// ── Install ────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Pre-caching static assets');
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[SW] Pre-cache partial failure:', err);
      });
    })
  );
  self.skipWaiting();
});

// ── Activate ───────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== STATIC_CACHE && name !== API_CACHE)
          .map((name) => {
            console.log('[SW] Removing old cache:', name);
            return caches.delete(name);
          })
      )
    )
  );
  self.clients.claim();
});

// ── Fetch Strategy ─────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and cross-origin requests
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  // API requests: Network first, fallback to cache
  if (url.pathname.startsWith('/api/')) {
    const isCacheable = CACHEABLE_API_PATTERNS.some((p) => p.test(url.pathname));
    if (isCacheable) {
      event.respondWith(networkFirstWithCache(request, API_CACHE));
    }
    return;
  }

  // HTML pages: Network first, fallback to cache (stale-while-revalidate)
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(staleWhileRevalidate(request, STATIC_CACHE));
    return;
  }

  // Static assets (css, js, fonts, images): Cache first
  if (/\.(css|js|woff2?|ttf|png|jpg|svg|ico)$/.test(url.pathname)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }
});

// ── Background Sync (offline queue) ───────────────────────────────────────
self.addEventListener('sync', (event) => {
  if (event.tag === 'workout-sync') {
    event.waitUntil(syncOfflineWorkouts());
  }
  if (event.tag === 'nutrition-sync') {
    event.waitUntil(syncOfflineNutrition());
  }
  if (event.tag === 'recovery-sync') {
    event.waitUntil(syncOfflineRecovery());
  }
});

// ── Push Notifications ─────────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  const options = {
    body: data.body || 'Nueva notificación de WacoPro',
    icon: '/images/icon-192.png',
    badge: '/images/badge-72.png',
    vibrate: [200, 100, 200],
    data: { url: data.url || '/dashboard' },
    actions: data.actions || [],
    tag: data.tag || 'wacopro-notification',
  };
  event.waitUntil(
    self.registration.showNotification(data.title || 'WacoPro Fitness', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/dashboard';
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) return client.focus();
      }
      return clients.openWindow(url);
    })
  );
});

// ── Cache Strategies ───────────────────────────────────────────────────────
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Recurso no disponible offline', { status: 503 });
  }
}

async function networkFirstWithCache(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    return new Response(JSON.stringify({ success: false, error: 'Sin conexión', offline: true }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  }).catch(() => null);
  return cached || fetchPromise || new Response('Página no disponible offline', { status: 503 });
}

// ── Offline Queue Sync ─────────────────────────────────────────────────────
async function syncOfflineWorkouts() {
  try {
    const db = await openOfflineDB();
    const pending = await db.getAll('pending-workouts');
    for (const item of pending) {
      const response = await fetch('/api/training/workout-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${item.token}` },
        body: JSON.stringify(item.data),
      });
      if (response.ok) await db.delete('pending-workouts', item.id);
    }
  } catch (err) {
    console.error('[SW] Sync workouts failed:', err);
  }
}

async function syncOfflineNutrition() {
  try {
    const db = await openOfflineDB();
    const pending = await db.getAll('pending-nutrition');
    for (const item of pending) {
      const response = await fetch('/api/nutrition/meal-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${item.token}` },
        body: JSON.stringify(item.data),
      });
      if (response.ok) await db.delete('pending-nutrition', item.id);
    }
  } catch (err) {
    console.error('[SW] Sync nutrition failed:', err);
  }
}

async function syncOfflineRecovery() {
  try {
    const db = await openOfflineDB();
    const pending = await db.getAll('pending-recovery');
    for (const item of pending) {
      const response = await fetch('/api/recovery/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${item.token}` },
        body: JSON.stringify(item.data),
      });
      if (response.ok) await db.delete('pending-recovery', item.id);
    }
  } catch (err) {
    console.error('[SW] Sync recovery failed:', err);
  }
}

// Simple IndexedDB wrapper
function openOfflineDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('wacopro-offline', 1);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      ['pending-workouts', 'pending-nutrition', 'pending-recovery'].forEach((store) => {
        if (!db.objectStoreNames.contains(store)) {
          db.createObjectStore(store, { keyPath: 'id', autoIncrement: true });
        }
      });
    };
    req.onsuccess = (e) => {
      const db = e.target.result;
      resolve({
        getAll: (store) => new Promise((res, rej) => {
          const tx = db.transaction(store, 'readonly');
          const req = tx.objectStore(store).getAll();
          req.onsuccess = () => res(req.result);
          req.onerror = () => rej(req.error);
        }),
        delete: (store, id) => new Promise((res, rej) => {
          const tx = db.transaction(store, 'readwrite');
          const req = tx.objectStore(store).delete(id);
          req.onsuccess = () => res();
          req.onerror = () => rej(req.error);
        }),
      });
    };
    req.onerror = () => reject(req.error);
  });
}
