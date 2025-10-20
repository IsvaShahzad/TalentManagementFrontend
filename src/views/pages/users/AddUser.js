import React, { useState, useEffect } from 'react'
import {
  CButton, CCard, CCardBody, CCol, CContainer, CForm, CFormInput,
  CRow, CFormCheck, CFormSelect, CAlert, CTable, CTableHead,
  CTableRow, CTableHeaderCell, CTableBody, CTableDataCell,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilUser, cilEnvelopeOpen, cilPencil, cilCheckAlt, cilX, cilTrash, cilSearch } from '@coreui/icons'
import { createUserApi, getAllUsersApi, updateUserApi, deleteUserByEmailApi } from '../../../api/api'

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
  const [filteredUsers, setFilteredUsers] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [alertColor, setAlertColor] = useState('success')
  const [suggestedPassword, setSuggestedPassword] = useState(generatePassword())
  const [editingEmail, setEditingEmail] = useState(null)
  const [editableUser, setEditableUser] = useState({})

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
        }))
        setUsers(formattedUsers)
        setFilteredUsers(formattedUsers)
      }
    } catch (err) {
      console.error('Failed to fetch users:', err)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  // Filter users based on search query
  useEffect(() => {
    const query = searchQuery.toLowerCase()
    const filtered = users.filter(
      user => user.full_name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query)
    )
    setFilteredUsers(filtered)
  }, [searchQuery, users])

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
    const newUser = { full_name: name, email, password_hash: finalPassword, role }

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

  const handleEdit = (user) => {
    setEditingEmail(user.email)
    setEditableUser({ ...user })
  }

  const handleCancel = () => {
    setEditingEmail(null)
    setEditableUser({})
  }

  const handleChange = (field, value) => {
    setEditableUser(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    try {
      if (!editableUser.email) throw new Error('Email missing!')
      const payload = {
        full_name: editableUser.full_name,
        role: editableUser.role,
        email: editableUser.email,
      }
      await updateUserApi(editableUser.email, payload)
      await fetchUsers()
      setEditingEmail(null)
      setEditableUser({})
      setAlertMessage('User updated successfully')
      setAlertColor('success')
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 3000)
    } catch (err) {
      console.error('Update failed:', err.response || err)
      setAlertMessage('Failed to update user. Check console for details.')
      setAlertColor('danger')
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 3000)
    }
  }

  const handleDelete = async (userEmail) => {
    if (!window.confirm(`Are you sure you want to delete ${userEmail}?`)) return
    try {
      await deleteUserByEmailApi(userEmail)
      setAlertMessage(`User "${userEmail}" deleted successfully`)
      setAlertColor('success')
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 3000)
      fetchUsers()
    } catch (err) {
      console.error('Delete failed:', err)
      setAlertMessage('Failed to delete user. Check console for details.')
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
          <CCard className="mx-4 border-0" style={{ borderRadius: '40px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <CCardBody className="p-5">
              <CForm onSubmit={handleSubmit}>
                <h1 style={{ fontWeight: 400, textAlign: 'center', marginBottom: '0.4rem', fontSize: '2.3rem' }}>Add New User</h1>
                <p className="text-body-secondary" style={{ textAlign: 'center', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Fill details to create a new user</p>

                {showAlert && <CAlert color={alertColor} className="text-center fw-medium">{alertMessage}</CAlert>}

                <div className="mb-4" style={{ display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                  <div style={{ padding: '0 12px' }}>
                    <CIcon icon={cilUser} style={{ color: '#326396ff', fontSize: '18px' }} />
                  </div>
                  <CFormInput placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required style={{ border: 'none', outline: 'none' }} />
                </div>

                <div className="mb-4" style={{ display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                  <div style={{ padding: '0 12px' }}>
                    <CIcon icon={cilEnvelopeOpen} style={{ color: '#326396ff', fontSize: '18px' }} />
                  </div>
                  <CFormInput type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required style={{ border: 'none', outline: 'none' }} />
                </div>

                <CFormSelect value={role} onChange={e => setRole(e.target.value)} className="mb-4">
                  <option value="Admin">Admin</option>
                  <option value="Recruiter">Recruiter</option>
                  <option value="Client">Client</option>
                </CFormSelect>

                <CFormInput type={autoGenerate ? 'text' : 'password'} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required={!autoGenerate} disabled={autoGenerate} className="mb-2" />

                <CFormCheck type="checkbox" label="Auto-generate password" checked={autoGenerate} onChange={e => handleAutoGenerateToggle(e.target.checked)} className="mb-3" />
                {autoGenerate && <div className="mt-3 p-3 border rounded text-center" style={{ fontFamily: 'monospace', background: '#f9fafb', fontSize: '0.95rem' }}>Suggested Password: <strong>{suggestedPassword}</strong></div>}

                <CButton color="primary" type="submit" className="mt-4 w-100">Add User</CButton>
              </CForm>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Users Table */}
      <CRow className="justify-content-center mb-3">
        <CCol md={10}>
          <div className="mb-2" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CIcon icon={cilSearch} style={{ fontSize: '18px', color: '#326396ff' }} />
            <CFormInput
              placeholder="Search by name or email"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </CCol>
      </CRow>

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
                    <CTableHeaderCell>Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {filteredUsers.map(user => (
                    <CTableRow key={user.email} style={editingEmail === user.email ? { backgroundColor: '#f1f5ff' } : {}}>
                      <CTableDataCell>
                        {editingEmail === user.email
                          ? <CFormInput value={editableUser.full_name} onChange={e => handleChange('full_name', e.target.value)} />
                          : user.full_name}
                      </CTableDataCell>

                      <CTableDataCell>
                        {editingEmail === user.email
                          ? <CFormInput value={editableUser.email} disabled />
                          : user.email}
                      </CTableDataCell>

                      <CTableDataCell style={{ fontFamily: 'monospace' }}>{user.password_hash}</CTableDataCell>

                      <CTableDataCell>
                        {editingEmail === user.email
                          ? <CFormSelect value={editableUser.role} onChange={e => handleChange('role', e.target.value)}>
                              <option value="Admin">Admin</option>
                              <option value="Recruiter">Recruiter</option>
                              <option value="Client">Client</option>
                            </CFormSelect>
                          : user.role}
                      </CTableDataCell>

                      <CTableDataCell>{user.date}</CTableDataCell>

                      <CTableDataCell>
                        {editingEmail === user.email ? (
                          <>
                            <CButton color="success" size="sm" onClick={handleSave} className="me-2">
                              <CIcon icon={cilCheckAlt} />
                            </CButton>
                            <CButton color="secondary" size="sm" onClick={handleCancel}>
                              <CIcon icon={cilX} />
                            </CButton>
                          </>
                        ) : (
                          <>
                            <CButton color="info" size="sm" onClick={() => handleEdit(user)} className="me-2">
                              <CIcon icon={cilPencil} />
                            </CButton>
                            <CButton color="danger" size="sm" onClick={() => handleDelete(user.email)}>
                              <CIcon icon={cilTrash} />
                            </CButton>
                          </>
                        )}
                      </CTableDataCell>
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
