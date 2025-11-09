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
    const res = await fetch(`http://localhost:7000/api/candidate/signed-url/${candidateId}/${type}`);
    if (!res.ok) throw new Error('Failed to get signed URL');
    const data = await res.json();
    return data.signedUrl;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const downloadFile = (url, filename) => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
