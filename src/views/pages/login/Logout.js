// src/views/pages/login/Logout.js
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

const Logout = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const logoutUser = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'))
        if (user?.id) {
          await fetch(`http://localhost:7000/api/user/logout`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId: user.id }),
          })
        }

        // Clear storage after successful logout
        localStorage.removeItem('user')
        localStorage.removeItem('role')
        localStorage.removeItem('showLoginToast')
        sessionStorage.clear()

        toast.success('Logged out successfully', { autoClose: 2000 })
        navigate('/login', { replace: true })
      } catch (err) {
        console.error('Logout failed:', err)
        toast.error('Logout failed')
        navigate('/login', { replace: true })
      }
    }

    logoutUser()
  }, [navigate])

  return null
}

export default Logout
