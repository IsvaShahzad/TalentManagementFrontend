import React, { createContext, useCallback, useContext, useState } from "react";
import { CAlert } from "@coreui/react";
import {
  TOAST_DEFAULT_DURATION_MS,
  TOAST_DEDUPE_MS,
} from "../constants/notificationTiming";
import "../scss/app-alerts.scss";

/** @deprecated Use TOAST_DEFAULT_DURATION_MS from constants/notificationTiming.js */
export const APP_ALERT_DEFAULT_DURATION = TOAST_DEFAULT_DURATION_MS;

const AppAlertContext = createContext(null);

export const AppAlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);

  const dismissAlert = useCallback((id) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const showAlert = useCallback(
    (message, color = "success", duration = TOAST_DEFAULT_DURATION_MS) => {
      const text = String(message ?? "").trim();
      if (!text) return null;

      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const createdAt = Date.now();

      setAlerts((prev) => {
        const dup = prev.find(
          (a) =>
            a.message === text &&
            a.color === color &&
            createdAt - (a.createdAt || 0) < TOAST_DEDUPE_MS,
        );
        if (dup) return prev;
        return [...prev, { id, message: text, color, createdAt }];
      });

      if (duration > 0) {
        setTimeout(() => {
          dismissAlert(id);
        }, duration);
      }
      return id;
    },
    [dismissAlert],
  );

  const showSuccess = useCallback(
    (message, duration = TOAST_DEFAULT_DURATION_MS) =>
      showAlert(message, "success", duration),
    [showAlert],
  );

  const showError = useCallback(
    (message, duration = TOAST_DEFAULT_DURATION_MS) =>
      showAlert(message, "danger", duration),
    [showAlert],
  );

  const showWarning = useCallback(
    (message, duration = TOAST_DEFAULT_DURATION_MS) =>
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
