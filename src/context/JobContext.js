import React, { createContext, useState, useContext } from 'react';

// Create context
const JobsContext = createContext();

// Provider component
export const JobsProvider = ({ children }) => {
  const [totalJobs, setTotalJobs] = useState(0);
  const [assignedJobs, setAssignedJobs] = useState(0);

  return (
    <JobsContext.Provider value={{ totalJobs, setTotalJobs, assignedJobs, setAssignedJobs }}>
      {children}
    </JobsContext.Provider>
  );
};

// Custom hook to use context
export const useJobs = () => useContext(JobsContext);
