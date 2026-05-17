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
