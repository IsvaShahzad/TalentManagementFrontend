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
        socket.on("new-notification", (notif) => {
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
                  <CInputGroup className="mb-3">
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

                  <CInputGroup className="mb-3">
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
