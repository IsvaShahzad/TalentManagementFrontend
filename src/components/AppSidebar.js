import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import './AppSidebar.css'
import sidebarLogo from 'src/assets/images/side-logo.png'



import {
  CCloseButton,
  CSidebar,
  CSidebarBrand,
  CSidebarFooter,
  CSidebarHeader,
  CSidebarToggler,
} from '@coreui/react'

import { AppSidebarNav } from './AppSidebarNav'



// sidebar nav config
import navigation from '../_nav'
import getNavForRole from '../_nav'

const AppSidebar = () => {
  const dispatch = useDispatch()
  const unfoldable = useSelector((state) => state.sidebarUnfoldable)
  const sidebarShow = useSelector((state) => state.sidebarShow)
  const role = localStorage.getItem('role') || 'user' // default to 'user'
  const navItems = getNavForRole(role)

  return (
    <CSidebar
      className="border-end no-scrollbar"
      position="fixed"
      unfoldable={unfoldable}
      visible={sidebarShow}
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
