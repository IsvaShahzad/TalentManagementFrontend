import React, { useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { CContainer, CHeader, CHeaderToggler } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilMenu } from '@coreui/icons'
import './AppHeader.css'

/** Narrow top bar with sidebar toggle only (no notifications/profile/breadcrumbs). */
const AppHeader = () => {
  const headerRef = useRef()
  const dispatch = useDispatch()
  const sidebarShow = useSelector((state) => state.sidebarShow)

  useEffect(() => {
    const onScroll = () => {
      headerRef.current &&
        headerRef.current.classList.toggle('shadow-sm', document.documentElement.scrollTop > 0)
    }
    document.addEventListener('scroll', onScroll)
    return () => document.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <CHeader position="sticky" className="app-header-minimal mb-0 p-0" ref={headerRef}>
      <CContainer className="header-container header-container--minimal" fluid>
        <div className="header-left">
          <CHeaderToggler
            onClick={() => dispatch({ type: 'set', sidebarShow: !sidebarShow })}
            className="header-toggler"
          >
            <CIcon icon={cilMenu} />
          </CHeaderToggler>
        </div>
      </CContainer>
    </CHeader>
  )
}

export default AppHeader
