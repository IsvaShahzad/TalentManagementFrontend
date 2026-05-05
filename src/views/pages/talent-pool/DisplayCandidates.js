import React, { useState, useEffect } from "react";
import {
  CContainer,
  CCard,
  CCardBody,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CFormInput,
  CButton,
  CAlert,
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CSpinner,
} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import {
  cilTrash,
  cilPencil,
  cilSearch,
  cilCloudUpload,
  cilBook,
  cilSpreadsheet,
} from "@coreui/icons";
import {
  deleteCandidateApi,
  getAll_Notes,
  saveSearchApi,
  updateCandidateByEmailApi,
  getRecruiterCandidatesApi,
  bulkUpload,
  getAllClients,
  assignClientToCandidate,
} from "../../../api/api";
import {
  filterTalentPool,
  getCandidateClientDisplayName,
} from "../../../utils/candidateFilters";
import { downloadCandidatesCsv } from "../../../utils/downloadCandidatesCsv";
import BulkUpload from "./BulkUpload";
import { getAllSearches } from "../../../api/api";
import {
  fetchCandidates,
  getCandidateSignedUrl,
  getCandidateDownloadUrl,
  downloadFile,
} from "../../../components/candidateUtils";
import SearchBarWithIcons from "../../../components/SearchBarWithIcons";
import CandidateModals from "../../../components/CandidateModals";
import "./TableScrollbar.css"; // import CSS at the top of your file
//import CVUpload from './CVUpload'

import {
  handleSaveSearch as saveSearchHandler,
  handleEdit as editHandler,
  handleSave as saveHandler,
  handleDelete as deleteHandler,
  handleConfirmDelete as confirmDeleteHandler,
  handleCreateNote as createNoteHandler,
} from "../../../components/candidateHandlers";
import { useLocation, useNavigate } from "react-router-dom";

const DisplayCandidates = ({ candidates, refreshCandidates }) => {
  const [message, setMessage] = useState("");
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [alerts, setAlerts] = useState([]);
  const [editingCandidate, setEditingCandidate] = useState(null);
  const [deletingCandidate, setDeletingCandidate] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [editingTag, setEditingTag] = useState(null);
  const [tagValue, setTagValue] = useState("");
  const [notesModalVisible, setNotesModalVisible] = useState(false);
  const [currentNotesCandidate, setCurrentNotesCandidate] = useState(null);
  const [notesText, setNotesText] = useState("");
  const [savingSearch, setSavingSearch] = useState(false);
  const [creatingNote, setCreatingNote] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [filters, setFilters] = useState([]);
  const [showXlsModal, setShowXlsModal] = useState(false);
  const [showCvModal, setShowCvModal] = useState(false);
  const [cvTypeToUpload, setCvTypeToUpload] = useState(null); // 'original' or 'redacted'
  const [userId, setUserId] = useState("");
  const [savedSearches, setSavedSearches] = useState([]);
  const [localCandidates, setLocalCandidates] = useState(candidates);
  const [starred, setStarred] = useState(false);
  const [uploadingExcel, setUploadingExcel] = useState(false);
  const [uploadingCV, setUploadingCV] = useState(false);

  const [selectedFrequency, setSelectedFrequency] = useState("none");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [showFrequencyModal, setShowFrequencyModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [notes, setNotes] = useState([]);
  const [candidatesLoading, setCandidatesLoading] = useState(true); // optional: show loading state
  const Location = useLocation();
  const navigate = useNavigate();

  const [clients, setClients] = useState([]);
  const [advancedFilters, setAdvancedFilters] = useState({
    location: "",
    position: "",
    experience: "",
    salaryMin: "",
    salaryMax: "",
    clientId: "",
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getAllClients();
        if (!cancelled) setClients(res?.data || []);
      } catch (e) {
        console.error(e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setFilteredCandidates(
      filterTalentPool(localCandidates, advancedFilters, searchQuery),
    );
  }, [localCandidates, advancedFilters, searchQuery]);
  const tagStyle = {
    background: "#e3efff",
    color: "#326396",
    padding: "2px 6px", // smaller
    borderRadius: "15px",
    fontSize: "0.7rem", // smaller
    cursor: "pointer",
  };

  const inputTagStyle = {
    border: "1px solid #d1d5db",
    borderRadius: "0.5rem",
    padding: "2px 4px", // smaller
    fontSize: "0.7rem", // smaller
    width: "80px",
    marginTop: "2px",
  };
  const alertStyle = {
    fontSize: "1px", // smaller font
    padding: "6px 10px",
    lineHeight: "1.3",
  };

  const [role, setRole] = useState("");
  const [recruiterId, setRecruiterId] = useState("");

  useEffect(() => {
    const userObj = localStorage.getItem("user");
    if (userObj) {
      const user = JSON.parse(userObj);
      setUserId(user.user_id);
      setRole(user.role); // "Admin" or "Recruiter"
      setRecruiterId(user.user_id);
    }
  }, []);

  useEffect(() => {
    refreshNotes();
  }, [Location.pathname]);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const refreshNotes = async () => {
    try {
      const res = await getAll_Notes();
      setNotes(res.notes);
    } catch (err) {
      console.error(err);
    }
  };

  // const refreshPage = () => {
  //   window.location.reload();
  // };

  const showCAlert = (message, color = "success", duration = 1500) => {
    const id = new Date().getTime();
    setAlerts((prev) => [
      ...prev,
      { id, message, color, style: alertStyle }, // apply centralized style
    ]);
    setTimeout(
      () => setAlerts((prev) => prev.filter((alert) => alert.id !== id)),
      duration,
    );
  };

  useEffect(() => {
    const fetchCandidatesByRole = async () => {
      try {
        let data = [];

        if (role === "Admin") {
          data = candidates; // Admin sees all
        } else if (role === "Recruiter") {
          data = await getRecruiterCandidatesApi();
        }

        setLocalCandidates(data);
      } catch (err) {
        console.error("Error fetching candidates:", err);
        showCAlert("Failed to fetch candidates", "danger");
      }
    };

    fetchCandidatesByRole();
  }, [role, recruiterId, candidates, Location.pathname]);

  const handleAssignClient = async (candidateId, clientId) => {
    try {
      await assignClientToCandidate(candidateId, clientId);
      const updater = (prev) =>
        prev.map((c) =>
          c.candidate_id === candidateId
            ? { ...c, clientassigned_id: clientId || "" }
            : c,
        );
      setLocalCandidates(updater);
      showCAlert("Client updated", "success");
      if (refreshCandidates) await refreshCandidates();
    } catch (e) {
      console.error(e);
      showCAlert("Failed to assign client", "danger");
    }
  };

  const canAssignClient = role === "Admin" || role === "Recruiter";

  const handleExportFilteredCsv = () => {
    const rows = filteredCandidates.map((c) => ({
      ...c,
      _exportClientName: getCandidateClientDisplayName(c, clients),
    }));
    if (!rows.length) {
      showCAlert("No rows to export", "warning");
      return;
    }
    downloadCandidatesCsv(rows, "candidates-filtered.csv");
  };

  const handleDownload = async (candidate, type) => {
    try {
      if (type === "original") {
        // Use backend-provided filename (original upload name) via /download-cv
        const url = await getCandidateDownloadUrl(candidate.candidate_id);
        downloadFile(url); // let server headers control filename
      } else if (type === "redacted") {
        // Redacted CV – use signed URL and simple PDF filename
        const { signedUrl } = await getRedactedResumeSignedUrl(
          candidate.candidate_id,
        );
        const filename = `${candidate.name}_Redacted.pdf`;
        downloadFile(signedUrl, filename);
      }
    } catch (err) {
      console.error("Download failed:", err);
      showCAlert("Failed to download CV", "danger");
    }
  };

  const handleEdit = (candidate) => editHandler(candidate, setEditingCandidate);

  const handleSave = async () => {
    if (!editingCandidate) return;

    try {
      await saveHandler({
        editingCandidate,
        refreshCandidates,
        showCAlert,
        setEditingCandidate,
        setFilteredCandidates, // <-- pass these to update table instantly
        setLocalCandidates,
        // refreshPage,
      });

      // ✅ No need to manually update state here anymore,
      // saveHandler already updates localCandidates & filteredCandidates
    } catch (err) {
      console.error(err);
      showCAlert("Failed to save changes", "danger");
    }
  };

  const handleDelete = (candidate) =>
    deleteHandler(candidate, setDeletingCandidate);

  const handleConfirmDelete = async () => {
    await confirmDeleteHandler({
      deletingCandidate,
      setDeletingCandidate,
      showCAlert,
      setFilteredCandidates,
      setLocalCandidates,
      refreshCandidates,
    });
  };

  const handleSaveSearch = () =>
    saveSearchHandler({
      userId,
      searchQuery,
      filters,
      selectedFrequency,
      setSavingSearch,
      setSuccess,
      setError,
      showCAlert,
      setStarred,
      setShowFrequencyModal,
    });

  const handleCreateNote = () => {
    createNoteHandler({
      // node_id,
      candidateId: currentNotesCandidate?.candidate_id,
      notesText,
      creatingNote,
      setCreatingNote,
      showCAlert,
      setNotesModalVisible,
      setSuccess,
      setError,
    });
    // Note: refreshNotes is now handled via 'noteCreated' event in candidateHandlers.js
  };

  const CVUpload = ({
    onUpload,
    uploading,
    uploadProgress,
    selectedFiles,
    setSelectedFiles,
  }) => {
    const handleFileChange = (e) => {
      const files = e.target.files;
      if (setSelectedFiles) setSelectedFiles(files);
    };

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
          position: "relative",
        }}
      >
        <CFormInput
          type="file"
          multiple
          accept=".pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleFileChange}
          disabled={uploading}
        />

        {selectedFiles && selectedFiles.length > 0 && (
          <p style={{ fontSize: "0.75rem", margin: 0 }}>
            {selectedFiles.length} file{selectedFiles.length > 1 ? "s" : ""}{" "}
            selected
          </p>
        )}

        <CButton
          type="button"
          className="mt-2 py-2"
          disabled={uploading || !selectedFiles || selectedFiles.length === 0}
          onClick={() => {
            if (!selectedFiles || selectedFiles.length === 0) return;
            onUpload(selectedFiles);
          }}
          style={{
            width: "100%",
            background: "linear-gradient(90deg, #5f8ed0 0%, #4a5dca 100%)",
            border: "none",
            borderRadius: "12px",
            fontSize: "0.9rem",
            fontWeight: 500,
            color: "white",
            opacity: uploading ? 0.85 : 1,
            cursor: uploading ? "not-allowed" : "pointer",
            transition: "all 0.3s ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
          }}
        >
          {uploading && <CSpinner size="sm" />}
          {uploading
            ? `Uploading… ${uploadProgress > 0 ? `${uploadProgress}%` : ""}`
            : "Upload CVs"}
        </CButton>

        {uploading && (
          <div style={{ marginTop: "0.25rem" }}>
            <div
              style={{
                height: "8px",
                width: "100%",
                borderRadius: "999px",
                backgroundColor: "#e2e8f0",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${Math.max(uploadProgress, 3)}%`,
                  background:
                    "linear-gradient(90deg, #5f8ed0 0%, #4a5dca 100%)",
                  transition: "width 0.25s ease",
                }}
              />
            </div>
            <p
              style={{
                fontSize: "0.72rem",
                color: "#64748b",
                margin: "0.35rem 0 0 0",
              }}
            >
              Please wait while your file(s) upload…
            </p>
          </div>
        )}

        <p style={{ fontSize: "0.75rem", color: "#64748b", margin: 0 }}>
          Select one or more CVs (PDF, DOC, DOCX) to upload
        </p>

        {message && (
          <CAlert
            color={message.includes("Error") ? "danger" : "success"}
            className="mt-3 text-center"
            style={{ fontSize: "0.8rem", padding: "0.5rem" }}
          >
            {message}
          </CAlert>
        )}
      </div>
    );
  };

  useEffect(() => {
    const userObj = localStorage.getItem("user");
    if (userObj) {
      const user = JSON.parse(userObj);
      setUserId(user.user_id);
      setRole(user.role); // "Admin" or "Recruiter"
      setRecruiterId(user.user_id);

      // Fetch saved searches for this user
      const fetchSavedSearches = async () => {
        try {
          const searches = await getAllSearches(user.user_id);
          setSavedSearches(searches);
        } catch (err) {
          console.error("Failed to fetch saved searches", err);
        }
      };
      fetchSavedSearches();
    }
  }, []);

  //   const handleExcelUpload = async (file, attachedCVs = {}) => {
  //     if (!file) {
  //       showCAlert('Please select a file to upload.', 'warning', 5000);
  //       return;
  //     }

  //     setUploadingExcel(true);

  //     try {
  //       const formData = new FormData();
  //       formData.append('file', file);

  //       // Attach CVs per email
  //       // attachedCVs should be an object: { "email1@example.com": File, "email2@example.com": File }
  //       for (const [email, cvFile] of Object.entries(attachedCVs)) {
  //         formData.append(email, cvFile); // must match backend: req.files[email]
  //       }

  //  const apiUrl = role === 'Recruiter'
  //   ? 'http://localhost:7000/api/candidate/bulk-upload'
  //   : 'http://localhost:7000/api/candidate/bulk-upload';

  // const xhr = new XMLHttpRequest();
  // xhr.open('POST', apiUrl, true);

  // if (role === 'Recruiter') {
  //   formData.append('recruiterId', recruiterId);
  // }

  //       xhr.upload.onprogress = (event) => {
  //         if (event.lengthComputable) {
  //           const percent = Math.round((event.loaded / event.total) * 100);
  //           setUploadProgress(percent);
  //         }
  //       };

  //       xhr.onload = async () => {
  //         setUploadingExcel(false);
  //         setShowXlsModal(false);

  //         if (xhr.status === 200) {
  //           const data = JSON.parse(xhr.responseText);

  //           const duplicates = data.results?.filter(r => r.status === 'duplicate')?.map(r => r.email) || [];
  //           const created = data.results?.filter(r => r.status === 'created') || [];

  //           if (duplicates.length > 0)
  //             showCAlert(`Candidate(s) with email(s) ${duplicates.join(', ')} already exist!`, 'danger', 6000);
  //           if (created.length > 0) {
  //             showCAlert(`${created.length} candidate(s) uploaded successfully`, 'success');

  //             // if (refreshCandidates) await refreshCandidates(); // refresh from backend
  //             // ✅ Add new candidates instantly
  //             const newCandidates = created.map(c => ({
  //               ...c,
  //               position_applied: c.position || '',
  //               experience_years: c.experience || '',
  //               source: 'xls',
  //             }));

  //             setLocalCandidates(prev => [...prev, ...newCandidates]);
  //             setFilteredCandidates(prev => [...prev, ...newCandidates]);
  //             if (refreshCandidates) {
  //               await refreshCandidates();
  //             }
  //             setShowXlsModal(false);
  //             setUploadingExcel(false);

  //           }
  //           refreshPage();
  //           //if (refreshCandidates) await refreshCandidates(); // refresh from backend
  //         } else {
  //           showCAlert('Failed to upload Excel. Server error.', 'danger', 6000);
  //         }
  //       };

  //       xhr.onerror = () => {
  //         setUploadingExcel(false);
  //         showCAlert('Excel upload failed. Check console.', 'danger', 6000);
  //       };

  //       xhr.send(formData);
  //       if (refreshCandidates) {
  //         await refreshCandidates();
  //       }
  //       setShowXlsModal(false);
  //       setUploadingExcel(false);
  //       refreshPage();
  //     }
  //     catch (err) {
  //       console.error('Excel upload error:', err);
  //       setUploadingExcel(false);
  //       showCAlert('Excel upload failed. Check console.', 'danger', 6000);
  //     }
  //   };

  const handleExcelUpload = async (file, attachedCVs = {}) => {
    if (!file) {
      showCAlert("Please select an Excel file to upload.", "warning", 1500);
      return;
    }

    setUploadingExcel(true);

    try {
      // Standardize the ID just like your CV upload logic
      const idToSend = userId || recruiterId || localStorage.getItem("userId");
      const formData = new FormData();

      // 1️⃣ Text fields FIRST
      formData.append("userId", idToSend);
      formData.append("role", role || "Recruiter");

      // 2️⃣ Main Excel file
      formData.append("file", file);

      // 3️⃣ Attached CVs
      for (const [email, cvFile] of Object.entries(attachedCVs)) {
        formData.append(email, cvFile);
      }

      const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/candidate/bulk-upload`;
      const xhr = new XMLHttpRequest();
      xhr.open("POST", apiUrl, true);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percent);
        }
      };

      xhr.onload = async () => {
        setUploadingExcel(false);
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          showCAlert("Candidates processed successfully", "success", 1500);

          if (refreshCandidates) await refreshCandidates();
          setShowXlsModal(false);
          // Short delay to allow state to settle before refresh
          setTimeout(() => window.location.reload(), 1000);
        } else {
          const errData = JSON.parse(xhr.responseText);
          showCAlert(
            errData.message || "Server error during upload",
            "danger",
            1500,
          );
        }
      };

      xhr.onerror = () => {
        setUploadingExcel(false);
        showCAlert("Network error during upload.", "danger", 1500);
      };

      xhr.send(formData);
    } catch (err) {
      console.error("Excel upload error:", err);
      setUploadingExcel(false);
    }
  };

  const handleCVUpload = async (files) => {
    if (!files || files.length === 0) {
      showCAlert("Please select at least one CV to upload.", "warning", 1500);
      return;
    }

    setUploadingCV(true);
    setUploadProgress(0);

    try {
      setUploading(true);
      setMessage("");

      if (currentNotesCandidate && currentNotesCandidate.source === "xls") {
        // ===============================
        // XLS candidate → single CV upload
        // ===============================
        const file = files[0]; // only one file per XLS candidate
        const formData = new FormData();

        formData.append("file", file);
        formData.append("candidate_id", currentNotesCandidate.candidate_id);
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/candidate/upload-xls-cv`,
          {
            method: "POST",
            body: formData,
          },
        );
        const data = await res.json();
        const resumeUrl = data.url || data.resume_url;

        setUploadingCV(false);
        setUploadProgress(0);

        if (res.ok && resumeUrl) {
          showCAlert("CV uploaded successfully!", "success");

          const updatedCandidate = {
            ...currentNotesCandidate,
            resume_url: resumeUrl,
            position_applied: currentNotesCandidate.position || "",
            experience_years: currentNotesCandidate.experience || "",
            source: "cv",
          };

          setLocalCandidates((prev) => [...prev, updatedCandidate]);
          setFilteredCandidates((prev) => [...prev, updatedCandidate]);
          setCurrentNotesCandidate(null);
          if (refreshCandidates) await refreshCandidates();
        } else {
          showCAlert(data.message || "CV upload failed", "danger");
        }
        setSelectedFiles(null);
        setShowCvModal(false);
      } else {
        // ===============================
        // Normal bulk CV upload (await XHR so loading state stays until done)
        // ===============================
        await new Promise((resolve) => {
          const formData = new FormData();
          for (const file of files) formData.append("files", file);

          const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/candidate/bulk-upload-cvs`;

          const xhr = new XMLHttpRequest();
          xhr.open("POST", apiUrl, true);

          formData.append("role", role);
          if (recruiterId) {
            formData.append("recruiterId", recruiterId);
          }

          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const percent = Math.round((event.loaded / event.total) * 100);
              setUploadProgress(percent);
            } else {
              setUploadProgress((p) => (p < 15 ? 10 : p));
            }
          };

          xhr.onload = () => {
            setUploadingCV(false);
            setUploadProgress(0);

            if (xhr.status === 200) {
              try {
                const data = JSON.parse(xhr.responseText);
                const duplicates =
                  data.results
                    ?.filter((r) => r.status === "duplicate")
                    ?.map((r) => r.email) || [];
                const created =
                  data.results?.filter((r) => r.status === "created") || [];
                const linked =
                  data.results?.filter((r) => r.status === "linked") || [];

                if (duplicates.length > 0)
                  showCAlert(
                    `${duplicates.length} duplicate(s) skipped: ${duplicates.slice(0, 3).join(", ")}${duplicates.length > 3 ? "..." : ""}`,
                    "warning",
                    1500,
                  );

                if (linked.length > 0)
                  showCAlert(
                    `${linked.length} existing candidate(s) linked to your account`,
                    "info",
                    1500,
                  );

                if (created.length > 0) {
                  showCAlert(
                    `${created.length} candidate(s) uploaded successfully`,
                    "success",
                    1500,
                  );

                  const newCandidates = created.map((c) => ({
                    ...c,
                    position_applied: c.position || "",
                    experience_years: c.experience || "",
                    source: "cv",
                  }));
                  setLocalCandidates((prev) => [...prev, ...newCandidates]);
                  setFilteredCandidates((prev) => [...prev, ...newCandidates]);
                  setCurrentNotesCandidate(null);
                }

                refreshCandidates();
              } catch (parseErr) {
                console.error(parseErr);
                showCAlert("Could not read upload response.", "danger", 1500);
              }
            } else {
              let errorMessage = "Failed to upload CVs. Server error.";
              let alertType = "danger";
              try {
                const errData = JSON.parse(xhr.responseText || "{}");
                if (errData?.message) errorMessage = errData.message;
                if (
                  xhr.status === 409 ||
                  /duplicate/i.test(errorMessage)
                ) {
                  alertType = "warning";
                }
              } catch (_e) {
                /* keep default */
              }
              showCAlert(errorMessage, alertType, 1500);
            }

            setSelectedFiles(null);
            setShowCvModal(false);
            resolve();
          };

          xhr.onerror = () => {
            setUploadingCV(false);
            setUploadProgress(0);
            showCAlert("CV upload failed. Check console.", "danger", 1500);
            setSelectedFiles(null);
            setShowCvModal(false);
            resolve();
          };

          xhr.send(formData);
        });
      }
    } catch (err) {
      console.error(err);
      showCAlert("CV upload failed", "danger");
      setMessage("Error uploading files");
      setUploadingCV(false);
      setUploadProgress(0);
    } finally {
      setUploading(false);
      setCurrentNotesCandidate(null);
    }
  };

  const renderFieldOrTag = (candidate, fieldKey, label, inputType = "text") => {
    const backendFieldMap = {
      position: "position_applied",
      current_last_salary: "current_last_salary",
      expected_salary: "expected_salary",
      experience_years: "experience_years",
      candidate_status: "candidate_status",
      placement_status: "placement_status",
      client_name: "client_name",
      sourced_by_name: "sourced_by_name",
    };

    const backendField = backendFieldMap[fieldKey] || fieldKey;
    const value = candidate[backendField] ?? ""; // use nullish coalescing

    if (editingTag === candidate.candidate_id + fieldKey) {
      return (
        <input
          type={inputType}
          value={tagValue}
          onChange={(e) => setTagValue(e.target.value)}
          onKeyDown={async (e) => {
            if (e.key === "Enter") {
              try {
                // Only attempt API update if candidate has an email
                if (candidate.email) {
                  const payload = { [backendField]: tagValue };
                  await updateCandidateByEmailApi(candidate.email, payload);
                }

                // ✅ Update localCandidates & filteredCandidates immediately
                setLocalCandidates((prev) =>
                  prev.map((item) =>
                    item.candidate_id === candidate.candidate_id
                      ? { ...item, [backendField]: tagValue }
                      : item,
                  ),
                );
                setFilteredCandidates((prev) =>
                  prev.map((item) =>
                    item.candidate_id === candidate.candidate_id
                      ? { ...item, [backendField]: tagValue }
                      : item,
                  ),
                );

                showCAlert(`${label} updated`, "success");
                setEditingTag(null);
                setTagValue("");
              } catch (err) {
                console.error(err);
                showCAlert("Failed to update", "danger");
              }
            } else if (e.key === "Escape") {
              setEditingTag(null);
              setTagValue("");
            }
          }}
          style={inputTagStyle}
          autoFocus
        />
      );
    }

    return (
      <span
        style={tagStyle}
        onClick={() => {
          setEditingTag(candidate.candidate_id + fieldKey);
          setTagValue(value); // ensures the tag input always has the correct initial value
        }}
      >
        {value || label || "Add"}
      </span>
    );
  };

  return (
    <CContainer
      style={{
        fontFamily: "Inter, sans-serif",
        marginTop: "0.7rem",
        maxWidth: "95vw",
      }}
    >
      <h3
        style={{ fontWeight: 550, marginBottom: "1.5rem", textAlign: "center" }}
      >
        Manage Candidates
      </h3>

      <div
        style={{ position: "fixed", top: "10px", right: "10px", zIndex: 9999 }}
      >
        {alerts.map((alert) => (
          <CAlert
            key={alert.id + Math.random()}
            color={alert.color}
            dismissible
          >
            {alert.message}
          </CAlert>
        ))}
      </div>

      {uploadingExcel && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
            pointerEvents: "none",
            fontSize: "1.2rem",
            color: "#326396",
            fontWeight: 500,
          }}
        >
          <div
            className="spinner-border text-primary"
            role="status"
            style={{ width: "3rem", height: "3rem" }}
          >
            <span className="visually-hidden">Loading...</span>
          </div>
          <p style={{ marginTop: "1rem" }}>Uploading Excel file…</p>
          {uploadProgress > 0 && (
            <p style={{ marginTop: "0.5rem", fontSize: "1rem" }}>
              {uploadProgress}%
            </p>
          )}
        </div>
      )}

      <CCard
        style={{
          background: "#ffffff",
          padding: "2rem 1rem",
          border: "1px solid #d4d5d6ff", // light grey border
          borderRadius: "0px", // square corners
          boxShadow: "none", // remove shadow
        }}
      >
        <CCardBody style={{ padding: "1rem", position: "relative" }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.5rem",
              alignItems: "flex-end",
              marginBottom: "1rem",
              padding: "0.75rem",
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "6px",
            }}
          >
            <div style={{ minWidth: "120px", flex: "1 1 100px" }}>
              <div style={{ fontSize: "0.65rem", color: "#64748b", marginBottom: "2px" }}>
                Location
              </div>
              <CFormInput
                size="sm"
                placeholder="Contains…"
                value={advancedFilters.location}
                onChange={(e) =>
                  setAdvancedFilters((f) => ({ ...f, location: e.target.value }))
                }
              />
            </div>
            <div style={{ minWidth: "100px", flex: "0 0 90px" }}>
              <div style={{ fontSize: "0.65rem", color: "#64748b", marginBottom: "2px" }}>
                Exp (yrs+)
              </div>
              <CFormInput
                size="sm"
                type="number"
                placeholder="Min yrs"
                value={advancedFilters.experience}
                onChange={(e) =>
                  setAdvancedFilters((f) => ({ ...f, experience: e.target.value }))
                }
              />
            </div>
            <div style={{ minWidth: "110px", flex: "1 1 90px" }}>
              <div style={{ fontSize: "0.65rem", color: "#64748b", marginBottom: "2px" }}>
                Salary min
              </div>
              <CFormInput
                size="sm"
                placeholder="e.g. 50k"
                value={advancedFilters.salaryMin}
                onChange={(e) =>
                  setAdvancedFilters((f) => ({ ...f, salaryMin: e.target.value }))
                }
              />
            </div>
            <div style={{ minWidth: "110px", flex: "1 1 90px" }}>
              <div style={{ fontSize: "0.65rem", color: "#64748b", marginBottom: "2px" }}>
                Salary max
              </div>
              <CFormInput
                size="sm"
                placeholder="e.g. 120k"
                value={advancedFilters.salaryMax}
                onChange={(e) =>
                  setAdvancedFilters((f) => ({ ...f, salaryMax: e.target.value }))
                }
              />
            </div>
            <div style={{ minWidth: "140px", flex: "1 1 120px" }}>
              <div style={{ fontSize: "0.65rem", color: "#64748b", marginBottom: "2px" }}>
                Position
              </div>
              <CFormInput
                size="sm"
                placeholder="Contains…"
                value={advancedFilters.position}
                onChange={(e) =>
                  setAdvancedFilters((f) => ({ ...f, position: e.target.value }))
                }
              />
            </div>
            <div style={{ minWidth: "160px", flex: "1 1 140px" }}>
              <div style={{ fontSize: "0.65rem", color: "#64748b", marginBottom: "2px" }}>
                Client
              </div>
              <select
                className="form-select form-select-sm"
                style={{ fontSize: "0.8rem" }}
                value={advancedFilters.clientId}
                onChange={(e) =>
                  setAdvancedFilters((f) => ({ ...f, clientId: e.target.value }))
                }
              >
                <option value="">Any client</option>
                {clients.map((cl) => (
                  <option key={cl.user_id} value={cl.user_id}>
                    {cl.full_name}
                  </option>
                ))}
              </select>
            </div>
            <CButton
              color="secondary"
              size="sm"
              variant="outline"
              style={{ fontSize: "0.75rem" }}
              onClick={() =>
                setAdvancedFilters({
                  location: "",
                  position: "",
                  experience: "",
                  salaryMin: "",
                  salaryMax: "",
                  clientId: "",
                })
              }
            >
              Clear filters
            </CButton>
          </div>

          {/* Search bar centered and longer */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: "1.5rem",
            }}
          >
            <SearchBarWithIcons
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              starred={starred}
              setStarred={setStarred}
              setShowFrequencyModal={setShowFrequencyModal}
              setShowXlsModal={setShowXlsModal}
              setShowCvModal={setShowCvModal}
              uploadingExcel={uploadingExcel}
              uploadingCV={uploadingCV}
              uploadProgress={uploadProgress}
              showAlert={showCAlert}
              onExportCsv={handleExportFilteredCsv}
            />
          </div>
          {/* "View more" link - positioned in corner */}
          {/* <button
            type="button"
            onClick={() => navigate('/all-candidates')}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              border: 'none',
              background: 'transparent',
              color: '#2563eb',
              fontSize: '0.78rem',
              fontWeight: 400,
              textDecoration: 'underline',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              padding: 0,
            }}
          >
            View more
          </button> */}

          <CModal
            visible={showXlsModal}
            onClose={() => {
              setShowXlsModal(false);
            }}
            alignment="center"
            scrollable
          >
            <CModalHeader closeButton>Upload Excel</CModalHeader>
            <CModalBody style={{ maxHeight: "60vh", overflowY: "auto" }}>
              <BulkUpload
                onSuccess={() => {
                  setShowXlsModal(false);
                  window.location.reload();
                }}
              />
            </CModalBody>
            <CModalFooter>
              <CButton
                color="secondary"
                onClick={() => {
                  setShowXlsModal(false);
                }}
              >
                Close
              </CButton>
            </CModalFooter>
          </CModal>

          <CModal visible={showCvModal} onClose={() => setShowCvModal(false)}>
            <CModalHeader closeButton>
              <span style={{ fontSize: "1rem", fontWeight: 500 }}>
                Upload CVs
              </span>
            </CModalHeader>
            <CModalBody
              style={{ fontSize: "0.85rem", padding: "1rem 1.5rem" }}
              className="c-modal-body"
            >
              <CVUpload
                onUpload={handleCVUpload}
                uploading={uploadingCV}
                uploadProgress={uploadProgress}
                selectedFiles={selectedFiles}
                setSelectedFiles={setSelectedFiles}
              />
            </CModalBody>
            <CModalFooter>
              <CButton
                color="secondary"
                size="sm"
                style={{
                  fontSize: "0.8rem",
                  padding: "0.3rem 0.7rem",
                  borderRadius: "8px",
                }}
                onClick={() => setShowCvModal(false)}
                disabled={uploadingCV}
              >
                Close
              </CButton>
            </CModalFooter>
          </CModal>

          {/* Table */}
          <div
            className="table-scroll"
            style={{
              overflowX: "auto",
              overflowY: "auto",
              maxHeight: isMobile ? "350px" : "480px",
              width: "100%",
              WebkitOverflowScrolling: "touch", // Smooth scrolling on iOS
            }}
          >
            <CTable
              className="align-middle app-data-table"
              style={{
                minWidth: isMobile ? "1000px" : "1800px",
                borderCollapse: "collapse",
                border: "1px solid #d1d5db",
                whiteSpace: "nowrap",
                tableLayout: "auto",
              }}
            >
              {/* Table Head */}
              <CTableHead
                color="light"
                style={{ borderBottom: "2px solid #d1d5db" }}
              >
                <CTableRow>
                  <CTableHeaderCell
                    style={{ border: "1px solid #d1d5db", padding: "0.75rem" }}
                  >
                    Name
                  </CTableHeaderCell>
                  <CTableHeaderCell
                    style={{ border: "1px solid #d1d5db", padding: "0.75rem" }}
                  >
                    Email
                  </CTableHeaderCell>
                  <CTableHeaderCell
                    style={{ border: "1px solid #d1d5db", padding: "0.75rem" }}
                  >
                    Phone
                  </CTableHeaderCell>
                  <CTableHeaderCell
                    style={{ border: "1px solid #d1d5db", padding: "0.75rem" }}
                  >
                    Location
                  </CTableHeaderCell>
                  <CTableHeaderCell
                    style={{ border: "1px solid #d1d5db", padding: "0.75rem" }}
                  >
                    Experience
                  </CTableHeaderCell>
                  <CTableHeaderCell
                    style={{ border: "1px solid #d1d5db", padding: "0.75rem" }}
                  >
                    Position
                  </CTableHeaderCell>
                  <CTableHeaderCell
                    style={{ border: "1px solid #d1d5db", padding: "0.75rem" }}
                  >
                    Current Salary
                  </CTableHeaderCell>
                  <CTableHeaderCell
                    style={{ border: "1px solid #d1d5db", padding: "0.75rem" }}
                  >
                    Expected Salary
                  </CTableHeaderCell>
                  <CTableHeaderCell
                    style={{ border: "1px solid #d1d5db", padding: "0.75rem" }}
                  >
                    Client
                  </CTableHeaderCell>
                  <CTableHeaderCell
                    style={{ border: "1px solid #d1d5db", padding: "0.75rem" }}
                  >
                    Sourced ByOwnership
                  </CTableHeaderCell>
                  {/* <CTableHeaderCell>Status</CTableHeaderCell> */}
                  <CTableHeaderCell
                    style={{ border: "1px solid #d1d5db", padding: "0.75rem" }}
                  >
                    Placement Status
                  </CTableHeaderCell>
                  <CTableHeaderCell
                    style={{ border: "1px solid #d1d5db", padding: "0.75rem" }}
                  >
                    Resume (Original)
                  </CTableHeaderCell>
                  <CTableHeaderCell
                    style={{ border: "1px solid #d1d5db", padding: "0.75rem" }}
                  >
                    Actions
                  </CTableHeaderCell>
                </CTableRow>
              </CTableHead>

              {/* Table Body */}
              <CTableBody>
                {/*filteredCandidates.length > 0 ? filteredCandidates.map(c => (
                 */}
                {filteredCandidates.length > 0 ? (
                  filteredCandidates.map((c) => (
                    <CTableRow
                      key={c.candidate_id}
                      style={{
                        backgroundColor: "#fff",
                        fontSize: "0.85rem", // smaller font
                      }}
                    >
                      <CTableDataCell
                        style={{
                          border: "1px solid #d1d5db",
                          padding: "0.75rem",
                        }}
                      >
                        {c.name || "-"}
                      </CTableDataCell>
                      <CTableDataCell
                        style={{
                          border: "1px solid #d1d5db",
                          padding: "0.75rem",
                        }}
                      >
                        {c.email}
                      </CTableDataCell>
                      <CTableDataCell
                        style={{
                          border: "1px solid #d1d5db",
                          padding: "0.75rem",
                        }}
                      >
                        {c.phone || "-"}
                      </CTableDataCell>
                      <CTableDataCell
                        style={{
                          border: "1px solid #d1d5db",
                          padding: "0.75rem",
                        }}
                      >
                        {c.location || "-"}
                      </CTableDataCell>
                      <CTableDataCell
                        style={{
                          border: "1px solid #d1d5db",
                          padding: "0.75rem",
                        }}
                      >
                        {renderFieldOrTag(
                          c,
                          "experience_years",
                          "Add Exp",
                          "number",
                        )}
                      </CTableDataCell>
                      <CTableDataCell
                        style={{
                          border: "1px solid #d1d5db",
                          padding: "0.75rem",
                        }}
                      >
                        {renderFieldOrTag(
                          c,
                          "position_applied",
                          "Add Position",
                          "string",
                        )}
                      </CTableDataCell>
                      <CTableDataCell
                        style={{
                          border: "1px solid #d1d5db",
                          padding: "0.75rem",
                        }}
                      >
                        {renderFieldOrTag(
                          c,
                          "current_last_salary",
                          "Add Salary",
                          "string",
                        )}
                      </CTableDataCell>
                      <CTableDataCell
                        style={{
                          border: "1px solid #d1d5db",
                          padding: "0.75rem",
                        }}
                      >
                        {renderFieldOrTag(
                          c,
                          "expected_salary",
                          "Add Expected",
                          "string",
                        )}
                      </CTableDataCell>
                      <CTableDataCell
                        style={{
                          border: "1px solid #d1d5db",
                          padding: "0.75rem",
                          maxWidth: "12rem",
                        }}
                      >
                        {canAssignClient ? (
                          <select
                            value={c.clientassigned_id || ""}
                            onChange={(e) =>
                              handleAssignClient(c.candidate_id, e.target.value)
                            }
                            style={{
                              padding: "4px",
                              fontSize: "0.75rem",
                              borderRadius: "4px",
                              border: "1px solid #d1d5db",
                              maxWidth: "11rem",
                            }}
                          >
                            <option value="">Select client</option>
                            {clients.map((cl) => (
                              <option key={cl.user_id} value={cl.user_id}>
                                {cl.full_name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          getCandidateClientDisplayName(c, clients) || "—"
                        )}
                      </CTableDataCell>
                      <CTableDataCell
                        style={{
                          border: "1px solid #d1d5db",
                          padding: "0.75rem",
                        }}
                      >
                        {renderFieldOrTag(c, "sourced_by_name", "Add Source")}
                      </CTableDataCell>
                      {/*    <CTableDataCell style={{ padding: '0.5rem' }}>{renderFieldOrTag(c, 'candidate_status', 'Add Status')}</CTableDataCell> */}
                      <CTableDataCell
                        style={{
                          border: "1px solid #d1d5db",
                          padding: "0.75rem",
                        }}
                      >
                        {renderFieldOrTag(
                          c,
                          "placement_status",
                          "Add Placement",
                        )}
                      </CTableDataCell>

                      {/* Original Resume */}
                      <CTableDataCell
                        style={{
                          border: "1px solid #d1d5db",
                          padding: "0.75rem",
                        }}
                      >
                        {c.resume_url ? (
                          <button
                            onClick={() => handleDownload(c, "original")}
                            style={{
                              fontSize: "0.75rem",
                              color: "#326396",
                              cursor: "pointer",
                              background: "none",
                              border: "none",
                              padding: 0,
                            }}
                          >
                            Download Original
                          </button>
                        ) : (
                          "No Original"
                        )}
                        {c.source === "xls" && !c.resume_url && (
                          <CButton
                            color="primary"
                            size="sm"
                            style={{
                              marginLeft: "0.25rem",
                              fontSize: "0.75rem",
                            }}
                            className="button-original"
                            onClick={() => {
                              setShowCvModal(true);
                              setCurrentNotesCandidate(c);
                              setCvTypeToUpload("original");
                            }}
                          >
                            Upload Original
                          </CButton>
                        )}
                      </CTableDataCell>

                      {/* Actions */}
                      <CTableDataCell
                        style={{
                          border: "1px solid #d1d5db",
                          padding: "0.75rem",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            gap: "6px",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <CIcon
                            icon={cilPencil}
                            style={{
                              fontSize: "0.75rem",
                              color: "#3b82f6",
                              cursor: "pointer",
                            }}
                            onClick={() => {
                              console.log("Pencil clicked", c);
                              handleEdit(c, setEditingCandidate);
                            }}
                          />

                          <CIcon
                            icon={cilTrash}
                            style={{
                              fontSize: "0.75rem",
                              color: "#ef4444",
                              cursor: "pointer",
                            }}
                            onClick={() => handleDelete(c)}
                          />
                          <CIcon
                            icon={cilBook}
                            style={{
                              fontSize: "0.75rem",
                              color: c.notes ? "#326396" : "#444343ff",
                              cursor: "pointer",
                            }}
                            onClick={() => {
                              setCurrentNotesCandidate(c);
                              setNotesText(c.notes || "");
                              setNotesModalVisible(true);
                            }}
                          />
                        </div>
                      </CTableDataCell>
                    </CTableRow>
                  ))
                ) : (
                  <CTableRow>
                    <CTableDataCell
                      colSpan="13"
                      className="text-center text-muted"
                      style={{
                        border: "1px solid #d1d5db",
                        padding: "0.75rem",
                        fontSize: "0.75rem",
                      }}
                    >
                      No candidates found.
                    </CTableDataCell>
                  </CTableRow>
                )}
              </CTableBody>
            </CTable>
          </div>
          <div
            // style={{ display: 'flex', marginBottom: '10px', marginTop: '10px' }}
            className="view-more-wrapper"
          >
            <CButton
              color="primary"
              style={{
                backgroundColor: "#1f3c88",
                borderRadius: 1,
                marginTop: 20,
              }}
              size="sm"
              onClick={() =>
                navigate("/all-candidates", {
                  //  state: {
                  //   filteredCandidates,    // send all candidates
                  //  starred,
                  // searchQuery,
                  // otherDataYouNeed: "anything"
                  //}
                })
              }
            >
              View More
            </CButton>

            {/* <CButton
              color="primary"
              size="sm"
              onClick={() => {
                // 1. Get the user from localStorage or state
                const user = JSON.parse(localStorage.getItem("user"));

                // 2. Navigate and pass the data
                navigate("/all-candidates", {
                  state: {
                    recruiterId: user?.user_id,
                    role: user?.role,
                  }
                });
              }}
            >
              View More
            </CButton> */}
          </div>
        </CCardBody>
      </CCard>

      <CandidateModals
        editingCandidate={editingCandidate}
        setEditingCandidate={setEditingCandidate}
        handleSave={handleSave}
        deletingCandidate={deletingCandidate}
        setDeletingCandidate={setDeletingCandidate}
        handleConfirmDelete={handleConfirmDelete}
        notesModalVisible={notesModalVisible}
        setNotesModalVisible={setNotesModalVisible}
        currentNotesCandidate={currentNotesCandidate}
        notesText={notesText}
        setNotesText={setNotesText}
        showCAlert={showCAlert}
        refreshCandidates={refreshCandidates}
        // Frequency Modal
        showFrequencyModal={showFrequencyModal}
        setShowFrequencyModal={setShowFrequencyModal}
        selectedFrequency={selectedFrequency}
        setSelectedFrequency={setSelectedFrequency}
        handleSaveSearch={handleSaveSearch}
        savingSearch={savingSearch}
        creatingNote={creatingNote}
        handleCreateNote={handleCreateNote}
        refreshNotes={refreshNotes}
        // Excel & CV upload functions passed as props
        showXlsModal={showXlsModal}
        setShowXlsModal={setShowXlsModal}
        showCvModal={showCvModal}
        setShowCvModal={setShowCvModal}
      />
    </CContainer>
  );
};

export default DisplayCandidates;
