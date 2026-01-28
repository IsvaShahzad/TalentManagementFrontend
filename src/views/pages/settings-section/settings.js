import React, { useMemo, useState } from 'react'
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
  CFormSelect,
  CFormSwitch,
  CInputGroup,
  CInputGroupText,
  CRow,
} from '@coreui/react'
import { updateUserApi, resetUserPassword } from '../../../api/api'

const safeParseUser = () => {
  try {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const getLocalPref = (key, fallback) => {
  try {
    const v = localStorage.getItem(key)
    return v === null ? fallback : v
  } catch {
    return fallback
  }
}

const setLocalPref = (key, value) => {
  try {
    localStorage.setItem(key, value)
  } catch {
    // ignore
  }
}

const Settings = () => {
  const user = useMemo(() => safeParseUser(), [])

  const [fullName, setFullName] = useState(user?.full_name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [role] = useState(user?.role || localStorage.getItem('role') || '')

  const [timezone, setTimezone] = useState(getLocalPref('settings.timezone', Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'))
  const [notificationsEnabled, setNotificationsEnabled] = useState(getLocalPref('settings.notificationsEnabled', 'true') === 'true')

  const [newPassword, setNewPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [changingPw, setChangingPw] = useState(false)
  const [alert, setAlert] = useState(null) // {color, text}

  const timezones = useMemo(
    () => [
      'UTC',
      'Africa/Lagos',
      'Europe/London',
      'Europe/Paris',
      'Asia/Dubai',
      'Asia/Kolkata',
      'Asia/Singapore',
      'Asia/Tokyo',
      'America/New_York',
      'America/Chicago',
      'America/Denver',
      'America/Los_Angeles',
      'Australia/Sydney',
    ],
    [],
  )

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
        role, // keep role unchanged (view-only)
      }

      await updateUserApi(currentEmail, payload)

      // keep local identity in sync
      const updatedUser = { ...(user || {}), full_name: fullName, email, role }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      localStorage.setItem('user_email', email)
      localStorage.setItem('role', role)

      // preferences are local-only for now
      setLocalPref('settings.timezone', timezone)
      setLocalPref('settings.notificationsEnabled', String(notificationsEnabled))

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

  return (
    <CRow className="justify-content-center">
      <CCol xs={12} lg={10} xl={8}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Settings</strong>
            <div className="text-body-secondary" style={{ fontSize: 12 }}>
              Account Settings
            </div>
          </CCardHeader>
          <CCardBody>
            {alert ? (
              <CAlert color={alert.color} className="mb-3">
                {alert.text}
              </CAlert>
            ) : null}

            <CForm onSubmit={saveAccount}>
              <CRow className="g-3">
                <CCol md={6}>
                  <CFormLabel>Name</CFormLabel>
                  <CFormInput value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full name" />
                </CCol>

                <CCol md={6}>
                  <CFormLabel>Role</CFormLabel>
                  <CFormInput value={role} readOnly />
                </CCol>

                <CCol md={6}>
                  <CFormLabel>Email</CFormLabel>
                  <CFormInput
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                  />
                </CCol>

                <CCol md={6}>
                  <CFormLabel>Time zone</CFormLabel>
                  <CFormSelect value={timezone} onChange={(e) => setTimezone(e.target.value)}>
                    {timezones.map((tz) => (
                      <option key={tz} value={tz}>
                        {tz}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>

                <CCol xs={12}>
                  <CFormSwitch
                    label="Enable notifications"
                    checked={notificationsEnabled}
                    onChange={(e) => setNotificationsEnabled(e.target.checked)}
                  />
                  <div className="text-body-secondary" style={{ fontSize: 12 }}>
                    This currently only affects the UI (stored locally).
                  </div>
                </CCol>

                <CCol xs={12}>
                  <CCard className="mt-2">
                    <CCardHeader>
                      <strong>Change password</strong>
                    </CCardHeader>
                    <CCardBody>
                      <CRow className="g-2 align-items-end">
                        <CCol md={8}>
                          <CFormLabel>New password</CFormLabel>
                          <CInputGroup>
                            <CInputGroupText>• • •</CInputGroupText>
                            <CFormInput
                              type="password"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              placeholder="Enter a new password"
                            />
                          </CInputGroup>
                        </CCol>
                        <CCol md={4} className="d-grid">
                          <CButton color="primary" type="button" onClick={changePassword} disabled={changingPw}>
                            {changingPw ? 'Changing…' : 'Change password'}
                          </CButton>
                        </CCol>
                      </CRow>
                    </CCardBody>
                  </CCard>
                </CCol>

                <CCol xs={12} className="d-flex justify-content-end gap-2">
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
