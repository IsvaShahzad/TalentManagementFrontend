



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
  getClientJobs
} from "../../../api/api";
import { FaCircle, FaLink, FaTimes, FaTrash } from "react-icons/fa";
import "./ActiveJobs.css";
import AutoClearClosedJobs from "./AutoClearClosedJobs";
import { CAlert } from "@coreui/react";
import { getCandidateSignedUrl, downloadFile } from "../../../components/candidateUtils"; // import utils


const ActiveJobsScreen = ({ userId, role }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allCandidates, setAllCandidates] = useState([]);
  const [linkedCandidates, setLinkedCandidates] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [candidatesWithJobs, setCandidatesWithJobs] = useState([]);
  const JOB_STATUSES = ["Open", "Paused", "Closed", "Placement"];


  const handleStatusChange = async (jobId, newStatus) => {
    try {

      const userId = localStorage.getItem("userId");
      // const userObj = localStorage.getItem('user')
      // if (!userObj) {
      //   setAlertMessage('User not logged in')
      //   setAlertColor('danger')
      //   setShowAlert(true)
      //   return
      // }

      // const user = JSON.parse(userObj)
      // const userId = user.user_id
      // if (!userId) {
      //   setAlertMessage('User not logged in')
      //   setAlertColor('danger')
      //   setShowAlert(true)
      //   return
      // }

      const role = localStorage.getItem("role");

      const user = {
        userId: localStorage.getItem("userId"),
        role: localStorage.getItem("role"),
      };
      // await updateJobStatus(jobId, { status: newStatus, user });

      // // update UI instantly (no refetch needed)
      // setJobs(prev =>
      //   prev.map(job =>
      //     job.job_id === jobId ? { ...job, status: newStatus } : job
      //   )
      // );


      await updateJobStatus(jobId, { status: newStatus, user });

      setJobs(prev =>
        prev.map(job =>
          job.job_id === jobId ? { ...job, status: newStatus } : job
        )
      );

      if (newStatus === "Closed") {
        setCandidatesWithJobs(prev =>
          prev.filter(c => c.job_id !== jobId)
        );

        if (selectedJobId === jobId) {
          setLinkedCandidates([]);
          setShowModal(false);
        }
      }

      <CAlert color="primary">Job Updated Successfully</CAlert>

    } catch (err) {
      console.error("Error updating job status:", err);
      alert("Failed to update job status");
    }
  };
  // Fetch jobs (Admin sees all, Recruiter sees only assigned)
// Inside ActiveJobsScreen.js

useEffect(() => {
  const fetchJobs = async () => {
    setLoading(true);
    try {
      let data;
      if (role === "Admin") {
        data = await getAllJobs();
      } else if (role === "Recruiter") {
        data = await getAssignedJobs(userId);
      } else if (role === "Client") {
        // MATCHING NAME HERE
        data = await getClientJobs(userId); 
      }
      setJobs(data || []);
    } catch (err) {
      console.error("Error fetching jobs:", err);
    } finally {
      setLoading(false);
    }
  };
  fetchJobs();
}, [userId, role]);


  // Fetch all candidates linked to jobs
  const fetchCandidatesWithJobs = async () => {
    try {
      const res = await getAllJobsWithCandidates();

      if (!res || !Array.isArray(res.data)) {
        setCandidatesWithJobs([]);
        return;
      }

      const rows = [];

      res.data.forEach(job => {
        if (!job.JobCandidate) return;

        job.JobCandidate.forEach(link => {
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
      console.error("Error fetching candidates with jobs:", err);
      setCandidatesWithJobs([]);
    }
  };


  useEffect(() => {
    fetchCandidatesWithJobs();
  }, []);

  // Filter candidates based on visible jobs (same logic as cards)
  const jobTitlesForRole = jobs.map(j => j.title);
  // const filteredCandidates = candidatesWithJobs.filter(c =>
  //   c.jobs.some(jobTitle => jobTitlesForRole.includes(jobTitle))
  // );
  // Filter candidates to exclude those linked to closed jobs
  // const filteredCandidates = candidatesWithJobs.filter(c =>
  //   c.jobs.some(jobTitle => {
  //     const job = jobs.find(j => j.title === jobTitle);
  //     return job && job.status !== "Closed"; // Only keep jobs that are not closed
  //   })


  // );

// This goes right before your return statement in ActiveJobsScreen.js
const filteredCandidates = candidatesWithJobs.filter(c => 
  jobs.some(j => j.job_id === c.job_id) && c.job_status !== "Closed"
);

  console.log("Filtered candidates for table:", filteredCandidates);

  // Open modal and fetch candidates
  const openCandidatesModal = async (jobId) => {
    setSelectedJobId(jobId);
    try {
      const candidates = await getAllCandidates();
      setAllCandidates(Array.isArray(candidates) ? candidates : []);

      const linked = await getLinkedCandidates(jobId);
      setLinkedCandidates(Array.isArray(linked) ? linked : []);
    } catch (err) {
      console.error("Error fetching candidates:", err);
      setAllCandidates([]);
      setLinkedCandidates([]);
    }
    setShowModal(true);
  };



  const handleDownloadCV = async (candidate) => {
  try {
    let type = null;

    if (candidate.resume_url_redacted) {
      type = "redacted";
    } else if (candidate.resume_url) {
      type = "original";
    }

    if (!type) {
      alert("No CV available for this candidate. Request admin.");
      return;
    }

    const signedUrl = await getCandidateSignedUrl(candidate.candidate_id, type);
    downloadFile(signedUrl, `${candidate.candidate_name}_${type}.pdf`);
  } catch (err) {
    console.error(err);
    alert("Failed to download CV");
  }
};

  // Link candidate
  const handleLink = async (candidateId) => {
    if (!selectedJobId) return;

    try {
      const res = await linkCandidateToJob(selectedJobId, candidateId);
      alert(res.data.message || "Candidate linked successfully!");

      const updatedLinked = await getLinkedCandidates(selectedJobId);
      setLinkedCandidates(Array.isArray(updatedLinked) ? updatedLinked : []);

      fetchCandidatesWithJobs();
    } catch (err) {
      if (err.response?.status === 409) {
        alert("Candidate is already linked to this job.");
      } else {
        console.error("Error linking candidate:", err);
        alert("Error linking candidate");
      }
    }
  };

  // Unlink candidate from modal
  const handleUnlink = async (candidateId) => {
    if (!selectedJobId) return;

    try {
      await unlinkCandidateFromJob(selectedJobId, candidateId);

      const updatedLinked = await getLinkedCandidates(selectedJobId);
      setLinkedCandidates(Array.isArray(updatedLinked) ? updatedLinked : []);

      fetchCandidatesWithJobs();
    } catch (err) {
      console.error("Error unlinking candidate:", err);
      alert("Error unlinking candidate");
    }
  };

  // Unlink candidate from table
  // const handleTableUnlink = async (candidateId) => {
  //   try {
  //     const candidate = candidatesWithJobs.find(c => c.candidate_id === candidateId);
  //     if (!candidate) return;

  //     for (let jobTitle of candidate.jobs) {
  //       const job = jobs.find(j => j.title === jobTitle);
  //       if (!job) continue;

  //       await unlinkCandidateFromJob(job.job_id, candidateId);
  //     }

  //     alert("Candidate unlinked from all jobs successfully!");

  //     fetchCandidatesWithJobs();

  //     if (selectedJobId) {
  //       const updatedLinked = await getLinkedCandidates(selectedJobId);
  //       setLinkedCandidates(Array.isArray(updatedLinked) ? updatedLinked : []);
  //     }
  //   } catch (err) {
  //     console.error("Error unlinking candidate from table:", err);
  //     alert("Error unlinking candidate");
  //   }
  // };


  const handleTableUnlink = async (jobId, candidateId) => {
    try {
      await unlinkCandidateFromJob(jobId, candidateId);
      fetchCandidatesWithJobs();
      alert("Candidate unlinked from all jobs successfully!");

    } catch (err) {
      console.error("Error unlinking candidate:", err);
      alert("Error unlinking candidate");
    }
  };


  if (!userId && role !== "Admin") return <p>Loading user info...</p>;
  if (loading) return <p className="loading-text">Loading jobs...</p>;

  return (
    <div className="active-jobs-container">
      {/* <h2 className="active-jobs-heading">Active Job Openings</h2> */}

      {/* Integrate AutoClearClosedJobs 
      <AutoClearClosedJobs
        jobs={jobs}
        setLinkedCandidates={setLinkedCandidates}
        selectedJobId={selectedJobId}
      />*/}
      {jobs.length === 0 && <p>No jobs found.</p>}
      <div className="jobs-grid">
        {jobs.map((job) => (
          <div key={job.job_id} className="job-card">

            <div >

              <select
                className={`job-status ${job.status?.toLowerCase()} ${job.status === "Closed" ? "no-arrow" : ""
                  }`}
                value={job.status}
                onChange={(e) => handleStatusChange(job.job_id, e.target.value)}
                disabled={job.status === "Closed" || role === "Client"}
              >
                {JOB_STATUSES.map(status => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>



             {/* Link button below the status */}
{role === "Recruiter" && !["Closed", "Placement", "Paused"].includes(job.status) && (
  <div>
    <FaLink
      style={{ cursor: "pointer" }}
      onClick={() => openCandidatesModal(job.job_id)}
      title="Link Candidates"
    />
  </div>
)}




            </div>
            <div className="job-header">
              <h3>{job.title}</h3>
            </div>

            {/* Column layout: select on top, link button below */}



            <div>

            </div>
            <p className="job-description">{job.description || "No description provided."}</p>
          </div>


        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3>Link Candidates</h3>
              <button onClick={() => setShowModal(false)}>Close</button>
            </div>

            <h4>Linked Candidates:</h4>
            {linkedCandidates.length === 0 && <p>No candidates linked yet.</p>}
            {linkedCandidates.map((c) => (
              <div key={c.candidate_id} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                {c.name}
                <FaTimes
                  style={{ cursor: "pointer", color: "red" }}
                  title="Unlink Candidate"
                  onClick={() => handleUnlink(c.candidate_id)}
                />
              </div>
            ))}

            <h4>All Candidates:</h4>
            {allCandidates.length === 0 && <p>No candidates available.</p>}
            {allCandidates.map((c) => {
              const isLinked = linkedCandidates.some((lc) => lc.candidate_id === c.candidate_id);
              return (
                <div key={c.candidate_id} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  {c.name}
                  {!isLinked && <button onClick={() => handleLink(c.candidate_id)}>Link</button>}
                  {isLinked && <span style={{ color: "green", fontWeight: "bold" }}>Linked</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Table */}
      {/* <h3 style={{ marginTop: "70px" }}>All Candidates with Linked Jobs</h3> */}
     <table className="linked-jobs-table">
  <thead>
    <tr>
      <th>Candidate Name</th>
      <th>Linked Jobs</th>

      <th>CV</th> {/* New CV column */}
      <th>Action</th>
    </tr>
  </thead>

  <tbody>
    {filteredCandidates.map((c, index) => (
      <tr key={`${c.candidate_id}-${c.job_id}-${index}`}>
        <td>{c.candidate_name}</td>
        <td>{c.job_title}</td>

        {/* if u wanna show both */}

       {/* <td>
  {c.resume_url_redacted || c.resume_url ? (
    <button
      className={`cv-button ${c.resume_url_redacted ? "red" : "gray"}`}
      onClick={() => handleDownloadCV(c)}
    >
      {c.resume_url_redacted ? "Download Redacted" : "Download CV"}
    </button>
  ) : (
    "Not available. Request admin."
  )}
</td> */}




<td>
  {c.resume_url_redacted ? (
    <button
      className="cv-button red"
      onClick={() => handleDownloadCV(c)}
    >
      Download Redacted
    </button>
  ) : (
    "Contact admin"
  )}
</td>


        <td>
          <FaTrash
            style={{ cursor: "pointer", color: "red" }}
            title="Unlink Candidate from Job"
            onClick={() => handleTableUnlink(c.job_id, c.candidate_id)}
          />
        </td>
      </tr>
    ))}
  </tbody>
</table>

    </div>
  );
};

export default ActiveJobsScreen;


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
//   getClientJobs
// } from "../../../api/api";
// import { FaLink, FaTimes, FaTrash } from "react-icons/fa";
// import "./ActiveJobs.css";
// import { CAlert } from "@coreui/react";

// const ActiveJobsScreen = ({ userId, role }) => {
//   const [jobs, setJobs] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [allCandidates, setAllCandidates] = useState([]);
//   const [linkedCandidates, setLinkedCandidates] = useState([]);
//   const [selectedJobId, setSelectedJobId] = useState(null);
//   const [showModal, setShowModal] = useState(false);
//   const [candidatesWithJobs, setCandidatesWithJobs] = useState([]);

//   const [alert, setAlert] = useState({ show: false, message: "", color: "success" });

//   const JOB_STATUSES = ["Open", "Paused", "Closed", "Placement"];

//   // Helper to show alerts
//   const showAlert = (message, color = "success", duration = 3000) => {
//     setAlert({ show: true, message, color });
//     setTimeout(() => setAlert(prev => ({ ...prev, show: false })), duration);
//   };

//   // Handle job status change
//   const handleStatusChange = async (jobId, newStatus) => {
//     try {
//       const user = {
//         userId: localStorage.getItem("userId"),
//         role: localStorage.getItem("role"),
//       };

//       await updateJobStatus(jobId, { status: newStatus, user });

//       setJobs(prev =>
//         prev.map(job =>
//           job.job_id === jobId ? { ...job, status: newStatus } : job
//         )
//       );

//       showAlert("Job Updated Successfully", "primary");

//       if (newStatus === "Closed") {
//         setCandidatesWithJobs(prev => prev.filter(c => c.job_id !== jobId));
//         if (selectedJobId === jobId) {
//           setLinkedCandidates([]);
//           setShowModal(false);
//         }
//       }
//     } catch (err) {
//       console.error("Error updating job status:", err);
//       showAlert("Failed to update job status", "danger");
//     }
//   };

//   // Fetch jobs based on role
//   useEffect(() => {
//     const fetchJobs = async () => {
//       setLoading(true);
//       try {
//         let data = [];
//         if (role === "Admin") {
//           data = await getAllJobs();
//         } else if (role === "Recruiter") {
//           data = await getAssignedJobs(userId);
//         } else if (role === "Client") {
//           data = await getClientJobs(userId);
//         }
//         setJobs(data || []);
//       } catch (err) {
//         console.error("Error fetching jobs:", err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchJobs();
//   }, [userId, role]);

//   // Fetch all candidates linked to jobs
//   const fetchCandidatesWithJobs = async () => {
//     try {
//       const res = await getAllJobsWithCandidates();
//       if (!res || !Array.isArray(res.data)) {
//         setCandidatesWithJobs([]);
//         return;
//       }

//       const rows = [];
//       res.data.forEach(job => {
//         if (!job.JobCandidate) return;
//         job.JobCandidate.forEach(link => {
//           const cand = link.Candidate;
//           if (!cand) return;
//           rows.push({
//             candidate_id: cand.candidate_id,
//             candidate_name: cand.name,
//             job_id: job.job_id,
//             job_title: job.title,
//             job_status: job.status,
//           });
//         });
//       });
//       setCandidatesWithJobs(rows);
//     } catch (err) {
//       console.error("Error fetching candidates with jobs:", err);
//       setCandidatesWithJobs([]);
//     }
//   };

//   useEffect(() => {
//     fetchCandidatesWithJobs();
//   }, []);

//   const filteredCandidates = candidatesWithJobs.filter(c =>
//     jobs.some(j => j.job_id === c.job_id) && c.job_status !== "Closed"
//   );

//   // Open modal to link candidates
//   const openCandidatesModal = async (jobId) => {
//     setSelectedJobId(jobId);
//     try {
//       const candidates = await getAllCandidates();
//       setAllCandidates(Array.isArray(candidates) ? candidates : []);
//       const linked = await getLinkedCandidates(jobId);
//       setLinkedCandidates(Array.isArray(linked) ? linked : []);
//     } catch (err) {
//       console.error("Error fetching candidates:", err);
//       setAllCandidates([]);
//       setLinkedCandidates([]);
//     }
//     setShowModal(true);
//   };

//   // Link candidate to job
//   const handleLink = async (candidateId) => {
//     if (!selectedJobId) return;

//     try {
//       const res = await linkCandidateToJob(selectedJobId, candidateId);
//       showAlert(res.data.message || "Candidate linked successfully!", "success");

//       const updatedLinked = await getLinkedCandidates(selectedJobId);
//       setLinkedCandidates(Array.isArray(updatedLinked) ? updatedLinked : []);
//       fetchCandidatesWithJobs();
//     } catch (err) {
//       const errorMsg = err.response?.status === 409
//         ? "Candidate is already linked to this job."
//         : "Error linking candidate";
//       showAlert(errorMsg, "danger");
//     }
//   };

//   // Unlink candidate from modal
//   const handleUnlink = async (candidateId) => {
//     if (!selectedJobId) return;
//     try {
//       await unlinkCandidateFromJob(selectedJobId, candidateId);
//       const updatedLinked = await getLinkedCandidates(selectedJobId);
//       setLinkedCandidates(Array.isArray(updatedLinked) ? updatedLinked : []);
//       fetchCandidatesWithJobs();
//       showAlert("Candidate unlinked successfully", "success");
//     } catch (err) {
//       console.error("Error unlinking candidate:", err);
//       showAlert("Error unlinking candidate", "danger");
//     }
//   };

//   // Unlink candidate from table
//   const handleTableUnlink = async (jobId, candidateId) => {
//     try {
//       await unlinkCandidateFromJob(jobId, candidateId);
//       fetchCandidatesWithJobs();
//       showAlert("Candidate unlinked successfully", "success");
//     } catch (err) {
//       console.error("Error unlinking candidate:", err);
//       showAlert("Error unlinking candidate", "danger");
//     }
//   };

//   if (!userId && role !== "Admin") return <p>Loading user info...</p>;
//   if (loading) return <p className="loading-text">Loading jobs...</p>;

//   return (
//     <div className="active-jobs-container">
//       {/* Global Alert */}
//       {alert.show && (
//         <CAlert
//           color={alert.color}
//           style={{
//             position: 'fixed',
//             top: '10px',
//             left: '50%',
//             transform: 'translateX(-50%)',
//             zIndex: 1000
//           }}
//         >
//           {alert.message}
//         </CAlert>
//       )}

//       <h2 className="active-jobs-heading">Active Job Openings</h2>

//       {jobs.length === 0 && <p>No jobs found.</p>}
//       <div className="jobs-grid">
//         {jobs.map((job) => (
//           <div key={job.job_id} className="job-card">
//             <div>
//               <select
//                 className={`job-status ${job.status?.toLowerCase()} ${job.status === "Closed" ? "no-arrow" : ""}`}
//                 value={job.status}
//                 onChange={(e) => handleStatusChange(job.job_id, e.target.value)}
//                 disabled={job.status === "Closed" || role === "Client"}
//               >
//                 {JOB_STATUSES.map(status => (
//                   <option key={status} value={status}>{status}</option>
//                 ))}
//               </select>

//               {role === "Recruiter" && !["Closed", "Placement", "Paused"].includes(job.status) && (
//                 <div style={{ marginTop: "8px" }}>
//                   <FaLink
//                     style={{ cursor: "pointer", color: "#321fdb" }}
//                     onClick={() => openCandidatesModal(job.job_id)}
//                     title="Link Candidates"
//                   />
//                 </div>
//               )}
//             </div>

//             <div className="job-header">
//               <h3>{job.title}</h3>
//             </div>
//             <p className="job-description">{job.description || "No description provided."}</p>
//           </div>
//         ))}
//       </div>

//       {/* Modal */}
//       {showModal && (
//         <div className="modal-overlay">
//           <div className="modal-content">
//             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//               <h3>Link Candidates</h3>
//               <button onClick={() => setShowModal(false)}>Close</button>
//             </div>

//             <h4>Linked Candidates:</h4>
//             {linkedCandidates.length === 0 && <p>No candidates linked yet.</p>}
//             {linkedCandidates.map((c) => (
//               <div key={c.candidate_id} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "5px" }}>
//                 {c.name}
//                 <FaTimes
//                   style={{ cursor: "pointer", color: "red" }}
//                   onClick={() => handleUnlink(c.candidate_id)}
//                 />
//               </div>
//             ))}

//             <h4 style={{ marginTop: "20px" }}>All Candidates:</h4>
//             {allCandidates.map((c) => {
//               const isLinked = linkedCandidates.some((lc) => lc.candidate_id === c.candidate_id);
//               return (
//                 <div key={c.candidate_id} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "5px" }}>
//                   {c.name}
//                   {!isLinked && <button onClick={() => handleLink(c.candidate_id)}>Link</button>}
//                   {isLinked && <span style={{ color: "green", fontWeight: "bold" }}>Linked</span>}
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       )}

//       {/* Table */}
//       <h3 style={{ marginTop: "30px" }}>All Candidates with Linked Jobs</h3>
//       <table className="linked-jobs-table">
//         <thead>
//           <tr>
//             <th>Candidate Name</th>
//             <th>Linked Jobs</th>
//             <th>Action</th>
//           </tr>
//         </thead>
//         <tbody>
//           {filteredCandidates.map((c, index) => (
//             <tr key={`${c.candidate_id}-${c.job_id}-${index}`}>
//               <td>{c.candidate_name}</td>
//               <td>{c.job_title}</td>
//               <td>
//                 <FaTrash
//                   style={{ cursor: "pointer", color: "red" }}
//                   title="Unlink Candidate from Job"
//                   onClick={() => handleTableUnlink(c.job_id, c.candidate_id)}
//                 />
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default ActiveJobsScreen;
