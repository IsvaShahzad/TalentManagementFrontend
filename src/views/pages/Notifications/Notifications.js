// import React, { useState, useEffect } from 'react'
// import {
//     CContainer, CCard, CCardBody,
//     CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell,
//     CFormInput, CButton, CAlert, CModal, CModalHeader, CModalBody, CModalFooter, CFormSelect
// } from '@coreui/react'
// import CIcon from '@coreui/icons-react'
// import { cilCheckCircle } from '@coreui/icons'
// import { deleteNotificationApi, getAllNotifications } from '../../../api/api'


// const Notifications = () => {


//     const [query, setQuery] = useState('')
//     const [frequency, setFrequency] = useState('')
//     const [createdAT, setCeatedAt] = useState('')
//     const [createdBy, setCeatedBy] = useState('')
//     //  const [location, setLocation] = useState('')
//     // const [experience, setExperience] = useState('')
//     //const [position, setPosition] = useState('')
//     //const [resume, setResume] = useState(null)



//     const [userId, setUserId] = useState('')
//     const [filteredNotifications, setFilteredNotifications] = useState([])
//     const [searchQuery, setSearchQuery] = useState('')
//     const [alerts, setAlerts] = useState([])
//     const [deletingSearch, setDeletingSearch] = useState(null)
//     const [notifications, setNotifications] = useState([])


//     // 🔹 Show alert
//     const showAlert = (message, color = 'success') => {
//         const id = new Date().getTime()
//         setAlerts(prev => [...prev, { id, message, color }])
//         setTimeout(() => {
//             setAlerts(prev => prev.filter(a => a.id !== id))
//         }, 3000)
//     }


//     // Confirm delete
//     const handleDelete = async (notification) => {
//         if (!notification?.id) return
//         try {
//             await deleteNotificationApi(notification.id) // 🔹 API call
//             setNotifications(prev => prev.filter(n => n.id !== notification.id)) // remove instantly
//             showAlert('Notification marked as read', 'success')
//         } catch (err) {
//             console.error('Failed to delete notification:', err)
//             showAlert('Failed to delete notification', 'danger')
//         }
//     }




//     //Fetch notifications
//     const fetchNotifications = async () => {


//         // Get the JSON string from localStorage
//         const userObj = localStorage.getItem('user');

//         // Parse the JSON string to an object
//         const user = JSON.parse(userObj);

//         // Access the user_id
//         const userId = user.user_id;
//         setUserId(userId)
//         // console.log(userId); // "052b0418-62df-4438-933d-eb1a45401ff2"

//         console.log("user id from local storage", userId)
//         //userId = await getUserID() //use jwt
//         if (!userId) {
//             showAlert('User not logged in', 'danger')
//             return
//         }

//         try {

//             console.log("userid to fetch notifications for to display ", userId)
//             const response = await getAllNotifications(userId)
//             console.log("notifications", response)

//             if (response?.notifications?.length > 0) {
//                 const formatted = response.notifications.map(n => ({
//                     id: n.notification_id,
//                     message: n.message,
//                     createdAt: new Date(n.createdAT).toLocaleString(),
//                     isRead: n.isRead,
//                 }))
//                 setNotifications(formatted)
//             } else {
//                 setNotifications([])
//             }
//         } catch (err) {
//             console.error('Failed to fetch notifications:', err)
//         }
//     }

//     useEffect(() => {
//         fetchNotifications(); // fetch initially

//         // ✅ Optional: auto-refresh every 5 seconds
//         const interval = setInterval(() => {
//             fetchNotifications();
//         }, 5000);

//         return () => clearInterval(interval); // cleanup on unmount
//     }, []);



//     return (
//         <CContainer
//             style={{
//                 fontFamily: 'Inter, sans-serif',
//                 marginTop: '2rem',
//                 maxWidth: '95vw',
//             }}
//         >
//             <h3
//                 style={{
//                     fontWeight: 550,
//                     marginBottom: '1.5rem',
//                     textAlign: 'center', // ✅ centers the heading
//                 }}
//             >
//                 Notifications
//             </h3>

//             {/* Alerts */}
//             <div style={{ position: 'fixed', top: '10px', right: '10px', zIndex: 9999 }}>
//                 {alerts.map(alert => <CAlert key={alert.id} color={alert.color} dismissible>{alert.message}</CAlert>)}
//             </div>

//             <CCard className="shadow-sm border-0 rounded-4" style={{ background: '#ffffff', padding: '2rem 1rem' }}>
//                 <CCardBody style={{ padding: 0 }}>


//                     {/* Search Table */}
//                     <CTable
//                         responsive
//                         className="align-middle"
//                         style={{
//                             width: '100%',
//                             borderCollapse: 'separate',
//                             borderSpacing: '0 0.5rem',
//                             fontSize: '1rem',
//                             tableLayout: 'auto',
//                         }}
//                     >
//                         <CTableHead>
//                             <CTableRow>
//                                 {['Message', 'Date Added', 'Read'].map(header => (
//                                     <CTableHeaderCell
//                                         key={header}
//                                         style={{ fontWeight: 600, border: 'none', fontSize: '1rem' }}
//                                     >
//                                         {header}
//                                     </CTableHeaderCell>
//                                 ))}
//                             </CTableRow>
//                         </CTableHead>

//                         <CTableBody>
//                             {notifications.length > 0 ? (
//                                 notifications.map(n => (
//                                     <CTableRow
//                                         key={n.id}
//                                         style={{
//                                             backgroundColor: '#fff',
//                                             boxShadow: '0 2px 6px rgba(0,0,0,0.11)',
//                                             borderRadius: '0.5rem',
//                                         }}
//                                     >
//                                     <CTableDataCell style={{ padding: '0.75rem', fontSize: '0.9rem' }}>{n.message}</CTableDataCell>
// <CTableDataCell style={{ padding: '0.75rem', fontSize: '0.85rem' }}>
//   <span
//     style={{
//       background: '#e3efff',
//       color: '#326396',
//       padding: '3px 8px',
//       borderRadius: '20px',
//       fontSize: '0.75rem',
//     }}
//   >
//     {n.createdAt}
//   </span>
// </CTableDataCell>









//                                         <CTableDataCell style={{ border: 'none', padding: '0.5rem' }}>
//   <div
//     style={{
//       display: 'flex',
//       justifyContent: 'center',
//       alignItems: 'center',
//       backgroundColor: 'transparent',
//     }}
//   >
//     <CIcon
//       icon={cilCheckCircle}
//       size="lg" // smaller icon
//       style={{
//         color: '#16a34a', // bright green
//         cursor: 'pointer',
//         transition: 'transform 0.2s ease',
//       }}
//       onMouseEnter={(e) => {
//         e.currentTarget.style.transform = 'scale(1.1) translateY(-2px)'; // subtle grow
//       }}
//       onMouseLeave={(e) => {
//         e.currentTarget.style.transform = 'scale(1) translateY(0)';
//       }}
//       onClick={() => handleDelete(n)}
//     />
//   </div>
// </CTableDataCell>



//                                     </CTableRow>
//                                 ))
//                             ) : (
//                                 <CTableRow>
//                                     <CTableDataCell colSpan="3" className="text-center text-muted" style={{ padding: '1rem' }}>
//                                         No notifications found.
//                                     </CTableDataCell>
//                                 </CTableRow>
//                             )}
//                         </CTableBody>
//                     </CTable>

//                 </CCardBody>
//             </CCard>

//             {/* Handle Tick: when tick is pressed the notification disappears m
//             make a new field in the table for this and this will delete the notification frm
//             the table  */}



//         </CContainer>
//     )
// }


// export default Notifications


import React, { useState, useEffect } from 'react'
import {
  CContainer, CCard, CCardBody,
  CButton, CAlert
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCheckCircle, cilSearch, cilAlarm } from '@coreui/icons'
import { deleteAllNotifications, deleteNotificationApi, getAllNotifications } from '../../../api/api'

import { useLocation } from 'react-router-dom'

const refreshPage = () => {
  window.location.reload();
};


const Notifications = () => {
  const [alerts, setAlerts] = useState([])
  const [notifications, setNotifications] = useState([])
  const Location = useLocation()
  const showAlert = (message, color = 'success') => {
    const id = new Date().getTime()
    setAlerts(prev => [...prev, { id, message, color }])
    setTimeout(() => {
      setAlerts(prev => prev.filter(a => a.id !== id))
    }, 3000)
  }

  const handleMarkRead = async (notification) => {
    if (!notification?.id) return
    try {
      await deleteNotificationApi(notification.id)
      setNotifications(prev => prev.filter(n => n.id !== notification.id))
      fetchNotifications()
      showAlert('Notification marked as read', 'success')
      // refreshPage()
    } catch (err) {
      console.error('Failed to mark notification as read:', err)
      showAlert('Failed to mark notification as read', 'danger')
    }
  }

  const handleMarkAllRead = async () => {
    try {
      /* for (let n of notifications) {
         await deleteNotificationApi(n.id)
       }*/
      await deleteAllNotifications()
      setNotifications([])
      showAlert('All notifications marked as read', 'success')
      fetchNotifications()
      // refreshPage()
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err)
      showAlert('Failed to mark all notifications as read', 'danger')
    }
  }

  const fetchNotifications = async () => {
    const userObj = localStorage.getItem('user')
    if (!userObj) return showAlert('User not logged in', 'danger')

    const user = JSON.parse(userObj)
    const userId = user.user_id
    if (!userId) return showAlert('User not logged in', 'danger')

    try {
      const response = await getAllNotifications(userId)
      const formatted = response?.notifications?.map(n => ({
        id: n.notification_id,
        message: n.message,
        createdAt: new Date(n.createdAT).toLocaleDateString(),
        type: n.source || 'normal', // 'saved' | 'reminder' | normal
      })) || []
      setNotifications(formatted)
    } catch (err) {
      console.error('Failed to fetch notifications:', err)
    }
  }

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 2000)
    return () => clearInterval(interval)
  }, [Location.pathname])

  const colors = [
    'rgba(22,163,74,0.15)',
    'rgba(59,130,246,0.15)',
    'rgba(234,179,8,0.15)',
    'rgba(236,72,153,0.15)',
    'rgba(168,85,247,0.15)',
    'rgba(16,185,129,0.15)'
  ]

  const getIcon = (type) => {
    if (type === 'saved') return cilSearch
    if (type === 'reminder') return cilAlarm
    return cilCheckCircle
  }

  const unreadCount = notifications.length

  return (
    <CContainer style={{ fontFamily: 'Inter, sans-serif', marginTop: '2rem', maxWidth: '95vw' }}>
      {/* Alerts */}
      <div style={{ position: 'fixed', top: '10px', right: '10px', zIndex: 9999 }}>
        {alerts.map(alert => (
          <CAlert key={alert.id} color={alert.color} dismissible>
            {alert.message}
          </CAlert>
        ))}
      </div>

      {/* Heading row with button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.1 rem' }}>
        <h5 style={{ fontWeight: 550, fontSize: '1rem', margin: 0 }}>Notifications</h5>
        {notifications.length > 0 && (
          <CButton
            onClick={handleMarkAllRead}
            style={{
              backgroundColor: 'rgba(22,163,74,0.15)',
              color: '#16a34a',
              border: '0px solid #16a34a',
              borderRadius: '4px',
              fontWeight: 400,
              padding: '6px 12px',
              cursor: 'pointer',
              fontSize: '0.8rem'
            }}
          >
            Mark all as read
          </CButton>
        )}
      </div>

      {/* Unread count text */}
      {unreadCount >= 0 && (
        <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '2rem' }}>
          You’ve {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
        </div>
      )}

      {/* Notification list */}
      <CCard className="shadow-sm border-0" style={{ background: '#ffffff', padding: '1rem', borderRadius: '0px' }}>
        <CCardBody style={{ padding: 0 }}>
          {notifications.length > 0 ? notifications.map((n, index) => (
            <div
              key={n.id}
              style={{
                background: colors[index % colors.length],
                padding: '14px',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderRadius: '0px',
                border: '1px solid rgba(0,0,0,0.05)',
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = colors[index % colors.length].replace('0.15', '0.25')}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = colors[index % colors.length]}
            >
              {/* Left icon + message */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CIcon icon={getIcon(n.type)} size="lg" style={{ color: '#16a34a' }} />
                <div>
                  <div style={{ fontWeight: 500 }}>{n.message}</div>
                  <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '2px' }}>{n.createdAt}</div>
                </div>
              </div>

              {/* Tick icon */}
              <CIcon
                icon={cilCheckCircle}
                size="lg"
                style={{ color: '#16a34a', cursor: 'pointer' }}
                onClick={() => handleMarkRead(n)}
              />
            </div>
          )) : (
            <p className="text-center text-muted py-4">No notifications found.</p>
          )}
        </CCardBody>
      </CCard>
    </CContainer>
  )
}

export default Notifications