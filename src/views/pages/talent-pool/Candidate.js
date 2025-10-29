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
  const [fname, setFirstName] = useState('')
  const [lname, setLastName] = useState('')
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
          fname: c.firstName,
          lname: c.lastName,
          email: c.email,
          phone: c.phone,
          location: c.location,
          experience: c.experience_years,
          position: c.position_applied || '',
          date: new Date(c.createdAt).toLocaleString(),
          resume_url: c.resume_url || null
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
      formData.append('firstName', fname)
      formData.append('lastName', lname)
      formData.append('email', email)
      formData.append('phone', phone)
      formData.append('experience_years', experience)
      formData.append('position_applied', position)
      formData.append('resume', resume)

      await createCandidate(formData)
      showAlert(`Candidate "${fname} ${lname}" added successfully!`, 'success')

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

      {/* Add Candidate Form */}
      <CRow className="justify-content-center mb-5">
        <CCol md={9} lg={7} xl={6}>
          <CCard className="mx-4 border-0" style={{ borderRadius: '40px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <CCardBody className="p-5">
              <CForm onSubmit={handleSubmit}>
                <h1 style={{ fontWeight: 450, textAlign: 'center', marginBottom: '0.4rem', fontSize: '2.3rem' }}>Add New Candidate</h1>
                <p className="text-body-secondary text-center" style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                  Fill details to create a new candidate
                </p>

                {/* Input fields */}
                {[
                  { label: 'First Name', icon: cilUser, value: fname, setter: setFirstName },
                  { label: 'Last Name', icon: cilUser, value: lname, setter: setLastName },
                  { label: 'Email', icon: cilEnvelopeOpen, value: email, setter: setEmail, type: 'email' },
                  { label: 'Phone', icon: cilPhone, value: phone, setter: setPhone, type: 'tel' },
                  { label: 'Location', icon: cilMap, value: location, setter: setLocation },
                  { label: 'Experience', icon: cilBriefcase, value: experience, setter: setExperience },
                  { label: 'Position Applied', icon: cilCalendar, value: position, setter: setPosition }
                ].map((field, idx) => (
                  <div key={idx} className="mb-4" style={{ display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', padding: '0 12px' }}>
                      <CIcon icon={field.icon} style={{ color: '#326396ff', fontSize: '18px' }} />
                      <div style={{ width: '0.9px', height: '25px', backgroundColor: '#518ccbff', margin: '0 8px' }}></div>
                    </div>
                    <CFormInput
                      type={field.type || 'text'}
                      placeholder={field.label}
                      value={field.value}
                      onChange={e => field.setter(e.target.value)}
                      required
                      style={{ border: 'none', outline: 'none' }}
                    />
                  </div>
                ))}

                {/* Resume */}
                <div className="mb-4" style={{ display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', padding: '0 12px' }}>
                    <CIcon icon={cilBriefcase} style={{ color: '#326396ff', fontSize: '18px' }} />
                    <div style={{ width: '0.9px', height: '25px', backgroundColor: '#518ccbff', margin: '0 8px' }}></div>
                  </div>
                  <CFormInput
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={e => setResume(e.target.files?.[0] || null)}
                  />
                </div>

                <CButton
                  type="submit"
                  className="mt-5 py-3"
                  style={{
                    width: '70%', display: 'block', margin: '0 auto',
                    background: 'linear-gradient(90deg, #5f8ed0ff 0%, #4a5dcaff 100%)',
                    border: 'none', borderRadius: '0px', fontSize: '1.2rem',
                    fontWeight: 250, color: 'white'
                  }}
                >
                  Add Candidate
                </CButton>
              </CForm>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

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
