import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
  getRecruiterCandidatesApi, // <-- add this
  deleteJob,
} from "../../../api/api";
import { useAuth } from "../../../context/AuthContext";
import { useAppAlert } from "../../../context/AppAlertContext";
import { cilBook, cilNotes, cilTrash } from '@coreui/icons'
import { FaLink, FaTimesCircle } from "react-icons/fa";
import "./ActiveJobs.css";
import "../position-tracker/jobFormFloating.css";
import { getCandidateSignedUrl, openFileInBrowser } from "../../../components/candidateUtils";
import { actionButtonText, actionButtonLoadingStyle } from "../../../utils/actionButtonLabels";
import { CButton, CModal, CModalHeader, CModalFooter, CModalBody, CFormTextarea } from "@coreui/react";
import CIcon from '@coreui/icons-react'
import JobNotes from "./JobNotes.js";
import NotesCard from "./NotesCard.js";
import JobCard from "./JobCard.js";


import DisplayJobsTable from '../position-tracker/DisplayJobs';


const ActiveJobsScreen = ({ userId, role, variant = "tracker" }) => {
  const navigate = useNavigate();
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
  const [feedback, setFeedback] = useState(""); // <-- ensures 'feedback' exists
  const { showAlert: showGlobalAlert, showSuccess, showError } = useAppAlert();
  const showAlert = (message, color = "success", duration = 1500) =>
    showGlobalAlert(message, color, duration);



  const [targetJobId, setTargetJobId] = useState(null);
  const [modalCandidates, setModalCandidates] = useState([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [candidatesModalVisible, setCandidatesModalVisible] = useState(false);

  // Linked candidates search & pagination
  const [linkedSearch, setLinkedSearch] = useState("");
  const [linkedPage, setLinkedPage] = useState(1);
  const linkedPerPage = 5;

  /** Job cards: show first N from full list (frontend slice); fetch still loads all jobs */
  const INITIAL_JOB_VISIBLE = 9;
  const JOB_LOAD_MORE_STEP = 6;
  const [visibleJobCount, setVisibleJobCount] = useState(INITIAL_JOB_VISIBLE);

  const JOB_STATUSES = ["Open", "Paused", "Closed", "Placed"];
  const [currentNotesJob, setCurrentNotesJob] = useState(null)
  const [notesVisible, setNotesVisible] = useState(false);
  const [notesJobId, setNotesJobId] = useState(null);
  const [notesRefreshKey, setNotesRefreshKey] = useState(0);
  /** Optimistically show new feedback before list refetch completes */
  const [prependNote, setPrependNote] = useState(null);
  const clearPrependNote = useCallback(() => setPrependNote(null), []);
  const [addingNote, setAddingNote] = useState(false);
  /** Confirm delete job from job card ⋮ menu */
  const [jobPendingDelete, setJobPendingDelete] = useState(null);
  const [deletingJobInProgress, setDeletingJobInProgress] = useState(false);

  /** Recruiter: candidates they uploaded — top table + job picker before linking */
  const [recruiterUploads, setRecruiterUploads] = useState([]);
  const [loadingRecruiterUploads, setLoadingRecruiterUploads] = useState(false);
  const [jobPickForCandidate, setJobPickForCandidate] = useState({});
  const [quickLinkingId, setQuickLinkingId] = useState(null);

  const [unlinkPending, setUnlinkPending] = useState(null);
  const [unlinkingInProgress, setUnlinkingInProgress] = useState(false);

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
      setVisibleJobCount(Math.min(INITIAL_JOB_VISIBLE, normalizedData.length));
    } catch (err) {
      console.error("Error fetching jobs:", err);
      showAlert("Failed to fetch jobs", "danger", 600);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestDeleteJob = (job) => {
    setJobPendingDelete(job);
  };

  const handleCancelDeleteJob = () => {
    setJobPendingDelete(null);
  };

  const handleConfirmDeleteJob = async () => {
    if (!jobPendingDelete?.job_id) return;
    const title = jobPendingDelete.title || "Job";
    const id = jobPendingDelete.job_id;
    setDeletingJobInProgress(true);
    try {
      await deleteJob(id);
      setJobs((prev) => {
        const next = prev.filter((j) => j.job_id !== id);
        setVisibleJobCount((v) => Math.min(v, next.length));
        return next;
      });
      setJobPendingDelete(null);
      showAlert(`Job "${title}" deleted`, "success", 600);
      await fetchCandidatesWithJobs();
    } catch (err) {
      console.error(err);
      showAlert("Failed to delete job", "danger", 600);
    } finally {
      setDeletingJobInProgress(false);
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
    };
    const handleJobDeleted = () => {
      fetchJobs();
    };
    window.addEventListener('jobAdded', handleJobAdded);
    window.addEventListener('jobDeleted', handleJobDeleted);
    return () => {
      window.removeEventListener('jobAdded', handleJobAdded);
      window.removeEventListener('jobDeleted', handleJobDeleted);
    };
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
            created_at: link.created_at,        
           // user_id: link.user_id, 
            recruiter_name: link.recruiter_name, 
            resume_url_redacted: cand.resume_url_redacted || null,
            resume_url: cand.resume_url || null,
          });
        });
      });
      setCandidatesWithJobs(rows);
    } catch (err) {
      console.error("Error fetching candidates:", err);
      setCandidatesWithJobs([]);
      showAlert("Failed to fetch linked candidates", "danger", 600);
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
        showAlert("Failed to link candidate", "danger", 600);
      }
    } finally {
      setQuickLinkingId(null);
    }
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
      showError("You must be signed in to add feedback.", 4000);
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
      showSuccess(`Feedback added for "${jobTitle}".`, 3500);
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
      showError(msg, 5000);
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
        showAlert("Failed to link candidate", "danger", 600);
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
      showAlert("Candidate unlinked successfully", "success", 600);
    } catch (err) {
      console.error(err);
      showAlert("Failed to unlink candidate", "danger", 600);
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
      showAlert("Failed to unlink candidate", "danger", 600);
    }
  };

  const candidateHasCv = (c) => {
    if (!c) return false;
    const redacted = (c.resume_url_redacted || "").trim();
    const original = (c.resume_url || "").trim();
    return !!(redacted || original);
  };

 

  // ---------- Download CV ----------
  const handleDownloadCV = async (candidate) => {
    try {
      const redacted = (candidate.resume_url_redacted || "").trim();
      const original = (candidate.resume_url || "").trim();
      const type = redacted ? "redacted" : original ? "original" : null;
      if (!type) {
        showAlert(
          role === "Admin"
            ? "CV not available."
            : "No CV available. Contact admin.",
          "warning",
          600,
        );
        return;
      }
      const signedUrl = await getCandidateSignedUrl(candidate.candidate_id, type);
      openFileInBrowser(signedUrl);
      showAlert("CV downloaded successfully", "success");
    } catch (err) {
      console.error(err);
      showAlert("Failed to download CV", "danger", 600);
    }
  };

  const sliceEnd = Math.min(visibleJobCount, jobs.length);
  const currentJobs = jobs.slice(0, sliceEnd);

  /** Active Positions preview: fixed first 5 only (full list on Job Descriptions). */
  const ACTIVE_POSITIONS_JOB_PREVIEW = 5;
  const activePositionsPreviewJobs = jobs.slice(0, ACTIVE_POSITIONS_JOB_PREVIEW);

  const handleShowMoreJobs = () => {
    setVisibleJobCount((c) => Math.min(c + JOB_LOAD_MORE_STEP, jobs.length));
  };
  if (!userId && role !== "Admin") return <p>Loading user info...</p>;
  if (loading)
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading jobs...</p>
      </div>
  );
  const handleCancelUnlink = () => {
    setUnlinkPending(null);
  };

  const handleConfirmUnlink = async () => {
    if (!unlinkPending) return;

    setUnlinkingInProgress(true);
    try {
      await handleTableUnlink(
        unlinkPending.jobId,
        unlinkPending.candidateId
      );

      setUnlinkPending(null);
    } catch (err) {
      console.error(err);
    } finally {
      setUnlinkingInProgress(false);
    }
  };

  const isDescriptions = variant === "descriptions";

  return (

    <div className="active-jobs-container">

      {!isDescriptions && (
        <h3 className="position-tracker-title">Active Positions</h3>
      )}

      {/* Recruiter: assigned jobs table (logged-in recruiter only; jobs from getAssignedJobs) */}
      {!isDescriptions && isRecruiter && (
        <div className="section-wrapper" style={{ marginTop: "0.5rem", marginBottom: "1.25rem" }}>
          <h4
            style={{
              marginBottom: "0.5rem",
              fontSize: "1.1rem",
              fontWeight: 600,
              color: "#1f3c88",
            }}
          >
            Your assigned jobs
          </h4>
          <DisplayJobsTable jobs={jobs} recruiterView />
        </div>
      )}

      {isDescriptions && (
        <>
          <h3 className="position-tracker-title">Job Descriptions</h3>
          <div className="section-wrapper" style={{ marginBottom: "1rem" }}>
            <div className="toggle-jobs-btn" onClick={() => navigate("/jobs")}>
              ← Active Positions
            </div>
          </div>
          <div className="section-wrapper job-cards-grid-shell">
            {jobs.length === 0 ? (
              <p>No jobs found.</p>
            ) : (
              <>
                <div className="jobs-grid jobs-grid--compact">
                  {currentJobs.map((job, cardIdx) => (
                    <JobCard
                      key={job.job_id || `job-card-${cardIdx}`}
                      job={job}
                      role={role}
                      handleStatusChange={handleStatusChange}
                      openCandidatesModal={openCandidatesModal}
                      setNotesJobId={setNotesJobId}
                      setNotesVisible={setNotesVisible}
                      jobDetailsBackPath="/job-descriptions"
                      onRequestDeleteJob={
                        role === "Client" ? undefined : handleRequestDeleteJob
                      }
                    />
                  ))}
                </div>
                {jobs.length > 0 && visibleJobCount < jobs.length && (
                  <div className="active-jobs-load-more-wrap">
                    <button
                      type="button"
                      className="active-jobs-show-more-dropdown tms-job-btn-secondary"
                      onClick={handleShowMoreJobs}
                    >
                      Show More Jobs
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
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
        </>
      )}

      {/* Recruiter: candidates they uploaded — pick assigned job, then Link (updates linked table below) */}
      {!isDescriptions && isRecruiter && (
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
                        No candidates uploaded by you yet. Add candidates from Candidate Database.
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




      {/* --- 3. TABULAR VIEW --- */}
      {/* Hide table for Recruiters and Clients; only Admin sees full jobs table */}
      {!isDescriptions && role !== "Recruiter" && role !== "Client" && (
        <div className="section-wrapper " style={{ marginTop: '20px' }}>
          <DisplayJobsTable jobs={jobs} />
        </div>
      )}

      {!isDescriptions && jobs.length > 0 && (
        <div className="section-wrapper job-cards-grid-shell" style={{ marginTop: "1rem" }}>
          <h4 className="active-positions-all-jobs-heading">All Jobs</h4>
          <div className="jobs-grid jobs-grid--compact">
            {activePositionsPreviewJobs.map((job, cardIdx) => (
              <JobCard
                key={job.job_id || `tracker-job-${cardIdx}`}
                job={job}
                role={role}
                handleStatusChange={handleStatusChange}
                openCandidatesModal={openCandidatesModal}
                setNotesJobId={setNotesJobId}
                setNotesVisible={setNotesVisible}
                jobDetailsBackPath="/jobs"
                onRequestDeleteJob={
                  role === "Client" ? undefined : handleRequestDeleteJob
                }
              />
            ))}
          </div>
          {jobs.length > ACTIVE_POSITIONS_JOB_PREVIEW && (
            <div className="active-jobs-load-more-wrap">
              <button
                type="button"
                className="active-jobs-show-more-dropdown tms-job-btn-secondary"
                onClick={() => navigate("/job-descriptions")}
              >
                Show More
              </button>
            </div>
          )}
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
      
      <CModal
        visible={!!unlinkPending}
        onClose={handleCancelUnlink}
        alignment="center"
      >
        <CModalHeader>
          <h4 className="modal-title mb-0">Remove Candidate</h4>
        </CModalHeader>

        <CModalBody>
          <p className="mb-0">
            Are you sure you want to remove{" "}
            <strong>{unlinkPending?.candidateName}</strong> from{" "}
            <strong>{unlinkPending?.jobTitle}</strong>?
          </p>
        </CModalBody>

        <CModalFooter className="d-flex gap-2 justify-content-end">
          <CButton
            color="secondary"
            variant="outline"
            onClick={handleCancelUnlink}
            disabled={unlinkingInProgress}
          >
            Cancel
          </CButton>

          <CButton
            color="danger"
            onClick={handleConfirmUnlink}
            disabled={unlinkingInProgress}
            style={actionButtonLoadingStyle(unlinkingInProgress)}
          >
            {actionButtonText("delete", unlinkingInProgress, "Remove")}
          </CButton>
        </CModalFooter>
      </CModal>

      {/* --- Linked candidates table (below job cards): Recruiter/Admin only — clients see jobs + feedback only --- */}
      {!isDescriptions && (role === "Recruiter" || role === "Admin") && (
        <div className="section-wrapper linked-candidates-block" style={{ marginTop: "1.5rem" }}>
          <h4
            className="linked-candidates-heading"
            style={{
              marginBottom: "0.35rem",
              fontSize: "1.1rem",
              fontWeight: 600,
              color: "#1f3c88",
            }}
          >
            Linked candidates
          </h4>
          <div
            className="linked-candidates-table-wrap"
            style={{
              overflowX: "auto",
              marginTop: "0.15rem",
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
                <th>Created On</th>
                <th>Recruiter</th>
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
                        {c.created_at
                          ? new Date(c.created_at).toLocaleString()
                          : "—"}
                      </td>

                      {/* <td>{c.user_id || "—"}</td> */}
                      <td>{c.recruiter_name || "—"}</td>
                      <td>
                        {candidateHasCv(c) ? (
                          (c.resume_url_redacted || "").trim() ? (
                            <button
                              className="cv-button red"
                              onClick={() => handleDownloadCV(c)}
                              style={{ whiteSpace: "nowrap" }}
                            >
                              Download Redacted
                            </button>
                          ) : (
                            <button
                              className="cv-button theme-blue"
                              onClick={() => handleDownloadCV(c)}
                              style={{ whiteSpace: "nowrap" }}
                            >
                              Download
                            </button>
                          )
                        ) : role === "Admin" ? (
                          <span style={{ color: "#6B7280" }}>CV not available</span>
                        ) : (
                          <span style={{ color: "#6B7280" }}>Contact admin</span>
                        )}
                      </td>
                      <td>
                        {role !== "Client" ? (
                         
                           <CIcon
                            icon={cilTrash}
                            style={{
                              color: "#bc200fff",
                              cursor: "pointer",
                              fontSize: "1rem",
                            }}
                            // onClick={() =>
                            //   handleTableUnlink(c.job_id, c.candidate_id)
                            //   //onDeleteHandle
                            // }
                            onClick={() =>
                              setUnlinkPending({
                                jobId: c.job_id,
                                candidateId: c.candidate_id,
                                candidateName: c.candidate_name,
                                jobTitle: c.job_title,
                              })
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
                        ? "No candidates linked to your open jobs yet. Open the job menu on a card → Link Candidates."
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
      {!isDescriptions &&
        (role === "Client" ? (
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
        ))}
      {/* --- 8. JOB NOTES MODAL --- */}
      <CModal
        visible={!!jobPendingDelete}
        onClose={handleCancelDeleteJob}
        alignment="center"
      >
        <CModalHeader>
          <h4 className="modal-title mb-0">Delete job</h4>
        </CModalHeader>
        <CModalBody>
          <p className="mb-0">
            Are you sure you want to delete{" "}
            <strong>{jobPendingDelete?.title || "this job"}</strong>? This cannot
            be undone.
          </p>
        </CModalBody>
        <CModalFooter className="d-flex gap-2 justify-content-end">
          <CButton
            color="secondary"
            variant="outline"
            onClick={handleCancelDeleteJob}
            disabled={deletingJobInProgress}
          >
            Cancel
          </CButton>
          <CButton
            color="danger"
            onClick={handleConfirmDeleteJob}
            disabled={deletingJobInProgress}
            style={actionButtonLoadingStyle(deletingJobInProgress)}
          >
            {actionButtonText("delete", deletingJobInProgress, "Delete job")}
          </CButton>
        </CModalFooter>
      </CModal>

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
            style={actionButtonLoadingStyle(addingNote)}
          >
            {actionButtonText("create", addingNote, "Add Feedback")}
          </CButton>
        </CModalBody>
      </CModal>

    </div>
  );
};

export default ActiveJobsScreen;


