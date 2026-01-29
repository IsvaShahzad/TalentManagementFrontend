import React, { useState, useEffect } from "react";
import { toast } from 'react-toastify';
import { getAllJobs, getAllCandidates, getCandidateStatusHistoryApi, fetchLoginActivitiesApi, getUsersByRoleApi, getAll_Rems } from "../../api/api";


import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CRow,
} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import { cilCloudDownload } from "@coreui/icons";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ComposedChart,
  CartesianGrid,
  BarChart,
  Bar,
  LineChart,
  Line,
  Legend,
} from "recharts";

import WidgetsDropdown from "../widgets/WidgetsDropdown";
import "../widgets/WidgetStyles.css";


import { useLocation } from "react-router-dom"; // ✅ Import useLocation
import { useAuth } from "../../context/AuthContext"; // ✅ Import useAuth for JWT-based auth

const Dashboard = () => {
  const location = useLocation(); // ✅ get state from navigation
  const { role: authRole, isClient } = useAuth(); // ✅ Use JWT-based role from auth context
  const [totalJobs, setTotalJobs] = useState(0);
  const [assignedJobs, setAssignedJobs] = useState(0);
const [candidateStatusData, setCandidateStatusData] = useState([]);


  const [jobs, setJobs] = useState([]);
  const [trafficData, setTrafficData] = useState([]);
  const [weeklyJobs, setWeeklyJobs] = useState([]);

  const [loading, setLoading] = useState(true);

  // Recent Activity state (real data)
  const [recentActivity, setRecentActivity] = useState([]);
  const [loadingActivity, setLoadingActivity] = useState(true);

  // Alerts state
  const [alerts, setAlerts] = useState([]);
  const [loadingAlerts, setLoadingAlerts] = useState(true);

  // Time to fill data (weekly average days to hire)
  const [timeToFillData, setTimeToFillData] = useState([]);




  const progressExample = [
    { title: "Placed", value: "0 Jobs", percent: 30, color: "success" },
    { title: "Pending", value: "0 Jobs", percent: 30, color: "warning" },
    { title: "Completed", value: "0 Jobs", percent: 80, color: "info" },
  ];


  // Candidate vs Ratio chart data
const candidateVsRatioData = candidateStatusData.map(item => ({
  month: item.name,           // e.g., "Offered", "Shortlisted"
  candidates: item.value,     // candidate count
  ratio: item.name === "Offered" ? item.value : 0 // ratio = offered
}));



const allDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const normalizedWeeklyJobs = allDays.map(day => {
  const found = weeklyJobs.find(d => d.day === day);
  return {
    day,
    jobs: found ? found.jobs : 0,
    isEmpty: !found || found.jobs === 0
  };
});


// Define the 4 categories you want to show in the bar chart
const categoriesToShow = ["Placed", "Offered", "Sourced", "Shortlisted"];

// Prepare bar chart data
const barChartData = candidateStatusData
  .filter(item => categoriesToShow.includes(item.name))
  .map(item => ({
    status: item.name,
    count: item.value,           // candidate count
  }));



  const role = authRole || localStorage.getItem("role"); // Use JWT role with localStorage fallback

useEffect(() => {
const fetchCandidateStatus = async () => {
  try {
    const res = await getAllCandidates();
    console.log("Candidates fetched:", res);

    const candidates = Array.isArray(res) ? res : res.candidates || [];

    const statusCounts = candidates.reduce((acc, cand) => {
      const statusRaw = cand.candidate_status || "Waiting";
      const status = statusRaw.charAt(0).toUpperCase() + statusRaw.slice(1).toLowerCase();
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const pieData = Object.keys(statusCounts).map((key) => ({
      name: key,
      value: statusCounts[key],
    }));

    console.log("Pie chart data:", pieData);
    setCandidateStatusData(pieData);

  } catch (err) {
    console.error("Error fetching candidates:", err);
    setCandidateStatusData([]);
  }
};

  fetchCandidateStatus();
}, 



[]);



// Total candidates = sum of all statuses
const totalCandidates = candidateStatusData.reduce(
  (sum, item) => sum + item.value,
  0
);

// Offered count from candidateStatusData
const offeredCount = candidateStatusData.find(item => item.name === "Offered")?.value || 0;



  useEffect(() => {
    const showToast = localStorage.getItem("showLoginToast");
    const role = localStorage.getItem("loggedInRole");

    if (showToast === "true") {
      toast.success(`Logged in as ${role || "User"}`, { autoClose: 1000 });
      localStorage.removeItem("showLoginToast");
      localStorage.removeItem("loggedInRole");
    }
  }, []);

  const COLORS = ["#3b91edff", "#4379d1ff", "#75a9e9ff"];

  const getWeeklyJobsData = (jobs) => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // Start with 0 jobs for each day
    const weekMap = {
      Mon: 0,
      Tue: 0,
      Wed: 0,
      Thu: 0,
      Fri: 0,
      Sat: 0,
      Sun: 0,
    };

    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 6);

    jobs.forEach(job => {
      const createdAt = new Date(job.created_at);
      if (createdAt >= sevenDaysAgo && createdAt <= today) {
        const dayName = days[createdAt.getDay()];
        weekMap[dayName]++;
      }
    });

    return [
      { day: "Mon", jobs: weekMap.Mon },
      { day: "Tue", jobs: weekMap.Tue },
      { day: "Wed", jobs: weekMap.Wed },
      { day: "Thu", jobs: weekMap.Thu },
      { day: "Fri", jobs: weekMap.Fri },
      { day: "Sat", jobs: weekMap.Sat },
      { day: "Sun", jobs: weekMap.Sun },
    ];
  };





  const [progressData, setProgressData] = useState(progressExample);

  const [users, setUsers] = useState([
  ]);

  // Fetch all logged-in users

  const getLoggedInUsers = async () => {
    try {
      const loginsRes = await fetch("http://localhost:7000/api/user/login/all");
      const loginsData = await loginsRes.json();
      if (!Array.isArray(loginsData)) return toast.error("Invalid login data");

      const logoutsRes = await fetch("http://localhost:7000/api/user/logout/all");
      const logoutsData = await logoutsRes.json();
      if (!Array.isArray(logoutsData)) return toast.error("Invalid logout data");

      const usersMap = {};

      // Process logins: keep latest login per user
      loginsData.forEach((login) => {
        const userId = login.userId;
        const loginTime = new Date(login.occurredAt);
        if (!usersMap[userId] || loginTime > new Date(usersMap[userId].loggedIn)) {
          usersMap[userId] = {
            id: userId,
            name: login.user?.full_name || "Unknown",
            email: login.user?.email || "Unknown",
            role: login.user?.role || "User",
            loggedIn: loginTime,
            loggedOut: null, // will update below
          };
        }
      });

      // Process logouts: assign latest logout per user
      logoutsData.forEach((logout) => {
        const userId = logout.userId;
        const logoutTime = new Date(logout.occurredAt);
        if (usersMap[userId]) {
          if (!usersMap[userId].loggedOut || logoutTime > new Date(usersMap[userId].loggedOut)) {
            usersMap[userId].loggedOut = logoutTime;
          }
        }
      });

      // Convert Dates to string for display
      const usersList = Object.values(usersMap).map(user => ({
        ...user,
        loggedIn: user.loggedIn.toLocaleString(),
        loggedOut: user.loggedOut ? user.loggedOut.toLocaleString() : "Still Logged In",
      }));

      setUsers(usersList);

    } catch (err) {
      console.error("Error fetching users:", err);
      // toast.error("Failed to fetch users");
    }
  };



  useEffect(() => {
    // Initial fetch
    getLoggedInUsers();

    // Poll every 5 seconds to catch any logins/logouts
    const interval = setInterval(() => {
      getLoggedInUsers();
    }, 5000);

    // Listen to localStorage changes (triggered on logout/login in other tabs)
    const handleStorageChange = () => {
      getLoggedInUsers();
    };
    window.addEventListener("storage", handleStorageChange);

    // Cleanup
    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);



  // useEffect(() => {
  //   const fetchJobsOverview = async () => {
  //     try {
  //       const response = await getAllJobs();

  //       const formatted = response.map(j => ({
  //         job_id: j.job_id,
  //         created_at: j.created_at,
  //         assigned_to: j.assigned_to,
  //       }));

  //       setJobs(formatted);

  //       const months = [
  //         // "Jan","Feb","Mar","Apr","May","Jun",
  //         // "Jul","Aug","Sep","Oct","Nov","Dec"

  //         "Jan","Feb","Mar","Apr","May","Jun",
  //         "Jul","Aug","Sep","Oct","Nov","Dec"
  //       ];

  //       const grouped = months.map((month, index) => {
  //         const jobsInMonth = formatted.filter(job => {
  //           const d = new Date(job.created_at);
  //           return !isNaN(d) && d.getMonth() === index;
  //         });

  //         return {
  //           month,
  //           JobsPosted: jobsInMonth.length,
  //           Assigned: jobsInMonth.filter(j => j.assigned_to).length,
  //         };
  //       });

  //       setTrafficData(grouped);

  //       console.log("Traffic Data:", grouped); // ✅ Add it here

  //     } catch (err) {
  //       console.error("Failed to load jobs overview", err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchJobsOverview();
  // }, []);


  useEffect(() => {
    const fetchJobsOverview = async () => {
      try {
        const response = await getAllJobs();

        const formatted = response.map(j => ({
          job_id: j.job_id,
          created_at: j.created_at,
          assigned_to: j.assigned_to,
          status: j.status,
        }));

        setJobs(formatted);

        // 🔹 WEEKLY DATA
        const weekly = getWeeklyJobsData(formatted);
        setWeeklyJobs(weekly);

        // 🔹 MONTHLY DATA (already working)
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        const grouped = months.map((month, index) => {
          const jobsInMonth = formatted.filter(job => {
            const d = new Date(job.created_at);
            return !isNaN(d) && d.getMonth() === index;
          });

          return {
            month,
            JobsPosted: jobsInMonth.length,
            Assigned: jobsInMonth.filter(j => j.assigned_to).length,
            Open: jobsInMonth.filter(j => j.status === "Open").length,
            Closed: jobsInMonth.filter(j => j.status === "Closed").length,
            Paused: jobsInMonth.filter(j => j.status === "Paused").length,
            //  placement: jobsInMonth.filter(j => j.status === "Placement").length,
          };
        });

        setTrafficData(grouped);

        // 🔹 TIME TO FILL DATA (weekly average days from job creation to close/placement)
        const now = new Date();
        const closedJobs = response.filter(j => j.status === "Closed" || j.status === "Placement");
        const weeklyTimeToFill = [];
        
        for (let w = 6; w >= 0; w--) {
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - (w * 7) - 6);
          const weekEnd = new Date(now);
          weekEnd.setDate(now.getDate() - (w * 7));
          
          const jobsInWeek = closedJobs.filter(j => {
            const createdDate = new Date(j.created_at);
            return createdDate >= weekStart && createdDate <= weekEnd;
          });
          
          // Calculate average days to fill (mock: random 2-5 days if no data)
          const avgDays = jobsInWeek.length > 0 
            ? Math.round(jobsInWeek.reduce((sum, j) => {
                const created = new Date(j.created_at);
                const daysDiff = Math.max(1, Math.ceil((now - created) / (1000 * 60 * 60 * 24)));
                return sum + Math.min(daysDiff, 30); // cap at 30 days
              }, 0) / jobsInWeek.length)
            : Math.floor(Math.random() * 3) + 2; // fallback 2-4 days
          
          weeklyTimeToFill.push({
            day: `Week ${7 - w}`,
            value: avgDays,
            jobs: jobsInWeek.length
          });
        }
        
        setTimeToFillData(weeklyTimeToFill);

      } catch (err) {
        console.error("Failed to load jobs overview", err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobsOverview();
  }, []);

  // 🔹 FETCH RECENT ACTIVITY (real data from APIs)
  useEffect(() => {
    const fetchRecentActivity = async () => {
      setLoadingActivity(true);
      try {
        const activities = [];

        // 1. Candidate status changes
        try {
          const statusHistory = await getCandidateStatusHistoryApi();
          const historyData = statusHistory?.data || statusHistory || [];
          if (Array.isArray(historyData)) {
            historyData.slice(0, 15).forEach(h => {
              activities.push({
                type: 'status_change',
                iconBg: '#fff3cd',
                iconColor: '#856404',
                text: `${h.candidateName || 'Candidate'}: ${h.oldStatus || 'N/A'} → ${h.newStatus || 'N/A'}`,
                user: h.changedBy || 'System',
                time: h.changedAt,
                sortTime: new Date(h.changedAt),
              });
            });
          }
        } catch (e) { console.error('Status history error:', e); }

        // 2. Recent logins
        try {
          const logins = await fetchLoginActivitiesApi();
          if (Array.isArray(logins)) {
            logins.slice(0, 10).forEach(l => {
              activities.push({
                type: 'login',
                iconBg: '#d1fae5',
                iconColor: '#047857',
                text: `User logged in`,
                user: l.user?.full_name || l.user?.email || 'Unknown',
                time: l.occurredAt,
                sortTime: new Date(l.occurredAt),
              });
            });
          }
        } catch (e) { console.error('Logins error:', e); }

        // 3. Recently added candidates
        try {
          const candidates = await getAllCandidates();
          const candidatesArr = Array.isArray(candidates) ? candidates : candidates?.candidates || [];
          candidatesArr
            .slice()
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 10)
            .forEach(c => {
              activities.push({
                type: 'candidate_added',
                iconBg: '#e3f2fd',
                iconColor: '#0d47a1',
                text: `Candidate added: ${c.name || c.firstName || 'Unknown'}`,
                user: c.sourced_by_name || 'Recruiter',
                time: c.created_at || c.createdAt,
                sortTime: new Date(c.created_at || c.createdAt),
              });
            });
        } catch (e) { console.error('Candidates error:', e); }

        // 4. Recent recruiters added
        try {
          const recruitersRes = await getUsersByRoleApi('Recruiter');
          const recruiters = recruitersRes?.users || [];
          recruiters
            .slice()
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5)
            .forEach(r => {
              activities.push({
                type: 'recruiter_added',
                iconBg: '#fce7f3',
                iconColor: '#be185d',
                text: `New Recruiter: ${r.full_name || r.email}`,
                user: 'Admin',
                time: r.createdAt,
                sortTime: new Date(r.createdAt),
              });
            });
        } catch (e) { console.error('Recruiters error:', e); }

        // Sort by time descending and take top 15
        activities.sort((a, b) => b.sortTime - a.sortTime);
        setRecentActivity(activities.slice(0, 15));

      } catch (err) {
        console.error("Failed to load recent activity", err);
      } finally {
        setLoadingActivity(false);
      }
    };

    fetchRecentActivity();
    // Refresh every 30 seconds
    const interval = setInterval(fetchRecentActivity, 30000);
    return () => clearInterval(interval);
  }, []);

  // 🔹 FETCH ALERTS (Follow-ups due, Overdue responses, Unassigned jobs)
  useEffect(() => {
    const currentRole = (authRole || localStorage.getItem("role") || "").toLowerCase();
    if (currentRole === "client") {
      setLoadingAlerts(false);
      return; // Clients don't see alerts
    }

    const fetchAlerts = async () => {
      setLoadingAlerts(true);
      try {
        const alertsList = [];
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        // 1. Follow-ups due (reminders due today or overdue)
        try {
          const remindersRes = await getAll_Rems();
          const reminders = remindersRes?.reminders || [];
          reminders.forEach(r => {
            const remindAt = new Date(r.remind_at);
            if (remindAt <= now && !r.is_done) {
              alertsList.push({
                type: 'followup',
                color: '#fef3c7',
                borderColor: '#f59e0b',
                title: 'Follow-up Due',
                text: r.message || 'Reminder',
                detail: `Due: ${remindAt.toLocaleDateString()}`,
                time: r.remind_at,
              });
            }
          });
        } catch (e) { console.error('Reminders error:', e); }

        // 2. Overdue candidate responses (candidates in "submitted" status for > 7 days)
        try {
          const candidates = await getAllCandidates();
          const candidatesArr = Array.isArray(candidates) ? candidates : candidates?.candidates || [];
          const sevenDaysAgo = new Date(now);
          sevenDaysAgo.setDate(now.getDate() - 7);
          
          candidatesArr.forEach(c => {
            const status = (c.candidate_status || '').toLowerCase();
            const createdAt = new Date(c.created_at || c.createdAt);
            if ((status === 'submitted' || status === 'sourced') && createdAt < sevenDaysAgo) {
              alertsList.push({
                type: 'overdue',
                color: '#fee2e2',
                borderColor: '#ef4444',
                title: 'Overdue Response',
                text: `${c.name || c.firstName || 'Candidate'} - No update for 7+ days`,
                detail: `Status: ${c.candidate_status || 'Unknown'}`,
                time: c.created_at,
              });
            }
          });
        } catch (e) { console.error('Overdue check error:', e); }

        // 3. Unassigned jobs
        try {
          const jobsData = await getAllJobs();
          const unassigned = jobsData.filter(j => !j.assigned_to && j.status === 'Open');
          unassigned.slice(0, 5).forEach(j => {
            alertsList.push({
              type: 'unassigned',
              color: '#dbeafe',
              borderColor: '#3b82f6',
              title: 'Unassigned Job',
              text: j.title || 'Job',
              detail: `Created: ${new Date(j.created_at).toLocaleDateString()}`,
              time: j.created_at,
            });
          });
        } catch (e) { console.error('Unassigned jobs error:', e); }

        // Sort and limit
        alertsList.sort((a, b) => new Date(b.time) - new Date(a.time));
        setAlerts(alertsList.slice(0, 10));

      } catch (err) {
        console.error("Failed to load alerts", err);
      } finally {
        setLoadingAlerts(false);
      }
    };

    fetchAlerts();
    // Refresh alerts every 5 minutes
    const interval = setInterval(fetchAlerts, 300000);
    return () => clearInterval(interval);
  }, []);






  return (
    <>
      <div className="px-2">
        <WidgetsDropdown className="mb-4" />
      </div>

      {/* Responsive Charts Row */}
      <CRow className="align-items-stretch" style={{ marginTop: "60px" }}>
        {/* Jobs Overview - left */}
        <CCol xs={12} lg={8}>
          <CCard
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e0e2e5ff", // light grey border
              borderRadius: "0px",      // slightly square
              boxShadow: "none",
              height: "420px",
              marginBottom: "40px"          // space below card
            }}
          >
            <CCardBody style={{ height: "100%", padding: "0.5rem 1rem" }}>
              <h5 className="card-title mb-2" style={{ fontWeight: 500 }}>
                Jobs Overview
              </h5>

              <div style={{ width: "100%", height: "300px" }}>

                <ResponsiveContainer width="100%" height="100%">

                  <AreaChart
                    data={trafficData}
                    margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="jobsPostedColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3f90eeff" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#013cfdff" stopOpacity={0.1} />
                      </linearGradient>

                      <linearGradient id="assignedColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#5784e7ff" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#0560faff" stopOpacity={0.1} />
                      </linearGradient>

                      <linearGradient id="openColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#34d399" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#10b981" stopOpacity={0.1} />
                      </linearGradient>

                      <linearGradient id="closedColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f87171" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#ef4444" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>

                    <CartesianGrid stroke="#e5e5e5" strokeDasharray="1 1" />
                    <XAxis dataKey="month" tick={{ fill: "#555", fontSize: 12 }} />
                    <YAxis tick={{ fill: "#9f9f9fff", fontSize: 12 }} />
                    <Tooltip wrapperStyle={{ fontSize: "0.85rem" }} />
                    <Legend />

                    <Area
                      type="monotone"
                      dataKey="JobsPosted"
                      stackId="1"
                      stroke="#1e40af"
                      strokeWidth={1.5}
                      fill="url(#jobsPostedColor)"
                    />
                    <Area
                      type="monotone"
                      dataKey="Assigned"
                      stackId="1"
                      stroke="#5784e7ff"
                      strokeWidth={1.5}
                      fill="url(#assignedColor)"
                    />
                    <Area
                      type="monotone"
                      dataKey="Open"
                      stackId="1"
                      stroke="#10b981"
                      strokeWidth={1.5}
                      fill="url(#openColor)"
                    />
                    <Area
                      type="monotone"
                      dataKey="Closed"
                      stackId="1"
                      stroke="#ef4444"
                      strokeWidth={1.5}
                      fill="url(#closedColor)"
                    />
                  </AreaChart>

                </ResponsiveContainer>

                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#9ca3af",
                    fontSize: "0.9rem",
                  }}
                >
                  Loading job overview…
                </div>


              </div>


              {/* Job stats below graph
              {!loading && (
                <div style={{ display: "flex", justifyContent: "space-around", marginTop: 16 }}>
                  <div>
                    <strong>{jobs.length}</strong>
                    <div>Total Jobs</div>
                  </div>
                  <div>
                    <strong>{jobs.filter(j => j.assigned_to).length}</strong>
                    <div>Assigned Jobs</div>
                  </div>
                  <div>
                    <strong>{jobs.filter(j => j.status === "open").length}</strong>
                    <div>Open Jobs</div>
                  </div>
                  <div>
                    <strong>{jobs.filter(j => j.status === "closed").length}</strong>
                    <div>Closed Jobs</div>
                  </div>
                </div>

              )} */}


            </CCardBody>
          </CCard>
        </CCol>

        {/* Stats/Weekly Submissions - right */}
        <CCol xs={12} lg={4}>
          <CCard
            style={{
              backgroundColor: "#ffffffff",
              border: "1px solid #e0e2e5ff", // light grey border
              borderRadius: "1px",      // slightly square
              boxShadow: "none",
              height: "420px"
            }}
          >
            <CCardBody style={{ height: "100%", padding: "0.5rem 1rem" }}>
              <h5 className="card-title mb-3" style={{ fontWeight: 500 }}>Weekly Postings</h5>
              <div style={{ width: "100%", height: "calc(100% - 2.5rem)", marginTop: "10px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                      data={normalizedWeeklyJobs}

                    margin={{ top: 10, right: 0, left: 0, bottom: 20 }}
                    barGap={18}
                  >
           <Bar
  dataKey="jobs"
  barSize={28}
  radius={[4, 4, 0, 0]}
  minPointSize={6} // 👈 forces visibility
  background={{ fill: "#e5e7eb", radius: [4, 4, 0, 0] }} // 👈 placeholder bar
>
  {normalizedWeeklyJobs.map((entry, index) => (
    <Cell
      key={`cell-${index}`}
      fill={entry.jobs === 0 ? "transparent" : "#3f71c2ff"}
    />
  ))}
</Bar>



                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#555", fontSize: 12 }}
                      interval={0}
                      padding={{ left: 10, right: 10 }}
                    />

                    <Tooltip
                      cursor={false}
                      contentStyle={{ backgroundColor: "#fff", fontSize: "0.85rem", border: "1px solid #ccc" }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CCardBody>
          </CCard>
        </CCol>



      </CRow>









      {/* Recent Activity + Stats Side by Side */}
      <div className="px-2" style={{ marginTop: "0.5rem" }}>
        <CRow className="mb-4 gx-3 gy-3 align-items-stretch">

          {/* --- Recent Activity --- */}
          <CCol xs={12} lg={6} className="d-flex">
            <CCard

              style={{
                backgroundColor: "#ffffff",
                border: "none",
                borderRadius: "1px",
                fontFamily: "Inter, sans-serif",
                fontSize: "10px",
                marginTop: "0", // fix top alignment
                flexGrow: 1,
                //  border: "0.8px solid #e0e2e5ff",
              }}
            >
              <CCardBody style={{ padding: "1.5rem 1rem" }}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 style={{ color: "#333", fontWeight: 450, fontSize: "0.98rem" }}>Recent Activity</h5>
                  <div className="d-flex align-items-center gap-2">
                    <small style={{ color: "#777", fontSize: "0.7rem" }}>
                      Updated on: {new Date().toLocaleString()}
                    </small>
                    <CButton
                      color="light"
                      size="sm"
                      style={{ borderRadius: "3%", boxShadow: "none", padding: "0.25rem", transition: "transform 0.3s" }}
                      onClick={() => window.location.reload()}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = "rotate(90deg)")}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = "rotate(0deg)")}
                    >
                      <CIcon icon={cilCloudDownload} style={{ color: "#333", width: "18px", height: "18px" }} />
                    </CButton>
                  </div>
                </div>

                {/* Activity List */}
                <div
                  className="d-flex flex-column gap-2 mt-3 mb-4"
                  style={{ overflowY: "auto", maxHeight: "50vh", minHeight: "250px" }}
                >
                  {loadingActivity ? (
                    <div style={{ textAlign: "center", color: "#6B7280", padding: "2rem" }}>
                      Loading recent activity...
                    </div>
                  ) : recentActivity.length === 0 ? (
                    <div style={{ textAlign: "center", color: "#6B7280", padding: "2rem" }}>
                      No recent activity found.
                    </div>
                  ) : (
                    recentActivity.map((activity, index) => {
                      // Format time ago
                      const timeAgo = (dateStr) => {
                        const date = new Date(dateStr);
                        if (isNaN(date.getTime())) return 'Recently';
                        const now = new Date();
                        const diffMs = now - date;
                        const diffMins = Math.floor(diffMs / 60000);
                        const diffHours = Math.floor(diffMs / 3600000);
                        const diffDays = Math.floor(diffMs / 86400000);
                        if (diffMins < 1) return 'Just now';
                        if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
                        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
                        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
                        return date.toLocaleDateString();
                      };

                      return (
                        <div
                          key={index}
                          className="d-flex justify-content-between align-items-center p-3"
                          style={{
                            borderRadius: "1px",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                            transition: "all 0.3s ease",
                            backgroundColor: "#fff",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "translateY(-2px)";
                            e.currentTarget.style.boxShadow = "0 3px 10px rgba(0,0,0,0.08)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.05)";
                          }}
                        >
                          <div className="d-flex align-items-center gap-3 flex-grow-1">
                            <div
                              style={{
                                width: "36px",
                                height: "36px",
                                borderRadius: "1px",
                                backgroundColor: activity.iconBg,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                              }}
                            >
                              <CIcon icon={cilCloudDownload} size="sm" style={{ color: activity.iconColor }} />
                            </div>
                            <div className="text-truncate" style={{ minWidth: 0 }}>
                              <div style={{ fontWeight: 600, color: "#333", fontSize: "0.85rem", marginBottom: "0.15rem" }}>
                                {activity.text}
                              </div>
                              <div style={{ fontSize: "0.7rem", color: "#777" }}>{activity.user}</div>
                            </div>
                          </div>
                          <div style={{ fontSize: "0.7rem", color: "#999", marginLeft: "10px" }}>
                            {timeAgo(activity.time)}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </CCardBody>
            </CCard>
          </CCol>

          {/* --- Candidate Status (Smooth Wave Line with Months) --- */}
          {/* --- Weekly Hiring Metrics --- */}
          <CCol xs={12} lg={6} className="d-flex">
            <CCard className="flex-grow-1" style={{ backgroundColor: "#ffffff", border: "0.8px solid #e0e2e5ff", borderRadius: "0px" }}>
              <CCardBody className="d-flex flex-column" style={{ padding: "1.5rem 1rem", justifyContent: "space-between" }}>
                <h5 className="card-title mb-3">Time to Hire (Weekly)</h5>

                <div className="flex-grow-1 d-flex justify-content-center align-items-center">
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart
                      data={timeToFillData.length > 0 ? timeToFillData : [
                        { day: 'Week 1', value: 2 },
                        { day: 'Week 2', value: 3 },
                        { day: 'Week 3', value: 2 },
                        { day: 'Week 4', value: 2.8 },
                        { day: 'Week 5', value: 2 },
                        { day: 'Week 6', value: 4 },
                        { day: 'Week 7', value: 2 },
                      ]}
                      margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
                    >
                      <defs>
                        {/* Line Gradient */}
                        <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#3f71c2" />   {/* Medium-dark blue start */}
                          <stop offset="100%" stopColor="#60a5fa" /> {/* Lighter blue end */}
                        </linearGradient>

                        {/* Area Gradient */}
                        <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3f71c2" stopOpacity={0.2} />
                          <stop offset="100%" stopColor="#3f71c2" stopOpacity={0} />
                        </linearGradient>


                      </defs>

                      {/* X Axis */}
                      <XAxis
                        dataKey="day"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#333", fontSize: 12, fontWeight: 500 }}
                      />

                      {/* Y Axis hidden */}
                      <YAxis hide />

                      {/* Light grid */}
                      <CartesianGrid stroke="#e0e2e5" strokeDasharray="3 3" vertical={false} />

                      {/* Tooltip with Turn Around */}
                      <Tooltip
                        formatter={(value) => [`${value} days`, "Turn Around"]}

                        contentStyle={{
                          borderRadius: "6px",
                          backgroundColor: "rgba(255,255,255,0.95)",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                          fontSize: "0.8rem"
                        }}
                      />

                      {/* Smooth wave line */}
                      {/* Smooth wave line */}
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="url(#lineGradient)"
                        strokeWidth={2}         // Thinner line
                        dot={{ r: 4, fill: "#2563eb", stroke: "#fff", strokeWidth: 1.5 }} // Smaller circles, matching line color
                        activeDot={{ r: 6 }}   // Slightly bigger on hover
                      />


                      {/* Gradient area under line */}
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="none"
                        fill="url(#areaGradient)"
                        tooltipType="none"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CCardBody>
            </CCard>
          </CCol>







        </CRow>
      </div>

      <CRow className="mb-4 gx-3 gy-3 align-items-stretch">




        <CRow className="mb-4 gx-3 gy-3 align-items-stretch" style={{ marginTop: "1.5rem" }}>



          
          {/* --- Candidate vs Ratio (Side-by-Side Bars with Legend) --- */}
          <CCol xs={12} lg={7} className="d-flex justify-content-center">
            <CCard
              className="flex-grow-1"
              style={{
                minHeight: '400px',
                border: '0.8px solid #e0e2e5ff',
                borderRadius: '6px',
                backgroundColor: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              <CCardBody>
                <h5 style={{ marginBottom: '1rem', fontWeight: 600, textAlign: 'center' }}>
                  Candidate vs Ratio
                </h5>



<div
  style={{
    display: 'flex',
    justifyContent: 'center',
    gap: '2rem',
    marginBottom: '10px',
  }}
>
  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
    <div
      style={{
        width: '12px',
        height: '12px',
        backgroundColor: '#5cdbd3', // matches Candidates bar
        borderRadius: '2px',
      }}
    />
    <span style={{ fontSize: '0.9rem', color: '#555' }}>
      Candidates: {totalCandidates}
    </span>
  </div>
  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
    <div
      style={{
        width: '12px',
        height: '12px',
        backgroundColor: '#22c3b8', // matches Ratio / Offered bar
        borderRadius: '2px',
      }}
    />
    <span style={{ fontSize: '0.9rem', color: '#555' }}>
      Offered: {offeredCount}
    </span>
  </div>
</div>



<ResponsiveContainer width="95%" height={300}>
  <BarChart
    data={barChartData}
    margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
    barCategoryGap={50}
  >
    {/* Grid */}
    <CartesianGrid stroke="#e0e2e5" strokeDasharray="2 2" />

    {/* X & Y Axis */}
    <XAxis dataKey="status" axisLine={false} tickLine={false} />
    <YAxis hide />

    {/* Tooltip */}
    <Tooltip
      cursor={false}
      content={({ payload }) => {
        if (!payload || !payload.length) return null;
        return (
          <div style={{
            borderRadius: '4px',
            backgroundColor: 'rgba(255,255,255,0.95)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            padding: '6px 10px',
            fontSize: '0.85rem',
            color: '#333'
          }}>
            {payload.map((item, index) => (
              <div key={index}>
                {item.name}: {item.value}
              </div>
            ))}
          </div>
        );
      }}
    />

    {/* Bars */}
    <Bar
      dataKey="count"
      fill="#5cdbd3"
      barSize={50}
      radius={[6, 6, 0, 0]}
    />
  </BarChart>
</ResponsiveContainer>



                {/* Custom legend */}
               <div style={{
  display: 'flex',
  justifyContent: 'center',
  gap: '1.5rem',
  marginTop: '10px',
  flexWrap: 'wrap'
}}>
  {categoriesToShow.map((cat, idx) => {
    const statusColors = {
      Placed: "#4a90e2",
      Offered: "#f28c28",
      Sourced: "#50c878",
      Shortlisted: "#fbbc04"
    };
    const item = barChartData.find(d => d.status === cat);
    return (
      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <div style={{
          width: '12px',
          height: '12px',
          backgroundColor: statusColors[cat] || '#ccc',
          borderRadius: '2px'
        }} />
        <span style={{ fontSize: '0.85rem', color: '#555' }}>
          {cat}: {item?.count || 0}
        </span>
      </div>
    );
  })}
</div>

              </CCardBody>
            </CCard>
          </CCol>










          {/* --- User Registrations Pie Chart --- */}
          <CCol xs={12} lg={5} className="d-flex">
            <CCard
              className="flex-grow-1"
              style={{
                backgroundColor: "#ffffff",
                border: "0.8px solid #e0e2e5ff",
                borderRadius: "0px"
              }}
            >
              <CCardBody
                className="d-flex flex-column"
                style={{ padding: "1.5rem 1rem", justifyContent: "center" }}
              >
                <h5 className="card-title mb-3 text-center">Candidate Status </h5>

                {/* Pie chart */}
                <div className="flex-grow-1 d-flex justify-content-center align-items-center">
                {candidateStatusData.length > 0 ? (
  <ResponsiveContainer width="100%" height={250}>
    <PieChart>
      <Pie
        data={candidateStatusData}
        cx="50%"
        cy="50%"
        innerRadius="45%"
        outerRadius="65%"
        paddingAngle={2}
        dataKey="value"
        label={({ name, value }) => `${name}: ${value}`}
      >
        {candidateStatusData.map((entry, index) => {
          const statusColors = {
            Placed: "#4a90e2",
            Sourced: "#50c878",
            Shortlisted: "#fbbc04",
            Interviewing: "#9b59b6",
            Offered: "#1abc9c",
            Rejected: "#e74c3c",
          };
          return <Cell key={index} fill={statusColors[entry.name] || "#ccc"} />;
        })}
      </Pie>
      <Tooltip formatter={(value) => [`${value}`, "Candidates"]} />
    </PieChart>
  </ResponsiveContainer>

) : (
  <p style={{ textAlign: "center" }}>Loading candidate data…</p>
)}


  
                </div>

              <div
  style={{
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem',
    marginTop: '10px',
    flexWrap: 'wrap',
  }}
>
  {candidateStatusData.map((item, idx) => {
    const statusColors = {
      Placed: "#4a90e2",
      Sourced: "#50c878",
      Shortlisted: "#fbbc04",
      Interviewing: "#9b59b6",
      Offered: "#1abc9c",
      Rejected: "#e74c3c",
      Submitted: "#14d3e0",
    };
    return (
      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
        <div
          style={{
            width: '10px',
            height: '10px',
            backgroundColor: statusColors[item.name] || "#ccc",
            borderRadius: '1px',
          }}
        />
        <span style={{ fontSize: '0.85rem', color: '#555' }}>
          {item.name} {item.value ? `: ${item.value}` : ""}
        </span>
      </div>
    );
  })}
</div>

              </CCardBody>
            </CCard>
          </CCol>








        </CRow>









      </CRow>













      {/* Alerts Section - Hidden for Clients */}
      {!isClient && alerts.length > 0 && (
        <div style={{ marginTop: "1.5rem", fontFamily: "Inter, sans-serif", padding: "0 1rem" }}>
          <CCard style={{ backgroundColor: "#ffffff", border: "1px solid #e0e2e5ff", borderRadius: "0px" }}>
            <CCardBody style={{ padding: "1.5rem 1rem" }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 style={{ color: "#333", fontWeight: 500, fontSize: "0.98rem", margin: 0 }}>
                  🔔 Alerts
                </h5>
                <small style={{ color: "#777", fontSize: "0.7rem" }}>
                  {alerts.length} alert{alerts.length !== 1 ? 's' : ''} requiring attention
                </small>
              </div>
              
              <div className="d-flex flex-wrap gap-3">
                {loadingAlerts ? (
                  <div style={{ textAlign: "center", color: "#6B7280", padding: "1rem", width: "100%" }}>
                    Loading alerts...
                  </div>
                ) : (
                  alerts.map((alert, index) => (
                    <div
                      key={index}
                      style={{
                        flex: "1 1 280px",
                        maxWidth: "350px",
                        backgroundColor: alert.color,
                        borderLeft: `4px solid ${alert.borderColor}`,
                        borderRadius: "4px",
                        padding: "0.75rem 1rem",
                      }}
                    >
                      <div style={{ fontWeight: 600, fontSize: "0.85rem", color: "#333", marginBottom: "0.25rem" }}>
                        {alert.title}
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "#555", marginBottom: "0.15rem" }}>
                        {alert.text}
                      </div>
                      <div style={{ fontSize: "0.7rem", color: "#777" }}>
                        {alert.detail}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CCardBody>
          </CCard>
        </div>
      )}

      {/* Users Table - Hidden for Clients */}
      {/* Users Table - Hidden for Clients */}
      {!isClient && (
        <div style={{ marginTop: "2rem", fontFamily: "Inter, sans-serif", padding: "0 1rem" }}>


          {/* Table Container */}
          <div
            style={{
              border: "1px solid #d1d5db",
              borderRadius: "0px",
              overflow: "hidden",
              background: "#fff",
            }}
          >
            {/* Table Header */}
            <div
              className="d-flex px-3 py-2 flex-wrap"
              style={{
                fontWeight: 500,
                fontSize: "0.9rem", // smaller font
                color: "#000000",
                background: "#f9fafb",
                borderBottom: "1px solid #d1d5db",
              }}
            >
              <div style={{ flex: "2 1 120px", minWidth: "100px" }}>User</div>
              <div style={{ flex: "3 1 180px", minWidth: "140px" }}>Email</div>
              <div style={{ flex: "2 1 100px", minWidth: "90px" }}>Logged in</div>
              <div style={{ flex: "2 1 100px", minWidth: "90px" }}>Date</div>
              <div style={{ flex: "1 1 80px", minWidth: "70px" }}>Role</div>
            </div>

            {/* Table Rows */}
            <div className="d-flex flex-column" style={{ maxHeight: "60vh", overflowY: "auto" }}>
              {users.length === 0 ? (
                <div style={{ textAlign: "center", color: "#6B7280", padding: "2rem", fontSize: "0.85rem" }}>
                  No users currently logged in.
                </div>
              ) : (
                users.map((user, index) => {
                  const loggedInDateObj = new Date(user.loggedIn);

                  // Date: MM/DD/YY
                  const date = loggedInDateObj.toLocaleDateString("en-US", {
                    month: "2-digit",
                    day: "2-digit",
                    year: "2-digit",
                  });

                  // Time: HH:MM AM/PM
                  const time = loggedInDateObj.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  });

                  return (
                    <div
                      key={index}
                      className="d-flex align-items-center px-3 py-2 flex-wrap"
                      style={{
                        borderBottom: index !== users.length - 1 ? "1px solid #f0f0f0" : "none",
                        background: "#ffffff",
                        transition: "0.25s ease",
                        fontSize: "0.85rem", // smaller font for rows
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#f9fafb";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "#ffffff";
                      }}
                    >
                      {/* User */}
                      <div style={{ flex: "2 1 120px", minWidth: "100px", fontWeight: 500, color: "#0F172A" }}>
                        {user.name}
                      </div>

                      {/* Email */}
                      <div
                        style={{
                          flex: "3 1 180px",
                          minWidth: "140px",
                          color: "#374151",
                          wordBreak: "break-word",
                        }}
                      >
                        {user.email}
                      </div>

                      {/* Time */}
                      <div style={{ flex: "2 1 100px", minWidth: "90px", color: "#4B5563" }}>
                        {time}
                      </div>

                      {/* Date */}
                      <div style={{ flex: "2 1 100px", minWidth: "90px", color: "#4B5563" }}>
                        {date}
                      </div>

                      {/* Role */}
                      <div
                        style={{
                          flex: "1 1 80px",
                          minWidth: "70px",
                          fontWeight: 500,
                          color: "#1E3A8A",
                        }}
                      >
                        {user.role}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}















    </>
  );
};


export default Dashboard;