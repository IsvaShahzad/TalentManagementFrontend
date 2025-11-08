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
  const [starred, setStarred] = useState(false)
  const [notesModalVisible, setNotesModalVisible] = useState(false)
  const [currentNotesCandidate, setCurrentNotesCandidate] = useState(null)
  const [notesText, setNotesText] = useState('')
  const [savingSearch, setSavingSearch] = useState(false)
  const [filters, setFilters] = useState([])
  const [showXlsModal, setShowXlsModal] = useState(false)
  const [userId, setUserId] = useState('')
  const [savedSearches, setSavedSearches] = useState([]);
  const [localCandidates, setLocalCandidates] = useState(candidates)



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




  const handleBulkUpload = async (files) => {
    if (!files || files.length === 0) {
      showCAlert('Please select at least one file to upload.', 'warning', 5000)
      return
    }
    const formData = new FormData()
    for (const file of files) formData.append('files', file)

    try {
      setUploading(true)
      setUploadProgress(0)

      const xhr = new XMLHttpRequest()
      xhr.open('POST', 'http://localhost:7000/api/candidate/bulk-upload-cvs', true)

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100)
          setUploadProgress(percent)
        }
      }

      xhr.onload = async () => {
        setUploading(false)
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText)
          const duplicates = data.results?.filter(r => r.status === 'duplicate')?.map(r => r.email) || []
          const created = data.results?.filter(r => r.status === 'created') || []

          if (duplicates.length > 0)
            showCAlert(`CV with the email ${duplicates.join(', ')} already exists!`, 'danger', 6000)
          if (created.length > 0)
            showCAlert(`${created.length} candidate(s) uploaded successfully`, 'success', 5000)

          refreshCandidates()
        } else {
          showCAlert('Failed to upload files. Server error.', 'danger', 6000)
        }
      }

      xhr.onerror = () => {
        setUploading(false)
        showCAlert('Upload failed. Please check the console.', 'danger', 6000)
      }

      xhr.send(formData)
    } catch (err) {
      console.error('Bulk upload failed:', err)
      setUploading(false)
      showCAlert('Failed to upload files. Check console for details.', 'danger', 6000)
    }
  }

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
    candidate_status: 'candidate_status',
    placement_status: 'placement_status'
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

      <CCard className="shadow-sm border-0 rounded-4" style={{ background: '#ffffff', padding: '2rem 1rem' }}>
        <CCardBody style={{ padding: 0 }}>


    {/* <CandidateSearchBar
  searchQuery={searchQuery}
  setSearchQuery={setSearchQuery}
  userId={userId}
  starred={starred}
  setStarred={setStarred}
  setSavedSearches={setSavedSearches}
  showCAlert={showCAlert}
  candidates={candidates}                  // <-- add this
  setFilteredCandidates={setFilteredCandidates} // <-- add this */}


  {/* 🔹 Search Bar */}
  <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
    <CFormInput
      type="text"
      placeholder="Search candidates by name, email, location, position, or experience..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      style={{ maxWidth: '600px' }}
    />
  </div>



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

      {/* Bulk Upload Modal */}
      <CModal visible={showXlsModal} onClose={() => setShowXlsModal(false)}>
        <CModalHeader closeButton>Upload XLS</CModalHeader>
        <CModalBody>
          <BulkUpload onUpload={handleBulkUpload} />
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowXlsModal(false)}>Close</CButton>
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
