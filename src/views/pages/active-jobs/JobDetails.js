import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  CButton,
  CSpinner,
  CAlert,
  CCard,
  CCardBody,
} from "@coreui/react";
import {
  getAllJobs,
  getAssignedJobs,
  getClientJobs,
  getJDSignedUrl,
} from "../../../api/api";
import { useAuth } from "../../../context/AuthContext";
import "./ActiveJobs.css";

const formatWorkType = (wt) => {
  if (wt == null || wt === "") return "—";
  const s = String(wt);
  if (s === "On_site") return "On-site";
  if (s === "Remote" || s === "Hybrid") return s;
  return s.replace(/_/g, "-");
};

const parseSkills = (raw) => {
  if (Array.isArray(raw)) {
    return raw.map((s) => String(s).trim()).filter(Boolean);
  }
  if (typeof raw === "string" && raw.trim()) {
    return raw.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return [];
};

const JobDetails = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { role: authRole, isAuthenticated, token } = useAuth();
  const role =
    authRole ||
    (() => {
      try {
        return JSON.parse(localStorage.getItem("user") || "{}")?.role;
      } catch {
        return "";
      }
    })();

  const backTo = location.state?.backTo || "/jobs";

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!jobId) {
      setError("Missing job id");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      let list = [];
      if (role === "Admin") list = await getAllJobs();
      else if (role === "Recruiter") list = await getAssignedJobs();
      else if (role === "Client") list = await getClientJobs();
      else list = [];

      const arr = Array.isArray(list) ? list : [];
      const found = arr.find((j) => String(j.job_id) === String(jobId));
      if (!found) {
        setError("Job not found or you do not have access.");
        setJob(null);
      } else {
        setJob({
          ...found,
          status: found.status === "Placement" ? "Placed" : found.status,
          description:
            found.description ?? found.job_description ?? "",
        });
      }
    } catch (e) {
      console.error(e);
      setError("Failed to load job.");
      setJob(null);
    } finally {
      setLoading(false);
    }
  }, [jobId, role]);

  useEffect(() => {
    if (role === "Client" || role === "Recruiter") {
      if (!isAuthenticated || !token) return;
    }
    load();
  }, [load, role, isAuthenticated, token]);

  const handleOpenJd = async () => {
    if (!job?.job_id) return;
    try {
      const res = await getJDSignedUrl(job.job_id);
      if (res?.signedUrl) window.open(res.signedUrl, "_blank", "noopener,noreferrer");
    } catch (e) {
      console.error(e);
      setError("Could not open job description file.");
    }
  };

  if (loading) {
    return (
      <div className="active-jobs-container job-details-page">
        <div className="d-flex justify-content-center align-items-center py-5">
          <CSpinner color="primary" />
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="active-jobs-container job-details-page">
        <CButton color="link" className="px-0 mb-3" onClick={() => navigate(backTo)}>
          ← Back
        </CButton>
        <CAlert color="danger">{error || "Job not found."}</CAlert>
      </div>
    );
  }

  const skills = parseSkills(job.skills);
  const normalizedStatus = job.status === "Placement" ? "Placed" : job.status;

  return (
    <div className="active-jobs-container job-details-page">
      <CButton
        color="link"
        className="px-0 mb-3 text-decoration-none"
        style={{ color: "#1f3c88", fontWeight: 500 }}
        onClick={() => navigate(backTo)}
      >
        ← Back to positions
      </CButton>

      <CCard className="border-0 shadow-sm">
        <CCardBody className="p-4 p-md-5">
          <header className="mb-4">
            <h1 className="h3 mb-2" style={{ color: "#1f3c88", fontWeight: 600 }}>
              {job.title || "Job"}
            </h1>
            {job.company ? (
              <p className="mb-1 text-muted" style={{ fontSize: "1.05rem" }}>
                {job.company}
              </p>
            ) : null}
            <p className="mb-0 small text-muted">
              {job.created_at
                ? `Posted ${new Date(job.created_at).toLocaleString()}`
                : null}
            </p>
          </header>

          <dl className="job-details-dl row g-3 mb-0">
            <div className="col-12 col-md-6">
              <dt className="small text-muted mb-1">Status</dt>
              <dd className="mb-0 fw-semibold">{normalizedStatus || "—"}</dd>
            </div>
            <div className="col-12 col-md-6">
              <dt className="small text-muted mb-1">Work type</dt>
              <dd className="mb-0">{formatWorkType(job.work_type)}</dd>
            </div>
            <div className="col-12 col-md-6">
              <dt className="small text-muted mb-1">Location</dt>
              <dd className="mb-0">{job.location?.trim() ? job.location : "—"}</dd>
            </div>
            <div className="col-12 col-md-6">
              <dt className="small text-muted mb-1">Employment type</dt>
              <dd className="mb-0">{job.employment_type || "—"}</dd>
            </div>
            <div className="col-12 col-md-6">
              <dt className="small text-muted mb-1">Department</dt>
              <dd className="mb-0">{job.department || "—"}</dd>
            </div>
            <div className="col-12 col-md-6">
              <dt className="small text-muted mb-1">Experience</dt>
              <dd className="mb-0">
                {job.experience
                  ? `${job.experience}${String(job.experience).match(/\d/) ? " years" : ""}`
                  : "—"}
              </dd>
            </div>
          </dl>

          {skills.length > 0 && (
            <section className="mt-4">
              <h2 className="h6 text-muted mb-2">Skills</h2>
              <div className="d-flex flex-wrap gap-2">
                {skills.map((s, i) => (
                  <span key={i} className="skill-tag">
                    {s}
                  </span>
                ))}
              </div>
            </section>
          )}

          <section className="mt-4">
            <h2 className="h6 text-muted mb-2">Full description</h2>
            <div
              className="job-details-description-body border rounded p-3 bg-light"
              style={{
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                lineHeight: 1.6,
                fontSize: "0.95rem",
              }}
            >
              {(job.description || "").trim() || (
                <span className="text-muted">No description provided.</span>
              )}
            </div>
          </section>

          {job.jd_url ? (
            <div className="mt-4">
              <CButton color="primary" variant="outline" size="sm" onClick={handleOpenJd}>
                Open JD file
              </CButton>
            </div>
          ) : null}
        </CCardBody>
      </CCard>
    </div>
  );
};

export default JobDetails;
