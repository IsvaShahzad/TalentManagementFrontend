import React, { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  CContainer,
  CHeader,
  CHeaderNav,
  CHeaderToggler,
  CNavItem,
  CNavLink,
  useColorModes,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilMenu } from '@coreui/icons'

import routes from '../routes'
import { AppHeaderDropdown } from './index'
import NotificationBell from '../views/pages/Notifications/NotificationBell'
import { useAuth } from '../context/AuthContext'
import './AppHeader.css'

const AppHeader = () => {
  const headerRef = useRef()
  const { colorMode } = useColorModes('coreui-free-react-admin-template-theme')
  const { currentUser } = useAuth()
  const [userId, setUserId] = useState('')
  const [userRole, setUserRole] = useState('')
  const dispatch = useDispatch()
  const sidebarShow = useSelector((state) => state.sidebarShow)

  const location = useLocation()
  const pathname = location.pathname || '/dashboard'

  // Build breadcrumb path: Home / PageName
  const getPathLabel = (path) => {
    if (path === '/' || path === '') return 'Home'
    const route = routes.find((r) => r.path === path)
    return route?.name || path.slice(1).replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  }
  const pathSegments = pathname.split('/').filter(Boolean)
  const breadcrumbParts = ['Home', ...pathSegments.map((segment, i) => {
    const fullPath = '/' + pathSegments.slice(0, i + 1).join('/')
    return getPathLabel(fullPath)
  })]

  // Get userId and role from auth context or localStorage
  useEffect(() => {
    document.addEventListener('scroll', () => {
      headerRef.current &&
        headerRef.current.classList.toggle('shadow-sm', document.documentElement.scrollTop > 0)
    })

    if (currentUser?.user_id) {
      setUserId(currentUser.user_id)
      setUserRole(currentUser.role || '')
    } else {
      const userObj = localStorage.getItem('user')
      if (userObj) {
        try {
          const user = JSON.parse(userObj)
          if (user.user_id) setUserId(user.user_id)
          if (user.role) setUserRole(user.role)
        } catch (err) {
          console.error('Failed to parse user from localStorage', err)
        }
      }
    }
  }, [currentUser])

  return (
    <CHeader position="sticky" className="mb-4 p-0" ref={headerRef}>
      <CContainer className="header-container" fluid>
        {/* --- Left Side: Sidebar Toggler + Links --- */}
        <div className="header-left">
          <CHeaderToggler
            onClick={() => dispatch({ type: 'set', sidebarShow: !sidebarShow })}
            className="header-toggler"
          >
            <CIcon icon={cilMenu} />
          </CHeaderToggler>

          <CHeaderNav className="d-none d-md-flex align-items-center">
            <span className="header-breadcrumb" style={{ fontSize: '0.9rem', color: '#6c757d' }}>
              {breadcrumbParts.join(' / ')}
            </span>
          </CHeaderNav>
        </div>

        {/* --- Right Side: Notifications + Profile --- */}
        <div className="header-right">

          {(userRole === 'Admin' || userRole === 'Recruiter') && (
            <CHeaderNav className="header-notifications">
              <CNavItem>
                <CNavLink>
                  <NotificationBell userId={userId} />
                </CNavLink>
              </CNavItem>
            </CHeaderNav>
          )}

          <CHeaderNav className="header-actions"
            style={{ marginTop: '9px' }}
          >
            <AppHeaderDropdown />
          </CHeaderNav>
        </div>
      </CContainer>


    </CHeader>
  )
}

export default AppHeader
