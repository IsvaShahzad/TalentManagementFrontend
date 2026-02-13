// Service Worker for Background Notifications
// This allows notifications to appear even when the browser/app is closed

const CACHE_NAME = 'tms-notifications-v1';
const NOTIFICATION_TITLE = 'TMS Notification';

// Install event - register service worker
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  self.skipWaiting(); // Activate immediately
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  return self.clients.claim(); // Take control of all pages immediately
});

// Push event - handle push notifications from server
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  let notificationData = {
    title: NOTIFICATION_TITLE,
    body: 'You have a new notification',
    icon: '/assets/img/favicon.png',
    badge: '/assets/img/favicon.png',
    tag: 'tms-notification',
    requireInteraction: false,
    data: {}
  };

  // Parse push data if available
  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        ...notificationData,
        title: data.title || notificationData.title,
        body: data.body || data.message || notificationData.body,
        icon: data.icon || notificationData.icon,
        badge: data.badge || notificationData.badge,
        tag: data.tag || notificationData.tag,
        requireInteraction: data.requireInteraction || false,
        data: data.data || {}
      };
    } catch (e) {
      // If not JSON, try text
      const text = event.data.text();
      if (text) {
        notificationData.body = text;
      }
    }
  }

  // Show notification
  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      requireInteraction: notificationData.requireInteraction,
      data: notificationData.data,
      vibrate: [200, 100, 200], // Vibration pattern
      actions: [
        {
          action: 'open',
          title: 'Open TMS'
        },
        {
          action: 'close',
          title: 'Close'
        }
      ]
    })
  );
});

// Notification click event - handle when user clicks notification
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();

  const action = event.action;
  const notificationData = event.notification.data;

  if (action === 'close') {
    return;
  }

  // Default action or 'open' action - open the app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window/tab open with the target URL
      const urlToOpen = self.location.origin + '/#/notifications';
      
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      
      // If no window is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Message event - handle messages from the main app
self.addEventListener('message', (event) => {
  console.log('Service Worker received message:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, body, icon, badge, tag, requireInteraction, data, vibrate } = event.data;
    console.log('📨 Service Worker received SHOW_NOTIFICATION message:', event.data);
    
    // Ensure tag is unique to prevent notification replacement
    const uniqueTag = tag || 'tms-notif-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    
    const notificationOptions = {
      body: body || 'You have a new notification',
      icon: icon || '/assets/img/favicon.png',
      badge: badge || '/assets/img/favicon.png',
      tag: uniqueTag, // Unique tag ensures each notification appears separately
      requireInteraction: requireInteraction !== undefined ? requireInteraction : true,
      data: data || {},
      vibrate: vibrate || [200, 100, 200],
      dir: 'auto',
      lang: 'en',
      timestamp: Date.now(),
      silent: false, // Ensure sound plays
      renotify: true, // Re-notify even if tag exists
      actions: [
        {
          action: 'open',
          title: 'Open TMS'
        },
        {
          action: 'close',
          title: 'Close'
        }
      ]
    };
    
    console.log('📋 Service Worker notification options:', notificationOptions);
    
    self.registration.showNotification(title || NOTIFICATION_TITLE, notificationOptions)
      .then(() => {
        console.log('✅✅✅ Service Worker notification displayed successfully!');
        console.log('💡 If you don\'t see the popup, check Windows Notification Center (bottom-right corner)');
        console.log('💡 Windows may suppress popups when browser tab is active - notification is still sent to system');
      })
      .catch((error) => {
        console.error('❌ Service Worker notification error:', error);
        console.error('Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
      });
  }
});
