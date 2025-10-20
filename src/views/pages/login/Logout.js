// src/views/pages/login/Logout.js
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const Logout = () => {
  const navigate = useNavigate()

  useEffect(() => {
    // Clear all user-related storage
    localStorage.removeItem('user')
    localStorage.removeItem('role')
    localStorage.removeItem('showLoginToast') // ensure toast doesn't appear after logout

    sessionStorage.clear() // optional

    navigate('/login', { replace: true }) // redirect
  }, [navigate])

  return null
}

export default Logout
