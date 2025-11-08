import React, { useState, useEffect } from 'react'
import {
  CContainer, CCard, CCardBody,
  CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell,
  CFormInput, CButton, CAlert, CModal, CModalHeader, CModalBody, CModalFooter,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilTrash, cilPencil, cilSearch, cilCloudUpload, cilBook, cilSpreadsheet } from '@coreui/icons'
import { deleteCandidateApi, saveSearchApi, updateCandidateByEmailApi,  } from '../../../api/api'
import SavedSearch from './SavedSearch'
import Notes from './Notes'
import BulkUpload from './BulkUpload'
import CandidateSearchBar from './candidatesearchbar'


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
  const [filters, setFilters] = useState([])
  const [showXlsModal, setShowXlsModal] = useState(false)
  const [showCvModal, setShowCvModal] = useState(false)

  const [userId, setUserId] = useState('')
  const [savedSearches, setSavedSearches] = useState([]);
  const [localCandidates, setLocalCandidates] = useState(candidates)
  const [starred, setStarred] = useState(false)
  const [uploadingExcel, setUploadingExcel] = useState(false)
const [uploadingCV, setUploadingCV] = useState(false)



  



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

// Define fetchCandidates in component scope
const fetchCandidates = async () => {
  try {
    const res = await fetch('http://localhost:7000/api/candidate/getAllCandidates')
    const data = await res.json()
    setFilteredCandidates(data)
  } catch (err) {
    console.error('Failed to fetch candidates:', err)
    showCAlert('Failed to load candidates', 'danger')
  }
}

// Call it on mount
useEffect(() => {
  fetchCandidates()
}, [])


  const showCAlert = (message, color = 'success', duration = 5000) => {
    const id = new Date().getTime()
    setAlerts(prev => [...prev, { id, message, color }])
    setTimeout(() => setAlerts(prev => prev.filter(alert => alert.id !== id)), duration)
  }

  
// fetch signed URL from backend
const getCandidateSignedUrl = async (candidateId, type) => {
  const res = await fetch(`http://localhost:7000/api/candidate/signed-url/${candidateId}/${type}`);
  if (!res.ok) throw new Error('Failed to get signed URL');
  const data = await res.json();
  return data.signedUrl;
};

// trigger download using signed URL
const downloadFile = (url, filename) => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

useEffect(() => {
  setLocalCandidates(
    candidates.map(c => ({
      ...c,
      position_applied: c.position_applied || c.position || '',
      experience_years: c.experience_years || c.experience || ''
    }))
  )
}, []) // <-- empty dependency array



// handle click
const handleDownload = async (candidate, type) => {
  try {
    const signedUrl = await getCandidateSignedUrl(candidate.candidate_id, type);
    const filename = type === 'original' ? `${candidate.name}_Original.pdf` : `${candidate.name}_Redacted.pdf`;
    downloadFile(signedUrl, filename);
  } catch (err) {
    console.error(err);
    showCAlert('Failed to download CV', 'danger');
  }
};






  const handleDelete = (candidate) => setDeletingCandidate(candidate)

const handleConfirmDelete = async () => {
  if (!deletingCandidate) return;
  try {
    await deleteCandidateApi(deletingCandidate.candidate_id); // use candidate_id
    showCAlert('Candidate deleted successfully', 'success');

    // Remove deleted candidate from the table immediately
    setFilteredCandidates(prev =>
      prev.filter(c => c.candidate_id !== deletingCandidate.candidate_id)
    );

    // Optional: still call refresh if you want to sync with server
    // refreshCandidates();
  } catch (err) {
    console.error(err);
    showCAlert('Failed to delete candidate', 'danger');
  } finally {
    setDeletingCandidate(null);
  }
};


  const handleEdit = (candidate) => setEditingCandidate({ ...candidate })

const handleSave = async () => {
  if (!editingCandidate) return
  try {
    await updateCandidateByEmailApi(editingCandidate.email, {
      name: editingCandidate.name || null,
      phone: editingCandidate.phone || null,
      location: editingCandidate.location || null,
      experience_years: editingCandidate.experience_years || null,
      position_applied: editingCandidate.position_applied || null,
      current_last_salary: editingCandidate.current_last_salary || null,
      expected_salary: editingCandidate.expected_salary || null,
      client_name: editingCandidate.client_name || null,
       sourced_by_name: editingCandidate.sourced_by_name || null,
    })
    showCAlert('Candidate updated successfully', 'success')
    refreshCandidates()
  } catch (err) {
    console.error('Candidate update failed:', err)
    showCAlert('Failed to update candidate', 'danger')
  } finally {
    setEditingCandidate(null)
  }
}


// 🔹 Search Filter (replace old useEffect)
useEffect(() => {
  const query = searchQuery.toLowerCase().trim()

  // Extract experience numbers from query (like "8 years", "5 yrs", etc.)
  const expMatches = query.match(/\b(\d+)\s*(yrs?|years?)\b/g) || []
  const expNumbers = expMatches.map(match => parseFloat(match))

  // Remove experience words from query so they don’t interfere with text search
  let queryText = query
  expMatches.forEach(match => {
    queryText = queryText.replace(match, '')
  })
  const queryWords = queryText.split(/\s+/).filter(Boolean)

  const filtered = localCandidates.filter(c => {
    const name = (c.name || '').toLowerCase()
    const email = (c.email || '').toLowerCase()
    const position = (c.position || c.position_applied || '').toLowerCase()
    const location = (c.location || '').toLowerCase()
    const experienceText = `${c.experience_years || 0} years`.toLowerCase() // include "years" text
    const experience = c.experience || c.experience_years || 0

    // Check experience numbers from query
    if (expNumbers.length && !expNumbers.some(num => experience >= num)) return false

    // Check other words
    return queryWords.every(word =>
      name.includes(word) ||
      email.includes(word) ||
      position.includes(word) ||
      location.includes(word) ||
      experienceText.includes(word) // <-- include experience text
    )
  })

  setFilteredCandidates(filtered)
}, [searchQuery, localCandidates])



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



//   if (searchQuery.trim() === '') {
//     setFilteredCandidates(candidates);
//   } else {
//     const lowerQuery = searchQuery.toLowerCase();
//     setFilteredCandidates(
//       candidates.filter(c =>
//         c.name?.toLowerCase().includes(lowerQuery) ||
//         c.email?.toLowerCase().includes(lowerQuery) ||
//         (Array.isArray(c.position_applied) &&
//           c.position_applied.some(pos => pos.toLowerCase().includes(lowerQuery)))
//       )
//     );
//   }
// }, [searchQuery, candidates]);



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




const handleExcelUpload = async (file) => {
  if (!file) {
    showCAlert('Please select a file to upload.', 'warning', 5000);
    return;
  }

  setShowXlsModal(false); // close modal
  setUploadingExcel(true);

  const formData = new FormData();
  formData.append('file', file);

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
    if (xhr.status === 200) {
      const data = JSON.parse(xhr.responseText);
      showCAlert(`${data.message || 'Excel uploaded successfully'}`, 'success', 5000);
      refreshCandidates();
    } else {
      showCAlert('Failed to upload Excel. Server error.', 'danger', 6000);
    }
  };

  xhr.onerror = () => {
    setUploadingExcel(false);
    showCAlert('Excel upload failed. Check console.', 'danger', 6000);
  };

  xhr.send(formData);
};




const handleCVUpload = async (files) => {
  if (!files || files.length === 0) {
    showCAlert('Please select at least one CV to upload.', 'warning', 5000);
    return;
  }

  setShowCvModal(false); // close modal
  setUploadingCV(true);

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

  const handleSaveSearch = async () => {


    // Get the JSON string from localStorage
    const userObj = localStorage.getItem('user');

    // Parse the JSON string to an object
    const user = JSON.parse(userObj);

    // Access the user_id
    const userId = user.user_id;
    setUserId(userId)
    console.log(userId); // "052b0418-62df-4438-933d-eb1a45401ff2"

    console.log("user id from local storage", userId)
    //userId = await getUserID() //use jwt
    if (!userId) {
      showCAlert('User not logged in', 'danger')
      return
    }

    if (!searchQuery.trim()) {
      showCAlert('Search query cannot be empty', 'warning')
      return
    }

    try {
      setSavingSearch(true)
      const response = await saveSearchApi({
        userId,
        query: searchQuery,
        filters: filters || [], // filters should be a JSON object, e.g., { role: 'Web Developer', experience: 5 }
        notifyFrequency: selectedFrequency
      })
      setSuccess(response);
      showCAlert(`search saved successfully`, 'success', 5000)

      setError('');
      setTimeout(() => {
        setSuccess(false);
        setShowFrequencyModal(false);
      }, 1000);


    } catch (error) {
      console.error(error);
      setError('Failed to save search in DisplayCandidates. Please try again.');
      showCAlert('Saving failed. Try Again.', 'danger', 6000)
    } finally {
      setSavingSearch(false)
    }
  }


  return (
    <CContainer style={{ fontFamily: 'Inter, sans-serif', marginTop: '2rem', maxWidth: '95vw' }}>
      <h3 style={{ fontWeight: 550, marginBottom: '1.5rem', textAlign: 'center' }}>Manage Candidates</h3>

      <div style={{ position: 'fixed', top: '10px', right: '10px', zIndex: 9999 }}>
        {alerts.map(alert => <CAlert key={alert.id} color={alert.color} dismissible>{alert.message}</CAlert>)}
      </div>

      <CCard className="shadow-sm border-0 rounded-4" style={{ background: '#ffffff', padding: '2rem 1rem' }}>
        <CCardBody style={{ padding: 0 }}>




{/* Search Bar + Upload Icons */}
<div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem' }}>
  <CFormInput
    type="text"
    placeholder="Search candidates..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    style={{ maxWidth: '600px' }}
  />

  {/* Excel / Spreadsheet Upload Icon */}
  <div style={{ position: 'relative' }}>
    <CIcon
      icon={cilSpreadsheet}
      size="xl"
      style={{ cursor: 'pointer', color: '#326396' }}
      onClick={() => setShowXlsModal(true)}
      title="Bulk Upload Excel"
    />
    {uploadingExcel && (
      <div style={{
        position: 'absolute',
        top: '-5px',
        right: '-20px',
        width: '16px',
        height: '16px',
        border: '2px solid #f3f3f3',
        borderTop: '2px solid #326396',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
    )}
  </div>

  {/* CV / PDF Upload Icon */}
  <div style={{ position: 'relative' }}>
    <CIcon
      icon={cilCloudUpload}
      size="xl"
      style={{ cursor: 'pointer', color: '#10b981' }}
      onClick={() => setShowCvModal(true)}
      title="Bulk Upload CVs"
    />
    {uploadingCV && (
      <div style={{
        position: 'absolute',
        top: '-5px',
        right: '-20px',
        width: '16px',
        height: '16px',
        border: '2px solid #f3f3f3',
        borderTop: '2px solid #10b981',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
    )}
  </div>

  {/* Add keyframes inside style tag */}
  <style>{`
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `}</style>
</div>



Excel Upload Modal
<CModal visible={showXlsModal} onClose={() => setShowXlsModal(false)}>
  <CModalHeader closeButton>Upload Excel</CModalHeader>
  <CModalBody>
    <BulkUpload onUploadExcel={handleExcelUpload} />
  </CModalBody>
  <CModalFooter>
    <CButton color="secondary" onClick={() => setShowXlsModal(false)}>Close</CButton>
  </CModalFooter>
</CModal>

CV Upload Modal
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
          <CTableDataCell style={{ border: 'none', padding: '1rem' }}>
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

      {/* Edit Modal */}
      <CModal visible={!!editingCandidate} onClose={() => setEditingCandidate(null)}>
        <CModalHeader closeButton>Edit Candidate</CModalHeader>
        <CModalBody>
          {editingCandidate && (
            <>
              <CFormInput className="mb-2" label="Name" value={editingCandidate.name || ''} onChange={(e) => setEditingCandidate({ ...editingCandidate, name: e.target.value })} />
              <CFormInput className="mb-2" label="Phone" value={editingCandidate.phone || ''} onChange={(e) => setEditingCandidate({ ...editingCandidate, phone: e.target.value })} />
              <CFormInput className="mb-2" label="Location" value={editingCandidate.location || ''} onChange={(e) => setEditingCandidate({ ...editingCandidate, location: e.target.value })} />
                <CFormInput className="mb-2" label="Experience" value={editingCandidate.experience_years || ''} onChange={(e) => setEditingCandidate({ ...editingCandidate, experience_years: e.target.value })} />
                    <CFormInput
      className="mb-2"
      label="Position"
      value={editingCandidate.position_applied || ''}
      onChange={(e) => setEditingCandidate({ ...editingCandidate, position_applied: e.target.value })}
    />
                   <CFormInput
      className="mb-2"
      label="Current Salary"
      value={editingCandidate.current_last_salary || ''}
      onChange={(e) => setEditingCandidate({ ...editingCandidate, current_last_salary: e.target.value })}
    />
    <CFormInput
      className="mb-2"
      label="Expected Salary"
      value={editingCandidate.expected_salary || ''}
      onChange={(e) => setEditingCandidate({ ...editingCandidate, expected_salary: e.target.value })}
    />
            </>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setEditingCandidate(null)}>Cancel</CButton>
          <CButton color="primary" onClick={handleSave}>Save</CButton>
        </CModalFooter>
      </CModal>

      {/* Delete Modal */}
      <CModal visible={!!deletingCandidate} onClose={() => setDeletingCandidate(null)}>
        <CModalHeader closeButton>Confirm Delete</CModalHeader>
        <CModalBody>Are you sure you want to delete {deletingCandidate?.name || 'this candidate'}?</CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setDeletingCandidate(null)}>Cancel</CButton>
          <CButton color="danger" onClick={handleConfirmDelete}>Delete</CButton>
        </CModalFooter>
      </CModal>

      {/* Notes Modal */}
      <CModal visible={notesModalVisible} onClose={() => setNotesModalVisible(false)}>
        <CModalHeader closeButton>Candidate Notes</CModalHeader>
        <CModalBody>
          <textarea value={notesText} onChange={(e) => setNotesText(e.target.value)} style={{ width: '100%', minHeight: '150px', padding: '10px' }} />
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setNotesModalVisible(false)}>Close</CButton>
          <CButton color="primary" onClick={async () => {
            if (!currentNotesCandidate) return
            try {
              await updateCandidateByEmailApi(currentNotesCandidate.email, { notes: notesText })
              showCAlert('Notes updated', 'success')
              setNotesModalVisible(false)
              refreshCandidates()
            } catch (err) {
              console.error(err)
              showCAlert('Failed to update notes', 'danger')
            }
          }}>Save</CButton>
        </CModalFooter>
      </CModal>

   


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




