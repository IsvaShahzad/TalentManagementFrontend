// src/views/pages/login/Logout.js
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const Logout = () => {
  const navigate = useNavigate()

  useEffect(() => {
    // Clear all user-related storage
    localStorage.removeItem('user')   // remove user object if stored
    localStorage.removeItem('role')   // remove role
    sessionStorage.clear()            // optional: clear session storage if used

    // Redirect to login page
    navigate('/login', { replace: true }) // replace prevents back navigation
  }, [navigate])

  return null // nothing to render
}

export default Logout
