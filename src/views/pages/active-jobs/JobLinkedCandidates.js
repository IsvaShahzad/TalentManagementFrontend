import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { CButton, CSpinner } from "@coreui/react";
import CIcon from "@coreui/icons-react";
import { cilTrash } from "@coreui/icons";
import {
  getAllJobsWithCandidates,
  unlinkCandidateFromJob,
} from "../../../api/api";
import { useAuth } from "../../../context/AuthContext";
import { useAppAlert } from "../../../context/AppAlertContext";
import { openCandidateResume } from "../../../components/candidateUtils";
import { actionButtonLoadingStyle, actionButtonText } from "../../../utils/actionButtonLabels";
import "./ActiveJobs.css";

const JobLinkedCandidates = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { role: authRole } = useAuth();
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
  const { showSuccess, showError } = useAppAlert();

  const [loading, setLoading] = useState(true);
  const [jobTitle, setJobTitle] = useState("");
  const [rows, setRows] = useState([]);
  const [unlinkPending, setUnlinkPending] = useState(null);
  const [unlinking, setUnlinking] = useState(false);
  const [search, setSearch] = useState("");

  const candidateHasCv = (c) => {
    const redacted = (c.resume_url_redacted || "").trim();
    const original = (c.resume_url || "").trim();
    return !!(redacted || original);
  };

  const load = useCallback(async () => {
    if (!jobId) return;
    setLoading(true);
    try {
      const res = await getAllJobsWithCandidates();
      const jobList = Array.isArray(res?.data) ? res.data : [];
      const target = jobList.find((j) => String(j.job_id) === String(jobId));

      setJobTitle(target?.title || "Position");

      const links = [];
      target?.JobCandidate?.forEach((link) => {
        const cand = link.Candidate;
        if (!cand) return;
        links.push({
          candidate_id: cand.candidate_id,
          candidate_name: cand.name,
          job_id: jobId,
          job_title: target.title,
          created_at: link.created_at,
          recruiter_name:
            link.recruiter_name ||
            link.User?.full_name ||
            link.Candidate?.candidateCreatedBy?.full_name ||
            "-",
          resume_url: cand.resume_url,
          resume_url_redacted: cand.resume_url_redacted,
        });
      });

      setRows(links);
    } catch (e) {
      console.error(e);
      showError("Failed to load linked candidates.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [jobId, showError]);

  useEffect(() => {
    const allowed =
      role === "Recruiter" ||
      role === "Admin" ||
      String(role || "").toLowerCase() === "recruiter";
    if (!allowed) {
      navigate(backTo, { replace: true });
      return;
    }
    load();
  }, [load, role, navigate, backTo]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (c) =>
        (c.candidate_name || "").toLowerCase().includes(q) ||
        (c.recruiter_name || "").toLowerCase().includes(q),
    );
  }, [rows, search]);

  const handleDownloadCV = async (candidate) => {
    try {
      const redacted = (candidate.resume_url_redacted || "").trim();
      const original = (candidate.resume_url || "").trim();
      const type = redacted ? "redacted" : original ? "original" : null;
      if (!type) {
        showError(
          role === "Admin" ? "CV not available." : "No CV available. Contact admin.",
        );
        return;
      }
      await openCandidateResume(candidate.candidate_id, type);
    } catch {
      showError("Failed to open resume.");
    }
  };

  const handleConfirmUnlink = async () => {
    if (!unlinkPending) return;
    setUnlinking(true);
    try {
      await unlinkCandidateFromJob(unlinkPending.jobId, unlinkPending.candidateId);
      showSuccess("Candidate unlinked.");
      setUnlinkPending(null);
      await load();
    } catch {
      showError("Failed to unlink candidate.");
    } finally {
      setUnlinking(false);
    }
  };

  return (
    <div className="active-jobs-container active-jobs-route">
      <button
        type="button"
        className="toggle-jobs-btn"
        onClick={() => navigate(backTo)}
      >
        Back to Active Positions
      </button>

      <h3 className="position-tracker-title" style={{ marginTop: "1rem" }}>
        Linked candidates - {jobTitle}
      </h3>

      <div className="section-wrapper linked-candidates-block">
        <input
          type="search"
          className="form-control form-control-sm mb-3"
          placeholder="Search by candidate name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: "320px" }}
        />

        {loading ? (
          <div className="d-flex align-items-center gap-2 text-muted">
            <CSpinner size="sm" />
            Loading...
          </div>
        ) : (
          <div className="linked-candidates-table-wrap" style={{ overflowX: "auto" }}>
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
                  <th>Linked On</th>
                  <th>Recruiter</th>
                  <th>CV</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center text-muted" style={{ padding: "1.25rem" }}>
                      No linked candidates for this position yet.
                    </td>
                  </tr>
                ) : (
                  filtered.map((c, index) => (
                    <tr key={`${c.candidate_id}-${index}`}>
                      <td>{c.candidate_name}</td>
                      <td>
                        {c.created_at
                          ? new Date(c.created_at).toLocaleString()
                          : "-"}
                      </td>
                      <td>{c.recruiter_name || "-"}</td>
                      <td>
                        {candidateHasCv(c) ? (
                          <button
                            type="button"
                            className={`cv-button ${
                              (c.resume_url_redacted || "").trim()
                                ? "red"
                                : "theme-blue"
                            }`}
                            onClick={() => handleDownloadCV(c)}
                          >
                            {(c.resume_url_redacted || "").trim()
                              ? "View redacted"
                              : "View CV"}
                          </button>
                        ) : (
                          <span className="text-muted">Contact admin</span>
                        )}
                      </td>
                      <td>
                        <CIcon
                          icon={cilTrash}
                          style={{
                            color: "#bc200fff",
                            cursor: "pointer",
                            fontSize: "1rem",
                          }}
                          onClick={() =>
                            setUnlinkPending({
                              jobId: c.job_id,
                              candidateId: c.candidate_id,
                              candidateName: c.candidate_name,
                            })
                          }
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {unlinkPending && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
          role="dialog"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Remove candidate</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setUnlinkPending(null)}
                />
              </div>
              <div className="modal-body">
                Remove <strong>{unlinkPending.candidateName}</strong> from this
                position?
              </div>
              <div className="modal-footer">
                <CButton color="secondary" onClick={() => setUnlinkPending(null)}>
                  Cancel
                </CButton>
                <CButton
                  color="danger"
                  disabled={unlinking}
                  style={actionButtonLoadingStyle(unlinking)}
                  onClick={handleConfirmUnlink}
                >
                  {actionButtonText("delete", unlinking, "Remove")}
                </CButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobLinkedCandidates;