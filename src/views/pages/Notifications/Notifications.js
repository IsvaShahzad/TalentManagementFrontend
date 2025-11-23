import React, { useState, useEffect } from 'react'
import {
    CContainer, CCard, CCardBody,
    CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell,
    CFormInput, CButton, CAlert, CModal, CModalHeader, CModalBody, CModalFooter, CFormSelect
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCheckCircle } from '@coreui/icons'
import { deleteNotificationApi, getAllNotifications } from '../../../api/api'


const Notifications = () => {


    const [query, setQuery] = useState('')
    const [frequency, setFrequency] = useState('')
    const [createdAT, setCeatedAt] = useState('')
    const [createdBy, setCeatedBy] = useState('')
    //  const [location, setLocation] = useState('')
    // const [experience, setExperience] = useState('')
    //const [position, setPosition] = useState('')
    //const [resume, setResume] = useState(null)



    const [userId, setUserId] = useState('')
    const [filteredNotifications, setFilteredNotifications] = useState([])
    const [searchQuery, setSearchQuery] = useState('')
    const [alerts, setAlerts] = useState([])
    const [deletingSearch, setDeletingSearch] = useState(null)
    const [notifications, setNotifications] = useState([])


    // 🔹 Show alert
    const showAlert = (message, color = 'success') => {
        const id = new Date().getTime()
        setAlerts(prev => [...prev, { id, message, color }])
        setTimeout(() => {
            setAlerts(prev => prev.filter(a => a.id !== id))
        }, 3000)
    }


    // Confirm delete
    const handleDelete = async (notification) => {
        if (!notification?.id) return
        try {
            await deleteNotificationApi(notification.id) // 🔹 API call
            setNotifications(prev => prev.filter(n => n.id !== notification.id)) // remove instantly
            showAlert('Notification marked as read', 'success')
        } catch (err) {
            console.error('Failed to delete notification:', err)
            showAlert('Failed to delete notification', 'danger')
        }
    }




    //Fetch notifications
    const fetchNotifications = async () => {


        // Get the JSON string from localStorage
        const userObj = localStorage.getItem('user');

        // Parse the JSON string to an object
        const user = JSON.parse(userObj);

        // Access the user_id
        const userId = user.user_id;
        setUserId(userId)
        // console.log(userId); // "052b0418-62df-4438-933d-eb1a45401ff2"

        console.log("user id from local storage", userId)
        //userId = await getUserID() //use jwt
        if (!userId) {
            showAlert('User not logged in', 'danger')
            return
        }

        try {

            console.log("userid to fetch notifications for to display ", userId)
            const response = await getAllNotifications(userId)
            console.log("notifications", response)

            if (response?.notifications?.length > 0) {
                const formatted = response.notifications.map(n => ({
                    id: n.notification_id,
                    message: n.message,
                    createdAt: new Date(n.createdAT).toLocaleString(),
                    isRead: n.isRead,
                }))
                setNotifications(formatted)
            } else {
                setNotifications([])
            }
        } catch (err) {
            console.error('Failed to fetch notifications:', err)
        }
    }

    useEffect(() => {
        fetchNotifications(); // fetch initially

        // ✅ Optional: auto-refresh every 5 seconds
        const interval = setInterval(() => {
            fetchNotifications();
        }, 5000);

        return () => clearInterval(interval); // cleanup on unmount
    }, []);



    return (
        <CContainer
            style={{
                fontFamily: 'Inter, sans-serif',
                marginTop: '2rem',
                maxWidth: '95vw',
            }}
        >
            <h3
                style={{
                    fontWeight: 550,
                    marginBottom: '1.5rem',
                    textAlign: 'center', // ✅ centers the heading
                }}
            >
                Notifications
            </h3>

            {/* Alerts */}
            <div style={{ position: 'fixed', top: '10px', right: '10px', zIndex: 9999 }}>
                {alerts.map(alert => <CAlert key={alert.id} color={alert.color} dismissible>{alert.message}</CAlert>)}
            </div>

            <CCard className="shadow-sm border-0 rounded-4" style={{ background: '#ffffff', padding: '2rem 1rem' }}>
                <CCardBody style={{ padding: 0 }}>


                    {/* Search Table */}
                    <CTable
                        responsive
                        className="align-middle"
                        style={{
                            width: '100%',
                            borderCollapse: 'separate',
                            borderSpacing: '0 0.5rem',
                            fontSize: '1rem',
                            tableLayout: 'auto',
                        }}
                    >
                        <CTableHead>
                            <CTableRow>
                                {['Message', 'Date Added', 'Read'].map(header => (
                                    <CTableHeaderCell
                                        key={header}
                                        style={{ fontWeight: 600, border: 'none', fontSize: '1rem' }}
                                    >
                                        {header}
                                    </CTableHeaderCell>
                                ))}
                            </CTableRow>
                        </CTableHead>

                        <CTableBody>
                            {notifications.length > 0 ? (
                                notifications.map(n => (
                                    <CTableRow
                                        key={n.id}
                                        style={{
                                            backgroundColor: '#fff',
                                            boxShadow: '0 2px 6px rgba(0,0,0,0.11)',
                                            borderRadius: '0.5rem',
                                        }}
                                    >
                                    <CTableDataCell style={{ padding: '0.75rem', fontSize: '0.9rem' }}>{n.message}</CTableDataCell>
<CTableDataCell style={{ padding: '0.75rem', fontSize: '0.85rem' }}>
  <span
    style={{
      background: '#e3efff',
      color: '#326396',
      padding: '3px 8px',
      borderRadius: '20px',
      fontSize: '0.75rem',
    }}
  >
    {n.createdAt}
  </span>
</CTableDataCell>









                                        <CTableDataCell style={{ border: 'none', padding: '0.5rem' }}>
  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'transparent',
    }}
  >
    <CIcon
      icon={cilCheckCircle}
      size="lg" // smaller icon
      style={{
        color: '#16a34a', // bright green
        cursor: 'pointer',
        transition: 'transform 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.1) translateY(-2px)'; // subtle grow
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1) translateY(0)';
      }}
      onClick={() => handleDelete(n)}
    />
  </div>
</CTableDataCell>



                                    </CTableRow>
                                ))
                            ) : (
                                <CTableRow>
                                    <CTableDataCell colSpan="3" className="text-center text-muted" style={{ padding: '1rem' }}>
                                        No notifications found.
                                    </CTableDataCell>
                                </CTableRow>
                            )}
                        </CTableBody>
                    </CTable>

                </CCardBody>
            </CCard>

            {/* Handle Tick: when tick is pressed the notification disappears m
            make a new field in the table for this and this will delete the notification frm
            the table  */}



        </CContainer>
    )
}


export default Notifications
