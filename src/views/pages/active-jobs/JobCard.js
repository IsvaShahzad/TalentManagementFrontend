// JobCard.js
import React from "react";
import { FaLink } from "react-icons/fa";
import { CButton } from "@coreui/react";
import { cilNotes } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import './ActiveJobs.css'; // reuse Active Jobs styling

const JobCard = ({
  job,
  role,
  handleStatusChange,
  openCandidatesModal,
  setNotesJobId,
  setNotesVisible,
  expandedSkills,
  setExpandedSkills
}) => {
  const skillsArray = Array.isArray(job.skills)
    ? job.skills
    : job.skills?.split(",").map(s => s.trim()) || [];

  const isExpanded = expandedSkills[job.job_id];
  const visibleSkills = isExpanded ? skillsArray : skillsArray.slice(0, 5);

  return (
    <div className="job-card">
      {/* ================= Job Header ================= */}
      <div className="job-header">
        <div>
          <h3 className="job-title">{job.title}</h3>
          {job.company && <div className="job-company">{job.company}</div>}
          <div className="job-meta">
            {job.created_at
              ? `Posted on ${new Date(job.created_at).toLocaleDateString()}`
              : "Date not available"}
          </div>
        </div>

        <div className="job-status-wrapper">
          {/* Job Status Dropdown */}
          <select
            className={`job-status ${job.status?.toLowerCase()} ${job.status === "Closed" ? "no-arrow" : ""}`}
            value={job.status}
            onChange={(e) => handleStatusChange(job.job_id, e.target.value)}
            disabled={job.status === "Closed" || role === "Client"}
          >
            {["Open", "Paused", "Closed", "Placement"].map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>

          {/* Icons Container - Below Status, Side by Side */}
          <div className="job-icons-container">
            {/* Link Candidates Icon */}
            {role === "Recruiter" &&
              !["Closed", "Placement", "Paused"].includes(job.status) && (
                <FaLink
                  className="link-icon"
                  onClick={() => openCandidatesModal(job.job_id)}
                  title="Link Candidates"
                />
              )}

            {/* Notes Button */}
            {role !== "Client" && (
              <CButton
                color="light"
                size="sm"
                className="notes-icon-btn"
                onClick={() => {
                  setNotesJobId(job.job_id);
                  setNotesVisible(true);
                }}
              >
                <CIcon icon={cilNotes} />
              </CButton>
            )}
          </div>
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
