// src/views/pages/login/Logout.js
import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../../../context/AuthContext'

const Logout = () => {
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const toastShown = useRef(false)

  useEffect(() => {
    // Get user info before clearing
    const currentUser = user || JSON.parse(localStorage.getItem('user') || 'null')
    
    // Clear everything immediately
    logout()
    sessionStorage.clear()
    
    // Navigate to login immediately
    navigate('/login', { replace: true })
    
    // Show toast only once (avoids double toast in Strict Mode or double mount)
    if (!toastShown.current) {
      toastShown.current = true
      toast.success('Logged out successfully', { autoClose: 1000 })
    }
    
    // Record logout in background (non-blocking)
    if (currentUser?.user_id || currentUser?.id) {
      fetch(`http://localhost:7000/api/user/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.user_id || currentUser.id }),
      }).catch(err => console.error('Logout record failed:', err))
    }
  }, [navigate, logout, user])

  return null
}

export default Logout
