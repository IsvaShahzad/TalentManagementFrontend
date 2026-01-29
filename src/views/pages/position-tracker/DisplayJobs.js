
// import React, { useEffect, useState } from 'react'
// import {
//   CContainer,
//   CFormInput,
//   CButton,
//   CAlert,
//   CCard,
//   CTable,
//   CTableHead,
//   CTableRow,
//   CTableHeaderCell,
//   CTableBody,
//   CTableDataCell,
// } from '@coreui/react'
// import CIcon from '@coreui/icons-react'
// import { cilTrash, cilPencil, cilSearch } from '@coreui/icons'
// import { getAllJobs, updateJob, deleteJob, getJDSignedUrl, getRecruiters, getAllClients, assignClientToJob } from '../../../api/api'
// import axios from 'axios'

// const DisplayJobsTable = () => {
//   const [jobs, setJobs] = useState([])
//   const [filter, setFilter] = useState('')
//   const [showAlert, setShowAlert] = useState(false)
//   const [alertMessage, setAlertMessage] = useState('')
//   const [alertColor, setAlertColor] = useState('success')
//   const [editingJob, setEditingJob] = useState(null)
//   const [deletingJob, setDeletingJob] = useState(null)
//   const [recruiters, setRecruiters] = useState([])
//   const [selectedRecruiter, setSelectedRecruiter] = useState(null)
//   const [skillInput, setSkillInput] = useState('')
//   const [editableJob, setEditableJob] = useState({
// skills: [], 


// })
//     const [clients, setClients] = useState([]) // Add near other useState hooks


//   useEffect(() => {
//     const fetchRecruiters = async () => {
//       try {
//         const res = await getRecruiters()
//         setRecruiters(res)
//       } catch (err) {
//         console.error('Failed to fetch recruiters:', err)
//       }
//     }

//     // Add this inside your existing useEffect block
// const fetchClients = async () => {
//   try {
//     const res = await getAllClients()
//     setClients(res.data || []) // Stores your client list
//   } catch (err) {
//     console.error('Failed to fetch clients:', err)
//   }
// }
// fetchClients() // Trigger the fetch

// const fetchJobs = async () => {
//   try {
//     const response = await getAllJobs();
//     const formatted = response.map((j) => ({
//       job_id: j.job_id,
//       title: j.title,
//       company: j.company,
//       skills: j.skills ? j.skills.split(',').map((s) => s.trim()) : [],
//       experience: j.experience,
//       description: j.description,
//       date: new Date(j.created_at).toISOString(),
//       url: j.jd_url,
//       posted_by: j.postedByUser?.full_name || '—',
//       assigned_to: j.assigned_to,
      
//       // FIX: Store the client_id here so the dropdown can "match" it
//       assigned_client_id: j.client_id || '', 
//     }));
//     setJobs(formatted);
//   } catch (err) {
//     console.error('Failed to fetch jobs:', err);
//     setJobs([]);
//   }
// };

//     fetchRecruiters()
//     fetchJobs()

//     const handleJobAdded = () => fetchJobs()
//     window.addEventListener('jobAdded', handleJobAdded)
//     return () => window.removeEventListener('jobAdded', handleJobAdded)
//   }, [])

//   const handleOpenJD = async (jobId) => {
//     try {
//       const res = await getJDSignedUrl(jobId)
//       window.open(res.signedUrl, '_blank')
//     } catch (err) {
//       console.error('Failed to open JD:', err)
//       setAlertMessage('Failed to open JD file')
//       setAlertColor('danger')
//       setShowAlert(true)
//       setTimeout(() => setShowAlert(false), 3000)
//     }
//   }

//   // Add skill tag on Enter
//   const handleAddSkill = (e) => {
//     if (e.key === 'Enter' && skillInput.trim()) {
//       e.preventDefault()
//       if (!editableJob.skills.includes(skillInput.trim())) {
//         setEditableJob({
//           ...editableJob,
//           skills: [...editableJob.skills, skillInput.trim()],
//         })
//       }
//       setSkillInput('')
//     }
//   }

//   const handleRemoveSkill = (skill) => {
//     setEditableJob({
//       ...editableJob,
//       skills: editableJob.skills.filter((s) => s !== skill),
//     })
//   }

//   const handleEditClick = (job) => {
//     setEditingJob(job)
//     setEditableJob({
//       ...job,
//       skills: Array.isArray(job.skills) ? job.skills : job.skills?.split(',').map((s) => s.trim()) || [],
//     })
//     setSkillInput('')
//     setSelectedRecruiter(job.assigned_to || null)
//   }

//   const handleDeleteClick = (job) => {
//     setDeletingJob(job)
//   }

//   const handleCancel = () => {
//     setEditingJob(null)
//     setDeletingJob(null)
//     setEditableJob({ skills: [] })
//     setSkillInput('')
//   }

  // const handleSave = async () => {
  //   try {
  //     const formData = new FormData()
  //     formData.append('id', editableJob.job_id)
  //     formData.append('title', editableJob.title)
  //     formData.append('company', editableJob.company)
  //     formData.append('skills', editableJob.skills.join(','))
  //     formData.append('experience', editableJob.experience ? parseInt(editableJob.experience, 10) : null)
  //     formData.append('description', editableJob.description)
  //     if (editableJob.jd_file) formData.append('jd_file', editableJob.jd_file)

  //     const response = await axios.put(`http://localhost:7000/api/job/jobUpdate`, formData)
  //     console.log('Updated job response:', response)

  //     // Refresh jobs
  //     const updatedJobs = await getAllJobs()
  //     setJobs(updatedJobs.map((j) => ({
  //       ...j,
  //       skills: j.skills ? j.skills.split(',').map((s) => s.trim()) : [],
  //     })))

  //     setAlertMessage(`Job "${editableJob.title}" updated successfully`)
  //     setAlertColor('success')
  //     setShowAlert(true)
  //     setTimeout(() => setShowAlert(false), 3000)
  //     handleCancel()
  //   } catch (err) {
  //     console.error('Update failed:', err)
  //     setAlertMessage('Failed to update job.')
  //     setAlertColor('danger')
  //     setShowAlert(true)
  //     setTimeout(() => setShowAlert(false), 3000)
  //   }
  // }

//   const handleConfirmDelete = async () => {
//     try {
//       await deleteJob(deletingJob.job_id)
//       setJobs((prevJobs) => prevJobs.filter((j) => j.job_id !== deletingJob.job_id))
//       setAlertMessage(`Job "${deletingJob.title}" deleted successfully`)
//       setAlertColor('success')
//       setShowAlert(true)
//       setTimeout(() => setShowAlert(false), 2000)
//       handleCancel()
//     } catch (err) {
//       console.error('Delete failed:', err)
//       setAlertMessage('Failed to delete job.')
//       setAlertColor('danger')
//       setShowAlert(true)
//       setTimeout(() => setShowAlert(false), 3000)
//     }
//   }

//   const handleAssignRecruiter = async (jobId, recruiterId) => {
//     setJobs((prev) =>
//       prev.map((j) => (j.job_id === jobId ? { ...j, assigned_to: recruiterId || null } : j)),
//     )
//     try {
//       const formData = new FormData()
//       formData.append('id', jobId)
//       formData.append('assigned_to', recruiterId ?? '')
//       await updateJob(formData)

//       const job = jobs.find((j) => j.job_id === jobId)
//       const jobTitle = job?.title || 'Job'
//       const recruiterName = recruiters.find((r) => r.recruiter_id === recruiterId)?.full_name || 'Recruiter'

//       setAlertMessage(`Recruiter "${recruiterName}" has been assigned job "${jobTitle}".`)
//       setAlertColor('success')
//       setShowAlert(true)
//       setTimeout(() => setShowAlert(false), 3000)
//     } catch (err) {
//       console.error('Failed to assign recruiter:', err)
//       setAlertMessage('Failed to assign recruiter')
//       setAlertColor('danger')
//       setShowAlert(true)
//       setTimeout(() => setShowAlert(false), 2000)
//       // revert
//       const refreshedJobs = await getAllJobs()
//       setJobs(refreshedJobs.map((j) => ({
//         ...j,
//         skills: j.skills ? j.skills.split(',').map((s) => s.trim()) : [],
//       })))
//     }
//   }



// // Inside DisplayJobsTable.js
// const handleAssignClient = async (jobId, clientId) => {
//   if (!clientId) return;

//   try {
//     // This sends ONE object: { jobId: "...", clientId: "..." }
//     // Now your api.js can destructure it correctly!
//     await assignClientToJob({ jobId, clientId });

//     setJobs((prev) =>
//       prev.map((j) => (j.job_id === jobId ? { ...j, assigned_client_id: clientId } : j))
//     );

//     setAlertMessage("Client assigned successfully!");
//     setAlertColor('success');
//     setShowAlert(true);
//   } catch (err) {
//     console.error('Assignment failed:', err);
//     setAlertMessage('Failed to assign client');
//     setAlertColor('danger');
//     setShowAlert(true);
//   }
// };
//   const filteredJobs = jobs.filter(
//     (j) =>
//       j.title.toLowerCase().includes(filter.toLowerCase()) ||
//       j.company.toLowerCase().includes(filter.toLowerCase()) ||
//       j.skills.join(',').toLowerCase().includes(filter.toLowerCase()),
//   )

//   return (
//     <CContainer style={{ fontFamily: 'Inter, sans-serif', marginTop: '2rem', padding: '0 1rem', fontSize: '0.85rem' }}>
//       {showAlert && (
//         <CAlert color={alertColor} className="toast-alert text-center" style={{ fontSize: '0.85rem' }}>
//           {alertMessage}
//         </CAlert>
//       )}

//       {/* Search Bar */}
//       <div
//         className="px-3 py-2"
//         style={{
//           borderBottom: '1px solid #e5e7eb',
//           background: '#f9fafb',
//           display: 'flex',
//           justifyContent: 'center',
//         }}
//       >
//         <div style={{ position: 'relative', maxWidth: '400px', width: '100%', marginBottom: '1rem' }}>
//           <CFormInput
//             placeholder="Search job by title, company or skills"
//             value={filter}
//             onChange={(e) => setFilter(e.target.value)}
//             style={{
//               width: '100%',
//               padding: '0.45rem 0.75rem 0.45rem 1.8rem',
//               fontSize: '0.85rem',
//               border: '1px solid #d1d5db',
//               borderRadius: '0.25rem',
//               backgroundColor: '#fff',
//               marginTop: '0.8rem',
//             }}
//           />
//           <CIcon
//             icon={cilSearch}
//             style={{ position: 'absolute', left: '6px', top: '60%', transform: 'translateY(-50%)', color: '#6b7280', fontSize: '0.95rem' }}
//           />
//         </div>
//       </div>

//       {/* Jobs Table */}
//       <div style={{ border: '1px solid #d1d5db', borderRadius: '0.25rem', overflow: 'hidden', background: '#fff' }}>
//         <CTable hover responsive>
//           <CTableHead color="light">
//             <CTableRow style={{ fontSize: '0.85rem' }}>
//               <CTableHeaderCell>Title</CTableHeaderCell>
//               <CTableHeaderCell>Company</CTableHeaderCell>
//               <CTableHeaderCell>Skills</CTableHeaderCell>
//               <CTableHeaderCell>Experience</CTableHeaderCell>
//                             <CTableHeaderCell>Client</CTableHeaderCell>

//               <CTableHeaderCell>Created At</CTableHeaderCell>
//               <CTableHeaderCell>Posted By</CTableHeaderCell>
//               <CTableHeaderCell>JD File</CTableHeaderCell>
//               <CTableHeaderCell>Assign To</CTableHeaderCell>
//               <CTableHeaderCell>Actions</CTableHeaderCell>
//             </CTableRow>
//           </CTableHead>

//           <CTableBody>
//             {filteredJobs.length === 0 ? (
//               <CTableRow>
//                 <CTableDataCell colSpan={9} style={{ textAlign: 'center', color: '#6B7280' }}>
//                   No jobs found.
//                 </CTableDataCell>
//               </CTableRow>
//             ) : (
//               filteredJobs.map((j, index) => {
//                 const dateObj = new Date(j.date)
//                 const date = dateObj.toLocaleDateString()
//                 const time = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

//                 return (
//                   <CTableRow key={index}>
//                     <CTableDataCell>{j.title}</CTableDataCell>
//                     <CTableDataCell>{j.company}</CTableDataCell>
//                     <CTableDataCell>
//                       <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
//                         {j.skills.map((skill, idx) => (
//                           <span
//                             key={idx}
//                             style={{
//                               background: '#eef2ff',
//                               color: '#1e40af',
//                               padding: '3px 8px',
//                               borderRadius: '999px',
//                               fontSize: '11px',
//                               fontWeight: 500,
//                             }}
//                           >
//                             {skill}
//                           </span>
//                         ))}
//                       </div>
//                     </CTableDataCell>

                
//                     <CTableDataCell>{j.experience} yrs</CTableDataCell>
//                   <CTableDataCell>
//   <select
//     // Ensure this uses the key we defined in fetchJobs
//     value={j.assigned_client_id ?? ''}
//     onChange={(e) => handleAssignClient(j.job_id, e.target.value)}
//     style={{ padding: '4px', fontSize: '0.85rem', borderRadius: '4px' }}
//   >
//     <option value="">Select Client</option>
//     {clients.map((c) => (
//       // We use user_id because the Backend looks up the client by 'userId'
//       <option key={c.user_id} value={c.user_id}>
//         {c.full_name}
//       </option>
//     ))}
//   </select>
// </CTableDataCell>
//                     <CTableDataCell>{`${date} ${time}`}</CTableDataCell>
//                     <CTableDataCell>{j.posted_by}</CTableDataCell>
//                     <CTableDataCell>
//                       {j.url ? (
//                         <span
//                           onClick={() => handleOpenJD(j.job_id)}
//                           style={{
//                             color: '#1E3A8A',
//                             fontWeight: 500,
//                             textDecoration: 'underline',
//                             cursor: 'pointer',
//                           }}
//                         >
//                           Open File
//                         </span>
//                       ) : (
//                         <span style={{ color: '#6B7280' }}>No JD</span>
//                       )}
//                     </CTableDataCell>

//                     <CTableDataCell>
//                       <select
//                         value={j.assigned_to ?? ''}
//                         onChange={(e) => handleAssignRecruiter(j.job_id, e.target.value)}
//                       >
//                         <option value="">None</option>
//                         {recruiters.map((r) => (
//                           <option key={r.recruiter_id} value={r.recruiter_id}>
//                             {r.full_name}
//                           </option>
//                         ))}
//                       </select>
//                     </CTableDataCell>

//                     <CTableDataCell>
//                       <CIcon
//                         icon={cilPencil}
//                         style={{ color: '#185883ff', cursor: 'pointer', fontSize: '1rem', marginRight: '0.5rem' }}
//                         onClick={() => handleEditClick(j)}
//                       />
//                       <CIcon
//                         icon={cilTrash}
//                         style={{ color: '#bc200fff', cursor: 'pointer', fontSize: '1rem' }}
//                         onClick={() => handleDeleteClick(j)}
//                       />
//                     </CTableDataCell>
//                   </CTableRow>
//                 )
//               })
//             )}
//           </CTableBody>
//         </CTable>

//         {/* Jobs Summary */}
//         <div
//           style={{
//             marginTop: '1.5rem',
//             padding: '1rem',
//             border: '1px solid #d1d5db',
//             borderRadius: '0.25rem',
//             background: '#f3f4f6',
//             display: 'flex',
//             justifyContent: 'space-around',
//             fontSize: '0.9rem',
//             fontWeight: 500,
//           }}
//         >
//           <div style={{ textAlign: 'center' }}>
//             <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>{jobs.length}</div>
//             <div>Total Jobs</div>
//           </div>
//           <div style={{ textAlign: 'center' }}>
//             <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>{jobs.filter((j) => j.assigned_to).length}</div>
//             <div>Assigned Jobs</div>
//           </div>
//         </div>
//       </div>

//       {/* Edit/Delete Modal */}
//       {(editingJob || deletingJob) && (
//         <div
//           style={{
//             position: 'fixed',
//             top: 0,
//             left: 0,
//             width: '100%',
//             height: '100%',
//             backgroundColor: 'rgba(0,0,0,0.5)',
//             display: 'flex',
//             justifyContent: 'center',
//             alignItems: 'center',
//             zIndex: 9999,
//           }}
//         >
//           {editingJob && (
//             <CCard
//               className="p-4 position-relative"
//               style={{
//                 width: '90%',
//                 maxWidth: '500px',
//                 borderRadius: '0.25rem',
//                 display: 'flex',
//                 flexDirection: 'column',
//                 margin: '1rem',
//                 fontSize: '0.85rem',
//               }}
//             >
//               <button
//                 onClick={handleCancel}
//                 style={{
//                   position: 'absolute',
//                   top: '10px',
//                   right: '10px',
//                   background: 'transparent',
//                   border: 'none',
//                   fontSize: '1.2rem',
//                   cursor: 'pointer',
//                   fontWeight: 'bold',
//                 }}
//               >
//                 &times;
//               </button>

//               <h4 style={{ fontWeight: 600, fontSize: '1.2rem', marginBottom: '0.5rem', textAlign: 'center' }}>
//                 Update Job
//               </h4>

//               <CFormInput
//                 className="mb-2"
//                 label="Title"
//                 value={editableJob.title}
//                 onChange={(e) => setEditableJob({ ...editableJob, title: e.target.value })}
//                 size="sm"
//               />
//               <CFormInput
//                 className="mb-2"
//                 label="Company"
//                 value={editableJob.company}
//                 onChange={(e) => setEditableJob({ ...editableJob, company: e.target.value })}
//                 size="sm"
//               />

//               {/* Skills Tags Input */}
//     <input
//   id="skillInput"
//   type="text"
//   value={skillInput}
//   onChange={(e) => setSkillInput(e.target.value)}
//   onKeyDown={(e) => {
//     const trimmed = skillInput.trim();

//     // Add skill on Enter or Space
//     if ((e.key === 'Enter' || e.key === ' ') && trimmed) {
//       e.preventDefault(); // stop default form submit or space scrolling
//       if (!editableJob.skills.includes(trimmed)) {
//         setEditableJob({
//           ...editableJob,
//           skills: [...editableJob.skills, trimmed],
//         });
//       }
//       setSkillInput('');
//     }

//     // Backspace removes last skill if input empty
//     if (e.key === 'Backspace' && !trimmed && editableJob.skills.length) {
//       e.preventDefault();
//       setEditableJob({
//         ...editableJob,
//         skills: editableJob.skills.slice(0, -1),
//       });
//     }
//   }}
//   placeholder="Type a skill and press Enter or Space"
//   style={{
//     border: 'none',
//     outline: 'none',
//     flex: 1,
//     minWidth: '100px',
//     fontSize: '0.85rem',
//     padding: '4px 2px',
//   }}
// />



//               <CFormInput
//                 type="number"
//                 className="mb-2"
//                 label="Experience"
//                 value={editableJob.experience}
//                 onChange={(e) => {
//                   const value = e.target.value
//                   if (/^\d*$/.test(value)) setEditableJob({ ...editableJob, experience: value })
//                 }}
//                 required
//                 size="sm"
//               />
//               <CFormInput
//                 className="mb-2"
//                 label="Job Description"
//                 value={editableJob.description}
//                 onChange={(e) => setEditableJob({ ...editableJob, description: e.target.value })}
//                 component="textarea"
//                 rows={4}
//               />
//               <CFormInput
//                 type="file"
//                 className="mb-3"
//                 label="Upload JD"
//                 onChange={(e) => setEditableJob({ ...editableJob, jd_file: e.target.files[0] })}
//               />

//               <div className="d-flex justify-content-center mt-3">
//                 <CButton color="success" onClick={handleSave} size="lg">
//                   Update
//                 </CButton>
//               </div>
//             </CCard>
//           )}

//           {deletingJob && (
//             <CCard
//               className="p-4 text-center"
//               style={{
//                 width: '90%',
//                 maxWidth: '450px',
//                 borderRadius: '0.25rem',
//                 display: 'flex',
//                 flexDirection: 'column',
//                 justifyContent: 'center',
//                 margin: '1rem',
//                 fontSize: '0.85rem',
//               }}
//             >
//               <h5 style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '1rem' }}>Confirm Delete</h5>
//               <p style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: '1.5rem' }}>
//                 Are you sure you want to delete <strong>{deletingJob.title}</strong>?
//               </p>
//               <div className="d-flex justify-content-center gap-3 mt-3 flex-wrap">
//                 <CButton color="secondary" onClick={handleCancel} size="lg">
//                   Cancel
//                 </CButton>
//                 <CButton onClick={handleConfirmDelete} size="lg" style={{ backgroundColor: '#d62828', border: 'none', color: 'white' }}>
//                   Delete
//                 </CButton>
//               </div>
//             </CCard>
//           )}
//         </div>
//       )}
//     </CContainer>
//   )
// }


// export default DisplayJobsTable




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
<CContainer style={{ fontFamily: 'Inter, sans-serif', marginTop: '2rem', fontSize: '0.75rem' }}>



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
      <div style={{ border: '1px solid #d1d5db', borderRadius: '0.25rem', overflow: 'hidden', marginTop: '1rem', background: '#fff' }}>


      {/* Search bar */}

         <div
        style={{
          borderBottom: '1px solid #e5e7eb',
          background: '#f9fafb',
          display: 'flex',
          justifyContent: 'center',
          padding: '0.5rem',
        }}
      >
        <div style={{ position: 'relative', maxWidth: '400px', width: '100%' }}>
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

        <CTable hover responsive>
          <CTableHead color="light">
            <CTableRow style={{ fontSize: '0.85rem' }}>
              <CTableHeaderCell>Title</CTableHeaderCell>
              <CTableHeaderCell>Company</CTableHeaderCell>
              <CTableHeaderCell>Skills</CTableHeaderCell>
              <CTableHeaderCell>Experience</CTableHeaderCell>
              <CTableHeaderCell>Client</CTableHeaderCell>
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
                <CTableDataCell colSpan={10} style={{ textAlign: 'center', color: '#6B7280' }}>
                  No jobs found.
                </CTableDataCell>
              </CTableRow>
            ) : (
              filteredJobs.map((j, idx) => {
                const dateObj = new Date(j.date)
                const date = dateObj.toLocaleDateString()
                const time = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

                return (
                  <CTableRow key={idx}>
                    <CTableDataCell>{j.title}</CTableDataCell>
                    <CTableDataCell>{j.company}</CTableDataCell>
                    <CTableDataCell>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
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
                            }}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </CTableDataCell>
                    <CTableDataCell>{j.experience} yrs</CTableDataCell>

                    <CTableDataCell>
                    <select
  value={j.assigned_client_id ?? ''}
  onChange={(e) => handleAssignClient(j.job_id, e.target.value)}
  style={{
    padding: '4px',
    fontSize: '0.85rem',
    borderRadius: '4px',
    border: '1px solid #d1d5db', // grey border
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

<CTableDataCell>{date} {time}</CTableDataCell>
                    <CTableDataCell>{j.posted_by}</CTableDataCell>
                    <CTableDataCell>
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

                    <CTableDataCell>
                   <select
  value={j.assigned_to ?? ''}
  onChange={(e) => handleAssignRecruiter(j.job_id, e.target.value)}
  style={{
    padding: '4px',
    fontSize: '0.85rem',
    borderRadius: '4px',
    border: '1px solid #d1d5db', // grey border
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

                    <CTableDataCell>
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




      </div>
    </CContainer>
  )
}

export default DisplayJobsTable