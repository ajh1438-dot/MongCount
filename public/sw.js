const OFFLINE_URL = '/offline';
const CACHE_NAME = 'mongcount-offline-v1';
const ACTION_ENDPOINT = '/api/notification-action';

function getNotificationData(data) {
  return data && typeof data === 'object' ? data : {};
}

function getSnoozeCount(data) {
  return typeof data.snoozeCount === 'number' && Number.isFinite(data.snoozeCount) ? data.snoozeCount : 0;
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.add(new Request(OFFLINE_URL, { cache: 'reload' })))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.mode !== 'navigate') {
    return;
  }

  const url = new URL(event.request.url);
  if (url.pathname.startsWith('/auth/')) {
    return;
  }

  event.respondWith(
    fetch(event.request).catch(async () => {
      const cache = await caches.open(CACHE_NAME);
      return cache.match(OFFLINE_URL) || Response.error();
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const action = event.action || 'dismiss';
  const data = getNotificationData(event.notification.data);
  const slot = typeof data.slot === 'string' ? data.slot : null;
  const snoozeCount = getSnoozeCount(data);
  const baseUrl = self.location.origin;

  event.waitUntil(
    (async () => {
      const response = await fetch(ACTION_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          baseUrl,
          slot,
          snoozeCount,
        }),
      });

      if (!response.ok) {
        return;
      }

      const result = await response.json();

      if (result.type === 'open' && result.url) {
        const windowClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
        const existing = windowClients.find((client) => 'focus' in client);

        if (existing) {
          await existing.navigate(result.url);
          await existing.focus();
          return;
        }

        await self.clients.openWindow(result.url);
        return;
      }

      if (result.type === 'schedule' && result.delayMinutes === 15) {
        await new Promise((resolve) => setTimeout(resolve, result.delayMinutes * 60 * 1000));
        await self.registration.showNotification(event.notification.title, {
          body: event.notification.body,
          data: {
            ...data,
            snoozeCount: snoozeCount + 1,
          },
          tag: slot ? `slot-${slot}` : undefined,
        });
      }
    })().catch(() => undefined)
  );
});
