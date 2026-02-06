// import React, { useState, useEffect } from 'react'
// import {
//   CContainer, CCard, CCardBody,
//   CButton, CAlert
// } from '@coreui/react'
// import CIcon from '@coreui/icons-react'
// import { cilCheckCircle, cilSearch, cilAlarm } from '@coreui/icons'
// import { deleteAllNotifications, deleteNotificationApi, getAllNotifications } from '../../../api/api'

// import { useLocation } from 'react-router-dom'

// const refreshPage = () => {
//   window.location.reload();
// };


// const Notifications = () => {
//   const [alerts, setAlerts] = useState([])
//   const [notifications, setNotifications] = useState([])
//   const Location = useLocation()
//   const showAlert = (message, color = 'success') => {
//     const id = new Date().getTime()
//     setAlerts(prev => [...prev, { id, message, color }])
//     setTimeout(() => {
//       setAlerts(prev => prev.filter(a => a.id !== id))
//     }, 2000)
//   }

//   const handleMarkRead = async (notification) => {
//     if (!notification?.id) return
//     try {
//       await deleteNotificationApi(notification.id)
//       window.dispatchEvent(new Event("notifications-read"));
//       setNotifications(prev => prev.filter(n => n.id !== notification.id))
//       fetchNotifications()
//       showAlert('Notification marked as read', 'success')
//       // refreshPage()
//     } catch (err) {
//       console.error('Failed to mark notification as read:', err)
//       showAlert('Failed to mark notification as read', 'danger')
//     }
//   }

//   const handleMarkAllRead = async () => {
//     try {
//       /* for (let n of notifications) {
//          await deleteNotificationApi(n.id)
//        }*/
//       await deleteAllNotifications()
//       setNotifications([])
//       showAlert('All notifications marked as read', 'success')
//       fetchNotifications()
//       // refreshPage()
//     } catch (err) {
//       console.error('Failed to mark all notifications as read:', err)
//       showAlert('Failed to mark all notifications as read', 'danger')
//     }
//   }

//   const fetchNotifications = async () => {
//     const userObj = localStorage.getItem('user')
//     if (!userObj) return showAlert('User not logged in', 'danger')

//     const user = JSON.parse(userObj)
//     const userId = user.user_id
//     if (!userId) return showAlert('User not logged in', 'danger')

//     try {
//       const response = await getAllNotifications(userId)
//       const formatted = response?.notifications?.map(n => ({
//         id: n.notification_id,
//         message: n.message,
//         createdAt: new Date(n.createdAT).toLocaleDateString(),
//         type: n.source || 'normal', // 'saved' | 'reminder' | normal
//       })) || []
//       setNotifications(formatted)
//     } catch (err) {
//       console.error('Failed to fetch notifications:', err)
//     }
//   }

//   useEffect(() => {
//     fetchNotifications()
//     const interval = setInterval(fetchNotifications, 2000)
//     return () => clearInterval(interval)
//   }, [Location.pathname])

//   const colors = [
//     'rgba(22,163,74,0.15)',
//     // 'rgba(59,130,246,0.15)',
//     // 'rgba(234,179,8,0.15)',
//     // 'rgba(236,72,153,0.15)',
//     // 'rgba(168,85,247,0.15)',
//     // 'rgba(16,185,129,0.15)'
//   ]

//   const getIcon = (type) => {
//     if (type === 'saved') return cilSearch
//     if (type === 'reminder') return cilAlarm
//     return cilCheckCircle
//   }

//   const unreadCount = notifications.length

//   return (
//     <CContainer style={{ fontFamily: 'Inter, sans-serif', marginTop: '2rem', maxWidth: '95vw' }}>
//       {/* Alerts */}
//       <div style={{ position: 'fixed', top: '10px', right: '10px', zIndex: 9999 }}>
//         {alerts.map(alert => (
//           <CAlert key={alert.id} color={alert.color} dismissible>
//             {alert.message}
//           </CAlert>
//         ))}
//       </div>

//       {/* Heading row with button */}
//       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.1 rem' }}>
//         <h5 style={{ fontWeight: 550, fontSize: '1rem', margin: 0 }}>Notifications</h5>
//         {notifications.length > 0 && (
//           <CButton
//             onClick={handleMarkAllRead}
//             style={{
//               backgroundColor: 'rgba(22,163,74,0.15)',
//               color: '#16a34a',
//               border: '0px solid #16a34a',
//               borderRadius: '4px',
//               fontWeight: 400,
//               padding: '6px 12px',
//               cursor: 'pointer',
//               fontSize: '0.8rem'
//             }}
//           >
//             Mark all as read
//           </CButton>
//         )}
//       </div>

//       {/* Unread count text */}
//       {unreadCount >= 0 && (
//         <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '2rem' }}>
//           You’ve {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
//         </div>
//       )}

//       {/* Notification list */}
//       <CCard className="shadow-sm border-0" style={{ background: '#ffffff', padding: '1rem', borderRadius: '0px' }}>
//         <CCardBody style={{ padding: 0 }}>
//           {notifications.length > 0 ? notifications.map((n, index) => (
//     <div
//   key={n.id}
//   style={{
//     background: colors[index % colors.length],
//     padding: '14px',
//     marginBottom: '12px',
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     borderRadius: '0px',
//     border: '1px solid rgba(0,0,0,0.05)',
//     fontSize: '0.9rem',
//     cursor: 'pointer',
//     transition: 'background-color 0.2s'
//   }}
//   onMouseEnter={e => e.currentTarget.style.backgroundColor = colors[index % colors.length].replace('0.15', '0.25')}
//   onMouseLeave={e => e.currentTarget.style.backgroundColor = colors[index % colors.length]}
// >
//   {/* Left icon + message + date */}
//   <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
//     <CIcon icon={getIcon(n.type)} size="lg" style={{ color: '#16a34a' }} />
//     <div>
//       <div style={{ fontWeight: 500 }}>{n.message}</div>
//       <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '2px' }}>{n.createdAt}</div>
//     </div>
//   </div>

// {/* Right side: system time + tick */}
// <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 'fit-content' }}>
//   <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
//     {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} {/* current system time */}
//   </div>
//   <CIcon
//     icon={cilCheckCircle}
//     size="lg"
//     style={{ color: '#16a34a', cursor: 'pointer' }}
//     onClick={() => handleMarkRead(n)}
//   />
// </div>




// </div>


//           )) : (
//             <p className="text-center text-muted py-4">No notifications found.</p>
//           )}
//         </CCardBody>
//       </CCard>
//     </CContainer>
//   )
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
import { useContext } from 'react';
import SocketContext from '../../../context/SocketContext';

const refreshPage = () => {
  window.location.reload();
};

const Notifications = () => {

  const { socket } = useContext(SocketContext); // get the socket instance
  const [alerts, setAlerts] = useState([])
  const [notifications, setNotifications] = useState([])
  const Location = useLocation()
  
  // Check if notifications are enabled from user object
  const getUserNotificationsEnabled = () => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.notifications_enabled !== undefined ? user.notifications_enabled : true;
      }
    } catch {
      return true; // default to enabled
    }
    return true; // default to enabled
  };
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(getUserNotificationsEnabled());
  
  // Listen for user updates to refresh notification preference
  useEffect(() => {
    const handleStorageChange = () => {
      setNotificationsEnabled(getUserNotificationsEnabled());
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userUpdated', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userUpdated', handleStorageChange);
    };
  }, []);
  const showAlert = (message, color = 'success') => {
    const id = new Date().getTime()
    setAlerts(prev => [...prev, { id, message, color }])
    setTimeout(() => {
      setAlerts(prev => prev.filter(a => a.id !== id))
    }, 2000)
  }

  const handleMarkRead = async (notification) => {
    if (!notification?.id) return
    try {
      await deleteNotificationApi(notification.id)
      window.dispatchEvent(new Event("notifications-read"));
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

  // useEffect(() => {
  //   fetchNotifications()
  //   const interval = setInterval(fetchNotifications, 2000)
  //   return () => clearInterval(interval)
  // }, [Location.pathname])
  useEffect(() => {
    if (!notificationsEnabled) {
      // If notifications disabled, don't fetch or listen
      return;
    }
    
    fetchNotifications(); // initial fetch

    if (!socket) return;

    // Listen for new notifications (only if enabled)
    socket.on("new-notification", (notif) => {
      if (!notificationsEnabled) return; // Double check preference
      setNotifications(prev => [
        {
          id: notif.notification_id,
          message: notif.message,
          createdAt: new Date(notif.createdAT).toLocaleDateString(),
          type: notif.source || 'normal'
        },
        ...prev
      ]);
      showAlert('New notification received', 'success');
    });

    // Listen for updated unread count (optional)
    socket.on("notification-count", ({ count }) => {
      if (!notificationsEnabled) return; // Double check preference
      console.log("Unread notifications count:", count);
    });

    return () => {
      socket.off("new-notification");
      socket.off("notification-count");
    };
  }, [socket, Location.pathname, notificationsEnabled]);

  const colors = [
    'rgba(22,163,74,0.15)',
    // 'rgba(59,130,246,0.15)',
    // 'rgba(234,179,8,0.15)',
    // 'rgba(236,72,153,0.15)',
    // 'rgba(168,85,247,0.15)',
    // 'rgba(16,185,129,0.15)'
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
              {/* Left icon + message + date */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                <CIcon icon={getIcon(n.type)} size="lg" style={{ color: '#16a34a' }} />
                <div>
                  <div style={{ fontWeight: 500 }}>{n.message}</div>
                  <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '2px' }}>{n.createdAt}</div>
                </div>
              </div>

              {/* Right side: system time + tick */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 'fit-content' }}>
                <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} {/* current system time */}
                </div>
                <CIcon
                  icon={cilCheckCircle}
                  size="lg"
                  style={{ color: '#16a34a', cursor: 'pointer' }}
                  onClick={() => handleMarkRead(n)}
                />
              </div>




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
