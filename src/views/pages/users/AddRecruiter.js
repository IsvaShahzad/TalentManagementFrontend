


import React, { useState, useEffect } from 'react'
import { CContainer, CFormInput, CFormSelect, CButton, CAlert, CCard } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilTrash, cilPencil, cilSearch } from '@coreui/icons'
import { getUsersByRoleApi, deleteUserByEmailApi, updateUserApi } from '../../../api/api'

const AddRecruiter = () => {
  const [recruiters, setRecruiters] = useState([])
  const [filter, setFilter] = useState('')
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [alertColor, setAlertColor] = useState('success')
  const [editingUser, setEditingUser] = useState(null)
  const [deletingUser, setDeletingUser] = useState(null)
  const [editableUser, setEditableUser] = useState({})

  const fetchRecruiters = async () => {
    try {
      const response = await getUsersByRoleApi('Recruiter')
      const usersArray = response.users || response.data || []
      const formatted = usersArray.map(r => ({
        name: r.full_name,
        email: r.email,
        role: r.role,
        date: new Date(r.createdAt).toISOString(),
      }))
      setRecruiters(formatted)
    } catch (err) {
      console.error('Failed to fetch recruiters:', err)
      setRecruiters([])
    }
  }

  useEffect(() => { fetchRecruiters() }, [])

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
      const payload = {
        full_name: editableUser.name,
        role: editableUser.role,
        email: editableUser.email,
      }
      await updateUserApi(editableUser.email, payload)
      setAlertMessage(`Recruiter "${editableUser.email}" updated successfully`)
      setAlertColor('success')
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 3000)
      fetchRecruiters()
      handleCancel()
    } catch (err) {
      console.error('Update failed:', err)
      setAlertMessage('Failed to update recruiter.')
      setAlertColor('danger')
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 3000)
    }
  }

  const handleConfirmDelete = async () => {
    try {
      await deleteUserByEmailApi(deletingUser.email)
      setAlertMessage(`Recruiter "${deletingUser.email}" deleted successfully`)
      setAlertColor('success')
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 3000)
      fetchRecruiters()
      handleCancel()
    } catch (err) {
      console.error('Delete failed:', err)
      setAlertMessage('Failed to delete recruiter.')
      setAlertColor('danger')
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 3000)
    }
  }

  const filteredRecruiters = recruiters.filter(r =>
    r.name.toLowerCase().includes(filter.toLowerCase()) ||
    r.email.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <CContainer style={{ fontFamily: 'Inter, sans-serif', marginTop: '2rem', padding: '0 1rem', fontSize: '0.85rem' }}>

      {showAlert && (
        <CAlert color={alertColor} className="toast-alert text-center" style={{ fontSize: '0.85rem' }}>
          {alertMessage}
        </CAlert>
      )}

      <div style={{ border: '1px solid #d1d5db', borderRadius: '0.25rem', overflow: 'hidden', background: '#fff' }}>

        {/* Search Bar */}
        <div
          className="px-3 py-2"
          style={{ borderBottom: '1px solid #e5e7eb', background: '#f9fafb', display: 'flex', justifyContent: 'center' }}
        >
          <div style={{ position: 'relative', maxWidth: '400px', width: '100%', marginBottom: '1rem' }}>
            <CFormInput
              placeholder="Search recruiter by email or name"
              value={filter}
              onChange={e => setFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '0.45rem 0.75rem 0.45rem 1.8rem',
                fontSize: '0.85rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.25rem',
                backgroundColor: '#fff',
                marginTop: '0.8rem'
              }}
            />
            <CIcon
              icon={cilSearch}
              style={{ position: 'absolute', left: '6px', top: '60%', transform: 'translateY(-50%)', color: '#6b7280', fontSize: '0.95rem' }}
            />
          </div>
        </div>

        {/* Table Header */}
        <div className="d-flex px-3 py-2 flex-wrap"
          style={{
            fontWeight: 500,
            fontSize: '0.85rem',
            color: '#000000',
            background: '#f9fafb',
            borderBottom: '1px solid #d1d5db'
          }}
        >
          <div style={{ flex: '2 1 120px', minWidth: '100px' }}>Name</div>
          <div style={{ flex: '3 1 180px', minWidth: '140px' }}>Email</div>
          <div style={{ flex: '2 1 100px', minWidth: '90px' }}>Role</div>
          <div style={{ flex: '2 1 100px', minWidth: '90px' }}>Date Created</div>
          <div style={{ flex: '2 1 120px', minWidth: '90px', textAlign: 'center' }}>Actions</div>
        </div>

        {/* Table Rows */}
        <div className="d-flex flex-column" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          {filteredRecruiters.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#6B7280', padding: '2rem', fontSize: '0.85rem' }}>No recruiters found.</div>
          ) : filteredRecruiters.map((r, index) => {
            const dateObj = new Date(r.date)
            const date = dateObj.toLocaleDateString()
            const time = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

            return (
              <div key={index} className="d-flex align-items-center px-3 py-2 flex-wrap"
                style={{
                  borderBottom: index !== filteredRecruiters.length - 1 ? '1px solid #f0f0f0' : 'none',
                  background: '#ffffff',
                  transition: '0.25s ease',
                  fontSize: '0.85rem',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
              >
                <div style={{ flex: '2 1 120px', minWidth: '100px', fontWeight: 500, color: '#0F172A', wordBreak: 'break-word' }}>{r.name}</div>
                <div style={{ flex: '3 1 180px', minWidth: '140px', color: '#374151', wordBreak: 'break-word' }}>{r.email}</div>
                <div style={{ flex: '2 1 100px', minWidth: '90px', color: '#1E3A8A', fontWeight: 500 }}>{r.role}</div>
                <div style={{ flex: '2 1 100px', minWidth: '90px', color: '#4B5563' }}>{`${date} ${time}`}</div>
                <div style={{ flex: '2 1 120px', minWidth: '90px', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                  <CIcon icon={cilPencil} style={{ color: '#185883ff', cursor: 'pointer', fontSize: '1rem' }} onClick={() => handleEditClick(r)} />
                  <CIcon icon={cilTrash} style={{ color: '#bc200fff', cursor: 'pointer', fontSize: '1rem' }} onClick={() => handleDeleteClick(r)} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Modals */}
      {(editingUser || deletingUser) && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
          {editingUser && (
            <CCard className="p-4 text-center" style={{
              width: '90%',
              maxWidth: '500px',
              borderRadius: '0.25rem',
              fontFamily: 'Inter, sans-serif',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              margin: '1rem',
              fontSize: '0.85rem'
            }}>
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

              <div className="d-flex justify-content-center mt-3">
                <CButton color="success" onClick={handleSave} size="lg" style={{ borderRadius: '0.25rem', padding: '0.75rem 2rem', fontSize: '0.95rem', color: 'white' }}>Update</CButton>
              </div>
            </CCard>
          )}

          {deletingUser && (
            <CCard className="p-4 text-center" style={{ width: '90%', maxWidth: '450px', borderRadius: '0.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', fontFamily: 'Inter, sans-serif', margin: '1rem', fontSize: '0.85rem' }}>
              <h5 style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '1rem' }}>Confirm Delete</h5>
              <p style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: '1.5rem' }}>
                Are you sure you want to delete <strong>{deletingUser.email}</strong>?
              </p>
              <div className="d-flex justify-content-center gap-3 mt-3 flex-wrap">
                <CButton color="secondary" onClick={handleCancel} size="lg" style={{ borderRadius: '0.25rem', padding: '0.5rem 1.2rem', fontSize: '0.85rem', backgroundColor: '#6c757d', border: 'none' }}>Cancel</CButton>
                <CButton onClick={handleConfirmDelete} size="lg" style={{ borderRadius: '0.25rem', padding: '0.5rem 1.2rem', fontSize: '0.85rem', backgroundColor: '#d62828', border: 'none', color: 'white' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#b71c1c')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#d62828')}
                >
                  Delete
                </CButton>
              </div>
            </CCard>
          )}
        </div>
      )}
    </CContainer>
  )
}

export default AddRecruiter






// import React, { useState, useEffect } from 'react'
// import {
//   CContainer, CCard, CCardBody,
//   CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell,
//   CFormInput, CFormSelect, CAlert, CButton
// } from '@coreui/react'
// import CIcon from '@coreui/icons-react'
// import { cilTrash, cilPencil, cilSearch } from '@coreui/icons'
// import { getUsersByRoleApi, deleteUserByEmailApi, updateUserApi } from '../../../api/api'

// const AddRecruiter = () => {
//   const [recruiters, setRecruiters] = useState([])
//   const [filter, setFilter] = useState('')
//   const [showAlert, setShowAlert] = useState(false)
//   const [alertMessage, setAlertMessage] = useState('')
//   const [alertColor, setAlertColor] = useState('success')
//   const [editingUser, setEditingUser] = useState(null)
//   const [deletingUser, setDeletingUser] = useState(null)
//   const [editableUser, setEditableUser] = useState({})

//   const fetchRecruiters = async () => {
//     try {
//       const response = await getUsersByRoleApi('Recruiter')
//       const usersArray = response.users || response.data || []
//       const formatted = usersArray.map(r => ({
//         name: r.full_name,
//         email: r.email,
//         role: r.role,
//         date: new Date(r.createdAt).toLocaleString(),
//       }))
//       setRecruiters(formatted)
//     } catch (err) {
//       console.error('Failed to fetch recruiters:', err)
//       setRecruiters([])
//     }
//   }

//   useEffect(() => { fetchRecruiters() }, [])

//   const handleEditClick = (user) => {
//     setEditingUser(user)
//     setEditableUser({ ...user })
//   }

//   const handleDeleteClick = (user) => {
//     setDeletingUser(user)
//   }

//   const handleCancel = () => {
//     setEditingUser(null)
//     setDeletingUser(null)
//     setEditableUser({})
//   }

//   const headerStyle = {
//     fontSize: '1.1rem',
//     padding: '0.8rem 1rem',
//     border: 'none',
//     fontWeight: 500,
//     fontFamily: 'Inter, sans-serif'
// ,
//   };

//   const handleSave = async () => {
//     try {
//       const payload = {
//         full_name: editableUser.name,
//         role: editableUser.role,
//         email: editableUser.email,
//       }
//       await updateUserApi(editableUser.email, payload)
//       setAlertMessage(`Recruiter "${editableUser.email}" updated successfully`)
//       setAlertColor('success')
//       setShowAlert(true)
//       setTimeout(() => setShowAlert(false), 3000)
//       fetchRecruiters()
//       handleCancel()
//     } catch (err) {
//       console.error('Update failed:', err)
//       setAlertMessage('Failed to update recruiter.')
//       setAlertColor('danger')
//       setShowAlert(true)
//       setTimeout(() => setShowAlert(false), 3000)
//     }
//   }

//   const handleConfirmDelete = async () => {
//     try {
//       await deleteUserByEmailApi(deletingUser.email)
//       setAlertMessage(`Recruiter "${deletingUser.email}" deleted successfully`)
//       setAlertColor('success')
//       setShowAlert(true)
//       setTimeout(() => setShowAlert(false), 3000)
//       fetchRecruiters()
//       handleCancel()
//     } catch (err) {
//       console.error('Delete failed:', err)
//       setAlertMessage('Failed to delete recruiter.')
//       setAlertColor('danger')
//       setShowAlert(true)
//       setTimeout(() => setShowAlert(false), 3000)
//     }
//   }

//   const filteredRecruiters = recruiters.filter(r =>
//     r.name.toLowerCase().includes(filter.toLowerCase()) ||
//     r.email.toLowerCase().includes(filter.toLowerCase())
//   )

//   return (
//     <CContainer style={{
//       fontFamily: 'Inter, sans-serif', marginTop: '2rem', position: 'relative', maxWidth: '1200px', borderRadius: '0rem', overflow: 'hidden'       // ensures inner content respects square corners
//       // less rounded
//     }}>


//       {showAlert && (
//         <CAlert color={alertColor} className="toast-alert text-center">
//           {alertMessage}
//         </CAlert>
//       )}

//       <CCard className="shadow-sm border-0 rounded-4" style={{ background: '#ffffff' }}>
//         <CCardBody className="p-4">

//           {/* Filter Input */}
//           <div style={{
//             display: 'flex',
//             justifyContent: 'center',
//             marginBottom: '2rem',  // space between search and table
//             marginTop: '2rem',  // space between search and table

//           }}>
//             <div style={{ position: 'relative', width: '600px' }}>
//               <CFormInput
//                 placeholder="Search user by email or name"
//                 value={filter}
//                 onChange={e => setFilter(e.target.value)}
//                 style={{
//                   width: '100%',
//                   padding: '0.75rem 1rem 0.75rem 2.5rem', // space for icon
//                   fontSize: '1rem',
//                   backgroundColor: '#ffffffff',
//                   border: '1px solid #f1ededff',
//                   borderRadius: '0.25rem',
//                   outline: 'none',
//                   boxShadow: 'none',
//                   marginTop: '-20px'
//                 }}
//                 aria-label="Search user with email or name"
//                 onFocus={(e) => e.target.style.boxShadow = 'none'} // remove highlight
//               />
//               <CIcon
//                 icon={cilSearch}
//                 style={{
//                   position: 'absolute',
//                   left: '12px',
//                   top: '50%',
//                   transform: 'translateY(-50%)',
//                   color: '#6c757d',
//                   fontSize: '1.2rem',
//                   marginTop: '-11px'

//                 }}
//               />
//             </div>
//           </div>


//           <CTable responsive className="align-middle" style={{ borderCollapse: 'separate', borderSpacing: '0 0.5rem', fontSize: '1rem' }}>
//             <CTableHead>
//               <CTableRow>
//                 <CTableHeaderCell style={headerStyle}>Name</CTableHeaderCell>
//                 <CTableHeaderCell style={headerStyle}>Email</CTableHeaderCell>
//                 <CTableHeaderCell style={headerStyle}>Role</CTableHeaderCell>
//                 <CTableHeaderCell style={headerStyle}>Date Created</CTableHeaderCell>
//                 <CTableHeaderCell style={{ ...headerStyle, textAlign: 'center' }}>Actions</CTableHeaderCell>
//               </CTableRow>
//             </CTableHead>

//             <CTableBody>
//               {filteredRecruiters.length > 0 ? (
//                 filteredRecruiters.map((r) => (
//                   <CTableRow
//                     key={r.email}
//                     style={{
//                       backgroundColor: '#ffffff',
//                       boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
//                       borderRadius: '1.5rem',
//                       fontSize: '0.95rem',
//                       border: 'none',
//                     }}
//                   >
//                     <CTableDataCell
//                       style={{ padding: '1rem 1rem', border: 'none', fontWeight: 500, color: '#2c3e50' }}
//                     >
//                       {r.name}
//                     </CTableDataCell>
//                     <CTableDataCell
//                       style={{ padding: '1rem 1rem', border: 'none', fontWeight: 500, color: '#2c3e50' }}
//                     >
//                       {r.email}
//                     </CTableDataCell>
//                     <CTableDataCell style={{ padding: '1rem 1rem', border: 'none' }}>{r.role}</CTableDataCell>
//                     <CTableDataCell style={{ padding: '1rem 1rem', color: '#6c757d', border: 'none' }}>
//                       {r.date}
//                     </CTableDataCell>
//                     <CTableDataCell style={{ padding: '1rem 1rem', textAlign: 'center', border: 'none' }}>
//                       <div className="d-flex justify-content-center gap-3">
//                         <CIcon
//                           icon={cilPencil}
//                           style={{ color: '#185883ff', cursor: 'pointer', fontSize: '1.7rem' }}
//                           onClick={() => handleEditClick(r)}
//                         />
//                         <CIcon
//                           icon={cilTrash}
//                           style={{ color: '#bc200fff', cursor: 'pointer', fontSize: '1.7rem' }}
//                           onClick={() => handleDeleteClick(r)}
//                         />
//                       </div>
//                     </CTableDataCell>
//                   </CTableRow>
//                 ))
//               ) : (
//                 <CTableRow>
//                   <CTableDataCell colSpan={5} className="text-center py-4">
//                     <span style={{ color: '#6c757d', fontSize: '1rem' }}>
//                       No users found.
//                     </span>
//                   </CTableDataCell>
//                 </CTableRow>
//               )}
//             </CTableBody>

//           </CTable>

//           {/* Modal Overlay */}
//           {(editingUser || deletingUser) && (
//             <div style={{
//               position: 'fixed',
//               top: 0,
//               left: 0,
//               width: '100%',
//               height: '100%',
//               backgroundColor: 'rgba(0,0,0,0.5)',
//               display: 'flex',
//               justifyContent: 'center',
//               alignItems: 'center',
//               zIndex: 9999
//             }}>
//               {editingUser && (
//                 <CCard
//                   className="p-4 text-center"
//                   style={{
//                     width: '500px',
//                     height: '450px',
//                     borderRadius: '0.25rem',
//                     fontFamily: 'Inter, sans-serif',
//                     display: 'flex',
//                     flexDirection: 'column',
//                     justifyContent: 'center'
//                   }}
//                 >
//                   {/* Title */}
//                   <h4 style={{ fontWeight: 600, fontSize: '1.5rem', marginBottom: '0.5rem' }}>Update Details</h4>

//                   {/* Email */}
//                   <p style={{ fontSize: '1rem', color: '#6c757d', marginBottom: '1.5rem' }}>{editableUser.email}</p>

//                   {/* Name Field */}
//                   <div className="text-start mb-3">
//                     <label style={{ fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.25rem', display: 'block' }}>Name</label>
//                     <CFormInput
//                       value={editableUser.name}
//                       onChange={e => setEditableUser({ ...editableUser, name: e.target.value })}
//                       style={{
//                         width: '100%',
//                         padding: '0.75rem 1rem',
//                         fontSize: '1rem',
//                         borderRadius: '0.25rem',
//                         border: '1px solid #d3d3d3',
//                         fontFamily: 'Inter, sans-serif'
//                       }}
//                     />
//                   </div>

//                   {/* Role Field */}
//                   <div className="text-start mb-4">
//                     <label style={{ fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.25rem', display: 'block' }}>Role</label>
//                     <CFormSelect
//                       value={editableUser.role}
//                       onChange={e => setEditableUser({ ...editableUser, role: e.target.value })}
//                       style={{
//                         width: '100%',
//                         padding: '0.75rem 1rem',
//                         fontSize: '1rem',
//                         borderRadius: '0.25rem',
//                         border: '1px solid #d3d3d3',
//                         fontFamily: 'Inter, sans-serif'
//                       }}
//                     >
//                       <option value="Recruiter">Recruiter</option>
//                       <option value="Admin">Admin</option>
//                       <option value="Client">Client</option>
//                     </CFormSelect>
//                   </div>

//                   {/* Update Button */}
//                   <div className="d-flex justify-content-center mt-3">
//                     <CButton
//                       color="success"
//                       onClick={handleSave}
//                       size="lg"
//                       style={{ borderRadius: '0.25rem', padding: '0.9rem 9rem', fontSize: '1.1rem', fontFamily: 'Inter, sans-serif', color: 'white' }}
//                     >
//                       Update
//                     </CButton>
//                   </div>
//                 </CCard>
//               )}



//               {deletingUser && (
//                 <CCard
//                   className="p-4 text-center"
//                   style={{
//                     width: '450px',
//                     height: '280px',
//                     borderRadius: '0.25rem',
//                     display: 'flex',
//                     flexDirection: 'column',
//                     justifyContent: 'center',
//                     fontFamily: 'Inter, sans-serif'
//                   }}
//                 >
//                   <h5 style={{ fontWeight: 600, fontSize: '1.3rem', marginBottom: '1rem' }}>Confirm Delete</h5>
//                   <p style={{ fontSize: '1rem', color: '#6c757d', marginBottom: '2rem' }}>
//                     Are you sure you want to delete <strong>{deletingUser.email}</strong>?
//                   </p>
//                   <div className="d-flex justify-content-center gap-3 mt-3">
//                     <CButton
//                       color="secondary"
//                       onClick={handleCancel}
//                       size="lg"
//                       style={{
//                         borderRadius: '0.25rem',
//                         padding: '0.75rem 1.5rem',
//                         fontSize: '1rem',
//                         backgroundColor: '#6c757d',
//                         border: 'none'
//                       }}
//                     >
//                       Cancel
//                     </CButton>
//                     <CButton
//                       onClick={handleConfirmDelete}
//                       size="lg"
//                       style={{
//                         borderRadius: '0.25rem',
//                         padding: '0.75rem 1.5rem',
//                         fontSize: '1rem',
//                         backgroundColor: '#d62828', // strong red
//                         border: 'none',
//                         color: 'white',
//                         transition: 'background-color 0.2s ease'
//                       }}
//                       onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#b71c1c')} // darker red on hover
//                       onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#d62828')}
//                     >
//                       Delete
//                     </CButton>
//                   </div>
//                 </CCard>
//               )}

//             </div>
//           )}

//         </CCardBody>
//       </CCard>
//     </CContainer>
//   )
// }

// export default AddRecruiter