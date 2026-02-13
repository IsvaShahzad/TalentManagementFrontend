import React, { useContext, useState } from 'react';
import '@fontsource/inter';
import { Link, useNavigate } from 'react-router-dom';
import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilLockLocked, cilUser } from '@coreui/icons';
import bgImage from '../../../assets/images/background-login1.jpeg';
import './Login.css';
import { loginPostApi } from '../../../api/api';
import { toast } from 'react-toastify';
import { io } from "socket.io-client";
import SocketContext from '../../../context/SocketContext';
import { useAuth } from '../../../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setSocket } = useContext(SocketContext);
  const { login } = useAuth(); // Use auth context for JWT-based login

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Email and password are required");
      return;
    }

    setLoading(true);
    try {
      const data = await loginPostApi(email, password);

      if (!data) {
        toast.error("Incorrect email or password");
        return;
      }

      const user = data.user;
      const token = data.token; // JWT token from backend

      // Ensure notifications_enabled is included
      const userWithNotifications = {
        ...user,
        notifications_enabled: user.notifications_enabled !== undefined ? user.notifications_enabled : true
      };

      // Use auth context to store JWT token and user data
      if (token) {
        login(token, userWithNotifications);
      } else {
        // Fallback for backward compatibility if no token
        localStorage.setItem("role", user.role);
        localStorage.setItem("user", JSON.stringify(userWithNotifications));
        localStorage.setItem("user_id", user.user_id);
        localStorage.setItem("user_email", user.email);
      }

      localStorage.setItem("showLoginToast", "true");
      localStorage.setItem("loggedInRole", user.role);

      // ✅ Initialize socket after login
      const socket = io("http://localhost:7000");
      socket.emit("registerUser", user.user_id);

      // Check if notifications are enabled from user object
      const notificationsEnabled = user.notifications_enabled !== undefined ? user.notifications_enabled : true;

      if (notificationsEnabled) {
        socket.on("newNotification", (notif) => {
          console.log("New notification received:", notif);
          // You can update notifications state or show toast here
        });

        socket.on("notification-count", ({ count }) => {
          console.log("Unread notifications count:", count);
          // Update badge or redux state
        });
      }

      // Save socket globally
      setSocket(socket);

      // Request browser notification permission directly after login
      if ('Notification' in window) {
        const forceShow = localStorage.getItem('force-show-notification-prompt');
        const currentPermission = Notification.permission;
        
        // Check if user has notifications enabled in their account
        const userNotificationsEnabled = user.notifications_enabled !== undefined 
          ? user.notifications_enabled 
          : true; // Default to enabled if not set
        
        console.log('🔔 Notification Status Check:', {
          'Browser Permission': currentPermission,
          'User Setting (notifications_enabled)': userNotificationsEnabled,
          'Force Show Flag': forceShow,
          'Will Show Prompt': currentPermission === 'default' || forceShow === 'true',
          'Notification API Supported': 'Notification' in window
        });
        
        // Show prompt if browser permission is 'default' (not yet asked)
        // This will show for every account/login if browser permission hasn't been set
        if (currentPermission === 'default' || forceShow === 'true') {
          // Small delay to let login complete, then show native browser prompt
          setTimeout(async () => {
            try {
              console.log('🔔 Requesting notification permission - browser prompt will appear now...');
              // This will show the native browser prompt: "localhost wants to send you notifications"
              const permission = await Notification.requestPermission();
              console.log('🔔 Notification permission result:', permission);
              
              // Store permission (but don't prevent showing for other accounts)
              localStorage.setItem('notification-permission', permission);
              // Clear the force show flag after showing prompt
              localStorage.removeItem('force-show-notification-prompt');
              
              // Register service worker if permission granted AND user has notifications enabled
              if (permission === 'granted' && userNotificationsEnabled && 'serviceWorker' in navigator) {
                try {
                  await navigator.serviceWorker.register('/sw.js');
                  console.log('✅ Service Worker registered for notifications');
                } catch (error) {
                  console.error('❌ Service Worker registration failed:', error);
                }
              } else if (permission === 'granted' && !userNotificationsEnabled) {
                console.log('⚠️ Permission granted but user has notifications disabled in settings - service worker not registered');
              }
            } catch (error) {
              console.error('❌ Error requesting notification permission:', error);
              // Clear force show flag even on error
              localStorage.removeItem('force-show-notification-prompt');
            }
          }, 500);
        } else if (currentPermission === 'granted') {
          // Permission already granted - register service worker only if user has notifications enabled
          console.log('🔔 Browser permission already granted - no prompt will appear');
          if (userNotificationsEnabled && 'serviceWorker' in navigator) {
            setTimeout(async () => {
              try {
                await navigator.serviceWorker.register('/sw.js');
                console.log('✅ Service Worker registered for notifications');
              } catch (error) {
                console.error('❌ Service Worker registration failed:', error);
              }
            }, 500);
          } else if (!userNotificationsEnabled) {
            console.log('⚠️ User has notifications disabled in settings - service worker not registered');
          }
        } else if (currentPermission === 'denied') {
          console.log('🔔 Browser notification permission is DENIED - prompt will not appear');
        }
      } else {
        console.log('❌ Browser does not support notifications');
      }

      // Navigate to dashboard (toast is shown in Dashboard.js)
      navigate("/dashboard");

    } catch (err) {
      console.error("Login error:", err);
      toast.error("Something went wrong, try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-vh-100 d-flex flex-column flex-md-row align-items-center justify-content-center"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        padding: '1rem',
      }}
    >
      <CContainer className="d-flex justify-content-center align-items-center">
        <CRow className="justify-content-center w-100">
          <CCol xs={12} sm={10} md={8} lg={6} xl={5}>
            <CCard
              className="glass-card p-4 p-md-5 border-0"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
              }}
            >
              <CCardBody>
                <div className="text-center mb-3 mb-md-4">
                  <h1
                    style={{
                      color: '#0e0d0dff',
                      fontWeight: 500,
                      fontSize: '1.6rem',
                    }}
                  >
                    HRBS Login
                  </h1>
                  <p
                    style={{
                      color: 'rgba(12, 12, 12, 0.8)',
                      fontSize: '0.85rem',
                    }}
                  >
                    Welcome back! Login to continue
                  </p>
                </div>

                <CForm>
                  <CInputGroup className="mb-3 input-group-responsive">
                    <CInputGroupText className="glass-input-icon">
                      <CIcon
                        icon={cilUser}
                        style={{ color: '#3973b6ff' }}
                      />
                    </CInputGroupText>
                    <CFormInput
                      placeholder="Email"
                      autoComplete="username"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="glass-input"
                      style={{ fontSize: '0.85rem' }}
                    />
                  </CInputGroup>

                  <CInputGroup className="mb-3 input-group-responsive">
                    <CInputGroupText className="glass-input-icon">
                      <CIcon
                        icon={cilLockLocked}
                        style={{ color: '#3973b6ff' }}
                      />
                    </CInputGroupText>
                    <CFormInput
                      type="password"
                      placeholder="Password"
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="glass-input"
                      style={{ fontSize: '0.85rem' }}
                    />
                  </CInputGroup>

                  <div
                    className="d-flex justify-content-between align-items-center mb-3"
                  >
                    <Link
                      to="/forgot-password"
                      style={{
                        textDecoration: 'none',
                        color: '#000000ff',
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '0.75rem',
                      }}
                    >
                      Forgot Password?
                    </Link>
                  </div>

                  <CButton
                    color="primary"
                    className="w-100 py-2"
                    style={{
                      background:
                        'linear-gradient(90deg, #5f8ed0ff 0%, #4a5dcaff 100%)',
                      border: 'none',
                      borderRadius: '1px',
                      fontSize: '1.1rem',
                      fontFamily: 'Inter, sans-serif',
                    }}
                    onClick={handleLogin}
                    disabled={loading}
                  >
                    {loading ? 'Logging in...' : 'Login'}
                  </CButton>

                  <div
                    className="text-center mt-3"
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'flex-start',
                      gap: '6px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <img
                      src="/hrbs-logo.png"
                      alt="HRBS Logo"
                      style={{
                        height: '18px',
                        width: '18px',
                        transform: 'translateY(-2px)',
                      }}
                    />
                    <small
                      style={{
                        color: 'rgba(11, 11, 11, 0.8)',
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '0.7rem',
                      }}
                    >
                      HRBS – Your Global Business Partner
                    </small>
                  </div>
                </CForm>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>

    </div>
  );
};

export default Login;
