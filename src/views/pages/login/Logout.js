// src/views/pages/login/Logout.js
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../../../context/AuthContext'

const Logout = () => {
  const navigate = useNavigate()
  const { logout, user } = useAuth() // Use auth context for JWT-based logout

  useEffect(() => {
    const logoutUser = async () => {
      try {
        // Get user from auth context or localStorage for backward compatibility
        const currentUser = user || JSON.parse(localStorage.getItem('user'))
        if (currentUser?.user_id || currentUser?.id) {
          await fetch(`http://localhost:7000/api/user/logout`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId: currentUser.user_id || currentUser.id }),
          })
        }

        // Use auth context logout to clear JWT token and all storage
        logout()
        
        // Clear any remaining session storage
        sessionStorage.clear()

        toast.success('Logged out successfully', { autoClose: 2000 })
        navigate('/login', { replace: true })
      } catch (err) {
        console.error('Logout failed:', err)
        // Still clear storage on error
        logout()
        toast.error('Logout failed')
        navigate('/login', { replace: true })
      }
    }

    logoutUser()
  }, [navigate, logout, user])

  return null
}

export default Logout
