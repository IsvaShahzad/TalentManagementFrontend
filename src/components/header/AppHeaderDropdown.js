import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CAvatar,
  CBadge,
  CDropdown,
  CDropdownDivider,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react'
import {
  cilBell,
  cilSettings,
  cilBriefcase,
  cilChart,
  cilPeople,
  cilExitToApp,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { fetchNotificationsCount, getAllJobs } from '../../api/api'
import { useAuth } from '../../context/AuthContext'

import avatar8 from './../../assets/images/avatars/avatar.png'

const AppHeaderDropdown = () => {
  const navigate = useNavigate()
  const { currentUser, logout } = useAuth()
  const [notificationCount, setNotificationCount] = useState(0)
  const [activeJobsCount, setActiveJobsCount] = useState(0)

  // Get userId from auth context or localStorage
  useEffect(() => {
    const userId = currentUser?.user_id || JSON.parse(localStorage.getItem('user') || '{}')?.user_id
    
    // Fetch notification count
    if (userId) {
      const fetchNotificationCount = async () => {
        try {
          const count = await fetchNotificationsCount(userId)
          setNotificationCount(count || 0)
        } catch (err) {
          console.error('Failed to fetch notification count:', err)
        }
      }
      
      fetchNotificationCount()
      
      // Refresh every 5 seconds
      const interval = setInterval(fetchNotificationCount, 5000)
      
      // Listen for refresh events
      const handleRefresh = () => {
        setTimeout(fetchNotificationCount, 500)
      }
      window.addEventListener('refreshNotifications', handleRefresh)
      
      return () => {
        clearInterval(interval)
        window.removeEventListener('refreshNotifications', handleRefresh)
      }
    }
  }, [currentUser])

  // Fetch active jobs count
  useEffect(() => {
    const fetchActiveJobsCount = async () => {
      try {
        const jobs = await getAllJobs()
        const activeJobs = Array.isArray(jobs) 
          ? jobs.filter(job => job.status === 'Open' || job.status === 'Active').length
          : 0
        setActiveJobsCount(activeJobs)
      } catch (err) {
        console.error('Failed to fetch active jobs count:', err)
      }
    }
    
    fetchActiveJobsCount()
    
    // Refresh every 10 seconds
    const interval = setInterval(fetchActiveJobsCount, 10000)
    
    // Listen for job status change events
    const handleJobStatusChange = () => {
      setTimeout(fetchActiveJobsCount, 500) // Small delay to ensure backend has processed
    }
    window.addEventListener('jobStatusChanged', handleJobStatusChange)
    window.addEventListener('refreshActiveJobs', handleJobStatusChange)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('jobStatusChanged', handleJobStatusChange)
      window.removeEventListener('refreshActiveJobs', handleJobStatusChange)
    }
  }, [])

  return (
    <CDropdown variant="nav-item">
      <CDropdownToggle
        placement="bottom-end"
        className="py-0 pe-0"
        caret={false}
      >
        <CAvatar
          src={avatar8}
          size="sm"
          style={{ marginTop: '2px' }} // move avatar slightly down
        />
      </CDropdownToggle>

      <CDropdownMenu
        className="pt-0"
        placement="bottom-end"
        style={{ fontSize: '0.85rem', minWidth: '200px' }}
      >
        <CDropdownHeader
          className="bg-body-secondary fw-semibold mb-2"
          style={{ fontSize: '0.75rem', padding: '8px 12px' }}
        >
          Menu
        </CDropdownHeader>

        <CDropdownItem 
          onClick={() => navigate('/notifications')}
          style={{ fontSize: '0.85rem', padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <CIcon icon={cilBell} className="me-2" size="sm" />
            Notifications
          </div>
          {notificationCount > 0 && (
            <CBadge 
              color="danger" 
              style={{ 
                borderRadius: '50%', 
                width: '20px', 
                height: '20px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '0.7rem',
                padding: 0,
                minWidth: '20px'
              }}
            >
              {notificationCount > 99 ? '99+' : notificationCount}
            </CBadge>
          )}
        </CDropdownItem>

        <CDropdownItem 
          onClick={() => navigate('/jobs')}
          style={{ fontSize: '0.85rem', padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <CIcon icon={cilBriefcase} className="me-2" size="sm" />
            Active Jobs
          </div>
          {activeJobsCount > 0 && (
            <CBadge 
              color="info" 
              style={{ 
                borderRadius: '50%', 
                width: '20px', 
                height: '20px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '0.7rem',
                padding: 0,
                minWidth: '20px'
              }}
            >
              {activeJobsCount > 99 ? '99+' : activeJobsCount}
            </CBadge>
          )}
        </CDropdownItem>

        <CDropdownDivider />

        <CDropdownHeader
          className="bg-body-secondary fw-semibold my-2"
          style={{ fontSize: '0.75rem', padding: '8px 12px' }}
        >
          Account
        </CDropdownHeader>

        <CDropdownItem 
          onClick={() => navigate('/settings')}
          style={{ fontSize: '0.85rem', padding: '8px 12px', cursor: 'pointer' }}
        >
          <CIcon icon={cilSettings} className="me-2" size="sm" />
          Settings
        </CDropdownItem>

        <CDropdownItem 
          onClick={() => navigate('/stats-overview')}
          style={{ fontSize: '0.85rem', padding: '8px 12px', cursor: 'pointer' }}
        >
          <CIcon icon={cilChart} className="me-2" size="sm" />
          Stats
        </CDropdownItem>

        <CDropdownItem 
          onClick={() => navigate('/all-candidates')}
          style={{ fontSize: '0.85rem', padding: '8px 12px', cursor: 'pointer' }}
        >
          <CIcon icon={cilPeople} className="me-2" size="sm" />
          All Jobs
        </CDropdownItem>

        <CDropdownDivider />

        <CDropdownItem 
          onClick={() => {
            logout()
            navigate('/login')
          }}
          style={{ fontSize: '0.85rem', padding: '8px 12px', cursor: 'pointer', color: '#dc3545' }}
        >
          <CIcon icon={cilExitToApp} className="me-2" size="sm" />
          Logout
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

export default AppHeaderDropdown
