import React, { useEffect, useMemo, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import './AppSidebar.css'
import sidebarLogo from 'src/assets/images/side-logo.png'



import {
  CBadge,
  CCloseButton,
  CSidebar,
  CSidebarBrand,
  CSidebarFooter,
  CSidebarHeader,
  CSidebarToggler,
} from '@coreui/react'

import { AppSidebarNav } from './AppSidebarNav'



// sidebar nav config
import getNavForRole from '../_nav'
import { fetchNotificationsCount } from '../api/api'

const AppSidebar = () => {
  const dispatch = useDispatch()
  const unfoldable = useSelector((state) => state.sidebarUnfoldable)
  const sidebarShow = useSelector((state) => state.sidebarShow)
  const role = localStorage.getItem('role') || 'user' // default to 'user'
  const [notificationCount, setNotificationCount] = useState(0)

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

  const navItems = useMemo(() => {
    const items = getNavForRole(role)
    return items.map((item) => {
      if (item.to === '/notifications' && item.name === 'Notifications') {
        return {
          ...item,
          name: (
            <span className="d-inline-flex align-items-center gap-2 flex-wrap">
              {notificationCount > 0 && (
                <CBadge color="danger" className="rounded-pill">
                  {notificationCount > 99 ? '99+' : notificationCount}
                </CBadge>
              )}
              <span>Notifications</span>
            </span>
          ),
        }
      }
      return item
    })
  }, [role, notificationCount])

  return (
    <CSidebar
      className="border-end no-scrollbar"
      position="fixed"
      unfoldable={unfoldable}
      visible={sidebarShow}
      backdrop="false"  // <--- add this line
      onVisibleChange={(visible) => {
        dispatch({ type: 'set', sidebarShow: visible })
      }}
    >

      <CSidebarHeader className="border-bottom">
        <CSidebarBrand to="/">
          <img
            className="sidebar-brand-full"
            src={sidebarLogo}
            alt="Logo"
          />
          <img
            className="sidebar-brand-narrow"
            src={sidebarLogo}
            alt="Logo"
          />
        </CSidebarBrand>

        <CCloseButton
          className="d-lg-none"
          dark
          onClick={() => dispatch({ type: 'set', sidebarShow: false })}
        />
      </CSidebarHeader>
      <AppSidebarNav items={navItems} />
      <CSidebarFooter className="border-top d-none d-lg-flex">
        <CSidebarToggler
          onClick={() => dispatch({ type: 'set', sidebarUnfoldable: !unfoldable })}
        />
      </CSidebarFooter>
    </CSidebar>
  )
}

export default React.memo(AppSidebar)
