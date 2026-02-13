# Browser Notifications Setup Guide

This document explains how browser notifications are integrated into the Talent Management System (TMS).

## Overview

The TMS now supports browser notifications that:
- ✅ Ask for permission when the app first loads
- ✅ Show desktop notifications even when the browser/app is closed
- ✅ Work across all modern browsers (Chrome, Firefox, Edge, Safari)
- ✅ Integrate with existing Socket.io notification system
- ✅ Display notifications from HRBS backend

## How It Works

### 1. Permission Request
- When the app loads for the first time, a dialog appears asking for notification permission
- User can click "Allow Notifications" or "Not Now"
- Permission is stored in browser and localStorage
- Dialog won't show again if user has already made a choice

### 2. Service Worker
- A service worker (`/public/sw.js`) handles background notifications
- Registered automatically when permission is granted
- Allows notifications to appear even when browser is closed

### 3. Notification Flow
1. Backend sends notification via Socket.io (`new-notification` event)
2. Frontend receives notification in `Notifications.js` component
3. If browser permission is granted, a desktop notification is shown
4. User clicks notification → Opens TMS app to notifications page

## Files Created/Modified

### New Files:
1. **`/public/sw.js`** - Service Worker for background notifications
2. **`/src/services/notificationService.js`** - Core notification service
3. **`/src/hooks/useBrowserNotifications.js`** - React hook for notifications
4. **`/src/components/NotificationPermissionDialog.js`** - Permission request dialog

### Modified Files:
1. **`/src/App.js`** - Added notification dialog and hook
2. **`/src/views/pages/Notifications/Notifications.js`** - Integrated browser notifications
3. **`/public/manifest.json`** - Updated for PWA support
4. **`/index.html`** - Added service worker registration script

## Testing

### Test Browser Notifications:
1. Open the app in a browser
2. When the permission dialog appears, click "Allow Notifications"
3. Trigger a notification (e.g., create a candidate, update job status)
4. You should see a desktop notification appear
5. Click the notification → Should open the app to notifications page

### Test Background Notifications:
1. Grant notification permission
2. Close the browser completely
3. Send a notification from backend (via Socket.io or API)
4. Notification should still appear on desktop

## Backend Integration (Optional - For Push Notifications)

If you want to send push notifications from the backend (HRBS) even when the user is offline, you'll need to implement Web Push API.

### Required Backend Endpoints:

#### 1. Subscribe to Push Notifications
```
POST /api/notifications/subscribe
Body: {
  userId: string,
  subscription: {
    endpoint: string,
    keys: {
      p256dh: string,
      auth: string
    }
  }
}
```

#### 2. Send Push Notification
```
POST /api/notifications/send
Body: {
  userId: string,
  title: string,
  message: string,
  data: object (optional)
}
```

### Implementation Notes:
- Use a library like `web-push` (Node.js) or similar for your backend
- Store push subscriptions in database (linked to userId)
- When sending notification via Socket.io, also send via Web Push API
- Service worker will receive push event and show notification

## Browser Compatibility

- ✅ Chrome/Edge: Full support
- ✅ Firefox: Full support
- ✅ Safari: Full support (macOS/iOS)
- ⚠️ Older browsers: May not support Service Workers

## Troubleshooting

### Notifications not appearing:
1. Check browser console for errors
2. Verify permission is granted: `Notification.permission` should be 'granted'
3. Check if service worker is registered: DevTools → Application → Service Workers
4. Ensure Socket.io connection is active

### Permission dialog not showing:
1. Check localStorage: `notification-permission-requested` should be null/false
2. Check browser permission: Should be 'default' (not 'denied')
3. Clear browser cache and reload

### Service Worker not registering:
1. Check browser console for errors
2. Ensure `/public/sw.js` file exists
3. Verify HTTPS (required for service workers in production)
4. Check DevTools → Application → Service Workers

## User Settings

Users can manage notification permissions:
- **Browser Settings**: Chrome → Settings → Privacy → Site Settings → Notifications
- **App Settings**: Can be added to user preferences (future enhancement)

## Security Notes

- Service Worker only works over HTTPS (or localhost for development)
- Notifications require explicit user permission
- No sensitive data should be included in notification body
- Always validate notification data on backend before sending
