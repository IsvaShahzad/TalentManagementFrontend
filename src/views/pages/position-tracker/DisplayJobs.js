import React, { useState, useEffect } from 'react'
import {
  CContainer,
  CTable,
  CTableHead,
  CTableBody,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CAlert,
  CFormInput,
  CButton,
  CCard,
  CCardBody,
  CRow,
  CCol,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilTrash, cilSearch } from '@coreui/icons'
import { getAllJobs, updateJob, deleteJob, getJDSignedUrl, getRecruiters, getAllClients, assignClientToJob } from '../../../api/api'
import axios from 'axios'




const DisplayJobsTable = () => {
  const [jobs, setJobs] = useState([])
  const [filter, setFilter] = useState('')
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [alertColor, setAlertColor] = useState('success')
  const [editingJob, setEditingJob] = useState(null)
  const [deletingJob, setDeletingJob] = useState(null)
  const [recruiters, setRecruiters] = useState([])
  const [clients, setClients] = useState([])
  const [selectedRecruiter, setSelectedRecruiter] = useState(null)
  const [skillInput, setSkillInput] = useState('')
  const [editableJob, setEditableJob] = useState({ skills: [] })


  const handleAssignClient = async (jobId, clientId, candidateName) => {
    if (!clientId) return;

    try {
      // Assign client via API
      await assignClientToJob({ jobId, clientId });

      // Update jobs locally
      setJobs((prev) =>
        prev.map((j) =>
          j.job_id === jobId ? { ...j, assigned_client_id: clientId } : j
        )
      );

      // Get client and job names
      const client = clients.find((c) => c.user_id === clientId);
      const clientName = client?.full_name || 'Client';
      const job = jobs.find((j) => j.job_id === jobId);
      const jobTitle = job?.title || 'Job';
      const candidate = candidateName || 'Candidate';

      // Show floating alert
      setAlertMessage(
        `job "${jobTitle}" linked/refered with client "${clientName}" successfully!`
      );
      setAlertColor('success');
      setShowAlert(true);

      // Hide after 3s
      setTimeout(() => setShowAlert(false), 3000);
    } catch (err) {
      console.error('Assignment failed:', err);
      setAlertMessage('Failed to assign client');
      setAlertColor('danger');
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    }
  };





  // const handleEditClick = (job) => {
  //   setEditingJob(job)

  //   setEditableJob({
  //     job_id: job.job_id,
  //     title: job.title || '',
  //     company: job.company || '',
  //     experience: job.experience || '',
  //     skills: Array.isArray(job.skills)
  //       ? job.skills
  //       : job.skills?.split(',').map((s) => s.trim()) || [],

  //     // ✅ THESE WERE MISSING
  //     job_description: job.job_description || job.description || '',
  //     existing_jd: job.url || job.jd_url || null,

  //     jd_file: null,
  //   })

  //   setSkillInput('')
  //   setSelectedRecruiter(job.assigned_to || null)
  // }

  const handleEditClick = (job) => {
    setEditingJob(job)
    setEditableJob({
      job_id: job.job_id,
      title: job.title || '',
      company: job.company || '',
      skills: Array.isArray(job.skills)
        ? job.skills
        : job.skills?.split(',').map((s) => s.trim()) || [],
      experience: job.experience || '',
      description: job.job_description || job.description || '',  // use job_description from normalizeJob
      jd_file: null,                       // file input starts empty
      jd_url: job.url || '',               // existing JD link
      assigned_client_id: job.assigned_client_id || '',
      assigned_to: job.assigned_to || '',
    })
    setSkillInput('')
    setSelectedRecruiter(job.assigned_to || null)
  }








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


  const handleDeleteClick = (job) => {
    setDeletingJob(job)
  }

  const handleCancel = () => {
    setEditingJob(null)
    setDeletingJob(null)
    setEditableJob({ skills: [] })
    setSkillInput('')
  }

  const handleSave = async () => {
    try {
      const formData = new FormData()
      formData.append('id', editableJob.job_id)
      formData.append('title', editableJob.title)
      formData.append('company', editableJob.company)
      formData.append('skills', editableJob.skills.join(','))
      formData.append('experience', editableJob.experience ? parseInt(editableJob.experience, 10) : null)
      formData.append('description', editableJob.description) // <-- add this
      if (editableJob.jd_file) formData.append('jd_file', editableJob.jd_file) // <-- add this

      const response = await axios.put(`http://localhost:7000/api/job/jobUpdate`, formData)

      // Refresh jobs properly
      const updatedJobs = await getAllJobs()
      //    setJobs(updatedJobs.map((j) => ({
      //   ...j,
      //   skills: j.skills ? j.skills.split(',').map((s) => s.trim()) : [],
      //   description: j.job_description || j.description || '', // <-- fix here
      //   url: j.jd_url || '',
      //   date: j.created_at ? new Date(j.created_at).toISOString() : new Date().toISOString(),
      // })))
      setJobs(updatedJobs.map(normalizeJob))



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
      await deleteJob(deletingJob.job_id)

      setJobs((prevJobs) =>
        prevJobs.filter((j) => j.job_id !== deletingJob.job_id)
      )

      handleCancel() // close modal first

      setAlertMessage(`Job "${deletingJob.title}" deleted successfully`)
      setAlertColor('success')
      setShowAlert(true)

      setTimeout(() => setShowAlert(false), 2000)
    } catch (err) {
      console.error('Delete failed:', err)

      setAlertMessage('Failed to delete job.')
      setAlertColor('danger')
      setShowAlert(true)

      setTimeout(() => setShowAlert(false), 3000)
    }
  }



  const handleAssignRecruiter = async (jobId, recruiterId) => {
    setJobs((prev) =>
      prev.map((j) => (j.job_id === jobId ? { ...j, assigned_to: recruiterId || null } : j)),
    )
    try {
      const formData = new FormData()
      formData.append('id', jobId)
      formData.append('assigned_to', recruiterId ?? '')
      await updateJob(formData)

      const job = jobs.find((j) => j.job_id === jobId)
      const jobTitle = job?.title || 'Job'
      const recruiterName = recruiters.find((r) => r.recruiter_id === recruiterId)?.full_name || 'Recruiter'

      setAlertMessage(`Recruiter "${recruiterName}" has been assigned to the job "${jobTitle}".`);
      setAlertColor('success')
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 3000)
    } catch (err) {
      console.error('Failed to assign recruiter:', err)
      setAlertMessage('Failed to assign recruiter')
      setAlertColor('danger')
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 2000)
      // revert
      const refreshedJobs = await getAllJobs()
      setJobs(refreshedJobs.map((j) => ({
        ...j,
        skills: j.skills ? j.skills.split(',').map((s) => s.trim()) : [],
      })))
    }
  }


  // Normalize jobs for consistent structure
  const normalizeJob = (j) => ({
    job_id: j.job_id,
    title: j.title,
    company: j.company,
    client_name: j.Client?.user?.full_name || null,
    assigned_client_id: j.Client?.user?.user_id || '',
    assigned_to: j.assigned_to || '',
    experience: j.experience || 0,
    skills: j.skills ? j.skills.split(',').map((s) => s.trim()) : [],
    date: j.created_at
      ? isNaN(new Date(j.created_at).getTime())
        ? new Date().toISOString()
        : new Date(j.created_at).toISOString()
      : new Date().toISOString(),
    posted_by: j.postedByUser?.full_name || 'System',
    url: j.jd_url,
    job_description: j.job_description || j.description || '',
  })


  // Fetch jobs, recruiters, clients
  const fetchAll = async () => {
    try {
      const jobRes = await getAllJobs()
      setJobs(jobRes.map(normalizeJob))
      const recruiterRes = await getRecruiters()
      setRecruiters(recruiterRes)
      const clientRes = await getAllClients()
      setClients(clientRes.data || [])
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchAll()

    // Listen for jobAdded event to refresh the table
    const handleJobAdded = () => fetchAll()
    window.addEventListener('jobAdded', handleJobAdded)
    return () => window.removeEventListener('jobAdded', handleJobAdded)
  }, [])

  // Filtered jobs based on search
  const filteredJobs = jobs.filter(
    (j) =>
      j.title.toLowerCase().includes(filter.toLowerCase()) ||
      j.company.toLowerCase().includes(filter.toLowerCase()) ||
      j.skills.join(',').toLowerCase().includes(filter.toLowerCase()),
  )

  return (
    <CContainer style={{
      fontFamily: 'Inter, sans-serif',
      marginTop: '2rem',
      fontSize: '0.75rem',
      maxWidth: '98vw',
      padding: '0 1rem'
    }}>



      {showAlert && (
        <div
          style={{
            position: 'fixed',
            top: '1rem',
            right: '1rem',
            zIndex: 99999,
            minWidth: '250px',
            padding: '0.75rem 1rem',
            borderRadius: '0.5rem',
            backgroundColor: alertColor === 'success' ? '#16a34a' : '#dc2626', // green/red
            color: '#fff',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            fontSize: '0.85rem',
            textAlign: 'center',
            transition: 'opacity 0.3s ease-in-out',
          }}
        >
          {alertMessage}
        </div>
      )}

      {/* Jobs Table */}
      <CCard
        style={{
          background: '#ffffff',
          padding: '2rem 1rem',
          border: '1px solid #d4d5d6ff',
          borderRadius: '0px',
          boxShadow: 'none',
          marginTop: '1rem',
          width: '100%',
          maxWidth: '100%',
        }}
      >
        <CCardBody style={{ padding: '1rem' }}>
          {/* Search bar centered */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <div style={{ position: 'relative', width: '300px' }}>
              <CFormInput
                placeholder="Search by title, company or skills"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.45rem 0.75rem 0.45rem 1.8rem',
                  fontSize: '0.85rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.25rem',
                  backgroundColor: '#fff',
                }}
              />
              <CIcon
                icon={cilSearch}
                style={{ position: 'absolute', left: '6px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280', fontSize: '0.95rem' }}
              />
            </div>
          </div>

          {/* Table */}
          <div
            className="table-scroll"
            style={{
              overflowX: 'auto',
              overflowY: 'auto',
              maxHeight: '600px',
              width: '100%',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            <CTable
              className="align-middle"
              style={{
                borderCollapse: 'collapse',
                border: '1px solid #d1d5db',
                fontSize: 'clamp(0.7rem, 1.5vw, 0.9rem)',
                whiteSpace: 'nowrap',
                tableLayout: 'auto',
                minWidth: '1400px',
              }}
            >
              <CTableHead color="light" style={{ borderBottom: '2px solid #d1d5db' }}>
                <CTableRow style={{ fontSize: '0.8rem' }}>
                  <CTableHeaderCell style={{ border: '0.5px solid #d1d5db', padding: '0.5rem', minWidth: '150px' }}>Title</CTableHeaderCell>
                  <CTableHeaderCell style={{ border: '0.5px solid #d1d5db', padding: '0.5rem', minWidth: '120px' }}>Company</CTableHeaderCell>
                  <CTableHeaderCell style={{ border: '0.5px solid #d1d5db', padding: '0.5rem', minWidth: '200px' }}>Skills</CTableHeaderCell>
                  <CTableHeaderCell style={{ border: '0.5px solid #d1d5db', padding: '0.5rem', minWidth: '100px' }}>Experience</CTableHeaderCell>
                  <CTableHeaderCell style={{ border: '0.5px solid #d1d5db', padding: '0.5rem', minWidth: '150px' }}>Client</CTableHeaderCell>
                  <CTableHeaderCell style={{ border: '0.5px solid #d1d5db', padding: '0.5rem', minWidth: '130px' }}>Created At</CTableHeaderCell>
                  <CTableHeaderCell style={{ border: '0.5px solid #d1d5db', padding: '0.5rem', minWidth: '120px' }}>Posted By</CTableHeaderCell>
                  <CTableHeaderCell style={{ border: '0.5px solid #d1d5db', padding: '0.5rem', minWidth: '100px' }}>JD File</CTableHeaderCell>
                  <CTableHeaderCell style={{ border: '0.5px solid #d1d5db', padding: '0.5rem', minWidth: '150px' }}>Assign To</CTableHeaderCell>
                  <CTableHeaderCell style={{ border: '0.5px solid #d1d5db', padding: '0.5rem', minWidth: '100px' }}>Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>

              <CTableBody>
                {filteredJobs.length === 0 ? (
                  <CTableRow>
                    <CTableDataCell colSpan={10} className="text-center text-muted" style={{ border: '1px solid #d1d5db', padding: '0.75rem', fontSize: '0.75rem' }}>
                      No jobs found.
                    </CTableDataCell>
                  </CTableRow>
                ) : (
                  filteredJobs.map((j, idx) => {
                    const dateObj = new Date(j.date)
                    const date = dateObj.toLocaleDateString()
                    const time = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

                    return (
                      <CTableRow key={idx} style={{ backgroundColor: '#fff', fontSize: '0.85rem' }}>
                        <CTableDataCell style={{ border: '0.5px solid #d1d5db', padding: '0.5rem' }}>{j.title}</CTableDataCell>
                        <CTableDataCell style={{ border: '0.5px solid #d1d5db', padding: '0.5rem' }}>{j.company}</CTableDataCell>
                        <CTableDataCell style={{ border: '0.5px solid #d1d5db', padding: '0.5rem', minWidth: '200px' }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                            {j.skills.map((skill, id) => (
                              <span
                                key={id}
                                style={{
                                  background: '#eef2ff',
                                  color: '#1e40af',
                                  padding: '3px 8px',
                                  borderRadius: '999px',
                                  fontSize: '11px',
                                  fontWeight: 500,
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </CTableDataCell>
                        <CTableDataCell style={{ border: '0.5px solid #d1d5db', padding: '0.5rem' }}>{j.experience} yrs</CTableDataCell>

                        <CTableDataCell style={{ border: '0.5px solid #d1d5db', padding: '0.5rem' }}>
                          <select
                            value={j.assigned_client_id ?? ''}
                            onChange={(e) => handleAssignClient(j.job_id, e.target.value)}
                            style={{
                              padding: '4px',
                              fontSize: '0.85rem',
                              borderRadius: '4px',
                              border: '0.5px solid #d1d5db',
                              backgroundColor: '#fff',
                            }}
                          >
                            <option value="">Select Client</option>
                            {clients.map((c) => (
                              <option key={c.user_id} value={c.user_id}>
                                {c.full_name}
                              </option>
                            ))}
                          </select>
                        </CTableDataCell>

                        <CTableDataCell style={{ border: '0.5px solid #d1d5db', padding: '0.5rem' }}>{date} {time}</CTableDataCell>
                        <CTableDataCell style={{ border: '0.5px solid #d1d5db', padding: '0.5rem' }}>{j.posted_by}</CTableDataCell>
                        <CTableDataCell style={{ border: '0.5px solid #d1d5db', padding: '0.5rem' }}>
                          {j.url ? (
                            <span
                              onClick={() => handleOpenJD(j.job_id)}
                              style={{ color: '#1E3A8A', fontWeight: 500, textDecoration: 'underline', cursor: 'pointer' }}
                            >
                              Open File
                            </span>
                          ) : (
                            <span style={{ color: '#6B7280' }}>No JD</span>
                          )}
                        </CTableDataCell>

                        <CTableDataCell style={{ border: '0.5px solid #d1d5db', padding: '0.5rem' }}>
                          <select
                            value={j.assigned_to ?? ''}
                            onChange={(e) => handleAssignRecruiter(j.job_id, e.target.value)}
                            style={{
                              padding: '4px',
                              fontSize: '0.85rem',
                              borderRadius: '4px',
                              border: '0.5px solid #d1d5db',
                              backgroundColor: '#fff',
                            }}
                          >
                            <option value="">None</option>
                            {recruiters.map((r) => (
                              <option key={r.recruiter_id} value={r.recruiter_id}>
                                {r.full_name}
                              </option>
                            ))}
                          </select>
                        </CTableDataCell>

                        <CTableDataCell style={{ border: '0.5px solid #d1d5db', padding: '0.5rem' }}>
                          <CIcon
                            icon={cilPencil}
                            style={{ color: '#185883ff', cursor: 'pointer', fontSize: '1rem', marginRight: '0.5rem' }}
                            onClick={() => handleEditClick(j)}
                          />
                          <CIcon
                            icon={cilTrash}
                            style={{ color: '#bc200fff', cursor: 'pointer', fontSize: '1rem' }}
                            onClick={() => handleDeleteClick(j)}
                          />
                        </CTableDataCell>
                      </CTableRow>
                    )
                  })
                )}
              </CTableBody>
            </CTable>
          </div>
        </CCardBody>
      </CCard>


      {/* Edit/Delete Modal */}
      {(editingJob || deletingJob) && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
          }}
        >


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

              <h4 style={{ fontWeight: 600, fontSize: '1.2rem', marginBottom: '0.5rem', textAlign: 'center' }}>
                Update Job
              </h4>

              <CFormInput
                className="mb-2"
                label="Title"
                value={editableJob.title}
                onChange={(e) => setEditableJob({ ...editableJob, title: e.target.value })}
                size="sm"
              />
              <CFormInput
                className="mb-2"
                label="Company"
                value={editableJob.company}
                onChange={(e) => setEditableJob({ ...editableJob, company: e.target.value })}
                size="sm"
              />

              {/* Skills Tags Input */}
              <label style={{ fontSize: '0.85rem', marginBottom: '4px', display: 'block' }}>Skills</label>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px',
                  padding: '8px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  minHeight: '40px',
                  alignItems: 'center',
                  marginBottom: '0.5rem',
                }}
              >
                {editableJob.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    style={{
                      background: '#eef2ff',
                      color: '#1e40af',
                      padding: '4px 8px',
                      borderRadius: '999px',
                      fontSize: '12px',
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    {skill}
                    <span
                      onClick={() =>
                        setEditableJob({
                          ...editableJob,
                          skills: editableJob.skills.filter((s) => s !== skill),
                        })
                      }
                      style={{
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '14px',
                        marginLeft: '2px',
                      }}
                    >
                      &times;
                    </span>
                  </span>
                ))}
                <input
                  id="skillInput"
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    const trimmed = skillInput.trim();

                    // Add skill on Enter or Space
                    if ((e.key === 'Enter' || e.key === ' ') && trimmed) {
                      e.preventDefault();
                      if (!editableJob.skills.includes(trimmed)) {
                        setEditableJob({
                          ...editableJob,
                          skills: [...editableJob.skills, trimmed],
                        });
                      }
                      setSkillInput('');
                    }

                    // Backspace removes last skill if input empty
                    if (e.key === 'Backspace' && !trimmed && editableJob.skills.length) {
                      e.preventDefault();
                      setEditableJob({
                        ...editableJob,
                        skills: editableJob.skills.slice(0, -1),
                      });
                    }
                  }}
                  placeholder="Type skill + Enter"
                  style={{
                    border: 'none',
                    outline: 'none',
                    flex: 1,
                    minWidth: '100px',
                    fontSize: '0.85rem',
                    padding: '4px 2px',
                  }}
                />
              </div>



              <CFormInput
                type="number"
                className="mb-2"
                label="Experience"
                value={editableJob.experience}
                onChange={(e) => {
                  const value = e.target.value
                  if (/^\d*$/.test(value)) setEditableJob({ ...editableJob, experience: value })
                }}
                required
                size="sm"
              />
              <CFormInput
                className="mb-2"
                label="Job Description"
                value={editableJob.description || ''}
                onChange={(e) =>
                  setEditableJob({ ...editableJob, description: e.target.value })
                }
                component="textarea"
                rows={4}
              />

              <CFormInput
                type="file"
                className="mb-2"
                label={editableJob.jd_url ? "Upload New JD (will replace existing)" : "Upload JD"}
                onChange={(e) =>
                  setEditableJob({ ...editableJob, jd_file: e.target.files[0] })
                }
              />


              <div className="d-flex justify-content-center mt-3">
                <CButton color="success" onClick={handleSave} size="lg">
                  Update
                </CButton>
              </div>
            </CCard>
          )}


          {deletingJob && (
            <CCard
              className="p-4 text-center"
              style={{
                width: '90%',
                maxWidth: '450px',
                borderRadius: '0.25rem',
              }}
            >
              <h5>Confirm Delete</h5>
              <p>
                Are you sure you want to delete{' '}
                <strong>{deletingJob.title}</strong>?
              </p>

              <div className="d-flex justify-content-center gap-3 mt-3">
                <CButton color="secondary" onClick={handleCancel}>
                  Cancel
                </CButton>
                <CButton
                  style={{ backgroundColor: '#d62828', color: '#fff' }}
                  onClick={handleConfirmDelete}
                >
                  Delete
                </CButton>
              </div>
            </CCard>
          )}
        </div>
      )}

    </CContainer>
  )
}

export default DisplayJobsTable