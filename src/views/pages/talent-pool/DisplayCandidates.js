
import React, { useState, useEffect } from 'react'
import {
  CContainer, CCard, CCardBody,
  CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell,
  CFormInput, CButton, CAlert, CModal, CModalHeader, CModalBody, CModalFooter,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilTrash, cilPencil, cilSearch, cilCloudUpload, cilBook, cilSpreadsheet } from '@coreui/icons'
import { deleteCandidateApi, getAll_Notes, saveSearchApi, updateCandidateByEmailApi, } from '../../../api/api'
import SavedSearch from './SavedSearch'
import Notes from './Notes'
import BulkUpload from './BulkUpload'
import { getAllSearches } from '../../../api/api';
import { fetchCandidates, getCandidateSignedUrl, downloadFile } from '../../../components/candidateUtils';
import SearchBarWithIcons from '../../../components/SearchBarWithIcons';
import CandidateModals from '../../../components/CandidateModals'


import {
  handleSaveSearch as saveSearchHandler,
  handleEdit as editHandler,
  handleSave as saveHandler,
  handleDelete as deleteHandler,
  handleConfirmDelete as confirmDeleteHandler,
  handleCreateNote as createNoteHandler
} from '../../../components/candidateHandlers'


const DisplayCandidates = ({ candidates, refreshCandidates }) => {
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


  const tagStyle = {
    background: '#e3efff',
    color: '#326396',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '0.85rem',
    cursor: 'pointer',
  }

  const inputTagStyle = {
    border: '1px solid #d1d5db',
    borderRadius: '0.5rem',
    padding: '4px 8px',
    fontSize: '0.85rem',
    width: '100px',
    marginTop: '4px',
  }


  useEffect(() => {
    refreshNotes();
  }, []);

  const refreshNotes = async () => {
    try {
      const res = await getAll_Notes();
      setNotes(res.notes);
    } catch (err) {
      console.error(err);
    }
  };



// Call it on mount
useEffect(() => {
  fetchCandidates()
}, [])


  const showCAlert = (message, color = 'success', duration = 5000) => {
    const id = new Date().getTime()
    setAlerts(prev => [...prev, { id, message, color }])
    setTimeout(() => setAlerts(prev => prev.filter(alert => alert.id !== id)), duration)
  }



useEffect(() => {
  setLocalCandidates(
    candidates.map(c => ({
      ...c,
      position_applied: c.position_applied || c.position || '',
      experience_years: c.experience_years || c.experience || '',
      source: c.source || 'cv',

    }))

  )
}, [])



useEffect(() => {
  const loadCandidates = async () => {
    const data = await fetchCandidates(showCAlert);
    setFilteredCandidates(data);
  };
  loadCandidates();
}, []);




const handleDownload = async (candidate, type) => {
  try {
    const signedUrl = await getCandidateSignedUrl(candidate.candidate_id, type);
    const filename = type === 'original' ? `${candidate.name}_Original.pdf` : `${candidate.name}_Redacted.pdf`;
    downloadFile(signedUrl, filename);
  } catch {
    showCAlert('Failed to download CV', 'danger');
  }
};


const handleEdit = (candidate) => editHandler(candidate, setEditingCandidate)

const handleSave = async () => {
  try {
    await saveHandler({
      editingCandidate,
      refreshCandidates,
      showCAlert,
      setEditingCandidate,
    });

    // ✅ Instantly update local state so UI reflects changes
    setFilteredCandidates(prev =>
      prev.map(c =>
        c.candidate_id === editingCandidate.candidate_id
          ? { ...c, ...editingCandidate }
          : c
      )
    );

    setEditingCandidate(null);
    showCAlert("Candidate updated successfully", "success");
  } catch (err) {
    console.error(err);
    showCAlert("Failed to save changes", "danger");
  }
};



const handleDelete = (candidate) => deleteHandler(candidate, setDeletingCandidate)

const handleConfirmDelete = () =>
  confirmDeleteHandler({
    deletingCandidate,
    setDeletingCandidate,
    showCAlert,
    setFilteredCandidates,
  })



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
        setError,
        refreshNotes
      })
    }


const CVUpload = ({ onUpload }) => {
  const handleFileChange = (e) => {
    if (onUpload) onUpload(e.target.files)
  }

  return (
    <div>
      <CFormInput
        type="file"
        multiple
        accept=".pdf"
        onChange={handleFileChange}
      />
      <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>Select one or more PDF CVs to upload</p>
    </div>
  )
}



useEffect(() => {
  const userObj = localStorage.getItem('user');
  if (userObj) {
    const user = JSON.parse(userObj);
    setUserId(user.user_id);

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

    xhr.onload = () => {
      setUploadingExcel(false);
      setShowXlsModal(false);

      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);

        const duplicates = data.results?.filter(r => r.status === 'duplicate')?.map(r => r.email) || [];
        const created = data.results?.filter(r => r.status === 'created') || [];

        if (duplicates.length > 0)
          showCAlert(`Candidate(s) with email(s) ${duplicates.join(', ')} already exist!`, 'danger', 6000);
        if (created.length > 0)
          showCAlert(`${created.length} candidate(s) uploaded successfully`, 'success', 5000);

        refreshCandidatesState();
      } else {
        showCAlert('Failed to upload Excel. Server error.', 'danger', 6000);
      }
    };

    xhr.onerror = () => {
      setUploadingExcel(false);
      showCAlert('Excel upload failed. Check console.', 'danger', 6000);
    };

    xhr.send(formData);
  } catch (err) {
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

  setShowCvModal(true); // close modal
  setUploadingCV(true);

  try {
    if (currentNotesCandidate && currentNotesCandidate.source === 'xls') {
      // ===============================
      // XLS candidate → single CV upload
      // ===============================
      const file = files[0]; // only one file per XLS candidate
      const formData = new FormData();
      formData.append('file', file);
      formData.append('candidate_id', currentNotesCandidate.candidate_id);

      const res = await fetch('http://localhost:7000/api/candidate/upload-xls-cv', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (res.ok && data.resume_url) {
  showCAlert('CV uploaded successfully!', 'success');

  // Update the uploaded CV URL in state
  setFilteredCandidates(prev =>
    prev.map(c =>
      c.candidate_id === currentNotesCandidate.candidate_id
        ? { ...c, resume_url: data.resume_url } // <-- update URL
        : c
    )
  );

  refreshCandidates(); // optional if you want full refresh
}
      
      
      else {
        showCAlert(data.message || 'CV upload failed', 'danger');
      }

    } else {
      // ===============================
      // Normal bulk CV upload
      // ===============================
      const formData = new FormData();
      for (const file of files) formData.append('files', file);

      const xhr = new XMLHttpRequest();
      xhr.open('POST', 'http://localhost:7000/api/candidate/bulk-upload-cvs', true);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percent);
        }
      };

      xhr.onload = () => {
        setUploadingCV(false);
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          const duplicates = data.results?.filter(r => r.status === 'duplicate')?.map(r => r.email) || [];
          const created = data.results?.filter(r => r.status === 'created') || [];

          if (duplicates.length > 0)
            showCAlert(`CV with email(s) ${duplicates.join(', ')} already exist!`, 'danger', 6000);
          if (created.length > 0)
            showCAlert(`${created.length} candidate(s) uploaded successfully`, 'success', 5000);

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
  } catch (err) {
    console.error(err);
    showCAlert('CV upload failed', 'danger');
  } finally {
    setUploadingCV(false);
    setCurrentNotesCandidate(null); // reset XLS candidate after upload
  }
};


  // Render Field or Tag
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
  }

  const backendField = backendFieldMap[fieldKey] || fieldKey
  const value = candidate[backendField] || ''

  if (editingTag === candidate.candidate_id + fieldKey) {
    return (
      <input
        type={inputType}
        value={tagValue}
        onChange={(e) => setTagValue(e.target.value)}
        onKeyDown={async (e) => {
          if (e.key === 'Enter') {
            try {
              // Call API
              const payload = { [backendField]: tagValue }
              await updateCandidateByEmailApi(candidate.email, payload)

              // Update local state
              setFilteredCandidates(prev =>
                prev.map(item =>
                  item.candidate_id === candidate.candidate_id
                    ? { ...item, [backendField]: tagValue }
                    : item
                )
              )

              showCAlert(`${label} updated`, 'success')
              setEditingTag(null)
              setTagValue('')
            } catch (err) {
              console.error(err)
              showCAlert('Failed to update', 'danger')
            }
          } else if (e.key === 'Escape') {
            setEditingTag(null)
            setTagValue('')
          }
        }}
        style={inputTagStyle}
        autoFocus
      />
    )
  }

  return (
    <span
      style={tagStyle}
      onClick={() => {
        setEditingTag(candidate.candidate_id + fieldKey)
        setTagValue(value)
      }}
    >
      {value || label || 'Add'}
    </span>
  )
}

  return (
    <CContainer style={{ fontFamily: 'Inter, sans-serif', marginTop: '2rem', maxWidth: '95vw' }}>
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
        {uploadProgress}% completed
      </p>
    )}
  </div>
)}



      <CCard className="shadow-sm border-0 rounded-4" style={{ background: '#ffffff', padding: '2rem 1rem' }}>
        <CCardBody style={{ padding: 0 }}>


<>
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
  localCandidates={localCandidates}               // ← add this
  setFilteredCandidates={setFilteredCandidates}   // ← add this
/>


</>

<CModal visible={showXlsModal} onClose={() => setShowXlsModal(false)}>
  <CModalHeader closeButton>Upload Excel</CModalHeader>
  <CModalBody>
    <BulkUpload onUploadExcel={handleExcelUpload} />
  </CModalBody>
  <CModalFooter>
    <CButton color="secondary" onClick={() => setShowXlsModal(false)}>Close</CButton>
  </CModalFooter>
</CModal>

<CModal visible={showCvModal} onClose={() => setShowCvModal(false)}>
  <CModalHeader closeButton>Upload CVs</CModalHeader>
  <CModalBody>
    <CVUpload onUpload={handleCVUpload} />
  </CModalBody>
  <CModalFooter>
    <CButton color="secondary" onClick={() => setShowCvModal(false)}>Close</CButton>
  </CModalFooter>
</CModal>

          {/* Table */}
          <div style={{ overflowX: 'auto', whiteSpace: 'nowrap', width: '100%' }}>
            <CTable className="align-middle" style={{ minWidth: '1800px', borderCollapse: 'separate', borderSpacing: '0 0.5rem', fontSize: '1rem', whiteSpace: 'nowrap', tableLayout: 'auto' }}>
              <CTableHead color="light">
                <CTableRow>
                  <CTableHeaderCell>Name</CTableHeaderCell>
                  <CTableHeaderCell>Email</CTableHeaderCell>
                  <CTableHeaderCell>Phone</CTableHeaderCell>
                  <CTableHeaderCell>Location</CTableHeaderCell>
                  <CTableHeaderCell>Experience</CTableHeaderCell>
                  <CTableHeaderCell>Position</CTableHeaderCell>
                  <CTableHeaderCell>Current Salary</CTableHeaderCell>
                  <CTableHeaderCell>Expected Salary</CTableHeaderCell>
                  <CTableHeaderCell>Client</CTableHeaderCell>
                  <CTableHeaderCell>Sourced By</CTableHeaderCell>
                  <CTableHeaderCell>Status</CTableHeaderCell>
                  <CTableHeaderCell>Placement Status</CTableHeaderCell>
                  <CTableHeaderCell>Date</CTableHeaderCell>
                  <CTableHeaderCell>Resume (Original)</CTableHeaderCell>
                  <CTableHeaderCell>Resume (Redacted)</CTableHeaderCell>
                  <CTableHeaderCell>Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>

              <CTableBody>
                {filteredCandidates.length > 0 ? filteredCandidates.map(c => (
                  <CTableRow key={c.email} style={{ backgroundColor: '#fff', boxShadow: '0 2px 6px rgba(0,0,0,0.11)', borderRadius: '0.5rem' }}>
                    <CTableDataCell style={{ border: 'none', padding: '1rem' }}>{c.name || '-'}</CTableDataCell>
                    <CTableDataCell style={{ border: 'none', padding: '1rem' }}>{c.email}</CTableDataCell>
                    <CTableDataCell style={{ border: 'none', padding: '1rem' }}>{c.phone || '-'}</CTableDataCell>
                    <CTableDataCell style={{ border: 'none', padding: '1rem' }}>{c.location || '-'}</CTableDataCell>
                    <CTableDataCell style={{ border: 'none', padding: '1rem' }}>{renderFieldOrTag(c, 'experience_years', 'Add Exp', 'number')}</CTableDataCell>
{/* <CTableDataCell style={{ border: 'none', padding: '1rem' }}>
  {c.position_applied || renderFieldOrTag(c, 'position', 'Add Position')}
</CTableDataCell> */}

                    <CTableDataCell style={{ border: 'none', padding: '1rem' }}>{renderFieldOrTag(c, 'position_applied', 'Add Position', 'string')}</CTableDataCell>



                    <CTableDataCell style={{ border: 'none', padding: '1rem' }}>{renderFieldOrTag(c, 'current_last_salary', 'Add Salary', 'string')}</CTableDataCell>
                    <CTableDataCell style={{ border: 'none', padding: '1rem' }}>{renderFieldOrTag(c, 'expected_salary', 'Add Expected', 'string')}</CTableDataCell>
                    <CTableDataCell style={{ border: 'none', padding: '1rem' }}>{renderFieldOrTag(c, 'client_name', 'Add Client')}</CTableDataCell>
                    <CTableDataCell style={{ border: 'none', padding: '1rem' }}>{renderFieldOrTag(c, 'sourced_by_name', 'Add Source')}</CTableDataCell>
                    <CTableDataCell style={{ border: 'none', padding: '1rem' }}>{renderFieldOrTag(c, 'candidate_status', 'Add Status')}</CTableDataCell>
                    <CTableDataCell style={{ border: 'none', padding: '1rem' }}>{renderFieldOrTag(c, 'placement_status', 'Add Placement')}</CTableDataCell>
                    <CTableDataCell style={{ border: 'none', padding: '1rem' }}>{c.date || '-'}</CTableDataCell>
          {/* <CTableDataCell style={{ border: 'none', padding: '1rem' }}>
  {c.resume_url ? (
    <button
      onClick={() => handleDownload(c, 'original')}
      style={{ color: '#326396', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
    >
      Download Original
    </button>
  ) : 'No Original'}
</CTableDataCell>

<CTableDataCell style={{ border: 'none', padding: '1rem' }}>
  {c.resume_url_redacted ? (
    <button
      onClick={() => handleDownload(c, 'redacted')}
      style={{ color: '#326396', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
    >
      Download Redacted
    </button>
  ) : 'No Redacted'}
</CTableDataCell> */}

<CTableDataCell style={{ border: 'none', padding: '1rem' }}>
  {c.resume_url ? (
    <button
      onClick={() => handleDownload(c, 'original')}
      style={{ color: '#326396', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
    >
      Download Original
    </button>
  ) : 'No Original'}

  {/* XLS Upload button: SHOW ONLY IF source is 'xls' AND resume_url IS EMPTY */}
  {c.source === 'xls' && !c.resume_url && ( 
    <CButton
      color="primary"
      size="sm"
      style={{ marginLeft: '0.5rem' }}
      onClick={() => {
        setShowCvModal(true)
        setCurrentNotesCandidate(c)
        setCvTypeToUpload('original') // ✨ NEW: Set upload type
      }}
    >
      Upload Original
    </CButton>
  )}
</CTableDataCell>

<CTableDataCell style={{ border: 'none', padding: '1rem' }}>
  {c.resume_url_redacted ? (
    <button
      onClick={() => handleDownload(c, 'redacted')}
      style={{ color: '#326396', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
    >
      Download Redacted
    </button>
  ) : 'No Redacted'}

  {/* XLS Upload button: SHOW ONLY IF source is 'xls' AND resume_url_redacted IS EMPTY */}
  {c.source === 'xls' && !c.resume_url_redacted && ( 
    <CButton
      color="primary"
      size="sm"
      style={{ marginLeft: '0.5rem' }}
      onClick={() => {
        setShowCvModal(true)
        setCurrentNotesCandidate(c)
        setCvTypeToUpload('redacted') // ✨ NEW: Set upload type
      }}
    >
      Upload Redacted
    </CButton>
  )}
</CTableDataCell>




                    <CTableDataCell style={{ border: 'none', padding: '1rem' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
                        <CIcon icon={cilPencil} style={{ color: '#3b82f6', cursor: 'pointer' }} onClick={() => handleEdit(c)} />
                        <CIcon icon={cilTrash} style={{ color: '#ef4444', cursor: 'pointer' }} onClick={() => handleDelete(c)} />
                        <CIcon icon={cilBook} style={{ color: c.notes ? '#326396' : '#444343ff', cursor: 'pointer' }} onClick={() => { setCurrentNotesCandidate(c); setNotesText(c.notes || ''); setNotesModalVisible(true) }} />
                      </div>
                    </CTableDataCell>
                  </CTableRow>
                )) : (
                  <CTableRow>
                    <CTableDataCell colSpan="16" className="text-center text-muted" style={{ border: 'none', padding: '1rem' }}>No candidates found.</CTableDataCell>
                  </CTableRow>
                )}
              </CTableBody>
            </CTable>
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
  <Notes candidates={candidates} refreshCandidates={fetchCandidates} />
</div>




    </CContainer>
  )
}

export default DisplayCandidates