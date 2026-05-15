// src/components/candidateUtils.js
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
    // Backend currently returns { url }
    return data.url || data.signedUrl;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

// Get original CV download URL with filename preserved by backend
export const getCandidateDownloadUrl = async (candidateId) => {
  try {
    const res = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/candidate/download-cv/${candidateId}`,
    );
    if (!res.ok) throw new Error("Failed to get download URL");
    const data = await res.json();
    return data.url;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

/**
 * Open a file URL in a new browser tab for preview (Active Positions / JD behavior).
 * Does not force download; user can save from the browser viewer if needed.
 */
export const openFileInBrowser = (url) => {
  if (!url) return;
  window.open(url, "_blank", "noopener,noreferrer");
};

/** @deprecated Use openFileInBrowser — kept for existing call sites (CV / resume / attachments). */
export const downloadFile = (url, _filename) => {
  openFileInBrowser(url);
};
