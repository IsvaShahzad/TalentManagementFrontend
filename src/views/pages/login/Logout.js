// src/views/pages/login/Logout.js
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { useAppAlert } from "../../../context/AppAlertContext";

const Logout = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { showSuccess } = useAppAlert();
  const alertShown = useRef(false);

  useEffect(() => {
    // Get user info before clearing
    const currentUser =
      user || JSON.parse(localStorage.getItem("user") || "null");

    // Clear everything immediately
    logout();
    sessionStorage.clear();

    // Navigate to login immediately
    navigate("/login", { replace: true });

    // Show alert only once (avoids double alert in Strict Mode or double mount)
    if (!alertShown.current) {
      alertShown.current = true;
      showSuccess("Logged out successfully", 1500);
    }

    // Record logout in background (non-blocking)
    if (currentUser?.user_id || currentUser?.id) {
      fetch(`${import.meta.env.VITE_API_BASE_URL}/user/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.user_id || currentUser.id }),
      }).catch((err) => console.error("Logout record failed:", err));
    }
  }, [navigate, logout, user, showSuccess]);

  return null;
};

export default Logout;
