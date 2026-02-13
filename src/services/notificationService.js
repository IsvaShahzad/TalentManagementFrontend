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

  // Show a browser notification
  async showNotification(title, options = {}) {
    if (!this.isSupported) {
      console.warn('❌ Notifications are not supported in this browser');
      return;
    }

    const permission = this.getPermission();
    
    if (permission !== 'granted') {
      console.warn('❌ Notification permission not granted. Current permission:', permission);
      return;
    }

    // Create unique tag if not provided to prevent notification replacement
    const uniqueTag = options.tag || `tms-notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const defaultOptions = {
      body: options.body || 'You have a new notification',
      icon: options.icon || '/assets/img/favicon.png',
      badge: options.badge || '/assets/img/favicon.png',
      tag: uniqueTag, // Always use unique tag to ensure all notifications appear
      requireInteraction: options.requireInteraction !== undefined ? options.requireInteraction : true, // Keep notification visible until user interacts
      data: options.data || {},
      vibrate: options.vibrate || [200, 100, 200],
      silent: false, // Ensure sound plays (if allowed)
      timestamp: Date.now(),
      dir: 'auto', // Text direction
      lang: 'en', // Language
      renotify: true, // Re-notify even if similar notifications exist
      sticky: true // Try to keep notification visible (not standard but some browsers support it)
    };

    console.log('🔔 Attempting to show notification:', { title, body: defaultOptions.body, permission });

    // Check if we should use service worker (for better visibility even when tab is active)
    const isPageVisible = document.visibilityState === 'visible';
    const shouldUseServiceWorker = 'serviceWorker' in navigator && isPageVisible;
    
    try {
      // Try service worker first if available (better for showing notifications when tab is active)
      if (shouldUseServiceWorker) {
        try {
          console.log('📡 Attempting to use Service Worker for notification (better visibility when tab is active)');
          let registration = this.serviceWorkerRegistration;
          if (!registration) {
            registration = await navigator.serviceWorker.ready;
            this.serviceWorkerRegistration = registration;
          }
          
          if (registration && registration.active) {
            // Send message to service worker to show notification
            // This method works better for showing notifications when tab is active
            const uniqueTag = defaultOptions.tag + '-' + Date.now(); // Make tag unique to prevent suppression
            
            registration.active.postMessage({
              type: 'SHOW_NOTIFICATION',
              title: title,
              body: defaultOptions.body,
              icon: defaultOptions.icon,
              badge: defaultOptions.badge,
              tag: uniqueTag,
              requireInteraction: defaultOptions.requireInteraction,
              data: defaultOptions.data,
              vibrate: defaultOptions.vibrate
            });
            
            console.log('✅ Notification sent to Service Worker with tag:', defaultOptions.tag);
            console.log('💡 Service Worker will show notification - check Windows Notification Center if popup doesn\'t appear');
            console.log('💡 Windows may suppress notification popups when browser tab is active/focused');
            
            // Also try regular Notification API as backup (sometimes works better for popups)
            // Windows sometimes shows regular Notification API popups even when service worker ones are suppressed
            try {
              console.log('🔄 Also trying regular Notification API as backup for popup visibility...');
              const backupNotification = new Notification(title, defaultOptions);
              backupNotification.onclick = () => {
                window.focus();
                if (options.data && options.data.url) {
                  window.location.href = options.data.url;
                } else {
                  window.location.href = '/#/notifications';
                }
              };
              backupNotification.onshow = () => {
                console.log('✅✅✅ Backup Notification API popup is VISIBLE!');
              };
              backupNotification.onerror = (error) => {
                console.error('❌ Backup Notification API error:', error);
              };
              console.log('✅ Backup Notification API notification created');
            } catch (backupError) {
              console.warn('⚠️ Backup Notification API failed (this is OK, service worker notification should still work):', backupError);
            }
            
            // Return a mock notification object to indicate success
            return { 
              title, 
              body: defaultOptions.body,
              tag: uniqueTag,
              viaServiceWorker: true 
            };
          } else if (registration) {
            // Fallback: direct showNotification
            await registration.showNotification(title, defaultOptions);
            console.log('✅ Notification shown via Service Worker (direct) - should be visible even with tab active!');
            return;
          }
        } catch (swError) {
          console.warn('⚠️ Service Worker notification failed, falling back to Notification API:', swError);
        }
      }
      
      // Fallback: Use Notification API
      console.log('📱 Using Notification API (page visible:', isPageVisible, ')');
      console.log('📋 Notification options:', defaultOptions);
      
      const notification = new Notification(title, defaultOptions);
      console.log('✅ Desktop notification created successfully');
      console.log('🔔 Notification object:', {
        title: notification.title,
        body: notification.body,
        tag: notification.tag,
        requireInteraction: defaultOptions.requireInteraction
      });
      
      // Don't auto-close if requireInteraction is true (user must interact)
      // Only auto-close if explicitly set to false
      if (defaultOptions.requireInteraction === false) {
        setTimeout(() => {
          notification.close();
        }, 5000);
      } else {
        console.log('⏰ Notification will stay visible until user interacts (requireInteraction: true)');
      }

      // Handle click
      notification.onclick = (event) => {
        event.preventDefault();
        window.focus();
        console.log('🔔 Notification clicked - navigating to:', options.data?.url || '/#/notifications');
        if (options.onClick) {
          options.onClick(event);
        } else if (options.data && options.data.url) {
          window.location.href = options.data.url;
        } else {
          window.location.href = '/#/notifications';
        }
      };

      // Handle show event - fires when notification is displayed
      notification.onshow = () => {
        console.log('✅✅ Notification onshow event fired - notification is VISIBLE on screen!');
        console.log('📍 Notification location check:');
        console.log('  - Window focused:', document.hasFocus());
        console.log('  - Page visible:', document.visibilityState);
        console.log('  - Notification title:', notification.title);
        console.log('  - Notification body:', notification.body);
        console.log('  - Browser:', navigator.userAgent);
        console.log('  - Platform:', navigator.platform);
        
        // Important: Windows may suppress notification popups when browser tab is active
        // Check Windows notification center (bottom-right corner, click notification icon)
        console.log('💡 TIP: If you don\'t see the popup, check Windows Notification Center (bottom-right corner)');
        console.log('💡 TIP: Try minimizing the browser window - notifications may appear then');
        
        // Try to focus the window to ensure notification is visible
        if (window.focus) {
          window.focus();
        }
      };

      // Handle close event
      notification.onclose = () => {
        console.log('🔔 Notification closed by user or system');
        // Note: notification.timestamp is read-only, so we track creation time separately
      };

      // Handle error event
      notification.onerror = (error) => {
        console.error('❌ Notification error event fired:', error);
        console.error('Error details:', {
          name: error?.name,
          message: error?.message,
          stack: error?.stack
        });
      };
      
      // Store creation time for tracking (can't modify notification.timestamp as it's read-only)
      const notificationCreatedAt = Date.now();

      console.log('✅ Notification object created:', notification);
      console.log('📊 Notification state:', {
        title: notification.title,
        body: notification.body,
        tag: notification.tag,
        visible: true // Notification API doesn't have a visible property, but if created, it should be visible
      });
      
      return notification;
    } catch (error) {
      console.error('❌ Error creating notification:', error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      // If Notification API fails, try service worker as fallback
      if ('serviceWorker' in navigator) {
        try {
          console.log('🔄 Trying service worker fallback');
          let registration = this.serviceWorkerRegistration;
          if (!registration) {
            registration = await navigator.serviceWorker.ready;
            this.serviceWorkerRegistration = registration;
          }
          if (registration) {
            await registration.showNotification(title, defaultOptions);
            console.log('✅ Notification shown via service worker fallback');
            return;
          }
        } catch (swError) {
          console.error('❌ Service worker fallback also failed:', swError);
        }
      }
      
      throw error;
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
