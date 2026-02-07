// JobCard.js
import React from "react";
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
  onAddJob
}) => {
  const skillsArray = Array.isArray(job.skills)
    ? job.skills
    : job.skills?.split(",").map(s => s.trim()) || [];

  const isExpanded = expandedSkills[job.job_id];
  const visibleSkills = isExpanded ? skillsArray : skillsArray.slice(0, 5);

  // Normalize status: "Placement" -> "Placed" for display
  const normalizedStatus = job.status === "Placement" ? "Placed" : job.status;

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

          {/* Three Dots Menu */}
          <CDropdown alignment="end">
            <CDropdownToggle
              color="light"
              size="sm"
              className="three-dots-menu-btn"
              style={{
                background: 'transparent',
                border: 'none',
                padding: '4px 8px',
                minWidth: 'auto'
              }}
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
            </CDropdownMenu>
          </CDropdown>
        </div>
      </div>

      {/* ================= Job Description ================= */}
      <div className="job-description-section">
        <h4>Description</h4>
        <p>{job.description || "No description provided."}</p>
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
            {skillsArray.length > 5 && (
              <span
                className="skill-more"
                onClick={() => setExpandedSkills(prev => ({ ...prev, [job.job_id]: !isExpanded }))}
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
