// import React, { useEffect, useState } from "react";
// import { CIcon } from "@coreui/icons-react";
// import { cilBell } from "@coreui/icons";
// import { fetchNotificationsCount, markAllNotificationsAsRead } from "../../../api/api";
// function NotificationBell({ userId }) {
//     const [count, setCount] = useState(0);

//     useEffect(() => {
//         if (!userId) return;

//         const getCount = async () => {
//             try {
//                 const data = await fetchNotificationsCount(userId);
//                 setCount(data); // ✅ Update state
//             } catch (err) {
//                 console.error("Failed to fetch notifications count:", err);
//             }
//         };

//         getCount(); // Initial fetch

//         // Refresh every 30 seconds
//         const interval = setInterval(getCount, 30000);

//         return () => clearInterval(interval); // Cleanup
//     }, [userId]);


//     const handleBellClick = async () => {
//         try {
//             await markAllNotificationsAsRead(userId);
//             setCount(0); // reset and hide badge
//         } catch (err) {
//             console.error("Failed to mark notifications as read:", err);
//         }
//     };

//     return (
//         <div className="relative cursor-pointer"
//             onClick={handleBellClick}
//         >
//             <CIcon icon={cilBell} size="xl" />
//             {count > 0 && (
//                 <span
//                     style={{
//                         position: "absolute",
//                         top: "-1.4px",
//                         right: "-4px",
//                         backgroundColor: "red",
//                         color: "white",
//                         borderRadius: "50%",
//                         padding: "2px 6px",
//                         fontSize: "0.64rem",
//                         fontWeight: "bold",
//                         minWidth: "12px",
//                         textAlign: "center",
//                     }}
//                 >
//                     {count}
//                 </span>
//             )}
//         </div>
//     );
// }

// export default NotificationBell;


import React, { useEffect, useRef, useState } from "react";
import { CIcon } from "@coreui/icons-react";
import { cilBell, cilInfo, cilEnvelopeClosed } from "@coreui/icons";
import { fetchNotificationsCount, getAllNotificationsWithReadNull, markAllNotificationsAsRead } from "../../../api/api";
import { useNavigate } from "react-router-dom";

function NotificationBell({ userId }) {
  const [count, setCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false); // dropdown
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) return;

    const getCount = async () => {
      try {
        const data = await fetchNotificationsCount(userId);
        setCount(data); // Update state
      } catch (err) {
        console.error("Failed to fetch notifications count:", err);
      }
    };

    getCount(); // Initial fetch

    // Refresh every 30 seconds
    const interval = setInterval(getCount, 30000);

    return () => clearInterval(interval); // Cleanup
  }, [userId]);


  // Fetch notifications when panel opens
  const fetchPanelNotifications = async () => {
    try {
      const res = await getAllNotificationsWithReadNull(userId);
      if (res?.notifications) {
        // Assign default icon if type not provided
        const formatted = res.notifications.slice(0, 5).map(n => ({
          ...n,
          icon: cilEnvelopeClosed, // default icon
        }));
        setNotifications(formatted);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  // Handle bell click
  const handleBellClick = async (e) => {
    e.stopPropagation(); // ⛔ stop event bubbling
    setOpen(prev => !prev);

    if (!open) {
      await fetchPanelNotifications();
      await markAllNotificationsAsRead(userId);
      setCount(0);
    }
  };


  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon */}
      <div
        onClick={(e) => {
          e.stopPropagation();   // ⛔ Prevent dropdown clicks triggering navigation
          handleBellClick(e);
        }}
        style={{
          width: "fit-content",
          height: "fit-content",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CIcon
          icon={cilBell}
          style={{
            width: "20px", // smaller bell
            height: "20px",
          }}
        />
        {count > 0 && (
          <span
            style={{
              position: "absolute",
              top: "19px",
              right: "137px",
              backgroundColor: "red",
              color: "white",
              borderRadius: "55%",
              padding: count > 10 ? "6.8px 6.5px" : "5.8px 5.5px",   // bigger bubble when > 10
              fontSize: count > 10 ? "0.45rem" : "0.5rem",  // smaller font when > 10
              fontWeight: "bold",
              minWidth: count > 10 ? "14px" : "10px",       // expands the circle width
              height: count > 10 ? "14px" : "10px",         // expands height
              lineHeight: count > 10 ? "14px" : "10px",
              textAlign: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease-in-out" // smooth animation
            }}
          >
            {count}
          </span>

        )}
      </div>
      {/* Dropdown Panel */}
      {
        open && (
          <div
            style={{
              position: "absolute",
              right: 0,
              marginTop: "10px",
              marginRight: "15px",
              width: "270px",
              background: "white",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              zIndex: 999,
              padding: "10px",
            }}
          >
            <h6 style={{ fontWeight: "600", marginBottom: "10px" }}>Notifications</h6>

            {notifications.length > 0 ? (
              notifications.map((n) => (
                <div
                  key={n.notification_id}
                  onClick={() => navigate("/notifications")}
                  style={{
                    padding: "8px",
                    marginBottom: "6px",
                    borderRadius: "6px",
                    background: "#f6f7f9",
                    cursor: "pointer",
                  }}
                >


                  <div style={{ fontSize: "10px" }}>
                    <CIcon
                      icon={n.icon || cilEnvelopeClosed} // default icon if not defined
                      size="sm"
                      style={{
                        marginRight: "8px",
                        color: "#056aa5ff",
                        flexShrink: 0,
                        fontSize: "0.85px",
                      }}
                    />

                    {n.message}
                  </div>

                  <div style={{ fontSize: "9px", color: "#777" }}>
                    {new Date(n.createdAT).toLocaleTimeString()}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-muted">No new notifications</div>
            )}

            <div
              onClick={() => {
                setOpen(false);
                navigate("/notifications");
              }}

              style={{
                marginTop: "10px",
                textAlign: "center",
                padding: "7px",
                cursor: "pointer",
                background: "#eaf2ff",
                borderRadius: "6px",
                fontWeight: "500",
                color: "#2363b0",
                fontSize: "15px"
              }}
            >
              View All Notifications →
            </div>
          </div>
        )
      }
    </div >
  );
}

export default NotificationBell;