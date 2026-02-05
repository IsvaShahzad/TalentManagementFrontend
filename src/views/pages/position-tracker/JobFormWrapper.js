import React, { useState } from 'react'
import JobForm from './JobForm'
import './jobFormFloating.css'

const JobFormWrapper = () => {
  const [showForm, setShowForm] = useState(false)

  return (
    <>
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
        <button
          className="floating-add-btn"
          onClick={() => setShowForm(true)}
          title="Add New Job"
        >
          +
        </button>
      )}
    </>
  )
}

export default JobFormWrapper
