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
                    <button
                        className="floating-add-btn"
                        onClick={() => setShowForm(true)}
                        title="Add New Job"
                    >
                        +
                    </button>
                </>
            )}
        </div>
    )
}


export default PositionTracker
