import React, { useState, useEffect } from 'react'
import './AddUser.css'
import {
  CButton, CCard, CCardBody, CCol, CContainer, CForm, CFormInput,
  CRow, CFormCheck, CFormSelect, CAlert, CTable, CTableHead,
  CTableRow, CTableHeaderCell, CTableBody, CTableDataCell
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilUser, cilEnvelopeOpen, cilPencil, cilCheckAlt, cilX,
  cilTrash, cilSearch, cilLockLocked, cilBuilding
} from '@coreui/icons'
import {
  createUserApi, getAllUsersApi, updateUserApi, deleteUserByEmailApi
} from '../../../api/api'
import DisplayUsersTable from './DisplayUsersTable'
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
  const [company, setCompany] = useState('')
  // const [filteredUsers, setFilteredUsers] = useState([])
  //  const [searchQuery, setSearchQuery] = useState('')
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [alertColor, setAlertColor] = useState('success')
  const [suggestedPassword, setSuggestedPassword] = useState(generatePassword())


  const fetchUsers = async () => {
    try {
      const response = await getAllUsersApi()
      if (response && response.users) {
        const formattedUsers = response.users.map(u => ({
          email: u.email,
          full_name: u.full_name,
          role: u.role,
          password_hash: u.password_hash,
          date: new Date(u.createdAt).toLocaleString(),
          company: u.Client?.company || '-',
        }))
        setUsers(formattedUsers)
      }
    } catch (err) {
      console.error('Failed to fetch users:', err)
    }
  }


  useEffect(() => {
    fetchUsers()
  }, [])

  const handleAutoGenerateToggle = (checked) => {
    setAutoGenerate(checked)
    if (checked) {
      setPassword('')
      setSuggestedPassword(generatePassword())
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const finalPassword = autoGenerate ? suggestedPassword : password

    const newUser = {
      full_name: name, email, password_hash: finalPassword, role,
      ...(role === 'Client' && { company }),
    }
    //if client
    console.log("company in frontend", company)
    try {
      await createUserApi(newUser)
      setAlertMessage(`User "${name}" created successfully as ${role}`)
      setAlertColor('success')
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 3000)

      setName('')
      setEmail('')
      setPassword('')
      setRole('Admin')
      setAutoGenerate(true)
      setSuggestedPassword(generatePassword())
      fetchUsers()
    } catch (err) {
      console.error(err)
      setAlertMessage(err.message || 'Failed to create user')
      setAlertColor('danger')
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 3000)
    }
  }
  return (
    <CContainer style={{ fontFamily: 'Montserrat', maxWidth: '1500px' }}>
      {/* Add User Form */}
      <CRow className="justify-content-center mb-5">
        <CCol md={9} lg={7} xl={6}>
          <CCard className="mx-4 border-0" style={{ borderRadius: '40px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <CCardBody className="p-5">
              <CForm onSubmit={handleSubmit}>
                <h1 style={{ fontWeight: 450, textAlign: 'center', marginBottom: '0.4rem', fontSize: '2.3rem', fontFamily: 'Inter, sans-serif' }}>Add New User</h1>
                <p className="text-body-secondary" style={{ textAlign: 'center', marginBottom: '1.5rem', fontSize: '0.9rem' , fontFamily: 'Inter, sans-serif'}}>Fill details to create a new user</p>

                {showAlert && <CAlert color={alertColor} className="text-center fw-medium">{alertMessage}</CAlert>}

                {/* Full Name Field */}
                <div className="mb-4"
                  style={{
                    display: 'flex', alignItems: 'center',
                    border: '1px solid #e2e8f0', borderRadius: '8px', fontFamily: 'Inter, sans-serif'
                  }}>
                  <div style={{ display: 'flex', alignItems: 'center', padding: '0 12px' }}>
                    <CIcon icon={cilUser} style={{ color: '#326396ff', fontSize: '18px' }} />
                    {/* Thin blue divider */}
                    <div style={{ width: '0.9px', height: '25px', backgroundColor: '#518ccbff', marginLeft: '8px', marginRight: '8px', fontFamily: 'Inter, sans-serif' }}></div>
                  </div>
                  <CFormInput
                    placeholder="Full Name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    style={{ border: 'none', outline: 'none', fontFamily: 'Inter, sans-serif' }}
                  />
                </div>

                {/* Email Field */}
                <div className="mb-4" style={{ display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', padding: '0 12px' }}>
                    <CIcon icon={cilEnvelopeOpen} style={{ color: '#326396ff', fontSize: '18px' }} />
                    <div style={{ width: '0.9px', height: '25px', backgroundColor: '#669fddff', marginLeft: '8px', marginRight: '8px', fontFamily: 'Inter, sans-serif' }}></div>
                  </div>
                  <CFormInput
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    style={{ border: 'none', outline: 'none', fontFamily: 'Inter, sans-serif' }}
                  />
                </div>

                {/* Role Field */}
                <div
                  className="mb-4"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    height: '44px', // reduced height
                    backgroundColor: '#fff',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0 12px',
                      fontFamily: 'Inter, sans-serif'
                    }}>
                    <CIcon icon={cilUser}
                      style={{ color: '#326396ff', fontSize: '18px' }} />
                    <div
                      style={{
                        width: '0.9px',
                        height: '25px',
                        backgroundColor: '#518ccbff',
                        marginLeft: '8px',
                        marginRight: '8px',
                        fontFamily: 'Inter, sans-serif'
                      }}
                    ></div>
                  </div>

                  <CFormSelect
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    style={{
                      border: 'none',
                      outline: 'none',
                      flex: 1,
                      fontSize: '1rem',
                      padding: '0 0.75rem', // reduces top/bottom padding, moves text slightly left
                      height: '100%', // ensures it fills the container height
                      boxShadow: 'none',
                      backgroundColor: '#fff',
                      color: role ? '#4e596bff' : '#9ca3af',
                      appearance: 'none', // removes default arrow styling
                      WebkitAppearance: 'none',
                      MozAppearance: 'none',
                      width: '50%',
                      fontFamily: 'Inter, sans-serif'
                    }}
                    className="no-hover-select"
                  >

                    <option value="" disabled hidden>
                      Role
                    </option>
                    <option value="Admin">Admin</option>
                    <option value="Recruiter">Recruiter</option>
                    <option value="Client">Client</option>

                  </CFormSelect>
                </div>


                {/* ✅ Only show company + title fields when role is Client */}
                {role === 'Client' && (
                  <>
                    <div className="mb-4" style={{ display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: '8px', fontFamily: 'Inter, sans-serif' }}>
                      <div style={{ display: 'flex', alignItems: 'center', padding: '0 12px' }}>
                        <CIcon icon={cilBuilding} style={{ color: '#326396ff', fontSize: '18px' }} />
                        <div style={{ width: '0.9px', height: '25px', backgroundColor: '#669fddff', marginLeft: '8px', marginRight: '8px', fontFamily: 'Inter, sans-serif' }}></div>
                      </div>
                      <CFormInput

                        placeholder="Company"

                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        required
                        style={{ border: 'none', outline: 'none' }}
                      />
                    </div>
                  </>
                )}

                {/* Password Field */}
                <div
                  className="mb-3"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    backgroundColor: autoGenerate ? '#f3f4f6' : '#fff',
                    opacity: autoGenerate ? 0.8 : 1,
                    pointerEvents: autoGenerate ? 'none' : 'auto',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', padding: '0 12px' }}>
                    <CIcon icon={cilLockLocked} style={{ color: '#326396ff', fontSize: '18px' }} />
                    <div
                      style={{
                        width: '1px',
                        height: '25px',
                        backgroundColor: '#518ccbff',
                        marginLeft: '8px',
                        marginRight: '8px',
                        fontFamily: 'Inter, sans-serif'
                      }}
                    ></div>
                  </div>

                  <CFormInput
                    type={autoGenerate ? 'text' : 'password'}
                    placeholder="Password"
                    value={autoGenerate ? suggestedPassword : password}
                    onChange={(e) => setPassword(e.target.value)}
                    required={!autoGenerate}
                    disabled={autoGenerate}
                    style={{
                      border: 'none',
                      outline: 'none',
                      flex: 1,
                      fontSize: '1rem',
                      backgroundColor: 'transparent',
                      boxShadow: 'none',
                      color: '#1e293b',
                      fontFamily: 'Inter, sans-serif'
                    }}
                    className="no-hover-input"
                  />
                </div>

                {/* Auto-generate checkbox */}
                <CFormCheck
                  type="checkbox"
                  label="Auto-generate password"
                  checked={autoGenerate}
                  onChange={(e) => handleAutoGenerateToggle(e.target.checked)}
                  className="mb-3"
                  style={{ fontFamily: 'Inter, sans-serif' }} // <-- added font family

                />

                {/* Suggested Password Box */}
                {autoGenerate && (
                  <div
                    className="mt-3 p-3 border rounded text-center"
                    style={{
                      fontFamily: 'monospace',
                      background: '#f9fafb',
                      fontSize: '0.95rem',
                      
                    }}
                  >
                    Suggested Password: <strong>{suggestedPassword}</strong>
                  </div>
                )}


                <CButton
                  type="submit"
                  className="mt-5 py-3"
                  style={{
                    width: '70%', // adjust width as needed
                    display: 'block', // makes margin auto work
                    margin: '0 auto', // centers the button
                    background: 'linear-gradient(90deg, #5f8ed0ff 0%, #4a5dcaff 100%)',
                    border: 'none',
                    borderRadius: '0px', // slightly rounded
                    fontSize: '1.4rem',
                    fontWeight: 250,
                    color: 'white',
                    fontFamily: 'Inter, sans-serif'
                  }}
                >
                  Add User
                </CButton>

              </CForm>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {showAlert && (
        <CAlert color={alertColor} className="toast-alert text-center">
          {alertMessage}
        </CAlert>
      )}

      {/* === Users Table === */}
      <DisplayUsersTable
      />


    </CContainer>
  )
}

export default AddUser