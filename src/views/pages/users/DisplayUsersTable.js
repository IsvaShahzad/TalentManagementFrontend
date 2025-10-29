import React, { useEffect, useState } from 'react'
import {
  CTable, CTableHead, CTableRow, CTableHeaderCell,
  CTableBody, CTableDataCell,
  CCard, CButton, CFormSelect, CFormInput, CAlert
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilTrash } from '@coreui/icons'
import {
  getAllUsersApi, updateUserApi, deleteUserByEmailApi
} from '../../../api/api'


const headerStyle = {
  fontWeight: 600,
  padding: '1rem 1rem',
  border: 'none',
};


const DisplayUsersTable = () => {
  const [filtered, setFilteredUsers] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [users, setUsers] = useState([])
  const [editingUser, setEditingUser] = useState(false)
  const [editableUser, setEditableUser] = useState({})
  const [deletingUser, setDeletingUser] = useState(null)

  // ✅ alert states
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [alertColor, setAlertColor] = useState('success')

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
        setFilteredUsers(formattedUsers)
      }
    } catch (err) {
      console.error('Failed to fetch users:', err)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleSave = async () => {
    if (!editableUser.full_name || !editableUser.email) {
      setAlertMessage('Full Name and Email are required')
      setAlertColor('danger')
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 3000)
      return
    }

    if (editableUser.role === 'Client' && !editableUser.company) {
      setAlertMessage('Company is required for Client role')
      setAlertColor('danger')
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 3000)
      return
    }

    try {
      const payload = {
        full_name: editableUser.full_name,
        role: editableUser.role,
        email: editableUser.email,
        company: editableUser.company,
      }

      await updateUserApi(editableUser.email, payload)
      await fetchUsers()
      setEditingUser(false)
      setEditableUser({})

      // ✅ success alert with name & email
      setAlertMessage(`User "${editableUser.full_name}" (${editableUser.email}) updated successfully!`)
      setAlertColor('success')
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 3000)
    } catch (err) {
      console.error('Update failed:', err.response || err)
      setAlertMessage(`Failed to update "${editableUser.full_name}" (${editableUser.email}).`)
      setAlertColor('danger')
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 3000)
    }
  }

  const handleEdit = (user) => {
    setEditableUser({ ...user })
    setEditingUser(true)
  }

  const handleDelete = (user) => {
    setDeletingUser(user)
  }

  const handleConfirmDelete = async () => {
    try {
      await deleteUserByEmailApi(deletingUser.email)
      setAlertMessage(`User "${deletingUser.full_name}" (${deletingUser.email}) deleted successfully!`)
      setAlertColor('success')
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 3000)
      setDeletingUser(null)
      fetchUsers()
    } catch (err) {
      console.error('Delete failed:', err)
      setAlertMessage(`Failed to delete "${deletingUser.full_name}" (${deletingUser.email}).`)
      setAlertColor('danger')
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 3000)
    }
  }

  const handleCancelDelete = () => setDeletingUser(null)
  const handleCancelEdit = () => setEditingUser(false)

  useEffect(() => {
    const query = searchQuery.toLowerCase()
    const filtered = users.filter(
      user =>
        user.full_name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        (user.company && user.company.toLowerCase().includes(query))
    )
    setFilteredUsers(filtered)
  }, [searchQuery, users])

  return (
    <>
      {/* ✅ Alert in bottom-left corner */}
      {showAlert && (
  <div
    style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 99999,
      width: 'fit-content',
      transition: 'all 0.3s ease-in-out'
    }}
  >

          <CAlert
            color={alertColor}
            style={{
              fontFamily: 'Montserrat',
              fontWeight: 500,
              padding: '0.75rem 1.5rem',
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
            }}
          >
            {alertMessage}
          </CAlert>
        </div>
      )}

    
      

      {/* === Users Table === */}




      
{/* === Users Table Container === */}
<CCard
  className="p-4"
  style={{
    borderRadius: '1rem',
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
    backgroundColor: '#ffffff',
  }}
>

      {/* === Search Bar === */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '2px',
            padding: '0.6rem 1rem',
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
            width: '100%',
            maxWidth: '600px',
          }}
        >
          <CIcon icon={cilPencil} style={{ color: '#326396ff', fontSize: '1.2rem', marginRight: '10px' }} />
          <input
            type="text"
            placeholder="Search by name, email or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              border: 'none',
              outline: 'none',
              boxShadow: 'none',
              fontSize: '1rem',
              color: '#374151',
              flex: 1,
            }}
          />
        </div>
      </div>
  <CTable
    responsive
    className="align-middle"
    style={{
      borderCollapse: 'separate',
      borderSpacing: '0 0.5rem',
      fontFamily: 'Montserrat',
    }}
  >
    <CTableHead>
      <CTableRow>
        <CTableHeaderCell style={headerStyle}>Name</CTableHeaderCell>
        <CTableHeaderCell style={headerStyle}>Email</CTableHeaderCell>
        <CTableHeaderCell style={headerStyle}>Role</CTableHeaderCell>
        <CTableHeaderCell style={headerStyle}>Date Created</CTableHeaderCell>
        <CTableHeaderCell style={{ ...headerStyle, textAlign: 'center' }}>
          Actions
        </CTableHeaderCell>
      </CTableRow>
    </CTableHead>

    <CTableBody>
      {filtered.length > 0 ? (
        filtered.map((user) => (
          <CTableRow
            key={user.email}
            style={{
              backgroundColor: '#ffffff',
              boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
              borderRadius: '1rem',
              fontSize: '0.95rem',
              border: 'none',
            }}
          >
           <CTableDataCell
  style={{
    padding: '1rem',
    border: 'none',
    fontWeight: 500,
    color: '#2c3e50',
  }}
>
  {user.full_name}
  {user.company && (
    <span style={{ color: '#717b84ff', fontSize: '0.9rem', marginLeft: '6px' }}>
      ({user.company})
    </span>
  )}
</CTableDataCell>

            <CTableDataCell
              style={{
                padding: '1rem',
                border: 'none',
                fontWeight: 400,
                color: '#2c3e50',
              }}
            >
              {user.email}
            </CTableDataCell>

            <CTableDataCell
              style={{ padding: '1rem', border: 'none' }}
            >
              {user.role}
            </CTableDataCell>

            <CTableDataCell
              style={{ padding: '1rem', color: '#6c757d', border: 'none' }}
            >
              {user.date}
            </CTableDataCell>

            <CTableDataCell
              style={{ padding: '1rem', textAlign: 'center', border: 'none' }}
            >
              <div className="d-flex justify-content-center gap-3">
                <CIcon
                  icon={cilPencil}
                  style={{
                    color: '#185883ff',
                    cursor: 'pointer',
                    fontSize: '1.7rem',
                  }}
                  onClick={() => handleEdit(user)}
                />
                <CIcon
                  icon={cilTrash}
                  style={{
                    color: '#bc200fff',
                    cursor: 'pointer',
                    fontSize: '1.7rem',
                  }}
                  onClick={() => handleDelete(user)}
                />
              </div>
            </CTableDataCell>
          </CTableRow>
        ))
      ) : (
        <CTableRow>
          <CTableDataCell colSpan={5} className="text-center py-4">
            <span style={{ color: '#6c757d', fontSize: '1rem' }}>
              No users found.
            </span>
          </CTableDataCell>
        </CTableRow>
      )}
    </CTableBody>
  </CTable>
</CCard>



      {/* === Edit/Delete Modals === */}
      {(editingUser || deletingUser) && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
          }}
        >
          {editingUser && (
            <CCard className="p-4 text-center" style={{ width: '500px', borderRadius: '0.25rem', fontFamily: 'Montserrat' }}>
              <h4 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Update Details</h4>
              <p style={{ color: '#6c757d', marginBottom: '1.5rem' }}>{editableUser.email}</p>

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

              {editableUser.role === 'Client' && (
                <CFormInput
                  type="text"
                  placeholder="Company"
                  value={editableUser.company || ''}
                  onChange={(e) => setEditableUser({ ...editableUser, company: e.target.value })}
                />
              )}

              <div className="d-flex justify-content-center gap-3 mt-3">
                <CButton
  color="success"
  onClick={handleSave}
  size="lg"
  style={{
    borderRadius: '2px', // makes it more square
    padding: '10px 80px',
    fontWeight: '200',
    color: 'white', // white text
  }}
>
  Update
</CButton>

              </div>
            </CCard>
          )}

          {deletingUser && (
            <CCard className="p-4 text-center" style={{ width: '450px', fontFamily: 'Montserrat' }}>
              <h5 style={{ fontWeight: 600, marginBottom: '1rem' }}>Confirm Delete</h5>
              <p style={{ color: '#6c757d', marginBottom: '2rem' }}>
                Are you sure you want to delete <strong>{deletingUser.full_name}</strong> ({deletingUser.email})?
              </p>
              <div className="d-flex justify-content-center gap-3 mt-3">
  <CButton
    color="secondary"
    onClick={handleCancelDelete}
    size="sm"
    style={{
      borderRadius: 0,
      padding: '10px 30px',
      fontSize: '0.9rem',
      fontWeight: 500,
    }}
  >
    Cancel
  </CButton>

  <CButton
    onClick={handleConfirmDelete}
    size="sm"
    style={{
      backgroundColor: '#d62828',
      border: 'none',
      color: 'white',
      borderRadius: 0,
      padding: '10px 30px',
      fontSize: '0.9rem',
      fontWeight: 500,
    }}
  >
    Delete
  </CButton>
</div>

            </CCard>
          )}
        </div>
      )}
    </>
  )
}

export default DisplayUsersTable
