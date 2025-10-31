import React, { useState, useEffect } from 'react'
import {
  CContainer, CCard, CCardBody,
  CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell,
  CFormInput, CButton, CAlert, CModal, CModalHeader, CModalBody, CModalFooter,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilTrash, cilPencil, cilSearch, cilCloudUpload } from '@coreui/icons'
import { deleteCandidateApi, updateCandidateByEmailApi } from '../../../api/api'

const DisplayCandidates = ({ candidates, refreshCandidates }) => {
  const [filteredCandidates, setFilteredCandidates] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [alerts, setAlerts] = useState([])
  const [editingCandidate, setEditingCandidate] = useState(null)
  const [deletingCandidate, setDeletingCandidate] = useState(null)
  const [bulkFiles, setBulkFiles] = useState([])


const [uploading, setUploading] = useState(false)
const [uploadProgress, setUploadProgress] = useState(0)

const [addingExpTag, setAddingExpTag] = useState(null)
const [addingPosTag, setAddingPosTag] = useState(null)


  // 🔹 Alerts
  const showCAlert = (message, color = 'success', duration = 5000) => {
    const id = new Date().getTime()
    setAlerts(prev => [...prev, { id, message, color }])
    setTimeout(() => setAlerts(prev => prev.filter(alert => alert.id !== id)), duration)
  }

  // 🔹 Delete
  const handleDelete = (candidate) => setDeletingCandidate(candidate)

  const handleConfirmDelete = async () => {
    if (!deletingCandidate) return
    try {
      await deleteCandidateApi(deletingCandidate.id)
      showCAlert('Candidate deleted successfully', 'success')
      refreshCandidates()
    } catch (err) {
      console.error('Failed to delete candidate:', err)
      showCAlert('Failed to delete candidate', 'danger')
    } finally {
      setDeletingCandidate(null)
    }
  }

  const tagStyle = {
  background: '#e3efff',
  color: '#326396',
  padding: '4px 10px',
  borderRadius: '20px',
  fontSize: '0.85rem',
}

const addTagStyle = {
  background: '#f3f4f6',
  color: '#6b7280',
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


  // 🔹 Edit
  const handleEdit = (candidate) => setEditingCandidate({ ...candidate })

  const handleSave = async () => {
    try {
      await updateCandidateByEmailApi(editingCandidate.email, {
        firstName: editingCandidate.fname || editingCandidate.firstName || null,
        phone: editingCandidate.phone || null,
        location: editingCandidate.location || null,
        experience_years: editingCandidate.experience || null,
        position_applied: editingCandidate.position || null,
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

// 🔹 Search Filter
useEffect(() => {
  const query = searchQuery.toLowerCase().trim()
  const filtered = candidates.filter(c => {
    const name = c.fname || c.firstName || ''
    const email = c.email || ''
    const position = c.position || c.position_applied || ''
    const experience = c.experience ? String(c.experience) : ''
    const location = c.location ? String(c.location) : ''

    return (
      name.toLowerCase().includes(query) ||
      email.toLowerCase().includes(query) ||
      position.toLowerCase().includes(query) ||
      experience.includes(query) ||
      location.toLowerCase().includes(query) // ✅ added location search
    )
  })
  setFilteredCandidates(filtered)
}, [searchQuery, candidates])


  // 🔹 Bulk Upload
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

    // Track progress
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


  return (
<CContainer
  style={{
    fontFamily: 'Inter, sans-serif',
    marginTop: '2rem',
    maxWidth: '95vw',
  }}
>
  <h3
    style={{
      fontWeight: 550,
      marginBottom: '1.5rem',
      textAlign: 'center', // ✅ centers the heading
    }}
  >
    Manage Candidates
  </h3>

      {/* Alerts */}
      <div style={{ position: 'fixed', top: '10px', right: '10px', zIndex: 9999 }}>
        {alerts.map(alert => <CAlert key={alert.id} color={alert.color} dismissible>{alert.message}</CAlert>)}
      </div>

      <CCard className="shadow-sm border-0 rounded-4" style={{ background: '#ffffff', padding: '2rem 1rem' }}>
        <CCardBody style={{ padding: 0 }}>

          {/* Top Row: Search Bar + Upload Icon */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: '1.5rem',
              position: 'relative',
            }}
          >
            {/* Search Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '0.5rem',
                padding: '0.6rem 1rem',
                width: '100%',
                maxWidth: '600px',
              }}
            >
              <CIcon icon={cilSearch} style={{ color: '#326396', marginRight: '10px' }} />
              <input
                type="text"
                placeholder="Search by name, email or position..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ border: 'none', outline: 'none', flex: 1 }}
              />
            </div>

            {/* Upload Icon & Progress */}
<div
  style={{
    position: 'absolute',
    right: '0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
    width: '80px'
  }}
>
  <input
    type="file"
    id="fileUpload"
    multiple
    accept=".zip,.pdf"
    style={{ display: 'none' }}
    onChange={(e) => handleBulkUpload(e.target.files)}
  />
  <CIcon
    icon={cilCloudUpload}
    size="xl"
    style={{
      color: uploading ? '#9ca3af' : '#326396',
      cursor: uploading ? 'not-allowed' : 'pointer',
      transition: '0.2s',
    }}
    onClick={() => !uploading && document.getElementById('fileUpload').click()}
  />

  {/* Loader + Progress Bar */}
  {uploading && (
    <div style={{ width: '100%', textAlign: 'center' }}>
      <p style={{ fontSize: '0.8rem', marginBottom: '0.3rem', color: '#326396' }}>
        Uploading... {uploadProgress}%
      </p>
      <div style={{
        height: '5px',
        background: '#e5e7eb',
        borderRadius: '4px',
        overflow: 'hidden'
      }}>
        <div style={{
          width: `${uploadProgress}%`,
          height: '100%',
          background: '#326396',
          transition: 'width 0.2s ease'
        }}></div>
      </div>
    </div>
  )}
</div>

          </div>

          {/* Candidate Table */}
          <CTable
            responsive
            className="align-middle"
            style={{
              width: '100%',
              borderCollapse: 'separate',
              borderSpacing: '0 0.5rem',
              fontSize: '1rem',
              tableLayout: 'auto',
            }}
          >
            <CTableHead>
              <CTableRow>
                {['Name', 'Email', 'Phone', 'Location', 'Experience', 'Position', 'Date Added', 'Original CV', 'Redacted CV', 'Actions'].map(header => (
                  <CTableHeaderCell key={header} style={{ fontWeight: 600, border: 'none', fontSize: '1rem' }}>{header}</CTableHeaderCell>
                ))}
              </CTableRow>
            </CTableHead>

            <CTableBody>
              {filteredCandidates.length > 0 ? filteredCandidates.map(c => (
                <CTableRow key={c.email} style={{
                  backgroundColor: '#fff',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.11)',
                  borderRadius: '0.5rem',
                }}>
                <CTableDataCell style={{ border: 'none', padding: '1rem' }}>
  {(c.fname || c.firstName || '').toString().replace(/\s+/g, ' ').trim()}
</CTableDataCell>


                  <CTableDataCell style={{ border: 'none', padding: '0.8rem 1rem', whiteSpace: 'nowrap' }}>{c.email}</CTableDataCell>
                  <CTableDataCell style={{ border: 'none', padding: '1rem' }}>{c.phone}</CTableDataCell>
                  <CTableDataCell style={{ border: 'none', padding: '1rem' }}>{c.location}</CTableDataCell>
               {/* Experience Cell */}
<CTableDataCell style={{ border: 'none', padding: '1rem', textAlign: 'center' }}>
  {c.experience || c.experience_years ? (
    <span
      style={{
        background: '#e3efff',
        color: '#326396',
        padding: '4px 10px',
        borderRadius: '20px',
        fontSize: '0.85rem',
        cursor: 'pointer'
      }}
      onClick={() => setAddingExpTag(c.email)}
    >
      {c.experience || c.experience_years} yrs
    </span>
  ) : addingExpTag === c.email ? (
    <input
      type="text"
      placeholder="Experience"
      autoFocus
      style={{
        border: '1px solid #d1d5db',
        borderRadius: '0.5rem',
        padding: '4px 8px',
        fontSize: '0.85rem',
        width: '100px'
      }}
      onKeyDown={async (e) => {
        if (e.key === 'Enter' && e.target.value.trim()) {
          const tag = e.target.value.trim()
          setAddingExpTag(null)
          try {
            await updateCandidateByEmailApi(c.email, { experience_years: parseFloat(tag) })
            setFilteredCandidates(prev =>
              prev.map(item =>
                item.email === c.email ? { ...item, experience_years: parseFloat(tag) } : item
              )
            )
            showCAlert(`Experience "${tag}" added`, 'success')
          } catch (err) {
            console.error(err)
            showCAlert('Failed to add experience', 'danger')
          }
        }
      }}
      onBlur={() => setAddingExpTag(null)}
    />
  ) : (
    <span
      style={{
        background: '#f3f4f6',
        color: '#6b7280',
        padding: '4px 10px',
        borderRadius: '20px',
        fontSize: '0.85rem',
        cursor: 'pointer'
      }}
      onClick={() => setAddingExpTag(c.email)}
    >
      + Add Experience
    </span>
  )}
</CTableDataCell>

{/* Position Cell */}
<CTableDataCell style={{ border: 'none', padding: '1rem' }}>
  {c.position || c.position_applied ? (
    <span
      style={{
        background: '#e3efff',
        color: '#326396',
        padding: '4px 10px',
        borderRadius: '20px',
        fontSize: '0.85rem',
        cursor: 'pointer'
      }}
      onClick={() => setAddingPosTag(c.email)}
    >
      {c.position || c.position_applied}
    </span>
  ) : addingPosTag === c.email ? (
    <input
      type="text"
      placeholder="Position"
      autoFocus
      style={{
        border: '1px solid #d1d5db',
        borderRadius: '0.5rem',
        padding: '4px 8px',
        fontSize: '0.85rem',
        width: '120px'
      }}
      onKeyDown={async (e) => {
        if (e.key === 'Enter' && e.target.value.trim()) {
          const tag = e.target.value.trim()
          setAddingPosTag(null)
          try {
            await updateCandidateByEmailApi(c.email, { position_applied: tag })
            setFilteredCandidates(prev =>
              prev.map(item =>
                item.email === c.email ? { ...item, position_applied: tag } : item
              )
            )
            showCAlert(`Position "${tag}" added`, 'success')
          } catch (err) {
            console.error(err)
            showCAlert('Failed to add position', 'danger')
          }
        }
      }}
      onBlur={() => setAddingPosTag(null)}
    />
  ) : (
    <span
      style={{
        background: '#f3f4f6',
        color: '#6b7280',
        padding: '4px 10px',
        borderRadius: '20px',
        fontSize: '0.85rem',
        cursor: 'pointer'
      }}
      onClick={() => setAddingPosTag(c.email)}
    >
      + Add Position
    </span>
  )}
</CTableDataCell>



                  <CTableDataCell style={{ border: 'none', padding: '1rem' }}>{c.date}</CTableDataCell>
                  <CTableDataCell style={{ border: 'none', padding: '1rem' }}>
                    {c.resume_url ? <a href={`http://localhost:7000${c.resume_url}`} target="_blank" rel="noopener noreferrer" style={{ color: '#326396' }}>View Original</a> : 'No Original'}
                  </CTableDataCell>
                  <CTableDataCell style={{ border: 'none', padding: '1rem' }}>
                    {c.resume_url_redacted ? <a href={`http://localhost:7000${c.resume_url_redacted}`} target="_blank" rel="noopener noreferrer" style={{ color: '#326396' }}>View Redacted</a> : 'No Redacted'}
                  </CTableDataCell>
                  <CTableDataCell className="text-center" style={{ border: 'none', padding: '1rem' }}>
                    <CIcon icon={cilPencil} style={{ color: '#3b82f6', cursor: 'pointer', marginRight: '12px' }} onClick={() => handleEdit(c)} />
                    <CIcon icon={cilTrash} style={{ color: '#ef4444', cursor: 'pointer' }} onClick={() => handleDelete(c)} />
                  </CTableDataCell>
                </CTableRow>
              )) : (
                <CTableRow>
                  <CTableDataCell colSpan="10" className="text-center text-muted" style={{ border: 'none', padding: '1rem' }}>
                    No candidates found.
                  </CTableDataCell>
                </CTableRow>
              )}
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>

      {/* Edit Modal */}
      <CModal visible={!!editingCandidate} onClose={() => setEditingCandidate(null)}>
        <CModalHeader closeButton>Edit Candidate</CModalHeader>
        <CModalBody>
          {editingCandidate && (
            <>
              <CFormInput className="mb-2" label="Name" value={editingCandidate.fname || editingCandidate.firstName || ''} onChange={(e) => setEditingCandidate({ ...editingCandidate, fname: e.target.value })} />
              <CFormInput className="mb-2" label="Phone" value={editingCandidate.phone || ''} onChange={(e) => setEditingCandidate({ ...editingCandidate, phone: e.target.value })} />
              <CFormInput className="mb-2" label="Location" value={editingCandidate.location || ''} onChange={(e) => setEditingCandidate({ ...editingCandidate, location: e.target.value })} />
              <CFormInput className="mb-2" label="Experience" value={editingCandidate.experience || editingCandidate.experience_years || ''} onChange={(e) => setEditingCandidate({ ...editingCandidate, experience: e.target.value })} />
              <CFormInput className="mb-2" label="Position" value={editingCandidate.position || editingCandidate.position_applied || ''} onChange={(e) => setEditingCandidate({ ...editingCandidate, position: e.target.value })} />
            </>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setEditingCandidate(null)}>Cancel</CButton>
          <CButton color="primary" onClick={handleSave}>Save</CButton>
        </CModalFooter>
      </CModal>

      {/* Delete Confirmation Modal */}
      <CModal visible={!!deletingCandidate} onClose={() => setDeletingCandidate(null)}>
        <CModalHeader closeButton>Confirm Delete</CModalHeader>
        <CModalBody>Are you sure you want to delete this candidate?</CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setDeletingCandidate(null)}>Cancel</CButton>
          <CButton color="danger" onClick={handleConfirmDelete}>Delete</CButton>
        </CModalFooter>
      </CModal>

    </CContainer>
  )
}

export default DisplayCandidates
