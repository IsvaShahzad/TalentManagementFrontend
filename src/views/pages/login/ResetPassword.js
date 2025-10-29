import React, { useState } from 'react'
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
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked } from '@coreui/icons'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import bgImage from '../../../assets/images/background-login1.jpeg'
import './Login.css'
import { resetUserPassword } from '../../../api/api' // your API function




const ResetPassword = () => {
    const [searchParams] = useSearchParams()
    const email = searchParams.get('email')

    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)

    const handleResetPassword = async (e) => {
        e.preventDefault()

        if (!password || !confirmPassword) {
            toast.error('Both fields are required')
            return
        }

        if (password !== confirmPassword) {
            toast.error('Passwords do not match')
            return
        }

        setLoading(true)
        try {
            const res = await resetUserPassword(email, password)
            toast.success(res.message || 'Password reset successfully!')
            setPassword('')
            setConfirmPassword('')
            setTimeout(() => {
                navigate('/login');
            }, 4000);

        } catch (err) {
            console.error(err)
            const errorMsg = err?.response?.data?.message || 'Something went wrong. Please try again.'
            toast.error(errorMsg)
        } finally {
            setLoading(false)
        }
    }

    const navigate = useNavigate();
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
                        <CCard className="glass-card p-5 border-0" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            <CCardBody>
                                <div className="text-center mb-4">
                                    <h1 style={{ color: '#0e0d0dff', fontWeight: 500, fontFamily: 'Inter, sans-serif'}}
                                    >Reset Password</h1>
                                    <p style={{ color: 'rgba(12, 12, 12, 0.8)', fontFamily: 'Inter, sans-serif' }}>
                                        Enter your new password for <b>{email}</b>
                                    </p>
                                </div>

                                <CForm onSubmit={handleResetPassword}>
                                    <CInputGroup className="mb-4">
                                        <CInputGroupText className="glass-input-icon">
                                            <CIcon icon={cilLockLocked} style={{ color: '#6c9ed7ff' }} />
                                        </CInputGroupText>
                                        <CFormInput
                                            type="password"
                                            placeholder="New Password"
                                            className="glass-input"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                    </CInputGroup>

                                    <CInputGroup className="mb-4">
                                        <CInputGroupText className="glass-input-icon">
                                            <CIcon icon={cilLockLocked} style={{ color: '#6c9ed7ff' }} />
                                        </CInputGroupText>
                                        <CFormInput
                                            type="password"
                                            placeholder="Confirm Password"
                                            className="glass-input"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                        />
                                    </CInputGroup>

                                    <div className="d-grid mt-4">
                                        <CButton
                                            color="primary"
                                            className="w-100 py-3"
                                            style={{
                                                background: 'linear-gradient(90deg, #5f8ed0ff 0%, #4a5dcaff 100%)',
                                                border: 'none',
                                                borderRadius: '1px',
                                                fontSize: '1.3rem',
                                                marginTop: '20px',
                                            }}
                                            type="submit"
                                            disabled={loading}
                                        >
                                            {loading ? 'Resetting...' : 'Reset Password'}
                                        </CButton>
                                    </div>
                                </CForm>

                                <div className="text-center mt-3">
                                    <Link to="/login" style={{ textDecoration: 'none', color: '#000000ff' }}>
                                        Back to Login
                                    </Link>
                                </div>

                                <div
                                    className="text-center mt-4"
                                    style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: '8px' }}
                                >
                                    <img
                                        src="/hrbs-logo.png"
                                        alt="HRBS Logo"
                                        style={{ height: '20px', width: '20px', transform: 'translateY(-2px)' }}
                                    />
                                    <small style={{ color: 'rgba(11, 11, 11, 0.8)' }}>
                                        HRBS – Your Global Business Partner
                                    </small>
                                </div>
                            </CCardBody>
                        </CCard>
                    </CCol>
                </CRow>
            </CContainer>

            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
        </div>
    )
}

export default ResetPassword

