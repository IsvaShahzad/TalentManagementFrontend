import React, { useState } from 'react'
import '../users/AddUser.css'
import {
    CButton, CCard, CCardBody, CCol, CContainer, CForm, CFormInput,
    CRow
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
    cilUser, cilBuilding, cilBriefcase, cilListRich
} from '@coreui/icons'
import {
    CreateJobApi
} from '../../../api/api'
import { toast } from 'react-toastify'

const JobForm = () => {
    const [company, setCompany] = useState('')
    const [title, setTitle] = useState('')
    const [skills, setSkills] = useState('')
    const [exp, setExp] = useState('')
    const [description, setJobDescription] = useState('')
    const [jobFile, setJobFile] = useState(null)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {

        e.preventDefault()
        setLoading(true)
        const userObj = localStorage.getItem('user')
        if (!userObj) {
            toast.error('User not logged in')
            setLoading(false)
            return
        }

        const user = JSON.parse(userObj)
        const userId = user.user_id
        if (!userId) {
            toast.error('User not logged in')
            setLoading(false)
            return
        }
        const formData = new FormData()
        formData.append('title', title)
        formData.append('experience', exp ? parseInt(exp, 10) : 0)
        formData.append('company', company)
        formData.append('skills', skills)
        formData.append('description', description)
        formData.append('posted_by', userId)

        if (jobFile) {
            formData.append('jobFile', jobFile)
        }
        // Log FormData contents for debugging
        console.log("job details being sent:");
        for (let [key, value] of formData.entries()) {
            console.log(`${key}:`, value);
        }
        try {
            await CreateJobApi(formData) // backend must accept multipart/form-data
            window.dispatchEvent(new Event('jobAdded'))
            window.dispatchEvent(new Event('refreshNotifications')) // Trigger bell refresh
            window.dispatchEvent(new Event('jobStatusChanged')) // Trigger active jobs count refresh
            window.dispatchEvent(new Event('refreshActiveJobs')) // Alternative event name
            toast.success('Job created successfully!', { autoClose: 3000 })
            // reset
            setTitle('')
            setExp('')
            setCompany('')
            setSkills('')
            setJobDescription('')
            setJobFile(null)

        } catch (err) {
            toast.error('Failed to create job', { autoClose: 3000 })
        } finally {
            setLoading(false)
        }
    }

    return (
        <CContainer style={{ fontFamily: 'Inter, sans-serif', maxWidth: '1500px', padding: '0.5rem' }}>
            {/* Add User Form */}
            <CRow className="justify-content-center mb-3 mb-md-5">
                <CCol xs={12} sm={12} md={10} lg={8} xl={6}>
                    <CCard
                        className="mx-1 mx-md-4"
                        style={{
                            borderRadius: '2px', // slightly rounded corners
                            boxShadow: 'none',
                            border: 'px solid grey', // red border
                        }}
                    >
                        <CCardBody className="p-3 p-md-5">
                            <CForm onSubmit={handleSubmit}>
                                {/* Heading */}
                                <h1
                                    style={{
                                        fontWeight: 450,
                                        textAlign: 'center',
                                        marginBottom: '0.4rem',
                                        fontSize: '1.8rem',
                                        fontFamily: 'Inter, sans-serif',
                                    }}
                                >
                                    Add New Job
                                </h1>
                                <p
                                    className="text-body-secondary"
                                    style={{
                                        textAlign: 'center',
                                        marginBottom: '1.5rem',
                                        fontSize: '0.85rem',
                                        fontFamily: 'Inter, sans-serif',
                                    }}
                                >
                                    Fill details to create a new job
                                </p>

                                {/* Title Field */}
                                <div
                                    className="mb-3 d-flex align-items-center"
                                    style={{
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                    }}
                                >
                                    <div className="d-flex align-items-center px-2">
                                        <CIcon icon={cilUser} style={{ color: '#326396ff', fontSize: '16px' }} />
                                        <div style={{ width: '1px', height: '20px', backgroundColor: '#518ccbff', margin: '0 6px' }}></div>
                                    </div>
                                    <CFormInput
                                        placeholder="Job Title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        required
                                        style={{ border: 'none', outline: 'none', fontSize: '0.9rem', flex: 1 }}
                                    />
                                </div>

                                <div className="mb-3 d-flex align-items-center" style={{ border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                                    <div className="d-flex align-items-center px-2">
                                        <CIcon icon={cilBuilding} style={{ color: '#326396ff', fontSize: '16px' }} />
                                        <div style={{ width: '1px', height: '20px', backgroundColor: '#518ccbff', margin: '0 6px' }} />
                                    </div>
                                    <CFormInput
                                        placeholder="Company Name"
                                        value={company}
                                        onChange={(e) => setCompany(e.target.value)}
                                        required
                                        style={{ border: 'none', outline: 'none', fontSize: '0.9rem', flex: 1 }}
                                    />
                                </div>

                                {/* Exp Field */}
                                <div
                                    className="mb-3 d-flex align-items-center"
                                    style={{
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                    }}
                                >
                                    <div className="d-flex align-items-center px-2">
                                        <CIcon icon={cilBriefcase} style={{ color: '#326396ff', fontSize: '16px' }} />
                                        <div style={{ width: '1px', height: '20px', backgroundColor: '#669fddff', margin: '0 6px' }}></div>
                                    </div>
                                    <CFormInput
                                        type="number"           // changed from "experience" to "number"
                                        placeholder="Experience Required"
                                        value={exp}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            // Allow only positive numbers
                                            if (/^\d*$/.test(value)) {
                                                setExp(value);
                                            }
                                        }}
                                        required
                                        style={{ border: 'none', outline: 'none', fontSize: '0.9rem', flex: 1 }}
                                        min="0"                 // optional: restrict to non-negative numbers
                                        step="1"                // optional: only integers
                                    />
                                </div>


                                <div
                                    className="mb-3 d-flex align-items-center"
                                    style={{
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                    }}
                                >
                                    <div className="d-flex align-items-center px-2">
                                        <CIcon icon={cilListRich} style={{ color: '#326396ff', fontSize: '16px' }} />
                                        <div style={{ width: '1px', height: '20px', backgroundColor: '#669fddff', margin: '0 6px' }}></div>
                                    </div>
                                    <CFormInput
                                        placeholder="Skills Required (e.g. React, Node, SQL)"
                                        value={skills}
                                        onChange={(e) => setSkills(e.target.value)}
                                        required
                                        style={{ border: 'none', outline: 'none', fontSize: '0.9rem', flex: 1 }}
                                    />
                                </div>

                                <div
                                    className="mb-3 d-flex align-items-center"
                                    style={{
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                    }}
                                >
                                    <CFormInput
                                        component="textarea"
                                        rows={6}
                                        placeholder="Job Description"
                                        value={description}
                                        onChange={(e) => setJobDescription(e.target.value)}
                                        style={{ border: 'none', outline: 'none', fontSize: '0.9rem', flex: 1 }}
                                    />
                                </div>
                                <div className="mb-3">
                                    <CFormInput
                                        type="file"
                                        accept=".pdf,.doc,.docx"
                                        onChange={(e) => setJobFile(e.target.files[0])}
                                    />
                                    <small className="text-muted">
                                        Upload Job Description (PDF / DOC / DOCX)
                                    </small>
                                </div>


                                {/* Submit Button */}
                                <CButton
                                    type="submit"
                                    disabled={loading}
                                    className="mt-3 mt-md-4 py-2 w-100 w-md-auto"
                                    style={{
                                        width: '100%',
                                        display: 'block',
                                        margin: '0 auto',
                                        background: 'linear-gradient(90deg, #5f8ed0ff 0%, #4a5dcaff 100%)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '0.95rem',
                                        fontWeight: 400,
                                        color: 'white',
                                        opacity: loading ? 0.7 : 1,
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                        maxWidth: '80%'
                                    }}
                                >
                                    {loading ? 'Creating Job...' : 'Add Job'}
                                </CButton>



                            </CForm>
                        </CCardBody>
                    </CCard>
                </CCol>

            </CRow>

        </CContainer>
    )
}

export default JobForm
