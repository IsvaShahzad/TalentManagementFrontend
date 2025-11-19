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
  
    const COLORS = ["#3b91edff", "#4379d1ff", "#75a9e9ff"];

const [trafficData, setTrafficData] = useState([
  { month: "Jan", JobsPosted: 110, Filled: 75 },
  { month: "Feb", JobsPosted: 60, Filled: 90 },
  { month: "Mar", JobsPosted: 150, Filled: 100 },
  { month: "Apr", JobsPosted: 40, Filled: 95 },
  { month: "May", JobsPosted: 65, Filled: 110 },
  { month: "Jun", JobsPosted: 30, Filled: 105 },
  { month: "Jul", JobsPosted: 90, Filled: 95 },
  { month: "Aug", JobsPosted: 110, Filled: 115 },
  { month: "Sep", JobsPosted: 80, Filled: 100 },
  { month: "Oct", JobsPosted: 90, Filled: 92 },
  { month: "Nov", JobsPosted: 120, Filled: 115 },
  { month: "Dec", JobsPosted: 45, Filled: 60 },
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

        <div style={{ width: "100%", height: "calc(100% - 3rem)", marginTop: "30px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trafficData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="pageViewsColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3f90eeff" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#013cfdff" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="sessionsColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3f9cff" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#0560faff" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#e5e5e5" strokeDasharray="1 1" />
              <XAxis dataKey="month" tick={{ fill: "#555", fontSize: 12 }} />
              <YAxis tick={{ fill: "#9f9f9fff", fontSize: 12 }} />
              <Tooltip wrapperStyle={{ fontSize: "0.85rem" }} />
              <Area type="monotone" dataKey="JobsPosted" stackId="1" stroke="#1e40af" strokeWidth={1.5} fill="url(#pageViewsColor)" />
              <Area type="monotone" dataKey="Filled" stackId="1" stroke="#5784e7ff" strokeWidth={1.5} fill="url(#sessionsColor)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
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
        <h5 className="card-title mb-3" style={{ fontWeight: 500 }}>Weekly Submissions</h5>
        <div style={{ width: "100%", height: "calc(100% - 2.5rem)", marginTop: "10px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={[
                { day: "Mon", jobs: 12 },
                { day: "Tue", jobs: 18 },
                { day: "Wed", jobs: 10 },
                { day: "Thu", jobs: 22 },
                { day: "Fri", jobs: 15 },
                { day: "Sat", jobs: 9 },
                { day: "Sun", jobs: 14 },
              ]}
              margin={{ top: 10, right: 0, left: 0, bottom: 20 }}
              barGap={18}
            >
              <Bar dataKey="jobs" barSize={28} radius={[4, 4, 0, 0]}>
                {[
                  { day: "Mon", jobs: 12 },
                  { day: "Tue", jobs: 18 },
                  { day: "Wed", jobs: 10 },
                  { day: "Thu", jobs: 22 },
                  { day: "Fri", jobs: 15 },
                  { day: "Sat", jobs: 9 },
                  { day: "Sun", jobs: 14 }
                ].map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill="#3f71c2ff"
                    cursor="pointer"
                    onMouseEnter={(e) => e.target.setAttribute('fill', '#7fa3f2')}
                    onMouseLeave={(e) => e.target.setAttribute('fill', '#3f71c2ff')}
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
          border: "0.8px solid #e0e2e5ff",
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
            {[
              { iconBg: "#e3f2fd", iconColor: "#0d47a1", text: "New Job Posting Added", user: "Alice Johnson", time: "2 mins ago" },
              { iconBg: "#fff3cd", iconColor: "#856404", text: "Candidate Shortlisted", user: "Bob Smith", time: "10 mins ago" },
              { iconBg: "#e3f2fd", iconColor: "#2559baff", text: "System Update Completed", user: "System Bot", time: "30 mins ago" },
              { iconBg: "#fff3cd", iconColor: "#856404", text: "New Recruiter Registered", user: "Sarah Lee", time: "1 hour ago" },
            ].map((activity, index) => (
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
                  {activity.time}
                </div>
              </div>
            ))}
          </div>
        </CCardBody>
      </CCard>
    </CCol>

{/* --- Candidate Status (Smooth Wave Line with Months) --- */}
{/* --- Weekly Hiring Metrics --- */}
<CCol xs={12} lg={6} className="d-flex">
  <CCard className="flex-grow-1" style={{ backgroundColor: "#ffffff", border: "0.8px solid #e0e2e5ff", borderRadius: "0px"}}>
    <CCardBody className="d-flex flex-column" style={{ padding: "1.5rem 1rem", justifyContent: "space-between" }}>
      <h5 className="card-title mb-3">Time to Hire (Weekly)</h5>

      <div className="flex-grow-1 d-flex justify-content-center align-items-center">
        <ResponsiveContainer width="100%" height={250}>
          <LineChart
            data={[
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

    <ResponsiveContainer width="95%" height={300}>
  <BarChart
    data={[
      { month: 'Jan', candidates: 8, ratio: 2 },
      { month: 'Feb', candidates: 5, ratio: 1.2 },
      { month: 'Mar', candidates: 12, ratio: 3 },
      { month: 'Apr', candidates: 7, ratio: 1.8 },
      { month: 'May', candidates: 10, ratio: 2.5 },
    ]}
    margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
    barCategoryGap={25}
  >
    {/* Grid */}
    <CartesianGrid stroke="#e0e2e5" strokeDasharray="2 2" />

    {/* X & Y Axis hidden */}
    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={false} />
    <YAxis hide />

    {/* Tooltip with custom cursor */}
    <Tooltip 
      cursor={false} // <-- disables the gray hover box
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
                {item.name}: {item.value}{item.name === 'ratio' ? 'x' : ''}
              </div>
            ))}
          </div>
        );
      }}
    />

    {/* Bars with hover effect (lighten color only) */}
    <Bar 
      dataKey="candidates" 
      fill="#5cdbd3" 
      barSize={40} 
      radius={[6,6,0,0]} 
      name="Candidates"
      onMouseEnter={(e) => e.target.setAttribute('fill', '#79eee8')}
      onMouseLeave={(e) => e.target.setAttribute('fill', '#5cdbd3')}
    />
    <Bar 
      dataKey="ratio" 
      fill="#22c3b8" 
      barSize={40} 
      radius={[6,6,0,0]} 
      name="Ratio"
      onMouseEnter={(e) => e.target.setAttribute('fill', '#57d4c9')}
      onMouseLeave={(e) => e.target.setAttribute('fill', '#22c3b8')}
    />
  </BarChart>
</ResponsiveContainer>


      {/* Custom legend */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '1.5rem',
        marginTop: '10px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '10px', height: '10px', backgroundColor: '#5cdbd3', borderRadius: '1px' }} />
          <span style={{ fontSize: '0.85rem', color: '#555' }}>Candidates</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '10px', height: '10px', backgroundColor: '#22c3b8', borderRadius: '1px' }} />
          <span style={{ fontSize: '0.85rem', color: '#555' }}>Ratio</span>
        </div>
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
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={[
                { name: 'Shortlisted', value: 10 },
                { name: 'Waiting', value: 20 },
                { name: 'Placed', value: 15 },
              ]}
              cx="50%"
              cy="50%"
              innerRadius="45%"  
              outerRadius="65%"  
              paddingAngle={2}
              dataKey="value"
              labelLine={{ stroke: '#888', strokeWidth: 1, type: 'linear' }}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {['#4a90e2', '#f28c28', '#50c878'].map((color, index) => (
                <Cell key={`cell-${index}`} fill={color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: "1px",
                backgroundColor: "rgba(255,255,255,0.95)",
                boxShadow: "none",
                fontSize: "0.75rem",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Custom Legend */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
          marginTop: '10px',
        }}
      >
        {[
          { name: 'Shortlisted', color: '#4a90e2' },
          { name: 'Waiting', color: '#f28c28' },
          { name: 'Placed', color: '#50c878' },
        ].map((item, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div
              style={{
                width: '10px',
                height: '10px',
                backgroundColor: item.color,
                borderRadius: '1px',
              }}
            />
            <span style={{ fontSize: '0.85rem', color: '#555' }}>{item.name}</span>
          </div>
        ))}
      </div>
    </CCardBody>
  </CCard>
</CCol>








</CRow>









</CRow>













{/* Users Table - Hidden for Clients */}
{/* Users Table - Hidden for Clients */}
{localStorage.getItem("role")?.toLowerCase() !== "client" && (
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