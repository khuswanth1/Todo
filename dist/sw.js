self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  try {
    const data = event.data.json();
    event.waitUntil(
      self.registration.showNotification(data.title || "Mission Update", {
        body: data.body || "You have a new update in your dashboard.",
        icon: '/logo192.png',
        badge: '/logo192.png',
        vibrate: [200, 100, 200],
        silent: false,
        data: { url: data.url || '/dashboard' },
        actions: [
          {
            action: 'open_url',
            title: 'View Update'
          },
          {
            action: 'close',
            title: 'Dismiss'
          }
        ]
      })
    );
  } catch (err) {
    console.error("Error processing push event:", err);
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') return;

  const urlToOpen = event.notification.data?.url || '/dashboard';
  const absoluteUrl = new URL(urlToOpen, self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === absoluteUrl && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(absoluteUrl);
      }
    })
  );
});
