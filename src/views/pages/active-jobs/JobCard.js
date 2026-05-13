// JobCard.js
import React from "react";
import { useNavigate } from "react-router-dom";
import "./ActiveJobs.css";
import { cilOptions, cilDescription } from "@coreui/icons";
import CIcon from "@coreui/icons-react";
import {
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
} from "@coreui/react";

const SKILLS_PREVIEW = 3;

const JobCard = ({
  job,
  role,
  handleStatusChange,
  openCandidatesModal,
  setNotesJobId,
  setNotesVisible,
  onRequestDeleteJob,
  jobDetailsBackPath = "/jobs",
}) => {
  const navigate = useNavigate();
  const skillsArray = Array.isArray(job.skills)
    ? job.skills
    : job.skills?.split(",").map((s) => s.trim()) || [];

  const normalizedStatus = job.status === "Placement" ? "Placed" : job.status;

  const rawDescription = (job.description ?? job.job_description ?? "").trim();

  const openDetails = (e) => {
    e?.stopPropagation?.();
    navigate(`/jobs/${job.job_id}`, { state: { backTo: jobDetailsBackPath } });
  };

  const previewSkills = skillsArray.slice(0, SKILLS_PREVIEW);
  const extraSkillCount = Math.max(0, skillsArray.length - SKILLS_PREVIEW);
  const experienceLine =
    job.experience != null && String(job.experience).trim() !== ""
      ? `${job.experience}${
          job.experience.toString().match(/\d/) ? " years" : ""
        }`
      : null;

  return (
    <div className="job-card job-card--listing">
      <div className="job-header job-header--listing">
        <div className="job-header-text">
          <h3 className="job-title job-title--listing">{job.title}</h3>
          {job.company && <div className="job-company">{job.company}</div>}
          <div className="job-meta">
            {job.created_at
              ? `Posted on ${new Date(job.created_at).toLocaleDateString()}`
              : "Date not available"}
          </div>
        </div>

        <div className="job-header-actions">
          <button
            type="button"
            className="job-details-icon-btn"
            onClick={openDetails}
            aria-label="View full job details"
            title="Job details"
          >
            <CIcon
              icon={cilDescription}
              style={{ width: "1rem", height: "1rem" }}
            />
          </button>
          <div className="job-status-slot">
            <select
              className={`job-status ${normalizedStatus?.toLowerCase()} no-arrow`}
              value={normalizedStatus}
              onChange={(e) => handleStatusChange(job.job_id, e.target.value)}
              disabled={normalizedStatus === "Closed" || role === "Client"}
            >
              {["Open", "Paused", "Closed", "Placed"].map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          <CDropdown alignment="end" className="job-card-menu job-card-menu--listing">
            <CDropdownToggle
              color="light"
              size="sm"
              className="three-dots-menu-btn"
            >
              <CIcon
                icon={cilOptions}
                style={{ fontSize: "1.2rem", color: "#444343" }}
              />
            </CDropdownToggle>
            <CDropdownMenu>
              {role === "Recruiter" &&
                !["Closed", "Placed", "Paused"].includes(normalizedStatus) && (
                  <CDropdownItem onClick={() => openCandidatesModal(job.job_id)}>
                    Link Candidates
                  </CDropdownItem>
                )}
              <CDropdownItem
                onClick={() => {
                  setNotesJobId(job.job_id);
                  setNotesVisible(true);
                }}
              >
                Job Feedback
              </CDropdownItem>
              <CDropdownItem onClick={openDetails}>Full job details</CDropdownItem>
              {onRequestDeleteJob && (
                <CDropdownItem
                  className="text-danger"
                  onClick={() => onRequestDeleteJob(job)}
                >
                  Delete job
                </CDropdownItem>
              )}
            </CDropdownMenu>
          </CDropdown>
        </div>
      </div>

      <div className="job-description-section job-description-section--listing">
        <h4>Description</h4>
        {rawDescription ? (
          <>
            <div className="job-description-excerpt job-description-excerpt--listing">
              <p className="job-description-body job-description-body--listing">
                {rawDescription}
              </p>
            </div>
            <p className="job-description-hint job-description-hint--listing small text-muted mb-0">
              {rawDescription.length > 100 && (
                <span className="job-description-trunc-inline" aria-hidden="true">
                  ..{" "}
                </span>
              )}
              Open details for the full description.
            </p>
          </>
        ) : (
          <div className="job-description-excerpt job-description-excerpt--listing job-description-excerpt--empty">
            <p className="job-description-body job-description-body--listing text-muted mb-0 small">
              No description provided.
            </p>
          </div>
        )}
      </div>

      <div className="job-skills job-skills--listing">
        <h4>Experience Required:</h4>
        <div className="experience-text experience-text--listing">
          {experienceLine ?? <span className="text-muted">—</span>}
        </div>
      </div>

      <div className="job-skills job-skills--listing">
        <h4>Skills Required:</h4>
        <div className="skills-tags skills-tags--listing">
          {previewSkills.map((skill, idx) => (
            <span key={idx} className="skill-tag">
              {skill}
            </span>
          ))}
          {extraSkillCount > 0 && (
            <span className="skills-preview-ellipsis" aria-hidden="true">
              ..
            </span>
          )}
          {previewSkills.length === 0 && extraSkillCount === 0 && (
            <span className="text-muted skills-preview-empty">—</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobCard;
