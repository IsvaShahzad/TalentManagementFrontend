import React, { useState, useEffect, useRef } from "react";
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
  assignClientToCandidate,
  deleteCandidateApi,
  generateRedactedResume,
  getAll_Notes,
  getAllCandidates,
  getAllClients,
  saveSearchApi,
  updateCandidateByEmailApi,
  updateCandidateStatus,
  getRecruiterCandidatesApi,
} from "../../../api/api";
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
import {
  filterTalentPool,
  getCandidateClientDisplayName,
} from "../../../utils/candidateFilters";
import { downloadCandidatesCsv } from "../../../utils/downloadCandidatesCsv";

const EllipsisCell = ({ value, children, onShowFull }) => {
  const str =
    value != null && value !== ""
      ? String(value)
      : children != null
        ? String(children)
        : "";
  return (
    <div
      title={str}
      onClick={() => str && onShowFull(str)}
      style={{
        maxWidth: "100%",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        cursor: str ? "pointer" : "default",
      }}
    >
      {children ?? str}
    </div>
  );
};

const DisplayAllCandidates = () => {
  const [cellOverflowText, setCellOverflowText] = useState(null);
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
  const [userRole, setUserRole] = useState("Recruiter");
  const [savedSearches, setSavedSearches] = useState([]);
  const [localCandidates, setLocalCandidates] = useState([]);
  const [starred, setStarred] = useState(false);
  const [uploadingExcel, setUploadingExcel] = useState(false);
  const [uploadingCV, setUploadingCV] = useState(false);

  const [selectedFrequency, setSelectedFrequency] = useState("none");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [showFrequencyModal, setShowFrequencyModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [notes, setNotes] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25); // adjust as needed

  const [selectedCandidateIds, setSelectedCandidateIds] = useState([]);
  const [bulkStatusChoice, setBulkStatusChoice] = useState("");
  const [bulkUpdating, setBulkUpdating] = useState(false);
  const headerSelectCheckboxRef = useRef(null);

  const [candidatesLoading, setCandidatesLoading] = useState(true); // optional: show loading state
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [currentCandidateForRedact, setCurrentCandidateForRedact] =
    useState(null);
  const [redactedUrl, setRedactedUrl] = useState("");
  const [showRedactModal, setShowRedactModal] = useState(false);
  const [generatingRedacted, setGeneratingRedacted] = useState(false);
  const [redactedGenerated, setRedactedGenerated] = useState(false);
  const navigate = useNavigate();

  // --- Pagination logic ---
  const indexOfLastCandidate = currentPage * pageSize;
  const indexOfFirstCandidate = indexOfLastCandidate - pageSize;
  const currentCandidates = filteredCandidates.slice(
    indexOfFirstCandidate,
    indexOfLastCandidate,
  );

  const totalPages = Math.ceil(filteredCandidates.length / pageSize);

  const STATUS_OPTIONS = [
    "submitted",
    "sourced",
    "shortlisted",
    "interviewing",
    "offered",
    "placed",
    "rejected",
  ];

  const [clients, setClients] = useState([]);
  const [advancedFilters, setAdvancedFilters] = useState({
    location: "",
    position: "",
    experience: "",
    salaryMin: "",
    salaryMax: "",
    clientId: "",
  });

  const currentUser = JSON.parse(localStorage.getItem("user"));
  const canAssignClient =
    currentUser?.role === "Admin" || currentUser?.role === "Recruiter";

  // Add these to your state declarations if not already present
  const location = useLocation();
  const passedRecruiterId = location.state?.recruiterId;
  const passedRole = location.state?.role;

  const refreshCandidates = async () => {
    try {
      setCandidatesLoading(true);
      let candidatesData;

      if (passedRole === "Recruiter" || currentUser?.role === "Recruiter") {
        candidatesData = await getRecruiterCandidatesApi();
      } else {
        // Admin/HR see everything
        candidatesData = await getAllCandidates();
      }

      setLocalCandidates(candidatesData);
      setFilteredCandidates(candidatesData);
    } catch (err) {
      console.error("Failed to fetch candidates:", err);
      showCAlert("Failed to load candidates", "danger");
    } finally {
      setCandidatesLoading(false);
    }
  };

  useEffect(() => {
    refreshCandidates();
    getClients();
  }, [passedRecruiterId]); // Re-run if the ID changes

  const getClients = async () => {
    try {
      const allClients = await getAllClients();
      console.log("clients fetched", allClients.data);
      setClients(allClients.data);
      // setFilteredCandidates(allCandidates);
    } catch (err) {
      console.error("Failed to fetch clients:", err);
      showCAlert("Failed to load clients", "danger");
    }
  };
  useEffect(() => {
    setFilteredCandidates(
      filterTalentPool(localCandidates, advancedFilters, searchQuery),
    );
  }, [localCandidates, advancedFilters, searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredCandidates]);

  useEffect(() => {
    const indexOfLast = currentPage * pageSize;
    const indexOfFirst = indexOfLast - pageSize;
    const pageSlice = filteredCandidates.slice(indexOfFirst, indexOfLast);
    const pageIds = pageSlice.map((c) => String(c.candidate_id));
    const n = pageIds.filter((id) => selectedCandidateIds.includes(id)).length;
    const el = headerSelectCheckboxRef.current;
    if (!el || pageIds.length === 0) {
      if (el) el.indeterminate = false;
      return;
    }
    el.indeterminate = n > 0 && n < pageIds.length;
  }, [filteredCandidates, currentPage, pageSize, selectedCandidateIds]);

  const handleSignInClick = (candidate) => {
    if (!candidate.resume_url) {
      showCAlert("Original resume not uploaded", "danger");
      return;
    }
    setCurrentCandidateForRedact(candidate);
    setShowRedactModal(true);
    setRedactedUrl("");
    setRedactedGenerated(false);
  };

  // const handleGenerateRedacted = async () => {
  //   if (!currentCandidateForRedact) return;

  //   setGeneratingRedacted(true);

  //   try {
  //     const data = await generateRedactedResume(currentCandidateForRedact.candidate_id);

  //     // Store both URLs
  //     setRedactedUrl(data.redactedUrl); // Signed URL for immediate download
  //     setRedactedGenerated(true);
  //     showCAlert('Redacted resume generated successfully', 'success');
  //     setShowRedactModal(false);
  //     refreshCandidates();

  //   } catch (err) {
  //     console.error('Failed to generate redacted resume:', err);
  //     showCAlert(err.message || 'Failed to generate redacted resume', 'danger');
  //   } finally {
  //     setGeneratingRedacted(false);
  //   }
  // };

  const handleGenerateRedacted = async () => {
    if (!currentCandidateForRedact) return;

    setGeneratingRedacted(true);

    try {
      await generateRedactedResume(currentCandidateForRedact.candidate_id);

      setRedactedGenerated(true);
      showCAlert("Redacted resume generated successfully", "success");
      setShowRedactModal(false);
      refreshCandidates(); // DB now has the S3 KEY
    } catch (err) {
      console.error("Failed to generate redacted resume:", err);
      showCAlert(err.message || "Failed to generate redacted resume", "danger");
    } finally {
      setGeneratingRedacted(false);
    }
  };

  const handleClientChange = async (candidateId, clientId) => {
    await assignClientToCandidate(candidateId, clientId);
    setLocalCandidates((prev) =>
      prev.map((c) =>
        c.candidate_id === candidateId
          ? { ...c, clientassigned_id: clientId || "" }
          : c,
      ),
    );

    showCAlert("Assigned client successfully", "success");
    refreshCandidates();
  };

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

  const applySavedSearchToTable = (s) => {
    const fp =
      s.filters &&
      typeof s.filters === "object" &&
      !Array.isArray(s.filters)
        ? s.filters
        : {};
    const pos =
      s.position_applied ||
      fp.position ||
      "";
    const expRaw =
      s.experience_years != null && s.experience_years !== ""
        ? s.experience_years
        : fp.experience != null
          ? fp.experience
          : "";
    setSearchQuery(s.query || "");
    setAdvancedFilters({
      location: "",
      position: pos ? String(pos) : "",
      experience:
        expRaw !== "" && expRaw != null ? String(expRaw) : "",
      salaryMin: "",
      salaryMax: "",
      clientId: "",
    });
    showCAlert("Showing saved search results in the table", "success", 1200);
  };

  useEffect(() => {
    const payload = location.state?.savedSearchPayload;
    if (!payload) return;
    applySavedSearchToTable(payload);
    navigate(
      {
        pathname: location.pathname,
        search: location.search,
        hash: location.hash,
      },
      {
        replace: true,
        state: { ...location.state, savedSearchPayload: undefined },
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-shot apply from navigation state
  }, [location.state?.savedSearchPayload]);

  // Update the download function to use the signed URL
  // const handleDownloadRedacted = () => {
  //   if (redactedUrl) {
  //     window.open(redactedUrl, '_blank');
  //   } else if (currentCandidateForRedact?.resume_url_redacted) {
  //     // Fallback: if we have the permanent URL but no signed URL,
  //     // you might want to generate a signed URL here
  //     handleGenerateRedacted();
  //   }
  // };

  const handleDownloadRedacted = async () => {
    try {
      if (!currentCandidateForRedact?.candidate_id) return;

      const { signedUrl } = await getRedactedResumeSignedUrl(
        currentCandidateForRedact.candidate_id,
      );

      window.open(signedUrl, "_blank");
    } catch (err) {
      console.error(err);
      showCAlert("Failed to download redacted resume", "danger");
    }
  };

  const hasRedactedResume = (candidate) => {
    return (
      candidate &&
      candidate.resume_url_redacted &&
      candidate.resume_url_redacted.trim() !== "" &&
      candidate.resume_url_redacted !== null &&
      candidate.resume_url_redacted !== undefined
    );
  };

  const tagStyle = {
    background: "#e3efff",
    color: "#326396",
    padding: "2px 6px",
    borderRadius: "15px",
    cursor: "pointer",
  };

  const inputTagStyle = {
    border: "1px solid #d1d5db",
    borderRadius: "0.5rem",
    padding: "2px 4px",
    width: "68px",
    marginTop: "2px",
  };
  const alertStyle = {
    fontSize: "1px", // smaller font
    padding: "6px 10px",
    lineHeight: "1.3",
  };

  useEffect(() => {
    refreshNotes();
  }, [location.pathname]);

  const refreshNotes = async () => {
    try {
      const res = await getAll_Notes();
      setNotes(res.notes);
    } catch (err) {
      console.error(err);
    }
  };

  const refreshPage = () => {
    window.location.reload();
  };

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

  const handleDownload = async (candidate, type) => {
    try {
      if (type === "original") {
        // Original CV: keep the exact filename from upload (backend sets it)
        const url = await getCandidateDownloadUrl(candidate.candidate_id);
        downloadFile(url); // no filename override
      } else {
        // Redacted CV: use signed URL (PDF), keep simple name
        const signedUrl = await getCandidateSignedUrl(
          candidate.candidate_id,
          type,
        );
        const filename = `${candidate.name}_Redacted.pdf`;
        downloadFile(signedUrl, filename);
      }
    } catch {
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
    } catch (err) {
      console.error(err);
      showCAlert("Failed to save changes", "danger");
    }
  };

  const handleDelete = (candidate) =>
    deleteHandler(candidate, setDeletingCandidate);

  const handleConfirmDelete = () => {
    confirmDeleteHandler({
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
          Select one or more CVs to upload (PDF, DOC, DOCX)
        </p>
      </div>
    );
  };

  useEffect(() => {
    const userObj = localStorage.getItem("user");
    if (userObj) {
      const user = JSON.parse(userObj);
      setUserId(user.user_id);
      setUserRole(user.role || "Recruiter");

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

  const handleExcelUpload = async (file, attachedCVs = {}) => {
    if (!file) {
      showCAlert("Please select a file to upload.", "warning");
      return;
    }

    setUploadingExcel(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Attach CVs per email
      // attachedCVs should be an object: { "email1@example.com": File, "email2@example.com": File }
      for (const [email, cvFile] of Object.entries(attachedCVs)) {
        formData.append(email, cvFile); // must match backend: req.files[email]
      }

      const xhr = new XMLHttpRequest();
      xhr.open(
        "POST",
        `${import.meta.env.VITE_API_BASE_URL}/candidate/bulk-upload`,
        true,
      );
      const token = localStorage.getItem("authToken");
      if (token) {
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      }

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percent);
        }
      };

      xhr.onload = async () => {
        setUploadingExcel(false);
        setShowXlsModal(false);

        if (xhr.status === 200) {
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
              `${duplicates.length} duplicate(s) skipped`,
              "warning",
            );
          if (linked.length > 0)
            showCAlert(
              `${linked.length} existing candidate(s) linked to your account`,
              "info",
            );
          if (created.length > 0) {
            showCAlert(
              `${created.length} candidate(s) uploaded successfully`,
              "success",
            );

            // if (refreshCandidates) await refreshCandidates(); // refresh from backend
            // ✅ Add new candidates instantly
            const newCandidates = created.map((c) => ({
              ...c,
              position_applied: c.position || "",
              experience_years: c.experience || "",
              source: "xls",
            }));

            setLocalCandidates((prev) => [...prev, ...newCandidates]);
            setFilteredCandidates((prev) => [...prev, ...newCandidates]);
            if (refreshCandidates) {
              await refreshCandidates();
            }
            setShowXlsModal(false);
            setUploadingExcel(false);
          }
          //   refreshPage();
          //if (refreshCandidates) await refreshCandidates(); // refresh from backend
        } else {
          showCAlert("Failed to upload Excel. Server error.", "danger");
        }
      };

      xhr.onerror = () => {
        setUploadingExcel(false);
        showCAlert("Excel upload failed. Check console.", "danger");
      };

      xhr.send(formData);
      if (refreshCandidates) {
        await refreshCandidates();
      }
      setShowXlsModal(false);
      setUploadingExcel(false);
      //  refreshPage();
    } catch (err) {
      console.error("Excel upload error:", err);
      setUploadingExcel(false);
      showCAlert("Excel upload failed. Check console.", "danger");
    }
  };

  const handleCVUpload = async (files) => {
    if (!files || files.length === 0) {
      showCAlert("Please select at least one CV to upload.", "warning");
      return;
    }

    setUploadingCV(true);
    setUploadProgress(0);

    try {
      if (currentNotesCandidate && currentNotesCandidate.source === "xls") {
        const file = files[0];
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
          setShowCvModal(false);

          setLocalCandidates((prev) =>
            prev.map((c) =>
              c.candidate_id === currentNotesCandidate.candidate_id
                ? { ...c, resume_url: resumeUrl, source: "cv" }
                : c,
            ),
          );

          setFilteredCandidates((prev) =>
            prev.map((c) =>
              c.candidate_id === currentNotesCandidate.candidate_id
                ? { ...c, resume_url: resumeUrl, source: "cv" }
                : c,
            ),
          );
          refreshCandidates();
          setCurrentNotesCandidate(null);
        } else {
          showCAlert(data.message || "CV upload failed", "danger");
          setShowCvModal(false);
        }
        setSelectedFiles(null);
      } else {
        await new Promise((resolve) => {
          const formData = new FormData();
          for (const file of files) formData.append("files", file);
          formData.append("role", userRole || "Recruiter");
          if (userId) {
            formData.append("recruiterId", userId);
          }

          const xhr = new XMLHttpRequest();
          xhr.open(
            "POST",
            `${import.meta.env.VITE_API_BASE_URL}/candidate/bulk-upload-cvs`,
            true,
          );
          const token = localStorage.getItem("authToken");
          if (token) {
            xhr.setRequestHeader("Authorization", `Bearer ${token}`);
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
            setShowCvModal(false);

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
                  );

                if (linked.length > 0)
                  showCAlert(
                    `${linked.length} existing candidate(s) linked to your account`,
                    "info",
                  );

                if (created.length > 0) {
                  showCAlert(
                    `${created.length} candidate(s) uploaded successfully`,
                    "success",
                  );

                  setLocalCandidates((prev) =>
                    prev.map((c) => {
                      const uploaded = created.find((u) => u.email === c.email);
                      if (uploaded) {
                        return {
                          ...c,
                          resume_url: uploaded.resume_url,
                          source: "cv",
                        };
                      }
                      return c;
                    }),
                  );

                  setFilteredCandidates((prev) =>
                    prev.map((c) => {
                      const uploaded = created.find((u) => u.email === c.email);
                      if (uploaded) {
                        return {
                          ...c,
                          resume_url: uploaded.resume_url,
                          source: "cv",
                        };
                      }
                      return c;
                    }),
                  );
                }
                refreshCandidates();
              } catch (parseErr) {
                console.error(parseErr);
                showCAlert("Could not read upload response.", "danger");
              }
            } else {
              let errorMessage = "Failed to upload CVs. Server error.";
              let alertType = "danger";
              try {
                const errData = JSON.parse(xhr.responseText || "{}");
                if (errData?.message) {
                  errorMessage = errData.message;
                }
                if (
                  xhr.status === 409 ||
                  /duplicate/i.test(errorMessage)
                ) {
                  alertType = "warning";
                }
              } catch (_e) {
                /* keep default */
              }
              showCAlert(errorMessage, alertType);
            }

            setSelectedFiles(null);
            resolve();
          };

          xhr.onerror = () => {
            setUploadingCV(false);
            setUploadProgress(0);
            setShowCvModal(false);
            showCAlert("CV upload failed. Check console.", "danger");
            setSelectedFiles(null);
            resolve();
          };

          xhr.send(formData);
        });
      }
    } catch (err) {
      console.error(err);
      showCAlert("CV upload failed", "danger");
      setShowCvModal(false);
      setUploadingCV(false);
      setUploadProgress(0);
    } finally {
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
      const tagInputStyle =
        fieldKey === "experience_years"
          ? {
            ...inputTagStyle,
            width: "100%",
            minWidth: "56px",
            maxWidth: "140px",
          }
          : inputTagStyle
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
          style={tagInputStyle}
          autoFocus
        />
      );
    }

    const displayStr = String(value || label || "Add");
    return (
      <span
        style={tagStyle}
        title={displayStr}
        onClick={() => {
          setEditingTag(candidate.candidate_id + fieldKey);
          setTagValue(value);
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          setCellOverflowText(displayStr);
        }}
      >
        {value || label || "Add"}
      </span>
    );
  };

  const handleStatusChange = async (candidateId, newStatus) => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));

      const user = {
        userId: storedUser?.user_id,
        role: storedUser?.role,
      };

      if (!candidateId) return;

      // ✅ Optimistic UI update
      setLocalCandidates((prev) =>
        prev.map((c) =>
          c.candidate_id === candidateId
            ? { ...c, candidate_status: newStatus }
            : c,
        ),
      );

      setFilteredCandidates((prev) =>
        prev.map((c) =>
          c.candidate_id === candidateId
            ? { ...c, candidate_status: newStatus }
            : c,
        ),
      );

      await updateCandidateStatus(candidateId, {
        status: newStatus,
        user,
      });

      showCAlert("Status updated", "success");
    } catch (err) {
      console.error("Status update failed", err);
      showCAlert("Failed to update status", "danger");
      refreshCandidates(); // rollback safety
    }
  };

  const pageCandidateIds = currentCandidates.map((c) => String(c.candidate_id));
  const allOnPageSelected =
    pageCandidateIds.length > 0 &&
    pageCandidateIds.every((id) => selectedCandidateIds.includes(id));

  const toggleCandidateSelected = (candidateId) => {
    const k = String(candidateId);
    setSelectedCandidateIds((prev) =>
      prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k],
    );
  };

  const toggleSelectAllOnCurrentPage = () => {
    const pageIds = currentCandidates.map((c) => String(c.candidate_id));
    setSelectedCandidateIds((prev) => {
      const allSelected =
        pageIds.length > 0 && pageIds.every((id) => prev.includes(id));
      if (allSelected) {
        return prev.filter((id) => !pageIds.includes(id));
      }
      return Array.from(new Set([...prev, ...pageIds]));
    });
  };

  const selectAllFiltered = () => {
    setSelectedCandidateIds(
      filteredCandidates.map((c) => String(c.candidate_id)),
    );
  };

  const clearSelection = () => {
    setSelectedCandidateIds([]);
    setBulkStatusChoice("");
  };

  const handleBulkStatusApply = async () => {
    if (!bulkStatusChoice || selectedCandidateIds.length === 0) return;
    const ids = [...selectedCandidateIds];
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    const user = {
      userId: storedUser?.user_id,
      role: storedUser?.role,
    };
    setBulkUpdating(true);
    setLocalCandidates((prev) =>
      prev.map((c) =>
        ids.includes(String(c.candidate_id))
          ? { ...c, candidate_status: bulkStatusChoice }
          : c,
      ),
    );
    setFilteredCandidates((prev) =>
      prev.map((c) =>
        ids.includes(String(c.candidate_id))
          ? { ...c, candidate_status: bulkStatusChoice }
          : c,
      ),
    );
    const BATCH = 12;
    let failed = 0;
    try {
      for (let i = 0; i < ids.length; i += BATCH) {
        const chunk = ids.slice(i, i + BATCH);
        const results = await Promise.allSettled(
          chunk.map((id) =>
            updateCandidateStatus(id, {
              status: bulkStatusChoice,
              user,
            }),
          ),
        );
        failed += results.filter((r) => r.status === "rejected").length;
      }
      if (failed > 0) {
        showCAlert(
          `${ids.length - failed} updated, ${failed} failed — refreshing list`,
          "warning",
        );
        refreshCandidates();
      } else {
        showCAlert(`Updated status for ${ids.length} candidate(s)`, "success");
      }
      clearSelection();
    } catch (err) {
      console.error(err);
      showCAlert("Bulk status update failed", "danger");
      refreshCandidates();
    } finally {
      setBulkUpdating(false);
    }
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
          <CAlert key={alert.id} color={alert.color} dismissible>
            {alert.message}
          </CAlert>
        ))}
      </div>

      {(uploadingExcel || uploadingCV) && (
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
            pointerEvents: "none", // ← allows clicks to pass through

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
          <p style={{ marginTop: "1rem" }}>
            {uploadingExcel ? "Uploading Excel file…" : "Uploading CVs…"}
          </p>
          {uploadProgress > 0 && (
            <p style={{ marginTop: "0.5rem", fontSize: "1rem" }}>
              {/*uploadProgress}% completed*/}
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
            {(userRole === "Admin" || userRole === "Recruiter") && (
              <CButton
                color="primary"
                variant="outline"
                size="sm"
                style={{ fontSize: "0.75rem" }}
                onClick={handleExportFilteredCsv}
              >
                Export filtered CSV
              </CButton>
            )}
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

          <CModal
            visible={showXlsModal}
            onClose={() => {
              setShowXlsModal(false);
            }}
          >
            <CModalHeader closeButton>Upload Excel</CModalHeader>
            <CModalBody>
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

          <CModal
            visible={showCvModal}
            onClose={() => {
              setShowCvModal(false);
              //  refreshPage();
            }}
          >
            <CModalHeader closeButton>
              <span style={{ fontSize: "1rem", fontWeight: 500 }}>
                Upload CVs
              </span>
            </CModalHeader>
            <CModalBody style={{ fontSize: "0.85rem", padding: "1rem 1.5rem" }}>
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
                onClick={() => {
                  // refreshPage();
                  setShowCvModal(false);
                }}
                disabled={uploadingCV}
              >
                Close
              </CButton>
            </CModalFooter>
          </CModal>

          <CModal
            visible={showRedactModal}
            onClose={() => setShowRedactModal(false)}
            size="lg"
          >
            <CModalHeader closeButton>
              <h5>
                Redact Resume - {currentCandidateForRedact?.name || "Candidate"}
              </h5>
            </CModalHeader>
            <CModalBody>
              <div style={{ padding: "1rem" }}>
                {/* Candidate Info */}
                <div style={{ marginBottom: "1.5rem" }}>
                  <h6>Candidate Information</h6>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "1rem",
                      marginTop: "0.5rem",
                    }}
                  >
                    <div>
                      <strong>Name:</strong>{" "}
                      {currentCandidateForRedact?.name || "N/A"}
                    </div>
                    <div>
                      <strong>Email:</strong>{" "}
                      {currentCandidateForRedact?.email || "N/A"}
                    </div>
                    <div>
                      <strong>Position:</strong>{" "}
                      {currentCandidateForRedact?.position_applied || "N/A"}
                    </div>
                    <div>
                      <strong>Status:</strong>{" "}
                      {currentCandidateForRedact?.candidate_status || "N/A"}
                    </div>
                  </div>
                </div>

                {/* Original Resume Info */}
                <div
                  style={{
                    marginBottom: "1.5rem",
                    padding: "1rem",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "0.5rem",
                  }}
                >
                  <h6>Original Resume</h6>
                  {currentCandidateForRedact?.resume_url ? (
                    <div style={{ marginTop: "0.5rem" }}>
                      <p>Original resume is available.</p>
                      <CButton
                        color="primary"
                        size="sm"
                        onClick={() =>
                          handleDownload(currentCandidateForRedact, "original")
                        }
                        style={{ marginRight: "0.5rem" }}
                      >
                        Download Original
                      </CButton>
                      <span style={{ fontSize: "0.85rem", color: "#6c757d" }}>
                        (Personal information will be redacted)
                      </span>
                    </div>
                  ) : (
                    <p style={{ color: "#dc3545" }}>
                      No original resume uploaded.
                    </p>
                  )}
                </div>

                {/* Redaction Section */}
                <div
                  style={{
                    marginBottom: "1.5rem",
                    padding: "1rem",
                    backgroundColor: "#e8f4fd",
                    borderRadius: "0.5rem",
                  }}
                >
                  <h6>Redacted Resume</h6>

                  {hasRedactedResume(currentCandidateForRedact) ? (
                    <div style={{ marginTop: "0.5rem" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginBottom: "1rem",
                        }}
                      >
                        <div
                          style={{
                            backgroundColor: "#28a745",
                            color: "white",
                            padding: "0.25rem 0.75rem",
                            borderRadius: "1rem",
                            fontSize: "0.85rem",
                            marginRight: "0.5rem",
                          }}
                        >
                          ✓ Already Generated
                        </div>
                        <CButton
                          color="success"
                          size="sm"
                          style={{ color: "white" }} // text color white
                          onClick={() =>
                            handleDownload(
                              currentCandidateForRedact,
                              "redacted",
                            )
                          }
                        >
                          Download Redacted
                        </CButton>
                      </div>
                      <p style={{ fontSize: "0.9rem", color: "#495057" }}>
                        Redacted version removes personal contact information
                        and LinkedIn URLs.
                      </p>
                    </div>
                  ) : redactedGenerated ? (
                    <div style={{ marginTop: "0.5rem" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginBottom: "1rem",
                        }}
                      >
                        <div
                          style={{
                            backgroundColor: "#28a745",
                            color: "white",
                            padding: "0.25rem 0.75rem",
                            borderRadius: "1rem",
                            fontSize: "0.85rem",
                            marginRight: "0.5rem",
                          }}
                        >
                          ✓ Generated Successfully
                        </div>
                        <CButton
                          color="success"
                          size="sm"
                          onClick={handleDownloadRedacted}
                        >
                          Download Redacted
                        </CButton>
                      </div>
                      <p style={{ fontSize: "0.9rem", color: "#495057" }}>
                        Redacted version has been generated and saved to the
                        candidate profile.
                      </p>
                    </div>
                  ) : (
                    <div style={{ marginTop: "0.5rem" }}>
                      <p style={{ marginBottom: "1rem" }}>
                        Generate a redacted version of the resume that removes:
                      </p>
                      <ul
                        style={{
                          marginBottom: "1.5rem",
                          paddingLeft: "1.5rem",
                        }}
                      >
                        <li>Email addresses</li>
                        <li>Phone numbers</li>
                        <li>LinkedIn URLs</li>
                        <li>Personal addresses</li>
                        <li>Other sensitive information</li>
                      </ul>

                      <CButton
                        color="primary"
                        onClick={handleGenerateRedacted}
                        disabled={
                          generatingRedacted ||
                          !currentCandidateForRedact?.resume_url
                        }
                        style={{ minWidth: "200px" }}
                      >
                        {generatingRedacted ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm"
                              role="status"
                              aria-hidden="true"
                              style={{ marginRight: "0.5rem" }}
                            ></span>
                            Generating...
                          </>
                        ) : (
                          "Generate Redacted Resume"
                        )}
                      </CButton>

                      {!currentCandidateForRedact?.resume_url && (
                        <p
                          style={{
                            color: "#dc3545",
                            marginTop: "0.5rem",
                            fontSize: "0.85rem",
                          }}
                        >
                          Cannot generate redacted resume - no original resume
                          available.
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Information about redaction */}
                <div
                  style={{
                    padding: "1rem",
                    backgroundColor: "#fff3cd",
                    borderRadius: "0.5rem",
                    border: "1px solid #ffc107",
                  }}
                >
                  <h6 style={{ color: "#856404" }}>ℹ️ About Redaction</h6>
                  <ul
                    style={{
                      marginBottom: 0,
                      fontSize: "0.85rem",
                      color: "#856404",
                    }}
                  >
                    <li>
                      Redacted resumes can be shared with clients while
                      protecting candidate privacy
                    </li>
                    <li>
                      The original resume is preserved and can be accessed when
                      needed
                    </li>
                    <li>
                      Once generated, the redacted resume is saved to the
                      candidate profile
                    </li>
                    <li>
                      You can regenerate if needed (will overwrite existing
                      redacted version)
                    </li>
                  </ul>
                </div>
              </div>
            </CModalBody>
            <CModalFooter>
              <CButton
                color="secondary"
                onClick={() => setShowRedactModal(false)}
              >
                Close
              </CButton>
              {redactedGenerated && (
                <CButton color="primary" onClick={handleDownloadRedacted}>
                  Download Redacted
                </CButton>
              )}
            </CModalFooter>
          </CModal>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "0.75rem",
              padding: "0.6rem 0.75rem",
              background: "#f0f4fa",
              borderRadius: "6px",
              border: "1px solid #d1d5db",
            }}
          >
            <span style={{ fontSize: "0.875rem", color: "#475569" }}>
              <strong>{selectedCandidateIds.length}</strong> selected
            </span>
            <select
              className="form-select form-select-sm"
              style={{ width: "auto", minWidth: "170px" }}
              value={bulkStatusChoice}
              onChange={(e) => setBulkStatusChoice(e.target.value)}
              disabled={bulkUpdating}
              aria-label="Bulk status"
            >
              <option value="">Set status (bulk)…</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <CButton
              color="primary"
              size="sm"
              disabled={
                !bulkStatusChoice ||
                selectedCandidateIds.length === 0 ||
                bulkUpdating
              }
              onClick={handleBulkStatusApply}
            >
              {bulkUpdating ? (
                <>
                  <CSpinner size="sm" className="me-1" />
                  Applying…
                </>
              ) : (
                "Apply to selected"
              )}
            </CButton>
            <CButton
              color="secondary"
              size="sm"
              variant="outline"
              disabled={selectedCandidateIds.length === 0 || bulkUpdating}
              onClick={clearSelection}
            >
              Clear selection
            </CButton>
            <CButton
              color="secondary"
              size="sm"
              variant="outline"
              disabled={bulkUpdating || filteredCandidates.length === 0}
              onClick={selectAllFiltered}
            >
              Select all filtered ({filteredCandidates.length})
            </CButton>
          </div>

          {/* Table */}
          <div
            className="table-scroll"
            style={{
              overflowX: "auto",
              overflowY: "auto",
              maxHeight: "480px",
              width: "100%",
              WebkitOverflowScrolling: "touch", // Smooth scrolling on iOS
            }}
          >
            <CTable
              className="align-middle app-data-table"
              style={{
                width: "max-content",
                maxWidth: "100%",
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
                    scope="col"
                    style={{
                      border: "1px solid #d1d5db",
                      padding: "0.32rem 0.4rem",
                      width: "2.75rem",
                      textAlign: "center",
                    }}
                    aria-label="Select rows"
                  >
                    <input
                      type="checkbox"
                      ref={headerSelectCheckboxRef}
                      checked={allOnPageSelected}
                      onChange={toggleSelectAllOnCurrentPage}
                      title="Select all on this page"
                      aria-label="Select all candidates on this page"
                    />
                  </CTableHeaderCell>
                  <CTableHeaderCell
                    style={{ border: "1px solid #d1d5db", padding: "0.32rem 0.4rem" }}
                  >
                    Name
                  </CTableHeaderCell>
                  <CTableHeaderCell
                    style={{ border: "1px solid #d1d5db", padding: "0.32rem 0.4rem" }}
                  >
                    Email
                  </CTableHeaderCell>
                  <CTableHeaderCell
                    style={{ border: "1px solid #d1d5db", padding: "0.32rem 0.4rem" }}
                  >
                    Phone
                  </CTableHeaderCell>
                  <CTableHeaderCell
                    style={{ border: "1px solid #d1d5db", padding: "0.32rem 0.4rem" }}
                  >
                    Location
                  </CTableHeaderCell>
                  <CTableHeaderCell
                    style={{ border: "1px solid #d1d5db", padding: "0.32rem 0.4rem" }}
                  >
                    Experience
                  </CTableHeaderCell>
                  <CTableHeaderCell
                    style={{ border: "1px solid #d1d5db", padding: "0.32rem 0.4rem" }}
                  >
                    Position
                  </CTableHeaderCell>
                  <CTableHeaderCell
                    style={{ border: "1px solid #d1d5db", padding: "0.32rem 0.4rem" }}
                  >
                    Current Salary
                  </CTableHeaderCell>
                  <CTableHeaderCell
                    style={{ border: "1px solid #d1d5db", padding: "0.32rem 0.4rem" }}
                  >
                    Expected Salary
                  </CTableHeaderCell>
                  <CTableHeaderCell
                    style={{ border: "1px solid #d1d5db", padding: "0.32rem 0.4rem" }}
                  >
                    Client
                  </CTableHeaderCell>
                  <CTableHeaderCell
                    style={{ border: "1px solid #d1d5db", padding: "0.32rem 0.4rem" }}
                  >
                    Sourced By
                  </CTableHeaderCell>
                  <CTableHeaderCell
                    style={{ border: "1px solid #d1d5db", padding: "0.32rem 0.4rem" }}
                  >
                    Status
                  </CTableHeaderCell>
                  <CTableHeaderCell
                    style={{ border: "1px solid #d1d5db", padding: "0.32rem 0.4rem" }}
                  >
                    Resume (Original)
                  </CTableHeaderCell>
                  <CTableHeaderCell
                    style={{ border: "1px solid #d1d5db", padding: "0.32rem 0.4rem" }}
                  >
                    Actions
                  </CTableHeaderCell>
                </CTableRow>
              </CTableHead>

              {/* Table Body */}
              <CTableBody>
                {/*filteredCandidates?.length > 0 ? filteredCandidates.map(c => (*/}

                {currentCandidates.length > 0 ? (
                  currentCandidates.map((c) => (
                    <CTableRow
                      key={String(c.candidate_id)}
                      style={{
                        backgroundColor: "#fff",
                      }}
                    >
                      <CTableDataCell
                        style={{
                          border: "1px solid #d1d5db",
                          padding: "0.32rem 0.4rem",
                          textAlign: "center",
                          verticalAlign: "middle",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedCandidateIds.includes(
                            String(c.candidate_id),
                          )}
                          onChange={() => toggleCandidateSelected(c.candidate_id)}
                          onClick={(e) => e.stopPropagation()}
                          aria-label={`Select ${c.name || "candidate"}`}
                        />
                      </CTableDataCell>
                      <CTableDataCell
                        style={{
                          border: "1px solid #d1d5db",
                          padding: "0.32rem 0.4rem",
                          maxWidth: "14rem",
                        }}
                      >
                        <EllipsisCell
                          value={c.name || "-"}
                          onShowFull={setCellOverflowText}
                        />
                      </CTableDataCell>
                      <CTableDataCell
                        style={{
                          border: "1px solid #d1d5db",
                          padding: "0.32rem 0.4rem",
                          maxWidth: "16rem",
                        }}
                      >
                        <EllipsisCell
                          value={c.email}
                          onShowFull={setCellOverflowText}
                        />
                      </CTableDataCell>
                      <CTableDataCell
                        style={{
                          border: "1px solid #d1d5db",
                          padding: "0.32rem 0.4rem",
                          maxWidth: "9rem",
                        }}
                      >
                        <EllipsisCell
                          value={c.phone || "-"}
                          onShowFull={setCellOverflowText}
                        />
                      </CTableDataCell>
                      <CTableDataCell
                        style={{
                          border: "1px solid #d1d5db",
                          padding: "0.32rem 0.4rem",
                          maxWidth: "12rem",
                        }}
                      >
                        <EllipsisCell
                          value={c.location || "-"}
                          onShowFull={setCellOverflowText}
                        />
                      </CTableDataCell>
                      <CTableDataCell
                        style={{
                          border: "1px solid #d1d5db",
                          padding: "0.32rem 0.4rem",
                          maxWidth: "10rem",
                          overflow: "hidden",
                        }}
                      >
                        {renderFieldOrTag(
                          c,
                          "experience_years",
                          "Add Exp",
                          "text",
                        )}
                      </CTableDataCell>
                      <CTableDataCell
                        style={{
                          border: "1px solid #d1d5db",
                          padding: "0.32rem 0.4rem",
                          maxWidth: "12rem",
                          overflow: "hidden",
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
                          padding: "0.32rem 0.4rem",
                          maxWidth: "9rem",
                          overflow: "hidden",
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
                          padding: "0.32rem 0.4rem",
                          maxWidth: "9rem",
                          overflow: "hidden",
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
                          padding: "0.32rem 0.4rem",
                          maxWidth: "11rem",
                        }}
                      >
                        {canAssignClient ? (
                          <select
                            value={c.clientassigned_id || ""}
                            onChange={(e) =>
                              handleClientChange(c.candidate_id, e.target.value)
                            }
                            style={{
                              padding: "4px",
                              fontSize: "0.75rem",
                              borderRadius: "4px",
                              border: "1px solid #d1d5db",
                              maxWidth: "10rem",
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
                          padding: "0.32rem 0.4rem",
                          maxWidth: "10rem",
                          overflow: "hidden",
                        }}
                      >
                        {renderFieldOrTag(c, "sourced_by_name", "Add Source")}
                      </CTableDataCell>
                      <CTableDataCell
                        style={{
                          border: "1px solid #d1d5db",
                          padding: "0.32rem 0.4rem",
                          maxWidth: "11rem",
                        }}
                      >
                        <select
                          className="enum-select"
                          value={c.candidate_status || ""}
                          onChange={(e) =>
                            handleStatusChange(c.candidate_id, e.target.value)
                          }
                        >
                          <option value="" disabled>
                            Select status
                          </option>

                          {STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </CTableDataCell>
                      {/*  <CTableDataCell style={{ border: '1px solid #d1d5db', padding: '0.75rem' }}>{renderFieldOrTag(c, 'placement_status', 'Add Placement')}</CTableDataCell>*/}

                      {/* Original Resume */}
                      <CTableDataCell
                        style={{
                          border: "1px solid #d1d5db",
                          padding: "0.32rem 0.4rem",
                        }}
                      >
                        {c.resume_url ? (
                          <button
                            type="button"
                            onClick={() => handleDownload(c, "original")}
                            title="Download original resume"
                            style={{
                              color: "#326396",
                              cursor: "pointer",
                              background: "none",
                              border: "none",
                              padding: 0,
                              maxWidth: "100%",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              display: "inline-block",
                              verticalAlign: "bottom",
                            }}
                          >
                            Download Original
                          </button>
                        ) : (
                          <span>No Original</span>
                        )}

                        {!c.resume_url && c.source === "xls" && (
                          <CButton
                            color="primary"
                            size="sm"
                            style={{
                              marginLeft: "0.25rem",
                              borderRadius: "0px",
                              padding: "0.25rem 0.5rem",
                              backgroundColor: "#1f3c88",
                            }}
                            onClick={() => {
                              setShowCvModal(true);
                              setCurrentNotesCandidate(c);
                              setCvTypeToUpload("original");
                            }}
                            className="button-original"
                          >
                            Upload Original
                          </CButton>
                        )}
                      </CTableDataCell>

                      {/* Redacted Resume 
                    <CTableDataCell style={{ border: '1px solid #d1d5db', padding: '0.75rem' }}>
                      {c.resume_url_redacted ? (
                        <button
                          onClick={() => handleDownload(c, 'redacted')}
                          style={{ fontSize: '0.75rem', color: '#326396', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
                        >
                          Download Redacted
                        </button>
                      ) : 'No Redacted'}
                      {c.source === 'xls' && !c.resume_url_redacted && (
                        <CButton
                          color="primary"
                          size="sm"
                          style={{ marginLeft: '0.25rem', fontSize: '0.75rem' }}
                          onClick={() => { setShowCvModal(true); setCurrentNotesCandidate(c); setCvTypeToUpload('redacted'); }}
                        >
                          Upload Redacted
                        </CButton>
                      )}
                    </CTableDataCell>

                    {/* Actions */}
                      <CTableDataCell
                        style={{
                          border: "1px solid #d1d5db",
                          padding: "0.32rem 0.4rem",
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
                              color: "#ef4444",
                              cursor: "pointer",
                            }}
                            onClick={() => handleDelete(c)}
                          />
                          <CIcon
                            icon={cilBook}
                            style={{
                              color: c.notes ? "#326396" : "#444343ff",
                              cursor: "pointer",
                            }}
                            onClick={() => {
                              setCurrentNotesCandidate(c);
                              setNotesText(c.notes || "");
                              setNotesModalVisible(true);
                            }}
                          />

                          {/* <CButton
                            color="primary" // button background color
                            size="sm"
                            style={{
                              color: "white",
                              borderRadius: "0px",
                              padding: "0.25rem 0.5rem",
                              backgroundColor: "#1f3c88",
                            }} // text color white
                            onClick={() => handleSignInClick(c)}
                            className="button-redact"
                          >
                            {hasRedactedResume(c)
                              ? "View Redacted"
                              : "Sign In / Redact"}
                          </CButton> */}
                        </div>
                      </CTableDataCell>
                    </CTableRow>
                  ))
                ) : (
                  <CTableRow>
                    <CTableDataCell
                      colSpan={14}
                      className="text-center text-muted"
                      style={{
                        border: "1px solid #d1d5db",
                        padding: "0.32rem 0.4rem",
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
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "1rem",
              gap: "0.5rem",
            }}
          >
            <CButton
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            >
              Prev
            </CButton>

            {/* {[...Array(totalPages)].map((_, idx) => (
              <CButton
                key={idx}
                size="sm"

                color={currentPage === idx + 1 ? 'primary' : 'secondary'}
                onClick={() => setCurrentPage(idx + 1)}
              >
                {idx + 1}
              </CButton>
            ))} */}

            {[...Array(totalPages)].map((_, index) => {
              const pageNumber = index + 1;
              const isActive = currentPage === pageNumber; // ✅ DEFINE IT HERE

              return (
                <CButton
                  key={pageNumber}
                  size="sm"
                  onClick={() => setCurrentPage(pageNumber)}
                  style={{
                    backgroundColor: isActive ? "#1f3c88" : "white",
                    borderColor: "#1f3c88",
                    color: isActive ? "white" : "#1f3c88",
                  }}
                >
                  {pageNumber}
                </CButton>
              );
            })}

            <CButton
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
            >
              Next
            </CButton>
          </div>
        </CCardBody>
      </CCard>

      <CModal
        alignment="center"
        visible={!!cellOverflowText}
        onClose={() => setCellOverflowText(null)}
      >
        <CModalHeader closeButton>Full text</CModalHeader>
        <CModalBody style={{ wordBreak: "break-word", whiteSpace: "pre-wrap" }}>
          {cellOverflowText}
        </CModalBody>
        <CModalFooter>
          <CButton
            color="secondary"
            onClick={() => setCellOverflowText(null)}
          >
            Close
          </CButton>
        </CModalFooter>
      </CModal>

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
      // showXlsModal={showXlsModal}
      // setShowXlsModal={setShowXlsModal}

      // showCvModal={showCvModal}
      // setShowCvModal={setShowCvModal}
      />
    </CContainer>
  );
};

export default DisplayAllCandidates;
