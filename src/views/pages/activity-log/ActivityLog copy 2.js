import React, { useEffect, useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CSpinner,
  CBadge,
} from '@coreui/react'
import {
  CButton,
  CTable,
  CTableBody,
  CTableHead,
  CTableRow,
  CTableDataCell,
  CTableHeaderCell
} from '@coreui/react'

import CIcon from '@coreui/icons-react'
import { cilCloudDownload } from '@coreui/icons'
import {
  fetchLoginActivitiesApi,
  getCandidateStatusHistoryApi,
  getUsersByRoleApi,
  getAllCandidates,
} from '../../../api/api'
import { useAuth } from "../../../context/AuthContext";
/* ---------------- UI STYLE SYSTEM ---------------- */
const ui = {
  title: { fontSize: '0.9rem', fontWeight: 600, color: '#111827' },
  text: { fontSize: '0.85rem', color: '#111827' },
  subText: { fontSize: '0.75rem', color: '#6B7280' },
  muted: { fontSize: '0.75rem', color: '#9CA3AF' },
  number: { fontSize: '1.5rem', fontWeight: 700, color: '#111827' },
}



/* ---------------- UTIL ---------------- */
const formatWhen = (iso) => {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString()
}

const ActivityLog = () => {
  const [loading, setLoading] = useState(true)
  const [loadingActivity, setLoadingActivity] = useState(false)

  const [recruiterMetrics, setRecruiterMetrics] = useState({
    added: 0,
    recent: [],
  })
  const {
    role: authRole,
    isClient,
    user: authUser,
    isAuthenticated,
    token: authToken,
  } = useAuth();
  const [statusChanges, setStatusChanges] = useState([])
  const [loggedInUsers, setLoggedInUsers] = useState([])
  const [recentActivity, setRecentActivity] = useState([])
  const [users, setUsers] = useState([]);
  /* ---------------- LOGGED IN USERS ---------------- */
  const getLoggedInUsers = async () => {
    try {
      const loginsRes = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/user/login/all`,
      );
      const loginsData = await loginsRes.json();
      if (!Array.isArray(loginsData)) return toast.error("Invalid login data");

      const logoutsRes = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/user/logout/all`,
      );
      const logoutsData = await logoutsRes.json();
      if (!Array.isArray(logoutsData))
        return toast.error("Invalid logout data");

      const usersMap = {};

      // Process logins: keep latest login per user
      loginsData.forEach((login) => {
        const userId = login.userId;
        const loginTime = new Date(login.occurredAt);
        if (
          !usersMap[userId] ||
          loginTime > new Date(usersMap[userId].loggedIn)
        ) {
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
          if (
            !usersMap[userId].loggedOut ||
            logoutTime > new Date(usersMap[userId].loggedOut)
          ) {
            usersMap[userId].loggedOut = logoutTime;
          }
        }
      });

      // Convert Dates to string for display
      const usersList = Object.values(usersMap).map((user) => ({
        ...user,
        loggedIn: user.loggedIn.toLocaleString(),
        loggedOut: user.loggedOut
          ? user.loggedOut.toLocaleString()
          : "Still Logged In",
      }));

      setUsers(usersList);
    } catch (err) {
      console.error("Error fetching users:", err);
      // toast.error("Failed to fetch users");
    }
  };
  const role = authRole || localStorage.getItem("role");
  const userId = authUser?.user_id || localStorage.getItem("user_id");
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

  /* ---------------- INITIAL LOAD ---------------- */
  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      try {
        const [recruiterRes, historyRes] = await Promise.all([
          getUsersByRoleApi('Recruiter').catch(() => ({ users: [] })),
          getCandidateStatusHistoryApi(),
        ])

        if (cancelled) return

        const recruiters = recruiterRes?.users || []
        const cutoff = new Date()
        cutoff.setDate(cutoff.getDate() - 30)

        const recentRecruiters = recruiters.filter(
          (r) => new Date(r.createdAt) >= cutoff,
        )

        setRecruiterMetrics({
          added: recentRecruiters.length,
          recent: recentRecruiters.slice(0, 10),
        })

        const historyData = historyRes?.data || historyRes || []
        if (Array.isArray(historyData)) {
          setStatusChanges(historyData.slice(0, 20))
        }
      } catch (e) {
        console.error('Activity load error:', e)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  const getUserColor = (userIdentifier) => {
    if (!userIdentifier) return { bg: "#e5e7eb", color: "#6b7280" }

    let hash = 0
    for (let i = 0; i < userIdentifier.length; i++) {
      hash = userIdentifier.charCodeAt(i) + ((hash << 5) - hash)
    }

    const palette = [
      { bg: "#d1fae5", color: "#047857" },
      { bg: "#dbeafe", color: "#1e40af" },
      { bg: "#fce7f3", color: "#be185d" },
      { bg: "#fef3c7", color: "#92400e" },
    ]

    return palette[Math.abs(hash) % palette.length]
  }

  /* ---------------- LOGGED IN USERS LIVE ---------------- */
  // useEffect(() => {
  //   getLoggedInUsers()

  //   const interval = setInterval(() => {
  //     getLoggedInUsers()
  //   }, 5000)

  //   return () => clearInterval(interval)
  // }, [])

  /* ---------------- RECENT ACTIVITY ---------------- */
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
            historyData.slice(0, 15).forEach((h) => {
              const changedBy = h.changedBy || "System";
              const userColors = getUserColor(changedBy);
              activities.push({
                type: "status_change",
                iconBg: userColors.bg,
                iconColor: userColors.color,
                text: `${h.candidateName || "Candidate"}: ${h.oldStatus || "N/A"} → ${h.newStatus || "N/A"}`,
                user: changedBy,
                time: h.changedAt,
                sortTime: new Date(h.changedAt),
              });
            });
          }
        } catch (e) {
          console.error("Status history error:", e);
        }

        // 2. Recent logins
        try {
          const logins = await fetchLoginActivitiesApi();
          if (Array.isArray(logins)) {
            logins.slice(0, 10).forEach((l) => {
              const userName = l.user?.full_name || l.user?.email || "Unknown";
              const userRole = l.user?.role || "User";
              const userIdentifier =
                l.user?.email || l.user?.full_name || "Unknown";
              const userColors = getUserColor(userIdentifier);
              activities.push({
                type: "login",
                iconBg: userColors.bg,
                iconColor: userColors.color,
                text: `${userName} (${userRole}) logged in`,
                user: l.user?.email || "",
                time: l.occurredAt,
                sortTime: new Date(l.occurredAt),
              });
            });
          }
        } catch (e) {
          console.error("Logins error:", e);
        }

        // 3. Recently added candidates
        try {
          const candidates = await getAllCandidates();
          const candidatesArr = Array.isArray(candidates)
            ? candidates
            : candidates?.candidates || [];
          candidatesArr
            .slice()
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 10)
            .forEach((c) => {
              const sourcedBy = c.sourced_by_name || "Recruiter";
              const userColors = getUserColor(sourcedBy);
              activities.push({
                type: "candidate_added",
                iconBg: userColors.bg,
                iconColor: userColors.color,
                text: `Candidate added: ${c.name || c.firstName || "Unknown"}`,
                user: sourcedBy,
                time: c.created_at || c.createdAt,
                sortTime: new Date(c.created_at || c.createdAt),
              });
            });
        } catch (e) {
          console.error("Candidates error:", e);
        }

        // 4. Recent recruiters added
        try {
          const recruitersRes = await getUsersByRoleApi("Recruiter");
          const recruiters = recruitersRes?.users || [];
          recruiters
            .slice()
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5)
            .forEach((r) => {
              const adminUser = "Admin";
              const userColors = getUserColor(adminUser);
              activities.push({
                type: "recruiter_added",
                iconBg: userColors.bg,
                iconColor: userColors.color,
                text: `New Recruiter: ${r.full_name || r.email}`,
                user: adminUser,
                time: r.createdAt,
                sortTime: new Date(r.createdAt),
              });
            });
        } catch (e) {
          console.error("Recruiters error:", e);
        }

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

  /* ---------------- UI ---------------- */
  return (
    <CRow className="g-3">

      {/* RECENT ACTIVITY TABLE */}
      {/* --- Recent Activity --- */}
      <CCol xs={12} lg={6} className="d-flex"
      >
        <CCard
          // style={{
          //   backgroundColor: "#ffffff",
          //   border: "1px solid #e0e2e5ff",
          //   borderRadius: "1px",
          //   fontFamily: "Inter, sans-serif",
          //   fontSize: "10px",
          //   marginTop: "0", // fix top alignment
          //   flexGrow: 1,
          // }}
          style={{ borderRadius: '0px', width: '100%', height: '350px', overflow: 'hidden' }}

        >
          <CCardBody
          //style={{ borderRadius: '0px', width: '100%', height: '350px' }}
          //  style={{ height: 'calc(100% - 60px)', padding: '1rem', overflowY: 'auto' }}
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5
                style={{
                  color: "#333",
                  fontWeight: 450,
                  fontSize: "0.98rem",
                }}
              >
                Recent Activity
              </h5>
              <div className="d-flex align-items-center gap-2">
                <small style={{ color: "#777", fontSize: "0.7rem" }}>
                  Updated on: {new Date().toLocaleString()}
                </small>
                <CButton
                  color="light"
                  size="sm"
                  style={{
                    borderRadius: "3%",
                    boxShadow: "none",
                    padding: "0.25rem",
                    transition: "transform 0.3s",
                  }}
                  onClick={() => window.location.reload()}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.transform = "rotate(90deg)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.transform = "rotate(0deg)")
                  }
                >
                  <CIcon
                    icon={cilCloudDownload}
                    style={{
                      color: "#333",
                      width: "18px",
                      height: "18px",
                    }}
                  />
                </CButton>
              </div>
            </div>

            {/* Activity List */}
            <div
              className="d-flex flex-column gap-2 mt-3 mb-4"
              style={{
                overflowY: "auto",
                maxHeight: "50vh",
                minHeight: "250px",
              }}
            >
              {loadingActivity ? (
                <div
                  style={{
                    textAlign: "center",
                    color: "#6B7280",
                    padding: "2rem",
                  }}
                >
                  Loading recent activity...
                </div>
              ) : recentActivity.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    color: "#6B7280",
                    padding: "2rem",
                  }}
                >
                  No recent activity found.
                </div>
              ) : (
                recentActivity.map((activity, index) => {
                  // Format time ago
                  const timeAgo = (dateStr) => {
                    const date = new Date(dateStr);
                    if (isNaN(date.getTime())) return "Recently";
                    const now = new Date();
                    const diffMs = now - date;
                    const diffMins = Math.floor(diffMs / 60000);
                    const diffHours = Math.floor(diffMs / 3600000);
                    const diffDays = Math.floor(diffMs / 86400000);
                    if (diffMins < 1) return "Just now";
                    if (diffMins < 60)
                      return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
                    if (diffHours < 24)
                      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
                    if (diffDays < 7)
                      return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
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
                        e.currentTarget.style.transform =
                          "translateY(-2px)";
                        e.currentTarget.style.boxShadow =
                          "0 3px 10px rgba(0,0,0,0.08)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform =
                          "translateY(0)";
                        e.currentTarget.style.boxShadow =
                          "0 2px 6px rgba(0,0,0,0.05)";
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
                          <CIcon
                            icon={cilCloudDownload}
                            size="sm"
                            style={{ color: activity.iconColor }}
                          />
                        </div>
                        <div
                          className="text-truncate"
                          style={{ minWidth: 0 }}
                        >
                          <div
                            style={{
                              fontWeight: 600,
                              color: "#333",
                              fontSize: "0.85rem",
                              marginBottom: "0.15rem",
                            }}
                          >
                            {activity.text}
                          </div>
                          <div
                            style={{
                              fontSize: "0.7rem",
                              color: "#777",
                            }}
                          >
                            {activity.user}
                          </div>
                        </div>
                      </div>
                      <div
                        style={{
                          fontSize: "0.7rem",
                          color: "#999",
                          marginLeft: "10px",
                        }}
                      >
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
      <CCol md={6}>
        <CCard style={{ borderRadius: '0px', width: '100%', height: '350px' }}>
          <CCardHeader>
            Recent Status Changes
          </CCardHeader>
          <CCardBody style={{ height: 'calc(100% - 60px)', padding: '1rem', overflowY: 'auto' }}>
            {statusChanges.length === 0 ? (
              <div className="text-body-secondary">No status changes recorded.</div>
            ) : (
              <div className="d-flex flex-column gap-2">
                {statusChanges.map((change, idx) => (
                  <div
                    key={idx}
                    className="d-flex justify-content-between align-items-center"
                    style={{ padding: '8px', backgroundColor: '#f9fafb', borderRadius: 4 }}
                  >
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{change.candidateName || 'Candidate'}</div>
                      <div style={{ fontSize: 12, color: '#666' }}>
                        <CBadge color="secondary" style={{ fontSize: 10 }}>{change.oldStatus || 'N/A'}</CBadge>
                        <span className="mx-1">→</span>
                        <CBadge color="primary" style={{ fontSize: 10 }}>{change.newStatus || 'N/A'}</CBadge>
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: '#999' }}>{formatWhen(change.changedAt)}</div>
                  </div>
                ))}
              </div>
            )}
          </CCardBody>
        </CCard>
      </CCol>
      {/* LOGGED IN USERS */}
      {/* <CCol md={6}>
        <CCard style={{ height: '500px' }}>
          <CCardHeader>
            <strong style={ui.title}>Currently Logged-in Users</strong>
          </CCardHeader>

          <CCardBody style={{ overflowY: 'auto' }}>
            {loggedInUsers.length === 0 ? (
              <div style={ui.muted}>No active users</div>
            ) : (
              <div className="d-flex flex-column gap-2">
                {loggedInUsers.map((u, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: 10,
                      background: '#f9fafb',
                      borderRadius: 8,
                    }}
                  >
                    <div style={ui.title}>{u.name}</div>
                    <div style={ui.subText}>
                      {u.email} • {u.role}
                    </div>

                    <div
                      style={{
                        marginTop: 6,
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '0.75rem',
                        color: '#6B7280',
                      }}
                    >
                      <span>Login: {u.loggedIn}</span>
                      <span>Logout: {u.loggedOut}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CCardBody>
        </CCard>
      </CCol> */}
      <div
        style={{
          marginTop: "2rem",
          fontFamily: "Inter, sans-serif",
          padding: "0 1rem",
        }}
      >
        <CCard
          style={{
            background: "#ffffff",
            padding: "2rem 1rem",
            border: "1px solid #d4d5d6ff",
            borderRadius: "0px",
            boxShadow: "none",
          }}
        >
          <CCardBody style={{ padding: "1rem" }}>
            {/* Heading */}
            <h5
              style={{
                fontWeight: 500,
                marginTop: "-0.5rem",
                marginBottom: "1rem",
                textAlign: "left",
              }}
            >
              Logged in users
            </h5>

            {/* Table */}
            <div
              className="table-scroll"
              style={{
                overflowX: "auto",
                overflowY: "auto",
                maxHeight: "500px",
                width: "100%",
                WebkitOverflowScrolling: "touch",
              }}
            >
              <CTable
                className="align-middle"
                style={{
                  borderCollapse: "collapse",
                  border: "1px solid #d1d5db",
                  fontSize: "clamp(0.7rem, 1.5vw, 0.9rem)",
                  whiteSpace: "nowrap",
                  tableLayout: "auto",
                }}
              >
                {/* Table Head */}
                <CTableHead
                  color="light"
                  style={{ borderBottom: "2px solid #d1d5db" }}
                >
                  <CTableRow style={{ fontSize: "0.85rem" }}>
                    <CTableHeaderCell
                      style={{
                        border: "1px solid #d1d5db",
                        padding: "0.75rem",
                      }}
                    >
                      User
                    </CTableHeaderCell>
                    <CTableHeaderCell
                      style={{
                        border: "1px solid #d1d5db",
                        padding: "0.75rem",
                      }}
                    >
                      Email
                    </CTableHeaderCell>
                    <CTableHeaderCell
                      style={{
                        border: "1px solid #d1d5db",
                        padding: "0.75rem",
                      }}
                    >
                      Logged in
                    </CTableHeaderCell>
                    <CTableHeaderCell
                      style={{
                        border: "1px solid #d1d5db",
                        padding: "0.75rem",
                      }}
                    >
                      Date
                    </CTableHeaderCell>
                    <CTableHeaderCell
                      style={{
                        border: "1px solid #d1d5db",
                        padding: "0.75rem",
                      }}
                    >
                      Role
                    </CTableHeaderCell>
                  </CTableRow>
                </CTableHead>

                {/* Table Body */}
                <CTableBody>
                  {users.length === 0 ? (
                    <CTableRow>
                      <CTableDataCell
                        colSpan="5"
                        className="text-center text-muted"
                        style={{
                          border: "1px solid #d1d5db",
                          padding: "0.75rem",
                          fontSize: "0.75rem",
                        }}
                      >
                        No users currently logged in.
                      </CTableDataCell>
                    </CTableRow>
                  ) : (
                    users.map((user, index) => {
                      const loggedInDateObj = new Date(user.loggedIn);

                      // Date: MM/DD/YY
                      const date = loggedInDateObj.toLocaleDateString(
                        "en-US",
                        {
                          month: "2-digit",
                          day: "2-digit",
                          year: "2-digit",
                        },
                      );

                      // Time: HH:MM AM/PM
                      const time = loggedInDateObj.toLocaleTimeString(
                        "en-US",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        },
                      );

                      return (
                        <CTableRow
                          key={index}
                          style={{
                            backgroundColor: "#fff",
                            fontSize: "0.85rem",
                          }}
                        >
                          <CTableDataCell
                            style={{
                              border: "1px solid #d1d5db",
                              padding: "0.75rem",
                              fontWeight: 500,
                              color: "#0F172A",
                            }}
                          >
                            {user.name}
                          </CTableDataCell>
                          <CTableDataCell
                            style={{
                              border: "1px solid #d1d5db",
                              padding: "0.75rem",
                              color: "#374151",
                              wordBreak: "break-word",
                            }}
                          >
                            {user.email}
                          </CTableDataCell>
                          <CTableDataCell
                            style={{
                              border: "1px solid #d1d5db",
                              padding: "0.75rem",
                              color: "#4B5563",
                            }}
                          >
                            {time}
                          </CTableDataCell>
                          <CTableDataCell
                            style={{
                              border: "1px solid #d1d5db",
                              padding: "0.75rem",
                              color: "#4B5563",
                            }}
                          >
                            {date}
                          </CTableDataCell>
                          <CTableDataCell
                            style={{
                              border: "1px solid #d1d5db",
                              padding: "0.75rem",
                              fontWeight: 500,
                              color: "#1E3A8A",
                            }}
                          >
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
      {/* RECRUITER ACTIVITY */}
      <CCol md={6}>
        <CCard style={{ height: '450px' }}>
          <CCardHeader>
            <strong style={ui.title}>Recruiter Activity</strong>
          </CCardHeader>

          <CCardBody>
            <div style={ui.subText}>New Recruiters</div>
            <div style={ui.number}>{recruiterMetrics.added}</div>

            <div className="mt-3 d-flex flex-column gap-2">
              {recruiterMetrics.recent.map((r, idx) => (
                <div key={idx} className="d-flex justify-content-between">
                  <span style={ui.text}>{r.full_name || r.email}</span>
                  <span style={ui.muted}>
                    {formatWhen(r.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          </CCardBody>
        </CCard>
      </CCol>

      {/* STATUS CHANGES */}
      <CCol md={6}>
        <CCard style={{ height: '450px' }}>
          <CCardHeader>
            <strong style={ui.title}>Recent Status Changes</strong>
          </CCardHeader>

          <CCardBody style={{ overflowY: 'auto' }}>
            <div className="d-flex flex-column gap-2">
              {statusChanges.map((c, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: 8,
                    background: '#f9fafb',
                    borderRadius: 8,
                  }}
                >
                  <div style={ui.text}>
                    {c.candidateName || 'Candidate'}
                  </div>

                  <div style={{ fontSize: '0.75rem' }}>
                    <CBadge color="secondary">{c.oldStatus}</CBadge>
                    <span className="mx-1">→</span>
                    <CBadge color="primary">{c.newStatus}</CBadge>
                  </div>

                  <div style={ui.muted}>
                    {formatWhen(c.changedAt)}
                  </div>
                </div>
              ))}
            </div>
          </CCardBody>
        </CCard>
      </CCol>

    </CRow>
  )
}

export default ActivityLog