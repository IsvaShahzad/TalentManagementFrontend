/**
 * In-app toast notifications (top-right). Use for the current user's own actions.
 * System / other-user events use the notification bell + OS alerts (see App.js socket handler).
 */
export { useAppAlert as useToast, APP_ALERT_DEFAULT_DURATION } from "../context/AppAlertContext";
export {
  TOAST_DEFAULT_DURATION_MS,
  TOAST_DEDUPE_MS,
  OS_NOTIFICATION_DEDUPE_MS,
} from "../constants/notificationTiming";
