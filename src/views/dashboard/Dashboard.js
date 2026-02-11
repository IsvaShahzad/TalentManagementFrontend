import React, { useState, useEffect } from "react";
import { toast } from 'react-toastify';
import { getAllJobs, getAllCandidates, getCandidateStatusHistoryApi, fetchLoginActivitiesApi, getUsersByRoleApi, getAll_Rems, getClientJobs, getAssignedJobs, getRecruiterCandidatesApi } from "../../api/api";
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import './Dashboard.css';
import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CRow,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import { cilCloudDownload } from "@coreui/icons";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ComposedChart,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  Legend,
} from "recharts";

import WidgetsDropdown from "../widgets/WidgetsDropdown";
import "../widgets/WidgetStyles.css";


import { useLocation, useNavigate } from "react-router-dom"; // ✅ Import useLocation and useNavigate
import { useAuth } from "../../context/AuthContext"; // ✅ Import useAuth for JWT-based auth

const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { role: authRole, isClient, user: authUser } = useAuth();

  // Function to generate consistent color for each user
  const getUserColor = (userIdentifier) => {
    if (!userIdentifier) return { bg: '#e5e7eb', color: '#6b7280' };

    // Hash function to convert string to number
    let hash = 0;
    for (let i = 0; i < userIdentifier.length; i++) {
      hash = userIdentifier.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Array of nice color combinations
    const colorPalette = [
      { bg: '#d1fae5', color: '#047857' }, // green
      { bg: '#dbeafe', color: '#1e40af' }, // blue
      { bg: '#fce7f3', color: '#be185d' }, // pink
      { bg: '#fef3c7', color: '#92400e' }, // yellow
      { bg: '#e0e7ff', color: '#3730a3' }, // indigo
      { bg: '#f3e8ff', color: '#6b21a8' }, // purple
      { bg: '#ffe4e6', color: '#991b1b' }, // red
      { bg: '#ecfdf5', color: '#065f46' }, // emerald
      { bg: '#e0f2fe', color: '#0c4a6e' }, // sky
      { bg: '#fef2f2', color: '#7f1d1d' }, // rose
      { bg: '#f0fdf4', color: '#166534' }, // green-800
      { bg: '#eff6ff', color: '#1e3a8a' }, // blue-900
    ];

    // Use hash to select color consistently
    const index = Math.abs(hash) % colorPalette.length;
    return colorPalette[index];
  };
  const [totalJobs, setTotalJobs] = useState(0);
  const [assignedJobs, setAssignedJobs] = useState(0);
  const [candidateStatusData, setCandidateStatusData] = useState([]);
  const [clientJobs, setClientJobs] = useState([]);
  const [clientJobsLoading, setClientJobsLoading] = useState(false);


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


  // Job status snapshot data for "Job Status Snapshot" bar chart
  const jobStatusLabels = ["Open", "Paused", "Closed", "Placed"];

  const jobStatusBarData = jobStatusLabels.map((label) => {
    const count = jobs.filter((j) => {
      const status = (j.status || "").toString().toLowerCase();
      // Handle both "Placement" (from DB) and "Placed" (display)
      if (label.toLowerCase() === "placed") {
        return status === "placed" || status === "placement";
      }
      return status === label.toLowerCase();
    }).length;
    return {
      status: label,
      count,
    };
  });



  const role = authRole || localStorage.getItem("role");
  const userId = authUser?.user_id || localStorage.getItem("user_id");

  // Client: fetch only this client's jobs for dashboard
  useEffect(() => {
    if (!isClient || !userId) return;
    const fetchClientJobs = async () => {
      setClientJobsLoading(true);
      try {
        const data = await getClientJobs(userId);
        setClientJobs(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch client jobs:", err);
        setClientJobs([]);
      } finally {
        setClientJobsLoading(false);
      }
    };
    fetchClientJobs();
  }, [isClient, userId]);

  useEffect(() => {
    const fetchCandidateStatus = async () => {
      try {
        let candidates = [];

        // For recruiters, fetch only their candidates
        if (role === "Recruiter" && userId) {
          const res = await getRecruiterCandidatesApi(userId, "Recruiter");
          candidates = Array.isArray(res) ? res : res?.candidates || [];
        } else if (role === "Admin") {
          // Admin sees all candidates
          const res = await getAllCandidates();
          candidates = Array.isArray(res) ? res : res.candidates || [];
        }
        // Client doesn't fetch candidates here (handled separately)

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
  }, [role, userId]);



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


  useEffect(() => {
    const fetchJobsOverview = async () => {
      try {
        let response = [];

        // For recruiters, fetch only their assigned jobs
        if (role === "Recruiter" && userId) {
          response = await getAssignedJobs(userId);
        } else if (role === "Admin") {
          // Admin sees all jobs
          response = await getAllJobs();
        } else if (role === "Client") {
          // Client jobs are handled separately
          return;
        }

        const formatted = response.map(j => ({
          job_id: j.job_id,
          created_at: j.created_at,
          assigned_to: j.assigned_to,
          status: j.status,
        }));

        setJobs(formatted);

        // 🔹 WEEKLY DATA (only for Admin)
        if (role === "Admin") {
          const weekly = getWeeklyJobsData(formatted);
          setWeeklyJobs(weekly);
        }

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
            //  placement: jobsInMonth.filter(j => j.status === "Placed").length,
          };
        });

        setTrafficData(grouped);

      } catch (err) {
        console.error("Failed to load jobs overview", err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobsOverview();
  }, [role, userId]);

  // 🔹 TIME TO HIRE (WEEKLY) BASED ON CANDIDATE STATUS → PLACED
  // Only for Admin
  useEffect(() => {
    if (role !== "Admin") return; // Only Admin sees this

    const computeWeeklyTimeToHire = async () => {
      try {
        const [candidatesRes, statusHistoryRes] = await Promise.all([
          getAllCandidates(),
          getCandidateStatusHistoryApi(),
        ]);

        const candidatesArr = Array.isArray(candidatesRes)
          ? candidatesRes
          : candidatesRes?.candidates || [];

        const historyData = statusHistoryRes?.data || statusHistoryRes || [];

        if (!Array.isArray(historyData) || historyData.length === 0) {
          setTimeToFillData([]);
          return;
        }

        // Map candidate_id -> created date
        const candidateCreatedMap = new Map();
        candidatesArr.forEach((c) => {
          const created =
            c.created_at || c.createdAt || c.createdAT || c.createdat;
          if (created) {
            candidateCreatedMap.set(c.candidate_id || c.candidateId, new Date(created));
          }
        });

        // Consider only transitions where newStatus is "Placed"
        const placedEvents = historyData.filter(
          (h) =>
            (h.newStatus || "").toString().toLowerCase() === "placed" &&
            h.candidateId &&
            candidateCreatedMap.has(h.candidateId)
        );

        if (placedEvents.length === 0) {
          setTimeToFillData([]);
          return;
        }

        const now = new Date();
        const weeklyTimeToFill = [];
        const oneDayMs = 1000 * 60 * 60 * 24;

        // Build last 7 weeks (oldest -> newest)
        for (let w = 6; w >= 0; w--) {
          const weekStart = new Date(now);
          weekStart.setHours(0, 0, 0, 0);
          weekStart.setDate(weekStart.getDate() - (w * 7) - 6);

          const weekEnd = new Date(now);
          weekEnd.setHours(23, 59, 59, 999);
          weekEnd.setDate(weekEnd.getDate() - (w * 7));

          const eventsInWeek = placedEvents.filter((h) => {
            const changed = new Date(h.changedAt);
            return changed >= weekStart && changed <= weekEnd;
          });

          const validDurations = eventsInWeek
            .map((h) => {
              const created = candidateCreatedMap.get(h.candidateId);
              if (!created) return null;
              const placedAt = new Date(h.changedAt);
              const diffDays = Math.max(
                1,
                Math.ceil((placedAt - created) / oneDayMs)
              );
              // Optional cap to avoid extreme outliers
              return Math.min(diffDays, 90);
            })
            .filter((d) => d !== null);

          const avgDays =
            validDurations.length > 0
              ? Math.round(
                validDurations.reduce((sum, d) => sum + d, 0) /
                validDurations.length
              )
              : 0;

          weeklyTimeToFill.push({
            day: `Week ${7 - w}`,
            value: avgDays,
            jobs: validDurations.length, // number of placed candidates that week
          });
        }

        setTimeToFillData(weeklyTimeToFill);
      } catch (err) {
        console.error("Failed to compute time to hire from candidates", err);
        setTimeToFillData([]);
      }
    };

    computeWeeklyTimeToHire();
  }, [role]);

  // 🔹 FETCH RECENT ACTIVITY (real data from APIs)
  // Only for Admin
  useEffect(() => {
    if (role !== "Admin") return; // Only Admin sees this

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
              const changedBy = h.changedBy || 'System';
              const userColors = getUserColor(changedBy);
              activities.push({
                type: 'status_change',
                iconBg: userColors.bg,
                iconColor: userColors.color,
                text: `${h.candidateName || 'Candidate'}: ${h.oldStatus || 'N/A'} → ${h.newStatus || 'N/A'}`,
                user: changedBy,
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
              const userName = l.user?.full_name || l.user?.email || 'Unknown';
              const userRole = l.user?.role || 'User';
              const userIdentifier = l.user?.email || l.user?.full_name || 'Unknown';
              const userColors = getUserColor(userIdentifier);
              activities.push({
                type: 'login',
                iconBg: userColors.bg,
                iconColor: userColors.color,
                text: `${userName} (${userRole}) logged in`,
                user: l.user?.email || '',
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
              const sourcedBy = c.sourced_by_name || 'Recruiter';
              const userColors = getUserColor(sourcedBy);
              activities.push({
                type: 'candidate_added',
                iconBg: userColors.bg,
                iconColor: userColors.color,
                text: `Candidate added: ${c.name || c.firstName || 'Unknown'}`,
                user: sourcedBy,
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
              const adminUser = 'Admin';
              const userColors = getUserColor(adminUser);
              activities.push({
                type: 'recruiter_added',
                iconBg: userColors.bg,
                iconColor: userColors.color,
                text: `New Recruiter: ${r.full_name || r.email}`,
                user: adminUser,
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
  }, [role]);

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

        // 3. Unassigned jobs alerts (Admin only - recruiters don't see job alerts)
        try {
          if (role === "Admin") {
            // Admin sees unassigned jobs with status "Open"
            const jobsData = await getAllJobs();
            const unassigned = jobsData.filter(j => !j.assigned_to && (j.status === 'Open' || j.status === 'open'));
            unassigned.slice(0, 5).forEach(j => {
              const createdBy = j.postedByUser?.full_name || 'Unknown';
              const createdDate = new Date(j.created_at);
              alertsList.push({
                type: 'unassigned',
                color: '#dbeafe',
                borderColor: '#3b82f6',
                title: 'Unassigned Job',
                text: j.title || 'Job',
                detail: `Created by: ${createdBy} | Date: ${createdDate.toLocaleDateString()}`,
                jobTitle: j.title || 'Job',
                createdBy: createdBy,
                createdDate: createdDate.toLocaleDateString(),
                jobId: j.job_id,
                time: j.created_at,
              });
            });
          }
          // Recruiters don't see job alerts
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
        {isClient ? (
          <CRow className="mb-4" xs={{ gutter: 3 }}>
            {(() => {
              const totalJobs = clientJobsLoading ? 0 : clientJobs.length;
              const openJobs = clientJobsLoading ? 0 : clientJobs.filter((j) => (j.status || "").toLowerCase() === "open").length;
              const closedJobs = clientJobsLoading ? 0 : clientJobs.filter((j) => (j.status || "").toLowerCase() === "closed").length;
              const placedJobs = clientJobsLoading ? 0 : clientJobs.filter((j) => {
                const status = (j.status || "").toLowerCase();
                return status === "placed" || status === "placement";
              }).length;

              const clientWidgetData = [
                { title: 'My Jobs', total: totalJobs, trend: 'up', link: '/jobs' },
                { title: 'Open Jobs', total: openJobs, trend: 'up', link: '/jobs' },
                { title: 'Closed Jobs', total: closedJobs, trend: 'down', link: '/jobs' },
                { title: 'Placed Jobs', total: placedJobs, trend: 'up', link: '/jobs' },
              ];

              return clientWidgetData.map((widget, index) => (
                <CCol key={index} xs={12} sm={6} md={4} xl={3}>
                  <div
                    style={{
                      borderRadius: '0.25rem',
                      border: '1px solid #d1d5db',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      minHeight: '140px',
                      backgroundColor: '#fff',
                      overflow: 'hidden',
                      transition: 'transform 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0px)'}
                  >
                    <div style={{ padding: '0.8rem 1rem', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexWrap: 'wrap' }}>
                        <div style={{ fontSize: '1.4rem', fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>
                          {clientJobsLoading ? "…" : widget.total.toLocaleString()}
                        </div>
                        {widget.trend === 'up' ? (
                          <TrendingUp color="green" size={18} />
                        ) : (
                          <TrendingDown color="red" size={18} />
                        )}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280', fontFamily: 'Inter, sans-serif', marginTop: '2px' }}>
                        {widget.title}
                      </div>
                    </div>
                    <div
                      onClick={() => navigate(widget.link)}
                      style={{
                        backgroundColor: '#2759a7',
                        color: '#fff',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.4rem 0.8rem',
                        cursor: 'pointer',
                        fontWeight: 500,
                        fontSize: '0.8rem',
                        fontFamily: 'Inter, sans-serif',
                        transition: 'background-color 0.2s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1f477d'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = '#2759a7'}
                    >
                      <span>View More</span>
                      <ArrowRight size={14} color="#fff" />
                    </div>
                  </div>
                </CCol>
              ));
            })()}
          </CRow>
        ) : (
          <WidgetsDropdown className="mb-4" />
        )}
      </div>

      {/* Client: simple chart of My Jobs by status; Admin/Recruiter: full charts */}
      {isClient && !clientJobsLoading && clientJobs.length > 0 && (() => {
        const statusColors = { Open: "#22c55e", Closed: "#ef4444", Paused: "#f59e0b", Placed: "#3b82f6" };
        const clientJobStatusData = [
          { name: "Open", value: clientJobs.filter((j) => (j.status || "").toLowerCase() === "open").length },
          { name: "Closed", value: clientJobs.filter((j) => (j.status || "").toLowerCase() === "closed").length },
          { name: "Paused", value: clientJobs.filter((j) => (j.status || "").toLowerCase() === "paused").length },
          {
            name: "Placed", value: clientJobs.filter((j) => {
              const status = (j.status || "").toLowerCase();
              return status === "placed" || status === "placement";
            }).length
          },
        ].filter((d) => d.value > 0);
        return (




          <CRow key="client-chart" style={{ marginTop: '1rem', marginBottom: '1.5rem' }}>
            <CCol xs={12} lg={6}>
              <CCard style={{ border: '1px solid #e0e2e5', borderRadius: '0px', minHeight: '320px' }}>
                <CCardBody style={{ padding: '0.5rem 1rem', display: 'flex', flexDirection: 'column' }}>
                  <h5 className="mb-3" style={{ fontWeight: 500 }}>My Jobs by Status</h5>

                  <div
                    className="cc-dashboard-chart"
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      flexGrow: 1,
                    }}
                  >
                    <PieChart
                      width={window.innerWidth < 768 ? 320 : 260} // much smaller on mobile
                      height={window.innerWidth < 768 ? 320 : 260}

                    >
                      <Pie
                        data={clientJobStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={window.innerWidth < 768 ? 30 : 60} // smaller inner radius
                        outerRadius={window.innerWidth < 768 ? 50 : 90} // smaller outer radius
                        paddingAngle={2}
                        dataKey="value"
                        nameKey="name"
                        label={({ name, value }) => `${name}: ${value}`}
                        style={{ marginTop: window.innerWidth < 450 ? 100 : 0 }}
                      >
                        {clientJobStatusData.map((entry) => (
                          <Cell key={entry.name} fill={statusColors[entry.name] || "#94a3b8"} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </div>

                </CCardBody>
              </CCard>
            </CCol>
          </CRow>








        );
      })()}

      {/* Responsive Charts Row - hidden for Client */}
      {!isClient && (
        <CRow className="align-items-stretch chart-row" style={{ marginTop: "20px", marginLeft: 0, marginRight: 0 }}>
          {/* Jobs Overview - full width for Recruiter, 8 cols for Admin */}
          <CCol xs={12} sm={role === "Admin" ? 6 : 12} md={role === ("Admin") ? 8 : 12} lg={role === ("Admin") ? 8 : 12}
            style={{ paddingLeft: role === "Admin" ? "0.5rem" : "1.5rem", paddingRight: "0.5rem", marginBottom: "20px" }}>
            <CCard
              className="jobs-overview-card"
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e0e2e5ff", // light grey border
                borderRadius: "0px",      // slightly square
                boxShadow: "none",
                height: "420px"
              }}
            >
              <CCardBody style={{ height: "100%", padding: "0.5rem 1rem", display: "flex", flexDirection: "column" }}>
                <h5 className="card-title mb-2" style={{ fontWeight: 500 }}>
                  Jobs Overview
                </h5>

                {/**              <div className="jobs-overview-chart" 
                style={{ width: "100%", height: "300px", flex: "1", minHeight: "300px", 
                position: "relative", overflow: "visible" }}>  */}

                <div
                  className="jobs-overview-chart chart-container"
                  style={{
                    width: "100%",
                    overflowX: "auto",
                    overflowY: "hidden",
                    boxSizing: "border-box"
                  }}
                >

                  <AreaChart
                    width={700}
                    height={role === "Admin" ? 300 : 350}
                    data={trafficData}
                    margin={{
                      top: 20,
                      right: 20,
                      left:
                        role !== "Admin" && window.innerWidth > 750
                          ? 70
                          : 0,
                      bottom: 0,
                    }}
                    className="jobs-overview-area-chart"
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
                    <XAxis dataKey="month" tick={{ fill: "#555", fontSize: 12 }} className="chart-xaxis" />
                    <YAxis tick={{ fill: "#9f9f9fff", fontSize: 12 }} className="chart-yaxis" />
                    <Tooltip wrapperStyle={{ fontSize: "0.85rem" }} />
                    <Legend
                      className="chart-legend"
                      wrapperStyle={{
                        flexWrap: "wrap",
                        justifyContent: "center",
                        marginTop: 10,
                        maxWidth: "100%"
                      }}
                    />

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


                  {loading && (
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#9ca3af",
                        fontSize: "0.9rem",
                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                        zIndex: 1,
                      }}
                    >
                      Loading job overview…
                    </div>
                  )}


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

          {/* Stats/Weekly Submissions - right (Admin only) */}
          {role === "Admin" && (
            <CCol xs={12} sm={6} md={4} lg={4} style={{ paddingLeft: "0.5rem", paddingRight: "0.5rem", marginBottom: "20px" }}>
              <CCard
                className="weekly-postings-card"
                style={{
                  backgroundColor: "#ffffffff",
                  border: "1px solid #e0e2e5ff", // light grey border
                  borderRadius: "1px",      // slightly square
                  boxShadow: "none",
                  height: "420px"
                }}
              >
                <CCardBody style={{ height: "100%", padding: "0.5rem 1rem", display: "flex", flexDirection: "column" }}>
                  <h5 className="card-title mb-3" style={{ fontWeight: 500 }}>Weekly Postings</h5>
                  {/*}  <div className="weekly-postings-chart" 
                  style={{ width: "100%", height: "calc(100% - 2.5rem)", marginTop: "10px", flex: "1", minHeight: "300px", position: "relative", overflow: "visible" }}>
                   */}

                  <div className="weekly-postings-chart chart-container" style={{ marginTop: "10px", overflowX: "auto" }}>
                    <BarChart
                      width={420}
                      height={300}
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
                  </div>
                </CCardBody>
              </CCard>
            </CCol>
          )}

        </CRow >
      )}

      {/* Recent Activity + Stats - Admin only */}
      {
        role === "Admin" && (
          <>
            <div className="px-2" style={{ marginTop: "0.5rem" }}>
              <CRow className="mb-4 gx-3 gy-3 align-items-stretch">

                {/* --- Recent Activity --- */}
                <CCol xs={12} lg={6} className="d-flex">
                  <CCard

                    style={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e0e2e5ff",
                      borderRadius: "1px",
                      fontFamily: "Inter, sans-serif",
                      fontSize: "10px",
                      marginTop: "0", // fix top alignment
                      flexGrow: 1,
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
                {/* --- Weekly Hiring Metrics --- (Admin only) */}
                <CCol xs={12} lg={6} className="d-flex">
                  <CCard
                    className="flex-grow-1"
                    style={{
                      backgroundColor: "#ffffff",
                      border: "0.8px solid #e0e2e5ff",
                      borderRadius: "0px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      minHeight: "320px",
                    }}
                  >
                    <CCardBody
                      className="d-flex flex-column"
                      style={{
                        padding: "1.75rem 1.25rem",
                        justifyContent: "space-between",
                        width: "100%",
                      }}
                    >
                      <h5
                        className="card-title mb-3"
                        style={{ textAlign: "center", fontSize: "1.05rem", fontWeight: 600 }}
                      >
                        Time to Hire (Weekly)
                      </h5>

                      <div
                        className="flex-grow-1 d-flex justify-content-center align-items-center"
                        style={{ marginTop: "40px", overflowX: "auto" }}
                      >
                        <LineChart
                          width={460}
                          height={260}
                          data={timeToFillData.length > 0 ? timeToFillData : [
                            { day: 'Week 1', value: 2 },
                            { day: 'Week 2', value: 3 },
                            { day: 'Week 3', value: 2 },
                            { day: 'Week 4', value: 2.8 },
                            { day: 'Week 5', value: 2 },
                            { day: 'Week 6', value: 4 },
                            { day: 'Week 7', value: 2 },
                          ]}
                          margin={{ top: 20, right: 40, left: 40, bottom: 40 }}
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
                            formatter={(value, _name, props) => {
                              const placements = props?.payload?.jobs ?? 0;
                              return [
                                `${value} days · ${placements} placement${placements === 1 ? "" : "s"}`,
                                "Turn Around",
                              ];
                            }}

                            contentStyle={{
                              borderRadius: "6px",
                              backgroundColor: "rgba(255,255,255,0.99)",
                              boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
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
                      </div>
                    </CCardBody>
                  </CCard>
                </CCol>







              </CRow>
            </div>
          </>
        )
      }

      {/* Job Status and Candidate Status - hidden for Client */}
      {
        !isClient && (
          <CRow className="mb-4 gx-3 gy-3 align-items-stretch">

            <CRow className="mb-4 gx-3 gy-3 align-items-stretch" style={{ marginTop: "1.5rem" }}>




              {/* --- Job Status Snapshot (Side-by-Side Bars with Legend) --- */}
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
                    <h5
                      style={{
                        marginBottom: '0.5rem',
                        fontWeight: 600,
                        textAlign: 'center',
                      }}
                    >
                      Job Status
                    </h5>

                    {/* Summary Row */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '1.5rem',
                        marginBottom: '18px',
                        flexWrap: 'wrap',
                        fontSize: '0.85rem',
                        color: '#4b5563',
                      }}
                    >
                      <span>
                        Total: <strong>{jobs.length}</strong>
                      </span>
                      <span>
                        Open:{' '}
                        <strong>
                          {jobs.filter((j) => (j.status || '').toLowerCase() === 'open').length}
                        </strong>
                      </span>
                      <span>
                        Closed:{' '}
                        <strong>
                          {jobs.filter((j) => (j.status || '').toLowerCase() === 'closed').length}
                        </strong>
                      </span>
                    </div>

                    {/* Centered Fixed-Width Chart */}
                    <div
                      style={{
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                      }}
                    >
                      <BarChart
                        width={620}   // ⬅ Increased width to spread inside card
                        height={320}
                        data={jobStatusBarData}
                        margin={{ top: 20, right: 40, left: 40, bottom: 20 }}
                        barCategoryGap="25%"
                      >
                        <CartesianGrid stroke="#e0e2e5" strokeDasharray="2 2" />
                        <XAxis dataKey="status" axisLine={false} tickLine={false} />
                        <YAxis allowDecimals={false} tick={false} axisLine={false} />
                        <Tooltip
                          cursor={false}
                          formatter={(value) => [
                            `${value} job${value === 1 ? '' : 's'}`,
                            'Count',
                          ]}
                        />
                        <Bar
                          dataKey="count"
                          fill="#5cdbd3"
                          barSize={70}   // ⬅ Wider bars
                          radius={[8, 8, 0, 0]}
                        />
                      </BarChart>
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
                  {/* <CCardBody
                    className="d-flex flex-column"
                    style={{ padding: "1.5rem 1rem", justifyContent: "center" }}
                  > */}

                  <CCardBody
                    className="d-flex flex-column"
                    style={{ padding: "1rem", justifyContent: "center", minHeight: "320px" }}
                  >

                    <h5
                      className="card-title mb-3 text-center"
                      style={{ fontSize: "1.4rem", fontWeight: 600 }}
                    >
                      Candidate Status
                    </h5>

                    {/* Pie chart */}
                    <div
                      className="candidate-pie-container"
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginTop: '4px',
                        marginBottom: '8px',
                      }}
                    >
                      {candidateStatusData.length > 0 ? (
                        <div
                          style={{
                            width: '100%',
                            maxWidth: 260,
                            height: 220,
                          }}
                        >
                          <PieChart width={260} height={220}>
                            <Pie
                              data={candidateStatusData}
                              cx="50%"
                              cy="50%"
                              innerRadius="45%"
                              outerRadius="80%"
                              paddingAngle={0}
                              dataKey="value"
                              labelLine={true} // show the line
                              label={(props) => {
                                const { cx, cy, midAngle, outerRadius, percent, name, value } = props;
                                const RADIAN = Math.PI / 180;
                                const radius = outerRadius + 15; // distance from pie for label
                                const x = cx + radius * Math.cos(-midAngle * RADIAN);
                                const y = cy + radius * Math.sin(-midAngle * RADIAN);
                                const textAnchor = x > cx ? 'start' : 'end'; // align left/right depending on side

                                return (
                                  <text
                                    x={x}
                                    y={y}
                                    fill="#333"
                                    fontSize={10} // smaller text
                                    textAnchor={textAnchor}
                                    dominantBaseline="central"
                                  >
                                    {`${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                                  </text>
                                );
                              }}
                            >
                              {candidateStatusData.map((entry, index) => {
                                const statusColors = {
                                  Placed: "#4a90e2",
                                  Sourced: "#50c878",
                                  Shortlisted: "#fbbc04",
                                  Interviewing: "#9b59b6",
                                  Offered: "#1abc9c",
                                  Rejected: "#e74c3c",

                                  Submitted: "#14d3e0",
                                };
                                return <Cell key={index} fill={statusColors[entry.name] || "#ccc"} />;
                              })}
                            </Pie>
                            <Tooltip formatter={(value) => [`${value}`, "Candidates"]} />
                          </PieChart>


                        </div>
                      ) : (
                        <p style={{ textAlign: "center" }}>Loading candidate data…</p>
                      )}
                    </div>

                    {/* Legend / info stays inside card, centered and wrapping */}
                    <div
                      className="candidate-indicators"
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        marginTop: '2px',
                        flexWrap: 'wrap',
                        padding: '0 6px 4px',
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

                        // Calculate percentage for circular progress
                        const total = candidateStatusData.reduce(
                          (sum, d) => sum + (d.value || 0),
                          0
                        );
                        const percentage =
                          total > 0 ? ((item.value || 0) / total) * 100 : 0;
                        const radius = 8;
                        const circumference = 2 * Math.PI * radius;
                        const offset = circumference - (percentage / 100) * circumference;

                        return (
                          <div
                            key={idx}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '0.7rem',
                            }}
                          >
                            <div style={{ position: 'relative', width: '20px', height: '20px' }}>
                              <svg width="20" height="20" style={{ transform: 'rotate(-90deg)' }}>
                                {/* Background circle */}
                                <circle
                                  cx="10"
                                  cy="10"
                                  r={radius}
                                  fill="none"
                                  stroke="#e5e7eb"
                                  strokeWidth="3"
                                />
                                {/* Animated progress circle */}
                                <circle
                                  cx="10"
                                  cy="10"
                                  r={radius}
                                  fill="none"
                                  stroke={statusColors[item.name] || "#ccc"}
                                  strokeWidth="3"
                                  strokeDasharray={circumference}
                                  strokeDashoffset={offset}
                                  strokeLinecap="round"
                                  style={{
                                    transition: 'stroke-dashoffset 1s ease-in-out',
                                  }}
                                />
                              </svg>
                              {/* Center dot */}
                              <div
                                style={{
                                  position: 'absolute',
                                  top: '50%',
                                  left: '50%',
                                  transform: 'translate(-50%, -50%)',
                                  width: '8px',
                                  height: '8px',
                                  backgroundColor: statusColors[item.name] || "#ccc",
                                  borderRadius: '50%',
                                }}
                              />
                            </div>
                            <span style={{ fontSize: '0.75rem', color: '#555' }}>
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
        )
      }



      {/* Alerts Section - Hidden for Clients */}
      {
        !isClient && alerts.length > 0 && (
          <div style={{ marginTop: "1.5rem", fontFamily: "Inter, sans-serif", padding: "0 1rem" }}>
            <CCard style={{ backgroundColor: "#ffffff", border: "1px solid #e0e2e5ff", borderRadius: "0px" }}>
              <CCardBody style={{ padding: "1.5rem 1rem" }}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 style={{ color: "#333", fontWeight: 500, fontSize: "0.98rem", margin: 0 }}>
                    Alerts
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
                        onClick={() => {
                          if (alert.type === 'unassigned' && alert.jobId) {
                            navigate('/jobs', { state: { highlightJobId: alert.jobId } });
                          }
                        }}
                        style={{
                          width: "280px",
                          height: "150px",
                          backgroundColor: "#ffffff",
                          borderLeft: `4px solid #2563eb`,
                          borderRadius: "0px",
                          padding: "0.75rem 1rem",
                          cursor: alert.type === 'unassigned' && alert.jobId ? "pointer" : "default",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                          boxShadow: "0 2px 6px rgba(15, 23, 42, 0.08)",
                          transition: "transform 0.2s ease, box-shadow 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-2px)";
                          e.currentTarget.style.boxShadow = "0 6px 14px rgba(15, 23, 42, 0.16)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow = "0 2px 6px rgba(15, 23, 42, 0.08)";
                        }}
                      >
                        <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "#333", marginBottom: "0.5rem" }}>
                          {alert.title}
                        </div>
                        {alert.type === 'unassigned' && alert.jobTitle ? (
                          <>
                            <div style={{ fontSize: "0.8rem", color: "#1f2937", fontWeight: 500, marginBottom: "0.3rem", lineHeight: "1.3" }}>
                              {alert.jobTitle}
                            </div>
                            <div style={{ fontSize: "0.7rem", color: "#555", marginBottom: "0.2rem" }}>
                              Created by: <span style={{ fontWeight: 500 }}>{alert.createdBy || 'Unknown'}</span>
                            </div>
                            <div style={{ fontSize: "0.7rem", color: "#555", marginBottom: "0.3rem" }}>
                              Date: <span style={{ fontWeight: 500 }}>{alert.createdDate || alert.detail}</span>
                            </div>
                            <div style={{ fontSize: "0.65rem", color: "#3b82f6", fontWeight: 500, marginTop: "auto" }}>
                              Click to view job →
                            </div>
                          </>
                        ) : (
                          <>
                            <div style={{ fontSize: "0.8rem", color: "#555", marginBottom: "0.15rem" }}>
                              {alert.text}
                            </div>
                            <div style={{ fontSize: "0.7rem", color: "#777" }}>
                              {alert.detail}
                            </div>
                          </>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CCardBody>
            </CCard>
          </div>
        )
      }

      {/* Users Table - Admin only */}
      {
        role === "Admin" && (
          <div style={{ marginTop: "2rem", fontFamily: "Inter, sans-serif", padding: "0 1rem" }}>
            <CCard
              style={{
                background: '#ffffff',
                padding: '2rem 1rem',
                border: '1px solid #d4d5d6ff',
                borderRadius: '0px',
                boxShadow: 'none',
              }}
            >
              <CCardBody style={{ padding: '1rem' }}>
                {/* Heading */}
                <h5 style={{ fontWeight: 500, marginTop: '-0.5rem', marginBottom: '1rem', textAlign: 'left' }}>Logged in users</h5>

                {/* Table */}
                <div
                  className="table-scroll"
                  style={{
                    overflowX: 'auto',
                    overflowY: 'auto',
                    maxHeight: '500px',
                    width: '100%',
                    WebkitOverflowScrolling: 'touch',
                  }}
                >
                  <CTable
                    className="align-middle"
                    style={{
                      borderCollapse: 'collapse',
                      border: '1px solid #d1d5db',
                      fontSize: 'clamp(0.7rem, 1.5vw, 0.9rem)',
                      whiteSpace: 'nowrap',
                      tableLayout: 'auto',
                    }}
                  >
                    {/* Table Head */}
                    <CTableHead color="light" style={{ borderBottom: '2px solid #d1d5db' }}>
                      <CTableRow style={{ fontSize: '0.85rem' }}>
                        <CTableHeaderCell style={{ border: '1px solid #d1d5db', padding: '0.75rem' }}>User</CTableHeaderCell>
                        <CTableHeaderCell style={{ border: '1px solid #d1d5db', padding: '0.75rem' }}>Email</CTableHeaderCell>
                        <CTableHeaderCell style={{ border: '1px solid #d1d5db', padding: '0.75rem' }}>Logged in</CTableHeaderCell>
                        <CTableHeaderCell style={{ border: '1px solid #d1d5db', padding: '0.75rem' }}>Date</CTableHeaderCell>
                        <CTableHeaderCell style={{ border: '1px solid #d1d5db', padding: '0.75rem' }}>Role</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>

                    {/* Table Body */}
                    <CTableBody>
                      {users.length === 0 ? (
                        <CTableRow>
                          <CTableDataCell colSpan="5" className="text-center text-muted" style={{ border: '1px solid #d1d5db', padding: '0.75rem', fontSize: '0.75rem' }}>
                            No users currently logged in.
                          </CTableDataCell>
                        </CTableRow>
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
                            <CTableRow
                              key={index}
                              style={{
                                backgroundColor: '#fff',
                                fontSize: '0.85rem',
                              }}
                            >
                              <CTableDataCell style={{ border: '1px solid #d1d5db', padding: '0.75rem', fontWeight: 500, color: '#0F172A' }}>
                                {user.name}
                              </CTableDataCell>
                              <CTableDataCell style={{ border: '1px solid #d1d5db', padding: '0.75rem', color: '#374151', wordBreak: 'break-word' }}>
                                {user.email}
                              </CTableDataCell>
                              <CTableDataCell style={{ border: '1px solid #d1d5db', padding: '0.75rem', color: '#4B5563' }}>
                                {time}
                              </CTableDataCell>
                              <CTableDataCell style={{ border: '1px solid #d1d5db', padding: '0.75rem', color: '#4B5563' }}>
                                {date}
                              </CTableDataCell>
                              <CTableDataCell style={{ border: '1px solid #d1d5db', padding: '0.75rem', fontWeight: 500, color: '#1E3A8A' }}>
                                {user.role}
                              </CTableDataCell>
                            </CTableRow>
                          );
                        })
                      )}
                    </CTableBody>
                  </CTable>
                </div>
              </CCardBody>
            </CCard>
          </div>
        )
      }

    </>
  );
};


export default Dashboard;