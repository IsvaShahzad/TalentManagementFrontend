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
  cilHistory,
} from '@coreui/icons'
import { CNavItem, CNavTitle } from '@coreui/react'

// ------------------------------
// COMMON ITEMS (visible to all)
// ------------------------------
const commonItems = [
  {
    component: CNavTitle,
    name: 'Main',
    style: { fontSize: '0.85rem' },
  },
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilGrid} customClassName="nav-icon" style={{ width: '16px', height: '16px' }} />,
    style: { fontSize: '0.85rem' },
  },
  {
    component: CNavItem,
    name: 'Position Tracker',
    to: '/jobs',
    icon: <CIcon icon={cilBriefcase} customClassName="nav-icon" style={{ width: '16px', height: '16px' }} />,
    style: { fontSize: '0.85rem' },
  },
  {
    component: CNavItem,
    name: 'Talent Pool',
    to: '/talent-pool',
    icon: <CIcon icon={cilFolderOpen} customClassName="nav-icon" style={{ width: '16px', height: '16px' }} />,
    style: { fontSize: '0.85rem' },
  },
  {
    component: CNavItem,
    name: 'Saved Searches & Notes',
    to: '/talent-pool/saved-searches-notes',
    icon: <CIcon icon={cilClipboard} customClassName="nav-icon" style={{ width: '16px', height: '16px' }} />,
    style: { fontSize: '0.85rem' },
  },
  {
    component: CNavItem,
    name: 'Notifications',
    to: '/notifications',
    icon: <CIcon icon={cilBell} customClassName="nav-icon" style={{ width: '16px', height: '16px' }} />,
    style: { fontSize: '0.85rem' },
  },

]

// ------------------------------
// ADMIN-ONLY ITEMS
// ------------------------------
const adminOnlyItems = [
  {
    component: CNavItem,
    name: 'Recruitment Team',
    to: '/recruiters',
    icon: <CIcon icon={cilUser} customClassName="nav-icon" style={{ width: '16px', height: '16px' }} />,
    style: { fontSize: '0.85rem' },
  },
  // {
  //   component: CNavItem,
  //   name: 'Position Tracker 2',
  //   to: '/position-tracker',
  //   icon: <CIcon icon={cilBriefcase} customClassName="nav-icon" style={{ width: '16px', height: '16px' }} />,
  //   style: { fontSize: '0.85rem' },
  // },
  {
    component: CNavItem,
    name: 'Users',
    to: '/users',
    icon: <CIcon icon={cilPeople} customClassName="nav-icon" style={{ width: '16px', height: '16px' }} />,
    style: { fontSize: '0.85rem' },
  },
  {
    component: CNavTitle,
    name: 'Statistics',
    style: { fontSize: '0.85rem' },
  },
  {
    component: CNavItem,
    name: 'Statistics',
    to: '/stats-overview',
    icon: <CIcon icon={cilChart} customClassName="nav-icon" style={{ width: '16px', height: '16px' }} />,
    style: { fontSize: '0.85rem' },
  },
  {
    component: CNavItem,
    name: 'Activity Log',
    to: '/activity-log',
    icon: <CIcon icon={cilHistory} customClassName="nav-icon" style={{ width: '16px', height: '16px' }} />,
    style: { fontSize: '0.85rem' },
  },
  // {
  //   component: CNavItem,
  //   name: 'Settings',
  //   to: '/settings',
  //   icon: <CIcon icon={cilSettings} customClassName="nav-icon" style={{ width: '16px', height: '16px' }} />,
  //   style: { fontSize: '0.85rem' },
  // },
]

const clientOnlyItems = [
  {
    component: CNavTitle,
    name: 'Main',
    style: { fontSize: '0.85rem' },
  },
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilGrid} customClassName="nav-icon" style={{ width: '16px', height: '16px' }} />,
    style: { fontSize: '0.85rem' },
  },
  {
    component: CNavItem,
    name: 'Position Tracker',
    to: '/jobs',
    icon: <CIcon icon={cilBriefcase} customClassName="nav-icon" style={{ width: '16px', height: '16px' }} />,
    style: { fontSize: '0.85rem' },
  },
  {
    component: CNavItem,
    name: 'Notifications',
    to: '/notifications',
    icon: <CIcon icon={cilBell} customClassName="nav-icon" style={{ width: '16px', height: '16px' }} />,
    style: { fontSize: '0.85rem' },
  },

]

// ------------------------------
// AUTH ITEMS (visible to all) — built with logged-in email
// ------------------------------
// const getAuthItems = (userEmail) => {
//   const label =
//     userEmail && String(userEmail).trim() !== ''
//       ? String(userEmail).trim()
//       : 'Signed in'

const getAuthItems = (userName) => {
  const label =
    userName && String(userName).trim() !== ''
      ? String(userName).trim()
      : 'Signed in'
  return [
    {
      component: CNavTitle,
      name: label,
      style: { fontSize: '0.75rem', wordBreak: 'break-word', lineHeight: 1.3 },
    },
    {
      component: CNavItem,
      name: 'Settings',
      to: '/settings',
      icon: <CIcon icon={cilSettings} customClassName="nav-icon" style={{ width: '16px', height: '16px' }} />,
      style: { fontSize: '0.85rem' },
    },
    {
      component: CNavItem,
      name: 'Logout',
      to: '/logout',
      icon: (
        <CIcon
          icon={cilExitToApp}
          customClassName="nav-icon"
          style={{ width: '16px', height: '16px' }}
        />
      ),
      style: { fontSize: '0.85rem' },
    },
  ]
}

// ------------------------------
// COMBINE BASED ON ROLE
// ------------------------------
const getNavForRole = (role, userEmail = '') => {
  const authItems = getAuthItems(userEmail)
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
