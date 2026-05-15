import React, { createContext, useCallback, useContext, useState } from "react";
import { CAlert } from "@coreui/react";
import "../scss/app-alerts.scss";

/** Matches former global ToastContainer default (App.js). */
export const APP_ALERT_DEFAULT_DURATION = 3500;

const AppAlertContext = createContext(null);

export const AppAlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);

  const dismissAlert = useCallback((id) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const showAlert = useCallback((message, color = "success", duration = APP_ALERT_DEFAULT_DURATION) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    setAlerts((prev) => [...prev, { id, message, color }]);
    if (duration > 0) {
      setTimeout(() => {
        dismissAlert(id);
      }, duration);
    }
    return id;
  }, [dismissAlert]);

  const showSuccess = useCallback(
    (message, duration = APP_ALERT_DEFAULT_DURATION) =>
      showAlert(message, "success", duration),
    [showAlert],
  );

  const showError = useCallback(
    (message, duration = APP_ALERT_DEFAULT_DURATION) =>
      showAlert(message, "danger", duration),
    [showAlert],
  );

  const showWarning = useCallback(
    (message, duration = APP_ALERT_DEFAULT_DURATION) =>
      showAlert(message, "warning", duration),
    [showAlert],
  );

  const value = {
    showAlert,
    showSuccess,
    showError,
    showWarning,
  };

  return (
    <AppAlertContext.Provider value={value}>
      {children}
      <div className="app-alert-host" aria-live="polite">
        {alerts.map((a) => (
          <CAlert
            key={a.id}
            color={a.color}
            dismissible
            onClose={() => dismissAlert(a.id)}
            className="app-alert-item"
          >
            {a.message}
          </CAlert>
        ))}
      </div>
    </AppAlertContext.Provider>
  );
};

export const useAppAlert = () => {
  const ctx = useContext(AppAlertContext);
  if (!ctx) {
    throw new Error("useAppAlert must be used within AppAlertProvider");
  }
  return ctx;
};
