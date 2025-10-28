import React, { useState, useEffect } from 'react'
import '../users/AddUser.css'
import {
    CButton, CCard, CCardBody, CCol, CContainer, CForm, CFormInput,
    CRow, CAlert, CFormSelect
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilUser, cilEnvelopeOpen, cilPhone, cilBriefcase, cilCalendar } from '@coreui/icons'
import { createCandidate, getAllCandidates } from '../../../api/api'
import DisplayCandidates from './DisplayCandidates'
const TalentPool = () => {
    const [fname, setFirstName] = useState('')
    const [lname, setLastName] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [experience, setExperience] = useState('')
    const [position, setPosition] = useState('')
    const [resume, setResume] = useState(null)
    const [showAlert, setShowAlert] = useState(false)
    const [alertMessage, setAlertMessage] = useState('')
    const [alertColor, setAlertColor] = useState('success')
    const [candidates, setCandidates] = useState([])


    // const { data, isError, isLoading } = fetchCandidates()
    const fetchCandidates = async () => {
        try {
            const response = await getAllCandidates()
            console.log("response from api", response)

            // response is already an array
            if (response && response.length > 0) {
                const formatted = response.map(c => ({
                    id: c.candidate_id,
                    fname: c.firstName,
                    lname: c.lastName,
                    email: c.email,
                    phone: c.phone,
                    experience: c.experience_years, // map correctly
                    position: c.position_applied || '',      // default if undefined
                    date: new Date(c.createdAt).toLocaleString(),
                    resume_url: c.resume_url || null
                }))
                setCandidates(formatted)
            } else {
                setCandidates([]) // clear if empty
            }
        } catch (err) {
            console.error('Failed to fetch candidates:', err)
        }
    }


    useEffect(() => {
        fetchCandidates()

    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const formData = new FormData()
            formData.append('firstName', fname)
            formData.append('lastName', lname)
            formData.append('email', email)
            formData.append('phone', phone)
            formData.append('experience_years', experience)
            formData.append('position_applied', position)
            if (resume) formData.append('resume', resume)


            for (let [key, value] of formData.entries()) {
                console.log(key, value);
            }



            await createCandidate(formData)

            setAlertMessage(`Candidate "${fname} ${lname}" added successfully!`)
            setAlertColor('success')
            setShowAlert(true)
            setTimeout(() => setShowAlert(false), 3000)

            setFirstName('')
            setLastName('')
            setEmail('')
            setPhone('')
            setExperience('')
            setPosition('')
            setResume(null)

            fetchCandidates()
        } catch (err) {
            console.error(err)
            setAlertMessage(err.message || 'Failed to add candidate')
            setAlertColor('danger')
            setShowAlert(true)
            setTimeout(() => setShowAlert(false), 3000)
        }
    }

    return (
        <CContainer style={{ fontFamily: 'Montserrat', maxWidth: '1500px' }}>
            {/* Add User Form */}
            <CRow className="justify-content-center mb-5">
                <CCol md={9} lg={7} xl={6}>
                    <CCard className="mx-4 border-0" style={{ borderRadius: '40px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                        <CCardBody className="p-5">
                            <CForm onSubmit={handleSubmit}>
                                <h1 style={{ fontWeight: 450, textAlign: 'center', marginBottom: '0.4rem', fontSize: '2.3rem' }}>Add New Candidate</h1>
                                <p className="text-body-secondary" style={{ textAlign: 'center', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Fill details to create a new candidate</p>

                                {showAlert && <CAlert color={alertColor} className="text-center fw-medium">{alertMessage}</CAlert>}

                                {/* First Name */}
                                <div className="mb-4"
                                    style={{ display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', padding: '0 12px' }}>
                                        <CIcon icon={cilUser} style={{ color: '#326396ff', fontSize: '18px' }} />
                                        {/* Thin blue divider */}
                                        <div style={{ width: '0.9px', height: '25px', backgroundColor: '#518ccbff', marginLeft: '8px', marginRight: '8px' }}></div>
                                    </div>
                                    <CFormInput placeholder="First Name" value={fname} onChange={e => setFirstName(e.target.value)} required
                                        style={{ border: 'none', outline: 'none' }} />
                                </div>

                                {/* Last Name */}
                                <div className="mb-4" style={{ display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', padding: '0 12px' }}>
                                        <CIcon icon={cilUser} style={{ color: '#326396ff', fontSize: '18px' }} />
                                        {/* Thin blue divider */}
                                        <div style={{ width: '0.9px', height: '25px', backgroundColor: '#518ccbff', marginLeft: '8px', marginRight: '8px' }}></div>
                                    </div>
                                    <CFormInput placeholder="Last Name" value={lname} onChange={e => setLastName(e.target.value)} required
                                        style={{ border: 'none', outline: 'none' }} />
                                </div>

                                {/* Email */}
                                <div className="mb-4" style={{ display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', padding: '0 12px' }}>
                                        <CIcon icon={cilEnvelopeOpen} style={{ color: '#326396ff', fontSize: '18px' }} />
                                        <div style={{ width: '0.9px', height: '25px', backgroundColor: '#669fddff', marginLeft: '8px', marginRight: '8px' }}></div>
                                    </div>
                                    <CFormInput type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required
                                        style={{ border: 'none', outline: 'none' }} />
                                </div>

                                {/* Phone */}

                                <div className="mb-4" style={{ display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', padding: '0 12px' }}>
                                        <CIcon icon={cilPhone} style={{ color: '#326396ff', fontSize: '18px' }} />
                                        <div style={{ width: '0.9px', height: '25px', backgroundColor: '#669fddff', marginLeft: '8px', marginRight: '8px' }}></div>
                                    </div>

                                    <CFormInput type="tel" placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} required
                                        style={{ border: 'none', outline: 'none' }} />
                                </div>

                                {/* Experience */}
                                <div className="mb-4" style={{ display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', padding: '0 12px' }}>
                                        <CIcon icon={cilBriefcase} style={{ color: '#326396ff', fontSize: '18px' }} />
                                        <div style={{ width: '0.9px', height: '25px', backgroundColor: '#669fddff', marginLeft: '8px', marginRight: '8px' }}></div>
                                    </div>
                                    <CFormInput placeholder="Experience (e.g., 3 years)" value={experience} onChange={e => setExperience(e.target.value)}
                                        style={{ border: 'none', outline: 'none' }} />
                                </div>

                                {/* Position */}
                                <div className="mb-4" style={{ display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', padding: '0 12px' }}>
                                        <CIcon icon={cilCalendar} style={{ color: '#326396ff', fontSize: '18px' }} />
                                        <div style={{ width: '0.9px', height: '25px', backgroundColor: '#669fddff', marginLeft: '8px', marginRight: '8px' }}></div>
                                    </div>
                                    <CFormInput placeholder="Position Applied For" value={position} onChange={e => setPosition(e.target.value)}
                                        style={{ border: 'none', outline: 'none' }} />
                                </div>

                                {/* Resume */}
                                <div className="mb-4" style={{ display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', padding: '0 12px' }}>
                                        <CIcon icon={cilBriefcase} style={{ color: '#326396ff', fontSize: '18px' }} />
                                        <div style={{ width: '0.9px', height: '25px', backgroundColor: '#669fddff', marginLeft: '8px', marginRight: '8px' }}></div>
                                    </div>
                                    <CFormInput type="file" accept=".pdf,.doc,.docx" onChange={e => setResume(e.target.files?.[0] || null)}
                                    />
                                </div>

                                <CButton
                                    type="submit"
                                    className="mt-5 py-3"
                                    style={{
                                        width: '70%',
                                        display: 'block',
                                        margin: '0 auto',
                                        background: 'linear-gradient(90deg, #5f8ed0ff 0%, #4a5dcaff 100%)',
                                        border: 'none',
                                        borderRadius: '0px',
                                        fontSize: '1.2rem',
                                        fontWeight: 250,
                                        color: 'white',
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
            {candidates && candidates.length > 0 ? (
                <DisplayCandidates
                    candidates={candidates}
                    refreshCandidates={fetchCandidates}
                />

            ) : (
                <p>No candidates found</p>
            )}


        </CContainer>
    )

}

export default TalentPool
