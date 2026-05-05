import React, { useState, useEffect, useRef } from "react";
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
} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import { cilPencil, cilTrash, cilSearch } from "@coreui/icons";
import "../talent-pool/TableScrollbar.css";
import {
  getAllJobs,
  deleteJob,
  getJDSignedUrl,
  getRecruiters,
  getAllClients,
  assignClientToJob,
  updateJobAssignedRecruiters,
} from "../../../api/api";
import axios from "axios";
import JobForm from './JobForm'
import './jobFormFloating.css'

const DisplayJobsTable = ({ jobs: jobsProp }) => {
  /** When parent passes `jobs` (Active Jobs page), table stays in sync with cards; omit prop on Position Tracker to fetch via API. */
  const jobsPropRef = useRef(jobsProp);
  jobsPropRef.current = jobsProp;
 const [showForm, setShowForm] = useState(false)
  const [jobs, setJobs] = useState([]);
  const [filter, setFilter] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertColor, setAlertColor] = useState("success");
  const [editingJob, setEditingJob] = useState(null);
  const [deletingJob, setDeletingJob] = useState(null);
  const [recruiters, setRecruiters] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedRecruiter, setSelectedRecruiter] = useState(null);
  const [skillInput, setSkillInput] = useState("");
  const [editableJob, setEditableJob] = useState({ skills: [] });
const [expandedSkills, setExpandedSkills] = useState({});
const [expandedRecruiters, setExpandedRecruiters] = useState({});
  const handleAssignClient = async (jobId, clientId, candidateName) => {
    if (!clientId) return;

    try {
      // Assign client via API
      await assignClientToJob({ jobId, clientId });

      // Update jobs locally
      setJobs((prev) =>
        prev.map((j) =>
          j.job_id === jobId ? { ...j, assigned_client_id: clientId } : j,
        ),
      );

      // Get client and job names
      const client = clients.find((c) => c.user_id === clientId);
      const clientName = client?.full_name || "Client";
      const job = jobs.find((j) => j.job_id === jobId);
      const jobTitle = job?.title || "Job";
      const candidate = candidateName || "Candidate";

      // Show floating alert
      setAlertMessage(
        `job "${jobTitle}" linked/refered with client "${clientName}" successfully!`,
      );
      setAlertColor("success");
      setShowAlert(true);

      // Hide after 3s
      setTimeout(() => setShowAlert(false), 1500);
    } catch (err) {
      console.error("Assignment failed:", err);
      setAlertMessage("Failed to assign client");
      setAlertColor("danger");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 1500);
    }
  };
const toggleSkills = (jobId) => {
  setExpandedSkills((prev) => ({
    ...prev,
    [jobId]: !prev[jobId],
  }));
};

const toggleRecruiters = (jobId) => {
  setExpandedRecruiters((prev) => ({
    ...prev,
    [jobId]: !prev[jobId],
  }));
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
    setEditingJob(job);
    setEditableJob({
      job_id: job.job_id,
      title: job.title || "",
      company: job.company || "",
      skills: Array.isArray(job.skills)
        ? job.skills
        : job.skills?.split(",").map((s) => s.trim()) || [],
      experience: job.experience || "",
      description: job.job_description || job.description || "", // use job_description from normalizeJob
      jd_file: null, // file input starts empty
      jd_url: job.url || "", // existing JD link
      assigned_client_id: job.assigned_client_id || "",
      assigned_to: job.assigned_to || "",
    });
    setSkillInput("");
    setSelectedRecruiter(job.assigned_to || null);
  };

  const handleOpenJD = async (jobId) => {
    try {
      const res = await getJDSignedUrl(jobId);
      window.open(res.signedUrl, "_blank");
    } catch (err) {
      console.error("Failed to open JD:", err);
      setAlertMessage("Failed to open JD file");
      setAlertColor("danger");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 1500);
    }
  };

  const handleDeleteClick = (job) => {
    setDeletingJob(job);
  };

  const handleCancel = () => {
    setEditingJob(null);
    setDeletingJob(null);
    setEditableJob({ skills: [] });
    setSkillInput("");
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append("id", editableJob.job_id);
      formData.append("title", editableJob.title);
      formData.append("company", editableJob.company);
      formData.append("skills", editableJob.skills.join(","));
      formData.append("experience", editableJob.experience );
      formData.append("description", editableJob.description); // <-- add this
      if (editableJob.jd_file) formData.append("jd_file", editableJob.jd_file); // <-- add this

      const response = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/job/jobUpdate`,
        formData,
      );

      // Refresh jobs properly
      const updatedJobs = await getAllJobs();
      //    setJobs(updatedJobs.map((j) => ({
      //   ...j,
      //   skills: j.skills ? j.skills.split(',').map((s) => s.trim()) : [],
      //   description: j.job_description || j.description || '', // <-- fix here
      //   url: j.jd_url || '',
      //   date: j.created_at ? new Date(j.created_at).toISOString() : new Date().toISOString(),
      // })))
      setJobs(jobsFromApiResponse(updatedJobs));

      setAlertMessage(`Job "${editableJob.title}" updated successfully`);
      setAlertColor("success");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 1500);
      handleCancel();
    } catch (err) {
      console.error("Update failed:", err);
      setAlertMessage("Failed to update job.");
      setAlertColor("danger");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 1500);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteJob(deletingJob.job_id);

      setJobs((prevJobs) =>
        prevJobs.filter((j) => j.job_id !== deletingJob.job_id),
      );

      window.dispatchEvent(
        new CustomEvent("jobDeleted", {
          detail: { jobId: deletingJob.job_id },
        }),
      );

      handleCancel(); // close modal first

      setAlertMessage(`Job "${deletingJob.title}" deleted successfully`);
      setAlertColor("success");
      setShowAlert(true);

      setTimeout(() => setShowAlert(false), 1500);
    } catch (err) {
      console.error("Delete failed:", err);

      setAlertMessage("Failed to delete job.");
      setAlertColor("danger");
      setShowAlert(true);

      setTimeout(() => setShowAlert(false), 1500);
    }
  };

  const parseSkillsField = (raw) => {
    if (Array.isArray(raw)) {
      return raw.map((s) => String(s).trim()).filter(Boolean);
    }
    if (typeof raw === "string" && raw.trim()) {
      return raw.split(",").map((s) => s.trim()).filter(Boolean);
    }
    return [];
  };

  // Normalize jobs for consistent structure (used when mapping getAllJobs responses)
  const normalizeJob = (j) => {
    if (!j || j.job_id == null) return null;
    const fromList = (j.assignedRecruitersList || [])
      .filter((ar) => ar && ar.user_id)
      .map((ar) => ({
        user_id: ar.user_id,
        full_name: ar.User?.full_name || "",
      }));
    const seen = new Set(fromList.map((x) => x.user_id));
    if (j.assigned_to && !seen.has(j.assigned_to)) {
      fromList.push({ user_id: j.assigned_to, full_name: "" });
    }
    const created = j.created_at ? new Date(j.created_at) : null;
    const dateIso =
      created && !isNaN(created.getTime())
        ? created.toISOString()
        : new Date().toISOString();
    return {
      job_id: j.job_id,
      title: j.title != null ? String(j.title) : "",
      company: j.company != null ? String(j.company) : "",
      client_name: j.Client?.user?.full_name || null,
      assigned_client_id: j.Client?.user?.user_id || "",
      assigned_to: j.assigned_to || "",
      assigned_recruiters: fromList,
      experience: j.experience || "",
      skills: parseSkillsField(j.skills),
      date: dateIso,
      posted_by: j.postedByUser?.full_name || "System",
      url: j.jd_url,
      job_description: j.job_description || j.description || "",
    };
  };

  /** Handles both raw arrays and wrapped `{ jobs: [] }` shapes; drops bad rows. */
  const jobsFromApiResponse = (jobRes) => {
    const rawList = Array.isArray(jobRes)
      ? jobRes
      : Array.isArray(jobRes?.jobs)
        ? jobRes.jobs
        : [];
    return rawList.map(normalizeJob).filter(Boolean);
  };

  const recruiterDisplayName = (r) =>
    (r.full_name && String(r.full_name).trim()) ||
    recruiters.find((x) => x.recruiter_id === r.user_id)?.full_name ||
    "Recruiter";

  const persistAssignedRecruiters = async (jobId, userIds) => {
    return updateJobAssignedRecruiters(jobId, userIds);
  };

  /** Logs why assignees may not match after save (live vs local). Filter console: [PositionTracker recruiters] */
  const logRecruiterAssignDebug = (label, payload) => {
    console.info(`[PositionTracker recruiters] ${label}`, payload);
  };

  const handleAddRecruiter = async (jobId, recruiterId) => {
    if (!recruiterId) return;
    const job = jobs.find((j) => j.job_id === jobId);
    if (!job) return;
    const ids = job.assigned_recruiters.map((r) => r.user_id);
    if (ids.includes(recruiterId)) {
      setAlertMessage("That recruiter is already assigned to this job.");
      setAlertColor("warning");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 2000);
      return;
    }
    const nextIds = [...ids, recruiterId];
    const name =
      recruiters.find((r) => r.recruiter_id === recruiterId)?.full_name || "";

    setJobs((prev) =>
      prev.map((j) =>
        j.job_id === jobId
          ? {
              ...j,
              assigned_recruiters: [
                ...j.assigned_recruiters,
                { user_id: recruiterId, full_name: name },
              ],
              assigned_to: j.assigned_to || recruiterId,
            }
          : j,
      ),
    );

    try {
      const result = await persistAssignedRecruiters(jobId, nextIds);

      const refreshedJobs = await getAllJobs();
      const normalized = jobsFromApiResponse(refreshedJobs);
      setJobs(normalized);

      const reloaded = normalized.find((j) => j.job_id === jobId);
      const serverIds = (reloaded?.assigned_recruiters || []).map((r) =>
        String(r.user_id),
      );
      const sentIds = nextIds.map(String);
      const sameSet =
        sentIds.length === serverIds.length &&
        sentIds.every((id) => serverIds.includes(id));

      logRecruiterAssignDebug("add — after save + refetch", {
        jobId,
        sentIds,
        serverIds,
        listsMatch: sameSet,
        recruiterAssigneesSync: result?.recruiterAssigneesSync,
        explain:
          result?.recruiterAssigneesSync === false
            ? "FALSE: job_assigned_recruiters rows were NOT written (see Server logs: job_assigned_recruiters sync failed). Run prisma db push on production DB."
            : result?.recruiterAssigneesSync === true
              ? "TRUE: join table sync ran without error."
              : "UNDEFINED: API is an older deploy — it does not return recruiterAssigneesSync. Deploy latest Server; multi-assign may still fail if join table is missing.",
        ifMismatch:
          !sameSet && result?.recruiterAssigneesSync !== false
            ? "Server list differs from what we sent — usually missing job_assigned_recruiters rows or old API not writing assigned_recruiter_ids."
            : null,
      });

      if (result?.recruiterAssigneesSync === false) {
        setAlertMessage(
          "Multi-recruiter list did not save on the server (join table sync failed). Check Server logs. Run prisma db push on production DB. Console: [PositionTracker recruiters]",
        );
        setAlertColor("warning");
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 12000);
        return;
      }

      if (!sameSet) {
        const mismatchMsg =
          result?.recruiterAssigneesSync === undefined
            ? "Live API looks outdated: response has no recruiterAssigneesSync. Redeploy the latest backend (jobUpdate JSON + assigned_recruiter_ids). Until then only 1 assignee may persist. Then run prisma db push on production if needed. Console: [PositionTracker recruiters]"
            : "Server saved fewer assignees than you sent. Run prisma db push on production DB (job_assigned_recruiters) and check server logs. Console: [PositionTracker recruiters]";
        setAlertMessage(mismatchMsg);
        setAlertColor("warning");
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 14000);
        return;
      }

      const jobTitle = job.title || "Job";
      setAlertMessage(
        `Recruiter "${name || "Recruiter"}" added to "${jobTitle}".`,
      );
      setAlertColor("success");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 1500);
    } catch (err) {
      console.error("Failed to add recruiter:", err);
      const detail =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "";
      setAlertMessage(
        detail
          ? `Could not save assignees: ${detail}`
          : "Failed to update recruiter assignment. Is the API running on the URL in .env (e.g. http://localhost:7000/api)?",
      );
      setAlertColor("danger");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 4000);
      const refreshedJobs = await getAllJobs();
      setJobs(jobsFromApiResponse(refreshedJobs));
    }
  };

  const handleRemoveRecruiter = async (jobId, userId) => {
    const job = jobs.find((j) => j.job_id === jobId);
    if (!job) return;
    const nextIds = job.assigned_recruiters
      .map((r) => r.user_id)
      .filter((id) => id !== userId);

    setJobs((prev) =>
      prev.map((j) =>
        j.job_id === jobId
          ? {
              ...j,
              assigned_recruiters: j.assigned_recruiters.filter(
                (r) => r.user_id !== userId,
              ),
              assigned_to:
                nextIds.length === 0
                  ? ""
                  : j.assigned_to === userId
                    ? nextIds[0]
                    : j.assigned_to,
            }
          : j,
      ),
    );

    try {
      const result = await persistAssignedRecruiters(jobId, nextIds);

      const refreshedJobs = await getAllJobs();
      const normalized = jobsFromApiResponse(refreshedJobs);
      setJobs(normalized);

      const reloaded = normalized.find((j) => j.job_id === jobId);
      const serverIds = (reloaded?.assigned_recruiters || []).map((r) =>
        String(r.user_id),
      );
      const sentIds = nextIds.map(String);
      const sameSet =
        sentIds.length === serverIds.length &&
        sentIds.every((id) => serverIds.includes(id));

      logRecruiterAssignDebug("remove — after save + refetch", {
        jobId,
        sentIds,
        serverIds,
        listsMatch: sameSet,
        recruiterAssigneesSync: result?.recruiterAssigneesSync,
      });

      if (result?.recruiterAssigneesSync === false) {
        setAlertMessage(
          "Assignee list could not be fully updated (join table sync failed). Check Server logs. Console: [PositionTracker recruiters]",
        );
        setAlertColor("warning");
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 12000);
        return;
      }

      if (!sameSet) {
        setAlertMessage(
          result?.recruiterAssigneesSync === undefined
            ? "Live API may be outdated — redeploy latest backend. Console: [PositionTracker recruiters]"
            : "Server list does not match after remove — check DB / logs. Console: [PositionTracker recruiters]",
        );
        setAlertColor("warning");
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 12000);
      }
    } catch (err) {
      console.error("Failed to remove recruiter:", err);
      const detail =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "";
      setAlertMessage(
        detail
          ? `Could not save assignees: ${detail}`
          : "Failed to update recruiter assignment. Is the API running on the URL in .env (e.g. http://localhost:7000/api)?",
      );
      setAlertColor("danger");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 4000);
      const refreshedJobs = await getAllJobs();
      setJobs(jobsFromApiResponse(refreshedJobs));
    }
  };

  const fetchRecruitersAndClients = async () => {
    try {
      const recruiterRes = await getRecruiters();
      setRecruiters(Array.isArray(recruiterRes) ? recruiterRes : []);
      const clientRes = await getAllClients();
      setClients(clientRes.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchJobsFromApi = async () => {
    try {
      const jobRes = await getAllJobs();
      setJobs(jobsFromApiResponse(jobRes));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (jobsProp === undefined) {
      fetchJobsFromApi();
    }
    fetchRecruitersAndClients();

    const handleJobAdded = () => {
      if (jobsPropRef.current === undefined) {
        fetchJobsFromApi();
      }
    };
    window.addEventListener("jobAdded", handleJobAdded);
    return () => window.removeEventListener("jobAdded", handleJobAdded);
  }, []);

  useEffect(() => {
    if (jobsProp !== undefined) {
      setJobs(jobsFromApiResponse(jobsProp));
    }
  }, [jobsProp]);

  // Filtered jobs based on search (safe strings — null title/company used to break filter)
  const q = (filter || "").trim().toLowerCase();
  const filteredJobs = jobs.filter((j) => {
    const title = (j.title || "").toLowerCase();
    const company = (j.company || "").toLowerCase();
    const skillsStr = (j.skills || []).join(",").toLowerCase();
    return (
      title.includes(q) ||
      company.includes(q) ||
      skillsStr.includes(q)
    );
  });

  return (
    <CContainer
      style={{
        fontFamily: "Inter, sans-serif",
        marginTop: "2rem",
        fontSize: "0.75rem",
        maxWidth: "98vw",
        padding: "0 1rem",
      }}
    >
      {showAlert && (
        <div
          style={{
            position: "fixed",
            top: "1rem",
            right: "1rem",
            zIndex: 99999,
            minWidth: "250px",
            padding: "0.75rem 1rem",
            borderRadius: "0.5rem",
            backgroundColor: alertColor === "success" ? "#16a34a" : "#dc2626", // green/red
            color: "#fff",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            fontSize: "0.85rem",
            textAlign: "center",
            transition: "opacity 0.3s ease-in-out",
          }}
        >
          {alertMessage}
        </div>
      )}

      {/* Jobs Table */}
      <CCard
        style={{
          background: "#ffffff",
          padding: "2rem 1rem",
          border: "1px solid #d4d5d6ff",
          borderRadius: "0px",
          boxShadow: "none",
          marginTop: "1rem",
          width: "100%",
          maxWidth: "100%",
        }}
      >
        <CCardBody style={{ padding: "1rem" }}>
          {/* Search bar centered */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: "1.5rem",
            }}
          >
           
            <div style={{ position: "relative", width: "500px" }}>
             
             
             
             
              {/* <CFormInput
                placeholder="Search by title, company or skills"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.45rem 0.75rem 0.45rem 1.8rem",
                  fontSize: "0.85rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.25rem",
                  backgroundColor: "#fff",
                }}
              /> */}
              <CFormInput
                placeholder="Search Jobs by title, company or skills"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 14px 10px 40px", // 👈 bigger
                  fontSize: "0.95rem",           // 👈 bigger text
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  backgroundColor: "#fff",
                }}
              />
              <CIcon
                icon={cilSearch}
                style={{
                   position: "absolute",
                    left: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#6b7280",
                    fontSize: "1rem",
                }}
              />
            </div>


 {showForm && (
        <div className="job-form-overlay">
         <JobForm onClose={() => setShowForm(false)} />
          <button
            className="close-form-btn"
            onClick={() => setShowForm(false)}
          >
            &times;
          </button>
        </div>
      )}

              <button
              onClick={() => setShowForm(true)}
              style={{
                background: "#1f3c88",
                color: "#fff",
                border: "none",
                padding: "10px 18px",
                borderRadius: "6px",
                fontSize: "0.9rem",
                fontWeight: 500,
                cursor: "pointer",
                marginLeft: "10px"
              }}
            >
              + Post New Job
            </button>
          </div>

          {/* Table */}
          <div
            className="table-scroll"
            style={{
              overflowX: "auto",
              overflowY: "auto",
              maxHeight: "480px",
              width: "100%",
              WebkitOverflowScrolling: "touch",
            }}
          >
            <CTable
              className="align-middle app-data-table"
              style={{
                borderCollapse: "collapse",
                border: "1px solid #d1d5db",
                whiteSpace: "nowrap",
                tableLayout: "auto",
                minWidth: "1400px",
              }}
            >
              <CTableHead
                color="light"
                style={{ borderBottom: "2px solid #d1d5db" }}
              >
                <CTableRow>
                  <CTableHeaderCell
                    style={{
                      border: "0.5px solid #d1d5db",
                      padding: "0.5rem",
                      minWidth: "150px",
                    }}
                  >
                    Title
                  </CTableHeaderCell>
                  <CTableHeaderCell
                    style={{
                      border: "0.5px solid #d1d5db",
                      padding: "0.5rem",
                      minWidth: "120px",
                    }}
                  >
                    Company
                  </CTableHeaderCell>
                  <CTableHeaderCell
                    style={{
                      border: "0.5px solid #d1d5db",
                      padding: "0.5rem",
                      minWidth: "200px",
                    }}
                  >
                    Skills
                  </CTableHeaderCell>
                  <CTableHeaderCell
                    style={{
                      border: "0.5px solid #d1d5db",
                      padding: "0.5rem",
                      minWidth: "100px",
                    }}
                  >
                    Experience
                  </CTableHeaderCell>
                   <CTableHeaderCell
                    style={{
                      border: "0.5px solid #d1d5db",
                      padding: "0.5rem",
                      minWidth: "100px",
                    }}
                  >
                    JD File
                  </CTableHeaderCell>
                  <CTableHeaderCell
                    style={{
                      border: "0.5px solid #d1d5db",
                      padding: "0.5rem",
                      minWidth: "240px",
                    }}
                  >
                    Assign To
                  </CTableHeaderCell>
                  <CTableHeaderCell
                    style={{
                      border: "0.5px solid #d1d5db",
                      padding: "0.5rem",
                      minWidth: "150px",
                    }}
                  >
                    Client
                  </CTableHeaderCell>
                  <CTableHeaderCell
                    style={{
                      border: "0.5px solid #d1d5db",
                      padding: "0.5rem",
                      minWidth: "130px",
                    }}
                  >
                    Created On
                  </CTableHeaderCell>
                  <CTableHeaderCell
                    style={{
                      border: "0.5px solid #d1d5db",
                      padding: "0.5rem",
                      minWidth: "120px",
                    }}
                  >
                    Added By
                  </CTableHeaderCell>
                 
                  <CTableHeaderCell
                    style={{
                      border: "0.5px solid #d1d5db",
                      padding: "0.5rem",
                      minWidth: "100px",
                    }}
                  >
                    Actions
                  </CTableHeaderCell>
                </CTableRow>
              </CTableHead>

              <CTableBody>
                {filteredJobs.length === 0 ? (
                  <CTableRow>
                    <CTableDataCell
                      colSpan={10}
                      className="text-center text-muted"
                      style={{
                        border: "1px solid #d1d5db",
                        padding: "0.75rem",
                        fontSize: "0.75rem",
                      }}
                    >
                      No jobs found.
                    </CTableDataCell>
                  </CTableRow>
                ) : (
                  filteredJobs.map((j, idx) => {
                    const dateObj = new Date(j.date);
                    const date = dateObj.toLocaleDateString();
                    const time = dateObj.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    return (
                      <CTableRow
                        key={idx}
                        style={{ backgroundColor: "#fff", fontSize: "0.85rem" }}
                      >
                        <CTableDataCell
                          style={{
                            border: "0.5px solid #d1d5db",
                            padding: "0.5rem",
                          }}
                        >
                          {j.title}
                        </CTableDataCell>
                        <CTableDataCell
                          style={{
                            border: "0.5px solid #d1d5db",
                            padding: "0.5rem",
                          }}
                        >
                          {j.company}
                        </CTableDataCell>
                        {/* <CTableDataCell
                          style={{
                            border: "0.5px solid #d1d5db",
                            padding: "0.5rem",
                            minWidth: "200px",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: "6px",
                              alignItems: "center",
                            }}
                          >
                            {j.skills.map((skill, id) => (
                              <span
                                key={id}
                                style={{
                                  background: "#eef2ff",
                                  color: "#1e40af",
                                  padding: "3px 8px",
                                  borderRadius: "999px",
                                  fontSize: "11px",
                                  fontWeight: 500,
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </CTableDataCell> */}


                        <CTableDataCell
                          style={{
                            border: "0.5px solid #d1d5db",
                            padding: "0.5rem",
                            minWidth: "200px",
                          }}
                        >
                          {(() => {
                            const isExpanded = expandedSkills[j.job_id];
                            const limit = 5;

                            const visibleSkills = isExpanded
                              ? j.skills
                              : j.skills.slice(0, limit);

                            const remaining = j.skills.length - limit;

                            return (
                              <div
                                style={{
                                  display: "flex",
                                  flexWrap: "wrap",
                                  gap: "6px",
                                  alignItems: "center",
                                }}
                              >
                                {visibleSkills.map((skill, id) => (
                                  <span
                                    key={id}
                                    style={{
                                      background: "#eef2ff",
                                      color: "#1e40af",
                                      padding: "3px 8px",
                                      borderRadius: "999px",
                                      fontSize: "11px",
                                      fontWeight: 500,
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {skill}
                                  </span>
                                ))}

                                {/* +X button */}
                                {!isExpanded && remaining > 0 && (
                                  <span
                                    onClick={() => toggleSkills(j.job_id)}
                                    style={{
                                      background: "#e5e7eb",
                                      color: "#374151",
                                      padding: "3px 8px",
                                      borderRadius: "999px",
                                      fontSize: "11px",
                                      fontWeight: 600,
                                      cursor: "pointer",
                                    }}
                                  >
                                    +{remaining}
                                  </span>
                                )}

                                {/* << button */}
                                {isExpanded && j.skills.length > limit && (
                                  <span
                                    onClick={() => toggleSkills(j.job_id)}
                                    style={{
                                      background: "#e5e7eb",
                                      color: "#374151",
                                      padding: "3px 8px",
                                      borderRadius: "999px",
                                      fontSize: "11px",
                                      fontWeight: 600,
                                      cursor: "pointer",
                                    }}
                                  >
                                    &laquo;
                                  </span>
                                )}
                              </div>
                            );
                          })()}
                        </CTableDataCell>

                        <CTableDataCell
                          style={{
                            border: "0.5px solid #d1d5db",
                            padding: "0.5rem",
                          }}
                        >
                          {j.experience}
                        </CTableDataCell>
                          <CTableDataCell
                                                  style={{
                                                    border: "0.5px solid #d1d5db",
                                                    padding: "0.5rem",
                                                  }}
                                                >
                                                  {j.url ? (
                                                    <span
                                                      onClick={() => handleOpenJD(j.job_id)}
                                                      style={{
                                                        color: "#1E3A8A",
                                                        fontWeight: 500,
                                                        textDecoration: "underline",
                                                        cursor: "pointer",
                                                      }}
                                                    >
                                                      View File
                                                    </span>
                                                  ) : (
                                                    <span style={{ color: "#6B7280" }}>No JD</span>
                                                  )}
                                                </CTableDataCell>

                                              <CTableDataCell
                          style={{
                            border: "0.5px solid #d1d5db",
                            padding: "0.5rem",
                            verticalAlign: "top",
                            minWidth: "240px",
                            maxWidth: "280px",
                            whiteSpace: "normal",
                          }}
                        >
                          {(() => {
                            const isExpanded = expandedRecruiters[j.job_id];
                            const limit = 2;

                            const visibleRecruiters = isExpanded
                              ? j.assigned_recruiters
                              : j.assigned_recruiters.slice(0, limit);

                            const remaining = j.assigned_recruiters.length - limit;

                            return (
                              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                
                                {/* Recruiter Pills */}
                                <div
                                  style={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: "6px",
                                    alignItems: "center",
                                  }}
                                >
                                  {visibleRecruiters.length === 0 ? (
                                    <span style={{ color: "#9ca3af", fontSize: "0.75rem" }}>
                                      No recruiters yet
                                    </span>
                                  ) : (
                                    visibleRecruiters.map((r) => (
                                      <span
                                        key={r.user_id}
                                        style={{
                                          display: "inline-flex",
                                          alignItems: "center",
                                          gap: "4px",
                                          background: "#eef2ff",
                                          color: "#1e40af",
                                          padding: "3px 8px",
                                          borderRadius: "999px",
                                          fontSize: "11px",
                                          fontWeight: 500,
                                          maxWidth: "120px",
                                        }}
                                      >
                                        <span
                                          style={{
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                          }}
                                        >
                                          {recruiterDisplayName(r)}
                                        </span>

                                        {/* remove button */}
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleRemoveRecruiter(j.job_id, r.user_id)
                                          }
                                          style={{
                                            border: "none",
                                            background: "transparent",
                                            color: "#64748b",
                                            cursor: "pointer",
                                            fontSize: "12px",
                                            fontWeight: 700,
                                            lineHeight: 1,
                                          }}
                                        >
                                          ×
                                        </button>
                                      </span>
                                    ))
                                  )}

                                  {/* +X button */}
                                  {!isExpanded && remaining > 0 && (
                                    <span
                                      onClick={() => toggleRecruiters(j.job_id)}
                                      style={{
                                        background: "#e5e7eb",
                                        color: "#374151",
                                        padding: "3px 8px",
                                        borderRadius: "999px",
                                        fontSize: "11px",
                                        fontWeight: 600,
                                        cursor: "pointer",
                                      }}
                                    >
                                      +{remaining}
                                    </span>
                                  )}

                                  {/* << collapse */}
                                  {isExpanded && j.assigned_recruiters.length > limit && (
                                    <span
                                      onClick={() => toggleRecruiters(j.job_id)}
                                      style={{
                                        background: "#e5e7eb",
                                        color: "#374151",
                                        padding: "3px 8px",
                                        borderRadius: "999px",
                                        fontSize: "11px",
                                        fontWeight: 600,
                                        cursor: "pointer",
                                      }}
                                    >
                                      &laquo;
                                    </span>
                                  )}
                                </div>

                                {/* Dropdown */}
                                <select
                                  key={`${j.job_id}-${j.assigned_recruiters.length}`}
                                  defaultValue=""
                                  onChange={(e) => {
                                    const v = e.target.value;
                                    if (v) handleAddRecruiter(j.job_id, v);
                                  }}
                                  style={{
                                    padding: "3px",
                                    fontSize: "0.75rem", // ✅ smaller text
                                    borderRadius: "4px",
                                    border: "0.5px solid #d1d5db",
                                    backgroundColor: "#fff",
                                    width: "100%",
                                    maxWidth: "220px",
                                  }}
                                >
                                  <option value="">Add recruiter</option>
                                  {recruiters.map((r) => (
                                    <option key={r.recruiter_id} value={r.recruiter_id}>
                                      {r.full_name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            );
                          })()}
                        </CTableDataCell>

                        <CTableDataCell
                          style={{
                            border: "0.5px solid #d1d5db",
                            padding: "0.5rem",
                          }}
                        >
                          <select
                            value={j.assigned_client_id ?? ""}
                            onChange={(e) =>
                              handleAssignClient(j.job_id, e.target.value)
                            }
                            style={{
                              padding: "4px",
                              fontSize: "0.7rem",
                              borderRadius: "4px",
                              border: "0.5px solid #d1d5db",
                              backgroundColor: "#fff",
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

                        <CTableDataCell
                          style={{
                            border: "0.5px solid #d1d5db",
                            padding: "0.5rem",
                          }}
                        >
                          {date} {time}
                        </CTableDataCell>
                        <CTableDataCell
                          style={{
                            border: "0.5px solid #d1d5db",
                            padding: "0.5rem",
                          }}
                        >
                          {j.posted_by}
                        </CTableDataCell>
                      

                        <CTableDataCell
                          style={{
                            border: "0.5px solid #d1d5db",
                            padding: "0.5rem",
                          }}
                        >
                          <CIcon
                            icon={cilPencil}
                            style={{
                              color: "#185883ff",
                              cursor: "pointer",
                              fontSize: "1rem",
                              marginRight: "0.5rem",
                            }}
                            onClick={() => handleEditClick(j)}
                          />
                          <CIcon
                            icon={cilTrash}
                            style={{
                              color: "#bc200fff",
                              cursor: "pointer",
                              fontSize: "1rem",
                            }}
                            onClick={() => handleDeleteClick(j)}
                          />
                        </CTableDataCell>
                      </CTableRow>
                    );
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
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          {editingJob && (
            <CCard
              className="p-4 position-relative"
              style={{
                width: "90%",
                maxWidth: "500px",
                borderRadius: "0.25rem",
                display: "flex",
                flexDirection: "column",
                margin: "1rem",
                fontSize: "0.85rem",
              }}
            >
              <button
                onClick={handleCancel}
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  background: "transparent",
                  border: "none",
                  fontSize: "1.2rem",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                &times;
              </button>

              <h4
                style={{
                  fontWeight: 600,
                  fontSize: "1.2rem",
                  marginBottom: "0.5rem",
                  textAlign: "center",
                }}
              >
                Update Job
              </h4>

              <CFormInput
                className="mb-2"
                label="Title"
                value={editableJob.title}
                onChange={(e) =>
                  setEditableJob({ ...editableJob, title: e.target.value })
                }
                size="sm"
              />
              <CFormInput
                className="mb-2"
                label="Company"
                value={editableJob.company}
                onChange={(e) =>
                  setEditableJob({ ...editableJob, company: e.target.value })
                }
                size="sm"
              />

              {/* Skills Tags Input */}
              <label
                style={{
                  fontSize: "0.85rem",
                  marginBottom: "4px",
                  display: "block",
                }}
              >
                Skills
              </label>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "6px",
                  padding: "8px",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                  minHeight: "40px",
                  alignItems: "center",
                  marginBottom: "0.5rem",
                }}
              >
                {editableJob.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    style={{
                      background: "#eef2ff",
                      color: "#1e40af",
                      padding: "4px 8px",
                      borderRadius: "999px",
                      fontSize: "12px",
                      fontWeight: 500,
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
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
                        cursor: "pointer",
                        fontWeight: "bold",
                        fontSize: "14px",
                        marginLeft: "2px",
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
                    if ((e.key === "Enter" || e.key === " ") && trimmed) {
                      e.preventDefault();
                      if (!editableJob.skills.includes(trimmed)) {
                        setEditableJob({
                          ...editableJob,
                          skills: [...editableJob.skills, trimmed],
                        });
                      }
                      setSkillInput("");
                    }

                    // Backspace removes last skill if input empty
                    if (
                      e.key === "Backspace" &&
                      !trimmed &&
                      editableJob.skills.length
                    ) {
                      e.preventDefault();
                      setEditableJob({
                        ...editableJob,
                        skills: editableJob.skills.slice(0, -1),
                      });
                    }
                  }}
                  placeholder="Type skill + Enter"
                  style={{
                    border: "none",
                    outline: "none",
                    flex: 1,
                    minWidth: "100px",
                    fontSize: "0.85rem",
                    padding: "4px 2px",
                  }}
                />
              </div>

              <CFormInput
                
                className="mb-2"
                label="Experience"
                value={editableJob.experience}
                // onChange={(e) => {
                //   const value = e.target.value;
                //   if (/^\d*$/.test(value))
                //     setEditableJob({ ...editableJob, experience: value });
                // }}
                onChange={(e) =>
                  setEditableJob({
                    ...editableJob,
                    experience: e.target.value,
                  })
                }
                required
                size="sm"
              />
              <CFormInput
                className="mb-2"
               style={{

      minHeight: '60px',

    }}
                label="Job Description"
                value={editableJob.description || ""}
                onChange={(e) =>
                  setEditableJob({
                    ...editableJob,
                    description: e.target.value,
                  })
                }
                component="textarea"
                rows={4}
              />

              <CFormInput
                type="file"
                className="mb-2"
                label={
                  editableJob.jd_url
                    ? "Upload New JD (will replace existing)"
                    : "Upload JD"
                }
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
                width: "90%",
                maxWidth: "450px",
                borderRadius: "0.25rem",
              }}
            >
              <h5>Confirm Delete</h5>
              <p>
                Are you sure you want to delete{" "}
                <strong>{deletingJob.title}</strong>?
              </p>

              <div className="d-flex justify-content-center gap-3 mt-3">
                <CButton color="secondary" onClick={handleCancel}>
                  Cancel
                </CButton>
                <CButton
                  style={{ backgroundColor: "#d62828", color: "#fff" }}
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
  );
};

export default DisplayJobsTable;
