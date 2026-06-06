import React, { useState } from 'react';
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
import { cilEnvelopeOpen } from '@coreui/icons';
import './Login.css';
import bgImage from '../../../assets/images/background-login1.jpeg';
import { sendForgotPassword } from '../../../api/api';
import { useAppAlert } from '../../../context/AppAlertContext';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showSuccess, showError } = useAppAlert();

  const checkUserEmail = async () => {
    if (!email) {
      showError('Email is required', 1500);
      return;
    }

    setLoading(true);
    try {
      const data = await sendForgotPassword(email);
      const msg = data.message || 'Email verified!';

      if (data.role === 'Admin') {
        showSuccess('Admin verified. Redirecting to reset password...', 1500);
        navigate(`/reset-password?email=${encodeURIComponent(email)}`);
      } else if (data.role === 'Recruiter' || data.role === 'Client') {
        showError(
          'Only Admins are allowed to reset passwords. Please contact the administrator at hrbs@gmail.com.',
          1500,
        );
      } else {
        showError('Invalid role or user not recognized.', 1500);
      }

      setEmail('');
    } catch (err) {
      console.error(err);
      const errorMsg =
        err?.response?.data?.message ||
        'Server error. Please try again later.';
      showError(errorMsg, 1500);
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
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <CCardBody>
                <div className="text-center mb-3 mb-md-4">
                  <h1
                    style={{
                      color: '#0e0d0dff',
                      fontWeight: 450,
                      fontSize: '1.4rem',
                    }}
                  >
                    Forgot Password
                  </h1>
                  <p
                    style={{
                      color: 'rgba(12, 12, 12, 0.8)',
                      fontSize: '0.85rem',
                    }}
                  >
                    Enter your email to reset your password
                  </p>
                </div>

                <CForm
                  onSubmit={(e) => {
                    e.preventDefault();
                    checkUserEmail();
                  }}
                >
                  {/* <CInputGroup className="mb-3">
                    <CInputGroupText className="glass-input-icon">
                      <CIcon
                        icon={cilEnvelopeOpen}
                        style={{ color: '#3973b6ff' }}
                      />
                    </CInputGroupText>
                    <CFormInput
                      type="email"
                      placeholder="Email"
                      autoComplete="email"
                      className="glass-input"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{ fontSize: '0.85rem' }}
                      required
                    />
                  </CInputGroup> */}

                  <CInputGroup className="mb-3 input-group-responsive">
                    <CInputGroupText className="glass-input-icon">
                      <CIcon icon={cilEnvelopeOpen} style={{ color: '#3973b6ff' }} />
                    </CInputGroupText>
                    <CFormInput
                      type="email"
                      placeholder="Email"
                      autoComplete="email"
                      className="glass-input"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{ fontSize: '0.85rem' }}
                      required
                    />
                  </CInputGroup>


                  <div className="d-grid mt-3">
                    <CButton
                      color="primary"
                      className="w-100 py-2"
                      style={{
                        background:
                          'linear-gradient(90deg, #5f8ed0ff 0%, #4a5dcaff 100%)',
                        border: 'none',
                        borderRadius: '1px',
                        fontSize: '1rem',
                      }}
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? 'Sending...' : 'Verify Email'}
                    </CButton>
                  </div>
                </CForm>

                <div className="text-center mt-3">
                  <Link
                    to="/login"
                    style={{
                      textDecoration: 'none',
                      color: '#000000ff',
                      fontSize: '0.8rem',
                    }}
                  >
                    Back to Login
                  </Link>
                </div>

                <div
                  className="text-center mt-4"
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
                      fontSize: '0.7rem',
                    }}
                  >
                    HRBS – Your Global Business Partner
                  </small>
                </div>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>

    </div>
  );
};

export default ForgotPassword;
