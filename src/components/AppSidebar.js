import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch } from 'react-redux'
import './AppSidebar.css'
import sidebarLogo from 'src/assets/images/side-logo.png'

import CIcon from '@coreui/icons-react'
import { cilChevronLeft, cilChevronRight } from '@coreui/icons'
import { CBadge, CSidebar, CSidebarBrand, CSidebarHeader } from '@coreui/react'

import { AppSidebarNav } from './AppSidebarNav'
import getNavForRole from '../_nav'
import { fetchNotificationsCount } from '../api/api'

const SIDEBAR_OPEN_KEY = 'hrbs_sidebar_open'

const AppSidebar = () => {
  const dispatch = useDispatch()
  const role = localStorage.getItem('role') || 'user'
  const [notificationCount, setNotificationCount] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    try {
      return localStorage.getItem(SIDEBAR_OPEN_KEY) !== 'false'
    } catch {
      return true
    }
  })

  useEffect(() => {
    dispatch({ type: 'set', sidebarShow: sidebarOpen })
    try {
      localStorage.setItem(SIDEBAR_OPEN_KEY, String(sidebarOpen))
    } catch {
      /* ignore */
    }
  }, [dispatch, sidebarOpen])

  useEffect(() => {
    const userId = localStorage.getItem('user_id')
    if (!userId) return

    const load = async () => {
      try {
        const c = await fetchNotificationsCount(userId)
        setNotificationCount(typeof c === 'number' ? c : 0)
      } catch {
        setNotificationCount(0)
      }
    }

    load()
    const interval = setInterval(load, 5000)
    const onRefresh = () => setTimeout(load, 400)
    window.addEventListener('refreshNotifications', onRefresh)
    return () => {
      clearInterval(interval)
      window.removeEventListener('refreshNotifications', onRefresh)
    }
  }, [])

  const userEmail =
    localStorage.getItem('user_email') ||
    (() => {
      try {
        const u = JSON.parse(localStorage.getItem('user') || '{}')
        return u?.email || ''
      } catch {
        return ''
      }
    })()

  const navItems = useMemo(() => {
    const items = getNavForRole(role, userEmail)
    return items.map((item) => {
      if (item.to === '/notifications' && item.name === 'Notifications') {
        return {
          ...item,
          name: (
            <span className="d-inline-flex align-items-center gap-2 flex-wrap">
              <span>Notifications</span>
              {notificationCount > 0 && (
                <CBadge color="danger" className="rounded-pill">
                  {notificationCount > 99 ? '99+' : notificationCount}
                </CBadge>
              )}
            </span>
          ),
        }
      }
      return item
    })
  }, [role, notificationCount, userEmail])

  return (
    <>
      <CSidebar
        className="border-end no-scrollbar app-sidebar-root"
        position="fixed"
        visible={sidebarOpen}
        backdrop="false"
      >
        <button
          type="button"
          className="app-sidebar-collapse-btn"
          onClick={() => setSidebarOpen(false)}
          aria-label="Collapse sidebar"
          title="Collapse sidebar"
        >
          <CIcon icon={cilChevronLeft} className="app-sidebar-toggle-icon" />
        </button>
        <CSidebarHeader className="border-bottom">
          <CSidebarBrand to="/">
            <img
              className="sidebar-brand-full"
              src={sidebarLogo}
              alt="Logo"
            />
          </CSidebarBrand>
        </CSidebarHeader>
        <AppSidebarNav items={navItems} />
      </CSidebar>
      {!sidebarOpen && (
        <button
          type="button"
          className="app-sidebar-expand-tab"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open sidebar"
          title="Open sidebar"
        >
          <CIcon icon={cilChevronRight} className="app-sidebar-toggle-icon" />
        </button>
      )}
    </>
  )
}

export default React.memo(AppSidebar)
