import React, { useState, useEffect } from 'react'
import {
  CContainer, CCard, CCardBody,
  CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell,
  CFormInput, CButton, CAlert, CModal, CModalHeader, CModalBody, CModalFooter,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilTrash, cilPencil, cilSearch, cilCloudUpload, cilBook, cilSpreadsheet } from '@coreui/icons'
import { deleteCandidateApi, getAll_Notes, saveSearchApi, updateCandidateByEmailApi, getRecruiterCandidatesApi, bulkUpload } from '../../../api/api'
import SavedSearch from './SavedSearch'
import Notes from './Notes'
import BulkUpload from './BulkUpload'
import { getAllSearches } from '../../../api/api';
import { fetchCandidates, getCandidateSignedUrl, getCandidateDownloadUrl, downloadFile } from '../../../components/candidateUtils';
import SearchBarWithIcons from '../../../components/SearchBarWithIcons';
import CandidateModals from '../../../components/CandidateModals'
import './TableScrollbar.css'; // import CSS at the top of your file
//import CVUpload from './CVUpload'

import {
  handleSaveSearch as saveSearchHandler,
  handleEdit as editHandler,
  handleSave as saveHandler,
  handleDelete as deleteHandler,
  handleConfirmDelete as confirmDeleteHandler,
  handleCreateNote as createNoteHandler
} from '../../../components/candidateHandlers'
import { useLocation, useNavigate } from 'react-router-dom'


const DisplayCandidates = ({ candidates, refreshCandidates }) => {
  const [message, setMessage] = useState('')
  const [filteredCandidates, setFilteredCandidates] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [alerts, setAlerts] = useState([])
  const [editingCandidate, setEditingCandidate] = useState(null)
  const [deletingCandidate, setDeletingCandidate] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [editingTag, setEditingTag] = useState(null)
  const [tagValue, setTagValue] = useState('')
  const [notesModalVisible, setNotesModalVisible] = useState(false)
  const [currentNotesCandidate, setCurrentNotesCandidate] = useState(null)
  const [notesText, setNotesText] = useState('')
  const [savingSearch, setSavingSearch] = useState(false)
  const [creatingNote, setCreatingNote] = useState(false)
  const [refreshing, setRefreshing] = useState(false);

  const [filters, setFilters] = useState([])
  const [showXlsModal, setShowXlsModal] = useState(false)
  const [showCvModal, setShowCvModal] = useState(false)
  const [cvTypeToUpload, setCvTypeToUpload] = useState(null) // 'original' or 'redacted'
  const [userId, setUserId] = useState('')
  const [savedSearches, setSavedSearches] = useState([]);
  const [localCandidates, setLocalCandidates] = useState(candidates)
  const [starred, setStarred] = useState(false)
  const [uploadingExcel, setUploadingExcel] = useState(false)
  const [uploadingCV, setUploadingCV] = useState(false)


  const [selectedFrequency, setSelectedFrequency] = useState('none')
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [showFrequencyModal, setShowFrequencyModal] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [notes, setNotes] = useState([])
  const [candidatesLoading, setCandidatesLoading] = useState(true); // optional: show loading state
  const Location = useLocation()
  const navigate = useNavigate();
  const recentFive = filteredCandidates.slice(0, 5);
  const tagStyle = {
    background: '#e3efff',
    color: '#326396',
    padding: '2px 6px', // smaller
    borderRadius: '15px',
    fontSize: '0.7rem',   // smaller
    cursor: 'pointer',
  }

  const inputTagStyle = {
    border: '1px solid #d1d5db',
    borderRadius: '0.5rem',
    padding: '2px 4px',  // smaller
    fontSize: '0.7rem',  // smaller
    width: '80px',
    marginTop: '2px',
  }
  const alertStyle = {
    fontSize: '1px',  // smaller font
    padding: '6px 10px',
    lineHeight: '1.3',
  };

  const [role, setRole] = useState('');
  const [recruiterId, setRecruiterId] = useState('');

  useEffect(() => {
    const userObj = localStorage.getItem('user');
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
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);



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





  const showCAlert = (message, color = 'success', duration = 5000) => {
    const id = new Date().getTime();
    setAlerts(prev => [
      ...prev,
      { id, message, color, style: alertStyle }  // apply centralized style
    ]);
    setTimeout(() => setAlerts(prev => prev.filter(alert => alert.id !== id)), duration);
  };


  useEffect(() => {
    const fetchCandidatesByRole = async () => {
      try {
        let data = [];

        if (role === 'Admin') {
          data = candidates; // Admin sees all
        } else if (role === 'Recruiter') {
          data = await getRecruiterCandidatesApi(userId, role); // <- pass userId and role
        }

        setLocalCandidates(data);
        setFilteredCandidates(data);
      } catch (err) {
        console.error('Error fetching candidates:', err);
        showCAlert('Failed to fetch candidates', 'danger');
      }
    };

    fetchCandidatesByRole();
  }, [role, recruiterId, candidates, Location.pathname]);




  const handleDownload = async (candidate, type) => {
    try {
      if (type === 'original') {
        // Use backend-provided filename (original upload name) via /download-cv
        const url = await getCandidateDownloadUrl(candidate.candidate_id);
        downloadFile(url); // let server headers control filename
      } else if (type === 'redacted') {
        // Redacted CV – use signed URL and simple PDF filename
        const { signedUrl } = await getRedactedResumeSignedUrl(candidate.candidate_id);
        const filename = `${candidate.name}_Redacted.pdf`;
        downloadFile(signedUrl, filename);
      }
    } catch (err) {
      console.error("Download failed:", err);
      showCAlert('Failed to download CV', 'danger');
    }
  };



  const handleEdit = (candidate) => editHandler(candidate, setEditingCandidate)

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
        refreshPage
      });

      // ✅ No need to manually update state here anymore,
      // saveHandler already updates localCandidates & filteredCandidates

    } catch (err) {
      console.error(err);
      showCAlert("Failed to save changes", "danger");
    }
  };




  const handleDelete = (candidate) => deleteHandler(candidate, setDeletingCandidate)

  const handleConfirmDelete = async () => {
    await confirmDeleteHandler({
      deletingCandidate,
      setDeletingCandidate,
      showCAlert,
      setFilteredCandidates,
      setLocalCandidates,
      refreshCandidates,
    })
  }



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
    })





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
      setError
    })
    // Note: refreshNotes is now handled via 'noteCreated' event in candidateHandlers.js
  }



  const CVUpload = ({ onUpload, uploading, uploadProgress, selectedFiles, setSelectedFiles }) => {
    const handleFileChange = (e) => {
      const files = e.target.files;
      if (setSelectedFiles) setSelectedFiles(files);
      if (onUpload) onUpload(files);
      setUploadingCV(true);
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', position: 'relative' }}>
        <CFormInput
          type="file"
          multiple
          accept=".pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleFileChange}
          disabled={uploading}
        />


        {selectedFiles && selectedFiles.length > 0 && (
          <p style={{ fontSize: '0.75rem', margin: 0 }}>
            {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected
          </p>
        )
        }
        {/* <CButton
          type="button"
          className="mt-3 py-2"
          disabled={uploading || uploadingCV || !selectedFiles}
          onClick={() => {
            if (!selectedFiles) return;
            onUpload(selectedFiles);      // upload trigger
            setUploadingCV(true);
          }}
          style={{
            width: "100%",
            background: "linear-gradient(90deg, #5f8ed0 0%, #4a5dca 100%)",
            border: "none",
            borderRadius: "12px",
            fontSize: "0.9rem",
            fontWeight: 500,
            color: "white",
            opacity: uploading ? 0.7 : 1,
            cursor: uploading ? "not-allowed" : "pointer",
            transition: "all 0.3s ease",
          }}
        >
          {uploading ? "Uploading..." : "Upload Candidates"}
        </CButton>
*/}
        <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>
          Select one or more CVs (PDF, DOC, DOCX) to upload
        </p>

        {message && (
          <CAlert
            color={message.includes('Error') ? 'danger' : 'success'}
            className="mt-3 text-center"
            style={{ fontSize: '0.8rem', padding: '0.5rem' }}
          >
            {message}
          </CAlert>)}

      </div>
    )
  }



  useEffect(() => {
    const userObj = localStorage.getItem('user');
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
          console.error('Failed to fetch saved searches', err);
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
      showCAlert('Please select an Excel file to upload.', 'warning', 5000);
      return;
    }

    setUploadingExcel(true);

    try {
      // Standardize the ID just like your CV upload logic
      const idToSend = userId || recruiterId || localStorage.getItem('userId');
      const formData = new FormData();

      // 1️⃣ Text fields FIRST
      formData.append('userId', idToSend);
      formData.append('role', role || 'Recruiter');

      // 2️⃣ Main Excel file
      formData.append('file', file);

      // 3️⃣ Attached CVs
      for (const [email, cvFile] of Object.entries(attachedCVs)) {
        formData.append(email, cvFile);
      }

      const apiUrl = 'http://localhost:7000/api/candidate/bulk-upload';
      const xhr = new XMLHttpRequest();
      xhr.open('POST', apiUrl, true);

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
          showCAlert('Candidates processed successfully', 'success', 3000);

          if (refreshCandidates) await refreshCandidates();
          setShowXlsModal(false);
          // Short delay to allow state to settle before refresh
          setTimeout(() => window.location.reload(), 1000);
        } else {
          const errData = JSON.parse(xhr.responseText);
          showCAlert(errData.message || 'Server error during upload', 'danger', 6000);
        }
      };

      xhr.onerror = () => {
        setUploadingExcel(false);
        showCAlert('Network error during upload.', 'danger', 6000);
      };

      xhr.send(formData);

    } catch (err) {
      console.error('Excel upload error:', err);
      setUploadingExcel(false);
    }
  };


  const handleCVUpload = async (files) => {
    if (!files || files.length === 0) {
      showCAlert('Please select at least one CV to upload.', 'warning', 5000);
      return;
    }

    setShowCvModal(true); // close modal
    setUploadingCV(true);

    try {
      setUploading(true);
      setMessage("");

      if (currentNotesCandidate && currentNotesCandidate.source === 'xls') {
        // ===============================
        // XLS candidate → single CV upload
        // ===============================
        const file = files[0]; // only one file per XLS candidate
        const formData = new FormData();

        formData.append('file', file);
        formData.append('candidate_id', currentNotesCandidate.candidate_id);
        console.log("candidates uploading cv", currentNotesCandidate.candidate_id)
        const res = await fetch('http://localhost:7000/api/candidate/upload-xls-cv', {
          method: 'POST',
          body: formData,
        });
        console.log("respponse from backend in handle cv upload ", res)
        const data = await res.json();
        // Backend returns 'url', not 'resume_url'
        const resumeUrl = data.url || data.resume_url;

        if (res.ok && resumeUrl) {
          showCAlert('CV uploaded successfully!', 'success');

          // Update the uploaded CV URL in state

          const updatedCandidate = {
            ...currentNotesCandidate,
            resume_url: resumeUrl,
            position_applied: currentNotesCandidate.position || '',
            experience_years: currentNotesCandidate.experience || '',
            source: 'cv'
          };

          setLocalCandidates(prev => [...prev, updatedCandidate]);
          setFilteredCandidates(prev => [...prev, updatedCandidate]);
          setCurrentNotesCandidate(null);
          if (refreshCandidates) await refreshCandidates(); // refresh from backend
        }


        else {
          showCAlert(data.message || 'CV upload failed', 'danger');
        }

      }

      else {


        // ===============================
        // Normal bulk CV upload
        // ===============================


        const formData = new FormData();
        for (const file of files) formData.append('files', file);

        const apiUrl = 'http://localhost:7000/api/candidate/bulk-upload-cvs';

        const xhr = new XMLHttpRequest();
        xhr.open('POST', apiUrl, true);

        // Always send role and recruiterId for proper duplicate handling
        formData.append('role', role);
        if (recruiterId) {
          formData.append('recruiterId', recruiterId);
        }




        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(percent);
          }
        };

        xhr.onload = async () => {
          setUploadingCV(false);
          if (xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            const duplicates = data.results?.filter(r => r.status === 'duplicate')?.map(r => r.email) || [];
            const created = data.results?.filter(r => r.status === 'created') || [];
            const linked = data.results?.filter(r => r.status === 'linked') || [];

            // Show duplicate warning
            if (duplicates.length > 0)
              showCAlert(`${duplicates.length} duplicate(s) skipped: ${duplicates.slice(0, 3).join(', ')}${duplicates.length > 3 ? '...' : ''}`, 'warning', 4000);

            // Show linked info (for recruiters linking existing candidates)
            if (linked.length > 0)
              showCAlert(`${linked.length} existing candidate(s) linked to your account`, 'info', 3000);

            // Show created success
            if (created.length > 0) {
              showCAlert(`${created.length} candidate(s) uploaded successfully`, 'success', 3000);

              // ✅ Add new candidates instantly
              const newCandidates = created.map(c => ({
                ...c,
                position_applied: c.position || '',
                experience_years: c.experience || '',
                source: 'cv',
              }));
              // ✅ Update state instantly (both tables)
              setLocalCandidates(prev => [...prev, ...newCandidates]);
              setFilteredCandidates(prev => [...prev, ...newCandidates]);
              setCurrentNotesCandidate(null); // reset
            }

            // Refresh to show linked candidates too
            refreshCandidates();

          } else {
            showCAlert('Failed to upload CVs. Server error.', 'danger', 6000);
          }
        };

        xhr.onerror = () => {
          setUploadingCV(false);
          showCAlert('CV upload failed. Check console.', 'danger', 6000);
        };

        xhr.send(formData);
      }

      setSelectedFiles(null);
      setShowCvModal(false)
    } catch (err) {
      console.error(err);
      showCAlert('CV upload failed', 'danger');
      setMessage("Error uploading files");
    } finally {
      setUploadingCV(false);
      setCurrentNotesCandidate(null); // reset XLS candidate after upload
      setUploading(false)
    }
  };



  const renderFieldOrTag = (candidate, fieldKey, label, inputType = 'text') => {
    const backendFieldMap = {
      position: 'position_applied',
      current_last_salary: 'current_last_salary',
      expected_salary: 'expected_salary',
      experience_years: 'experience_years',
      candidate_status: 'candidate_status',
      placement_status: 'placement_status',
      client_name: 'client_name',
      sourced_by_name: 'sourced_by_name',
    };

    const backendField = backendFieldMap[fieldKey] || fieldKey;
    const value = candidate[backendField] ?? ''; // use nullish coalescing

    if (editingTag === candidate.candidate_id + fieldKey) {
      return (
        <input
          type={inputType}
          value={tagValue}
          onChange={(e) => setTagValue(e.target.value)}
          onKeyDown={async (e) => {
            if (e.key === 'Enter') {
              try {
                // Only attempt API update if candidate has an email
                if (candidate.email) {
                  const payload = { [backendField]: tagValue };
                  await updateCandidateByEmailApi(candidate.email, payload);
                }

                // ✅ Update localCandidates & filteredCandidates immediately
                setLocalCandidates(prev =>
                  prev.map(item =>
                    item.candidate_id === candidate.candidate_id
                      ? { ...item, [backendField]: tagValue }
                      : item
                  )
                );
                setFilteredCandidates(prev =>
                  prev.map(item =>
                    item.candidate_id === candidate.candidate_id
                      ? { ...item, [backendField]: tagValue }
                      : item
                  )
                );

                showCAlert(`${label} updated`, 'success');
                setEditingTag(null);
                setTagValue('');
              } catch (err) {
                console.error(err);
                showCAlert('Failed to update', 'danger');
              }
            } else if (e.key === 'Escape') {
              setEditingTag(null);
              setTagValue('');
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
        {value || label || 'Add'}
      </span>
    );
  };


  return (
    <CContainer style={{ fontFamily: 'Inter, sans-serif', marginTop: '0.7rem', maxWidth: '95vw' }}>
      <h3 style={{ fontWeight: 550, marginBottom: '1.5rem', textAlign: 'center' }}>Manage Candidates</h3>

      <div style={{ position: 'fixed', top: '10px', right: '10px', zIndex: 9999 }}>
        {alerts.map(alert =>
          <CAlert key={alert.id + Math.random()} color={alert.color} dismissible>
            {alert.message}
          </CAlert>
        )}
      </div>


      {(uploadingExcel || uploadingCV) && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            pointerEvents: 'none', // ← allows clicks to pass through

            fontSize: '1.2rem',
            color: '#326396',
            fontWeight: 500,
          }}
        >
          <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p style={{ marginTop: '1rem' }}>
            {uploadingExcel ? 'Uploading Excel file…' : 'Uploading CVs…'}
          </p>
          {uploadProgress > 0 && (
            <p style={{ marginTop: '0.5rem', fontSize: '1rem' }}>
              {/*uploadProgress}% completed*/}
            </p>
          )}
        </div>
      )}



      <CCard
        style={{
          background: '#ffffff',
          padding: '2rem 1rem',
          border: '1px solid #d4d5d6ff', // light grey border
          borderRadius: '0px',          // square corners
          boxShadow: 'none',            // remove shadow
        }}
      >
        <CCardBody style={{ padding: '1rem', position: 'relative' }}>
          {/* Search bar centered and longer */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
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
              localCandidates={localCandidates}
              setFilteredCandidates={setFilteredCandidates}
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

          <CModal visible={showXlsModal}
            onClose={() => {
              setShowXlsModal(false)

            }}
            alignment="center"
            scrollable
          >
            <CModalHeader closeButton>
              Upload Excel
            </CModalHeader>
            <CModalBody style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              <BulkUpload
                onSuccess={() => {
                  setShowXlsModal(false)
                  window.location.reload()
                }}
              />

            </CModalBody>
            <CModalFooter>
              <CButton color="secondary" onClick={() => {
                setShowXlsModal(false)

              }
              }>Close</CButton>
            </CModalFooter>
          </CModal>


          <CModal visible={showCvModal} onClose={() => setShowCvModal(false)}>
            <CModalHeader closeButton>
              <span style={{ fontSize: '1rem', fontWeight: 500 }}>Upload CVs</span>
            </CModalHeader>
            <CModalBody style={{ fontSize: '0.85rem', padding: '1rem 1.5rem' }}
              className='c-modal-body'
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
                style={{ fontSize: '0.8rem', padding: '0.3rem 0.7rem', borderRadius: '8px' }}
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
              overflowX: 'auto',
              overflowY: 'auto',
              maxHeight: isMobile ? '350px' : '500px',
              width: '100%',
              WebkitOverflowScrolling: 'touch', // Smooth scrolling on iOS
            }}
          >
            <CTable
              className="align-middle"
              style={{
                minWidth: isMobile ? '1000px' : '1800px',
                borderCollapse: 'collapse',
                border: '1px solid #d1d5db',
                fontSize: 'clamp(0.7rem, 1.5vw, 0.9rem)', // Responsive font size
                whiteSpace: 'nowrap',
                tableLayout: 'auto',
              }}
            >
              {/* Table Head */}
              <CTableHead color="light" style={{ borderBottom: '2px solid #d1d5db' }}>
                <CTableRow style={{ fontSize: '0.85rem' }}>
                  <CTableHeaderCell style={{ border: '1px solid #d1d5db', padding: '0.75rem' }}>Name</CTableHeaderCell>
                  <CTableHeaderCell style={{ border: '1px solid #d1d5db', padding: '0.75rem' }}>Email</CTableHeaderCell>
                  <CTableHeaderCell style={{ border: '1px solid #d1d5db', padding: '0.75rem' }}>Phone</CTableHeaderCell>
                  <CTableHeaderCell style={{ border: '1px solid #d1d5db', padding: '0.75rem' }}>Location</CTableHeaderCell>
                  <CTableHeaderCell style={{ border: '1px solid #d1d5db', padding: '0.75rem' }}>Experience</CTableHeaderCell>
                  <CTableHeaderCell style={{ border: '1px solid #d1d5db', padding: '0.75rem' }}>Position</CTableHeaderCell>
                  <CTableHeaderCell style={{ border: '1px solid #d1d5db', padding: '0.75rem' }}>Current Salary</CTableHeaderCell>
                  <CTableHeaderCell style={{ border: '1px solid #d1d5db', padding: '0.75rem' }}>Expected Salary</CTableHeaderCell>
                  {/* <CTableHeaderCell style={{ border: '1px solid #d1d5db', padding: '0.75rem' }}>Client</CTableHeaderCell>*/}
                  <CTableHeaderCell style={{ border: '1px solid #d1d5db', padding: '0.75rem' }}>Sourced By</CTableHeaderCell>
                  {/* <CTableHeaderCell>Status</CTableHeaderCell> */}
                  <CTableHeaderCell style={{ border: '1px solid #d1d5db', padding: '0.75rem' }}>Placement Status</CTableHeaderCell>
                  <CTableHeaderCell style={{ border: '1px solid #d1d5db', padding: '0.75rem' }}>Resume (Original)</CTableHeaderCell>
                  <CTableHeaderCell style={{ border: '1px solid #d1d5db', padding: '0.75rem' }}>Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>

              {/* Table Body */}
              <CTableBody>
                {/*filteredCandidates.length > 0 ? filteredCandidates.map(c => (
                */}
                {recentFive.length > 0 ? recentFive.map(c => (

                  <CTableRow
                    key={c.candidate_id}
                    style={{
                      backgroundColor: '#fff',
                      fontSize: '0.85rem', // smaller font
                    }}
                  >
                    <CTableDataCell style={{ border: '1px solid #d1d5db', padding: '0.75rem' }}>{c.name || '-'}</CTableDataCell>
                    <CTableDataCell style={{ border: '1px solid #d1d5db', padding: '0.75rem' }}>{c.email}</CTableDataCell>
                    <CTableDataCell style={{ border: '1px solid #d1d5db', padding: '0.75rem' }}>{c.phone || '-'}</CTableDataCell>
                    <CTableDataCell style={{ border: '1px solid #d1d5db', padding: '0.75rem' }}>{c.location || '-'}</CTableDataCell>
                    <CTableDataCell style={{ border: '1px solid #d1d5db', padding: '0.75rem' }}>{renderFieldOrTag(c, 'experience_years', 'Add Exp', 'number')}</CTableDataCell>
                    <CTableDataCell style={{ border: '1px solid #d1d5db', padding: '0.75rem' }}>{renderFieldOrTag(c, 'position_applied', 'Add Position', 'string')}</CTableDataCell>
                    <CTableDataCell style={{ border: '1px solid #d1d5db', padding: '0.75rem' }}>{renderFieldOrTag(c, 'current_last_salary', 'Add Salary', 'string')}</CTableDataCell>
                    <CTableDataCell style={{ border: '1px solid #d1d5db', padding: '0.75rem' }}>{renderFieldOrTag(c, 'expected_salary', 'Add Expected', 'string')}</CTableDataCell>
                    {/* <CTableDataCell style={{ border: '1px solid #d1d5db', padding: '0.75rem' }}>{renderFieldOrTag(c, 'client_name', 'Add Client')}</CTableDataCell>*/}
                    <CTableDataCell style={{ border: '1px solid #d1d5db', padding: '0.75rem' }}>{renderFieldOrTag(c, 'sourced_by_name', 'Add Source')}</CTableDataCell>
                    {/*    <CTableDataCell style={{ padding: '0.5rem' }}>{renderFieldOrTag(c, 'candidate_status', 'Add Status')}</CTableDataCell> */}
                    <CTableDataCell style={{ border: '1px solid #d1d5db', padding: '0.75rem' }}>{renderFieldOrTag(c, 'placement_status', 'Add Placement')}</CTableDataCell>

                    {/* Original Resume */}
                    <CTableDataCell style={{ border: '1px solid #d1d5db', padding: '0.75rem' }}>
                      {c.resume_url ? (
                        <button
                          onClick={() => handleDownload(c, 'original')}
                          style={{ fontSize: '0.75rem', color: '#326396', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
                        >
                          Download Original
                        </button>
                      ) : 'No Original'}
                      {c.source === 'xls' && !c.resume_url && (
                        <CButton
                          color="primary"
                          size="sm"
                          style={{ marginLeft: '0.25rem', fontSize: '0.75rem' }}
                          className='button-original'
                          onClick={() => { setShowCvModal(true); setCurrentNotesCandidate(c); setCvTypeToUpload('original'); }}
                        >
                          Upload Original
                        </CButton>
                      )}
                    </CTableDataCell>

                    {/* Actions */}
                    <CTableDataCell style={{ border: '1px solid #d1d5db', padding: '0.75rem' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', alignItems: 'center' }}>
                        <CIcon icon={cilPencil} style={{ fontSize: '0.75rem', color: '#3b82f6', cursor: 'pointer' }} onClick={() => { console.log('Pencil clicked', c); handleEdit(c, setEditingCandidate) }}
                        />


                        <CIcon icon={cilTrash} style={{ fontSize: '0.75rem', color: '#ef4444', cursor: 'pointer' }} onClick={() => handleDelete(c)} />
                        <CIcon
                          icon={cilBook}
                          style={{ fontSize: '0.75rem', color: c.notes ? '#326396' : '#444343ff', cursor: 'pointer' }}
                          onClick={() => { setCurrentNotesCandidate(c); setNotesText(c.notes || ''); setNotesModalVisible(true); }}
                        />

                      </div>
                    </CTableDataCell>




                  </CTableRow>
                )) : (
                  <CTableRow>
                    <CTableDataCell colSpan="15" className="text-center text-muted" style={{ border: '1px solid #d1d5db', padding: '0.75rem', fontSize: '0.75rem' }}>
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
              style={{ backgroundColor: '#1f3c88' }}
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

      {/* Saved Searches Table */}
      <div style={{ marginTop: '2rem' }}>
        <SavedSearch />
      </div>


      {/* Notes Table */}
      <div style={{ marginTop: '2rem' }}>
        <Notes notes={notes} refreshNotes={refreshNotes} refreshPage={refreshPage} />
      </div>




    </CContainer>
  )
}

export default DisplayCandidates