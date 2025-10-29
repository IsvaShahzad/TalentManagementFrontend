  import React, { useState, useEffect } from "react";
  import { ToastContainer, toast } from 'react-toastify';
  import 'react-toastify/dist/ReactToastify.css';
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
    CartesianGrid,
    BarChart,
    Bar,
    Legend,
  } from "recharts";

  import WidgetsDropdown from "../widgets/WidgetsDropdown";
  import "../widgets/WidgetStyles.css";


  import { useLocation } from "react-router-dom"; // ✅ Import useLocation

  const Dashboard = () => {
    const location = useLocation(); // ✅ get state from navigation

    const progressExample = [
      { title: "Placed", value: "0 Jobs", percent: 30, color: "success" },
      { title: "Pending", value: "0 Jobs", percent: 30, color: "warning" },
      { title: "Completed", value: "0 Jobs", percent: 80, color: "info" },
    ];

    const candidateStatusData = [
      { name: "Shortlisted", value: 20 },
      { name: "Placed", value: 20 },
      { name: "Waiting", value: 15 },
    ];

    const role = localStorage.getItem("role");



    useEffect(() => {
    const showToast = localStorage.getItem("showLoginToast");
    const role = localStorage.getItem("loggedInRole");

    if (showToast === "true") {
      toast.success(
        `Logged in successfully as ${role || "User"}`, // 🎯 role included
        {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        }
      );


   localStorage.removeItem("showLoginToast");
      localStorage.removeItem("loggedInRole");
    }
  }, []);
  
    const COLORS = ["#7DADE0", "#5f9fe7ff", "#447BBF"];

    const [trafficData, setTrafficData] = useState([
      { month: "Jan", Placed: 300, Pending: 150, Completed: 300 },
      { month: "Feb", Placed: 500, Pending: 100, Completed: 220 },
      { month: "Mar", Placed: 350, Pending: 180, Completed: 140 },
      { month: "Apr", Placed: 600, Pending: 120, Completed: 260 },
      { month: "May", Placed: 1000, Pending: 160, Completed: 500 },
      { month: "Jun", Placed: 700, Pending: 90, Completed: 310 },
      { month: "Jul", Placed: 480, Pending: 140, Completed: 230 },
      { month: "Aug", Placed: 650, Pending: 110, Completed: 280 },
      { month: "Sep", Placed: 1000, Pending: 180, Completed: 190 },
      { month: "Oct", Placed: 720, Pending: 130, Completed: 300 },
      { month: "Nov", Placed: 530, Pending: 200, Completed: 250 },
      { month: "Dec", Placed: 780, Pending: 100, Completed: 500 },
    ]);

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
      // Slight delay to ensure localStorage is updated after login
      setTimeout(() => {
        const showLoginToast = localStorage.getItem("showLoginToast");
        const role = localStorage.getItem("role") || "User";

        if (showLoginToast === "true") {
          toast.success(`Logged in as ${role}`, { autoClose: 3000 });
          localStorage.removeItem("showLoginToast");
          localStorage.removeItem("role");
        }
      }, 100);
    }, []);

    

    // ✅ Login toast using navigation state
    useEffect(() => {
      if (location.state?.showLoginToast) {
        toast.success(`Logged in as ${location.state.role || "User"}`, { autoClose: 3000 });
      }
    }, [location.state]);


    useEffect(() => {
      const totalPlaced = trafficData.reduce((sum, item) => sum + item.Placed, 0);
      const totalPending = trafficData.reduce((sum, item) => sum + item.Pending, 0);
      const totalCompleted = trafficData.reduce((sum, item) => sum + item.Completed, 0);

      const updatedProgress = progressExample.map((item) => {
        switch (item.title) {
          case "Placed":
            return { ...item, value: `${totalPlaced} Jobs` };
          case "Pending":
            return { ...item, value: `${totalPending} Jobs` };
          case "Completed":
            return { ...item, value: `${totalCompleted} Jobs` };
          default:
            return item;
        }
      });
      setProgressData(updatedProgress);
    }, [trafficData]);

    return (
      <>
        <ToastContainer position="top-right" autoClose={3000} /> {/* ✅ ToastContainer */}

        <div className="px-2">
          <WidgetsDropdown className="mb-4" />
        </div>

        {/* Responsive Charts Row */}
        <div className="px-2">
    <CRow className=" align-items-stretch">

            {/* Traffic Card */}
            <CCol xs={12} lg={8}>
              <CCard
                className="card-elevated"
                style={{
                  backgroundColor: "#ffffff",
                  border: "none",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
                  height: "100%",
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '12px'
                  
                }}
              >
                <CCardBody style={{ backgroundColor: "#ffffff" }}>
                  <CRow>
                    <CCol sm={8}>
                      <h4 className="card-title mb-0">Jobs Overview</h4>
                      <div className="small text-body-secondary">January - December</div>
                    </CCol>
                    <CCol sm={4} className="text-end">
                      <CButton color="primary">
                        <CIcon icon={cilCloudDownload} />
                      </CButton>
                    </CCol>
                  </CRow>

                  <div style={{ marginTop: "1.5rem", width: "100%", height: "320px" }}>
                    <ResponsiveContainer>
                      <AreaChart data={trafficData}>
                        <defs>
                          <linearGradient id="colorPlaced" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#5390d2ff" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#5390d2ff" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#FFC107" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#FFC107" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00BCD4" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#00BCD4" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="Placed"
                          stroke="#4CAF50"
                          strokeWidth={1}
                          strokeOpacity={0.3}
                          fill="url(#colorPlaced)"
                          activeDot={{ r: 6, fill: '#4CAF50', stroke: '#fff', strokeWidth: 2 }}
                        />
                        <Area
                          type="monotone"
                          dataKey="Pending"
                          stroke="#FFC107"
                          strokeWidth={1}
                          strokeOpacity={0.3}
                          fill="url(#colorPending)"
                          activeDot={{ r: 6, fill: '#FFC107', stroke: '#fff', strokeWidth: 2 }}
                        />
                        <Area
                          type="monotone"
                          dataKey="Completed"
                          stroke="#00BCD4"
                          strokeWidth={1}
                          strokeOpacity={0.3}
                          fill="url(#colorCompleted)"
                          activeDot={{ r: 6, fill: '#4CAF50', stroke: '#fff', strokeWidth: 2 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CCardBody>
              </CCard>
            </CCol>

            {/* Analytics Card */}
            <CCol xs={12} lg={4}>
              <CCard
                className="card-elevated text-center"
                style={{
                  backgroundColor: "#ffffff",
                  border: "none",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
                  height: "100%",
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '15px'
                }}
              >
                <CCardBody style={{ backgroundColor: "#ffffff", padding: "1.5rem 1rem" }}>
                  <h4
                    className="card-title mb-2"
                    style={{ color: "#111111", fontWeight: 500, fontSize: "1.rem", fontFamily: 'Inter, sans-serif', }}
                  >
                    Analytics
                  </h4>
                  <div
                    className="small text-body-secondary mb-3"
                    style={{
                      fontSize: "0.9rem",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      fontFamily: 'Inter, sans-serif',
                    }}
                  >
                    Candidate Status Distribution
                  </div>

                  <div
                    style={{
                      width: "100%",
                      height: "280px",
                      marginTop: "0.5rem",
                    }}
                  >
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart margin={{ top: 10, bottom: 10 }}>
                        <Pie
                          data={candidateStatusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={80}
                          paddingAngle={6}
                          dataKey="value"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {candidateStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            borderRadius: "10px",
                            backgroundColor: "rgba(255, 255, 255, 0.95)",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CCardBody>
              </CCard>
            </CCol>

          </CRow>
        </div>
        {/* Recent Activity + Stats Side by Side */}
        <div className="px-2" style={{ marginTop: "3.5rem" }}>
          <CRow className="mb-4 gx-3 gy-3 align-items-stretch">
            {/* Recent Activity */}
            <CCol xs={12} lg={6}>
              <CCard
                className="card-elevated"
                style={{
                  backgroundColor: "#ffffff",
                  border: "none",
                  borderRadius: "16px",
                  boxShadow: "0 6px 16px rgba(0,0,0,0.1)",
                  marginTop: "-15px",
                  height: "100%",
                  fontFamily: 'Inter, sans-serif',

                }}
              >
                <CCardBody
                  style={{
                    backgroundColor: "#ffffff",
                    padding: "1.5rem 1.5rem 0.5rem 1.5rem",
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5
                      className="card-title mb-0"
                      style={{ color: "#333", fontWeight: "450", fontFamily: 'Inter, sans-serif',fontSize: '1.4rem' }}
                    >
                      Recent Activity
                    </h5>

                    <div className="d-flex align-items-center gap-2">
                      <small style={{ color: "#777" }}>
                        Updated on: {new Date().toLocaleString()}
                      </small>
                      <CButton
                        color="light"
                        size="sm"
                        style={{
                          borderRadius: "50%",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                          transition: "transform 0.3s ease",
                        }}
                        onClick={() => window.location.reload()}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.transform = "rotate(90deg)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.transform = "rotate(0deg)")
                        }
                      >
                        <CIcon icon={cilCloudDownload} style={{ color: "#333" }} />
                      </CButton>
                    </div>
                  </div>

                  {/* Activity List */}
                  <div className="d-flex flex-column gap-3 mt-3 mb-4">
                    {[
                      {
                        iconBg: "#e3f2fd",
                        iconColor: "#0d47a1",
                        text: "New Job Posting Added",
                        user: "Alice Johnson",
                        time: "2 mins ago",
                      },
                      {
                        iconBg: "#fff3cd",
                        iconColor: "#856404",
                        text: "Candidate Shortlisted",
                        user: "Bob Smith",
                        time: "10 mins ago",
                      },
                      {
                        iconBg: "#e8f5e9",
                        iconColor: "#1b5e20",
                        text: "System Update Completed",
                        user: "System Bot",
                        time: "30 mins ago",
                      },
                      {
                        iconBg: "#fce4ec",
                        iconColor: "#ad1457",
                        text: "New Recruiter Registered",
                        user: "Sarah Lee",
                        time: "1 hour ago",
                      },
                    ].map((activity, index) => (
                      <div
                        key={index}
                        className="d-flex align-items-center justify-content-between p-3"
                        style={{
                          backgroundColor: "#ffffff",
                          borderRadius: "12px",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                          transition: "all 0.3s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-3px)";
                          e.currentTarget.style.boxShadow =
                            "0 4px 12px rgba(0,0,0,0.08)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow =
                            "0 2px 8px rgba(0,0,0,0.05)";
                        }}
                      >
                        <div className="d-flex align-items-center gap-3">
                          <div
                            style={{
                              width: "42px",
                              height: "42px",
                              borderRadius: "10px",
                              backgroundColor: activity.iconBg,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <CIcon
                              icon={cilCloudDownload}
                              size="lg"
                              style={{ color: activity.iconColor }}
                            />
                          </div>
                          <div>
                            <div style={{ fontWeight: "600", color: "#333" }}>
                              {activity.text}
                            </div>
                            <div style={{ fontSize: "0.85rem", color: "#777" }}>
                              {activity.user}
                            </div>
                          </div>
                        </div>
                        <div
                          style={{
                            fontSize: "0.8rem",
                            color: "#999",
                          }}
                        >
                          {activity.time}
                        </div>
                      </div>
                    ))}
                  </div>
                </CCardBody>
              </CCard>
            </CCol>

            {/* Stats Section */}
            <CCol xs={12} lg={6}>
              <CCard
                className="card-elevated"
                style={{
                  backgroundColor: "#ffffff",
                  border: "none",
                  borderRadius: "16px",
                  boxShadow: "0 6px 16px rgba(0,0,0,0.1)",
                  marginTop: "-15px",
                  height: "100%",
                  textAlign: "start",
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '0.9rem'
                }}
              >
                <CCardBody style={{ backgroundColor: "#ffffff", padding: "1.5rem" }}>
                  <h5 className="mb-4" style={{ color: "#333", fontWeight: "500",fontFamily: 'Inter, sans-serif', textAlign: "start", fontSize: '1.4rem' }}>
                    Weekly Submissions
                  </h5>

                  {/* Stats Chart */}
                  <div
                    style={{
                      height: "400px",
                      marginTop: "20px",
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { name: "Mon", jobs: 12 },
                          { name: "Tue", jobs: 18 },
                          { name: "Wed", jobs: 10 },
                          { name: "Thu", jobs: 22 },
                          { name: "Fri", jobs: 15 },
                          { name: "Sat", jobs: 9 },
                          { name: "Sun", jobs: 14 },
                        ]}
                        margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
                      >
                        {/* <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" /> */}
                        <XAxis dataKey="name" stroke="#888" />
                        <YAxis stroke="#888" />
                        <Tooltip
                          cursor={{ fill: "rgba(0,0,0,0.05)" }}
                          contentStyle={{
                            backgroundColor: "#fff",
                            borderRadius: "1px",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                            border: "none",
                          }}
                        />
                        <Bar
                          dataKey="jobs"
                          barSize={60}
                          fill="#83b7daff"
                          radius={[1, 1, 0, 0]}   //less circular
                          animationDuration={1000}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CCardBody>
              </CCard>
            </CCol>


          </CRow>
        </div>

  {/* Users Table - Hidden for Clients */}
{/* Users Table - Hidden for Clients */}
{(localStorage.getItem("role")?.toLowerCase() !== "client") && (
  <CCard
    className="card-elevated"
    style={{
      background: "rgba(255, 255, 255, 0.95)",
      backdropFilter: "blur(12px)",
      border: "1px solid rgba(0,0,0,0.08)",
      borderRadius: "1px",
      width: "100%",
      marginTop: "1rem",
      fontFamily: "Inter, sans-serif",
    }}
  >
    <CCardBody style={{ backgroundColor: "#ffffff", padding: "1.8rem" }}>
      <h5
        style={{
          color: "#1F2937",
          fontWeight: "500",
          marginBottom: "2rem",
          fontSize: "1.4rem",
          letterSpacing: "0.3px",
          fontFamily: 'Inter, sans-serif'

        }}
      >
        Logged-in Users
      </h5>

      {/* Table Header */}
      <div
        className="d-flex p-2"
        style={{
          fontWeight: 600,
          borderBottom: "1px solid rgba(0,0,0,0.1)",
        }}
      >
        <div style={{ flex: 1, textAlign: "left" }}>User</div>
        <div style={{ flex: 1, textAlign: "center" }}>Login Status</div>
        <div style={{ flex: 1, textAlign: "center" }}>Role</div>
      </div>

      {/* Table Rows */}
      <div className="d-flex flex-column gap-3 mt-3">
        {users.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              color: "#6B7280",
              padding: "1rem",
            }}
          >
            No users currently logged in.
          </div>
        ) : (
          users.map((user, index) => (
            <div
              key={index}
              className="d-flex align-items-center p-3"
              style={{
                borderRadius: "1px",
                backgroundColor: "#ffffff",
                border: "1px solid rgba(0,0,0,0.05)",
                justifyContent: "space-between",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.06)", // 🌟 Subtle shadow added here
                transition: "box-shadow 0.3s ease, transform 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 6px 18px rgba(0,0,0,0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(0, 0, 0, 0.06)";
              }}
            >
              {/* Name & Email */}
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div style={{ fontWeight: 500, color: "#111827" }}>
                  {user.name}
                </div>
                <div style={{ fontSize: "0.rem", color: "#6B7280" }}>
                  {user.email}
                </div>
              </div>

              {/* Logged In */}
              <div
                style={{
                  flex: 1,
                  fontSize: "0.9rem",
                  color: "#4B5563",
                  textAlign: "center",
                }}
              >
                {user.loggedIn}
              </div>

              {/* Role */}
              <div
                style={{
                  flex: 1,
                  fontSize: "0.9rem",
                  fontWeight: 500,
                  textAlign: "center",
                  color: "#000000ff",
                }}
              >
                {user.role}
              </div>
            </div>
          ))
        )}
      </div>
    </CCardBody>
  </CCard>
)}






      </>
    );
  };


  export default Dashboard;