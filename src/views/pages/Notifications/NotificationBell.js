import React, { useEffect, useRef, useState } from "react";
import { CIcon } from "@coreui/icons-react";
import { cilBell } from "@coreui/icons";
import { fetchNotificationsCount, getAllNotificationsWithReadNull, markAllNotificationsAsRead } from "../../../api/api";
import { useLocation, useNavigate } from "react-router-dom";

function NotificationBell({ userId }) {
  const [count, setCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const getUserNotificationsEnabled = () => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.notifications_enabled !== undefined ? user.notifications_enabled : true;
      }
    } catch {
      return true;
    }
    return true;
  };

  const [notificationsEnabled, setNotificationsEnabled] = useState(getUserNotificationsEnabled());

  useEffect(() => {
    const handleStorageChange = () => {
      setNotificationsEnabled(getUserNotificationsEnabled());
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userUpdated', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userUpdated', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    if (location.pathname === "/notifications") {
      setCount(0);
      markAllNotificationsAsRead(userId);
      window.dispatchEvent(new Event("notifications-read"));
    }
  }, [location.pathname]);

  useEffect(() => {
    const updateCount = () => setCount(0);
    window.addEventListener("notifications-read", updateCount);
    return () => window.removeEventListener("notifications-read", updateCount);
  }, []);

  useEffect(() => {
    if (!userId || !notificationsEnabled) {
      setCount(0);
      return;
    }
    const getCount = async () => {
      try {
        const data = await fetchNotificationsCount(userId);
        setCount(data);
      } catch (err) {
        console.error("Failed to fetch notifications count:", err);
      }
    };
    getCount();
    const interval = setInterval(getCount, 5000);
    const handleRefresh = () => {
      setTimeout(getCount, 500);
    };
    window.addEventListener("refreshNotifications", handleRefresh);
    return () => {
      clearInterval(interval);
      window.removeEventListener("refreshNotifications", handleRefresh);
    };
  }, [userId, notificationsEnabled]);

  const fetchPanelNotifications = async () => {
    if (!notificationsEnabled) {
      setNotifications([]);
      return;
    }
    try {
      const res = await getAllNotificationsWithReadNull(userId);
      if (res?.notifications) {
        setNotifications(res.notifications.slice(0, 5));
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  useEffect(() => {
    if (open) {
      fetchPanelNotifications();
    }
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const handleNotificationClick = (notificationId) => {
    navigate("/notifications");
    setOpen(false);
  };

  return (
    <div ref={dropdownRef} style={{ position: "relative" }}>
      <div
        onClick={() => setOpen(!open)}
        style={{
          position: "relative",
          cursor: "pointer",
          padding: "8px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <CIcon icon={cilBell} size="lg" />
        {count > 0 && (
          <span
            style={{
              position: "absolute",
              top: "4px",
              right: "4px",
              backgroundColor: "#ef4444",
              color: "white",
              borderRadius: "50%",
              width: "18px",
              height: "18px",
              fontSize: "11px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
            }}
          >
            {count > 99 ? "99+" : count}
          </span>
        )}
      </div>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            marginTop: "8px",
            backgroundColor: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            minWidth: "320px",
            maxWidth: "400px",
            maxHeight: "400px",
            overflowY: "auto",
            zIndex: 1000,
          }}
        >
          <div style={{ padding: "12px", borderBottom: "1px solid #e5e7eb" }}>
            <strong>Notifications</strong>
          </div>
          <div>
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <div
                  key={notif.notification_id}
                  onClick={() => handleNotificationClick(notif.notification_id)}
                  style={{
                    padding: "12px",
                    borderBottom: "1px solid #f3f4f6",
                    cursor: "pointer",
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f9fafb")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "white")}
                >
                  <div style={{ fontSize: "14px", marginBottom: "4px" }}>
                    {notif.message}
                  </div>
                  <div style={{ fontSize: "12px", color: "#6b7280" }}>
                    {new Date(notif.createdAT).toLocaleString()}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: "20px", textAlign: "center", color: "#6b7280" }}>
                No notifications
              </div>
            )}
          </div>
          {notifications.length > 0 && (
            <div
              style={{
                padding: "12px",
                borderTop: "1px solid #e5e7eb",
                textAlign: "center",
              }}
            >
              <button
                onClick={() => {
                  navigate("/notifications");
                  setOpen(false);
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "#3b82f6",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;