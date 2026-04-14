import React, { useState, useEffect } from "react";
import { CButton } from "@coreui/react";
import CIcon from "@coreui/icons-react";
import { cilBell } from "@coreui/icons";
import notificationService from "../services/notificationService";

/**
 * Banner for users who have not granted OS/browser notification permission.
 * Native notifications appear outside the browser (Windows notification center, etc.)
 * when permission is granted and the tab is in the background.
 */
const userAllowsAppNotifications = () => {
  try {
    const s = localStorage.getItem("user");
    if (!s) return true;
    const u = JSON.parse(s);
    return u.notifications_enabled !== false;
  } catch {
    return true;
  }
};

const DesktopNotificationPrompt = ({ visible }) => {
  const [perm, setPerm] = useState(
    typeof Notification !== "undefined" ? Notification.permission : "unsupported",
  );
  const [dismissed, setDismissed] = useState(() => {
    try {
      return sessionStorage.getItem("tms-notif-banner-dismissed") === "1";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const sync = () => {
      if (typeof Notification !== "undefined") {
        setPerm(Notification.permission);
      }
    };
    sync();
    const id = setInterval(sync, 2000);
    return () => clearInterval(id);
  }, []);

  if (
    !visible ||
    !userAllowsAppNotifications() ||
    perm === "unsupported" ||
    perm === "granted" ||
    dismissed
  ) {
    return null;
  }

  const handleEnable = async () => {
    try {
      const result = await notificationService.requestPermission();
      setPerm(result);
      if (result === "granted") {
        await notificationService.initialize();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div
      role="status"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 1040,
        width: "100%",
        background: "linear-gradient(90deg, #1e3a5f 0%, #2d4a6f 100%)",
        color: "#f1f5f9",
        padding: "0.5rem 1rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.75rem",
        flexWrap: "wrap",
        fontSize: "0.875rem",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      }}
    >
      <CIcon icon={cilBell} className="text-warning" />
      <span>
        {perm === "denied"
          ? "Desktop alerts are blocked for this site. Open the lock icon in the address bar → Site settings → Notifications → Allow, then reload."
          : "Enable desktop notifications to get alerts outside the browser (even when this tab is in the background)."}
      </span>
      {perm === "default" && (
        <CButton
          color="warning"
          size="sm"
          className="text-dark fw-semibold"
          onClick={handleEnable}
        >
          Allow notifications
        </CButton>
      )}
      <CButton
        color="link"
        size="sm"
        className="text-light text-decoration-none"
        style={{ opacity: 0.85 }}
        onClick={() => {
          try {
            sessionStorage.setItem("tms-notif-banner-dismissed", "1");
          } catch (_) {}
          setDismissed(true);
        }}
      >
        Dismiss
      </CButton>
    </div>
  );
};

export default DesktopNotificationPrompt;
