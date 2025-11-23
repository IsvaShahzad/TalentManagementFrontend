// import React, { useState, useEffect } from 'react'
// import {
//   CContainer, CCard, CCardBody,
//   CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell,
//   CFormInput, CButton, CAlert, CModal, CModalHeader, CModalBody, CModalFooter, CFormSelect
// } from '@coreui/react'
// import CIcon from '@coreui/icons-react'
// import { cilTrash, cilPencil, cilSearch, cilCloudUpload, cilBook, cilCalendar } from '@coreui/icons'
// import { deleteSearchApi, getAllSearches, updateSearchApi } from '../../../api/api'
// import ActionMenu from './ActionMenu'
// import Notes from './Notes'

// const SavedSearch = ({ }) => {


//   const [query, setQuery] = useState('')
//   const [frequency, setFrequency] = useState('')
//   const [createdAT, setCeatedAt] = useState('')
//   const [createdBy, setCeatedBy] = useState('')
//   //  const [location, setLocation] = useState('')
//   // const [experience, setExperience] = useState('')
//   //const [position, setPosition] = useState('')
//   //const [resume, setResume] = useState(null)

//   const [position, setPosition] = useState('');
//   const [experience, setExperience] = useState('');
//   const [notifyFrequency, setNotifyFrequency] = useState('none');



//   const [filteredSearches, setFilteredSearches] = useState([])
//   const [searchQuery, setSearchQuery] = useState('')
//   const [alerts, setAlerts] = useState([])
//   const [editingSearch, setEditingSearch] = useState(null)
//   const [deletingSearch, setDeletingSearch] = useState(null)
//   const [searches, setSearches] = useState([])
//   const [userId, setUserId] = useState('')

//   // 🔹 Show alert
//   const showAlert = (message, color = 'success') => {
//     const id = new Date().getTime()
//     setAlerts(prev => [...prev, { id, message, color }])
//     setTimeout(() => {
//       setAlerts(prev => prev.filter(a => a.id !== id))
//     }, 3000)
//   }


//   // Open delete modal
//   const handleDelete = (search) => setDeletingSearch(search);

//   // Confirm delete
//   const handleConfirmDelete = async () => {
//     if (!deletingSearch) return;
//     try {
//       await deleteSearchApi(deletingSearch.id); // make sure API expects savedsearch_id
//       showAlert('Search deleted successfully', 'success');
//       fetchSearches(); // refresh list after delete
//     } catch (err) {
//       console.error('Failed to delete search:', err);
//       showAlert('Failed to delete search', 'danger');
//     } finally {
//       setDeletingSearch(null);
//     }
//   };

//   // 🔹 Edit
//   // const handleEdit = (Search) => setEditingSearch({ ...Search })
//   const handleEdit = (search) => {
//     setEditingSearch({ ...search });
//     setFrequency(search.frequency || ''); // <-- initialize frequency\


//   }


//   const handleSave = async () => {
//     try {
//       console.log(position, experience)

//       const filters = {
//         position,
//         experience: experience ? parseFloat(experience) : null,
//       };
//       const updatedQuery = `${filters.position || ''} for ${filters.experience ? filters.experience + ' years' : ''}`.trim();
//       console.log("sending updated search", editingSearch.id, updatedQuery, frequency, // <-- use updated frequency
//         filters)
//       await updateSearchApi(editingSearch.id, {
//         query: updatedQuery || editingSearch.query || null,
//         notify_frequency: frequency || null, // <-- use updated frequency
//         filters
//       })
//       showAlert('Search updated successfully', 'success');
//       fetchSearches(); // refresh list
//       setEditingSearch(null);
//     } catch (err) {
//       console.error('Search update failed:', err);
//       showAlert('Failed to update Search', 'danger');
//     }
//   }



//   //Fetch searches for particular user
//   const fetchSearches = async () => {

//     // Get the JSON string from localStorage
//     const userObj = localStorage.getItem('user');

//     // Parse the JSON string to an object
//     const user = JSON.parse(userObj);

//     // Access the user_id
//     const userId = user.user_id;
//     setUserId(userId)
//     console.log("user id for getting searches for now logged in user", userId)


//     try {
//       const response = await getAllSearches(userId)
//       console.log("searches", response)
//       if (response && response.length > 0) {
//         const formatted = response.map(c => ({
//           id: c.savedsearch_id,
//           query: c.query,
//           frequency: c.notify_frequency,
//           createdAT: new Date(c.created_at).toLocaleString(),
//           createdBy: c.user?.full_name || 'Unknown',


//         }))
//         setSearches(formatted)
//         setFilteredSearches(formatted);
//       } else {
//         setSearches([])
//         setFilteredSearches([]);
//       }

//     } catch (err) {
//       console.error('Failed to fetch searches FE', err)
//       showAlert('Failed to fetch searches', 'danger')
//     }
//   }

//   useEffect(() => {
//     fetchSearches(); // fetch initially

//     // ✅ Optional: auto-refresh every 5 seconds
//     const interval = setInterval(() => {
//       fetchSearches();
//     }, 5000);

//     return () => clearInterval(interval); // cleanup on unmount
//   }, []);



//   return (
//     <CContainer
//       style={{
//         fontFamily: 'Inter, sans-serif',
//         marginTop: '2rem',
//         maxWidth: '95vw',
//       }}
//     >
//       <h3
//         style={{
//           fontWeight: 550,
//           marginBottom: '1.5rem',
//           textAlign: 'center', // ✅ centers the heading
//         }}
//       >
//         Saved Searches
//       </h3>

//       {/* Alerts */}
//       <div style={{ position: 'fixed', top: '10px', right: '10px', zIndex: 9999 }}>
//         {alerts.map(alert => <CAlert key={alert.id} color={alert.color} dismissible>{alert.message}</CAlert>)}
//       </div>

//       <CCard className="shadow-sm border-0 rounded-4" style={{ background: '#ffffff', padding: '2rem 1rem' }}>
//         <CCardBody style={{ padding: 0 }}>

//           {/* Top Row: Search Bar + Upload Icon */}
//           <div
//             style={{
//               display: 'flex',
//               justifyContent: 'center',
//               alignItems: 'center',
//               marginBottom: '1.5rem',
//               position: 'relative',
//             }}
//           >


//           </div>

//           {/* Search Table */}
//           <CTable
//             responsive
//             className="align-middle"
//             style={{
//               width: '100%',
//               borderCollapse: 'separate',
//               borderSpacing: '0 0.5rem',
//               fontSize: '1rem',
//               tableLayout: 'auto',
//             }}
//           >
//             {/* <CTableHead>
//               <CTableRow>
//                 {['Search', 'Frequency', 'Date Added', 'Saved By', 'Actions'].map(header => (
//                   <CTableHeaderCell
//                     key={header}
//                     style={{ fontWeight: 600, border: 'none', fontSize: '1rem' }}
//                   >
//                     {header}
//                   </CTableHeaderCell>
//                 ))}
//               </CTableRow>
//             </CTableHead> */}

//            <CTableBody>
//   {filteredSearches.length > 0 ? filteredSearches.map((s) => (
//     <CTableRow key={s.id} style={{ border: 'none', background: 'transparent' }}>
//       <CTableDataCell colSpan="5" style={{ border: 'none', padding: 0 }}>

//         <div
//           style={{
//             background: '#ffffff',
//             padding: '1rem 1.2rem',
//             marginBottom: '1rem',
//             borderRadius: '14px',
//             boxShadow: '0 3px 10px rgba(0,0,0,0.08)',
//             transition: '0.25s ease',
//             display: 'flex',
//             justifyContent: 'space-between',
//             alignItems: 'center',
//           }}
//           onMouseEnter={(e) => {
//             e.currentTarget.style.transform = 'translateY(-4px)';
//             e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.12)';
//           }}
//           onMouseLeave={(e) => {
//             e.currentTarget.style.transform = 'translateY(0)';
//             e.currentTarget.style.boxShadow = '0 3px 10px rgba(0,0,0,0.08)';
//           }}
//         >

//           {/* LEFT SIDE */}
//           <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
//             <div
//               style={{
//                 width: '50px',
//                 height: '50px',
//                 borderRadius: '12px',
//                 background: 'linear-gradient(135deg, #6ea8ff, #2969ff)',
//                 display: 'flex',
//                 justifyContent: 'center',
//                 alignItems: 'center',
//                 boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
//               }}
//             >
//               <CIcon icon={cilSearch} size="lg" style={{ color: 'white' }} />
//             </div>

//             <div>
//               <div style={{ fontWeight: 600, fontSize: '1.05rem', color: '#222' }}>
//                 {s.query || "-"}
//               </div>
//               <div style={{ color: '#777', fontSize: '0.85rem' }}>
//                 Saved by: <span style={{ fontWeight: 500 }}>{s.createdBy || "-"}</span>
//               </div>
//             </div>
//           </div>

//           {/* RIGHT SIDE */}
//           <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>

//             <div style={{ textAlign: 'right' }}>
//               <div style={{ fontSize: '0.85rem', color: '#555' }}>
//                 Frequency:
//                 <span style={{ fontWeight: 600, marginLeft: '6px' }}>
//                   {s.frequency || "-"}
//                 </span>
//               </div>

//               <div style={{ fontSize: '0.8rem', color: '#999' }}>
//                 Added: {s.createdAT || "-"}
//               </div>
//             </div>

//             {/* ACTION ICONS */}
//             <div style={{ display: 'flex', gap: '12px' }}>
//               <CIcon
//                 icon={cilPencil}
//                 size="lg"
//                 style={{
//                   cursor: 'pointer',
//                   color: '#3b82f6',
//                   background: '#e8f1ff',
//                   padding: '8px',
//                   borderRadius: '10px'
//                 }}
//                 onClick={() => handleEdit(s)}
//               />

//               <CIcon
//                 icon={cilTrash}
//                 size="lg"
//                 style={{
//                   cursor: 'pointer',
//                   color: '#ef4444',
//                   background: '#ffeaea',
//                   padding: '8px',
//                   borderRadius: '10px'
//                 }}
//                 onClick={() => handleDelete(s)}
//               />
//             </div>

//           </div>

//         </div>

//       </CTableDataCell>
//     </CTableRow>
//   )) : (
//     <CTableRow>
//       <CTableDataCell
//         colSpan="5"
//         className="text-center text-muted"
//         style={{ border: 'none', padding: '1rem' }}
//       >
//         No searches found.
//       </CTableDataCell>
//     </CTableRow>
//   )}
// </CTableBody>


            
//           </CTable>


//           {/*
//                     <div className='right-side'>
//                         for notes on right
//                         <Notes candidates={candidates} refreshCandidates={refreshCandidates} />
//                     </div>*/}

//         </CCardBody>
//       </CCard>

//       {/* Edit Modal */}
//       <CModal visible={!!editingSearch} onClose={() => setEditingSearch(null)}>
//         <CModalHeader closeButton>Edit Candidate</CModalHeader>
//         <CModalBody>
//           {editingSearch && (
//             <>
//               <CFormInput className="mb-2" label="Query" readOnly value={editingSearch.query || ''} onChange={(e) => setEditingSearch({ ...editingSearch, query: e.target.value })} />
//               {/*<CFormInput className="mb-2" label="Frequency" value={editingSearch.frequency || ''} onChange={(e) => setEditingSearch({ ...editingSearch, frequency: e.target.value })} />*/}


//               <CFormInput className="mb-2" label="Position"
//                 value={position}
//                 onChange={(e) => setPosition(e.target.value)} />
//               <CFormInput className="mb-2" label="Experience(years)"
//                 value={experience}
//                 onChange={(e) => setExperience(e.target.value)}

//               />

//               <div
//                 className="mb-4"
//                 style={{
//                   display: 'flex',
//                   alignItems: 'center',
//                   border: '1px solid #cbd5e1',
//                   borderRadius: '8px',
//                   height: '44px', // reduced height
//                   backgroundColor: '#fff',
//                 }}
//               >





//                 <div
//                   style={{
//                     display: 'flex',
//                     alignItems: 'center',
//                     padding: '0 12px',
//                     fontFamily: 'Inter, sans-serif'
//                   }}>
//                   <CIcon icon={cilCalendar}
//                     style={{ color: '#326396ff', fontSize: '18px' }} />
//                   <div
//                     style={{
//                       width: '0.9px',
//                       height: '25px',
//                       backgroundColor: '#518ccbff',
//                       marginLeft: '8px',
//                       marginRight: '8px',
//                       fontFamily: 'Inter, sans-serif'
//                     }}
//                   ></div>



//                 </div>


//                 <CFormSelect
//                   value={frequency} // current selected frequency
//                   onChange={(e) => setFrequency(e.target.value)} // updates frequency state
//                   style={{
//                     border: 'none',
//                     outline: 'none',
//                     flex: 1,
//                     fontSize: '1rem',
//                     padding: '0 0.75rem',
//                     height: '100%',
//                     boxShadow: 'none',
//                     backgroundColor: '#fff',
//                     color: frequency ? '#4e596bff' : '#9ca3af',
//                     appearance: 'none',
//                     WebkitAppearance: 'none',
//                     MozAppearance: 'none',
//                     width: '50%',
//                     fontFamily: 'Inter, sans-serif'
//                   }}
//                 >
//                   <option value="" disabled hidden>
//                     Save Search
//                   </option>
//                   <option value="daily">Daily</option>
//                   <option value="weekly">Weekly</option>
//                   <option value="monthly">Monthly</option>
//                 </CFormSelect>

//               </div>
//             </>


//           )}
//         </CModalBody>
//         <CModalFooter>
//           <CButton color="secondary" onClick={() => setEditingSearch(null)}>Cancel</CButton>
//           <CButton color="primary" onClick={handleSave}>Save</CButton>
//         </CModalFooter>
//       </CModal>

//       {/* Delete Confirmation Modal */}
//       <CModal visible={!!deletingSearch} onClose={() => setDeletingSearch(null)}>
//         <CModalHeader closeButton>Confirm Delete</CModalHeader>
//         <CModalBody>Are you sure you want to delete this search?</CModalBody>
//         <CModalFooter>
//           <CButton color="secondary" onClick={() => setDeletingSearch(null)}>Cancel</CButton>
//           <CButton color="danger" onClick={handleConfirmDelete}>Delete</CButton>
//         </CModalFooter>
//       </CModal>


//     </CContainer>
//   )
// }

// export default SavedSearch
import React, { useState, useEffect } from 'react'
import { Trash, TimerReset } from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from 'recharts'
import {
  CContainer, CCard, CCardBody,
  CButton, CAlert, CModal, CModalHeader, CModalBody, CModalFooter,
  CFormInput, CFormSelect
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilTrash, cilCalendar, cilSearch } from '@coreui/icons'
import { deleteSearchApi, getAllSearches, updateSearchApi } from '../../../api/api'

const SavedSearch = () => {
  const [searches, setSearches] = useState([])
  const [editingSearch, setEditingSearch] = useState(null)
  const [deletingSearch, setDeletingSearch] = useState(null)
  const [frequency, setFrequency] = useState('')
  const [position, setPosition] = useState('')
  const [experience, setExperience] = useState('')
  const [alerts, setAlerts] = useState([])
  const [userId, setUserId] = useState('')

  const showAlert = (message, color = 'success') => {
    const id = new Date().getTime()
    setAlerts(prev => [...prev, { id, message, color }])
    setTimeout(() => setAlerts(prev => prev.filter(a => a.id !== id)), 3000)
  }

  const fetchSearches = async () => {
    const userObj = localStorage.getItem('user')
    const user = JSON.parse(userObj)
    setUserId(user.user_id)

    try {
      const response = await getAllSearches(user.user_id)
      const formatted = response.map(c => ({
        id: c.savedsearch_id,
        query: c.query,
        frequency: c.notify_frequency,
        createdAT: new Date(c.created_at).toLocaleString(),
        createdBy: c.user?.full_name || 'Unknown',
      }))
      setSearches(formatted)
    } catch (err) {
      console.error(err)
      showAlert('Failed to fetch searches', 'danger')
    }
  }


  const statsData = [
  { day: 'Mon', searches: 12, filled: 8 },
  { day: 'Tue', searches: 18, filled: 14 },
  { day: 'Wed', searches: 10, filled: 7 },
  { day: 'Thu', searches: 22, filled: 18 },
  { day: 'Fri', searches: 15, filled: 10 },
  { day: 'Sat', searches: 9, filled: 5 },
  { day: 'Sun', searches: 14, filled: 9 },
]




  useEffect(() => {
    fetchSearches()
    const interval = setInterval(fetchSearches, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleEdit = (s) => {
    setEditingSearch({ ...s })
    setFrequency(s.frequency || '')
  }

  const handleSave = async () => {
    try {
      const filters = {
        position,
        experience: experience ? parseFloat(experience) : null,
      }
      const updatedQuery = `${filters.position || ''} for ${filters.experience ? filters.experience + ' years' : ''}`.trim()

      await updateSearchApi(editingSearch.id, {
        query: updatedQuery || editingSearch.query || null,
        notify_frequency: frequency || null,
        filters
      })
      showAlert('Search updated successfully', 'success')
      fetchSearches()
      setEditingSearch(null)
    } catch (err) {
      console.error(err)
      showAlert('Failed to update Search', 'danger')
    }
  }

  const handleDelete = (s) => setDeletingSearch(s)
  const handleConfirmDelete = async () => {
    if (!deletingSearch) return
    try {
      await deleteSearchApi(deletingSearch.id)
      showAlert('Search deleted successfully', 'success')
      fetchSearches()
    } catch (err) {
      console.error(err)
      showAlert('Failed to delete search', 'danger')
    } finally {
      setDeletingSearch(null)
    }
  }

  return (
    <CContainer style={{ fontFamily: 'Inter, sans-serif', marginTop: '2rem', maxWidth: '95vw' }}>
{/* Alerts */}
<div style={{ position: 'fixed', top: '10px', right: '10px', zIndex: 9999 }}>
  {alerts.map(a => (
    <CAlert
      key={a.id}
      color={a.color}
      dismissible
      style={{ fontSize: '16px', padding: '10px 16px', lineHeight: '1.4' }}
    >
      {a.message}
    </CAlert>
  ))}
</div>



      {/* Two cards side by side */}
     <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem' }}>

{/* Card 1: Saved Searches */}
<CCard
  style={{
    flex: 1,
    minHeight: '400px',
    borderRadius: '1px',
    padding: '1.5rem',
    background: '#ffffffff',
  }}
>
  <h5 style={{ marginBottom: '1.5rem', fontSize: '1rem' }}>Saved Searches</h5>
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
    {searches.length > 0 ? searches.map((s, idx) => (
      <div
        key={s.id}  
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.75rem 1rem',
          borderRadius: '1px',
          border: '1px solid #dde6f0ff',
          background: idx % 2 === 0 ? '#e0f2fe' : '#dbeafe',
          fontSize: '0.85 rem', // smaller font for the whole row
        }}
      >
        <div>
          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{s.query}</div>
          <div style={{ fontSize: '0.75rem', color: '#555555ff', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <div>Saved by {s.createdBy} • {s.createdAT}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <TimerReset size={12} color="#0B3D91" /> {/* smaller icon */}
              <span>Frequency: {s.frequency || '-'}</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Trash
            size={14} // smaller icon
            color="red"
            style={{ cursor: 'pointer' }}
            onClick={() => handleDelete(s)}
          />
        </div>
      </div>
    )) : (
      <div style={{ textAlign: 'center', padding: '0.75rem', color: '#555', fontSize: '0.8rem' }}>
        No saved searches found.
      </div>
    )}
  </div>
</CCard>


  {/* Card 2: Statistics */}
<CCard
  style={{
    flex: 1,
    minHeight: '500px',
    borderRadius: '1px',
    padding: '1.5rem',
    background: '#ffffffff',
  }}
>
  <h5 style={{ marginBottom: '1.5rem' }}>Statistics</h5>
  <div style={{ width: '100%', height: '350px' }}>
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={statsData} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
        <CartesianGrid stroke="#e5e5e5" strokeDasharray="1 1" />
        <XAxis dataKey="day" tick={{ fill: "#555", fontSize: 12 }} />
        <YAxis tick={{ fill: "#555", fontSize: 12 }} />
       <Tooltip cursor={false} />

        <Legend />
        {/* Bar for searches */}
<Bar
  dataKey="searches"
  barSize={28}
  radius={[4, 4, 0, 0]}
  fill="#3f71c2ff"
  onMouseEnter={(data, index, e) => {
    e.target.setAttribute('fill', '#6690d6ff'); // your hover color
  }}
  onMouseLeave={(data, index, e) => {
    e.target.setAttribute('fill', '#3f71c2ff'); // original color
  }}
  activeShape={() => null} // disables the grey hover box
/>


        {/* Line for filled */}
        <Line type="monotone" dataKey="filled" stroke="#0B3D91" strokeWidth={2} />
      </BarChart>
    </ResponsiveContainer>
  </div>
</CCard>


</div>






      {/* Modals (Edit/Delete) remain same as previous example */}
      <CModal visible={!!editingSearch} onClose={() => setEditingSearch(null)}>
        <CModalHeader closeButton>Edit Search</CModalHeader>
        <CModalBody>
          {editingSearch && (
            <>
              <CFormInput className="mb-2" label="Query" value={editingSearch.query} readOnly />
              <CFormInput className="mb-2" label="Position" value={position} onChange={e => setPosition(e.target.value)} />
              <CFormInput className="mb-2" label="Experience (years)" value={experience} onChange={e => setExperience(e.target.value)} />
              <div className="mb-3" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CIcon icon={cilCalendar} />
                <CFormSelect value={frequency} onChange={e => setFrequency(e.target.value)}>
                  <option value="" disabled hidden>Frequency</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </CFormSelect>
              </div>
            </>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setEditingSearch(null)}>Cancel</CButton>
          <CButton color="primary" onClick={handleSave}>Save</CButton>
        </CModalFooter>
      </CModal>

     <CModal visible={!!deletingSearch} onClose={() => setDeletingSearch(null)} size="md">
  <CModalHeader closeButton style={{ fontSize: '16px' }}>
    Confirm Delete
  </CModalHeader>
  <CModalBody style={{ fontSize: '14px' }}>
    Are you sure you want to delete this search?
  </CModalBody>
  <CModalFooter>
    <CButton
      color="secondary"
      onClick={() => setDeletingSearch(null)}
      style={{ fontSize: '14px', padding: '6px 12px' }}
    >
      Cancel
    </CButton>
    <CButton
      color="danger"
      onClick={handleConfirmDelete}
      style={{ fontSize: '14px', padding: '6px 12px', color: '#fff' }}
    >
      Delete
    </CButton>
  </CModalFooter>
</CModal>



    </CContainer>
  )
}

export default SavedSearch
