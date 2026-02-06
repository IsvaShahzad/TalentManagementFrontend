import React, { useState, useEffect } from 'react'
import {
  CContainer, CCard, CCardBody,
  CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell,
  CFormInput, CButton, CAlert, CModal, CModalHeader, CModalBody, CModalFooter,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilTrash, cilPencil, cilSearch, cilCloudUpload, cilBook, cilSpreadsheet } from '@coreui/icons'
import {
  assignClientToCandidate,
  deleteCandidateApi,
  generateRedactedResume,
  getAll_Notes, getAllCandidates, getAllClients,
  saveSearchApi,
  updateCandidateByEmailApi,
  updateCandidateStatus,
  getRecruiterCandidatesApi
} from '../../../api/api'
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


const DisplayAllCandidates = () => {
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
  const [userRole, setUserRole] = useState('Recruiter')
  const [savedSearches, setSavedSearches] = useState([]);
  const [localCandidates, setLocalCandidates] = useState([]);
  const [starred, setStarred] = useState(false)
  const [uploadingExcel, setUploadingExcel] = useState(false)
  const [uploadingCV, setUploadingCV] = useState(false)


  const [selectedFrequency, setSelectedFrequency] = useState('none')
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [showFrequencyModal, setShowFrequencyModal] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [notes, setNotes] = useState([])

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10); // adjust as needed


  const [candidatesLoading, setCandidatesLoading] = useState(true); // optional: show loading state
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [currentCandidateForRedact, setCurrentCandidateForRedact] = useState(null);
  const [redactedUrl, setRedactedUrl] = useState('');
  const [showRedactModal, setShowRedactModal] = useState(false);
  const [generatingRedacted, setGeneratingRedacted] = useState(false);
  const [redactedGenerated, setRedactedGenerated] = useState(false);
  const Location = useLocation()
  const navigate = useNavigate();



  // --- Pagination logic ---
  const indexOfLastCandidate = currentPage * pageSize;
  const indexOfFirstCandidate = indexOfLastCandidate - pageSize;
  const currentCandidates = filteredCandidates.slice(indexOfFirstCandidate, indexOfLastCandidate);

  const totalPages = Math.ceil(filteredCandidates.length / pageSize);

  const STATUS_OPTIONS = [

    'submitted',
    'sourced',
    'shortlisted',
    'interviewing',
    'offered',
    'placed',
    'rejected'
  ]


  const [clients, setClients] = useState([]);

  const currentUser = JSON.parse(localStorage.getItem("user"));
  const canAssignClient = ["ADMIN", "HR"].includes(currentUser.role);

  // Add these to your state declarations if not already present
  const location = useLocation();
  const passedRecruiterId = location.state?.recruiterId;
  const passedRole = location.state?.role;

  const refreshCandidates = async () => {
    try {
      setCandidatesLoading(true);
      let candidatesData;

      if (passedRole === 'Recruiter' || currentUser?.role === 'Recruiter') {
        const targetId = passedRecruiterId || currentUser?.user_id;


        candidatesData = await getRecruiterCandidatesApi(targetId, 'Recruiter');
      } else {
        // Admin/HR see everything
        candidatesData = await getAllCandidates();
      }

      setLocalCandidates(candidatesData);
      setFilteredCandidates(candidatesData);
    } catch (err) {
      console.error('Failed to fetch candidates:', err);
      showCAlert('Failed to load candidates', 'danger');
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
      console.log("clients fetched", allClients.data)
      setClients(allClients.data);
      // setFilteredCandidates(allCandidates);
    } catch (err) {
      console.error('Failed to fetch clients:', err);
      showCAlert('Failed to load clients', 'danger');
    }
  }
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredCandidates]);



  const handleSignInClick = (candidate) => {
    if (!candidate.resume_url) {
      showCAlert('Original resume not uploaded', 'danger');
      return;
    }
    setCurrentCandidateForRedact(candidate);
    setShowRedactModal(true);
    setRedactedUrl('');
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
      showCAlert('Redacted resume generated successfully', 'success');
      setShowRedactModal(false);
      refreshCandidates(); // DB now has the S3 KEY

    } catch (err) {
      console.error('Failed to generate redacted resume:', err);
      showCAlert(err.message || 'Failed to generate redacted resume', 'danger');
    } finally {
      setGeneratingRedacted(false);
    }
  };


  const handleClientChange = async (candidateId, clientId) => {
    await assignClientToCandidate(candidateId, clientId);
    setLocalCandidates(prev =>
      prev.map(c =>
        c.candidate_id === candidateId
          ? { ...c, client_id: clientId }
          : c
      )
    );

    setFilteredCandidates(prev =>
      prev.map(c =>
        c.candidate_id === candidateId
          ? { ...c, client_id: clientId }
          : c
      )
    );

    showCAlert('Assigned Client Successflly', 'success');
    //setShowRedactModal(false);
    refreshCandidates();
  };


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
        currentCandidateForRedact.candidate_id
      );

      window.open(signedUrl, '_blank');
    } catch (err) {
      console.error(err);
      showCAlert('Failed to download redacted resume', 'danger');
    }
  };



  const hasRedactedResume = (candidate) => {
    return candidate &&
      candidate.resume_url_redacted &&
      candidate.resume_url_redacted.trim() !== '' &&
      candidate.resume_url_redacted !== null &&
      candidate.resume_url_redacted !== undefined;
  };


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


  useEffect(() => {
    refreshNotes();
  }, [Location.pathname]);

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




  const handleDownload = async (candidate, type) => {
    try {
      if (type === 'original') {
        // Original CV: keep the exact filename from upload (backend sets it)
        const url = await getCandidateDownloadUrl(candidate.candidate_id);
        downloadFile(url); // no filename override
      } else {
        // Redacted CV: use signed URL (PDF), keep simple name
        const signedUrl = await getCandidateSignedUrl(candidate.candidate_id, type);
        const filename = `${candidate.name}_Redacted.pdf`;
        downloadFile(signedUrl, filename);
      }
    } catch {
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


    } catch (err) {
      console.error(err);
      showCAlert("Failed to save changes", "danger");
    }
  };




  const handleDelete = (candidate) => deleteHandler(candidate, setDeletingCandidate)

  const handleConfirmDelete = () => {
    confirmDeleteHandler({
      deletingCandidate,
      setDeletingCandidate,
      showCAlert,
      setFilteredCandidates,
      setLocalCandidates,
      refreshCandidates
    }
    )

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

  }



  const CVUpload = ({ onUpload, uploading, uploadProgress, selectedFiles, setSelectedFiles }) => {
    const handleFileChange = (e) => {
      const files = e.target.files;
      if (setSelectedFiles) setSelectedFiles(files);
      if (onUpload) onUpload(files);
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', position: 'relative' }}>
        <CFormInput
          type="file"
          multiple
          accept=".pdf,.doc,.docx"
          onChange={handleFileChange}
          disabled={uploading}
        />

        {selectedFiles && selectedFiles.length > 0 && (
          <p style={{ fontSize: '0.75rem', margin: 0 }}>
            {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected
          </p>
        )}

        <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>
          Select one or more CVs to upload (PDF, DOC, DOCX)
        </p>
      </div>
    );
  };



  useEffect(() => {
    const userObj = localStorage.getItem('user');
    if (userObj) {
      const user = JSON.parse(userObj);
      setUserId(user.user_id);
      setUserRole(user.role || 'Recruiter');

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



  const handleExcelUpload = async (file, attachedCVs = {}) => {
    if (!file) {
      showCAlert('Please select a file to upload.', 'warning', 5000);
      return;
    }

    setUploadingExcel(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Add role and recruiterId for proper duplicate handling
      formData.append('role', userRole);
      if (userId) formData.append('recruiterId', userId);

      // Attach CVs per email
      // attachedCVs should be an object: { "email1@example.com": File, "email2@example.com": File }
      for (const [email, cvFile] of Object.entries(attachedCVs)) {
        formData.append(email, cvFile); // must match backend: req.files[email]
      }

      const xhr = new XMLHttpRequest();
      xhr.open('POST', 'http://localhost:7000/api/candidate/bulk-upload', true);

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

          const duplicates = data.results?.filter(r => r.status === 'duplicate')?.map(r => r.email) || [];
          const created = data.results?.filter(r => r.status === 'created') || [];
          const linked = data.results?.filter(r => r.status === 'linked') || [];

          if (duplicates.length > 0)
            showCAlert(`${duplicates.length} duplicate(s) skipped`, 'warning', 4000);
          if (linked.length > 0)
            showCAlert(`${linked.length} existing candidate(s) linked to your account`, 'info', 3000);
          if (created.length > 0) {
            showCAlert(`${created.length} candidate(s) uploaded successfully`, 'success');

            // if (refreshCandidates) await refreshCandidates(); // refresh from backend
            // ✅ Add new candidates instantly
            const newCandidates = created.map(c => ({
              ...c,
              position_applied: c.position || '',
              experience_years: c.experience || '',
              source: 'xls',
            }));

            setLocalCandidates(prev => [...prev, ...newCandidates]);
            setFilteredCandidates(prev => [...prev, ...newCandidates]);
            if (refreshCandidates) {
              await refreshCandidates();
            }
            setShowXlsModal(false);
            setUploadingExcel(false);

          }
          refreshPage();
          //if (refreshCandidates) await refreshCandidates(); // refresh from backend
        } else {
          showCAlert('Failed to upload Excel. Server error.', 'danger', 6000);
        }
      };

      xhr.onerror = () => {
        setUploadingExcel(false);
        showCAlert('Excel upload failed. Check console.', 'danger', 6000);
      };

      xhr.send(formData);
      if (refreshCandidates) {
        await refreshCandidates();
      }
      setShowXlsModal(false);
      setUploadingExcel(false);
      refreshPage();
    }
    catch (err) {
      console.error('Excel upload error:', err);
      setUploadingExcel(false);
      showCAlert('Excel upload failed. Check console.', 'danger', 6000);
    }
  };



  const handleCVUpload = async (files) => {
    if (!files || files.length === 0) {
      showCAlert('Please select at least one CV to upload.', 'warning', 5000);
      return;
    }

    setShowCvModal(true);
    setUploadingCV(true);

    try {
      // If uploading for a single XLS candidate
      if (currentNotesCandidate && currentNotesCandidate.source === 'xls') {
        const file = files[0]; // only one CV per XLS candidate
        const formData = new FormData();
        formData.append('file', file);
        formData.append('candidate_id', currentNotesCandidate.candidate_id);

        const res = await fetch('http://localhost:7000/api/candidate/upload-xls-cv', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        // Backend returns 'url', not 'resume_url'
        const resumeUrl = data.url || data.resume_url;

        if (res.ok && resumeUrl) {
          showCAlert('CV uploaded successfully!', 'success');

          // Update the existing candidate in state
          setLocalCandidates(prev =>
            prev.map(c =>
              c.candidate_id === currentNotesCandidate.candidate_id
                ? { ...c, resume_url: resumeUrl, source: 'cv' }
                : c
            )
          );

          setFilteredCandidates(prev =>
            prev.map(c =>
              c.candidate_id === currentNotesCandidate.candidate_id
                ? { ...c, resume_url: resumeUrl, source: 'cv' }
                : c
            )
          );
          refreshCandidates();
          setCurrentNotesCandidate(null); // reset
          //   if (refreshCandidates) await refreshCandidates();

        } else {
          showCAlert(data.message || 'CV upload failed', 'danger');
        }

      } else {
        // Bulk CV upload
        const formData = new FormData();
        for (const file of files) formData.append('files', file);

        // Add role and recruiterId for proper duplicate handling
        formData.append('role', userRole);
        if (userId) formData.append('recruiterId', userId);

        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'http://localhost:7000/api/candidate/bulk-upload-cvs', true);

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

            if (created.length > 0) {
              showCAlert(`${created.length} candidate(s) uploaded successfully`, 'success', 3000);

              // Update existing candidates instead of adding new ones
              setLocalCandidates(prev =>
                prev.map(c => {
                  const uploaded = created.find(u => u.email === c.email);
                  if (uploaded) {
                    return {
                      ...c,
                      resume_url: uploaded.resume_url, // replace button with link
                      source: 'cv',
                    };
                  }
                  return c;
                })
              );

              setFilteredCandidates(prev =>
                prev.map(c => {
                  const uploaded = created.find(u => u.email === c.email);
                  if (uploaded) {
                    return {
                      ...c,
                      resume_url: uploaded.resume_url,
                      source: 'cv',
                    };
                  }
                  return c;
                })
              );
            }
            refreshCandidates()
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
    } catch (err) {
      console.error(err);
      showCAlert('CV upload failed', 'danger');
    } finally {
      setUploadingCV(false);
      setSelectedFiles(null);
      setCurrentNotesCandidate(null); // reset after upload
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

  const handleStatusChange = async (candidateId, newStatus) => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));

      const user = {
        userId: storedUser?.user_id,
        role: storedUser?.role,
      };

      if (!candidateId) return;

      // ✅ Optimistic UI update
      setLocalCandidates(prev =>
        prev.map(c =>
          c.candidate_id === candidateId
            ? { ...c, candidate_status: newStatus }
            : c
        )
      );

      setFilteredCandidates(prev =>
        prev.map(c =>
          c.candidate_id === candidateId
            ? { ...c, candidate_status: newStatus }
            : c
        )
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


  return (
    <CContainer style={{ fontFamily: 'Inter, sans-serif', marginTop: '0.7rem', maxWidth: '95vw' }}>
      <h3 style={{ fontWeight: 550, marginBottom: '1.5rem', textAlign: 'center' }}>Manage Candidates</h3>

      <div style={{ position: 'fixed', top: '10px', right: '10px', zIndex: 9999 }}>
        {alerts.map(alert => <CAlert key={alert.id} color={alert.color} dismissible>{alert.message}</CAlert>)}
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

          <CModal visible={showXlsModal} onClose={() => {
            setShowXlsModal(false)
            refreshPage()
          }}
          >
            <CModalHeader closeButton>Upload Excel</CModalHeader>
            <CModalBody>
              <BulkUpload onUploadExcel={handleExcelUpload} />
            </CModalBody>
            <CModalFooter>
              <CButton color="secondary" onClick={() => {
                setShowXlsModal(false)
                refreshPage()
              }
              }>Close</CButton>
            </CModalFooter>
          </CModal>


          <CModal visible={showCvModal} onClose={() => {

            setShowCvModal(false)
            refreshPage()
          }
          }>
            <CModalHeader closeButton>
              <span style={{ fontSize: '1rem', fontWeight: 500 }}>Upload CVs</span>
            </CModalHeader>
            <CModalBody style={{ fontSize: '0.85rem', padding: '1rem 1.5rem' }}>
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
                onClick={() => {
                  refreshPage()
                  setShowCvModal(false)
                }
                } disabled={uploadingCV}
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
              <h5>Redact Resume - {currentCandidateForRedact?.name || 'Candidate'}</h5>
            </CModalHeader>
            <CModalBody>
              <div style={{ padding: '1rem' }}>
                {/* Candidate Info */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <h6>Candidate Information</h6>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
                    <div>
                      <strong>Name:</strong> {currentCandidateForRedact?.name || 'N/A'}
                    </div>
                    <div>
                      <strong>Email:</strong> {currentCandidateForRedact?.email || 'N/A'}
                    </div>
                    <div>
                      <strong>Position:</strong> {currentCandidateForRedact?.position_applied || 'N/A'}
                    </div>
                    <div>
                      <strong>Status:</strong> {currentCandidateForRedact?.candidate_status || 'N/A'}
                    </div>
                  </div>
                </div>

                {/* Original Resume Info */}
                <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '0.5rem' }}>
                  <h6>Original Resume</h6>
                  {currentCandidateForRedact?.resume_url ? (
                    <div style={{ marginTop: '0.5rem' }}>
                      <p>Original resume is available.</p>
                      <CButton
                        color="primary"
                        size="sm"
                        onClick={() => handleDownload(currentCandidateForRedact, 'original')}
                        style={{ marginRight: '0.5rem' }}
                      >
                        Download Original
                      </CButton>
                      <span style={{ fontSize: '0.85rem', color: '#6c757d' }}>
                        (Personal information will be redacted)
                      </span>
                    </div>
                  ) : (
                    <p style={{ color: '#dc3545' }}>No original resume uploaded.</p>
                  )}
                </div>

                {/* Redaction Section */}
                <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#e8f4fd', borderRadius: '0.5rem' }}>
                  <h6>Redacted Resume</h6>

                  {hasRedactedResume(currentCandidateForRedact) ? (
                    <div style={{ marginTop: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                        <div style={{
                          backgroundColor: '#28a745',
                          color: 'white',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '1rem',
                          fontSize: '0.85rem',
                          marginRight: '0.5rem'
                        }}>
                          ✓ Already Generated
                        </div>
                        <CButton
                          color="success"
                          size="sm"
                          style={{ color: 'white' }}  // text color white
                          onClick={() => handleDownload(currentCandidateForRedact, 'redacted')}
                        >
                          Download Redacted
                        </CButton>

                      </div>
                      <p style={{ fontSize: '0.9rem', color: '#495057' }}>
                        Redacted version removes personal contact information and LinkedIn URLs.
                      </p>
                    </div>
                  ) : redactedGenerated ? (
                    <div style={{ marginTop: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                        <div style={{
                          backgroundColor: '#28a745',
                          color: 'white',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '1rem',
                          fontSize: '0.85rem',
                          marginRight: '0.5rem'
                        }}>
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
                      <p style={{ fontSize: '0.9rem', color: '#495057' }}>
                        Redacted version has been generated and saved to the candidate profile.
                      </p>
                    </div>
                  ) : (
                    <div style={{ marginTop: '0.5rem' }}>
                      <p style={{ marginBottom: '1rem' }}>
                        Generate a redacted version of the resume that removes:
                      </p>
                      <ul style={{ marginBottom: '1.5rem', paddingLeft: '1.5rem' }}>
                        <li>Email addresses</li>
                        <li>Phone numbers</li>
                        <li>LinkedIn URLs</li>
                        <li>Personal addresses</li>
                        <li>Other sensitive information</li>
                      </ul>

                      <CButton
                        color="primary"
                        onClick={handleGenerateRedacted}
                        disabled={generatingRedacted || !currentCandidateForRedact?.resume_url}
                        style={{ minWidth: '200px' }}
                      >
                        {generatingRedacted ? (
                          <>
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" style={{ marginRight: '0.5rem' }}></span>
                            Generating...
                          </>
                        ) : (
                          'Generate Redacted Resume'
                        )}
                      </CButton>

                      {!currentCandidateForRedact?.resume_url && (
                        <p style={{ color: '#dc3545', marginTop: '0.5rem', fontSize: '0.85rem' }}>
                          Cannot generate redacted resume - no original resume available.
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Information about redaction */}
                <div style={{
                  padding: '1rem',
                  backgroundColor: '#fff3cd',
                  borderRadius: '0.5rem',
                  border: '1px solid #ffc107'
                }}>
                  <h6 style={{ color: '#856404' }}>ℹ️ About Redaction</h6>
                  <ul style={{ marginBottom: 0, fontSize: '0.85rem', color: '#856404' }}>
                    <li>Redacted resumes can be shared with clients while protecting candidate privacy</li>
                    <li>The original resume is preserved and can be accessed when needed</li>
                    <li>Once generated, the redacted resume is saved to the candidate profile</li>
                    <li>You can regenerate if needed (will overwrite existing redacted version)</li>
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
                <CButton
                  color="primary"
                  onClick={handleDownloadRedacted}
                >
                  Download Redacted
                </CButton>
              )}
            </CModalFooter>
          </CModal>


          {/* Table */}
          <div
            className="table-scroll"
            style={{
              overflowX: 'auto',
              overflowY: 'auto',
              maxHeight: '500px',
              width: '100%',
              WebkitOverflowScrolling: 'touch', // Smooth scrolling on iOS
            }}
          >
            <CTable
              className="align-middle"
              style={{
                minWidth: '1800px',
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
                  {/* <CTableHeaderCell>Client</CTableHeaderCell> */}
                  <CTableHeaderCell style={{ border: '1px solid #d1d5db', padding: '0.75rem' }}>Sourced By</CTableHeaderCell>
                  <CTableHeaderCell style={{ border: '1px solid #d1d5db', padding: '0.75rem' }}>Status</CTableHeaderCell>
                  <CTableHeaderCell style={{ border: '1px solid #d1d5db', padding: '0.75rem' }}>Placement Status</CTableHeaderCell>
                  <CTableHeaderCell style={{ border: '1px solid #d1d5db', padding: '0.75rem' }}>Resume (Original)</CTableHeaderCell>
                  <CTableHeaderCell style={{ border: '1px solid #d1d5db', padding: '0.75rem' }}>Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>

              {/* Table Body */}
              <CTableBody>
                {/*filteredCandidates?.length > 0 ? filteredCandidates.map(c => (*/}

                {
                  currentCandidates.length > 0 ? currentCandidates.map(c => (

                    <CTableRow
                      key={c.email}
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



                      <CTableDataCell style={{ border: '1px solid #d1d5db', padding: '0.75rem' }}>{renderFieldOrTag(c, 'sourced_by_name', 'Add Source')}</CTableDataCell>
                      <CTableDataCell style={{ border: '1px solid #d1d5db', padding: '0.75rem' }}>
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
                        ) : (
                          <span>No Original</span>
                        )}

                        {!c.resume_url && c.source === 'xls' && (
                          <CButton
                            color="primary"
                            size="sm"
                            style={{ 
                              marginLeft: '0.25rem', 
                              fontSize: '0.65rem',
                              borderRadius: '0px',
                              padding: '0.25rem 0.5rem'
                            }}
                            onClick={() => {
                              setShowCvModal(true);
                              setCurrentNotesCandidate(c);
                              setCvTypeToUpload('original');
                            }}
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

                          <CButton
                            color="primary"       // button background color
                            size="sm"
                            style={{ 
                              fontSize: '0.65rem', 
                              color: 'white',
                              borderRadius: '0px',
                              padding: '0.25rem 0.5rem'
                            }} // text color white
                            onClick={() => handleSignInClick(c)}
                          >
                            {hasRedactedResume(c) ? 'View Redacted' : 'Sign In / Redact'}
                          </CButton>


                        </div>
                      </CTableDataCell>




                    </CTableRow>
                  )) : (
                    <CTableRow>
                      <CTableDataCell colSpan="13" className="text-center text-muted" style={{ border: '1px solid #d1d5db', padding: '0.75rem', fontSize: '0.75rem' }}>
                        No candidates found.
                      </CTableDataCell>
                    </CTableRow>
                  )
                }
              </CTableBody>
            </CTable>
          </div>


          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem', gap: '0.5rem' }}>
            <CButton
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            >
              Prev
            </CButton>

            {[...Array(totalPages)].map((_, idx) => (
              <CButton
                key={idx}
                size="sm"
                color={currentPage === idx + 1 ? 'primary' : 'secondary'}
                onClick={() => setCurrentPage(idx + 1)}
              >
                {idx + 1}
              </CButton>
            ))}

            <CButton
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            >
              Next
            </CButton>
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
      // showXlsModal={showXlsModal}
      // setShowXlsModal={setShowXlsModal}


      // showCvModal={showCvModal}
      // setShowCvModal={setShowCvModal}

      />
    </CContainer>
  )
}


export default DisplayAllCandidates


