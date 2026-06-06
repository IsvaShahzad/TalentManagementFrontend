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
import { useLocation } from 'react-router-dom'
import { useAppAlert } from '../../../context/AppAlertContext';


const Candidate = () => {
  const { showAlert } = useAppAlert();
  const [name, setFirstName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState('')
  const [experience, setExperience] = useState('')
  const [position, setPosition] = useState('')
  const [resume, setResume] = useState(null)

  const [candidates, setCandidates] = useState([])
  const routerLocation = useLocation()

  useEffect(() => {
    if (routerLocation.pathname === "/candidates") {
      fetchCandidates();
    }
  }, [routerLocation.pathname]);


  const fetchCandidates = async () => {
    try {
      const response = await getAllCandidates()
      if (response && response.length > 0) {

        const formatted = response.map(c => ({
          candidate_id: c.candidate_id,
          name: c.name,
          email: c.email,
          phone: c.phone,
          location: c.location,
          experience_years: c.experience_years || '',
          position_applied: c.position_applied || '',
          current_last_salary: c.current_last_salary || null,
          expected_salary: c.expected_salary || null,
          clientassigned_id: c.clientassigned_id || '',
          client_name: c.client_name || '',
          sourced_by_name: c.sourced_by_name || '',
          candidate_status: c.candidate_status || '',
          placement_status: c.placement_status || '', 
          date: new Date(c.createdAt).toLocaleString(),
          resume_url: c.resume_url || null,
          resume_url_redacted: c.resume_url_redacted || null,
          source: c.source || 'cv'
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
  }, [routerLocation.pathname])

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
      window.dispatchEvent(new Event('refreshNotifications')) // Trigger bell refresh

      // Clear form
      setFirstName(''); setEmail('')
      setPhone(''); setLocation(''); setExperience('')
      setPosition(''); setResume(null)

      // Refresh list
      fetchCandidates()

    } catch (err) {
      console.error(err)
      // Handle duplicate candidate error
      if (err.duplicate || err.message?.includes('already exists')) {
        showAlert(`Candidate with email "${email}" already exists!`, 'warning')
      } else {
        showAlert(err.message || 'Failed to add candidate', 'danger')
      }
    }
  }

  return (
    <CContainer style={{ fontFamily: 'Montserrat', maxWidth: '1500px', position: 'relative' }}>
      {/* Candidates Table */}
      <DisplayCandidates
        candidates={candidates}
        refreshCandidates={fetchCandidates}
        showAlert={showAlert} // pass alert function
      />

    </CContainer>
  )
}

export default Candidate
