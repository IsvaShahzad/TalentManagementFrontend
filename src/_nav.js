import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilGrid,
  cilPeople,
  cilUser,
  cilBriefcase,
  cilFolderOpen,
  cilChart,
  cilSettings,
  cilBell,
  cilLockLocked,
  cilExitToApp,
  cilClipboard,
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

// ------------------------------
// COMMON ITEMS (visible to all)
// ------------------------------
const commonItems = [
  {
    component: CNavTitle,
    name: 'Main',
  },
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilGrid} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Active Jobs',
    to: '/jobs',
    icon: <CIcon icon={cilBriefcase} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Talent Pool',
    to: '/talent-pool',
    icon: <CIcon icon={cilFolderOpen} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Notifications',
    to: '/notifications',
    icon: <CIcon icon={cilBell} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Activity',
    to: '/activity-log',
    icon: <CIcon icon={cilClipboard} customClassName="nav-icon" />,
  },
]

// ------------------------------
// ADMIN-ONLY ITEMS
// ------------------------------
const adminOnlyItems = [
  {
    component: CNavItem,
    name: 'Recruiters',
    to: '/recruiters',
    icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Candidates',
    to: '/candidates',
    icon: <CIcon icon={cilPeople} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Position Tracker',
    to: '/position-tracker',
    icon: <CIcon icon={cilBriefcase} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Users',
    to: '/users',
    icon: <CIcon icon={cilPeople} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'Stats Overview',
  },
  {
    component: CNavItem,
    name: 'Stats Overview',
    to: '/stats-overview',
    icon: <CIcon icon={cilChart} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Settings',
    to: '/settings',
    icon: <CIcon icon={cilSettings} customClassName="nav-icon" />,
  },
]
const clientOnlyItems = [

  {
    component: CNavTitle,
    name: 'Main',
  },
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilGrid} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Active Jobs',
    to: '/jobs',
    icon: <CIcon icon={cilBriefcase} customClassName="nav-icon" />,
  },

]

// ------------------------------
// AUTH ITEMS (visible to all)
// ------------------------------
const authItems = [
  {
    component: CNavTitle,
    name: 'Authentication',
  },
  {
    component: CNavGroup,
    name: 'Account',
    icon: <CIcon icon={cilLockLocked} customClassName="nav-icon" />,
    items: [
      // {
      //   component: CNavItem,
      //   name: 'Login',
      //   to: '/login',
      // },
      {
        component: CNavItem,
        name: 'Logout',
        to: '/logout',
        icon: <CIcon icon={cilExitToApp} customClassName="nav-icon" />,
      },
    ],
  },
]

// ------------------------------
// COMBINE BASED ON ROLE
// ------------------------------
const getNavForRole = (role) => {
  switch (role) {
    case 'Admin':
      return [...commonItems, ...adminOnlyItems, ...authItems]
    case 'Client':
      return [...clientOnlyItems, ...authItems]
    default:
      return [...commonItems, ...authItems]
  }
}

export default getNavForRole
