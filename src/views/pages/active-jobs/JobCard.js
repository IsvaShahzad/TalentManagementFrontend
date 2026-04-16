// JobCard.js
import React, { useLayoutEffect, useRef, useState } from "react";
import './ActiveJobs.css'; // reuse Active Jobs styling
import { cilOptions } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import { CDropdown, CDropdownToggle, CDropdownMenu, CDropdownItem } from "@coreui/react";
const JobCard = ({
  job,
  role,
  handleStatusChange,
  openCandidatesModal,
  setNotesJobId,
  setNotesVisible,
  expandedSkills,
  setExpandedSkills,
  descriptionExpanded = false,
  onToggleDescription,
  onAddJob,
  onRequestDeleteJob,
}) => {
  const skillsArray = Array.isArray(job.skills)
    ? job.skills
    : job.skills?.split(",").map(s => s.trim()) || [];

  const skillsExpandKey =
    job.job_id != null && job.job_id !== "" ? String(job.job_id) : null;
  const isExpanded = skillsExpandKey
    ? expandedSkills[skillsExpandKey]
    : false;
  const visibleSkills = isExpanded ? skillsArray : skillsArray.slice(0, 5);

  // Normalize status: "Placement" -> "Placed" for display
  const normalizedStatus = job.status === "Placement" ? "Placed" : job.status;

  const rawDescription = (job.description ?? job.job_description ?? "").trim();

  const bodyRef = useRef(null);
  const [descriptionOverflows, setDescriptionOverflows] = useState(false);

  useLayoutEffect(() => {
    const el = bodyRef.current;
    if (!el || !rawDescription) {
      setDescriptionOverflows(false);
      return;
    }
    if (descriptionExpanded) {
      return;
    }
    el.classList.remove("is-expanded");
    el.classList.add("is-clamped");
    void el.offsetHeight;
    setDescriptionOverflows(el.scrollHeight > el.clientHeight + 2);
  }, [rawDescription, job.job_id, descriptionExpanded]);

  return (
    <div className="job-card">
      {/* ================= Job Header ================= */}
      <div className="job-header">
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 className="job-title">{job.title}</h3>
          {job.company && <div className="job-company">{job.company}</div>}
          <div className="job-meta">
            {job.created_at
              ? `Posted on ${new Date(job.created_at).toLocaleDateString()}`
              : "Date not available"}
          </div>
        </div>

        <div className="job-status-wrapper">
          {/* Status Dropdown */}
          <select
            className={`job-status ${normalizedStatus?.toLowerCase()} no-arrow`}
            value={normalizedStatus}
            onChange={(e) => handleStatusChange(job.job_id, e.target.value)}
            disabled={normalizedStatus === "Closed" || role === "Client"}
          >
            {["Open", "Paused", "Closed", "Placed"].map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>


        </div>

        {/* Three Dots Menu */}
        <CDropdown alignment="end" className="job-card-menu">
          <CDropdownToggle
            color="light"
            size="sm"
            className="three-dots-menu-btn"

          >
            <CIcon icon={cilOptions} style={{ fontSize: '1.2rem', color: '#444343' }} />
          </CDropdownToggle>
          <CDropdownMenu>
            {/*  {role === "Admin" &&

             (
                <CDropdownItem
                  onClick={() => onAddJob && onAddJob()}
                >
                  Add Job
                </CDropdownItem>
              )
              }*/}
            {role === "Recruiter" &&
              !["Closed", "Placed", "Paused"].includes(normalizedStatus) && (
                <CDropdownItem
                  onClick={() => openCandidatesModal(job.job_id)}
                >
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

      {/* ================= Job Description ================= */}
      <div className="job-description-section">
        <h4>Description</h4>
        {rawDescription ? (
          <>
            <p
              ref={bodyRef}
              className={`job-description-body ${descriptionExpanded ? "is-expanded" : "is-clamped"}`}
            >
              {rawDescription}
            </p>
            {descriptionOverflows && (
              <button
                type="button"
                className="job-description-see-more"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleDescription?.();
                }}
              >
                {descriptionExpanded ? "See less" : "See more"}
              </button>
            )}
          </>
        ) : (
          <p className="job-description-body text-muted" style={{ margin: 0 }}>
            No description provided.
          </p>
        )}
      </div>

      {/* ================= Experience ================= */}
      {job.experience && (
        <div className="job-skills">
          <h4>Experience Required:</h4>
          <div className="experience-text">
            {job.experience} {job.experience.toString().match(/\d/) ? "years" : ""}
          </div>
        </div>
      )}

      {/* ================= Skills ================= */}
      {skillsArray.length > 0 && (
        <div className="job-skills">
          <h4>Skills Required:</h4>
          <div className="skills-tags">
            {visibleSkills.map((skill, idx) => (
              <span key={idx} className="skill-tag">{skill}</span>
            ))}
            {skillsArray.length > 5 && skillsExpandKey && (
              <span
                className="skill-more"
                onClick={(e) => {
                  e.stopPropagation();
                  setExpandedSkills((prev) => ({
                    ...prev,
                    [skillsExpandKey]: !isExpanded,
                  }));
                }}
              >
                {isExpanded ? "Show less" : `+${skillsArray.length - 5} more`}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default JobCard;
