import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch } from 'react-redux'
import './AppSidebar.css'
import sidebarLogo from 'src/assets/images/side-logo.png'

import { CBadge, CSidebar, CSidebarBrand, CSidebarHeader } from '@coreui/react'

import { AppSidebarNav } from './AppSidebarNav'
import getNavForRole from '../_nav'
import { fetchNotificationsCount } from '../api/api'

const AppSidebar = () => {
  const dispatch = useDispatch()
  const role = localStorage.getItem('role') || 'user'
  const [notificationCount, setNotificationCount] = useState(0)

  useEffect(() => {
    dispatch({ type: 'set', sidebarShow: true })
  }, [dispatch])

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
    <CSidebar
      className="border-end no-scrollbar"
      position="fixed"
      visible
      backdrop="false"
    >
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
  )
}

export default React.memo(AppSidebar)
