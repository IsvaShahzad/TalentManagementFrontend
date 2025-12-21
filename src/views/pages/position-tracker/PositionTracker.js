//will have all position tracker screen components



//jobForm
import React from 'react'
import JobForm from './JobForm'
import DisplayJobsTable from './DisplayJobs'

const PositionTracker = () => {
    return (
        <div>
            Position - Tracker
            <JobForm />
            {/* === Jobs Table === */}
            <DisplayJobsTable
            />

        </div>

    )

}


export default PositionTracker
