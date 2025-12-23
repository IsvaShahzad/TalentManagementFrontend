import React, { useEffect, useState } from 'react'
import {
    CContainer, CFormInput, CButton, CAlert, CCard,
    CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilTrash, cilPencil, cilSearch } from '@coreui/icons'
import { getAllJobs, updateJob, deleteJob, getJDSignedUrl, getRecruiters } from '../../../api/api'
import axios from 'axios'

const DisplayJobsTable = () => {
    const [jobs, setJobs] = useState([])
    const [filter, setFilter] = useState('')
    const [showAlert, setShowAlert] = useState(false)
    const [alertMessage, setAlertMessage] = useState('')
    const [alertColor, setAlertColor] = useState('success')
    const [editingJob, setEditingJob] = useState(null)
    const [deletingJob, setDeletingJob] = useState(null)
    const [editableJob, setEditableJob] = useState({})
    const [recruiters, setRecruiters] = useState([]);
    const [selectedRecruiter, setSelectedRecruiter] = useState(null);

    //  useEffect(() => {
    const fetchRecruiters = async () => {
        //  res = 
        setRecruiters(await getRecruiters());
    };
    //  fetchRecruiters();
    //}, []);

    const fetchJobs = async () => {
        try {
            const response = await getAllJobs()
            //  const jobsArray = response.jobs || response.data || []
            const formatted = response.map(j => ({
                job_id: j.job_id,
                title: j.title,
                company: j.company,
                skills: j.skills,
                experience: j.experience,
                description: j.description,
                date: new Date(j.created_at).toISOString(),
                url: j.jd_url,
                //posted_by: j.posted_by,
                posted_by: j.postedByUser?.full_name || '—',
                assigned_to: j.assigned_to,
            }))
            setJobs(formatted)
        } catch (err) {
            console.error('Failed to fetch jobs:', err)
            setJobs([])
        }
    }

    useEffect(() => {
        fetchRecruiters()
        fetchJobs()
        const handleJobAdded = () => fetchJobs()
        window.addEventListener('jobAdded', handleJobAdded)
        return () => window.removeEventListener('jobAdded', handleJobAdded)

    }, [])

    const handleOpenJD = async (jobId) => {
        try {
            const res = await getJDSignedUrl(jobId)
            window.open(res.signedUrl, '_blank')
        } catch (err) {
            console.error('Failed to open JD:', err)
            setAlertMessage('Failed to open JD file')
            setAlertColor('danger')
            setShowAlert(true)
            setTimeout(() => setShowAlert(false), 3000)
        }
    }

    const handleEditClick = (job) => {
        setEditingJob(job)
        setEditableJob({ ...job })
        // 🔑 THIS IS CRITICAL
        setSelectedRecruiter(job.assigned_to || null);
        console.log("Initial selected recruiter:", job.assigned_to);
    }

    const handleDeleteClick = (job) => {
        setDeletingJob(job)
    }

    const handleCancel = () => {
        setEditingJob(null)
        setDeletingJob(null)
        setEditableJob({})
    }

    const handleSave = async () => {
        console.log("entering handle")
        try {
            const formData = new FormData();
            formData.append("id", editableJob.job_id);
            formData.append("title", editableJob.title);
            formData.append("company", editableJob.company);
            formData.append("skills", editableJob.skills);
            // formData.append("experience", editableJob.experience);
            formData.append('experience', editableJob.experience ? parseInt(editableJob.experience, 10) : null)
            formData.append("description", editableJob.description);
            // formData.append("assigned_to", selectedRecruiter);
            if (editableJob.jd_file) {
                formData.append("jd_file", editableJob.jd_file);
            }
            //            console.log("Saving job with recruiter:", selectedRecruiter);

            // Log FormData contents for debugging
            console.log("updated job details being sent:");
            // for (let [key, value] of formData.entries()) {
            //     console.log(`${key}:`, value);
            // }
            // const response = await updateJob(formData)
            const response = await axios.put(`http://localhost:7000/api/job/jobUpdate`, formData);

            console.log("response after job update", response)
            //  setJobs(prev => prev.map(j => j.title === editableJob.title ? editableJob : j))
            //setJobs(prev => prev.filter(j => j.job_id !== editingJob.job_id))
            fetchJobs()
            setAlertMessage(`Job "${editableJob.title}" updated successfully`)
            setAlertColor('success')
            setShowAlert(true)
            setTimeout(() => setShowAlert(false), 3000)
            handleCancel()
        } catch (err) {
            console.error('Update failed:', err)
            setAlertMessage('Failed to update job.')
            setAlertColor('danger')
            setShowAlert(true)
            setTimeout(() => setShowAlert(false), 3000)
        }
    }

    const handleConfirmDelete = async () => {
        try {
            console.log("deleting job", deleteJob)
            console.log("deleting job id", deletingJob.job_id)
            await deleteJob(deletingJob.job_id)
            // setJobs(prev => prev.filter(j => j.title !== deletingJob.title))
            setAlertMessage(`Job "${deletingJob.title}" deleted successfully`)
            setAlertColor('success')
            setShowAlert(true)
            setTimeout(() => setShowAlert(false), 2000)
            handleCancel()
        } catch (err) {
            console.error('Delete failed:', err)
            setAlertMessage('Failed to delete job.')
            setAlertColor('danger')
            setShowAlert(true)
            setTimeout(() => setShowAlert(false), 3000)
        }
    }

    const handleAssignRecruiter = async (jobId, recruiterId) => {
        console.log("Assigning recruiter:", { jobId, recruiterId });

        console.log("Assigning recruiter:", { jobId, recruiterId });

        // 🔹 Get job & recruiter details for alert
        const job = jobs.find(j => j.job_id === jobId);
        const jobTitle = job?.title || 'Job';

        const recruiterName = recruiters.find(
            r => r.recruiter_id === recruiterId
        )?.full_name || 'Recruiter';


        // 1️⃣ Optimistic UI update
        setJobs(prev =>
            prev.map(j =>
                j.job_id === jobId
                    ? { ...j, assigned_to: recruiterId || null }
                    : j
            )
        );

        try {
            const formData = new FormData();
            formData.append("id", jobId);
            formData.append("assigned_to", recruiterId ?? "");


            await updateJob(formData);

            console.log("Recruiter saved successfully");
            //  setAlertMessage(`Recruiter added successfully`)
            setAlertMessage(
                `Recruiter "${recruiterName}" has been assigned job "${jobTitle}".`
            );
            setAlertColor('success')
            setShowAlert(true)
            setTimeout(() => setShowAlert(false), 3000)
        } catch (err) {
            console.error("Failed to assign recruiter:", err);

            // 2️⃣ Revert UI on failure
            fetchJobs();

            setAlertMessage("Failed to assign recruiter");
            setAlertColor("danger");
            setShowAlert(true);
            setTimeout(() => setShowAlert(false), 2000);
        }
    };


    const filteredJobs = jobs.filter(j =>
        j.title.toLowerCase().includes(filter.toLowerCase()) ||
        j.company.toLowerCase().includes(filter.toLowerCase()) ||
        j.skills.toLowerCase().includes(filter.toLowerCase())
    )

    return (
        <CContainer style={{ fontFamily: 'Inter, sans-serif', marginTop: '2rem', padding: '0 1rem', fontSize: '0.85rem' }}>
            {showAlert && (
                <CAlert color={alertColor} className="toast-alert text-center" style={{ fontSize: '0.85rem' }}>
                    {alertMessage}
                </CAlert>
            )}

            {/* Search Bar */}
            <div className="px-3 py-2" style={{ borderBottom: '1px solid #e5e7eb', background: '#f9fafb', display: 'flex', justifyContent: 'center' }}>
                <div style={{ position: 'relative', maxWidth: '400px', width: '100%', marginBottom: '1rem' }}>
                    <CFormInput
                        placeholder="Search job by title, company or skills"
                        value={filter}
                        onChange={e => setFilter(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.45rem 0.75rem 0.45rem 1.8rem',
                            fontSize: '0.85rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '0.25rem',
                            backgroundColor: '#fff',
                            marginTop: '0.8rem'
                        }}
                    />
                    <CIcon
                        icon={cilSearch}
                        style={{ position: 'absolute', left: '6px', top: '60%', transform: 'translateY(-50%)', color: '#6b7280', fontSize: '0.95rem' }}
                    />
                </div>
            </div>

            {/* Table */}
            <div style={{ border: '1px solid #d1d5db', borderRadius: '0.25rem', overflow: 'hidden', background: '#fff' }}>
                <CTable hover responsive>
                    <CTableHead color="light">
                        <CTableRow style={{ fontSize: '0.85rem' }}>
                            <CTableHeaderCell>Title</CTableHeaderCell>
                            <CTableHeaderCell>Company</CTableHeaderCell>
                            <CTableHeaderCell>Skills</CTableHeaderCell>
                            <CTableHeaderCell>Experience</CTableHeaderCell>
                            <CTableHeaderCell>Created At</CTableHeaderCell>
                            <CTableHeaderCell>Posted By</CTableHeaderCell>
                            <CTableHeaderCell>JD File</CTableHeaderCell>

                            <CTableHeaderCell>Assign To</CTableHeaderCell>
                            <CTableHeaderCell>Actions</CTableHeaderCell>
                        </CTableRow>
                    </CTableHead>

                    <CTableBody>
                        {filteredJobs.length === 0 ? (
                            <CTableRow>
                                <CTableDataCell colSpan={7} style={{ textAlign: 'center', color: '#6B7280' }}>
                                    No jobs found.
                                </CTableDataCell>
                            </CTableRow>
                        ) : filteredJobs.map((j, index) => {
                            const dateObj = new Date(j.date)
                            const date = dateObj.toLocaleDateString()
                            const time = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

                            return (
                                <CTableRow key={index}>
                                    <CTableDataCell>{j.title}</CTableDataCell>
                                    <CTableDataCell>{j.company}</CTableDataCell>
                                    <CTableDataCell>{j.skills}</CTableDataCell>
                                    <CTableDataCell>{j.experience} yrs</CTableDataCell>
                                    <CTableDataCell>{`${date} ${time}`}</CTableDataCell>
                                    <CTableDataCell>{j.posted_by}</CTableDataCell>
                                    <CTableDataCell>
                                        {j.url ? (
                                            <span
                                                onClick={() => handleOpenJD(j.job_id)}
                                                style={{
                                                    color: '#1E3A8A',
                                                    fontWeight: 500,
                                                    textDecoration: 'underline',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Open File
                                            </span>
                                        ) : (
                                            <span style={{ color: '#6B7280' }}>No JD</span>
                                        )}

                                    </CTableDataCell>


                                    <CTableDataCell>
                                        <select
                                            value={j.assigned_to ?? ""}
                                            onChange={(e) => handleAssignRecruiter(j.job_id, e.target.value)}
                                        >
                                            <option value="">None</option>
                                            {recruiters.map(r => (
                                                <option key={r.recruiter_id} value={r.recruiter_id}>
                                                    {r.full_name}
                                                </option>
                                            ))}
                                        </select>

                                    </CTableDataCell>


                                    <CTableDataCell>
                                        <CIcon icon={cilPencil} style={{ color: '#185883ff', cursor: 'pointer', fontSize: '1rem', marginRight: '0.5rem' }} onClick={() => handleEditClick(j)} />
                                        <CIcon icon={cilTrash} style={{ color: '#bc200fff', cursor: 'pointer', fontSize: '1rem' }} onClick={() => handleDeleteClick(j)} />
                                    </CTableDataCell>

                                </CTableRow>
                            )
                        })}
                    </CTableBody>
                </CTable>
            </div>

            {/* Modals */}
            {(editingJob || deletingJob) && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
                    {editingJob && (
                        <CCard
                            className="p-4 position-relative"
                            style={{
                                width: '90%',
                                maxWidth: '500px',
                                borderRadius: '0.25rem',
                                display: 'flex',
                                flexDirection: 'column',
                                margin: '1rem',
                                fontSize: '0.85rem',
                            }}
                        >
                            {/* Close Button */}
                            <button
                                onClick={handleCancel}
                                style={{
                                    position: 'absolute',
                                    top: '10px',
                                    right: '10px',
                                    background: 'transparent',
                                    border: 'none',
                                    fontSize: '1.2rem',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                }}
                            >
                                &times;
                            </button>



                            {/* Centered Title */}
                            <h4
                                style={{
                                    fontWeight: 600,
                                    fontSize: '1.2rem',
                                    marginBottom: '0.5rem',
                                    textAlign: 'center', // Center the title
                                }}
                            >
                                Update Job
                            </h4>



                            <CFormInput
                                className="mb-2"
                                label="Title"
                                value={editableJob.title}
                                onChange={e => setEditableJob({ ...editableJob, title: e.target.value })}
                                size="sm"
                            />
                            <CFormInput
                                className="mb-2"
                                label="Company"
                                value={editableJob.company}
                                onChange={e => setEditableJob({ ...editableJob, company: e.target.value })}
                                size="sm"
                            />
                            <CFormInput
                                className="mb-2"
                                label="Skills"
                                value={editableJob.skills}
                                onChange={e => setEditableJob({ ...editableJob, skills: e.target.value })}
                                size="sm"
                            />

                            <CFormInput
                                type="number"
                                className="mb-2"
                                label="Experience"
                                value={editableJob.experience}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    // Allow only positive integers
                                    if (/^\d*$/.test(value)) {
                                        setEditableJob({ ...editableJob, experience: value });
                                    }
                                }}
                                required
                                style={{ border: 'none', outline: 'none', fontSize: '0.9rem', flex: 1 }}
                                min="0"
                                step="1"
                                size="sm"
                            />

                            <CFormInput
                                className="mb-2"
                                label="Job Description"
                                value={editableJob.description}
                                onChange={e => setEditableJob({ ...editableJob, description: e.target.value })}
                                component="textarea"
                                rows={4}
                            />
                            {/* JD Upload */}
                            <CFormInput
                                type="file"
                                className="mb-3"
                                label="Upload JD"
                                onChange={e => setEditableJob({ ...editableJob, jd_file: e.target.files[0] })}
                            />

                            <div className="d-flex justify-content-center mt-3">
                                <CButton color="success" onClick={handleSave} size="lg">
                                    Update
                                </CButton>
                            </div>
                        </CCard>
                    )}

                    {deletingJob && (
                        <CCard className="p-4 text-center" style={{ width: '90%', maxWidth: '450px', borderRadius: '0.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', margin: '1rem', fontSize: '0.85rem' }}>
                            <h5 style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '1rem' }}>Confirm Delete</h5>
                            <p style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: '1.5rem' }}>
                                Are you sure you want to delete <strong>{deletingJob.title}</strong>?
                            </p>
                            <div className="d-flex justify-content-center gap-3 mt-3 flex-wrap">
                                <CButton color="secondary" onClick={handleCancel} size="lg">Cancel</CButton>
                                <CButton onClick={handleConfirmDelete} size="lg" style={{ backgroundColor: '#d62828', border: 'none', color: 'white' }}>Delete</CButton>
                            </div>
                        </CCard>
                    )}
                </div>
            )}
        </CContainer>
    )
}

export default DisplayJobsTable
