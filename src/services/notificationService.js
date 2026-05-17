// Browser Notification Service
// Handles browser notification permissions and display

import { OS_NOTIFICATION_DEDUPE_MS } from '../constants/notificationTiming';

class NotificationService {
  constructor() {
    this.permission = null;
    this.serviceWorkerRegistration = null;
    this.isSupported = 'Notification' in window && 'serviceWorker' in navigator;
    /** @type {Map<string, number>} */
    this.recentKeys = new Map();
  }

  _shouldSkipDuplicate(key) {
    const now = Date.now();
    const last = this.recentKeys.get(key);
    if (last != null && now - last < OS_NOTIFICATION_DEDUPE_MS) {
      return true;
    }
    this.recentKeys.set(key, now);
    if (this.recentKeys.size > 200) {
      for (const [k, t] of this.recentKeys) {
        if (now - t > OS_NOTIFICATION_DEDUPE_MS) this.recentKeys.delete(k);
      }
    }
    return false;
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

  // Show a native OS notification. Use one path only (SW when tab hidden, Notification API when visible)
  // to avoid duplicate banners on Windows/macOS.
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

    const dedupeKey =
      options.data?.notificationId != null
        ? `id:${options.data.notificationId}`
        : `msg:${title}|${options.body || ''}`;
    if (this._shouldSkipDuplicate(dedupeKey)) {
      console.log('⏭️ Skipping duplicate OS notification:', dedupeKey);
      return null;
    }

    const defaultOptions = {
      body: options.body || 'You have a new notification',
      icon: options.icon || '/assets/img/favicon.png',
      badge: options.badge || '/assets/img/favicon.png',
      tag: uniqueTag,
      requireInteraction:
        options.requireInteraction !== undefined ? options.requireInteraction : true,
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

    const preferServiceWorker = document.visibilityState === 'hidden';

    if (preferServiceWorker && 'serviceWorker' in navigator) {
      try {
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
          console.log('✅ OS notification via Service Worker (tab hidden)');
          return { via: 'service-worker', title };
        }
      } catch (swErr) {
        console.warn('Service worker showNotification failed, using Notification API:', swErr);
      }
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
    const uniqueTag = `tms-notif-${notificationData.id || 'unknown'}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    await this.showNotification(title, {
      body,
      icon: notificationData.icon,
      tag: uniqueTag,
      data: {
        notificationId: notificationData.id,
        url: notificationData.url || '/#/notifications',
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
