import React, { useState } from 'react'
import '../users/AddUser.css'
import './jobFormFloating.css'
import {
    CCard, CCardBody, CCol, CContainer, CForm, CFormInput,
    CFormTextarea,
    CRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
    cilUser, cilBuilding, cilBriefcase, cilListRich
} from '@coreui/icons'
import {
    CreateJobApi
} from '../../../api/api'
import { useAppAlert } from '../../../context/AppAlertContext'

const JobForm = ({ onClose = () => {} }) => {
    const { showSuccess, showError } = useAppAlert()
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
            showError('User not logged in', 1500)
            setLoading(false)
            return
        }

        const user = JSON.parse(userObj)
        const userId = user.user_id
        if (!userId) {
            showError('User not logged in', 1500)
            setLoading(false)
            return
        }
        const formData = new FormData()
        formData.append('title', title)
        formData.append('experience', exp)
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
            showSuccess('Job created successfully!', 1500)
            // reset
            setTitle('')
            setExp('')
            setCompany('')
            setSkills('')
            setJobDescription('')
            setJobFile(null)

        } catch (err) {
            showError('Failed to create job', 1500)
        } finally {
            setLoading(false)
        }
    }

    return (
        <CContainer style={{ fontFamily: 'Inter, sans-serif', maxWidth: '2000px', padding: '0.3rem' }}>
            {/* Add Form */}
            <CRow className="justify-content-center mb-3 mb-md-5">
                <CCol xs={11} sm={11} md={10} lg={8} xl={6}>
                    <CCard
                        className="mx-1 mx-md-4"
                        style={{
                            borderRadius: '2px', // slightly rounded corners
                            boxShadow: 'none',
                            border: 'px solid grey', // red border
                        }}
                    >
                       


                           <button
                            type="button"
                            onClick={() => {
                                setTitle('');
                                setCompany('');
                                setSkills('');
                                setExp('');
                                setJobDescription('');
                                setJobFile(null);
                                console.log("close clicked");
                            onClose?.();
                            }}

                            style={{
                                position: 'absolute',
                                top: '10px',
                                right: '10px',
                               // background: '#f1f5f9',
                                border: 'none',
                                fontSize: '22px',
                                cursor: 'pointer',
                                color: '#475569',
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 10
                            }}
                            >
                            ×
                            </button>
                        <CCardBody className="p-2 p-md-3">
                            <CForm onSubmit={handleSubmit}>
                                {/* Heading */}
                                <h1
                                    style={{
                                        fontWeight: 450,
                                        textAlign: 'center',
                                        marginBottom: '0.3rem',
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
                                        marginBottom: '1.1rem',
                                        fontSize: '0.85rem',
                                        fontFamily: 'Inter, sans-serif',
                                    }}
                                >
                                    Fill details to create a new job
                                </p>

                                {/* Title Field */}
                                <div
                                    className="mb-2 d-flex align-items-center"
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

                                <div className="mb-2 d-flex align-items-center" style={{ border: '1px solid #e2e8f0', borderRadius: '8px' }}>
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
                                {/* <div
                                    className="mb-2 d-flex align-items-center"
                                    style={{
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                    }}
                                >
                                    <div className="d-flex align-items-center px-2">
                                        <CIcon icon={cilBriefcase} style={{ color: '#326396ff', fontSize: '16px' }} />
                                        <div style={{ width: '1px', height: '20px', backgroundColor: '#669fddff', margin: '0 6px' }}></div>
                                    </div>
                                    {/* <CFormInput
                                            
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
                                </div> */}

                                <div className="mb-2 d-flex align-items-center" style={{ border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                                    <div className="d-flex align-items-center px-2">
                                        <CIcon icon={cilBuilding} style={{ color: '#326396ff', fontSize: '16px' }} />
                                        <div style={{ width: '1px', height: '20px', backgroundColor: '#518ccbff', margin: '0 6px' }} />
                                    </div>
                                    <CFormInput
                                        placeholder="Experience required"
                                        value={exp}
                                        onChange={(e) => setExp(e.target.value)}
                                        required
                                        style={{ border: 'none', outline: 'none', fontSize: '0.9rem', flex: 1 }}
                                    />
                                </div>

                                <div
                                    className="mb-2 d-flex align-items-center"
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
                                    className="mb-2"
                                    style={{
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                        padding: '10px 12px',
                                    }}
                                >
                                    <div className="d-flex align-items-center gap-2 mb-2">
                                        <CIcon icon={cilListRich} style={{ color: '#326396ff', fontSize: '16px' }} />
                                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Job Description</span>
                                    </div>
                                    <CFormTextarea
                                        rows={6}
                                        placeholder="Describe the role, responsibilities, and requirements…"
                                        value={description}
                                        onChange={(e) => setJobDescription(e.target.value)}
                                        style={{
                                            width: '100%',
                                            minHeight: '140px',
                                            maxWidth: '100%',
                                            resize: 'vertical',
                                            fontSize: '0.9rem',
                                            lineHeight: 1.5,
                                            whiteSpace: 'pre-wrap',
                                            overflowWrap: 'break-word',
                                            wordBreak: 'break-word',
                                        }}
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
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="tms-job-btn-primary mt-3 mt-md-4 w-100 w-md-auto"
                                    style={{
                                        width: '100%',
                                        display: 'block',
                                        margin: '0 auto',
                                        maxWidth: '80%',
                                    }}
                                >
                                    {loading ? 'Creating...' : 'Add Job'}
                                </button>



                            </CForm>
                        </CCardBody>
                    </CCard>
                </CCol>

            </CRow>

        </CContainer>
    )
}

export default JobForm
