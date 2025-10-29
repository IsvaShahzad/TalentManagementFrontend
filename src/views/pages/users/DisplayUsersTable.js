import React, { useEffect, useState } from 'react'
import {
  CTable, CTableHead, CTableRow, CTableHeaderCell,
  CTableBody, CTableDataCell,
  CCard, CButton, CFormSelect, CFormInput, CAlert
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilTrash, cilSearch } from '@coreui/icons'
import {
  getAllUsersApi, updateUserApi, deleteUserByEmailApi
} from '../../../api/api'


  const headerCellStyle = {
  padding: '1rem 1.5rem',  // same as body cells
  fontWeight: 600,
  color: '#111827',
  fontFamily: 'Inter, sans-serif',
};
const DisplayUsersTable = () => {
  const [filtered, setFilteredUsers] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [users, setUsers] = useState([])
  const [editingUser, setEditingUser] = useState(false)
  const [editableUser, setEditableUser] = useState({})
  const [deletingUser, setDeletingUser] = useState(null)
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

  useEffect(() => { fetchUsers() }, [])



  const handleAddUser = async (newUser) => {
  if (!newUser.email || !newUser.full_name) {
    setAlertMessage('Name and Email are required!')
    setAlertColor('danger')
    setShowAlert(true)
    setTimeout(() => setShowAlert(false), 3000)
    return
  }

  // Check if email already exists in the current users list
  const exists = users.some(user => user.email.toLowerCase() === newUser.email.toLowerCase())
  if (exists) {
    setAlertMessage(`User with email "${newUser.email}" already exists!`)
    setAlertColor('danger')
    setShowAlert(true)
    setTimeout(() => setShowAlert(false), 3000)
    return
  }

  try {
    // Call your API to add user
    await addUserApi(newUser) // <-- implement this API
    setAlertMessage(`User "${newUser.full_name}" added successfully!`)
    setAlertColor('success')
    setShowAlert(true)
    setTimeout(() => setShowAlert(false), 3000)

    // Refresh table
    await fetchUsers()
  } catch (err) {
    console.error(err)
    setAlertMessage('Failed to add user!')
    setAlertColor('danger')
    setShowAlert(true)
    setTimeout(() => setShowAlert(false), 3000)
  }
}


const handleSaveByEmail = async () => {
  try {
    // Send update request
    const res = await updateCandidateByEmailApi(editableCandidate.email, {
      firstName: editableCandidate.firstName,
      lastName: editableCandidate.lastName,
      phone: editableCandidate.phone,
      experience_years: editableCandidate.experience,
      position_applied: editableCandidate.position,
    });

    // Always show success alert
    showCAlert('Candidate updated successfully', 'success');

    // Refresh candidate list
    refreshCandidates();

    // Close edit modal
    setEditingCandidate(false);

    console.log("Update response:", res); // optional: debug
  } catch (err) {
    console.error("Update failed:", err);
    // Only show failure if API actually throws error
    showCAlert('Failed to update candidate', 'danger');
  }
};



  const handleEdit = (user) => {
    setEditableUser({ ...user })
    setEditingUser(true)
  }

  const handleDelete = (user) => setDeletingUser(user)

const handleConfirmDelete = async () => {
  if (!deletingUser) return;

  try {
    // Delete user
    await deleteUserByEmailApi(deletingUser.email);

    // Show success alert
    setAlertMessage(`User "${deletingUser.full_name}" (${deletingUser.email}) deleted successfully!`);
    setAlertColor('success');
    setShowAlert(true);

    // Close delete modal
    setDeletingUser(null);

    // Refresh table
    await fetchUsers();

    // Hide alert after 3 seconds
    setTimeout(() => setShowAlert(false), 3000);
  } catch (err) {
    console.error(err);

    setAlertMessage(`Failed to delete "${deletingUser.full_name}".`);
    setAlertColor('danger');
    setShowAlert(true);

    setTimeout(() => setShowAlert(false), 3000);
  }
};






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
      {/* ✅ Floating Alert */}
      {showAlert && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 99999,
            transition: 'all 0.3s ease-in-out'
          }}
        >
          <CAlert color={alertColor} style={{ boxShadow: '0 2px 6px rgba(0,0,0,0.2)', padding: '0.8rem 1.5rem', fontFamily: 'Inter, sans-serif', }}>
            {alertMessage}
          </CAlert>
        </div>
      )}

      {/* === Table Container === */}
      <CCard
        className="p-4"
        style={{
          borderRadius: '1rem',
          boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
          backgroundColor: '#ffffff',
        }}
      >
        {/* === Search Bar === */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem', fontFamily: 'Inter, sans-serif', }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              border: '1px solid #e2e8f0',
              borderRadius: '0.5rem',
              padding: '0.6rem 1rem',
              boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
              width: '100%',
              maxWidth: '600px',
            }}
          >
            <CIcon icon={cilSearch} style={{ color: '#326396ff', fontSize: '1.2rem', marginRight: '10px' }} />
            <input
              type="text"
              placeholder="Search by name, email or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                flex: 1,
                fontSize: '1rem',
                color: '#374151',
              }}
            />
          </div>
        </div>

        {/* === Table (Card-style Rows) === */}
        <CTable responsive className="align-middle" style={{ borderCollapse: 'separate', borderSpacing: '0 1rem' }}>
       

<CTableHead>
  <CTableRow>
    <CTableHeaderCell style={headerCellStyle}>Name</CTableHeaderCell>
    <CTableHeaderCell style={headerCellStyle}>Email</CTableHeaderCell>
    <CTableHeaderCell style={headerCellStyle}>Role</CTableHeaderCell>
    <CTableHeaderCell style={headerCellStyle}>Date Created</CTableHeaderCell>
    <CTableHeaderCell style={headerCellStyle}>Actions</CTableHeaderCell>
  </CTableRow>
</CTableHead>


          <CTableBody>
            {filtered.length > 0 ? (
              filtered.map((user) => (
                <CTableRow
                  key={user.email}
                    style={{
    backgroundColor: '#fff',  // default color
    boxShadow: '0 2px 10px rgba(0,0,0,0.07)',
    borderRadius: '0.8rem',
    transform: 'translateY(0)',
    transition: 'all 0.2s ease, background-color 0.2s ease', // smooth color + elevation
    fontFamily: 'Inter, sans-serif',
    cursor: 'pointer',
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = 'translateY(-3px)';
    e.currentTarget.style.backgroundColor = '#e0f2ff'; // entire tile highlight color
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.backgroundColor = '#fff'; // revert to default
  }}
>
                  <CTableDataCell style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>
                    {user.full_name}
                    {user.company && (
                      <span style={{ color: '#6b7280', fontSize: '0.9rem', marginLeft: '5px', fontFamily: 'Inter, sans-serif', }}>
                        ({user.company})
                      </span>
                    )}
                  </CTableDataCell>
                  <CTableDataCell style={{ padding: '1rem 1.5rem', color: '#374151', fontFamily: 'Inter, sans-serif', }}>{user.email}</CTableDataCell>
                  <CTableDataCell style={{ padding: '1rem 1.5rem', color: '#1f2937', fontFamily: 'Inter, sans-serif', }}>{user.role}</CTableDataCell>
                  <CTableDataCell style={{ padding: '1rem 1.5rem', color: '#6b7280', fontFamily: 'Inter, sans-serif', }}>{user.date}</CTableDataCell>
                  <CTableDataCell style={{ textAlign: 'center', padding: '1rem 1.5rem' }}>
                    <div className="d-flex justify-content-center gap-3">
                      <CIcon icon={cilPencil} style={{ color: '#185883ff', cursor: 'pointer', fontSize: '1.6rem' }} onClick={() => handleEdit(user)} />
                      <CIcon icon={cilTrash} style={{ color: '#bc200fff', cursor: 'pointer', fontSize: '1.6rem' }} onClick={() => handleDelete(user)} />
                    </div>
                  </CTableDataCell>
                </CTableRow>
              ))
            ) : (
              <CTableRow>
                <CTableDataCell colSpan={5} className="text-center py-4" style={{ color: '#6b7280', fontFamily: 'Inter, sans-serif', }}>
                  No users found.
                </CTableDataCell>
              </CTableRow>
            )}
          </CTableBody>
        </CTable>
      </CCard>

      {/* === Edit & Delete Modals === */}
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
            <CCard className="p-4 text-center" style={{ width: '500px', borderRadius: '0.5rem', fontFamily: 'Inter, sans-serif', }}>
              <h4>Update Details</h4>
              <p style={{ color: '#6b7280' }}>{editableUser.email}</p>

              <div className="text-start mb-3">
                <label style={{ fontWeight: 500 }}>Name</label>
                <CFormInput
                  value={editableUser.full_name}
                  onChange={(e) => setEditableUser({ ...editableUser, full_name: e.target.value })}
                />
              </div>

              <div className="text-start mb-4">
                <label style={{ fontWeight: 500, fontFamily: 'Inter, sans-serif', }}>Role</label>
                <CFormSelect
                  value={editableUser.role}
                  onChange={(e) => setEditableUser({ ...editableUser, role: e.target.value })}
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
                  onClick={handleSaveByEmail}
                  size="lg"
                  style={{ borderRadius: '2px', padding: '10px 80px', fontWeight: '300', fontFamily: 'Inter, sans-serif',color: 'white' }}
                >
                  Update
                </CButton>
              </div>
            </CCard>
          )}

          {deletingUser && (
            <CCard className="p-4 text-center" style={{ width: '450px', fontFamily: 'Inter, sans-serif', }}>
              <h5>Confirm Delete</h5>
              <p style={{ color: '#6b7280', fontFamily: 'Inter, sans-serif', }}>
                Delete <strong>{deletingUser.full_name}</strong> ({deletingUser.email})?
              </p>
              <div className="d-flex justify-content-center gap-3 mt-3">
                <CButton color="secondary" onClick={handleCancelDelete} style={{ borderRadius: 0, padding: '10px 30px', fontFamily: 'Inter, sans-serif', }}>
                  Cancel
                </CButton>
                <CButton
                  onClick={handleConfirmDelete}
                  style={{ backgroundColor: '#d62828', border: 'none', color: 'white', borderRadius: 0, padding: '10px 30px', fontFamily: 'Inter, sans-serif', }}
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
