// src/components/candidateUtils.js
import { getRedactedResumeSignedUrl } from "../api/api";

export const fetchCandidates = async (showCAlert) => {
  try {
    const res = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/candidate/getAllCandidates`,
    );
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Failed to fetch candidates:", err);
    if (showCAlert) showCAlert("Failed to load candidates", "danger");
    return [];
  }
};

export const getCandidateSignedUrl = async (candidateId, type) => {
  try {
    const res = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/candidate/signed-url/${candidateId}/${type}`,
    );
    if (!res.ok) throw new Error("Failed to get signed URL");
    const data = await res.json();
    return data.url || data.signedUrl;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

/** @deprecated Prefer openCandidateResume — kept for legacy call sites */
export const getCandidateDownloadUrl = async (candidateId) => {
  return getCandidateSignedUrl(candidateId, "original");
};

/**
 * Open a file URL in a new browser tab for preview (Active Positions / JD behavior).
 * Does not force download; user can save from the browser viewer if needed.
 */
export const openFileInBrowser = (url) => {
  if (!url) return;
  window.open(url, "_blank", "noopener,noreferrer");
};

/**
 * Open original or redacted candidate resume in the browser (consistent app-wide).
 */
export const openCandidateResume = async (candidateId, type = "original") => {
  if (type === "redacted") {
    const { signedUrl } = await getRedactedResumeSignedUrl(candidateId);
    openFileInBrowser(signedUrl);
    return;
  }
  const url = await getCandidateSignedUrl(candidateId, "original");
  openFileInBrowser(url);
};

/** @deprecated Use openFileInBrowser or openCandidateResume */
export const downloadFile = (url, _filename) => {
  openFileInBrowser(url);
};

export const CV_EMAIL_MISSING_WARNING =
  "Email could not be extracted from the CV. Please add it manually.";

export const getCvUploadMissingEmailResults = (results = []) =>
  (Array.isArray(results) ? results : []).filter((r) => r.emailMissing);

export const formatCvUploadMissingEmailAlert = (results = []) => {
  const missing = getCvUploadMissingEmailResults(results);
  if (!missing.length) return null;
  const count = missing.length;
  const label = count === 1 ? "1 candidate was" : `${count} candidates were`;
  return `${label} created without an email. ${CV_EMAIL_MISSING_WARNING}`;
};

/** Show alerts for bulk CV upload API response (all upload screens). */
export const notifyCvUploadResults = (data, showAlert, duration = 4000) => {
  if (!showAlert || !data) return { created: [], linked: [], skipped: [], errors: [] };

  const results = Array.isArray(data.results) ? data.results : [];
  const created = results.filter((r) => r.status === "created");
  const linked = results.filter((r) => r.status === "linked");
  const duplicates = results.filter((r) => r.status === "duplicate");
  const skipped = results.filter((r) => r.status === "skipped");
  const errors = results.filter((r) => r.status === "error");

  if (duplicates.length > 0) {
    const emails = duplicates
      .map((r) => r.email || r.candidate?.name || r.originalName)
      .filter(Boolean);
    showAlert(
      `${duplicates.length} duplicate(s) skipped${emails.length ? `: ${emails.slice(0, 3).join(", ")}${emails.length > 3 ? "..." : ""}` : ""}`,
      "warning",
      duration,
    );
  }

  if (linked.length > 0) {
    showAlert(
      `${linked.length} existing candidate(s) linked to your account`,
      "info",
      duration,
    );
  }

  const missingEmailAlert = formatCvUploadMissingEmailAlert(results);
  if (missingEmailAlert) {
    showAlert(missingEmailAlert, "warning", duration);
  }

  if (created.length > 0) {
    showAlert(
      `${created.length} candidate(s) uploaded successfully`,
      "success",
      duration,
    );
  }

  if (skipped.length > 0) {
    const detail = skipped
      .map((r) => r.originalName ? `${r.originalName}: ${r.message}` : r.message)
      .filter(Boolean)
      .slice(0, 2)
      .join("; ");
    showAlert(
      detail || "Some CVs could not be processed.",
      "warning",
      duration,
    );
  }

  if (errors.length > 0) {
    showAlert(
      errors[0]?.message || "Failed to create candidate from CV.",
      "danger",
      duration,
    );
  }

  if (
    created.length === 0 &&
    linked.length === 0 &&
    duplicates.length === 0 &&
    skipped.length === 0 &&
    errors.length === 0
  ) {
    showAlert(data.message || "No candidates were added.", "warning", duration);
  }

  return { created, linked, duplicates, skipped, errors };
};

export const getStoredRecruiterId = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return user?.user_id || "";
  } catch {
    return "";
  }
};
