import React, { Suspense, useEffect, useState } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { useSelector } from 'react-redux'

import { CSpinner, useColorModes } from '@coreui/react'
import './scss/style.scss'
import './scss/examples.scss'

// Pages
import ResetPassword from './views/pages/login/ResetPassword'
import ProtectedRoute from './components/ProtectedRoutes'
import AddUser from './views/pages/users/AddUser'
import Candidate from './views/pages/talent-pool/Candidate'
import Notifications from './views/pages/Notifications/Notifications'

import { Navigate } from 'react-router-dom'
import SocketContext from './context/SocketContext'


// Lazy-loaded containers and pages
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'))
const Login = React.lazy(() => import('./views/pages/login/Login'))
const ForgotPassword = React.lazy(() => import('./views/pages/login/ForgotPassword'))
const Page404 = React.lazy(() => import('./views/pages/page404/Page404'))
const Page500 = React.lazy(() => import('./views/pages/page500/Page500'))
const DisplayAllCandidates = React.lazy(() => import('./views/pages/talent-pool/DisplayAllCandidates'))


const App = () => {
  const { isColorModeSet, setColorMode } = useColorModes('coreui-free-react-admin-template-theme')
  const storedTheme = useSelector((state) => state.theme)
  const [socket, setSocket] = useState(null); // Store socket instance
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.href.split('?')[1])
    const theme = urlParams.get('theme') && urlParams.get('theme').match(/^[A-Za-z0-9\s]+/)[0]
    if (theme) setColorMode(theme)

    if (!isColorModeSet()) setColorMode(storedTheme)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const userRole = localStorage.getItem('role') // optional, used in ProtectedRoute

  return (
    <SocketContext.Provider value={{ socket, setSocket }}>
      <HashRouter>
        <Suspense
          fallback={
            <div className="pt-3 text-center">
              <CSpinner color="primary" variant="grow" />
            </div>
          }
        >
          <Routes>
            {/* Root route always opens login */}
            <Route path="/" element={<Login />} />

            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/404" element={<Page404 />} />
            <Route path="/500" element={<Page500 />} />

            {/* Protected routes */}
            <Route
              path="/users"
              element={
                <ProtectedRoute allowedRoles={'Admin'} role={userRole}>
                  <AddUser />
                </ProtectedRoute>
              }
            />
            <Route
              path="/candidates"
              element={
                <ProtectedRoute allowedRoles={'Admin'} role={userRole}>
                  <Candidate />
                </ProtectedRoute>
              }
            />
            <Route
              path="/all-candidates"
              element={
                <ProtectedRoute allowedRoles={'Admin'} role={userRole}>
                  <DisplayAllCandidates />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute allowedRoles={'Admin'} role={userRole}>
                  <Notifications />
                </ProtectedRoute>
              }
            />

            {/* All other routes go inside dashboard */}
            <Route path="/*" element={<DefaultLayout />} />

            {/* Fallback for unauthorized */}
            <Route path="/not-authorized" element={<h2>Not Authorized</h2>} />
          </Routes>
        </Suspense>
      </HashRouter>
    </SocketContext.Provider>
  )
}

export default App
