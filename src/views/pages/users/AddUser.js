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
  cilTrash, cilSearch, cilLockLocked
} from '@coreui/icons'
import {
  createUserApi, getAllUsersApi, updateUserApi, deleteUserByEmailApi
} from '../../../api/api'

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
  const [editingUser, setEditingUser] = useState(false)
  const [editableUser, setEditableUser] = useState({})
  const [deletingUser, setDeletingUser] = useState(null)

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

  useEffect(() => {
    const query = searchQuery.toLowerCase()
    const filtered = users.filter(
      user =>
        user.full_name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
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
    setEditableUser({ ...user })
    setEditingUser(true)
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
      setEditingUser(false)
      setEditableUser({})
      setAlertMessage('User updated successfully')
      setAlertColor('success')
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 3000)
    } catch (err) {
      console.error('Update failed:', err.response || err)
      setAlertMessage('Failed to update user.')
      setAlertColor('danger')
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 3000)
    }
  }

  const handleDelete = (user) => {
    setDeletingUser(user)
  }

  const handleConfirmDelete = async () => {
    try {
      await deleteUserByEmailApi(deletingUser.email)
      setAlertMessage(`User "${deletingUser.email}" deleted successfully`)
      setAlertColor('success')
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 3000)
      setDeletingUser(null)
      fetchUsers()
    } catch (err) {
      console.error('Delete failed:', err)
      setAlertMessage('Failed to delete user.')
      setAlertColor('danger')
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 3000)
    }
  }

  const handleCancelDelete = () => setDeletingUser(null)
  const handleCancelEdit = () => setEditingUser(false)

  return (
    <CContainer style={{ fontFamily: 'Montserrat', maxWidth: '1500px' }}>
    {/* Add User Form */}
<CRow className="justify-content-center mb-5">
  <CCol md={9} lg={7} xl={6}>
    <CCard className="mx-4 border-0" style={{ borderRadius: '40px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
      <CCardBody className="p-5">
        <CForm onSubmit={handleSubmit}>
          <h1 style={{ fontWeight: 450, textAlign: 'center', marginBottom: '0.4rem', fontSize: '2.3rem' }}>Add New User</h1>
          <p className="text-body-secondary" style={{ textAlign: 'center', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Fill details to create a new user</p>

          {showAlert && <CAlert color={alertColor} className="text-center fw-medium">{alertMessage}</CAlert>}

          {/* Full Name Field */}
          <div className="mb-4" style={{ display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', padding: '0 12px' }}>
              <CIcon icon={cilUser} style={{ color: '#326396ff', fontSize: '18px' }} />
              {/* Thin blue divider */}
              <div style={{ width: '0.9px', height: '25px', backgroundColor: '#518ccbff', marginLeft: '8px', marginRight: '8px' }}></div>
            </div>
            <CFormInput
              placeholder="Full Name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              style={{ border: 'none', outline: 'none' }}
            />
          </div>

          {/* Email Field */}
          <div className="mb-4" style={{ display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', padding: '0 12px' }}>
              <CIcon icon={cilEnvelopeOpen} style={{ color: '#326396ff', fontSize: '18px' }} />
              <div style={{ width: '0.9px', height: '25px', backgroundColor: '#669fddff', marginLeft: '8px', marginRight: '8px' }}></div>
            </div>
            <CFormInput
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{ border: 'none', outline: 'none' }}
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
  <div style={{ display: 'flex', alignItems: 'center', padding: '0 12px' }}>
    <CIcon icon={cilUser} style={{ color: '#326396ff', fontSize: '18px' }} />
    <div
      style={{
        width: '0.9px',
        height: '25px',
        backgroundColor: '#518ccbff', 
        marginLeft: '8px',
        marginRight: '8px',
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
    fontSize: '1.2rem',
    fontWeight: 250,
    color: 'white',
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
<CRow className="justify-content-center">
  <CCol md={10}>
    <CCard
      className="mx-4 border-0 shadow-sm"
      style={{
        borderRadius: '16px',
        background: '#ffffff',
      }}
    >
      <CCardBody className="p-4">
        {/* === Search Filter Centered Inside Container === */}
<div
  style={{
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '1.5rem',
  }}
>
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '2px',
      padding: '0.6rem 1rem',
      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
      width: '100%', // narrower width
      maxWidth: '600px', // prevents it from stretching too wide
    }}
  >
    <CIcon
      icon={cilSearch}
      style={{
        color: '#326396ff',
        fontSize: '1.2rem',
        marginRight: '10px',
      }}
    />
    <CFormInput
      type="text"
      placeholder="Search by name or email..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      style={{
        border: 'none',
        outline: 'none',
        boxShadow: 'none',
        fontSize: '1rem',
        color: '#374151',
      }}
    />
  </div>
</div>


        {/* === Table Section === */}
        <CTable
          responsive
          className="align-middle"
          style={{
            borderCollapse: 'separate',
            borderSpacing: '0 10px',
            marginTop: '20px'
          }}
        >
          <CTableHead>
            <CTableRow style={{ backgroundColor: '#f8fafc' }}>
              <CTableHeaderCell style={{ fontWeight: 600 }}>Name</CTableHeaderCell>
              <CTableHeaderCell style={{ fontWeight: 600 }}>Email</CTableHeaderCell>
              <CTableHeaderCell style={{ fontWeight: 600 }}>Password</CTableHeaderCell>
              <CTableHeaderCell style={{ fontWeight: 600 }}>Role</CTableHeaderCell>
              <CTableHeaderCell style={{ fontWeight: 600 }}>Date Created</CTableHeaderCell>
              <CTableHeaderCell className="text-center" style={{ fontWeight: 600 }}>
                Actions
              </CTableHeaderCell>
            </CTableRow>
          </CTableHead>

          <CTableBody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <CTableRow
                  key={user.email}
                  style={{
                    backgroundColor: '#ffffff',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.09)',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    transition: 'none', // no hover effect
                  }}
                >
                  <CTableDataCell style={{ padding: '1rem', border: 'none' }}>
                    {user.full_name}
                  </CTableDataCell>

                  <CTableDataCell style={{ padding: '1rem', border: 'none' }}>
                    {user.email}
                  </CTableDataCell>

                  <CTableDataCell
                    style={{
                      padding: '1rem',
                      border: 'none',
                      fontFamily: 'monospace',
                    }}
                  >
                    {user.password_hash}
                  </CTableDataCell>

                  <CTableDataCell style={{ padding: '1rem', border: 'none' }}>
                    {user.role}
                  </CTableDataCell>

                  <CTableDataCell style={{ padding: '1rem', border: 'none' }}>
                    {user.date}
                  </CTableDataCell>

                  <CTableDataCell
                    style={{ padding: '1rem', border: 'none' }}
                    className="text-center"
                  >
                    <CIcon
                      icon={cilPencil}
                      style={{
                        color: '#3b82f6',
                        cursor: 'pointer',
                        marginRight: '14px',
                        fontSize: '1.2rem',
                      }}
                      onClick={() => handleEdit(user)}
                    />
                    <CIcon
                      icon={cilTrash}
                      style={{
                        color: '#ef4444',
                        cursor: 'pointer',
                        fontSize: '1.2rem',
                      }}
                      onClick={() => handleDelete(user)}
                    />
                  </CTableDataCell>
                </CTableRow>
              ))
            ) : (
              <CTableRow>
                <CTableDataCell colSpan="6" className="text-center py-4 text-muted">
                  No users found.
                </CTableDataCell>
              </CTableRow>
            )}
          </CTableBody>
        </CTable>
      </CCardBody>
    </CCard>
  </CCol>
</CRow>



      {/* === Edit User Modal === */}
      {editingUser && (
        <div className="overlay">
          <CCard
            className="p-4 text-center"
            style={{
              width: '500px',
              height: '400px',
              borderRadius: '0.25rem',
              fontFamily: 'Montserrat',
            }}
          >
            <h4 style={{ fontWeight: 600, fontSize: '1.5rem', marginBottom: '0.5rem' }}>Update Details</h4>
            <p style={{ fontSize: '1rem', color: '#6c757d', marginBottom: '1.5rem' }}>{editableUser.email}</p>

            <div className="text-start mb-3">
              <label style={{ fontSize: '0.9rem', fontWeight: 500 }}>Name</label>
              <CFormInput
                value={editableUser.full_name}
                onChange={e => setEditableUser({ ...editableUser, full_name: e.target.value })}
              />
            </div>

            <div className="text-start mb-4">
              <label style={{ fontSize: '0.9rem', fontWeight: 500 }}>Role</label>
              <CFormSelect
                value={editableUser.role}
                onChange={e => setEditableUser({ ...editableUser, role: e.target.value })}
              >
                <option value="Recruiter">Recruiter</option>
                <option value="Admin">Admin</option>
                <option value="Client">Client</option>
              </CFormSelect>
            </div>

            <div className="d-flex justify-content-center gap-3 mt-3">
              
             <CButton
  color="success"
  onClick={handleSave}
  size="lg"
  style={{
    borderRadius: '0.25rem',
    padding: '0.75rem 10rem', // wider padding
    color: 'white',
    minWidth: '180px', // ensures the button stays long even with short text
  }}
>
  Update
</CButton>

            </div>
          </CCard>
        </div>
      )}

      {/* === Delete Confirmation === */}
      {deletingUser && (
  <div className="overlay">
    <CCard
      className="p-4 text-center"
      style={{
        width: '450px',
        height: '250px',
        borderRadius: '0.25rem',
        fontFamily: 'Montserrat',
      }}
    >
      <h5 style={{ fontWeight: 600, fontSize: '1.3rem', marginBottom: '1rem' }}>Confirm Delete</h5>
      <p style={{ fontSize: '1rem', color: '#6c757d', marginBottom: '2rem' }}>
        Are you sure you want to delete <strong>{deletingUser.email}</strong>?
      </p>
      <div className="d-flex justify-content-center gap-3 mt-3">
        <CButton
          color="secondary"
          onClick={handleCancelDelete}
          size="lg"
          style={{
            borderRadius: '0.2rem',
            backgroundColor: '#6c757d',
            border: 'none',
          }}
        >
          Cancel
        </CButton>
        <CButton
          onClick={handleConfirmDelete}
          size="lg"
          style={{
            borderRadius: '0.2rem',
            backgroundColor: '#da3c3cff', // stronger red
            border: 'none',
            color: 'white',
            transition: 'background-color 0.2s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#b71c1c')} // darker red on hover
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#d62828')}
        >
          Delete
        </CButton>
      </div>
    </CCard>
  </div>
)}


    </CContainer>
  )
}

export default AddUser
