// src/components/candidateUtils.js
export const fetchCandidates = async (showCAlert) => {
  try {
    const res = await fetch('http://localhost:7000/api/candidate/getAllCandidates');
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Failed to fetch candidates:', err);
    if (showCAlert) showCAlert('Failed to load candidates', 'danger');
    return [];
  }
};

export const getCandidateSignedUrl = async (candidateId, type) => {
  try {
    const res = await fetch(
      `http://localhost:7000/api/candidate/signed-url/${candidateId}/${type}`,
    );
    if (!res.ok) throw new Error('Failed to get signed URL');
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
      `http://localhost:7000/api/candidate/download-cv/${candidateId}`,
    );
    if (!res.ok) throw new Error('Failed to get download URL');
    const data = await res.json();
    return data.url;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const downloadFile = (url, filename) => {
  const link = document.createElement('a');
  link.href = url;
  // If filename is provided, use it; otherwise let server headers decide
  if (filename) {
    link.download = filename;
  }
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
