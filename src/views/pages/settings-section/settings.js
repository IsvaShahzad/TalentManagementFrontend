import React, { useMemo, useState, useEffect } from 'react'
import {
  CAlert,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CFormLabel,
  CFormSwitch,
  CInputGroup,
  CInputGroupText,
  CRow,
} from '@coreui/react'
import { updateUserApi, resetUserPassword } from '../../../api/api'
import './Settings.css' // Import our CSS

const safeParseUser = () => {
  try {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const Settings = () => {
  const user = useMemo(() => safeParseUser(), [])

  const [fullName, setFullName] = useState(user?.full_name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [role] = useState(user?.role || localStorage.getItem('role') || '')

  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    const storedUser = safeParseUser()
    return storedUser?.notifications_enabled ?? true
  })

  useEffect(() => {
    const storedUser = safeParseUser()
    if (storedUser?.notifications_enabled !== undefined) {
      setNotificationsEnabled(storedUser.notifications_enabled)
    }
  }, [user])

  const [newPassword, setNewPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [changingPw, setChangingPw] = useState(false)
  const [alert, setAlert] = useState(null)
  const [browserNotificationPermission, setBrowserNotificationPermission] = useState(() => {
    if ('Notification' in window) {
      return Notification.permission
    }
    return 'unsupported'
  })

  const saveAccount = async (e) => {
    e.preventDefault()
    setAlert(null)

    const currentEmail = user?.email || localStorage.getItem('user_email') || ''
    if (!currentEmail) {
      setAlert({ color: 'danger', text: 'Missing current user email (not logged in?)' })
      return
    }

    setSaving(true)
    try {
      const payload = {
        full_name: fullName,
        email,
        role,
        notifications_enabled: notificationsEnabled,
      }

      const response = await updateUserApi(currentEmail, payload)
      const updatedUserFromBackend = response?.updatedUser

      const finalNotificationsEnabled =
        updatedUserFromBackend?.notifications_enabled ?? notificationsEnabled

      const updatedUser = {
        ...(user || {}),
        user_id: updatedUserFromBackend?.user_id || user?.user_id,
        full_name: updatedUserFromBackend?.full_name || fullName,
        email: updatedUserFromBackend?.email || email,
        role: updatedUserFromBackend?.role || role,
        notifications_enabled: finalNotificationsEnabled,
      }

      localStorage.setItem('user', JSON.stringify(updatedUser))
      localStorage.setItem('user_email', email)
      localStorage.setItem('role', role)

      setNotificationsEnabled(finalNotificationsEnabled)
      window.dispatchEvent(new Event('userUpdated'))

      setAlert({ color: 'success', text: 'Account settings updated.' })
    } catch (err) {
      console.error('Failed to update account settings:', err)
      setAlert({ color: 'danger', text: err?.message || 'Failed to update account settings.' })
    } finally {
      setSaving(false)
    }
  }

  const changePassword = async () => {
    setAlert(null)
    if (!email) {
      setAlert({ color: 'danger', text: 'Email is required to change password.' })
      return
    }
    if (!newPassword || newPassword.length < 6) {
      setAlert({ color: 'danger', text: 'Password must be at least 6 characters.' })
      return
    }

    setChangingPw(true)
    try {
      await resetUserPassword(email, newPassword)
      setNewPassword('')
      setAlert({ color: 'success', text: 'Password changed successfully.' })
    } catch (err) {
      console.error('Failed to change password:', err)
      setAlert({ color: 'danger', text: err?.message || 'Failed to change password.' })
    } finally {
      setChangingPw(false)
    }
  }

  const enableBrowserNotifications = async () => {
    if (!('Notification' in window)) {
      setAlert({ color: 'warning', text: 'Browser notifications are not supported in this browser.' })
      return
    }

    try {
      // This will show the native browser prompt: "localhost wants to send you notifications"
      const permission = await Notification.requestPermission()
      setBrowserNotificationPermission(permission)
      localStorage.setItem('notification-permission-requested', 'true')
      localStorage.setItem('notification-permission', permission)

      if (permission === 'granted') {
        // Register service worker for background notifications
        if ('serviceWorker' in navigator) {
          try {
            await navigator.serviceWorker.register('/sw.js')
            console.log('Service Worker registered for notifications')
            setAlert({ color: 'success', text: 'Browser notifications enabled successfully!' })
          } catch (error) {
            console.error('Service Worker registration failed:', error)
            setAlert({ color: 'warning', text: 'Notifications enabled but service worker registration failed.' })
          }
        } else {
          setAlert({ color: 'success', text: 'Browser notifications enabled!' })
        }
      } else if (permission === 'denied') {
        setAlert({ color: 'warning', text: 'Browser notifications were blocked. You can enable them in your browser settings.' })
      } else {
        setAlert({ color: 'info', text: 'Browser notification permission was not granted.' })
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error)
      setAlert({ color: 'danger', text: 'Failed to enable browser notifications.' })
    }
  }

  // Update permission status when component mounts or user changes
  useEffect(() => {
    if ('Notification' in window) {
      const forceShow = localStorage.getItem('force-show-notification-prompt');
      // If force show flag is set, show as 'default' (reset state)
      if (forceShow === 'true') {
        setBrowserNotificationPermission('default');
      } else {
        setBrowserNotificationPermission(Notification.permission);
      }
    }
  }, [])

  return (
    <CRow className="justify-content-center">
      <CCol xs={12} lg={10} xl={8}>
        <CCard className="mb-4 settings-card">
          <CCardHeader>
            <strong>Settings</strong>
            <div className="text-body-secondary settings-subtitle">
              Account Settings
            </div>
          </CCardHeader>
          <CCardBody>
            {alert && <CAlert color={alert.color} className="mb-3">{alert.text}</CAlert>}

            <CForm onSubmit={saveAccount}>
              <CRow className="g-3">
                <CCol md={6}>
                  <CFormLabel>Name</CFormLabel>
                  <CFormInput
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Full name"
                  />
                </CCol>

                <CCol md={6}>
                  <CFormLabel>Role</CFormLabel>
                  <CFormInput value={role} readOnly />
                </CCol>

                <CCol md={8}>
                  <CFormLabel>Email</CFormLabel>
                  <CFormInput
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                  />
                </CCol>

                <CCol xs={12}>
                  <CFormSwitch
                    label="Enable notifications"
                    checked={notificationsEnabled}
                    onChange={(e) => setNotificationsEnabled(e.target.checked)}
                  />
                  <div className="text-body-secondary settings-subtext">
                    When disabled, you will not receive any notifications.
                  </div>
                  
                  {/* Browser Notification Permission */}
                  {('Notification' in window) && (
                    <div className="mt-3">
                      {browserNotificationPermission !== 'granted' && (
                        <>
                          <CButton
                            color="primary"
                            variant="outline"
                            onClick={enableBrowserNotifications}
                            disabled={browserNotificationPermission === 'denied'}
                          >
                            {browserNotificationPermission === 'denied' 
                              ? 'Notifications Blocked (Enable in Browser Settings)' 
                              : 'Enable Notifications'}
                          </CButton>
                          <div className="text-body-secondary settings-subtext mt-2">
                            Click to allow this site to send you desktop notifications. You'll see a browser prompt asking for permission.
                          </div>
                        </>
                      )}
                      
                      {browserNotificationPermission === 'granted' && (
                        <CAlert color="success" className="mb-2">
                          ✓ Browser notifications are enabled. You'll receive desktop notifications even when the app is closed.
                        </CAlert>
                      )}
                    </div>
                  )}
                </CCol>

                <CCol xs={12}>
                  <CCard className="mt-2">
                    <CCardHeader><strong>Change password</strong></CCardHeader>
                    <CCardBody>
                      <CRow className="g-2">
                        <CCol xs={12} md={8}>
                          <CFormLabel>New password</CFormLabel>
                          <CInputGroup className="password-input-group">
                            <CInputGroupText>• • •</CInputGroupText>
                            <CFormInput
                              type="password"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              placeholder="Enter a new password"
                            />
                          </CInputGroup>
                        </CCol>

                        <CCol xs={12} md={4} className="d-grid mt-2 mt-md-0">
                          <CButton
                            color="primary"
                            type="button"
                            className="password-change-btn"
                            onClick={changePassword}
                            disabled={changingPw}
                          >
                            {changingPw ? 'Changing…' : 'Change password'}
                          </CButton>
                        </CCol>
                      </CRow>
                    </CCardBody>
                  </CCard>
                </CCol>

                <CCol xs={12} className="d-flex justify-content-end gap-2 mt-2">
                  <CButton color="primary" type="submit" disabled={saving}>
                    {saving ? 'Saving…' : 'Save changes'}
                  </CButton>
                </CCol>
              </CRow>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default Settings
