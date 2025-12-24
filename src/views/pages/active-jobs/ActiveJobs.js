import { useEffect, useState } from "react";
import { getAssignedJobs, getAllJobs } from "../../../api/api";
import {
  FaBuilding,
  FaBriefcase,
  FaClock,
  FaTools,
  FaCircle,
} from "react-icons/fa";
import "./ActiveJobs.css";

const ActiveJobsScreen = ({ userId, role }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId && role !== "Admin") return;

    const fetchJobs = async () => {
      setLoading(true);
      try {
        let data = [];
        if (role === "Admin") {
          data = await getAllJobs();
        } else {
          data = await getAssignedJobs(userId);
        }
        setJobs(data);
      } catch (err) {
        console.error("Error fetching jobs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [userId, role]);

  if (!userId && role !== "Admin") return <p>Loading user info...</p>;
  if (loading) return <p className="loading-text">Loading jobs...</p>;

  return (
    <div className="active-jobs-page">
      <h2 className="active-jobs-heading">Active Job Openings</h2>

      {jobs.length === 0 && <p>No jobs found.</p>}

      <div className="jobs-grid">
        {jobs.map((job) => (
          <div key={job.job_id} className="job-card">
            {/* Header */}
            <div className="job-header">
              <h3>{job.title}</h3>
              <span className="job-status active">
                <FaCircle /> Active
              </span>
            </div>

            {/* Meta */}
            <div className="job-meta">
              <span>
                <FaBuilding /> {job.company}
              </span>
              <span>
                <FaBriefcase /> {job.experience} yrs
              </span>
            </div>

            {/* Description */}
            <p className="job-description">
              {job.description || "No description provided."}
            </p>

            {/* Footer */}
            <div className="job-footer">
              <span>
                <FaTools /> {job.skills}
              </span>
              <span>
                <FaClock /> Open
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActiveJobsScreen;
