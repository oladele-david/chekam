// Service Worker for Chekam PWA
const CACHE_VERSION = 'v1';
const CACHE_NAME = `chekam-cache-${CACHE_VERSION}`;
const API_CACHE_NAME = `chekam-api-cache-${CACHE_VERSION}`;

// Resources to cache on install
const STATIC_RESOURCES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html', // We'll create this fallback page
];

// Install event - cache static resources
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching static resources');
        return cache.addAll(STATIC_RESOURCES.filter(url => url !== '/offline.html'));
      })
      .then(() => {
        console.log('[Service Worker] Installation complete');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[Service Worker] Installation failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
              console.log('[Service Worker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[Service Worker] Activation complete');
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }

  // Strategy based on request type
  if (isAPIRequest(url)) {
    event.respondWith(networkFirstStrategy(request));
  } else if (isStaticAsset(url)) {
    event.respondWith(cacheFirstStrategy(request));
  } else {
    event.respondWith(networkFirstStrategy(request));
  }
});

/**
 * Check if request is an API call
 * @param {URL} url
 * @returns {boolean}
 */
function isAPIRequest(url) {
  return url.pathname.startsWith('/api/');
}

/**
 * Check if request is for a static asset
 * @param {URL} url
 * @returns {boolean}
 */
function isStaticAsset(url) {
  const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.svg', '.ico', '.woff', '.woff2', '.ttf'];
  return staticExtensions.some(ext => url.pathname.endsWith(ext));
}

/**
 * Network-first strategy
 * Try network first, fall back to cache if offline
 * @param {Request} request
 * @returns {Promise<Response>}
 */
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);

    // Cache successful responses
    if (networkResponse && networkResponse.status === 200) {
      const cacheName = isAPIRequest(new URL(request.url)) ? API_CACHE_NAME : CACHE_NAME;
      const cache = await caches.open(cacheName);

      // Clone the response before caching (responses can only be read once)
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('[Service Worker] Network request failed, trying cache:', request.url);

    // Try to get from cache
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      console.log('[Service Worker] Serving from cache:', request.url);
      return cachedResponse;
    }

    // If it's an HTML page request and not in cache, return offline page
    if (request.headers.get('accept').includes('text/html')) {
      const offlineResponse = await caches.match('/offline.html');
      if (offlineResponse) {
        return offlineResponse;
      }
    }

    // Return a basic offline response for API requests
    if (isAPIRequest(new URL(request.url))) {
      return new Response(
        JSON.stringify({
          error: 'You are offline',
          offline: true,
          message: 'This request will be synced when you are back online'
        }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    throw error;
  }
}

/**
 * Cache-first strategy
 * Try cache first, fall back to network
 * @param {Request} request
 * @returns {Promise<Response>}
 */
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    console.log('[Service Worker] Serving from cache:', request.url);
    return cachedResponse;
  }

  console.log('[Service Worker] Not in cache, fetching:', request.url);

  try {
    const networkResponse = await fetch(request);

    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error('[Service Worker] Fetch failed:', error);
    throw error;
  }
}

// Background sync for queued operations
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync triggered:', event.tag);

  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

/**
 * Sync data with server
 * @returns {Promise<void>}
 */
async function syncData() {
  try {
    console.log('[Service Worker] Starting data sync...');

    // Notify all clients to start sync
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_START'
      });
    });

    // The actual sync logic will be handled by the sync manager in the app
    // This is just to trigger the process

    console.log('[Service Worker] Sync notification sent to clients');
  } catch (error) {
    console.error('[Service Worker] Sync failed:', error);
    throw error;
  }
}

// Listen for messages from the app
self.addEventListener('message', (event) => {
  console.log('[Service Worker] Message received:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then(cache => cache.addAll(event.data.urls))
    );
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys()
        .then(cacheNames => Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        ))
    );
  }
});

// Push notification handler (for future use)
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push notification received');

  const options = {
    body: event.data ? event.data.text() : 'New notification from Chekam',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    vibrate: [200, 100, 200],
    tag: 'chekam-notification',
    requireInteraction: false
  };

  event.waitUntil(
    self.registration.showNotification('Chekam', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked');

  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // If app is already open, focus it
        for (let client of clientList) {
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        // Otherwise open a new window
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
  );
});

console.log('[Service Worker] Service Worker loaded');
