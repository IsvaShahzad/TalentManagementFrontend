

// export default AddUser
import React, { useState, useEffect } from 'react'
import {
  CButton, CCard, CCardBody, CCol, CContainer, CForm, CFormInput,
  CRow, CFormCheck, CFormSelect, CAlert, CTable, CTableHead,
  CTableRow, CTableHeaderCell, CTableBody, CTableDataCell,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser, cilEnvelopeOpen } from '@coreui/icons'
import { createUserApi, getAllUsersApi } from '../../../api/api'

const generatePassword = (length = 10) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()'
  let pass = ''
  for (let i = 0; i < length; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return pass
}

const AddUser = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('Admin')
  const [autoGenerate, setAutoGenerate] = useState(true)
  const [users, setUsers] = useState([])
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [alertColor, setAlertColor] = useState('success')
  const [suggestedPassword, setSuggestedPassword] = useState(generatePassword())

  // Fetch all users from DB
const fetchUsers = async () => {
  try {
    const response = await getAllUsersApi()
    if (response && response.users) {
      const formattedUsers = response.users.map(u => ({
        name: u.full_name,           // from API
        email: u.email,
        password: u.password_hash,   // from API
        role: u.role,
        date: new Date(u.createdAt).toLocaleString() // format date
      }))
      setUsers(formattedUsers)
    }
  } catch (err) {
    console.error('Failed to fetch users:', err)
    setUsers([])
  }
}




  useEffect(() => {
    fetchUsers()
  }, [])

  const handleAutoGenerateToggle = (checked) => {
    setAutoGenerate(checked)
    if (checked) setPassword(''), setSuggestedPassword(generatePassword())
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const finalPassword = autoGenerate ? suggestedPassword : password
    const newUser = { full_name: name, email, password_hash: finalPassword, role }

    try {
      await createUserApi(newUser)

      // Show alert
      setAlertMessage(`User "${name}" created successfully as ${role}`)
      setAlertColor('success')
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 3000)

      // Reset form
      setName('')
      setEmail('')
      setPassword('')
      setRole('Admin')
      setAutoGenerate(true)
      setSuggestedPassword(generatePassword())

      // Refresh users table from DB
      fetchUsers()
    } catch (err) {
      setAlertMessage(err.message || 'Failed to create user')
      setAlertColor('danger')
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 3000)
    }
  }

  return (
    <CContainer style={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* Add User Form */}
      <CRow className="justify-content-center mb-5">
        <CCol md={9} lg={7} xl={6}>
          <CCard className="mx-4 border-0" style={{ borderRadius: '40px', background: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <CCardBody className="p-5">
              <CForm onSubmit={handleSubmit}>
                <h1 style={{ fontWeight: 400, color: '#1e293b', textAlign: 'center', marginBottom: '0.4rem', fontSize: '2.3rem' }}>Add New User</h1>
                <p className="text-body-secondary" style={{ textAlign: 'center', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Fill details to create a new user</p>

                {showAlert && <CAlert color={alertColor} className="text-center fw-medium">{alertMessage}</CAlert>}

                {/* Name */}
                <div className="mb-4" style={{ position: 'relative', height: '3.2rem', display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: '8px', background: 'white' }}>
                  <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '14px', paddingRight: '12px', height: '100%' }}>
                    <CIcon icon={cilUser} style={{ color: '#326396ff', fontSize: '18px' }} />
                    <div style={{ width: '1px', height: '60%', backgroundColor: '#e2e8f0', marginLeft: '10px' }}></div>
                  </div>
                  <CFormInput placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required style={{ fontSize: '1rem', padding: '0.8rem 1rem', border: 'none', outline: 'none', background: 'transparent', fontFamily: 'Poppins' }} />
                </div>

                {/* Email */}
                <div className="mb-4" style={{ position: 'relative', height: '3.2rem', display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: '8px', background: 'white' }}>
                  <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '14px', paddingRight: '12px', height: '100%' }}>
                    <CIcon icon={cilEnvelopeOpen} style={{ color: '#326396ff', fontSize: '18px' }} />
                    <div style={{ width: '1px', height: '60%', backgroundColor: '#e2e8f0', marginLeft: '10px' }}></div>
                  </div>
                  <CFormInput type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ fontSize: '1rem', padding: '0.8rem 1rem', border: 'none', outline: 'none', background: 'transparent', fontFamily: 'Poppins' }} />
                </div>

                {/* Role */}
                <CFormSelect value={role} onChange={(e) => setRole(e.target.value)} className="mb-4">
                  <option value="Admin">Admin</option>
                  <option value="Recruiter">Recruiter</option>
                  <option value="Client">Client</option>
                </CFormSelect>

                {/* Password */}
                <CFormInput type={autoGenerate ? 'text' : 'password'} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required={!autoGenerate} disabled={autoGenerate} className="mb-2" />

                <CFormCheck type="checkbox" label="Auto-generate password" checked={autoGenerate} onChange={(e) => handleAutoGenerateToggle(e.target.checked)} className="mb-3" />
                {autoGenerate && <div className="mt-3 p-3 border rounded text-center" style={{ fontFamily: 'monospace', background: '#f9fafb', fontSize: '0.95rem' }}>Suggested Password: <strong>{suggestedPassword}</strong></div>}

                <CButton color="primary" type="submit" className="mt-4 w-100">Add User</CButton>
              </CForm>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Users Table */}
      <CRow className="justify-content-center">
        <CCol md={10}>
          <CCard className="mx-4 border-0 shadow-sm" style={{ borderRadius: '20px', background: '#ffffff' }}>
            <CCardBody className="p-4">
              <h4 className="mb-4 text-center">Created Users</h4>
              <CTable responsive hover>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Name</CTableHeaderCell>
                    <CTableHeaderCell>Email</CTableHeaderCell>
                    <CTableHeaderCell>Password</CTableHeaderCell>
                    <CTableHeaderCell>Role</CTableHeaderCell>
                    <CTableHeaderCell>Date Created</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {users.map((user, index) => (
                    <CTableRow key={index}>
                      <CTableDataCell>{user.name}</CTableDataCell>
                      <CTableDataCell>{user.email}</CTableDataCell>
                      <CTableDataCell style={{ fontFamily: 'monospace' }}>{user.password}</CTableDataCell>
                      <CTableDataCell>{user.role}</CTableDataCell>
                      <CTableDataCell>{user.date}</CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  )
}

export default AddUser

