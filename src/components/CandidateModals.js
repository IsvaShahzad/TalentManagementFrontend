

import React, { useState } from 'react'
import { CModal, CModalHeader, CModalBody, CModalFooter, CFormInput, CButton } from '@coreui/react'
import { updateCandidateByEmailApi } from "../api/api"

const CandidateModals = ({
  editingCandidate,
  setEditingCandidate,
  handleSave,
  deletingCandidate,
  setDeletingCandidate,
  handleConfirmDelete,
  notesModalVisible,
  setNotesModalVisible,
  currentNotesCandidate,
  notesText,
  setNotesText,
  showCAlert,
  refreshCandidates,
  showFrequencyModal,
  setShowFrequencyModal,
  selectedFrequency,
  setSelectedFrequency,
  handleSaveSearch,
  savingSearch,
  creatingNote,
  handleCreateNote,
  refreshNotes
}) => {

  const modalFontSize = '0.8rem' // smaller font size
  const buttonFontSize = '0.75rem' // smaller button text
  const buttonPadding = '0.25rem 0.5rem' // smaller button padding
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleSaveClick = async () => {
    if (!handleSave) return
    try {
      setSaving(true)
      await handleSave()
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteClick = async () => {
    if (!handleConfirmDelete) return
    try {
      setDeleting(true)
      await handleConfirmDelete()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      {/* Edit Modal */}
      <CModal visible={!!editingCandidate} onClose={() => setEditingCandidate(null)}>
        <CModalHeader closeButton style={{ fontSize: modalFontSize, fontWeight: '400px' }}>Edit Candidate</CModalHeader>
        <CModalBody style={{ fontSize: modalFontSize }}>
          {editingCandidate && (
            <>
              <CFormInput className="mb-2" label="Name" value={editingCandidate.name || ''} onChange={(e) => setEditingCandidate({ ...editingCandidate, name: e.target.value })} size="sm" />
              <CFormInput className="mb-2" label="Phone" value={editingCandidate.phone || ''} onChange={(e) => setEditingCandidate({ ...editingCandidate, phone: e.target.value })} size="sm" />
              <CFormInput className="mb-2" label="Location" value={editingCandidate.location || ''} onChange={(e) => setEditingCandidate({ ...editingCandidate, location: e.target.value })} size="sm" />
              <CFormInput className="mb-2" label="Experience" value={editingCandidate.experience_years || ''} onChange={(e) => setEditingCandidate({ ...editingCandidate, experience_years: e.target.value })} size="sm" />
              <CFormInput className="mb-2" label="Position" value={editingCandidate.position_applied || ''} onChange={(e) => setEditingCandidate({ ...editingCandidate, position_applied: e.target.value })} size="sm" />
              <CFormInput className="mb-2" label="Current Salary" value={editingCandidate.current_last_salary || ''} onChange={(e) => setEditingCandidate({ ...editingCandidate, current_last_salary: e.target.value })} size="sm" />
              <CFormInput className="mb-2" label="Expected Salary" value={editingCandidate.expected_salary || ''} onChange={(e) => setEditingCandidate({ ...editingCandidate, expected_salary: e.target.value })} size="sm" />


            </>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton
            color="secondary"
            onClick={() => setEditingCandidate(null)}
            style={{ fontSize: buttonFontSize, padding: buttonPadding }}
          >
            Cancel
          </CButton>
          <CButton
            color="primary"
            onClick={handleSaveClick}
            disabled={saving}
            style={{
              fontSize: buttonFontSize,
              padding: buttonPadding,
              opacity: saving ? 0.85 : 1,
            }}
          >
            {saving ? 'Saving...' : 'Save'}
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Delete Modal
      <CModal visible={!!deletingCandidate} onClose={() => setDeletingCandidate(null)}>
        <CModalHeader closeButton style={{ fontSize: modalFontSize }}>Confirm Delete</CModalHeader>
        <CModalBody style={{ fontSize: modalFontSize }}>Are you sure you want to delete {deletingCandidate?.name || 'this candidate'}?</CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setDeletingCandidate(null)} style={{ fontSize: buttonFontSize, padding: buttonPadding }}>Cancel</CButton>
          <CButton color="danger" onClick={handleConfirmDelete} style={{ fontSize: buttonFontSize, padding: buttonPadding }}>Delete</CButton>
        </CModalFooter>
      </CModal> */}


      {/* Delete Modal */}
      <CModal visible={!!deletingCandidate} onClose={() => setDeletingCandidate(null)}>
        <CModalHeader closeButton style={{ fontSize: modalFontSize }}>Confirm Delete</CModalHeader>
        <CModalBody style={{ fontSize: modalFontSize }}>
          Are you sure you want to delete {deletingCandidate?.name || 'this candidate'}?
        </CModalBody>
        <CModalFooter>
          <CButton
            color="secondary"
            onClick={() => {
              setDeletingCandidate(null)
            }}
            style={{ fontSize: buttonFontSize, padding: buttonPadding }}
          >
            Cancel
          </CButton>
          <CButton
            color="danger"
            onClick={handleDeleteClick}
            disabled={deleting}
            style={{
              fontSize: buttonFontSize,
              padding: buttonPadding,
              color: 'white',
              opacity: deleting ? 0.9 : 1,
            }} // ✅ white text
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </CButton>
        </CModalFooter>
      </CModal>


      {/*  Notes Modal*/}
      <CModal visible={notesModalVisible} onClose={() => {
        setNotesModalVisible(false)
        refreshNotes()
      }
      }>
        <CModalHeader closeButton style={{ fontSize: modalFontSize }}>Candidate Notes</CModalHeader>
        <CModalBody style={{ fontSize: modalFontSize }}>
          <textarea
            value={notesText}
            onChange={(e) => setNotesText(e.target.value)}
            style={{ width: '100%', minHeight: '120px', padding: '6px', fontSize: modalFontSize }}
          />
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setNotesModalVisible(false)} style={{ fontSize: buttonFontSize, padding: buttonPadding }}>Close</CButton>
          <CButton color="primary" onClick={() => {
            handleCreateNote()
            refreshNotes()
          }
          } disabled={creatingNote} style={{ fontSize: buttonFontSize, padding: buttonPadding }}>
            {creatingNote ? 'Creating...' : 'Create'}
          </CButton>
        </CModalFooter>
      </CModal >

      {/* Frequency Modal */}
      < CModal visible={showFrequencyModal} onClose={() => {
        setShowFrequencyModal(false)
        refreshNotes()
      }
      }>
        <CModalHeader closeButton style={{ fontSize: modalFontSize }}>Save Search</CModalHeader>
        <CModalBody style={{ fontSize: modalFontSize }}>
          <p style={{ fontSize: modalFontSize }}>Select how often you want to get notified regarding this search:</p>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            {['none', 'daily'].map(freq => (
              <CButton
                key={freq}
                color={selectedFrequency === freq ? 'primary' : 'secondary'}
                onClick={() => setSelectedFrequency(freq)}
                style={{ fontSize: buttonFontSize, padding: buttonPadding }}
              >
                {freq.charAt(0).toUpperCase() + freq.slice(1)}
              </CButton>
            ))}
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton color="primary" onClick={handleSaveSearch} disabled={savingSearch} style={{ fontSize: buttonFontSize, padding: buttonPadding }}>
            {savingSearch ? 'Saving...' : 'Save'}
          </CButton>
          <CButton color="secondary" onClick={() => setShowFrequencyModal(false)} style={{ fontSize: buttonFontSize, padding: buttonPadding }}>Cancel</CButton>
        </CModalFooter>
      </CModal >
    </>
  )
}

export default CandidateModals
