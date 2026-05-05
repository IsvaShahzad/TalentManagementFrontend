//will have all position tracker screen components



//jobForm
import React, { useState } from 'react'
import JobForm from './JobForm'
import DisplayJobsTable from './DisplayJobs'
import './jobFormFloating.css'

const PositionTracker = () => {
    const [showForm, setShowForm] = useState(false)

    return (
        <div style={{ position: 'relative', minHeight: '100vh' }}>
            {showForm && (
                <div className="job-form-overlay">
                    <JobForm />
                    <button
                        className="close-form-btn"
                        onClick={() => setShowForm(false)}
                    >
                        &times;
                    </button>
                </div>
            )}
            {!showForm && (
                <>
                    {/* === Jobs Table === */}
                    <DisplayJobsTable />
                    
                    {/* Floating Add Button */}
                   <>
  {/* Top Header */}
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "1rem",
      borderBottom: "1px solid #e5e7eb",
      background: "#fff",
      position: "sticky",
      top: 0,
      zIndex: 10,
    }}
  >
    {/* Search will live inside table but we pass setter */}
    <div style={{ flex: 1 }}>
      <DisplayJobsTable setShowForm={setShowForm} />
    </div>

    {/* Button */}
    <button
      onClick={() => setShowForm(true)}
      style={{
        marginLeft: "1rem",
        background: "#2563eb",
        color: "#fff",
        border: "none",
        padding: "10px 18px",
        borderRadius: "6px",
        fontSize: "0.9rem",
        fontWeight: 500,
        cursor: "pointer",
      }}
    >
      + Post New Job
    </button>
  </div>
</>
                </>
            )}
        </div>
    )
}


export default PositionTracker
