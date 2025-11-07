import React, { useState, useEffect } from 'react'
import {
  CContainer, CCard, CCardBody,
  CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell,
  CFormInput, CButton, CAlert, CModal, CModalHeader, CModalBody, CModalFooter,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilTrash, cilPencil, cilSearch, cilCloudUpload, cilBook, cilSpreadsheet } from '@coreui/icons'
import { deleteCandidateApi, saveSearchApi, updateCandidateByEmailApi } from '../../../api/api'
import SavedSearch from './SavedSearch'
import Notes from './Notes'
import BulkUpload from './BulkUpload'

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
  const [showFrequencyModal, setShowFrequencyModal] = useState(false)
  const [selectedFrequency, setSelectedFrequency] = useState('daily')
  const [starred, setStarred] = useState(false)
  const [notesModalVisible, setNotesModalVisible] = useState(false)
  const [currentNotesCandidate, setCurrentNotesCandidate] = useState(null)
  const [notesText, setNotesText] = useState('')
  const [savingSearch, setSavingSearch] = useState(false)
  const [filters, setFilters] = useState([])
  const [showXlsModal, setShowXlsModal] = useState(false)
  const [userId, setUserId] = useState('')

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
    fetchCandidates()
  }, [])

  const showCAlert = (message, color = 'success', duration = 5000) => {
    const id = new Date().getTime()
    setAlerts(prev => [...prev, { id, message, color }])
    setTimeout(() => setAlerts(prev => prev.filter(alert => alert.id !== id)), duration)
  }

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
    try {
      await updateCandidateByEmailApi(editingCandidate.email, {
        name: editingCandidate.name || null,
        phone: editingCandidate.phone || null,
        location: editingCandidate.location || null,
        experience_years: editingCandidate.experience || editingCandidate.experience_years || null,
        position: editingCandidate.position || editingCandidate.position_applied || null,
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
  // Map frontend fieldKey to actual backend field
  const backendField = fieldKey === 'position' ? 'position_applied' : fieldKey
  const value = candidate[backendField]

  if (editingTag === candidate.email + fieldKey) {
    return (
      <input
        type={inputType}
        value={tagValue}
        onChange={(e) => setTagValue(e.target.value)}
     onKeyDown={async (e) => {
  if (e.key === 'Enter') {
    try {
      await updateCandidateByEmailApi(candidate.email, { [backendField]: tagValue })
      setFilteredCandidates(prev =>
        prev.map(item =>
          item.email === candidate.email ? { ...item, [backendField]: tagValue } : item
        )
      )
      // Use the actual value in the alert
      if (backendField === 'position') {
        showCAlert(`Position "${tagValue}" added successfully!`, 'success')
      } else {
        showCAlert(`${tagValue || label} updated`, 'success')
      }
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
        setEditingTag(candidate.email + fieldKey)
        setTagValue(value || '')
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
          {/* Search + Upload */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '1.5rem', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '0.6rem 1rem', width: '100%', maxWidth: '600px', position: 'relative' }}>
              <CIcon icon={cilSearch} style={{ color: '#326396', marginRight: '10px' }} />
              <input type="text" placeholder="Search by name, email or position..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ border: 'none', outline: 'none', flex: 1 }} />
              <span onClick={() => { setStarred(true); setShowFrequencyModal(true) }} style={{ cursor: 'pointer', position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '20px', userSelect: 'none' }}>
                {starred ? '★' : '☆'}
              </span>
            </div>

            <div style={{ position: 'absolute', right: '0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', width: '80px' }}>
              <input type="file" id="fileUpload" multiple accept=".zip,.pdf" style={{ display: 'none' }} onChange={(e) => handleBulkUpload(e.target.files)} />
              <CIcon icon={cilCloudUpload} size="xl" style={{ color: uploading ? '#9ca3af' : '#326396', cursor: uploading ? 'not-allowed' : 'pointer', transition: '0.2s' }} onClick={() => !uploading && document.getElementById('fileUpload').click()} />
              <CIcon icon={cilSpreadsheet} size="xl" style={{ color: '#22c55e', cursor: 'pointer', transition: '0.2s' }} onClick={() => setShowXlsModal(true)} />
              {uploading && (
                <div style={{ width: '100%', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.8rem', marginBottom: '0.3rem', color: '#326396' }}>Uploading... {uploadProgress}%</p>
                  <div style={{ height: '5px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${uploadProgress}%`, height: '100%', background: '#326396', transition: 'width 0.2s ease' }}></div>
                  </div>
                </div>
              )}
            </div>
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
<CTableDataCell style={{ border: 'none', padding: '1rem' }}>
  {c.position_applied || renderFieldOrTag(c, 'position', 'Add Position')}
</CTableDataCell>


                    <CTableDataCell style={{ border: 'none', padding: '1rem' }}>{renderFieldOrTag(c, 'current_salary', 'Add Salary', 'number')}</CTableDataCell>
                    <CTableDataCell style={{ border: 'none', padding: '1rem' }}>{renderFieldOrTag(c, 'expected_salary', 'Add Expected', 'number')}</CTableDataCell>
                    <CTableDataCell style={{ border: 'none', padding: '1rem' }}>{renderFieldOrTag(c, 'client_id', 'Add Client')}</CTableDataCell>
                    <CTableDataCell style={{ border: 'none', padding: '1rem' }}>{renderFieldOrTag(c, 'sourced_by', 'Add Source')}</CTableDataCell>
                    <CTableDataCell style={{ border: 'none', padding: '1rem' }}>{renderFieldOrTag(c, 'candidate_status', 'Add Status')}</CTableDataCell>
                    <CTableDataCell style={{ border: 'none', padding: '1rem' }}>{renderFieldOrTag(c, 'placement_status', 'Add Placement')}</CTableDataCell>
                    <CTableDataCell style={{ border: 'none', padding: '1rem' }}>{c.date || '-'}</CTableDataCell>
                    <CTableDataCell style={{ border: 'none', padding: '1rem' }}>{c.resume_url ? <a href={`http://localhost:7000${c.resume_url}`} target="_blank" rel="noopener noreferrer" style={{ color: '#326396' }}>View Original</a> : 'No Original'}</CTableDataCell>
                    <CTableDataCell style={{ border: 'none', padding: '1rem' }}>{c.resume_url_redacted ? <a href={`http://localhost:7000${c.resume_url_redacted}`} target="_blank" rel="noopener noreferrer" style={{ color: '#326396' }}>View Redacted</a> : 'No Redacted'}</CTableDataCell>
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

    </CContainer>
  )
}

export default DisplayCandidates
