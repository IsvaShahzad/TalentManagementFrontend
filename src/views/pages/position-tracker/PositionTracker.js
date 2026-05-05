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
      
     

      { (
        <>
          {/* ✅ Header */}
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
            <h5 style={{ margin: 0, fontWeight: 600 }}>
              Position Tracker
            </h5>

            
          </div>

          {/* ✅ ONLY ONE TABLE */}
          <DisplayJobsTable />
        </>
      )}
    </div>
  )
}

export default PositionTracker
