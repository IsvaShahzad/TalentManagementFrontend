import React, { Suspense, useEffect, useState, useRef } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { io } from 'socket.io-client'

import { CSpinner, useColorModes } from '@coreui/react'
import './scss/style.scss'
import './scss/examples.scss'
import { JobsProvider } from './context/JobContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DesktopNotificationPrompt from './components/DesktopNotificationPrompt'


// Pages
import ResetPassword from './views/pages/login/ResetPassword'
import ProtectedRoute from './components/ProtectedRoutes'
import AddUser from './views/pages/users/AddUser'
import Notifications from './views/pages/Notifications/Notifications'

import { Navigate } from 'react-router-dom'
import SocketContext from './context/SocketContext'
import notificationService from './services/notificationService'
import { getSocketBaseUrl } from './utils/socketUrl'


// Lazy-loaded containers and pages
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'))
const Login = React.lazy(() => import('./views/pages/login/Login'))
const ForgotPassword = React.lazy(() => import('./views/pages/login/ForgotPassword'))
const Page404 = React.lazy(() => import('./views/pages/page404/Page404'))
const Page500 = React.lazy(() => import('./views/pages/page500/Page500'))
const PositionTracker = React.lazy(() => import('./views/pages/position-tracker/PositionTracker'))
const ActiveJobsScreen = React.lazy(() => import('./views/pages/active-jobs/ActiveJobs'));
const ClientCandidates = React.lazy(() => import('./views/pages/talent-pool/ClientCandidates'))

/** OS notification title — clearer in Windows notification center */
function tmsOsNotificationTitle(notif) {
  const msg = (notif?.message || '').trim()
  const src = String(notif?.type || notif?.source || '').toLowerCase()
  if (src === 'reminder_created') return 'Reminder scheduled'
  if (src === 'reminder') {
    if (msg.includes('Reminder scheduled:') || msg.includes('Reminder scheduled')) return 'Reminder scheduled'
    return 'Reminder due'
  }
  if (/new job created/i.test(msg)) return 'New job'
  if (/job deleted/i.test(msg)) return 'Job update'
  if (src === 'job_feedback') return 'Job feedback'
  if (src === 'note') return 'Note'
  if (src === 'admin') return 'HRBS'
  return 'HRBS'
}

// Inner App component that uses auth context
const AppContent = () => {
  const { isColorModeSet, setColorMode } = useColorModes('coreui-free-react-admin-template-theme')
  const storedTheme = useSelector((state) => state.theme)
  const { role: userRole, user, isAuthenticated } = useAuth(); // JWT + session
  
  // Socket shared via context — created here so it survives refresh and matches API host
  const [socketState, setSocketState] = useState(null);
  
  // Use ref to persist shown notification IDs across re-renders
  const shownNotificationIdsRef = useRef(new Set());
  
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.href.split('?')[1])
    const theme = urlParams.get('theme') && urlParams.get('theme').match(/^[A-Za-z0-9\s]+/)[0]
    if (theme) setColorMode(theme)

    if (!isColorModeSet()) setColorMode(storedTheme)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Register service worker when logged in so OS notifications work when the tab is in the background
  useEffect(() => {
    if (!isAuthenticated) return;
    notificationService.initialize().catch(() => {})
  }, [isAuthenticated])

  // Connect Socket.IO to the same backend as the API (fixes local dev vs hardcoded VPS URL)
  useEffect(() => {
    if (!isAuthenticated) {
      setSocketState((prev) => {
        if (prev) prev.disconnect();
        return null;
      });
      return;
    }

    const userId = user?.user_id || localStorage.getItem('user_id');
    const baseUrl = getSocketBaseUrl();
    if (!userId || !baseUrl) {
      if (!baseUrl) {
        console.warn('TMS: VITE_API_BASE_URL / VITE_SOCKET_URL missing — real-time notifications disabled.');
      }
      return;
    }

    const socket = io(baseUrl, { transports: ['websocket', 'polling'] });
    const register = () => {
      socket.emit('registerUser', String(userId));
    };
    socket.on('connect', register);
    socket.on('reconnect', register);
    if (socket.connected) register();

    setSocketState(socket);

    return () => {
      socket.off('connect', register);
      socket.off('reconnect', register);
      socket.disconnect();
      setSocketState(null);
    };
  }, [isAuthenticated, user?.user_id]);

  // Global socket listener for desktop notifications
  useEffect(() => {
    // Socket is created above when authenticated (same host as API)
    if (!socketState) {
      console.log('⚠️ Socket not available yet - waiting for socket connection...');
      return;
    }

    console.log('✅ Socket available - setting up notification listeners. Socket ID:', socketState.id);

    // Handle notification with deduplication (using ref to persist across renders)
    const handleNotification = (notif) => {
      console.log('🔔🔔🔔 SOCKET EVENT RECEIVED:', notif);
      
      const notificationId = notif.id || notif.notification_id;
      
      if (!notificationId) {
        console.warn('⚠️ Notification received without ID:', notif);
        // Still try to show notification even without ID (use timestamp as fallback)
        const fallbackId = `notif-${Date.now()}-${Math.random()}`;
        console.log('Using fallback ID:', fallbackId);
      }
      
      // Skip if we've already shown this notification (check ref) - but only if ID exists
      if (notificationId && shownNotificationIdsRef.current.has(notificationId)) {
        console.log('⏭️ Skipping duplicate notification:', notificationId);
        return;
      }

      // Keep sidebar badge + Notifications page in sync (even when not on /notifications)
      window.dispatchEvent(new Event('refreshNotifications'));

      // Mark as shown (add to ref) - but only after we verify we can show it
      // We'll mark it after successful display instead
      // Check if user has notifications enabled
      const userStr = localStorage.getItem('user');
      let userNotificationsEnabled = true;
      try {
        if (userStr) {
          const userObj = JSON.parse(userStr);
          userNotificationsEnabled = userObj.notifications_enabled !== undefined 
            ? userObj.notifications_enabled 
            : true;
        }
      } catch (e) {
        console.error('Error parsing user from localStorage:', e);
      }

      // Check browser notification permission
      const browserPermission = Notification.permission;

      // Show desktop notification if both conditions are met
      console.log('🔔 Notification received:', {
        userNotificationsEnabled,
        browserPermission,
        notification: notif
      });

      if (userNotificationsEnabled && browserPermission === 'granted') {
        const notificationData = {
          notification_id: notif.id || notif.notification_id,
          message: notif.message,
          createdAT: notif.createdAT || notif.created_at,
          source: notif.type || notif.source || 'normal'
        };

        const osTitle = tmsOsNotificationTitle(notif);

        console.log('✅ Conditions met - showing desktop notification:', notificationData);
        console.log('📋 Notification details:', {
          title: osTitle,
          message: notificationData.message,
          id: notificationData.notification_id,
          notificationId: notificationId
        });

        // In-app toast + OS notification (user asked for both)
        if (notif?.message) {
          toast.info(notif.message, {
            containerId: 'tms-global-toasts',
            autoClose: 6000,
            position: 'bottom-right',
            toastId: notificationId ? `tms-toast-${notificationId}` : undefined,
          });
        }

        // Small delay to ensure notification is properly displayed
        // This helps prevent browser throttling when multiple notifications arrive quickly
        setTimeout(() => {
          console.log(`🚀 Calling notificationService.showNotificationFromData...`);
          notificationService.showNotificationFromData({
            title: osTitle,
            message: notificationData.message,
            id: notificationData.notification_id,
            icon: '/assets/img/favicon.png',
            url: '/#/notifications'
          }).then((notification) => {
            console.log('✅ Notification service call completed');
            console.log('🔔 Notification object:', notification);
            
            // Mark as shown only after successful display attempt
            // Even if notification is undefined (service worker case), mark it to prevent duplicates
            if (notificationId) {
              shownNotificationIdsRef.current.add(notificationId);
              console.log(`✅ Added notification ID to deduplication cache: ${notificationId} (total cached: ${shownNotificationIdsRef.current.size})`);
              
              // Clean up old IDs after 2 minutes to prevent memory leak
              setTimeout(() => {
                shownNotificationIdsRef.current.delete(notificationId);
                console.log('🧹 Cleaned up notification ID from deduplication cache:', notificationId);
              }, 2 * 60 * 1000);
            }
            
            // Verify notification is actually shown
            if (notification) {
              console.log('✅ Notification created and should be visible');
              // Add event listeners to track notification lifecycle
              notification.onshow = () => {
                console.log('✅✅ Notification onshow event fired - notification is visible!');
              };
              notification.onerror = (error) => {
                console.error('❌ Notification error event:', error);
                // If notification fails, remove from cache so it can be retried
                if (notificationId) {
                  shownNotificationIdsRef.current.delete(notificationId);
                  console.log('🔄 Removed failed notification from cache for retry:', notificationId);
                }
              };
            } else {
              console.log('⚠️ Notification service returned undefined - might be using service worker (still marked as shown)');
            }
          }).catch(err => {
            console.error('❌ Error showing desktop notification:', err);
            console.error('Error stack:', err.stack);
          });
        }, 100); // 100ms delay to prevent browser throttling
      } else {
        console.warn('⚠️ Desktop notification skipped:', {
          userNotificationsEnabled,
          browserPermission,
          reason: !userNotificationsEnabled ? 'User disabled notifications' : 'Browser permission not granted'
        });
        // In-app fallback (bottom bar, Cursor-style) when OS / browser permission is missing
        if (userNotificationsEnabled && notif?.message) {
          toast.info(notif.message, {
            containerId: 'tms-global-toasts',
            autoClose: 8000,
            position: 'bottom-right',
          });
          if (notificationId) {
            shownNotificationIdsRef.current.add(notificationId);
            setTimeout(() => {
              shownNotificationIdsRef.current.delete(notificationId);
            }, 2 * 60 * 1000);
          }
        }
      }
    };

    // Listen to single event name only (backend now emits only "newNotification")
    console.log('📡 Registering socket listener for: newNotification');
    socketState.on('newNotification', (data) => {
      console.log('📨 Received "newNotification" event:', data);
      handleNotification(data);
    });

    // Test socket connection
    socketState.on('connect', () => {
      console.log('✅ Socket connected:', socketState.id);
    });

    socketState.on('disconnect', () => {
      console.log('❌ Socket disconnected');
    });

    socketState.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
    });

    return () => {
      console.log('🧹 Cleaning up socket listeners');
      socketState.off('newNotification');
      socketState.off('connect');
      socketState.off('disconnect');
      socketState.off('connect_error');
    };
  }, [socketState]);

  return (
    <SocketContext.Provider value={{ socket: socketState, setSocket: setSocketState }}>
      <JobsProvider> {/* <-- Wrap everything inside JobsProvider */}
        <HashRouter>
          <DesktopNotificationPrompt visible={isAuthenticated} />
          <Suspense
            fallback={
              <div className="pt-3 text-center">
                <CSpinner color="primary" variant="grow" />
              </div>
            }
          >
            <Routes>
              {/* Root route always opens login */}
              <Route path="/" element={<Login />} />

              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/404" element={<Page404 />} />
              <Route path="/500" element={<Page500 />} />

              {/* Protected routes */}
              <Route
                path="/users"
                element={
                  <ProtectedRoute allowedRoles={'Admin'} role={userRole}>
                    <AddUser />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/candidates"
                element={
                  <ProtectedRoute allowedRoles={['Admin', 'Recruiter']} role={userRole}>
                    <Navigate to="/talent-pool" replace />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/all-candidates"
                element={
                  <ProtectedRoute allowedRoles={['Admin', 'Recruiter']} role={userRole}>
                    <Navigate to="/talent-pool" replace />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute allowedRoles={['Admin', 'Recruiter', 'Client']} role={userRole}>
                    <Notifications />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/position-tracker"
                element={
                  <ProtectedRoute allowedRoles={'Admin'} role={userRole}>
                    <PositionTracker />
                  </ProtectedRoute>
                }
              />

              {/* <Route
  path="/jobs"
  element={
    <ProtectedRoute allowedRoles={['Recruiter', 'Admin']} role={userRole}>
      <ActiveJobs recruiterId={localStorage.getItem('user_id')} />
    </ProtectedRoute>
  }
/> */}

              <Route
                path="/jobs"
                element={
                  <ProtectedRoute allowedRoles={['Recruiter', 'Admin', 'Client']} role={userRole || ""}>
                    <Suspense fallback={<div>Loading...</div>}>
                      <ActiveJobsScreen
                        userId={user?.user_id || localStorage.getItem('user_id') || ""}
                        userEmail={user?.email || localStorage.getItem('user_email') || ""}
                        role={userRole || ""}
                      />
                    </Suspense>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/client/my-candidates"
                element={
                  <ProtectedRoute allowedRoles={'Client'} role={userRole}>
                    <ClientCandidates />
                  </ProtectedRoute>
                }
              />



              {/* All other routes go inside dashboard */}
              <Route path="/*" element={<DefaultLayout />} />

              {/* Fallback for unauthorized */}
              <Route path="/not-authorized" element={<h2>Not Authorized</h2>} />
            </Routes>
          </Suspense>
        </HashRouter>
      </JobsProvider>
    </SocketContext.Provider>
  )
}

// Main App component with AuthProvider wrapper
const App = () => {
  return (
    <AuthProvider>
      <AppContent />
      <ToastContainer position="top-right" autoClose={1500} hideProgressBar={false} />
      <ToastContainer
        containerId="tms-global-toasts"
        position="bottom-right"
        autoClose={6000}
        hideProgressBar={false}
        newestOnTop
        limit={5}
      />
    </AuthProvider>
  )
}

export default App
