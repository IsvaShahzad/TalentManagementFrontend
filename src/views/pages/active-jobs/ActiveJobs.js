// import { useEffect, useState } from "react";
// import {
//   getAllCandidates,
//   getLinkedCandidates,
//   linkCandidateToJob,
//   unlinkCandidateFromJob,
//   getAllJobs,
//   getAssignedJobs,
//   getAllJobsWithCandidates,
//   updateJobStatus,
//   getClientJobs,
//   addJobNoteApi, // <-- add this

// } from "../../../api/api";
// import { cilBook, cilNotes } from '@coreui/icons'
// import { FaLink, FaTimesCircle } from "react-icons/fa";
// import "./ActiveJobs.css";
// import { getCandidateSignedUrl, downloadFile } from "../../../components/candidateUtils";
// import { CToast, CToastBody, CToaster, CButton, CModal, CModalHeader, CModalFooter, CModalBody, CFormTextarea, CAlert } from "@coreui/react";
// import CIcon from '@coreui/icons-react'
// import JobNotes from "./JobNotes.js";
// import NotesCard from "./NotesCard.js";

// const ActiveJobsScreen = ({ userId, role }) => {
//   const [jobs, setJobs] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [allCandidates, setAllCandidates] = useState([]);
//   const [linkedCandidates, setLinkedCandidates] = useState([]);
//   const [selectedJobId, setSelectedJobId] = useState(null);
//   const [showModal, setShowModal] = useState(false);
//   const [candidatesWithJobs, setCandidatesWithJobs] = useState([]);
//   const [toast, setToast] = useState(null);
//   const [feedback, setFeedback] = useState(""); // <-- ensures 'feedback' exists

//   const [alerts, setAlerts] = useState([]);


//   // Linked candidates search & pagination
//   const [linkedSearch, setLinkedSearch] = useState("");
//   const [linkedPage, setLinkedPage] = useState(1);
//   const linkedPerPage = 5;

//   // ---------- Pagination ----------
//   const [currentPage, setCurrentPage] = useState(1);
//   const jobsPerPage = 4;

//   const JOB_STATUSES = ["Open", "Paused", "Closed", "Placement"];
//   const [currentNotesJob, setCurrentNotesJob] = useState(null)
//   // ---------- Toast helper ----------
//   const showToast = (message, color = "success") => {
//     setToast({ message, color });
//   };

//   const [notesVisible, setNotesVisible] = useState(false);
//   const [notesJobId, setNotesJobId] = useState(null);
//   const [notesRefreshKey, setNotesRefreshKey] = useState(0);

//   useEffect(() => {
//     if (toast) {
//       const timer = setTimeout(() => setToast(null), 4000);
//       return () => clearTimeout(timer);
//     }
//   }, [toast]);

//   // ---------- Fetch Jobs ----------
//   useEffect(() => {
//     const fetchJobs = async () => {
//       setLoading(true);
//       try {
//         let data = [];
//         if (role === "Admin") data = await getAllJobs();
//         else if (role === "Recruiter") data = await getAssignedJobs(userId);
//         else if (role === "Client") data = await getClientJobs(userId);
//         setJobs(data || []);
//       } catch (err) {
//         console.error("Error fetching jobs:", err);
//         showToast("Failed to fetch jobs", "danger");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchJobs();
//   }, [userId, role]);

//   // ---------- Fetch Candidates with Jobs ----------
//   const fetchCandidatesWithJobs = async () => {
//     try {
//       const res = await getAllJobsWithCandidates();
//       if (!res?.data) {
//         setCandidatesWithJobs([]);
//         return;
//       }

//       const rows = [];
//       res.data.forEach((job) => {
//         job.JobCandidate?.forEach((link) => {
//           const cand = link.Candidate;
//           if (!cand) return;
//           rows.push({
//             candidate_id: cand.candidate_id,
//             candidate_name: cand.name,
//             job_id: job.job_id,
//             job_title: job.title,
//             job_status: job.status,
//             resume_url_redacted: cand.resume_url_redacted || null,
//             resume_url: cand.resume_url || null,
//           });
//         });
//       });
//       setCandidatesWithJobs(rows);
//     } catch (err) {
//       console.error("Error fetching candidates:", err);
//       setCandidatesWithJobs([]);
//       showToast("Failed to fetch linked candidates", "danger");
//     }
//   };

//   useEffect(() => {
//     fetchCandidatesWithJobs();
//   }, []);


//   const showAlert = (message, color = "success", duration = 5000) => {
//     const id = new Date().getTime();
//     setAlerts((prev) => [...prev, { id, message, color }]);
//     setTimeout(() => {
//       setAlerts((prev) => prev.filter((alert) => alert.id !== id));
//     }, duration);
//   };


//   const addNote = async () => {
//     if (!feedback.trim() || !notesJobId) return;
//     try {
//       const userObj = localStorage.getItem("user");
//       const user = userObj ? JSON.parse(userObj) : null;
//       const recruiterId = user?.user_id;
//       if (!recruiterId) return;

//       await addJobNoteApi({
//         job_id: notesJobId,
//         user_id: recruiterId,
//         feedback,
//         visibility: "client",
//       });

//       setFeedback("");   // clear input
//       showAlert("Note added successfully", "success");
//       setNotesRefreshKey((prev) => prev + 1);
//     } catch (err) {
//       console.error(err);
//       showAlert("Failed to add note", "danger");
//     }
//   };



//   // ---------- Filtered candidates ----------
//   const filteredCandidates = candidatesWithJobs.filter(
//     (c) => jobs.some((j) => j.job_id === c.job_id) && c.job_status !== "Closed"
//   );

//   // ---------- Handle Job Status Change ----------
//   const handleStatusChange = async (jobId, newStatus) => {
//     try {
//       //  const user = { userId: localStorage.getItem("userId"), role: localStorage.getItem("role") };


//       const storedUser = JSON.parse(localStorage.getItem("user"));

//       const user = {
//         userId: storedUser?.user_id,
//         role: storedUser?.role
//       };

//       await updateJobStatus(jobId, { status: newStatus, user });
//       setJobs((prev) =>
//         prev.map((job) => (job.job_id === jobId ? { ...job, status: newStatus } : job))
//       );

//       if (newStatus === "Closed") {
//         setCandidatesWithJobs((prev) => prev.filter((c) => c.job_id !== jobId));
//         if (selectedJobId === jobId) {
//           setLinkedCandidates([]);
//           setShowModal(false);
//         }
//       }
//       //showToast("Job status updated successfully", "success");
//       showAlert("JOb Status Updated successfully", "success");
//     } catch (err) {
//       console.error(err);
//       showToast("Failed to update job status", "danger");
//     }
//   };

//   // ---------- Open Candidates Modal ----------
//   const openCandidatesModal = async (jobId) => {
//     setSelectedJobId(jobId);
//     try {
//       const candidates = await getAllCandidates();
//       setAllCandidates(Array.isArray(candidates) ? candidates : []);

//       const linked = await getLinkedCandidates(jobId);
//       setLinkedCandidates(Array.isArray(linked) ? linked : []);
//       setShowModal(true);
//     } catch (err) {
//       console.error(err);
//       showToast("Failed to fetch candidates", "danger");
//     }
//   };

//   // ---------- Link / Unlink Candidates ----------
//   const handleLink = async (candidateId) => {
//     if (!selectedJobId) return;
//     try {
//       await linkCandidateToJob(selectedJobId, candidateId);
//       const updatedLinked = await getLinkedCandidates(selectedJobId);
//       setLinkedCandidates(Array.isArray(updatedLinked) ? updatedLinked : []);
//       fetchCandidatesWithJobs();
//       //  showToast("Candidate linked successfully", "success");
//       showAlert("Candidate linked successfully", "success");
//     } catch (err) {
//       if (err.response?.status === 409)
//         showAlert("Candidate already linked", "success");
//       //showToast("Candidate already linked", "warning");
//       else {
//         console.error(err);
//         showToast("Failed to link candidate", "danger");
//       }
//     }
//   };

//   const handleUnlink = async (candidateId) => {
//     if (!selectedJobId) return;
//     try {
//       await unlinkCandidateFromJob(selectedJobId, candidateId);
//       const updatedLinked = await getLinkedCandidates(selectedJobId);
//       setLinkedCandidates(Array.isArray(updatedLinked) ? updatedLinked : []);
//       fetchCandidatesWithJobs();
//       showToast("Candidate unlinked successfully", "success");
//     } catch (err) {
//       console.error(err);
//       showToast("Failed to unlink candidate", "danger");
//     }
//   };

//   const handleTableUnlink = async (jobId, candidateId) => {
//     try {
//       await unlinkCandidateFromJob(jobId, candidateId);
//       fetchCandidatesWithJobs();
//       //  showToast("Candidate unlinked from job", "success");
//       showAlert("Candidate unlinked successfully", "success");
//     } catch (err) {
//       console.error(err);
//       showToast("Failed to unlink candidate", "danger");
//     }
//   };

//   // ---------- Download CV ----------
//   const handleDownloadCV = async (candidate) => {
//     try {
//       const type = candidate.resume_url_redacted
//         ? "redacted"
//         : candidate.resume_url
//           ? "original"
//           : null;
//       if (!type) {
//         showToast("No CV available. Contact admin.", "warning");
//         return;
//       }
//       const signedUrl = await getCandidateSignedUrl(candidate.candidate_id, type);
//       downloadFile(signedUrl, `${candidate.candidate_name}_${type}.pdf`);
//       showAlert("CV downloaded successfully", "success");
//     } catch (err) {
//       console.error(err);
//       showToast("Failed to download CV", "danger");
//     }
//   };

//   // ---------- Pagination logic ----------
//   const indexOfLastJob = currentPage * jobsPerPage;
//   const indexOfFirstJob = indexOfLastJob - jobsPerPage;
//   const currentJobs = jobs.slice(indexOfFirstJob, indexOfLastJob);
//   const totalPages = Math.ceil(jobs.length / jobsPerPage);

//   const handlePageClick = (page) => {
//     setCurrentPage(page);
//   };

//   const handleNextPage = () => {
//     if (currentPage < totalPages) setCurrentPage(currentPage + 1);
//   };

//   const handlePrevPage = () => {
//     if (currentPage > 1) setCurrentPage(currentPage - 1);
//   };
//   if (!userId && role !== "Admin") return <p>Loading user info...</p>;
//   if (loading)
//     return (
//       <div className="loading-container">
//         <div className="spinner"></div>
//         <p>Loading jobs...</p>
//       </div>
//     );

//   return (
//     <div className="active-jobs-container">
//       {/* CoreUI Toasts */}
//       <div style={{ position: "fixed", top: 10, right: 10, zIndex: 9999 }}>
//         {alerts.map((a) => (
//           <CAlert key={a.id} color={a.color} dismissible>
//             {a.message}
//           </CAlert>
//         ))}
//       </div>

//       {/* Jobs Grid */}
//       {jobs.length === 0 && <p>No jobs found.</p>}
//       <div className="jobs-grid">
//         {currentJobs.map((job) => (
//           <div key={job.job_id}

//             className="job-card">
//             <div>
//               <select
//                 className={`job-status ${job.status?.toLowerCase()} ${job.status === "Closed" ? "no-arrow" : ""
//                   }`}
//                 value={job.status}
//                 onChange={(e) => handleStatusChange(job.job_id, e.target.value)}
//                 disabled={job.status === "Closed" || role === "Client"}
//               >
//                 {JOB_STATUSES.map((status) => (
//                   <option key={status} value={status}>
//                     {status}
//                   </option>
//                 ))}
//               </select>

//               {/* {role === "Recruiter" &&
//           !["Closed", "Placement", "Paused"].includes(job.status) && (
//             <FaLink
//               style={{ cursor: "pointer", marginLeft: "10px" }}
//               onClick={() => openCandidatesModal(job.job_id)}
//               title="Link Candidates"
//             />
//           )} */}
//             </div>

//             <div className="job-header">
//               <div>
//                 <h3 className="job-title">{job.title}</h3>
//                 {/* Company Name */}
//                 {job.company && <div className="job-company">{job.company}</div>}
//                 <div className="job-meta">
//                   {job.created_at
//                     ? `Posted on ${new Date(job.created_at).toLocaleDateString("en-US", {
//                       year: "numeric",
//                       month: "short",
//                       day: "numeric",
//                     })}`
//                     : "Date not available"}{" "}
//                 </div>


//               </div>

//               <div className="job-status-wrapper">


//                 {role === "Recruiter" &&
//                   !["Closed", "Placement", "Paused"].includes(job.status) && (
//                     <FaLink
//                       className="link-icon"
//                       onClick={() => openCandidatesModal(job.job_id)}
//                       title="Link Candidates"
//                     />
//                   )}

//                 {/* Job Status Dropdown */}
//                 <select
//                   className={`job-status ${job.status?.toLowerCase()} ${job.status === "Closed" ? "no-arrow" : ""
//                     }`}
//                   value={job.status}
//                   onChange={(e) => handleStatusChange(job.job_id, e.target.value)}
//                   disabled={job.status === "Closed" || role === "Client"}
//                 >
//                   {JOB_STATUSES.map((status) => (
//                     <option key={status} value={status}>
//                       {status}
//                     </option>
//                   ))}
//                 </select>


//               </div>




//               {/* Notes icon */}
//               {role !== "Client" && (
//                 <CButton
//                   color="light"
//                   size="sm"
//                   onClick={() => {
//                     setNotesJobId(job.job_id);
//                     setNotesVisible(true);
//                   }}
//                 >
//                   <CIcon icon={cilNotes} />
//                 </CButton>
//               )}



//             </div>


//             {/* Job Description Section */}
//             <div className="job-description-section">
//               <h4>Description</h4>
//               <p>{job.description || "No description provided."}</p>
//             </div>

//             {/* Experience Required Section (plain text) */}
//             {job.experience && (
//               <div className="job-skills">
//                 <h4>Experience Required:</h4>
//                 <div className="experience-text">
//                   {job.experience} {job.experience.toString().match(/\d/) ? "years" : ""}
//                 </div>
//               </div>


//             )}{/* Skills Section */}
//             {job.skills && (
//               <div className="job-skills">
//                 <h4>Skills Required:</h4>
//                 <div className="skills-tags">
//                   {Array.isArray(job.skills)
//                     ? job.skills.map((skill, idx) => (
//                       <span key={idx} className="skill-tag">
//                         {skill}
//                       </span>
//                     ))
//                     : job.skills
//                       .split(",")
//                       .map((skill, idx) => (
//                         <span key={idx} className="skill-tag">
//                           {skill.trim()}
//                         </span>
//                       ))}
//                 </div>
//               </div>
//             )}






//           </div>
//         ))}
//       </div>

//       {/* Pagination Buttons */}
//       {/* Pagination Buttons */}
//       {jobs.length > jobsPerPage && (
//         <div
//           style={{
//             display: "flex",
//             justifyContent: "center",
//             marginTop: "20px",
//             gap: "5px",
//             flexWrap: "wrap",
//           }}
//         >
//           {/* Previous Button */}
//           <button
//             onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
//             disabled={currentPage === 1}
//           >
//             &lt;
//           </button>

//           {/* Page Numbers */}
//           {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
//             <button
//               key={page}
//               onClick={() => handlePageClick(page)}
//               style={{
//                 fontWeight: currentPage === page ? "bold" : "normal",
//                 backgroundColor: currentPage === page ? "#1f3c88" : "white",
//                 color: currentPage === page ? "white" : "black",
//                 border: "1px solid #ccc",
//                 padding: "5px 10px",
//                 cursor: "pointer",
//               }}
//             >
//               {page}
//             </button>
//           ))}

//           {/* Next Button */}
//           <button
//             onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
//             disabled={currentPage === totalPages}
//           >
//             &gt;
//           </button>
//         </div>
//       )}




//       {/* Modal */}
//       {/* Modal */}
//       {/* Modal */}
//       {showModal && (
//         <div
//           className="modal-overlay"
//           onClick={() => setShowModal(false)} // Click on overlay closes modal
//         >
//           <div
//             className="modal-content modern-modal"
//             onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
//           >
//             {/* Header */}
//             <div className="modal-header">
//               <h3>Link Candidates</h3>
//               <button className="close-btn" onClick={() => setShowModal(false)}>
//                 &times;
//               </button>
//             </div>

//             {/* All Candidates */}
//             <section className="modal-section">
//               <h4>All Candidates</h4>
//               {allCandidates.length === 0 ? (
//                 <p className="no-candidates">No candidates available.</p>
//               ) : (
//                 <div className="candidate-list">
//                   {allCandidates.map((c) => {
//                     const isLinked = linkedCandidates.some(
//                       (lc) => lc.candidate_id === c.candidate_id
//                     );
//                     return (
//                       <div key={c.candidate_id} className="candidate-card">
//                         <span className="candidate-name">{c.name}</span>
//                         {!isLinked ? (
//                           <button
//                             className="link-btn"
//                             onClick={() => handleLink(c.candidate_id)}
//                           >
//                             Link
//                           </button>
//                         ) : (
//                           <span className="linked-label">Linked</span>
//                         )}
//                       </div>
//                     );
//                   })}
//                 </div>
//               )}
//             </section>
//           </div>
//         </div>
//       )}



//       {/* Linked Candidates Table */}
//       <table className="linked-jobs-table">
//         <thead>
//           <tr>
//             <th>Candidate Name</th>
//             <th>Linked Jobs</th>
//             <th>CV</th>
//             <th>Action</th>
//           </tr>
//         </thead>

//         <tbody>
//           {filteredCandidates.map((c, index) => (
//             <tr key={`${c.candidate_id}-${c.job_id}-${index}`}>
//               <td>{c.candidate_name}</td>
//               <td>{c.job_title}</td>
//               <td>
//                 {c.resume_url_redacted ? (
//                   <button className="cv-button red" onClick={() => handleDownloadCV(c)}>
//                     Download Redacted
//                   </button>
//                 ) : (
//                   "Contact admin"
//                 )}
//               </td>
//               <td>
//                 <FaTimesCircle
//                   style={{ cursor: "pointer", color: "red" }}
//                   title="Unlink Candidate from Job"
//                   onClick={() => handleTableUnlink(c.job_id, c.candidate_id)}
//                 />
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>






//       {/* 



//       {/* Job Notes Modal */}
//       <CModal
//         visible={notesVisible}
//         onClose={() => {
//           setNotesVisible(false);
//           setNotesJobId(null);
//           setFeedback(""); // clear textarea when closing
//         }}
//         size="md"  // smaller modal
//         className="custom-notes-modal"
//         alignment="center" // centers modal on screen
//       >
//         {/* Modal Header */}
//         <CModalHeader className="custom-modal-header">
//           <h4 className="modal-title">Job Feedback</h4>
//           {/* Removed extra close icon if you don't want two */}
//           {/* <button
//       className="close-btn"
//       onClick={() => {
//         setNotesVisible(false);
//         setNotesJobId(null);
//         setFeedback("");
//       }}
//     >
//       &times;
//     </button> */}
//         </CModalHeader>

//         {/* Modal Body */}
//         <CModalBody className="custom-modal-body">
//           {notesJobId ? (
//             <>
//               <CFormTextarea
//                 rows={3}
//                 value={feedback}
//                 onChange={(e) => setFeedback(e.target.value)}
//                 placeholder="Add feedback..."
//                 className="mb-3"
//               />

//               <CButton
//                 color="primary"
//                 size="lg"
//                 className="add-feedback-btn"
//                 onClick={addNote}
//               >
//                 Add Feedback
//               </CButton>
//             </>
//           ) : (
//             <p>No job selected.</p>
//           )}
//         </CModalBody>
//       </CModal>



//       <NotesCard refreshKey={notesRefreshKey} />

//     </div>



//   );

// };

// export default ActiveJobsScreen;




















import { useEffect, useState } from "react";
import {
  getAllCandidates,
  getLinkedCandidates,
  linkCandidateToJob,
  unlinkCandidateFromJob,
  getAllJobs,
  getAssignedJobs,
  getAllJobsWithCandidates,
  updateJobStatus,
  getClientJobs,
  addJobNoteApi, // <-- add this

} from "../../../api/api";
import { cilBook, cilNotes } from '@coreui/icons'
import { FaLink, FaTimesCircle } from "react-icons/fa";
import "./ActiveJobs.css";
import { getCandidateSignedUrl, downloadFile } from "../../../components/candidateUtils";
import { CToast, CToastBody, CToaster, CButton, CModal, CModalHeader, CModalFooter, CModalBody, CFormTextarea, CAlert } from "@coreui/react";
import CIcon from '@coreui/icons-react'
import JobNotes from "./JobNotes.js"; 
import NotesCard from "./NotesCard.js";
import JobCard from "./JobCard.js";


import JobFormWrapper from '../position-tracker/JobFormWrapper';
import DisplayJobsTable from '../position-tracker/DisplayJobs';


const ActiveJobsScreen = ({ userId, role }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allCandidates, setAllCandidates] = useState([]);
  const [linkedCandidates, setLinkedCandidates] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [candidatesWithJobs, setCandidatesWithJobs] = useState([]);
  const [toast, setToast] = useState(null);
  const [feedback, setFeedback] = useState(""); // <-- ensures 'feedback' exists
  const [expandedSkills, setExpandedSkills] = useState({});

  const [alerts, setAlerts] = useState([]);


  // Linked candidates search & pagination
  const [linkedSearch, setLinkedSearch] = useState("");
  const [linkedPage, setLinkedPage] = useState(1);
  const linkedPerPage = 5;

  // ---------- Pagination ----------
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 10;

  const JOB_STATUSES = ["Open", "Paused", "Closed", "Placement"];
  const [currentNotesJob, setCurrentNotesJob] = useState(null)
  // ---------- Toast helper ----------
  const showToast = (message, color = "success") => {
    setToast({ message, color });
  };

  const [notesVisible, setNotesVisible] = useState(false);
  const [notesJobId, setNotesJobId] = useState(null);
  const [notesRefreshKey, setNotesRefreshKey] = useState(0);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // ---------- Fetch Jobs ----------
  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        let data = [];
        if (role === "Admin") data = await getAllJobs();
        else if (role === "Recruiter") data = await getAssignedJobs(userId);
        else if (role === "Client") data = await getClientJobs(userId);
        setJobs(data || []);
      } catch (err) {
        console.error("Error fetching jobs:", err);
        showToast("Failed to fetch jobs", "danger");
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [userId, role]);

  // ---------- Fetch Candidates with Jobs ----------
  const fetchCandidatesWithJobs = async () => {
    try {
      const res = await getAllJobsWithCandidates();
      if (!res?.data) {
        setCandidatesWithJobs([]);
        return;
      }

      const rows = [];
      res.data.forEach((job) => {
        job.JobCandidate?.forEach((link) => {
          const cand = link.Candidate;
          if (!cand) return;
          rows.push({
            candidate_id: cand.candidate_id,
            candidate_name: cand.name,
            job_id: job.job_id,
            job_title: job.title,
            job_status: job.status,
            resume_url_redacted: cand.resume_url_redacted || null,
            resume_url: cand.resume_url || null,
          });
        });
      });
      setCandidatesWithJobs(rows);
    } catch (err) {
      console.error("Error fetching candidates:", err);
      setCandidatesWithJobs([]);
      showToast("Failed to fetch linked candidates", "danger");
    }
  };

  useEffect(() => {
    fetchCandidatesWithJobs();
  }, []);


  const showAlert = (message, color = "success", duration = 5000) => {
    const id = new Date().getTime();
    setAlerts((prev) => [...prev, { id, message, color }]);
    setTimeout(() => {
      setAlerts((prev) => prev.filter((alert) => alert.id !== id));
    }, duration);
  };


  const addNote = async () => {
    if (!feedback.trim() || !notesJobId) return;
    try {
      const userObj = localStorage.getItem("user");
      const user = userObj ? JSON.parse(userObj) : null;
      const recruiterId = user?.user_id;
      if (!recruiterId) return;

      await addJobNoteApi({
        job_id: notesJobId,
        user_id: recruiterId,
        feedback,
        visibility: "client",
      });

      setFeedback("");   // clear input
      showAlert("Note added successfully", "success");
      setNotesRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error(err);
      showAlert("Failed to add note", "danger");
    }
  };



  // ---------- Filtered candidates ----------
  const filteredCandidates = candidatesWithJobs.filter(
    (c) => jobs.some((j) => j.job_id === c.job_id) && c.job_status !== "Closed"
  );

  // ---------- Handle Job Status Change ----------
  const handleStatusChange = async (jobId, newStatus) => {
    try {
      const user = { userId: localStorage.getItem("userId"), role: localStorage.getItem("role") };


// const storedUser= JSON.parse(localStorage.getItem("user"));

// const user = {
//   userId: storedUser?.user_id,
//   role: storedUser?.role
// };



      await updateJobStatus(jobId, { status: newStatus, user });
      setJobs((prev) =>
        prev.map((job) => (job.job_id === jobId ? { ...job, status: newStatus } : job))
      );

      if (newStatus === "Closed") {
        setCandidatesWithJobs((prev) => prev.filter((c) => c.job_id !== jobId));
        if (selectedJobId === jobId) {
          setLinkedCandidates([]);
          setShowModal(false);
        }
      }
      //showToast("Job status updated successfully", "success");
      showAlert("JOb Status Updated successfully", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to update job status", "danger");
    }
  };

  // ---------- Open Candidates Modal ----------
  const openCandidatesModal = async (jobId) => {
    setSelectedJobId(jobId);
    try {
      const candidates = await getAllCandidates();
      setAllCandidates(Array.isArray(candidates) ? candidates : []);

      const linked = await getLinkedCandidates(jobId);
      setLinkedCandidates(Array.isArray(linked) ? linked : []);
      setShowModal(true);
    } catch (err) {
      console.error(err);
      showToast("Failed to fetch candidates", "danger");
    }
  };

  // ---------- Link / Unlink Candidates ----------
  const handleLink = async (candidateId) => {
    if (!selectedJobId) return;
    try {
      await linkCandidateToJob(selectedJobId, candidateId);
      const updatedLinked = await getLinkedCandidates(selectedJobId);
      setLinkedCandidates(Array.isArray(updatedLinked) ? updatedLinked : []);
      fetchCandidatesWithJobs();
      //  showToast("Candidate linked successfully", "success");
      showAlert("Candidate linked successfully", "success");
    } catch (err) {
      if (err.response?.status === 409)
        showAlert("Candidate already linked", "success");
      //showToast("Candidate already linked", "warning");
      else {
        console.error(err);
        showToast("Failed to link candidate", "danger");
      }
    }
  };

  const handleUnlink = async (candidateId) => {
    if (!selectedJobId) return;
    try {
      await unlinkCandidateFromJob(selectedJobId, candidateId);
      const updatedLinked = await getLinkedCandidates(selectedJobId);
      setLinkedCandidates(Array.isArray(updatedLinked) ? updatedLinked : []);
      fetchCandidatesWithJobs();
      showToast("Candidate unlinked successfully", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to unlink candidate", "danger");
    }
  };

  const handleTableUnlink = async (jobId, candidateId) => {
    try {
      await unlinkCandidateFromJob(jobId, candidateId);
      fetchCandidatesWithJobs();
      //  showToast("Candidate unlinked from job", "success");
      showAlert("Candidate unlinked successfully", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to unlink candidate", "danger");
    }
  };

  // ---------- Download CV ----------
  const handleDownloadCV = async (candidate) => {
    try {
      const type = candidate.resume_url_redacted
        ? "redacted"
        : candidate.resume_url
          ? "original"
          : null;
      if (!type) {
        showToast("No CV available. Contact admin.", "warning");
        return;
      }
      const signedUrl = await getCandidateSignedUrl(candidate.candidate_id, type);
      downloadFile(signedUrl, `${candidate.candidate_name}_${type}.pdf`);
      showAlert("CV downloaded successfully", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to download CV", "danger");
    }
  };

  // ---------- Pagination logic ----------
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = jobs.slice(indexOfFirstJob, indexOfLastJob);
  const totalPages = Math.ceil(jobs.length / jobsPerPage);

  const handlePageClick = (page) => {
    setCurrentPage(page);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };
  if (!userId && role !== "Admin") return <p>Loading user info...</p>;
  if (loading)
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading jobs...</p>
      </div>
    );

return (
    <div className="active-jobs-container">
      {/* --- 1. ALERTS & NOTIFICATIONS --- */}
      <div style={{ position: "fixed", top: 10, right: 10, zIndex: 10000 }}>
        {alerts.map((a) => (
          <CAlert key={a.id} color={a.color} dismissible>
            {a.message}
          </CAlert>
        ))}
      </div>

      {/* --- 2. FLOATING JOB FORM TRIGGER --- */}
      {/* This replaces the old static JobForm section */}
          {role !== "Recruiter" && <JobFormWrapper />}




            {/* --- 4. VISUAL CARD GRID --- */}
      <div className="section-wrapper">
        {/* <h3 className="section-heading">Active Job Cards</h3> */}
        {jobs.length === 0 ? (
          <p>No jobs found.</p>
        ) : (
          <div className="jobs-grid">
            {currentJobs.map((job) => (
              <JobCard
                key={job.job_id}
                job={job}
                role={role}
                handleStatusChange={handleStatusChange}
                openCandidatesModal={openCandidatesModal}
                setNotesJobId={setNotesJobId}
                setNotesVisible={setNotesVisible}
                expandedSkills={expandedSkills}
                setExpandedSkills={setExpandedSkills}
              />
            ))}
          </div>
        )}
      </div>
    
      <hr className="my-5" />

    

      {/* --- 5. PAGINATION CONTROLS --- */}
      {jobs.length > jobsPerPage && (
        <div className="pagination-wrapper" style={{ display: "flex", justifyContent: "center", marginTop: "20px", gap: "5px" }}>
          <button onClick={handlePrevPage} disabled={currentPage === 1}> &lt; </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageClick(page)}
              style={{
                fontWeight: currentPage === page ? "bold" : "normal",
                backgroundColor: currentPage === page ? "#1f3c88" : "white",
                color: currentPage === page ? "white" : "black",
                border: "1px solid #ccc",
                padding: "5px 10px",
                cursor: "pointer",
              }}
            >
              {page}
            </button>
          ))}
          <button onClick={handleNextPage} disabled={currentPage === totalPages}> &gt; </button>
        </div>
      )}


       {/* --- 3. TABULAR VIEW --- */}
      {/* Hide the entire Position Tracking Table for Recruiters */}
      {role !== "Recruiter" && (
        <div className="section-wrapper mb-5" style={{ marginTop: '20px' }}>
          {/* <h3 className="section-heading">Position Tracking Table</h3> */}
          <DisplayJobsTable jobs={jobs} />
          <hr className="my-5" />
        </div>
      )}


      {/* --- 6. LINK CANDIDATES MODAL --- */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content modern-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Link Candidates</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <section className="modal-section">
              <h4>All Candidates</h4>
              <div className="candidate-list">
                {allCandidates.map((c) => {
                  const isLinked = linkedCandidates.some((lc) => lc.candidate_id === c.candidate_id);
                  return (
                    <div key={c.candidate_id} className="candidate-card">
                      <span className="candidate-name">{c.name}</span>
                      {!isLinked ? (
                        <button className="link-btn" onClick={() => handleLink(c.candidate_id)}>Link</button>
                      ) : (
                        <span className="linked-label">Linked</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        </div>
      )}

      {/* --- 7. CANDIDATE ASSIGNMENT SUMMARY TABLE --- */}
      <div className="mt-5">
        {/* <h3 className="section-heading">Candidate Assignment Summary</h3> */}
        <table className="linked-jobs-table">
          <thead>
            <tr>
              <th>Candidate Name</th>
              <th>Linked Jobs</th>
              <th>CV</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredCandidates.map((c, index) => (
              <tr key={`${c.candidate_id}-${c.job_id}-${index}`}>
                <td>{c.candidate_name}</td>
                <td>{c.job_title}</td>
                <td>
                  {c.resume_url_redacted ? (
                    <button className="cv-button red" onClick={() => handleDownloadCV(c)}>Download Redacted</button>
                  ) : "Contact admin"}
                </td>
                <td>
                  <FaTimesCircle
                    style={{ cursor: "pointer", color: "red" }}
                    onClick={() => handleTableUnlink(c.job_id, c.candidate_id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- 8. JOB NOTES MODAL --- */}
      <CModal visible={notesVisible} onClose={() => { setNotesVisible(false); setFeedback(""); }} alignment="center">
        <CModalHeader>
          <h4 className="modal-title">Job Feedback</h4>
        </CModalHeader>
        <CModalBody>
          <CFormTextarea
            rows={3}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Add feedback..."
            className="mb-3"
          />
          <CButton color="primary" className="w-100" onClick={addNote}>
            Add Feedback
          </CButton>
        </CModalBody>
      </CModal>

      <NotesCard refreshKey={notesRefreshKey} />
    </div>
  );
};

export default ActiveJobsScreen;


