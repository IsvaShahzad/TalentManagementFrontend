import { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
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
  addJobNoteApi,
  getRecruiterCandidatesApi // <-- add this

} from "../../../api/api";
import { useAuth } from "../../../context/AuthContext";
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
import JobForm from '../position-tracker/JobForm';
import DisplayJobsTable from '../position-tracker/DisplayJobs';


const ActiveJobsScreen = ({ userId, role }) => {
  const { isAuthenticated, token, user: authUser } = useAuth();
  const isRecruiter =
    role === "Recruiter" || String(role || "").toLowerCase() === "recruiter";
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allCandidates, setAllCandidates] = useState([]);
  const [linkedCandidates, setLinkedCandidates] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [candidatesWithJobs, setCandidatesWithJobs] = useState([]);
  const [pageToast, setPageToast] = useState(null);
  const [feedback, setFeedback] = useState(""); // <-- ensures 'feedback' exists
  const [expandedSkills, setExpandedSkills] = useState({});
  /** Only one job card’s description expanded at a time (Position Tracker cards) */
  const [expandedDescriptionJobId, setExpandedDescriptionJobId] = useState(null);

  const [alerts, setAlerts] = useState([]);



  const [targetJobId, setTargetJobId] = useState(null);
  const [modalCandidates, setModalCandidates] = useState([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [candidatesModalVisible, setCandidatesModalVisible] = useState(false);

  // Linked candidates search & pagination
  const [linkedSearch, setLinkedSearch] = useState("");
  const [linkedPage, setLinkedPage] = useState(1);
  const linkedPerPage = 5;

  // ---------- Pagination ----------
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 10;

  const JOB_STATUSES = ["Open", "Paused", "Closed", "Placed"];
  const [currentNotesJob, setCurrentNotesJob] = useState(null)
  // ---------- Toast helper ----------
  const showToast = (message, color = "success") => {
    setPageToast({ message, color });
  };

  const [notesVisible, setNotesVisible] = useState(false);
  const [notesJobId, setNotesJobId] = useState(null);
  const [notesRefreshKey, setNotesRefreshKey] = useState(0);
  /** Optimistically show new feedback before list refetch completes */
  const [prependNote, setPrependNote] = useState(null);
  const clearPrependNote = useCallback(() => setPrependNote(null), []);
  const [addingNote, setAddingNote] = useState(false);
  const [showJobForm, setShowJobForm] = useState(false);

  /** Recruiter: candidates they uploaded — top table + job picker before linking */
  const [recruiterUploads, setRecruiterUploads] = useState([]);
  const [loadingRecruiterUploads, setLoadingRecruiterUploads] = useState(false);
  const [jobPickForCandidate, setJobPickForCandidate] = useState({});
  const [quickLinkingId, setQuickLinkingId] = useState(null);

  // Show job cards by default so recruiters see jobs + "Link Candidates" without an extra click
  const [showJobCards, setShowJobCards] = useState(true);

  useEffect(() => {
    if (role === "Client" || role === "Recruiter" || role === "Admin") {
      setShowJobCards(true);
    }
  }, [role]);

  useEffect(() => {
    if (pageToast) {
      const timer = setTimeout(() => setPageToast(null), 600);
      return () => clearTimeout(timer);
    }
  }, [pageToast]);

  // ---------- Fetch Jobs ----------
  const fetchJobs = async () => {
    setLoading(true);
    try {
      let data = [];
      if (role === "Admin") data = await getAllJobs();
      else if (role === "Recruiter") data = await getAssignedJobs();
      else if (role === "Client") data = await getClientJobs();
      // Normalize status: "Placement" -> "Placed" for display
      const normalizedData = (data || []).map((job) => ({
        ...job,
        status: job.status === "Placement" ? "Placed" : job.status,
        description:
          job.description ??
          job.job_description ??
          "",
      }));
      setJobs(normalizedData);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      showToast("Failed to fetch jobs", "danger");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (
      (role === "Client" || role === "Recruiter") &&
      (!isAuthenticated || !token)
    ) {
      return;
    }

    fetchJobs();

    const handleJobAdded = () => {
      fetchJobs();
      setShowJobForm(false);
    };
    window.addEventListener('jobAdded', handleJobAdded);
    return () => window.removeEventListener('jobAdded', handleJobAdded);
  }, [userId, role, isAuthenticated, token]);

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
    if (role !== "Recruiter" && role !== "Admin") return;
    if (!isAuthenticated || !token) return;
    fetchCandidatesWithJobs();
  }, [role, isAuthenticated, token, jobs]);

  useEffect(() => {
    if (!isRecruiter || !isAuthenticated || !token) {
      setRecruiterUploads([]);
      return;
    }
    let cancelled = false;
    const load = async () => {
      setLoadingRecruiterUploads(true);
      try {
        const data = await getRecruiterCandidatesApi();
        const list = Array.isArray(data) ? data : data?.candidates || [];
        if (!cancelled) setRecruiterUploads(list);
      } catch (e) {
        console.error(e);
        if (!cancelled) setRecruiterUploads([]);
      } finally {
        if (!cancelled) setLoadingRecruiterUploads(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [isRecruiter, isAuthenticated, token]);

  // Restore job dropdown from linked-table data after refresh (supports multiple jobs per candidate)
  useEffect(() => {
    if (!isRecruiter) return;
    setJobPickForCandidate((prev) => {
      const next = { ...prev };
      const pickableJobIds = (jobs || [])
        .filter((j) => {
          const st = (j.status === "Placement" ? "Placed" : j.status || "")
            .toString();
          return !["Closed", "Placed", "Paused"].includes(st);
        })
        .map((j) => String(j.job_id));

      for (const c of recruiterUploads) {
        const cidKey = String(c.candidate_id);
        const existing = next[cidKey];
        // Only fill when user has never chosen a job (after refresh prev is {})
        if (existing !== undefined) continue;

        const linkedJobIds = candidatesWithJobs
          .filter((l) => String(l.candidate_id) === cidKey)
          .map((l) => String(l.job_id));

        const firstPickableLinked = pickableJobIds.find((jid) =>
          linkedJobIds.includes(jid),
        );
        if (firstPickableLinked) next[cidKey] = firstPickableLinked;
      }
      return next;
    });
  }, [isRecruiter, recruiterUploads, candidatesWithJobs, jobs]);

  const handleQuickLink = async (candidateId) => {
    const cidKey = String(candidateId);
    const jid = jobPickForCandidate[cidKey];
    if (!jid) {
      showAlert("Select a job first", "warning");
      return;
    }
    setQuickLinkingId(cidKey);
    try {
      await linkCandidateToJob(jid, cidKey);
      await fetchCandidatesWithJobs();
      window.dispatchEvent(new Event("refreshNotifications"));
      showAlert("Candidate linked successfully", "success");
    } catch (err) {
      if (err.response?.status === 409) {
        await fetchCandidatesWithJobs();
        showAlert("Candidate already linked to this job", "success");
      } else {
        console.error(err);
        showToast("Failed to link candidate", "danger");
      }
    } finally {
      setQuickLinkingId(null);
    }
  };

  const showAlert = (message, color = "success", duration = 1500) => {
    const id = new Date().getTime();
    setAlerts((prev) => [...prev, { id, message, color }]);
    setTimeout(() => {
      setAlerts((prev) => prev.filter((alert) => alert.id !== id));
    }, duration);
  };


  const addNote = async () => {
    if (!feedback.trim() || !notesJobId) return;
    const uid = authUser?.user_id || (() => {
      try {
        const u = JSON.parse(localStorage.getItem("user") || "{}");
        return u?.user_id;
      } catch {
        return null;
      }
    })();
    if (!uid) {
      toast.error("You must be signed in to add feedback.", {
        position: "top-center",
        autoClose: 4000,
      });
      return;
    }

    try {
      setAddingNote(true);

      const data = await addJobNoteApi({
        job_id: notesJobId,
        feedback,
        visibility: "client",
      });

      if (!data?.success || !data?.note) {
        throw new Error(data?.message || "Server did not save feedback");
      }

      setFeedback("");
      const jobTitle =
        jobs.find((j) => String(j.job_id) === String(notesJobId))?.title ||
        "this position";
      toast.success(`Feedback added for "${jobTitle}".`, {
        autoClose: 4000,
        position: "top-center",
      });
      setPrependNote(data.note);
      window.dispatchEvent(new Event("refreshNotifications"));
      setNotesRefreshKey((prev) => prev + 1);
      setNotesVisible(false);
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to add note";
      toast.error(msg, { position: "top-center", autoClose: 5000 });
    } finally {
      setAddingNote(false);
    }
  };



  // ---------- Filtered candidates (string-safe job_id; exclude closed jobs) ----------
  const openJobIds = new Set((jobs || []).map((j) => String(j.job_id)));
  const filteredCandidates = candidatesWithJobs.filter((c) => {
    if (!openJobIds.has(String(c.job_id))) return false;
    const st = (c.job_status || "").toString().toLowerCase();
    return st !== "closed";
  });

  /** Recruiter top table: selected job + candidate pair exists in linked data (multiple jobs per candidate OK) */
  const isRecruiterLinkedToSelectedJob = (candidateId) => {
    const cidKey = String(candidateId);
    const jid = jobPickForCandidate[cidKey];
    if (!jid) return false;
    return candidatesWithJobs.some(
      (l) =>
        String(l.candidate_id) === cidKey &&
        String(l.job_id) === String(jid),
    );
  };

  // ---------- Handle Job Status Change ----------
  const handleStatusChange = async (jobId, newStatus) => {
    try {
      // Use the same userId source as fetchJobs (from props or localStorage)
      console.log("Updating job status:", { jobId, newStatus });
      await updateJobStatus(jobId, { status: newStatus });
      setJobs((prev) =>
        prev.map((job) => (job.job_id === jobId ? { ...job, status: newStatus } : job))
      );

      // Normalize status for local state update
      const normalizedNewStatus = newStatus === "Placed" ? "Placed" : newStatus;

      if (normalizedNewStatus === "Closed") {
        setCandidatesWithJobs((prev) => prev.filter((c) => c.job_id !== jobId));
        if (selectedJobId === jobId) {
          setLinkedCandidates([]);
          setShowModal(false);
        }
      }
      // Trigger refresh events for notifications and active jobs count
      window.dispatchEvent(new Event('refreshNotifications')); // Trigger bell refresh
      window.dispatchEvent(new Event('jobStatusChanged')); // Trigger active jobs count refresh
      window.dispatchEvent(new Event('refreshActiveJobs')); // Alternative event name
      showAlert("Job Status Updated successfully", "success");
    } catch (err) {
      console.error("Status update error:", err);
      const errorMessage = err?.response?.data?.message || err?.message || "Failed to update job status";
      showAlert(errorMessage, "danger");
    }
  };

  // ---------- Open Candidates Modal ----------
  // const openCandidatesModal = async (jobId) => {
  //   setSelectedJobId(jobId);
  //   try {
  //     const candidates = await getAllCandidates();
  //     setAllCandidates(Array.isArray(candidates) ? candidates : []);

  //     const linked = await getLinkedCandidates(jobId);
  //     setLinkedCandidates(Array.isArray(linked) ? linked : []);
  //     setShowModal(true);
  //   } catch (err) {
  //     console.error(err);
  //     showToast("Failed to fetch candidates", "danger");
  //   }
  // };




  // Inside your Parent Component
  const openCandidatesModal = async (jobId) => {
    if (role === "Client") return;
    // 1. Set the job we are working with
    setTargetJobId(jobId);
    setSelectedJobId(jobId); // Sync with your existing state
    setCandidatesModalVisible(true);
    setLoadingCandidates(true);

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      let data;

      // 2. Fetch based on role
      if (user?.role === "Recruiter") {
        data = await getRecruiterCandidatesApi();
      } else {
        // Admin/HR see all
        data = await getAllCandidates();
      }

      const candidatesList = Array.isArray(data) ? data : data.data || [];
      setModalCandidates(candidatesList);
    } catch (error) {
      console.error("Error fetching candidates:", error);
      showAlert("Failed to load candidates", "danger");
    } finally {
      setLoadingCandidates(false);
    }
  };
  // ---------- Link / Unlink Candidates ----------
  const handleLink = async (candidateId, explicitJobId) => {
    const jobIdToUse = explicitJobId ?? selectedJobId;
    if (!jobIdToUse) return;
    try {
      await linkCandidateToJob(jobIdToUse, candidateId);
      const updatedLinked = await getLinkedCandidates(jobIdToUse);
      setLinkedCandidates(Array.isArray(updatedLinked) ? updatedLinked : []);
      fetchCandidatesWithJobs();
      window.dispatchEvent(new Event('refreshNotifications')); // Trigger bell refresh
      showAlert("Candidate linked successfully", "success");
    } catch (err) {
      if (err.response?.status === 409)
        showAlert("Candidate already linked", "success");
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

      <h3 className="position-tracker-title">
        Position Tracker
      </h3>
      {/* --- 1. ALERTS & NOTIFICATIONS --- */}
      <div style={{ position: "fixed", top: 10, right: 10, zIndex: 10000 }}>
        {alerts.map((a) => (
          <CAlert key={a.id} color={a.color} dismissible>
            {a.message}
          </CAlert>
        ))}
      </div>

      {/* Recruiter: candidates they uploaded — pick assigned job, then Link (updates linked table below) */}
      {isRecruiter && (
        <div className="section-wrapper" style={{ marginBottom: "1.25rem" }}>
          <h4
            style={{
              marginBottom: "0.5rem",
              fontSize: "1.1rem",
              fontWeight: 600,
              color: "#1f3c88",
            }}
          >
            Your uploaded candidates
          </h4>
          <p className="text-muted small mb-2">
            Select one of your assigned jobs, then Link to add the candidate to the linked table below.
          </p>
          {loadingRecruiterUploads ? (
            <p className="text-muted">Loading your candidates…</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table
                className="linked-jobs-table"
                style={{
                  width: "100%",
                  minWidth: "640px",
                  borderCollapse: "collapse",
                }}
              >
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Position</th>
                    <th>Assign to job</th>
                    <th> </th>
                  </tr>
                </thead>
                <tbody>
                  {recruiterUploads.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center text-muted" style={{ padding: "1rem" }}>
                        No candidates uploaded by you yet. Add candidates from Talent Pool.
                      </td>
                    </tr>
                  ) : (
                    recruiterUploads.map((c) => {
                      const cidKey = String(c.candidate_id);
                      const pickableJobs = (jobs || []).filter((j) => {
                        const st = (j.status === "Placement" ? "Placed" : j.status || "")
                          .toString();
                        return !["Closed", "Placed", "Paused"].includes(st);
                      });
                      const linkedToPick = isRecruiterLinkedToSelectedJob(cidKey);
                      return (
                        <tr key={cidKey}>
                          <td style={{ whiteSpace: "normal" }}>{c.name}</td>
                          <td style={{ whiteSpace: "normal" }}>{c.email || "—"}</td>
                          <td style={{ whiteSpace: "normal" }}>{c.position_applied || "—"}</td>
                          <td>
                            <select
                              className="form-select form-select-sm"
                              style={{ minWidth: "180px" }}
                              value={jobPickForCandidate[cidKey] ?? ""}
                              onChange={(e) =>
                                setJobPickForCandidate((prev) => ({
                                  ...prev,
                                  [cidKey]: e.target.value,
                                }))
                              }
                            >
                              <option value="">Select job…</option>
                              {pickableJobs.map((j) => (
                                <option key={j.job_id} value={String(j.job_id)}>
                                  {j.title}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <CButton
                              color={linkedToPick ? "secondary" : "primary"}
                              size="sm"
                              disabled={quickLinkingId === cidKey || linkedToPick}
                              onClick={() => {
                                if (!linkedToPick) handleQuickLink(cidKey);
                              }}
                            >
                              {quickLinkingId === cidKey
                                ? "Linking…"
                                : linkedToPick
                                  ? "Linked"
                                  : "Link"}
                            </CButton>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* --- 2. FLOATING JOB FORM TRIGGER --- (Admin only) */}
      {role === "Admin" && <JobFormWrapper />}

      {/* --- 2b. JOB FORM MODAL FROM MENU --- */}
      {showJobForm && (
        <div className="job-form-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'auto',
          padding: '20px'
        }}>
          <div style={{
            position: 'relative',
            width: '100%',
            maxWidth: '800px',
            backgroundColor: '#fff',
            borderRadius: '8px',
            padding: '20px',
            margin: 'auto'
          }}>
            <button
              onClick={() => setShowJobForm(false)}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: 'transparent',
                border: 'none',
                fontSize: '28px',
                cursor: 'pointer',
                color: '#666',
                lineHeight: '1',
                padding: '0',
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ×
            </button>
            <JobForm />
          </div>
        </div>
      )}




      {/* --- 4. VISUAL CARD GRID --- */}
      {/* {showJobCards && (
        <div className="section-wrapper">
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
                  onAddJob={() => setShowJobForm(true)}
                />
              ))}
            </div>
          )}
        </div>
      )}

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
      )} */}




      {/* --- 3. TABULAR VIEW --- */}
      {/* Hide table for Recruiters and Clients; only Admin sees full jobs table */}
      {role !== "Recruiter" && role !== "Client" && (
        <div className="section-wrapper " style={{ marginTop: '20px' }}>
          <DisplayJobsTable jobs={jobs} />
        </div>
      )}


      {/* --- 6. LINK CANDIDATES MODAL --- */}
      <CModal
        visible={candidatesModalVisible}
        onClose={() => setCandidatesModalVisible(false)}
        size="lg"
        alignment="center"
      >
        <CModalHeader closeButton>
          <h4 className="modal-title">Link Candidates to Job</h4>
        </CModalHeader>
        <CModalBody>
          {loadingCandidates ? (
            <div className="text-center p-3">
              <div className="spinner-border text-primary" role="status"></div>
              <p>Loading your candidates...</p>
            </div>
          ) : modalCandidates.length > 0 ? (
            <div className="candidate-list">
              {modalCandidates.map((c) => {
                // Check if candidate is already linked to this job
                const isLinked = candidatesWithJobs.some(
                  (link) => link.candidate_id === c.candidate_id && link.job_id === targetJobId
                );

                return (
                  <div key={c.candidate_id} className="d-flex justify-content-between align-items-center p-2 border-bottom">
                    <span><strong>{c.name}</strong> ({c.email})</span>
                    {isLinked ? (
                      <span className="badge bg-success">Already Linked</span>
                    ) : (
                      <CButton
                        color="primary"
                        size="sm"
                        onClick={() => handleLink(c.candidate_id)}
                      >
                        Link Candidate
                      </CButton>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center p-4">
              <p className="text-muted">You haven't added any candidates yet. Please upload candidates in the 'Add Candidate' section first.</p>
            </div>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setCandidatesModalVisible(false)}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>
      {/* --- 7. CANDIDATE ASSIGNMENT SUMMARY ---
      {filteredCandidates.length > 0 && (
        <div className="mt-5">
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
      )} */}

      {/* --- JOB CARDS TOGGLE (Admin / Recruiter only; Client sees jobs by default) --- */}
      {role !== "Client" && (
        <div className="section-wrapper">
          <div
            className="toggle-jobs-btn"
            onClick={() => setShowJobCards((prev) => !prev)}
          >
            {showJobCards ? "Hide Jobs" : "Show Jobs"}
          </div>
        </div>
      )}

      {/* --- 4. VISUAL CARD GRID + PAGINATION --- */}
      {showJobCards && (
        <div className="section-wrapper">

          {jobs.length === 0 ? (
            <p>No jobs found.</p>
          ) : (
            <>
              {/* Job Cards Grid */}
              <div className="jobs-grid">
                {currentJobs.map((job, cardIdx) => (
                  <JobCard
                    key={job.job_id || `job-card-${cardIdx}`}
                    job={job}
                    role={role}
                    handleStatusChange={handleStatusChange}
                    openCandidatesModal={openCandidatesModal}
                    setNotesJobId={setNotesJobId}
                    setNotesVisible={setNotesVisible}
                    expandedSkills={expandedSkills}
                    setExpandedSkills={setExpandedSkills}
                    descriptionExpanded={expandedDescriptionJobId === job.job_id}
                    onToggleDescription={() => {
                      setExpandedDescriptionJobId((prev) =>
                        prev === job.job_id ? null : job.job_id,
                      );
                    }}
                    onAddJob={() => setShowJobForm(true)}
                  />
                ))}
              </div>

              {/* Pagination Controls */}
              {jobs.length > jobsPerPage && (
                <div
                  className="pagination-wrapper"
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginTop: "25px",
                    gap: "5px",
                    flexWrap: "wrap"
                  }}
                >
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                  >
                    &lt;
                  </button>

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

                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                  >
                    &gt;
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* --- Linked candidates table (below job cards): Recruiter/Admin only — clients see jobs + feedback only --- */}
      {(role === "Recruiter" || role === "Admin") && (
        <div className="section-wrapper" style={{ marginTop: "1.5rem" }}>
          <h4
            style={{
              marginBottom: "0.75rem",
              fontSize: "1.1rem",
              fontWeight: 600,
              color: "#1f3c88",
            }}
          >
            Linked candidates
          </h4>
          <div
            style={{
              overflowX: "auto",
            }}
          >
            <table
              className="linked-jobs-table"
              style={{
                width: "100%",
                minWidth: "600px",
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr>
                  <th>Candidate Name</th>
                  <th>Linked Jobs</th>
                  <th>CV</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredCandidates.length > 0 ? (
                  filteredCandidates.map((c, index) => (
                    <tr key={`${c.candidate_id}-${c.job_id}-${index}`}>
                      <td style={{ whiteSpace: "normal" }}>{c.candidate_name}</td>
                      <td style={{ whiteSpace: "normal" }}>{c.job_title}</td>
                      <td>
                        {c.resume_url_redacted ? (
                          <button
                            className="cv-button red"
                            onClick={() => handleDownloadCV(c)}
                            style={{ whiteSpace: "nowrap" }}
                          >
                            Download Redacted
                          </button>
                        ) : (
                          "Contact admin"
                        )}
                      </td>
                      <td>
                        {role !== "Client" ? (
                          <FaTimesCircle
                            style={{ cursor: "pointer", color: "red" }}
                            onClick={() =>
                              handleTableUnlink(c.job_id, c.candidate_id)
                            }
                          />
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="text-center text-muted"
                      style={{ padding: "1.25rem" }}
                    >
                      {role === "Recruiter" || role === "Admin"
                        ? "No candidates linked to your open jobs yet. Use ⋮ on a job card → Link Candidates."
                        : "No linked candidates."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Feedback: clients only see their own notes (API); recruiters/admins see assigned/all notes */}
      {role === "Client" ? (
        <div className="section-wrapper" style={{ marginTop: "1.25rem" }}>
          <h4
            style={{
              marginBottom: "0.5rem",
              fontSize: "1.1rem",
              fontWeight: 600,
              color: "#1f3c88",
            }}
          >
            Your feedback
          </h4>
          <NotesCard
            refreshKey={notesRefreshKey}
            showEmptyForClient
            prependNote={prependNote}
            onPrependConsumed={clearPrependNote}
          />
        </div>
      ) : (
        <NotesCard
          refreshKey={notesRefreshKey}
          prependNote={prependNote}
          onPrependConsumed={clearPrependNote}
        />
      )}
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
          <CButton
            color="primary"
            className="w-100"
            onClick={addNote}
            disabled={addingNote}
            style={{ opacity: addingNote ? 0.85 : 1 }}
          >
            {addingNote ? "Adding..." : "Add Feedback"}
          </CButton>
        </CModalBody>
      </CModal>

    </div>
  );
};

export default ActiveJobsScreen;


