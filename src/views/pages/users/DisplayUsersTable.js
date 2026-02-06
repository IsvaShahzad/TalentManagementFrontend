import React, { useEffect, useState } from 'react'
import { CContainer, CFormInput, CFormSelect, CButton, CAlert, CCard, CCardBody, CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilTrash, cilPencil, cilSearch } from '@coreui/icons'
import { getAllUsersApi, updateUserApi, deleteUserByEmailApi } from '../../../api/api'

const DisplayUsersTable = () => {
  const [users, setUsers] = useState([])
  const [filter, setFilter] = useState('')
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [alertColor, setAlertColor] = useState('success')
  const [editingUser, setEditingUser] = useState(null)
  const [deletingUser, setDeletingUser] = useState(null)
  const [editableUser, setEditableUser] = useState({})
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const fetchUsers = async () => {
    try {
      const response = await getAllUsersApi()
      const usersArray = response.users || response.data || []
      const formatted = usersArray.map(u => ({
        name: u.full_name,
        email: u.email,
        role: u.role,
        company: u.Client?.company || '',
        date: new Date(u.createdAt).toISOString(),
      }))
      setUsers(formatted)
    } catch (err) {
      console.error('Failed to fetch users:', err)
      setUsers([])
    }
  }

useEffect(() => {
  fetchUsers() // initial fetch

  const handleUserAdded = () => {
    fetchUsers()
  }

  window.addEventListener('userAdded', handleUserAdded)
  return () => window.removeEventListener('userAdded', handleUserAdded)
}, [])

  const handleEditClick = (user) => {
    setEditingUser(user)
    setEditableUser({ ...user })
  }

  const handleDeleteClick = (user) => {
    setDeletingUser(user)
  }

  const handleCancel = () => {
    setEditingUser(null)
    setDeletingUser(null)
    setEditableUser({})
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const payload = {
        full_name: editableUser.name,
        role: editableUser.role,
        email: editableUser.email,
        company: editableUser.role === 'Client' ? editableUser.company : ''
      }
      await updateUserApi(editableUser.email, payload)

      setUsers(prev => prev.map(u => u.email === editableUser.email ? editableUser : u))

      setAlertMessage(`User "${editableUser.email}" updated successfully`)
      setAlertColor('success')
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 3000)
      handleCancel()
    } catch (err) {
      console.error('Update failed:', err)
      setAlertMessage('Failed to update user.')
      setAlertColor('danger')
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 3000)
    } finally {
      setSaving(false)
    }
  }

  const handleConfirmDelete = async () => {
    try {
      setDeleting(true)
      await deleteUserByEmailApi(deletingUser.email)
      setUsers(prev => prev.filter(u => u.email !== deletingUser.email))
      setAlertMessage(`User "${deletingUser.email}" deleted successfully`)
      setAlertColor('success')
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 3000)
      handleCancel()
    } catch (err) {
      console.error('Delete failed:', err)
      setAlertMessage('Failed to delete user.')
      setAlertColor('danger')
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 3000)
    } finally {
      setDeleting(false)
    }
  }

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(filter.toLowerCase()) ||
    u.email.toLowerCase().includes(filter.toLowerCase()) ||
    u.company.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <CContainer style={{ fontFamily: 'Inter, sans-serif', marginTop: '2rem', padding: '0 1rem', fontSize: '0.85rem' }}>

      {showAlert && (
        <CAlert color={alertColor} className="toast-alert text-center" style={{ fontSize: '0.85rem' }}>
          {alertMessage}
        </CAlert>
      )}

      {/* Table Container */}
      <CCard>
        <CCardBody style={{ padding: '1rem' }}>
          {/* Search bar inside container - centered and smaller */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <div style={{ position: 'relative', width: '300px' }}>
              <CFormInput
                placeholder="Search user by email, name or company"
                value={filter}
                onChange={e => setFilter(e.target.value)}
                style={{ paddingLeft: '2rem', fontSize: '0.8rem', padding: '0.4rem 0.75rem 0.4rem 2rem' }}
              />
              <CIcon
                icon={cilSearch}
                style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280', fontSize: '14px' }}
              />
            </div>
          </div>

          {/* Table with borders */}
          <div style={{ overflowX: 'auto' }}>
            <CTable hover responsive style={{ marginBottom: 0, fontSize: '0.85rem', border: '1px solid #d1d5db', borderCollapse: 'collapse' }}>
              <CTableHead color="light" style={{ borderBottom: '2px solid #d1d5db' }}>
                <CTableRow>
                  <CTableHeaderCell style={{ border: '1px solid #d1d5db', padding: '0.75rem' }}>Name</CTableHeaderCell>
                  <CTableHeaderCell style={{ border: '1px solid #d1d5db', padding: '0.75rem' }}>Email</CTableHeaderCell>
                  <CTableHeaderCell style={{ border: '1px solid #d1d5db', padding: '0.75rem' }}>Role</CTableHeaderCell>
                  <CTableHeaderCell style={{ border: '1px solid #d1d5db', padding: '0.75rem' }}>Created At</CTableHeaderCell>
                  <CTableHeaderCell style={{ border: '1px solid #d1d5db', padding: '0.75rem', textAlign: 'center' }}>Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {filteredUsers.length === 0 ? (
                  <CTableRow>
                    <CTableDataCell colSpan={5} className="text-center text-muted py-4" style={{ border: '1px solid #d1d5db' }}>
                      No users found.
                    </CTableDataCell>
                  </CTableRow>
                ) : filteredUsers.map((u, index) => {
                  const dateObj = new Date(u.date)
                  const date = dateObj.toLocaleDateString()
                  const time = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

                  return (
                    <CTableRow key={index}>
                      <CTableDataCell style={{ border: '1px solid #d1d5db', padding: '0.75rem', fontWeight: 500, color: '#0F172A' }}>
                        {u.name} {u.role === 'Client' && u.company ? <span style={{ color: '#9CA3AF', fontWeight: 400 }}>({u.company})</span> : ''}
                      </CTableDataCell>
                      <CTableDataCell style={{ border: '1px solid #d1d5db', padding: '0.75rem', color: '#374151' }}>{u.email}</CTableDataCell>
                      <CTableDataCell style={{ border: '1px solid #d1d5db', padding: '0.75rem' }}>{u.role}</CTableDataCell>
                      <CTableDataCell style={{ border: '1px solid #d1d5db', padding: '0.75rem', color: '#4B5563' }}>{`${date} ${time}`}</CTableDataCell>
                      <CTableDataCell style={{ border: '1px solid #d1d5db', padding: '0.75rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                          <CIcon icon={cilPencil} style={{ color: '#185883ff', cursor: 'pointer', fontSize: '1rem' }} onClick={() => handleEditClick(u)} />
                          <CIcon icon={cilTrash} style={{ color: '#bc200fff', cursor: 'pointer', fontSize: '1rem' }} onClick={() => handleDeleteClick(u)} />
                        </div>
                      </CTableDataCell>
                    </CTableRow>
                  )
                })}
              </CTableBody>
            </CTable>
          </div>
        </CCardBody>
      </CCard>

      {/* Modals */}
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
          onClick={handleCancel}
        >
          {editingUser && (
            <CCard
              className="p-4 text-center"
              style={{
                width: '90%',
                maxWidth: '500px',
                borderRadius: '0.25rem',
                fontFamily: 'Inter, sans-serif',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                margin: '1rem',
                fontSize: '0.85rem',
                position: 'relative',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={handleCancel}
                aria-label="Close"
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '10px',
                  border: 'none',
                  background: 'transparent',
                  fontSize: '1.25rem',
                  cursor: 'pointer',
                  lineHeight: 1,
                }}
              >
                &times;
              </button>
              <h4 style={{ fontWeight: 600, fontSize: '1.2rem', marginBottom: '0.5rem' }}>Update Details</h4>
              <p style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: '1rem' }}>{editableUser.email}</p>

              <div className="text-start mb-3">
                <label style={{ fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.25rem', display: 'block' }}>Name</label>
                <CFormInput value={editableUser.name} onChange={e => setEditableUser({ ...editableUser, name: e.target.value })} style={{ width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.85rem', borderRadius: '0.25rem', border: '1px solid #d3d3d3' }} />
              </div>

              <div className="text-start mb-3">
                <label style={{ fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.25rem', display: 'block' }}>Role</label>
                <CFormSelect value={editableUser.role} onChange={e => setEditableUser({ ...editableUser, role: e.target.value })} style={{ width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.85rem', borderRadius: '0.25rem', border: '1px solid #d3d3d3' }}>
                  <option value="Recruiter">Recruiter</option>
                  <option value="Admin">Admin</option>
                  <option value="Client">Client</option>
                </CFormSelect>
              </div>

              {/* Company only for Clients */}
              {editableUser.role === 'Client' && (
                <div className="text-start mb-3">
                  <label style={{ fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.25rem', display: 'block' }}>Company</label>
                  <CFormInput
                    value={editableUser.company || ''}
                    onChange={e => setEditableUser({ ...editableUser, company: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.85rem', borderRadius: '0.25rem', border: '1px solid #d3d3d3' }}
                  />
                </div>
              )}

              <div className="d-flex justify-content-center mt-3">
                <CButton
                  color="success"
                  onClick={handleSave}
                  size="lg"
                  disabled={saving}
                  style={{
                    borderRadius: '0.25rem',
                    padding: '0.75rem 2rem',
                    fontSize: '0.95rem',
                    color: 'white',
                    opacity: saving ? 0.8 : 1,
                  }}
                >
                  {saving ? 'Updating...' : 'Update'}
                </CButton>
              </div>
            </CCard>
          )}

          {deletingUser && (
            <CCard
              className="p-4 text-center"
              style={{
                width: '90%',
                maxWidth: '450px',
                borderRadius: '0.25rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                fontFamily: 'Inter, sans-serif',
                margin: '1rem',
                fontSize: '0.85rem',
                position: 'relative',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={handleCancel}
                aria-label="Close"
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '10px',
                  border: 'none',
                  background: 'transparent',
                  fontSize: '1.25rem',
                  cursor: 'pointer',
                  lineHeight: 1,
                }}
              >
                &times;
              </button>
              <h5 style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '1rem' }}>Confirm Delete</h5>
              <p style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: '1.5rem' }}>
                Are you sure you want to delete <strong>{deletingUser.email}</strong>?
              </p>
              <div className="d-flex justify-content-center gap-3 mt-3 flex-wrap">
                <CButton color="secondary" onClick={handleCancel} size="lg" style={{ borderRadius: '0.25rem', padding: '0.5rem 1.2rem', fontSize: '0.85rem', backgroundColor: '#6c757d', border: 'none' }}>Cancel</CButton>
                <CButton
                  onClick={handleConfirmDelete}
                  size="lg"
                  disabled={deleting}
                  style={{
                    borderRadius: '0.25rem',
                    padding: '0.5rem 1.2rem',
                    fontSize: '0.85rem',
                    backgroundColor: deleting ? '#b71c1c' : '#d62828',
                    border: 'none',
                    color: 'white',
                    opacity: deleting ? 0.9 : 1,
                  }}
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </CButton>
              </div>
            </CCard>
          )}
        </div>
      )}
    </CContainer>
  )
}

export default DisplayUsersTable






// import React, { useEffect, useState } from 'react'
// import {
//   CTable, CTableHead, CTableRow, CTableHeaderCell,
//   CTableBody, CTableDataCell,
//   CCard, CButton, CFormSelect, CFormInput, CAlert
// } from '@coreui/react'
// import CIcon from '@coreui/icons-react'
// import { cilPencil, cilTrash, cilSearch } from '@coreui/icons'
// import {
//   getAllUsersApi, updateUserApi, deleteUserByEmailApi
// } from '../../../api/api'

// const headerCellStyle = {
//   padding: '1rem 1.5rem',
//   fontWeight: 600,
//   color: '#111827',
//   fontFamily: 'Inter, sans-serif',
// };

// const DisplayUsersTable = () => {
//   const [users, setUsers] = useState([])
//   const [filteredUsers, setFilteredUsers] = useState([])
//   const [searchQuery, setSearchQuery] = useState('')
//   const [editingUser, setEditingUser] = useState(false)
//   const [editableUser, setEditableUser] = useState({})
//   const [userToDelete, setUserToDelete] = useState(null)
//   const [showAlert, setShowAlert] = useState(false)
//   const [alertMessage, setAlertMessage] = useState('')
//   const [alertColor, setAlertColor] = useState('success')
//   const [refreshTrigger, setRefreshTrigger] = useState(0);

//   // Fetch all users
// // Fetch all users
// const fetchUsers = async () => {
//   console.log("📥 Fetching users from API...");
//   try {
//     const response = await getAllUsersApi();
//     if (response && response.users) {
//       const formattedUsers = response.users.map(u => ({
//         email: u.email,
//         full_name: u.full_name,
//         role: u.role,
//         date: new Date(u.createdAt).toLocaleString(),
//         company: u.Client?.company || '-',
//       }));
//       setUsers(formattedUsers);
//       setFilteredUsers(formattedUsers);
//       console.log("✅ Users updated on screen:", formattedUsers.length);
//     }
//   } catch (err) {
//     console.error('❌ Failed to fetch users:', err);
//   }
// };





// // Runs every time refreshTrigger changes
// useEffect(() => {
//   fetchUsers();
// }, [refreshTrigger]);




// // 🧠 Step 1: Listen for global "userAdded" events to refresh instantly
// useEffect(() => {
//   const handleUserAdded = () => {
//     console.log("🔄 Detected new user added — refreshing users list");
//     fetchUsers(); // this will call your backend again to get updated users
//   };

//   window.addEventListener("userAdded", handleUserAdded);

//   return () => {
//     window.removeEventListener("userAdded", handleUserAdded);
//   };
// }, []);



//   // Search filter
//   useEffect(() => {
//     const query = searchQuery.toLowerCase()
//     const filtered = users.filter(
//       u =>
//         u.full_name.toLowerCase().includes(query) ||
//         u.email.toLowerCase().includes(query) ||
//         (u.company && u.company.toLowerCase().includes(query))
//     )
//     setFilteredUsers(filtered)
//   }, [searchQuery, users])

//   // === Edit Functions ===
//   const handleEdit = (user) => {
//     setEditableUser({ ...user })
//     setEditingUser(true)
//   }

//   const handleSaveEdit = async () => {
//     try {
//       // Call API to update
//       await updateUserApi(editableUser.email, {
//         full_name: editableUser.full_name,
//         role: editableUser.role,
//         company: editableUser.company,
//       })

//       // Update state instantly
//       setUsers(prev => prev.map(u => u.email === editableUser.email ? { ...editableUser } : u))
//       setFilteredUsers(prev => prev.map(u => u.email === editableUser.email ? { ...editableUser } : u))

//       setAlertMessage(`User "${editableUser.full_name}" updated successfully!`)
//       setAlertColor('success')
//       setShowAlert(true)
//       setTimeout(() => setShowAlert(false), 3000)
//       setRefreshTrigger(prev => prev + 1); // ✅ Force reload from API

//       setEditingUser(false)
//     } catch (err) {
//       console.error(err)
//       setAlertMessage(`Failed to update "${editableUser.full_name}"`)
//       setAlertColor('danger')
//       setShowAlert(true)
//       setTimeout(() => setShowAlert(false), 3000)
//     }
//   }

//   const handleCancelEdit = () => setEditingUser(false)

//   // === Delete Functions ===
//   const handleDeleteClick = (user) => setUserToDelete(user)

// // const handleDeleteUser = async () => {
// //   if (!userToDelete) return;

// //   try {
// //     // Call your API which handles deletion (including deleting Client first)
// //     await deleteUserByEmailApi(userToDelete.email);

// //     setAlertMessage(`User "${userToDelete.full_name}" deleted successfully!`);
// //     setAlertColor('success');
// //     setShowAlert(true);
// //     setUserToDelete(null);

// //     // Refresh users list
// //     fetchUsers();

// //     setTimeout(() => setShowAlert(false), 3000);
// //   } catch (err) {
// //     console.error('Delete failed:', err);
// //     setAlertMessage(`Failed to delete "${userToDelete.full_name}".`);
// //     setAlertColor('danger');
// //     setShowAlert(true);
// //     setTimeout(() => setShowAlert(false), 3000);
// //   }
// // };


// const handleDeleteUser = async () => {
//   if (!userToDelete) return;

//   try {
//     // Call your API which handles deletion
//     await deleteUserByEmailApi(userToDelete.email);

//     // 1️⃣ Update local state instantly
//     setUsers(prev => prev.filter(u => u.email !== userToDelete.email));
//     setFilteredUsers(prev => prev.filter(u => u.email !== userToDelete.email));

//     // 2️⃣ Show success alert
//     setAlertMessage(`User "${userToDelete.full_name}" deleted successfully!`);
//     setAlertColor('success');
//     setShowAlert(true);

//     // 3️⃣ Clear selected user for deletion
//     setUserToDelete(null);

//     setTimeout(() => setShowAlert(false), 3000);

//     // Optional: Refresh from API in case backend added extra logic
//     // setRefreshTrigger(prev => prev + 1);

//   } catch (err) {
//     console.error('Delete failed:', err);
//     setAlertMessage(`Failed to delete "${userToDelete.full_name}".`);
//     setAlertColor('danger');
//     setShowAlert(true);
//     setTimeout(() => setShowAlert(false), 3000);
//   }
// };


//   const handleCancelDelete = () => setUserToDelete(null)

//   // === Render ===
//   return (
//     <>
//       {/* Floating Alert */}
//       {showAlert && (
//         <div style={{
//           position: 'fixed',
//           top: '20px',
//           right: '20px',
//           zIndex: 99999,
//           transition: 'all 0.3s ease-in-out'
//         }}>
//           <CAlert color={alertColor} style={{ boxShadow: '0 2px 6px rgba(0,0,0,0.2)', padding: '0.8rem 1.5rem', fontFamily: 'Inter, sans-serif', }}>
//             {alertMessage}
//           </CAlert>
//         </div>
//       )}

//       {/* Table Container */}
//       <CCard className="p-4" style={{ borderRadius: '1rem', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', backgroundColor: '#ffffff' }}>
//         {/* Search */}
//         <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem', fontFamily: 'Inter, sans-serif' }}>
//           <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '0.6rem 1rem', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', width: '100%', maxWidth: '600px' }}>
//             <CIcon icon={cilSearch} style={{ color: '#326396ff', fontSize: '1.2rem', marginRight: '10px' }} />
//             <input
//               type="text"
//               placeholder="Search by name, email or company..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               style={{ border: 'none', outline: 'none', flex: 1, fontSize: '1rem', color: '#374151' }}
//             />
//           </div>
//         </div>

//         {/* Table */}
//         <CTable responsive className="align-middle" style={{ borderCollapse: 'separate', borderSpacing: '0 1rem' }}>
//           <CTableHead>
//             <CTableRow>
//               <CTableHeaderCell style={headerCellStyle}>Name</CTableHeaderCell>
//               <CTableHeaderCell style={headerCellStyle}>Email</CTableHeaderCell>
//               <CTableHeaderCell style={headerCellStyle}>Role</CTableHeaderCell>
//               <CTableHeaderCell style={headerCellStyle}>Date Created</CTableHeaderCell>
//               <CTableHeaderCell style={headerCellStyle}>Actions</CTableHeaderCell>
//             </CTableRow>
//           </CTableHead>
//           <CTableBody>
//             {filteredUsers.length > 0 ? filteredUsers.map(user => (
//               <CTableRow key={user.email}
//                 style={{
//                   backgroundColor: '#fff',
//                   boxShadow: '0 2px 10px rgba(0,0,0,0.07)',
//                   borderRadius: '0.8rem',
//                   transform: 'translateY(0)',
//                   transition: 'all 0.2s ease, background-color 0.2s ease',
//                   fontFamily: 'Inter, sans-serif',
//                   cursor: 'pointer',
//                 }}
//                 onMouseEnter={(e) => {
//                   e.currentTarget.style.transform = 'translateY(-3px)';
//                   e.currentTarget.style.backgroundColor = '#e0f2ff';
//                 }}
//                 onMouseLeave={(e) => {
//                   e.currentTarget.style.transform = 'translateY(0)';
//                   e.currentTarget.style.backgroundColor = '#fff';
//                 }}
//               >
//                 <CTableDataCell style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>
//                   {user.full_name}{user.company && (<span style={{ color: '#6b7280', fontSize: '0.9rem', marginLeft: '5px' }}>({user.company})</span>)}
//                 </CTableDataCell>
//                 <CTableDataCell style={{ padding: '1rem 1.5rem' }}>{user.email}</CTableDataCell>
//                 <CTableDataCell style={{ padding: '1rem 1.5rem' }}>{user.role}</CTableDataCell>
//                 <CTableDataCell style={{ padding: '1rem 1.5rem' }}>{user.date}</CTableDataCell>
//                 <CTableDataCell style={{ textAlign: 'center', padding: '1rem 1.5rem' }}>
//                   <div className="d-flex justify-content-center gap-3">
//                     <CIcon icon={cilPencil} style={{ color: '#185883ff', cursor: 'pointer', fontSize: '1.6rem' }} onClick={() => handleEdit(user)} />
//                     <CIcon icon={cilTrash} style={{ color: '#bc200fff', cursor: 'pointer', fontSize: '1.6rem' }} onClick={() => handleDeleteClick(user)} />
//                   </div>
//                 </CTableDataCell>
//               </CTableRow>
//             )) : (
//               <CTableRow>
//                 <CTableDataCell colSpan={5} className="text-center py-4" style={{ color: '#6b7280' }}>No users found.</CTableDataCell>
//               </CTableRow>
//             )}
//           </CTableBody>
//         </CTable>
//       </CCard>

//       {/* Edit & Delete Modals */}
//       {(editingUser || userToDelete) && (
//         <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
//           {editingUser && (
//             <CCard className="p-4 text-center" style={{ width: '500px', borderRadius: '0.5rem' }}>
//               <h4>Update Details</h4>
//               <p style={{ color: '#6b7280' }}>{editableUser.email}</p>

//               <div className="text-start mb-3">
//                 <label>Name</label>
//                 <CFormInput value={editableUser.full_name} onChange={(e) => setEditableUser({ ...editableUser, full_name: e.target.value })} />
//               </div>

//               <div className="text-start mb-4">
//                 <label>Role</label>
//                 <CFormSelect value={editableUser.role} onChange={(e) => setEditableUser({ ...editableUser, role: e.target.value })}>
//                   <option value="Recruiter">Recruiter</option>
//                   <option value="Admin">Admin</option>
//                   <option value="Client">Client</option>
//                 </CFormSelect>
//               </div>

//               {editableUser.role === 'Client' && (
//                 <CFormInput type="text" placeholder="Company" value={editableUser.company || ''} onChange={(e) => setEditableUser({ ...editableUser, company: e.target.value })} />
//               )}

//               <div className="d-flex justify-content-center gap-3 mt-3">
//                 <CButton color="success" onClick={handleSaveEdit} size="lg">Update</CButton>
//                 <CButton color="secondary" onClick={handleCancelEdit} size="lg">Cancel</CButton>
//               </div>
//             </CCard>
//           )}

//           {userToDelete && (
//             <CCard className="p-4 text-center" style={{ width: '450px' }}>
//               <h5>Confirm Delete</h5>
//               <p style={{ color: '#6b7280' }}>Delete <strong>{userToDelete.full_name}</strong> ({userToDelete.email})?</p>
//               <div className="d-flex justify-content-center gap-3 mt-3">
//                 <CButton color="secondary" onClick={handleCancelDelete}>Cancel</CButton>
//                 <CButton style={{ backgroundColor: '#d62828', border: 'none', color: 'white' }} onClick={handleDeleteUser}>Delete</CButton>
//               </div>
//             </CCard>
//           )}
//         </div>
//       )}
//     </>
//   )
// }

// export default DisplayUsersTable