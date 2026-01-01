
import { useEffect } from "react";

const AutoClearClosedJobs = ({ jobs, setLinkedCandidates, selectedJobId }) => {
    useEffect(() => {
        // Check for jobs with status "Closed"
        const closedJobIds = jobs
            .filter(job => job.status === "Closed")
            .map(job => job.job_id);

        // If the modal is open for a closed job, clear linked candidates
        if (selectedJobId && closedJobIds.includes(selectedJobId)) {
            setLinkedCandidates([]);
        }
    }, [jobs, selectedJobId, setLinkedCandidates]);

    return null; // This component does not render anything
};

export default AutoClearClosedJobs;
