  import React, { useState, useEffect } from 'react'
  import {
    CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell,
    CCard, CButton, CAlert, CFormInput
  } from '@coreui/react'
  import CIcon from '@coreui/icons-react'
  import { cilPencil, cilTrash, cilSearch } from '@coreui/icons'
  import { deleteCandidateApi, updateCandidateByEmailApi } from '../../../api/api'

  const DisplayCandidates = ({ candidates, refreshCandidates }) => {
    const [filteredCandidates, setFilteredCandidates] = useState([])
    const [searchQuery, setSearchQuery] = useState('')
    const [alerts, setAlerts] = useState([])
    const [editingCandidate, setEditingCandidate] = useState(false)
    const [editableCandidate, setEditableCandidate] = useState({})
    const [deletingCandidate, setDeletingCandidate] = useState(null)

    // 🔹 Alert helper
    const showCAlert = (message, color = 'success') => {
      const id = new Date().getTime()
      setAlerts((prev) => [...prev, { id, message, color }])
      setTimeout(() => {
        setAlerts((prev) => prev.filter((alert) => alert.id !== id))
      }, 3000)
    }

    // 🔹 Delete logic
    const handleDelete = (candidate) => setDeletingCandidate(candidate)

    const handleConfirmDelete = async () => {
      if (!deletingCandidate) return
      try {
        await deleteCandidateApi(deletingCandidate.id)
        setDeletingCandidate(null)
        refreshCandidates()
        showCAlert('Candidate deleted successfully', 'success')
      } catch (err) {
        console.error('Failed to delete candidate:', err)
        showCAlert('Failed to delete candidate', 'danger')
      }
    }

    const handleCancelDelete = () => setDeletingCandidate(null)

    // 🔹 Edit logic
    const handleEdit = (candidate) => {
      setEditingCandidate(true)
      setEditableCandidate(candidate)
    }

    const handleCancelEdit = () => {
      setEditingCandidate(false)
      setEditableCandidate({})
    }

    const handleSave = async () => {
      try {
        await updateCandidateByEmailApi(editableCandidate.email, {
          firstName: editableCandidate.fname ?? null,
          lastName: editableCandidate.lname ?? null,
          phone: editableCandidate.phone ?? null,
          location: editableCandidate.location ?? null,
          experience_years: editableCandidate.experience ?? null,
          position_applied: editableCandidate.position ?? null,
        })
        setEditingCandidate(false)
        setEditableCandidate({})
        showCAlert('Candidate updated successfully', 'success')
        refreshCandidates()
      } catch (err) {
        console.error('Candidate update failed:', err)
        showCAlert('Failed to update candidate', 'danger')
      }
    }

    // 🔹 Search filter
    useEffect(() => {
      const query = searchQuery.toLowerCase().trim()
      const filtered = candidates.filter((c) => {
        const firstName = c.firstName || c.fname || ''
        const lastName = c.lastName || c.lname || ''
        const fullName = `${firstName} ${lastName}`.toLowerCase()
        const email = c.email || ''
        const position = c.position || c.position_applied || ''
        const experience = c.experience ? String(c.experience) : ''

        return (
          fullName.includes(query) ||
          firstName.toLowerCase().includes(query) ||
          lastName.toLowerCase().includes(query) ||
          email.toLowerCase().includes(query) ||
          position.toLowerCase().includes(query) ||
          experience.includes(query)
        )
      })
      setFilteredCandidates(filtered)
    }, [searchQuery, candidates])


    

  const [bulkFiles, setBulkFiles] = useState([])


  // 🔹 Bulk Upload Function
  const handleBulkUpload = async () => {
    if (!bulkFiles || bulkFiles.length === 0) {
      showCAlert('Please select at least one file to upload.', 'warning')
      return
    }

    const formData = new FormData()
    for (const file of bulkFiles) {
      formData.append('files', file)
    }

    try {
      const response = await fetch('http://localhost:7000/api/candidate/bulk-upload-cvs', {
        method: 'POST',
        body: formData,
      })
      const data = await response.json()
      console.log('Bulk upload response:', data)
      showCAlert(data.message || 'Bulk upload completed successfully', 'success')
      setBulkFiles([])
      refreshCandidates() // Refresh table after upload
    } catch (err) {
      console.error('Bulk upload failed:', err)
      showCAlert('Failed to upload files. Check console for details.', 'danger')
    }
  }


    return (
      <>
        {/* Alerts */}
        <div style={{ position: 'fixed', top: '10px', right: '10px', zIndex: 9999 }}>
          {alerts.map((alert) => (
            <CAlert key={alert.id} color={alert.color} dismissible>
              {alert.message}
            </CAlert>
          ))}
        </div>



  {/* 🔹 Bulk Upload Section */}
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
    <CFormInput
      type="file"
      multiple
      accept=".zip,.pdf"
      onChange={(e) => setBulkFiles(e.target.files)}
      style={{ maxWidth: '350px' }}
    />
    <CButton color="primary" onClick={handleBulkUpload}>
      Upload Files
    </CButton>
  </div>




        {/* Search Bar */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            display: 'flex', alignItems: 'center', backgroundColor: '#fff',
            border: '1px solid #e2e8f0', borderRadius: '2px', padding: '0.6rem 1rem',
            width: '100%', maxWidth: '600px'
          }}>
            <CIcon icon={cilSearch} style={{ color: '#326396', marginRight: '10px' }} />
            <input
              type="text"
              placeholder="Search by name, email or position..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ border: 'none', outline: 'none', flex: 1 }}
            />
          </div>
        </div>

        {/* Candidates Table */}
        <CTable responsive className="align-middle" style={{ marginTop: '20px' }}>
          <CTableHead>
            <CTableRow style={{ backgroundColor: '#f8fafc' }}>
              <CTableHeaderCell>Name</CTableHeaderCell>
              <CTableHeaderCell>Email</CTableHeaderCell>
              <CTableHeaderCell>Phone</CTableHeaderCell>
              <CTableHeaderCell>Location</CTableHeaderCell>
              <CTableHeaderCell>Experience</CTableHeaderCell>
              <CTableHeaderCell>Position</CTableHeaderCell>
              <CTableHeaderCell>Date Added</CTableHeaderCell>
              <CTableHeaderCell>Original CV</CTableHeaderCell>
              <CTableHeaderCell>Redacted CV</CTableHeaderCell>
              <CTableHeaderCell className="text-center">Actions</CTableHeaderCell>
            </CTableRow>
          </CTableHead>

          <CTableBody>
            {filteredCandidates.length > 0 ? (
              filteredCandidates.map((c) => (
                <CTableRow key={`${c.email}-${c.resume_url || Math.random()}`}>
                  <CTableDataCell>{c.fname} {c.lname}</CTableDataCell>
                  <CTableDataCell>{c.email}</CTableDataCell>
                  <CTableDataCell>{c.phone}</CTableDataCell>
                  <CTableDataCell>{c.location}</CTableDataCell>
                  <CTableDataCell>{c.experience}</CTableDataCell>
                  <CTableDataCell>{c.position}</CTableDataCell>
                  <CTableDataCell>{c.date}</CTableDataCell>

                  <CTableDataCell>
    {c.resume_url ? (
      <a
        href={`http://localhost:7000${c.resume_url}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: '#326396', textDecoration: 'underline' }}
      >
        View Original
      </a>
    ) : (
      'No Original'
    )}
  </CTableDataCell>

 <CTableDataCell>
  {c.resume_url_redacted ? (
    <a
      href={`http://localhost:7000${c.resume_url_redacted}`}
      target="_blank"
      rel="noopener noreferrer"
      style={{ color: '#326396', textDecoration: 'underline' }}
    >
      View Redacted
    </a>
  ) : (
    'No Redacted'
  )}
</CTableDataCell>



                

                  <CTableDataCell className="text-center">
                    <CIcon icon={cilPencil} style={{ color: '#3b82f6', cursor: 'pointer', marginRight: '12px' }} onClick={() => handleEdit(c)} />
                    <CIcon icon={cilTrash} style={{ color: '#ef4444', cursor: 'pointer' }} onClick={() => handleDelete(c)} />
                  </CTableDataCell>
                </CTableRow>
              ))
            ) : (
              <CTableRow>
                <CTableDataCell colSpan="10" className="text-center text-muted">
                  No candidates found.
                </CTableDataCell>
              </CTableRow>
            )}
          </CTableBody>
        </CTable>

        {/* Edit Modal */}
        {editingCandidate && (
          <div className="overlay" style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.3)', display: 'flex',
            justifyContent: 'center', alignItems: 'center', zIndex: 9999
          }}>
            <CCard className="p-4 text-center" style={{ width: '400px', position: 'relative' }}>
              <h5>Edit Candidate</h5>

              <CFormInput label="First Name"
                value={editableCandidate.fname || editableCandidate.firstName || ''}
                onChange={(e) => setEditableCandidate({ ...editableCandidate, fname: e.target.value })}
                className="mb-2"
              />
              <CFormInput label="Last Name"
                value={editableCandidate.lname || editableCandidate.lastName || ''}
                onChange={(e) => setEditableCandidate({ ...editableCandidate, lname: e.target.value })}
                className="mb-2"
              />
              <CFormInput label="Email"
                value={editableCandidate.email || ''}
                onChange={(e) => setEditableCandidate({ ...editableCandidate, email: e.target.value })}
                className="mb-2"
              />
              <CFormInput label="Phone"
                value={editableCandidate.phone || ''}
                onChange={(e) => setEditableCandidate({ ...editableCandidate, phone: e.target.value })}
                className="mb-2"
              />
              <CFormInput label="Position"
                value={editableCandidate.position || editableCandidate.position_applied || ''}
                onChange={(e) => setEditableCandidate({ ...editableCandidate, position: e.target.value })}
                className="mb-2"
              />

              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '10px' }}>
                <CButton
                  onClick={handleSave}
                  style={{
                    width: '200px',
                    backgroundColor: '#4CAF50',
                    borderRadius: '2px',
                    color: '#fff',
                    fontWeight: '500',
                    padding: '10px 10px',
                  }}
                >
                  Update
                </CButton>
                <CButton color="secondary" onClick={handleCancelEdit}>Cancel</CButton>
              </div>
            </CCard>
          </div>
        )}

        {/* Delete Confirmation */}
        {deletingCandidate && (
          <div className="overlay">
            <CCard className="p-4 text-center" style={{ width: '400px', margin: 'auto', top: '20%' }}>
              <h5>Confirm Delete</h5>
              <p>Are you sure you want to delete <strong>{deletingCandidate.firstName}</strong>?</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                <CButton color="secondary" onClick={handleCancelDelete}>Cancel</CButton>
                <CButton color="danger" onClick={handleConfirmDelete}>Delete</CButton>
              </div>
            </CCard>
          </div>
        )}
      </>
    )
  }



  export default DisplayCandidates


