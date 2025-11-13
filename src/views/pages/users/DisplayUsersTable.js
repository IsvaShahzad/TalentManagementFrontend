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
  padding: '1rem 1.5rem',
  fontWeight: 600,
  color: '#111827',
  fontFamily: 'Inter, sans-serif',
};

const DisplayUsersTable = () => {
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [editingUser, setEditingUser] = useState(false)
  const [editableUser, setEditableUser] = useState({})
  const [userToDelete, setUserToDelete] = useState(null)
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [alertColor, setAlertColor] = useState('success')
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch all users
// Fetch all users
const fetchUsers = async () => {
  console.log("📥 Fetching users from API...");
  try {
    const response = await getAllUsersApi();
    if (response && response.users) {
      const formattedUsers = response.users.map(u => ({
        email: u.email,
        full_name: u.full_name,
        role: u.role,
        date: new Date(u.createdAt).toLocaleString(),
        company: u.Client?.company || '-',
      }));
      setUsers(formattedUsers);
      setFilteredUsers(formattedUsers);
      console.log("✅ Users updated on screen:", formattedUsers.length);
    }
  } catch (err) {
    console.error('❌ Failed to fetch users:', err);
  }
};





// Runs every time refreshTrigger changes
useEffect(() => {
  fetchUsers();
}, [refreshTrigger]);




// 🧠 Step 1: Listen for global "userAdded" events to refresh instantly
useEffect(() => {
  const handleUserAdded = () => {
    console.log("🔄 Detected new user added — refreshing users list");
    fetchUsers(); // this will call your backend again to get updated users
  };

  window.addEventListener("userAdded", handleUserAdded);

  return () => {
    window.removeEventListener("userAdded", handleUserAdded);
  };
}, []);



  // Search filter
  useEffect(() => {
    const query = searchQuery.toLowerCase()
    const filtered = users.filter(
      u =>
        u.full_name.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query) ||
        (u.company && u.company.toLowerCase().includes(query))
    )
    setFilteredUsers(filtered)
  }, [searchQuery, users])

  // === Edit Functions ===
  const handleEdit = (user) => {
    setEditableUser({ ...user })
    setEditingUser(true)
  }

  const handleSaveEdit = async () => {
    try {
      // Call API to update
      await updateUserApi(editableUser.email, {
        full_name: editableUser.full_name,
        role: editableUser.role,
        company: editableUser.company,
      })

      // Update state instantly
      setUsers(prev => prev.map(u => u.email === editableUser.email ? { ...editableUser } : u))
      setFilteredUsers(prev => prev.map(u => u.email === editableUser.email ? { ...editableUser } : u))

      setAlertMessage(`User "${editableUser.full_name}" updated successfully!`)
      setAlertColor('success')
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 3000)
      setRefreshTrigger(prev => prev + 1); // ✅ Force reload from API

      setEditingUser(false)
    } catch (err) {
      console.error(err)
      setAlertMessage(`Failed to update "${editableUser.full_name}"`)
      setAlertColor('danger')
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 3000)
    }
  }

  const handleCancelEdit = () => setEditingUser(false)

  // === Delete Functions ===
  const handleDeleteClick = (user) => setUserToDelete(user)

const handleDeleteUser = async () => {
  if (!userToDelete) return;

  try {
    // Call your API which handles deletion (including deleting Client first)
    await deleteUserByEmailApi(userToDelete.email);

    setAlertMessage(`User "${userToDelete.full_name}" deleted successfully!`);
    setAlertColor('success');
    setShowAlert(true);
    setUserToDelete(null);

    // Refresh users list
    fetchUsers();

    setTimeout(() => setShowAlert(false), 3000);
  } catch (err) {
    console.error('Delete failed:', err);
    setAlertMessage(`Failed to delete "${userToDelete.full_name}".`);
    setAlertColor('danger');
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  }
};




  const handleCancelDelete = () => setUserToDelete(null)

  // === Render ===
  return (
    <>
      {/* Floating Alert */}
      {showAlert && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 99999,
          transition: 'all 0.3s ease-in-out'
        }}>
          <CAlert color={alertColor} style={{ boxShadow: '0 2px 6px rgba(0,0,0,0.2)', padding: '0.8rem 1.5rem', fontFamily: 'Inter, sans-serif', }}>
            {alertMessage}
          </CAlert>
        </div>
      )}

      {/* Table Container */}
      <CCard className="p-4" style={{ borderRadius: '1rem', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', backgroundColor: '#ffffff' }}>
        {/* Search */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem', fontFamily: 'Inter, sans-serif' }}>
          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '0.6rem 1rem', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', width: '100%', maxWidth: '600px' }}>
            <CIcon icon={cilSearch} style={{ color: '#326396ff', fontSize: '1.2rem', marginRight: '10px' }} />
            <input
              type="text"
              placeholder="Search by name, email or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ border: 'none', outline: 'none', flex: 1, fontSize: '1rem', color: '#374151' }}
            />
          </div>
        </div>

        {/* Table */}
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
            {filteredUsers.length > 0 ? filteredUsers.map(user => (
              <CTableRow key={user.email}
                style={{
                  backgroundColor: '#fff',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.07)',
                  borderRadius: '0.8rem',
                  transform: 'translateY(0)',
                  transition: 'all 0.2s ease, background-color 0.2s ease',
                  fontFamily: 'Inter, sans-serif',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.backgroundColor = '#e0f2ff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.backgroundColor = '#fff';
                }}
              >
                <CTableDataCell style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>
                  {user.full_name}{user.company && (<span style={{ color: '#6b7280', fontSize: '0.9rem', marginLeft: '5px' }}>({user.company})</span>)}
                </CTableDataCell>
                <CTableDataCell style={{ padding: '1rem 1.5rem' }}>{user.email}</CTableDataCell>
                <CTableDataCell style={{ padding: '1rem 1.5rem' }}>{user.role}</CTableDataCell>
                <CTableDataCell style={{ padding: '1rem 1.5rem' }}>{user.date}</CTableDataCell>
                <CTableDataCell style={{ textAlign: 'center', padding: '1rem 1.5rem' }}>
                  <div className="d-flex justify-content-center gap-3">
                    <CIcon icon={cilPencil} style={{ color: '#185883ff', cursor: 'pointer', fontSize: '1.6rem' }} onClick={() => handleEdit(user)} />
                    <CIcon icon={cilTrash} style={{ color: '#bc200fff', cursor: 'pointer', fontSize: '1.6rem' }} onClick={() => handleDeleteClick(user)} />
                  </div>
                </CTableDataCell>
              </CTableRow>
            )) : (
              <CTableRow>
                <CTableDataCell colSpan={5} className="text-center py-4" style={{ color: '#6b7280' }}>No users found.</CTableDataCell>
              </CTableRow>
            )}
          </CTableBody>
        </CTable>
      </CCard>

      {/* Edit & Delete Modals */}
      {(editingUser || userToDelete) && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
          {editingUser && (
            <CCard className="p-4 text-center" style={{ width: '500px', borderRadius: '0.5rem' }}>
              <h4>Update Details</h4>
              <p style={{ color: '#6b7280' }}>{editableUser.email}</p>

              <div className="text-start mb-3">
                <label>Name</label>
                <CFormInput value={editableUser.full_name} onChange={(e) => setEditableUser({ ...editableUser, full_name: e.target.value })} />
              </div>

              <div className="text-start mb-4">
                <label>Role</label>
                <CFormSelect value={editableUser.role} onChange={(e) => setEditableUser({ ...editableUser, role: e.target.value })}>
                  <option value="Recruiter">Recruiter</option>
                  <option value="Admin">Admin</option>
                  <option value="Client">Client</option>
                </CFormSelect>
              </div>

              {editableUser.role === 'Client' && (
                <CFormInput type="text" placeholder="Company" value={editableUser.company || ''} onChange={(e) => setEditableUser({ ...editableUser, company: e.target.value })} />
              )}

              <div className="d-flex justify-content-center gap-3 mt-3">
                <CButton color="success" onClick={handleSaveEdit} size="lg">Update</CButton>
                <CButton color="secondary" onClick={handleCancelEdit} size="lg">Cancel</CButton>
              </div>
            </CCard>
          )}

          {userToDelete && (
            <CCard className="p-4 text-center" style={{ width: '450px' }}>
              <h5>Confirm Delete</h5>
              <p style={{ color: '#6b7280' }}>Delete <strong>{userToDelete.full_name}</strong> ({userToDelete.email})?</p>
              <div className="d-flex justify-content-center gap-3 mt-3">
                <CButton color="secondary" onClick={handleCancelDelete}>Cancel</CButton>
                <CButton style={{ backgroundColor: '#d62828', border: 'none', color: 'white' }} onClick={handleDeleteUser}>Delete</CButton>
              </div>
            </CCard>
          )}
        </div>
      )}
    </>
  )
}

export default DisplayUsersTable
