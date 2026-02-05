import React, { useEffect, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  CContainer,
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CHeader,
  CHeaderNav,
  CHeaderToggler,
  CNavLink,
  CNavItem,
  useColorModes,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilBell,
  cilContrast,
  cilMenu,
  cilMoon,
  cilSun,
} from '@coreui/icons'

import { AppBreadcrumb } from './index'
import { AppHeaderDropdown } from './header/index'
import NotificationBell from '../views/pages/Notifications/NotificationBell'
import { useAuth } from '../context/AuthContext'


const AppHeader = () => {
  const headerRef = useRef()
  const { colorMode, setColorMode } = useColorModes('coreui-free-react-admin-template-theme')
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

    // Try auth context first, then localStorage
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
    <CHeader
      position="sticky"
      className="mb-4 p-0 compact-header"
      ref={headerRef}
    >
      <CContainer className="border-bottom px-2 px-md-4 header-container" fluid>

        {/* --- Sidebar Toggler --- */}
        {/* --- Sidebar Toggler + Left Navigation --- */}
        <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flexShrink: 0 }}>
          {/* Sidebar Toggler */}
          <CHeaderToggler
            onClick={() => dispatch({ type: 'set', sidebarShow: !sidebarShow })}
            className="header-toggler"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.20rem',
            }}
          >
            <CIcon
              icon={cilMenu}
              style={{ width: '26px', height: '20px' }} // same size as links
            />
          </CHeaderToggler>

          {/* Left Navigation */}
          <CHeaderNav className="d-none d-md-flex" style={{ gap: '0.3rem', alignItems: 'center' }}>
            <CNavItem>
              <CNavLink
                to="/dashboard"
                as={NavLink}
                style={{
                  fontSize: '0.875rem', // same "height" as icon
                  lineHeight: '26px',   // vertically center with icon
                  padding: '0 0.5rem',
                }}
              >
                Dashboard
              </CNavLink>
            </CNavItem>

            <CNavItem>
              <CNavLink
                to="/settings"
                as={NavLink}
                style={{
                  fontSize: '0.875rem', // same as Dashboard
                  lineHeight: '26px',   // vertically center with icon
                  padding: '0 0.5rem',
                }}
              >
                Settings
              </CNavLink>
            </CNavItem>
          </CHeaderNav>
        </div>

        {/* --- Right Side: Notifications + Theme + Profile --- */}
        <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto', flexShrink: 0 }}>
          {/* --- Notifications (Admin + Recruiter) --- */}
          {(userRole === 'Admin' || userRole === 'Recruiter') && (
            <CHeaderNav className="header-notifications">
              <CNavItem>
                <CNavLink>
                  <NotificationBell userId={userId} />
                </CNavLink>
              </CNavItem>
            </CHeaderNav>
          )}

          {/* --- Theme + Profile --- */}
          <CHeaderNav className="header-actions">
            <li className="nav-item py-1 navbar-divider d-none d-sm-flex">
              <div className="vr h-100 mx-2 text-body text-opacity-75"></div>
            </li>

            {/* Theme Switcher */}
            <CDropdown variant="nav-item" placement="bottom-end" className="header-theme-dropdown">

              <CDropdownToggle
                caret={false}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {colorMode === 'dark' ? (
                  <CIcon
                    icon={cilMoon}
                    style={{ width: '26px', height: '20px' }} // slightly bigger
                  />
                ) : colorMode === 'auto' ? (
                  <CIcon
                    icon={cilContrast}
                    style={{ width: '26px', height: '20px' }} // slightly bigger
                  />
                ) : (
                  <CIcon
                    icon={cilSun}
                    style={{ width: '26px', height: '20px' }} // slightly bigger
                  />
                )}
              </CDropdownToggle>

              <CDropdownMenu>

                <CDropdownItem
                  active={colorMode === 'light'}
                  as="button"
                  onClick={() => setColorMode('light')}
                  style={{
                    fontSize: 'clamp(0.6rem, 1vw, 0.75rem)',
                    padding: 'clamp(3px, 0.5vw, 6px) clamp(6px, 1vw, 12px)',
                  }}
                >
                  <CIcon
                    className="me-2"
                    icon={cilSun}
                    style={{ width: 'clamp(12px, 1.5vw, 16px)', height: 'clamp(12px, 1.5vw, 16px)' }}
                  />
                  <span style={{ fontSize: 'clamp(0.6rem, 1vw, 0.75rem)' }}>Light</span>
                </CDropdownItem>

                <CDropdownItem
                  active={colorMode === 'dark'}
                  as="button"
                  onClick={() => setColorMode('dark')}
                  style={{
                    fontSize: 'clamp(0.6rem, 1vw, 0.75rem)',
                    padding: 'clamp(3px, 0.5vw, 6px) clamp(6px, 1vw, 12px)',
                  }}
                >
                  <CIcon
                    className="me-2"
                    icon={cilMoon}
                    style={{ width: 'clamp(12px, 1.5vw, 16px)', height: 'clamp(12px, 1.5vw, 16px)' }}
                  />
                  <span style={{ fontSize: 'clamp(0.6rem, 1vw, 0.75rem)' }}>Dark</span>
                </CDropdownItem>

                <CDropdownItem
                  active={colorMode === 'auto'}
                  as="button"
                  onClick={() => setColorMode('auto')}
                  style={{
                    fontSize: 'clamp(0.6rem, 1vw, 0.75rem)',
                    padding: 'clamp(3px, 0.5vw, 6px) clamp(6px, 1vw, 12px)',
                  }}
                >
                  <CIcon
                    className="me-2"
                    icon={cilContrast}
                    style={{ width: 'clamp(12px, 1.5vw, 16px)', height: 'clamp(12px, 1.5vw, 16px)' }}
                  />
                  <span style={{ fontSize: 'clamp(0.6rem, 1vw, 0.75rem)' }}>Auto</span>
                </CDropdownItem>

              </CDropdownMenu>

            </CDropdown>

            <li className="nav-item py-1 navbar-divider d-none d-sm-flex">
              <div className="vr h-100 mx-2 text-body text-opacity-75"></div>
            </li>

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
