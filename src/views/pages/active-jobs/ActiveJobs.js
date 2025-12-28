// import { useEffect, useState } from "react";
// import {
//   getAllCandidates,
//   getLinkedCandidates,
//   linkCandidateToJob,
//   unlinkCandidateFromJob,
//   getAllJobs,
//   getAssignedJobs,
//   getAllJobsWithCandidates
// } from "../../../api/api";
// import { FaCircle, FaLink, FaTimes, FaTrash } from "react-icons/fa";
// import "./ActiveJobs.css";

// const ActiveJobsScreen = ({ userId, role }) => {
//   const [jobs, setJobs] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [allCandidates, setAllCandidates] = useState([]);
//   const [linkedCandidates, setLinkedCandidates] = useState([]);
//   const [selectedJobId, setSelectedJobId] = useState(null);
//   const [showModal, setShowModal] = useState(false);
//   const [candidatesWithJobs, setCandidatesWithJobs] = useState([]);

//   // Fetch jobs
//   useEffect(() => {
//     const fetchJobs = async () => {
//       setLoading(true);
//       try {
//         const data = role === "Admin"
//           ? await getAllJobs()
//           : await getAssignedJobs(userId);
//         setJobs(data);
//       } catch (err) {
//         console.error("Error fetching jobs:", err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchJobs();
//   }, [userId, role]);

//   // Fetch candidates with jobs and recruiter info
//   const fetchCandidatesWithJobs = async () => {
//     try {
//       const res = await getAllJobsWithCandidates();

//       if (!res || !Array.isArray(res.data)) {
//         console.warn("No data received from getAllJobsWithCandidates");
//         setCandidatesWithJobs([]);
//         return;
//       }

//       const candidateMap = {};

//       res.data.forEach(job => {
//         if (!job.JobCandidate) return;
//         job.JobCandidate.forEach(link => {
//           const cand = link.Candidate;
//           const recruiter = link.recruiter_name; // from API
//           if (!cand) return;

//           if (candidateMap[cand.candidate_id]) {
//             candidateMap[cand.candidate_id].jobs.push(job.title);
//             if (recruiter && !candidateMap[cand.candidate_id].recruiters.includes(recruiter)) {
//               candidateMap[cand.candidate_id].recruiters.push(recruiter);
//             }
//           } else {
//             candidateMap[cand.candidate_id] = {
//               candidate_id: cand.candidate_id,
//               name: cand.name,
//               jobs: [job.title],
//               recruiters: recruiter ? [recruiter] : []
//             };
//           }
//         });
//       });

//       setCandidatesWithJobs(Object.values(candidateMap));
//     } catch (err) {
//       console.error("Error fetching candidates with jobs:", err);
//       setCandidatesWithJobs([]);
//     }
//   };

//   useEffect(() => {
//     fetchCandidatesWithJobs();
//   }, []);

//   // Open modal and fetch candidates
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

//   // Link candidate
//   const handleLink = async (candidateId) => {
//     if (!selectedJobId) return;

//     try {
//       const res = await linkCandidateToJob(selectedJobId, candidateId);
//       alert(res.data.message || "Candidate linked successfully!");

//       const updatedLinked = await getLinkedCandidates(selectedJobId);
//       setLinkedCandidates(Array.isArray(updatedLinked) ? updatedLinked : []);

//       fetchCandidatesWithJobs();
//     } catch (err) {
//       if (err.response?.status === 409) {
//         alert("Candidate is already linked to this job.");
//       } else {
//         console.error("Error linking candidate:", err);
//         alert("Error linking candidate");
//       }
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
//     } catch (err) {
//       console.error("Error unlinking candidate:", err);
//       alert("Error unlinking candidate");
//     }
//   };

//   // Unlink candidate from table
//   const handleTableUnlink = async (candidateId) => {
//     try {
//       const candidate = candidatesWithJobs.find(c => c.candidate_id === candidateId);
//       if (!candidate) return;

//       for (let jobTitle of candidate.jobs) {
//         const job = jobs.find(j => j.title === jobTitle);
//         if (!job) continue;

//         await unlinkCandidateFromJob(job.job_id, candidateId);
//       }

//       alert("Candidate unlinked from all jobs successfully!");

//       fetchCandidatesWithJobs();

//       if (selectedJobId) {
//         const updatedLinked = await getLinkedCandidates(selectedJobId);
//         setLinkedCandidates(Array.isArray(updatedLinked) ? updatedLinked : []);
//       }
//     } catch (err) {
//       console.error("Error unlinking candidate from table:", err);
//       alert("Error unlinking candidate");
//     }
//   };

//   if (!userId && role !== "Admin") return <p>Loading user info...</p>;
//   if (loading) return <p className="loading-text">Loading jobs...</p>;

//   return (
//     <div className="active-jobs-container">
//       <h2 className="active-jobs-heading">Active Job Openings</h2>

//       {jobs.length === 0 && <p>No jobs found.</p>}
//       <div className="jobs-grid">
//         {jobs.map((job) => (
//           <div key={job.job_id} className="job-card">
//             <div className="job-header">
//               <h3>{job.title}</h3>
//               <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
//                 <span className="job-status active">
//                   <FaCircle /> Active
//                 </span>
//                 {role !== "Admin" && (
//                   <FaLink
//                     style={{ cursor: "pointer" }}
//                     onClick={() => openCandidatesModal(job.job_id)}
//                     title="Link Candidates"
//                   />
//                 )}
//               </div>
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
//               <div key={c.candidate_id} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
//                 {c.name}
//                 <FaTimes
//                   style={{ cursor: "pointer", color: "red" }}
//                   title="Unlink Candidate"
//                   onClick={() => handleUnlink(c.candidate_id)}
//                 />
//               </div>
//             ))}

//             <h4>All Candidates:</h4>
//             {allCandidates.length === 0 && <p>No candidates available.</p>}
//             {allCandidates.map((c) => {
//               const isLinked = linkedCandidates.some((lc) => lc.candidate_id === c.candidate_id);
//               return (
//                 <div key={c.candidate_id} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
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
//             <th>Recruiter</th>
//             <th>Action</th>
//           </tr>
//         </thead>
//         <tbody>
//           {candidatesWithJobs.map(c => (
//             <tr key={c.candidate_id}>
//               <td>{c.name}</td>
//               <td>{c.jobs.join(", ") || "No jobs linked"}</td>
//               <td>{c.recruiters ? c.recruiters.join(", ") : "-"}</td>
//               <td>
//                 <FaTrash
//                   style={{ cursor: "pointer", color: "red" }}
//                   title="Delete/Unlink Candidate"
//                   onClick={() => handleTableUnlink(c.candidate_id)}
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

import { useEffect, useState } from "react";
import {
  getAllCandidates,
  getLinkedCandidates,
  linkCandidateToJob,
  unlinkCandidateFromJob,
  getAllJobs,
  getAssignedJobs,
  getAllJobsWithCandidates
} from "../../../api/api";
import { FaCircle, FaLink, FaTimes, FaTrash } from "react-icons/fa";
import "./ActiveJobs.css";

const ActiveJobsScreen = ({ userId, role }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allCandidates, setAllCandidates] = useState([]);
  const [linkedCandidates, setLinkedCandidates] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [candidatesWithJobs, setCandidatesWithJobs] = useState([]);

  // Fetch jobs (Admin sees all, Recruiter sees only assigned)
  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const data = role === "Admin"
          ? await getAllJobs()
          : await getAssignedJobs(userId);
        console.log("Jobs fetched:", data);
        setJobs(data);
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
        console.warn("No data received from getAllJobsWithCandidates");
        setCandidatesWithJobs([]);
        return;
      }

      const candidateMap = {};

      res.data.forEach(job => {
        if (!job.JobCandidate) return;
        job.JobCandidate.forEach(link => {
          const cand = link.Candidate;
          if (!cand) return;

          if (candidateMap[cand.candidate_id]) {
            candidateMap[cand.candidate_id].jobs.push(job.title);
          } else {
            candidateMap[cand.candidate_id] = {
              candidate_id: cand.candidate_id,
              name: cand.name,
              jobs: [job.title],
            };
          }
        });
      });

      const allCandidatesArray = Object.values(candidateMap);
      console.log("Processed candidates with jobs:", allCandidatesArray);

      setCandidatesWithJobs(allCandidatesArray);
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
  const filteredCandidates = candidatesWithJobs.filter(c =>
    c.jobs.some(jobTitle => jobTitlesForRole.includes(jobTitle))
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
  const handleTableUnlink = async (candidateId) => {
    try {
      const candidate = candidatesWithJobs.find(c => c.candidate_id === candidateId);
      if (!candidate) return;

      for (let jobTitle of candidate.jobs) {
        const job = jobs.find(j => j.title === jobTitle);
        if (!job) continue;

        await unlinkCandidateFromJob(job.job_id, candidateId);
      }

      alert("Candidate unlinked from all jobs successfully!");

      fetchCandidatesWithJobs();

      if (selectedJobId) {
        const updatedLinked = await getLinkedCandidates(selectedJobId);
        setLinkedCandidates(Array.isArray(updatedLinked) ? updatedLinked : []);
      }
    } catch (err) {
      console.error("Error unlinking candidate from table:", err);
      alert("Error unlinking candidate");
    }
  };

  if (!userId && role !== "Admin") return <p>Loading user info...</p>;
  if (loading) return <p className="loading-text">Loading jobs...</p>;

  return (
    <div className="active-jobs-container">
      <h2 className="active-jobs-heading">Active Job Openings</h2>

      {jobs.length === 0 && <p>No jobs found.</p>}
      <div className="jobs-grid">
        {jobs.map((job) => (
          <div key={job.job_id} className="job-card">
            <div className="job-header">
              <h3>{job.title}</h3>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span className="job-status active">
                  <FaCircle /> Active
                </span>
                {role !== "Admin" && (
                  <FaLink
                    style={{ cursor: "pointer" }}
                    onClick={() => openCandidatesModal(job.job_id)}
                    title="Link Candidates"
                  />
                )}
              </div>
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
      <h3 style={{ marginTop: "30px" }}>All Candidates with Linked Jobs</h3>
      <table className="linked-jobs-table">
        <thead>
          <tr>
            <th>Candidate Name</th>
            <th>Linked Jobs</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredCandidates.map(c => (
            <tr key={c.candidate_id}>
              <td>{c.name}</td>
              <td>{c.jobs.join(", ") || "No jobs linked"}</td>
              <td>
                <FaTrash
                  style={{ cursor: "pointer", color: "red" }}
                  title="Delete/Unlink Candidate"
                  onClick={() => handleTableUnlink(c.candidate_id)}
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
