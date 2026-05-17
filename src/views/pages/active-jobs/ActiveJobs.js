import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllCandidates,
  getLinkedCandidates,
  linkCandidateToJob,
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
import { TOAST_DEFAULT_DURATION_MS } from "../../../constants/notificationTiming";
import { cilBook, cilNotes } from '@coreui/icons'
import { FaLink, FaTimesCircle } from "react-icons/fa";
import "./ActiveJobs.css";
import "../position-tracker/jobFormFloating.css";
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
  const showAlert = (message, color = "success", duration = TOAST_DEFAULT_DURATION_MS) =>
    showGlobalAlert(message, color, duration);



  const [targetJobId, setTargetJobId] = useState(null);
  const [modalCandidates, setModalCandidates] = useState([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [candidatesModalVisible, setCandidatesModalVisible] = useState(false);

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
  /** Confirm delete job from job card menu */
  const [jobPendingDelete, setJobPendingDelete] = useState(null);
  const [deletingJobInProgress, setDeletingJobInProgress] = useState(false);


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
      showAlert("Failed to fetch jobs", "danger");
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
      showAlert(`Job "${title}" deleted`, "success");
      await fetchCandidatesWithJobs();
    } catch (err) {
      console.error(err);
      showAlert("Failed to delete job", "danger");
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
      const jobList = Array.isArray(res?.data) ? res.data : [];
      if (jobList.length === 0) {
        setCandidatesWithJobs([]);
        return;
      }

      const rows = [];
      jobList.forEach((job) => {
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
            recruiter_name:
              link.recruiter_name ||
              link.User?.full_name ||
              link.Candidate?.candidateCreatedBy?.full_name ||
              "-",
            resume_url_redacted: cand.resume_url_redacted || null,
            resume_url: cand.resume_url || null,
          });
        });
      });
      setCandidatesWithJobs(rows);
    } catch (err) {
      console.error("Error fetching linked candidates:", err);
      setCandidatesWithJobs([]);
      const status = err?.response?.status;
      if (status !== 401 && status !== 403) {
        showAlert("Failed to fetch linked candidates", "danger");
      }
    }
  };

  useEffect(() => {
    if (role !== "Recruiter" && role !== "Admin") return;
    if (!isAuthenticated || !token) return;
    fetchCandidatesWithJobs();
  }, [role, isAuthenticated, token, jobs]);

  const linkedCountByJobId = useMemo(() => {
    const map = {};
    (candidatesWithJobs || []).forEach((row) => {
      const id = String(row.job_id);
      map[id] = (map[id] || 0) + 1;
    });
    return map;
  }, [candidatesWithJobs]);

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
        showAlert(
          err?.response?.data?.message || "Failed to link candidate",
          "danger",
        );
      }
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

  const isDescriptions = variant === "descriptions";

  return (

    <div className="active-jobs-container active-jobs-route">

      {!isDescriptions && (
        <h3 className="position-tracker-title">Active Positions</h3>
      )}

      {/* Recruiter: assigned jobs table (logged-in recruiter only; jobs from getAssignedJobs) */}
      {!isDescriptions && isRecruiter && (
        <div className="section-wrapper" style={{ marginTop: "20px" }}>
          <DisplayJobsTable
            jobs={jobs}
            recruiterView
            linkedCountByJobId={linkedCountByJobId}
            onViewLinkedCandidates={(jobId) =>
              navigate(`/jobs/${jobId}/linked-candidates`, {
                state: { backTo: "/jobs" },
              })
            }
            onLinkCandidates={openCandidatesModal}
          />
        </div>
      )}

      {isDescriptions && (
        <>
          <h3 className="position-tracker-title">Job Descriptions</h3>
          <div className="section-wrapper" style={{ marginBottom: "1rem" }}>
            <div className="toggle-jobs-btn" onClick={() => navigate("/jobs")}>
              Back to Active Positions
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




      {/* --- 3. TABULAR VIEW --- */}
      {/* Hide table for Recruiters and Clients; only Admin sees full jobs table */}
      {!isDescriptions && role !== "Recruiter" && role !== "Client" && (
        <div className="section-wrapper " style={{ marginTop: '20px' }}>
          <DisplayJobsTable
            jobs={jobs}
            onJobPatch={(jobId, patch) => {
              setJobs((prev) =>
                prev.map((j) =>
                  j.job_id === jobId ? { ...j, ...patch } : j,
                ),
              );
            }}
            linkedCountByJobId={linkedCountByJobId}
            onViewLinkedCandidates={(jobId) =>
              navigate(`/jobs/${jobId}/linked-candidates`, {
                state: { backTo: "/jobs" },
              })
            }
          />
        </div>
      )}

      {!isDescriptions && jobs.length > 0 && !isRecruiter && (
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


