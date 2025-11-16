import React from 'react'
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

    return (
        <>
            {/* Edit Modal */}
            <CModal visible={!!editNote} onClose={() => setEditNote(null)}>
                <CModalHeader closeButton>Edit Note</CModalHeader>
                <CModalBody>
                    {editNote && (
                        <>
                            {/* Note Text */}
                            <CFormInput
                                className="mb-2"
                                label="Note Text"
                                value={editNote.note || ""}
                                onChange={(e) =>
                                    setEditNote({ ...editNote, note: e.target.value })
                                }
                            />

                            {/* Duration Inputs */}
                            <div className="mb-2">
                                <label>Call Duration</label>
                                <div style={{ display: "flex", gap: "0.5rem" }}>
                                    <CFormInput
                                        type="number"
                                        min="0"
                                        placeholder="Hours"
                                        value={durationHours}
                                        onChange={(e) => setDurationHours(e.target.value)}
                                    />
                                    <CFormInput
                                        type="number"
                                        min="0"
                                        placeholder="Minutes"
                                        value={durationMinutes}
                                        onChange={(e) => setDurationMinutes(e.target.value)}
                                    />
                                    <CFormInput
                                        type="number"
                                        min="0"
                                        placeholder="Seconds"
                                        value={durationSeconds}
                                        onChange={(e) => setDurationSeconds(e.target.value)}
                                    />

                                </div>
                            </div>
                        </>
                    )}
                </CModalBody>


                <CModalFooter>
                    <CButton color="secondary" onClick={() => setEditNote(null)}>Cancel</CButton>
                    <CButton color="primary" onClick={handleSave}>Save</CButton>
                </CModalFooter>
            </CModal >

            {/* Delete Modal */}
            < CModal visible={!!deletingNote
            } onClose={() => setDeletingNote(null)}>
                <CModalHeader closeButton>Confirm Delete</CModalHeader>
                <CModalBody>Are you sure you want to delete this note ?</CModalBody>
                <CModalFooter>
                    <CButton color="secondary" onClick={() => setDeletingNote(null)}>Cancel</CButton>
                    <CButton color="danger" onClick={handleConfirmDelete}>Delete</CButton>
                </CModalFooter>
            </CModal >

            {/* Delete Rem Modal */}
            < CModal visible={!!deletingRem} onClose={() => setDeletingRem(null)}>
                <CModalHeader closeButton>Confirm Delete</CModalHeader>
                <CModalBody>Are you sure you want to delete this reminder ?</CModalBody>
                <CModalFooter>
                    <CButton color="secondary" onClick={() => setDeletingRem(null)}>Cancel</CButton>
                    <CButton color="danger" onClick={handleConfirmDeleteReminder}>Delete</CButton>
                </CModalFooter>
            </CModal >


        </>
    )
}

export default NoteModals
