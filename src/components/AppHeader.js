import React, { useEffect, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'
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

import { AppBreadcrumb, AppHeaderDropdown } from './index'
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

          <CHeaderNav className="d-none d-md-flex">
            <CNavItem>
              <CNavLink to="/dashboard" as={NavLink}>
                Dashboard
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink to="/settings" as={NavLink}>
                Settings
              </CNavLink>
            </CNavItem>
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

          <CHeaderNav className="header-actions">
            <AppHeaderDropdown />
          </CHeaderNav>
        </div>
      </CContainer>

      {/* Breadcrumb */}
      <CContainer className="px-4" fluid>
        <AppBreadcrumb />
      </CContainer>
    </CHeader>
  )
}

export default AppHeader
