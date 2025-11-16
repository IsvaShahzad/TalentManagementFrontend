import React from 'react'
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
  handleCreateNote
}) => {

  return (
    <>
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
              <CFormInput className="mb-2" label="Position" value={editingCandidate.position_applied || ''} onChange={(e) => setEditingCandidate({ ...editingCandidate, position_applied: e.target.value })} />
              <CFormInput className="mb-2" label="Current Salary" value={editingCandidate.current_last_salary || ''} onChange={(e) => setEditingCandidate({ ...editingCandidate, current_last_salary: e.target.value })} />
              <CFormInput className="mb-2" label="Expected Salary" value={editingCandidate.expected_salary || ''} onChange={(e) => setEditingCandidate({ ...editingCandidate, expected_salary: e.target.value })} />
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
          <textarea
            value={notesText}
            onChange={(e) => setNotesText(e.target.value)}
            style={{ width: '100%', minHeight: '150px', padding: '10px' }}
          />
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setNotesModalVisible(false)}>Close</CButton>
          {/**  <CButton color="primary" onClick={async () => {
            if (!currentNotesCandidate) return
            try {
              await updateCandidateByEmailApi(currentNotesCandidate.email, { notes: notesText })
              showCAlert('Notes created', 'success')
              setNotesModalVisible(false)
              refreshCandidates()
            } catch (err) {
              console.error(err)
              showCAlert('Failed to create note', 'danger')
            }
          }}>Save</CButton>
*/}

          <CButton
            color="primary"
            onClick={() => handleCreateNote()}
            disabled={creatingNote}
          >
            {creatingNote ? 'Creating...' : 'Create'}

          </CButton>
        </CModalFooter>
      </CModal>

      {/* Frequency Modal */}
      <CModal visible={showFrequencyModal} onClose={() => setShowFrequencyModal(false)}>
        <CModalHeader closeButton>Save Search</CModalHeader>
        <CModalBody>
          <p>Select how often you want to get notified regarding this search:</p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            {['none', 'daily', 'weekly'].map(freq => (
              <CButton
                key={freq}
                color={selectedFrequency === freq ? 'primary' : 'secondary'}
                onClick={() => setSelectedFrequency(freq)}
              >
                {freq.charAt(0).toUpperCase() + freq.slice(1)}
              </CButton>
            ))}
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton color="primary" onClick={handleSaveSearch} disabled={savingSearch}>
            {savingSearch ? 'Saving...' : 'Save'}
          </CButton>
          <CButton color="secondary" onClick={() => setShowFrequencyModal(false)}>Cancel</CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default CandidateModals
