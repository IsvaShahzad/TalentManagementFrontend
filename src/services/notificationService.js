// Browser Notification Service
// Handles browser notification permissions and display

class NotificationService {
  constructor() {
    this.permission = null;
    this.serviceWorkerRegistration = null;
    this.isSupported = 'Notification' in window && 'serviceWorker' in navigator;
  }

  // Check current permission status
  getPermission() {
    if (!this.isSupported) {
      return 'unsupported';
    }
    this.permission = Notification.permission;
    return this.permission;
  }

  // Request notification permission
  async requestPermission() {
    if (!this.isSupported) {
      throw new Error('Notifications are not supported in this browser');
    }

    if (this.permission === 'granted') {
      return 'granted';
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      
      // If permission granted, register service worker
      if (permission === 'granted') {
        await this.registerServiceWorker();
      }
      
      return permission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      throw error;
    }
  }

  // Register service worker for background notifications
  async registerServiceWorker() {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Workers are not supported');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('Service Worker registered:', registration);
      this.serviceWorkerRegistration = registration;

      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;
      
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }

  // Show a native OS notification (outside the browser). Prefer Service Worker API — it
  // tends to surface in Windows / macOS notification centers reliably when the tab is in the background.
  async showNotification(title, options = {}) {
    if (!this.isSupported) {
      console.warn('❌ Notifications are not supported in this browser');
      return null;
    }

    const permission = this.getPermission();
    if (permission !== 'granted') {
      console.warn('❌ Notification permission not granted:', permission);
      return null;
    }

    const uniqueTag =
      options.tag ||
      `tms-notif-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

    const defaultOptions = {
      body: options.body || 'You have a new notification',
      icon: options.icon || '/assets/img/favicon.png',
      badge: options.badge || '/assets/img/favicon.png',
      tag: uniqueTag,
      // false = normal toast/banner behavior (Windows/macOS); true can suppress banners in some setups
      requireInteraction:
        options.requireInteraction !== undefined ? options.requireInteraction : false,
      data: {
        url: options.data?.url || '/#/notifications',
        ...options.data,
      },
      vibrate: options.vibrate || [200, 100, 200],
      silent: false,
      renotify: true,
      dir: 'auto',
      lang: 'en',
    };

    const attachClick = (notification) => {
      if (!notification) return;
      notification.onclick = (event) => {
        event.preventDefault();
        window.focus();
        const url =
          defaultOptions.data?.url || options.data?.url || '/#/notifications';
        if (options.onClick) options.onClick(event);
        else window.location.href = url;
      };
    };

    try {
      if ('serviceWorker' in navigator) {
        let registration = this.serviceWorkerRegistration;
        if (!registration) {
          try {
            registration = await navigator.serviceWorker.register('/sw.js', {
              scope: '/',
            });
          } catch (regErr) {
            console.warn('Service worker register:', regErr);
          }
        }
        registration = registration || (await navigator.serviceWorker.ready);
        this.serviceWorkerRegistration = registration;

        if (registration) {
          await registration.showNotification(title, defaultOptions);
          console.log('✅ OS notification via ServiceWorkerRegistration.showNotification');
          return { via: 'service-worker', title };
        }
      }
    } catch (swErr) {
      console.warn('Service worker showNotification failed, using Notification API:', swErr);
    }

    try {
      const notification = new Notification(title, defaultOptions);
      attachClick(notification);
      console.log('✅ OS notification via Notification API');
      return notification;
    } catch (err) {
      console.error('❌ Notification API failed:', err);
      throw err;
    }
  }

  // Show notification from socket event or API
  async showNotificationFromData(notificationData) {
    const title = notificationData.title || 'TMS Notification';
    const body = notificationData.message || notificationData.body || 'You have a new notification';
    
    // Create unique tag for each notification to prevent replacement
    // Use notification ID + timestamp to ensure uniqueness
    const uniqueTag = `tms-notif-${notificationData.id || 'unknown'}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    console.log('📋 Creating notification with unique tag:', uniqueTag);
    
    await this.showNotification(title, {
      body,
      icon: notificationData.icon,
      tag: uniqueTag, // Unique tag ensures each notification appears separately
      data: {
        notificationId: notificationData.id,
        url: notificationData.url || '/#/notifications'
      },
      onClick: () => {
        if (notificationData.url) {
          window.location.href = notificationData.url;
        } else {
          window.location.href = '/#/notifications';
        }
      }
    });
  }

  // Check if service worker is ready
  async waitForServiceWorker() {
    if (!('serviceWorker' in navigator)) {
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      this.serviceWorkerRegistration = registration;
      return registration;
    } catch (error) {
      console.error('Error waiting for service worker:', error);
      return null;
    }
  }

  // Initialize notification service
  async initialize() {
    if (!this.isSupported) {
      return { supported: false };
    }

    const permission = this.getPermission();
    
    if (permission === 'granted') {
      await this.registerServiceWorker();
    }

    return {
      supported: true,
      permission,
      serviceWorkerReady: !!this.serviceWorkerRegistration
    };
  }
}

// Export singleton instance
const notificationService = new NotificationService();
export default notificationService;
