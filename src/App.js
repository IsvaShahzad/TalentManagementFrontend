import React, { Suspense, useEffect } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { useSelector } from 'react-redux'

import { CSpinner, useColorModes } from '@coreui/react'
import './scss/style.scss'
import './scss/examples.scss'
import ResetPassword from './views/pages/login/ResetPassword'
import ProtectedRoute from './components/ProtectedRoutes'
import Dashboard from './views/dashboard/Dashboard'
import AddUser from './views/pages/users/AddUser'
import { Navigate } from 'react-router-dom';
import Candidate from './views/pages/talent-pool/Candidate'

// Containers
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'))

// Pages
const Login = React.lazy(() => import('./views/pages/login/Login'))
const ForgotPassword = React.lazy(() => import('./views/pages/login/ForgotPassword'))
const Page404 = React.lazy(() => import('./views/pages/page404/Page404'))
const Page500 = React.lazy(() => import('./views/pages/page500/Page500'))

const App = () => {
  const { isColorModeSet, setColorMode } = useColorModes('coreui-free-react-admin-template-theme')
  const storedTheme = useSelector((state) => state.theme)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.href.split('?')[1])
    const theme = urlParams.get('theme') && urlParams.get('theme').match(/^[A-Za-z0-9\s]+/)[0]
    if (theme) {
      setColorMode(theme)
    }

    if (!isColorModeSet()) {
      setColorMode(storedTheme)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const userRole = localStorage.getItem('role')
  console.log("user role:", userRole)
  if (!userRole) {
    // Not logged in
    // return <Navigate to="/login" replace />;
  }

  return (




    <HashRouter>
      <Suspense
        fallback={
          <div className="pt-3 text-center">
            <CSpinner color="primary" variant="grow" />
          </div>
        }
      >
        <Routes>
          {/* Public routes */}
          <Route path="/login" name="Login Page" element={<Login />} />
          <Route path="/forgot-password" name="Forgot Password" element={<ForgotPassword />} />
          <Route path="/reset-password" name="Reset Password" element={<ResetPassword />} />
          <Route path="/404" name="Page 404" element={<Page404 />} />
          <Route path="/500" name="Page 500" element={<Page500 />} />
          {/*  <Route path="/users" name="Users" element={<AddUser />} roles="Admin" />*/}


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


          {/* fallback route */}
          <Route path="/not-authorized" element={<h2>Not Authorized</h2>} />
          {/* All other routes go inside dashboard */}
          <Route path="/*" name="Home" element={<DefaultLayout />} />
        </Routes>
      </Suspense>
    </HashRouter >
  )
}

export default App