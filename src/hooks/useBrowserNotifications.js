// React Hook for Browser Notifications
// This hook manages browser notification permissions only
// Socket integration for showing notifications is handled in Notifications.js component
import { useEffect, useState, useCallback } from 'react';
import notificationService from '../services/notificationService';

export const useBrowserNotifications = () => {
  const [permission, setPermission] = useState('default');
  const [isSupported, setIsSupported] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize notification service
  useEffect(() => {
    const init = async () => {
      const result = await notificationService.initialize();
      setIsSupported(result.supported);
      setPermission(result.permission || 'default');
      setIsInitialized(true);
    };
    init();
  }, []);

  // Request permission
  const requestPermission = useCallback(async () => {
    try {
      const newPermission = await notificationService.requestPermission();
      setPermission(newPermission);
      return newPermission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return 'denied';
    }
  }, []);

  // Show notification
  const showNotification = useCallback(async (title, options) => {
    if (permission !== 'granted') {
      console.warn('Cannot show notification: permission not granted');
      return;
    }
    await notificationService.showNotification(title, options);
  }, [permission]);

  return {
    permission,
    isSupported,
    isInitialized,
    requestPermission,
    showNotification
  };
};
