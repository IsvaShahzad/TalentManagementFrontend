import React, { useState } from 'react'
import { CModal, CModalHeader, CModalBody, CModalFooter, CFormInput, CButton } from '@coreui/react'

const NoteModals = ({
    editNote,
    setEditNote,
    handleSave,
    deletingNote,
    setDeletingNote,
    handleConfirmDelete,
    setDeletingRem,
    deletingRem,
    handleConfirmDeleteReminder,
    noteText,
    setNoteText,
    showCAlert,
    durationHours,
    durationMinutes,
    durationSeconds,
    setDurationHours,
    setDurationMinutes,
    setDurationSeconds
}) => {

    const inputStyle = { fontSize: '14px', padding: '6px 8px' }
    const buttonStyle = { fontSize: '14px', padding: '6px 12px' }

    const [saving, setSaving] = useState(false)
    const [deletingNoteLoading, setDeletingNoteLoading] = useState(false)
    const [deletingRemLoading, setDeletingRemLoading] = useState(false)

    const onSaveClick = async () => {
        if (!handleSave) return
        try {
            setSaving(true)
            await handleSave()
        } finally {
            setSaving(false)
        }
    }

    const onDeleteNoteClick = async () => {
        if (!handleConfirmDelete) return
        try {
            setDeletingNoteLoading(true)
            await handleConfirmDelete()
        } finally {
            setDeletingNoteLoading(false)
        }
    }

    const onDeleteRemClick = async () => {
        if (!handleConfirmDeleteReminder) return
        try {
            setDeletingRemLoading(true)
            await handleConfirmDeleteReminder()
        } finally {
            setDeletingRemLoading(false)
        }
    }

    return (
        <>
            {/* Edit Modal */}
            <CModal visible={!!editNote} onClose={() => setEditNote(null)} size="lg">
                <CModalHeader closeButton style={{ fontSize: '16px' }}>Edit Note</CModalHeader>
                <CModalBody style={{ fontSize: '14px' }}>
                    {editNote && (
                        <>
                            {/* Note Text */}
                            <CFormInput
                                className="mb-3"
                                label="Note Text"
                                value={editNote.note || ""}
                                onChange={(e) =>
                                    setEditNote({ ...editNote, note: e.target.value })
                                }
                                style={inputStyle}
                            />

                            {/* Duration Inputs */}
                            <div className="mb-3">
                                <label style={{ fontSize: '14px' }}>Call Duration</label>
                                <div style={{ display: "flex", gap: "0.75rem" }}>
                                    <CFormInput
                                        type="number"
                                        min="0"
                                        placeholder="Hours"
                                        value={durationHours}
                                        onChange={(e) => setDurationHours(e.target.value)}
                                        style={inputStyle}
                                    />
                                    <CFormInput
                                        type="number"
                                        min="0"
                                        placeholder="Minutes"
                                        value={durationMinutes}
                                        onChange={(e) => setDurationMinutes(e.target.value)}
                                        style={inputStyle}
                                    />
                                    <CFormInput
                                        type="number"
                                        min="0"
                                        placeholder="Seconds"
                                        value={durationSeconds}
                                        onChange={(e) => setDurationSeconds(e.target.value)}
                                        style={inputStyle}
                                    />
                                </div>
                            </div>
                        </>
                    )}
                </CModalBody>

                <CModalFooter>
                    <CButton color="secondary" onClick={() => setEditNote(null)} style={buttonStyle}>Cancel</CButton>
                    <CButton
                        color="primary"
                        onClick={onSaveClick}
                        disabled={saving}
                        style={{ ...buttonStyle, opacity: saving ? 0.85 : 1 }}
                    >
                        {saving ? 'Saving...' : 'Save'}
                    </CButton>
                </CModalFooter>
            </CModal>

            {/* Delete Modal
            <CModal visible={!!deletingNote} onClose={() => setDeletingNote(null)} size="md">
                <CModalHeader closeButton style={{ fontSize: '16px' }}>Confirm Delete</CModalHeader>
                <CModalBody style={{ fontSize: '14px' }}>Are you sure you want to delete this note?</CModalBody>
                <CModalFooter>
                    <CButton color="secondary" onClick={() => setDeletingNote(null)} style={buttonStyle}>Cancel</CButton>
                    <CButton color="danger" onClick={handleConfirmDelete} style={buttonStyle}>Delete</CButton>
                </CModalFooter>
            </CModal> */}

            {/* Delete Reminder Modal */}
            {/* <CModal visible={!!deletingRem} onClose={() => setDeletingRem(null)} size="md">
                <CModalHeader closeButton style={{ fontSize: '16px' }}>Confirm Delete</CModalHeader>
                <CModalBody style={{ fontSize: '14px' }}>Are you sure you want to delete this reminder?</CModalBody>
                <CModalFooter>
                    <CButton color="secondary" onClick={() => setDeletingRem(null)} style={buttonStyle}>Cancel</CButton>
                    <CButton color="danger" onClick={handleConfirmDeleteReminder} style={buttonStyle}>Delete</CButton>
                </CModalFooter>
            </CModal> */}


{/* Delete Modal */}
<CModal visible={!!deletingNote} onClose={() => setDeletingNote(null)} size="md">
  <CModalHeader closeButton style={{ fontSize: '16px' }}>Confirm Delete</CModalHeader>
  <CModalBody style={{ fontSize: '14px' }}>Are you sure you want to delete this note?</CModalBody>
  <CModalFooter>
    <CButton color="secondary" onClick={() => setDeletingNote(null)} style={buttonStyle}>
      Cancel
    </CButton>
    <CButton
      color="danger"
      onClick={onDeleteNoteClick}
      disabled={deletingNoteLoading}
      style={{ ...buttonStyle, color: '#fff', opacity: deletingNoteLoading ? 0.85 : 1 }}
    >
      {deletingNoteLoading ? 'Deleting...' : 'Delete'}
    </CButton>
  </CModalFooter>
</CModal>

{/* Delete Reminder Modal */}
<CModal visible={!!deletingRem} onClose={() => setDeletingRem(null)} size="md">
  <CModalHeader closeButton style={{ fontSize: '16px' }}>Confirm Delete</CModalHeader>
  <CModalBody style={{ fontSize: '14px' }}>Are you sure you want to delete this reminder?</CModalBody>
  <CModalFooter>
    <CButton color="secondary" onClick={() => setDeletingRem(null)} style={buttonStyle}>
      Cancel
    </CButton>

    
    <CButton
      color="danger"
      onClick={onDeleteRemClick}
      disabled={deletingRemLoading}
      style={{ ...buttonStyle, color: '#fff', opacity: deletingRemLoading ? 0.85 : 1 }}
    >
      {deletingRemLoading ? 'Deleting...' : 'Delete'}
    </CButton>
  </CModalFooter>
</CModal>



        </>
    )
}

export default NoteModals
