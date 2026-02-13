# How to Reset Notification Permission to See the Prompt Again

Since browsers don't allow JavaScript to reset notification permissions once they're granted, you need to manually reset them in your browser settings.

## Quick Reset Steps:

### Option 1: Clear localStorage and Reset Browser Permission

1. **Open Browser Console** (F12 or Right-click → Inspect → Console tab)

2. **Clear localStorage flags** (run this in console):
   ```javascript
   localStorage.removeItem('notification-permission-requested');
   localStorage.removeItem('notification-permission');
   ```

3. **Reset Browser Notification Permission:**

   **Chrome/Edge:**
   - Click the lock icon (🔒) or info icon (ℹ️) in the address bar
   - Find "Notifications" → Change to "Ask" or "Block"
   - Refresh the page
   - Or go to: Settings → Privacy and security → Site Settings → Notifications → Find your site → Reset

   **Firefox:**
   - Click the lock icon in address bar
   - Click "More Information" → Permissions tab
   - Find "Notifications" → Change to "Ask" or "Block"
   - Refresh the page

   **Safari:**
   - Safari → Settings → Websites → Notifications
   - Find your site → Remove or set to "Ask"

4. **Logout and Login again** - The prompt should appear!

### Option 2: Use Incognito/Private Window

1. Open an incognito/private window
2. Navigate to your app
3. Login - The prompt will appear (since it's a fresh session)

### Option 3: Clear All Site Data

1. Open Browser DevTools (F12)
2. Go to Application tab (Chrome) or Storage tab (Firefox)
3. Click "Clear site data" or "Clear storage"
4. Refresh and login again

## Testing the Prompt

After resetting, when you login:
- Wait ~500ms after login
- You should see the native browser prompt: **"localhost wants to send you notifications"**
- Click "Allow" to enable notifications
