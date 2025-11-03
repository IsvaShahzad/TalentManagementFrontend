import React, { useState, useEffect } from 'react'
import '../users/AddUser.css'
import {
  CButton, CCard, CCardBody, CCol, CContainer, CForm, CFormInput,
  CRow, CAlert
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilUser, cilEnvelopeOpen, cilPhone, cilBriefcase, cilCalendar, cilMap } from '@coreui/icons'
import { createCandidate, getAllCandidates } from '../../../api/api'
import DisplayCandidates from './DisplayCandidates'

const Candidate = () => {
  const [name, setFirstName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState('')
  const [experience, setExperience] = useState('')
  const [position, setPosition] = useState('')
  const [resume, setResume] = useState(null)

  const [candidates, setCandidates] = useState([])
  const [alerts, setAlerts] = useState([]) // multiple alerts

  // 🔹 Show alert
  const showAlert = (message, color = 'success') => {
    const id = new Date().getTime()
    setAlerts(prev => [...prev, { id, message, color }])
    setTimeout(() => {
      setAlerts(prev => prev.filter(a => a.id !== id))
    }, 3000)
  }

  // 🔹 Fetch candidates
  const fetchCandidates = async () => {
    try {
      const response = await getAllCandidates()
      if (response && response.length > 0) {
        const formatted = response.map(c => ({
          id: c.candidate_id,
          name: c.name,
          email: c.email,
          phone: c.phone,
          location: c.location,
          experience: c.experience_years,
          position: c.position_applied || '',
          date: new Date(c.createdAt).toLocaleString(),
          resume_url: c.resume_url || null,
          resume_url_redacted: c.resume_url_redacted || null // ← add this
        }))
        setCandidates(formatted)
      } else {
        setCandidates([])
      }
    } catch (err) {
      console.error('Failed to fetch candidates:', err)
      showAlert('Failed to fetch candidates', 'danger')
    }
  }

  useEffect(() => {
    fetchCandidates()
  }, [])

  // 🔹 Handle Add Candidate
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!resume) return showAlert('Please upload a resume before adding a candidate.', 'danger')

    const exists = candidates.some(c => c.email.toLowerCase() === email.toLowerCase())
    if (exists) return showAlert(`Candidate with email "${email}" already exists!`, 'danger')

    try {
      const formData = new FormData()
      formData.append('name', name)
      formData.append('email', email)
      formData.append('phone', phone)
      formData.append('experience_years', experience)
      formData.append('position_applied', position)
      formData.append('resume', resume)

      await createCandidate(formData)
      showAlert(`Candidate "${name}" added successfully!`, 'success')

      // Clear form
      setFirstName(''); setLastName(''); setEmail('')
      setPhone(''); setLocation(''); setExperience('')
      setPosition(''); setResume(null)

      // Refresh list
      fetchCandidates()
    } catch (err) {
      console.error(err)
      showAlert(err.message || 'Failed to add candidate', 'danger')
    }
  }

  return (
    <CContainer style={{ fontFamily: 'Montserrat', maxWidth: '1500px', position: 'relative' }}>
      {/* Fullscreen Alerts */}
      <div style={{
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        backgroundColor: alerts.length > 0 ? 'rgba(0,0,0,0.3)' : 'transparent',
        display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999,
        pointerEvents: 'none'
      }}>
        <div style={{ position: 'absolute', top: '20%', width: '400px' }}>
          {alerts.map(a => (
            <CAlert key={a.id} color={a.color} className="text-center">
              {a.message}
            </CAlert>
          ))}
        </div>
      </div>



      {/* Candidates Table */}
      {candidates.length > 0 ? (
        <DisplayCandidates
          candidates={candidates}
          refreshCandidates={fetchCandidates}
          showAlert={showAlert} // pass alert function
        />
      ) : (
        <p className="text-center">No candidates found</p>
      )}
    </CContainer>
  )
}

export default Candidate
