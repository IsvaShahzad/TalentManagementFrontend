import React, { useState } from 'react';
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
import { fetchUserByEmail, validatePassword } from '../../../api/api';
import { loginPostApi } from '../../../api/api';



import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // const handleLogin = async () => {
  //   if (!email || !password) {
  //     toast.error("Email and password are required");
  //     return;
  //   }

  //   setLoading(true);
  //   try {
  //     const response = await fetchUserByEmail(email);
  //     console.log("API response:", response);
  //     // Determine actual user object
  //     const user = response.user || response; // fal

  //     if (!user) {
  //       toast.error("User with this email does not exist");
  //       return;
  //     }

  //     const isPasswordValid = await validatePassword(email, password);

  //     if (!isPasswordValid) {
  //       toast.error("Incorrect password");
  //       return;
  //     }

  //     // Successful login
  //     // localStorage.setItem("user", JSON.stringify(user));
  //     toast.success("Login successful!");
  //     // after login
  //     localStorage.setItem("role", user.role);

  //     navigate("/dashboard");

  //   } catch (err) {
  //     console.error("Login error:", err);
  //     toast.error("User not found. Please enter correct credentials.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };


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
    localStorage.setItem("role", user.role);
    localStorage.setItem("user", JSON.stringify(user));

    // ✅ Store login success flag + role
    localStorage.setItem("showLoginToast", "true");
    localStorage.setItem("loggedInRole", user.role);

    toast.success("Login successful!");
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
      className="min-vh-100 d-flex flex-row align-items-center justify-content-center"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <CContainer className="d-flex justify-content-center align-items-center">
        <CRow className="justify-content-center w-100">
          <CCol md={10} lg={8} xl={6}>
            <CCard className="glass-card p-5 border-0" style={{ fontFamily: 'Inter, sans-serif'
 , fontWeight: 500 }}>
              <CCardBody>
                <div className="text-center mb-4">
                  <h1 style={{ color: '#0e0d0dff', fontWeight: 500 }}>HRBS Login</h1>
                  <p style={{ color: 'rgba(12, 12, 12, 0.8)' }}>Welcome back! Login to continue</p>
                </div>

                <CForm>
                  <CInputGroup className="mb-4">
                    <CInputGroupText className="glass-input-icon">
                      <CIcon icon={cilUser} style={{ color: '#3973b6ff' }} />
                    </CInputGroupText>
                    <CFormInput
                      placeholder="Email"
                      autoComplete="username"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="glass-input"
                    />
                  </CInputGroup>

                  <CInputGroup className="mb-4">
                    <CInputGroupText className="glass-input-icon">
                      <CIcon icon={cilLockLocked} style={{ color: '#3973b6ff' }} />
                    </CInputGroupText>
                    <CFormInput
                      type="password"
                      placeholder="Password"
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="glass-input"
                    />
                  </CInputGroup>

                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <Link to="/forgot-password" style={{ textDecoration: 'none', color: '#000000ff', fontFamily: 'Inter, sans-serif'
 }}>
                      Forgot Password?
                    </Link>
                  </div>

                  <CButton
                    color="primary"
                    className="w-100 py-3"
                    style={{
                      background: 'linear-gradient(90deg, #5f8ed0ff 0%, #4a5dcaff 100%)',
                      border: 'none',
                      borderRadius: '1px',
                      fontSize: '1.4rem',
                      fontFamily: 'Inter, sans-serif'

                    }}
                    onClick={handleLogin}
                    disabled={loading}
                  >
                    {loading ? "Logging in..." : "Login"}
                  </CButton>

                  <div
                    className="text-center mt-4"
                    style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: '8px' }}
                  >
                    <img
                      src="/hrbs-logo.png"
                      alt="HRBS Logo"
                      style={{ height: '20px', width: '20px', transform: 'translateY(-2px)' }}
                    />
                    <small style={{ color: 'rgba(11, 11, 11, 0.8)', fontFamily: 'Inter, sans-serif'
 }}>
                      HRBS – Your Global Business Partner
                    </small>
                  </div>
                </CForm>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
    </div>
  );
};

export default Login;
