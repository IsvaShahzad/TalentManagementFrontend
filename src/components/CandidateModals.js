

import React, { useState } from 'react'
import { CModal, CModalHeader, CModalBody, CModalFooter, CFormInput, CFormSelect, CButton } from '@coreui/react'
import { actionButtonText, actionButtonLoadingStyle } from '../utils/actionButtonLabels'
const CANDIDATE_STATUS_OPTIONS = [
  { label: "Submitted", value: "Submitted" },
  { label: "Shortlisted", value: "Shortlisted" },
  { label: "Interviewing", value: "Interviewing" },
  { label: "Offered", value: "Offered" },
  { label: "Hired", value: "Hired" },
  { label: "Not a fit", value: "Not_A_Fit" },
  { label: "Withdrawn", value: "Withdrawn" },
]

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


  const [isHovered, setIsHovered] = useState(false);

  const modalFontSize = '0.8rem' // smaller font size
  const buttonFontSize = '0.75rem' // smaller button text
  const buttonPadding = '0.25rem 0.5rem' // smaller button padding
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [skillInput, setSkillInput] = useState("");
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
  const rawSkills = editingCandidate?.skills;
  const safeSkills = Array.isArray(rawSkills)
    ? rawSkills
    : typeof rawSkills === "string" && rawSkills.trim()
      ? rawSkills.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

  return (
    <>
      {/* Edit Modal */}
      <CModal visible={!!editingCandidate} onClose={() => setEditingCandidate(null)}>
        <CModalHeader closeButton >Edit Candidate</CModalHeader>
        <CModalBody style={{ fontSize: modalFontSize }}>
          {editingCandidate && (
            <>
              <CFormInput className="mb-1" label="Name" value={editingCandidate.name || ''} onChange={(e) => setEditingCandidate({ ...editingCandidate, name: e.target.value })} size="sm" />
              <CFormInput className="mb-1" label="Email" type="email" value={editingCandidate.email || ''} onChange={(e) => setEditingCandidate({ ...editingCandidate, email: e.target.value })} size="sm" />
              <CFormInput className="mb-1" label="Phone" value={editingCandidate.phone || ''} onChange={(e) => setEditingCandidate({ ...editingCandidate, phone: e.target.value })} size="sm" />
              <CFormInput className="mb-1" label="Location" value={editingCandidate.location || ''} onChange={(e) => setEditingCandidate({ ...editingCandidate, location: e.target.value })} size="sm" />
              <CFormInput className="mb-1" label="Experience" value={editingCandidate.experience_years || ''} onChange={(e) => setEditingCandidate({ ...editingCandidate, experience_years: e.target.value })} size="sm" />
              <CFormInput className="mb-1" label="Position" value={editingCandidate.position_applied || ''} onChange={(e) => setEditingCandidate({ ...editingCandidate, position_applied: e.target.value })} size="sm" />
              <CFormInput className="mb-1" label="Current Salary" value={editingCandidate.current_last_salary || ''} onChange={(e) => setEditingCandidate({ ...editingCandidate, current_last_salary: e.target.value })} size="sm" />
              <CFormInput className="mb-1" label="Expected Salary" value={editingCandidate.expected_salary || ''} onChange={(e) => setEditingCandidate({ ...editingCandidate, expected_salary: e.target.value })} size="sm" />
              <CFormInput className="mb-1" label="Industry" value={editingCandidate.industry || ''} onChange={(e) => setEditingCandidate({ ...editingCandidate, industry: e.target.value })} size="sm" />
              <CFormInput className="mb-1" label="Client name" value={editingCandidate.client_name || ''} onChange={(e) => setEditingCandidate({ ...editingCandidate, client_name: e.target.value })} size="sm" />
              <CFormInput className="mb-1" label="Ownership" value={editingCandidate.sourced_by_name || ''} onChange={(e) => setEditingCandidate({ ...editingCandidate, sourced_by_name: e.target.value })} size="sm" />
              <CFormSelect
                className="mb-1"
                label="Status"
                size="sm"
                value={editingCandidate.candidate_status || ''}
                onChange={(e) =>
                  setEditingCandidate({
                    ...editingCandidate,
                    candidate_status: e.target.value || null,
                  })
                }
              >
                <option value="" disabled>
                  Select status
                </option>
                {CANDIDATE_STATUS_OPTIONS.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </CFormSelect>
              {/*   <CFormInput className="mb-1" label="Skills" value={editingCandidate.skills || ''} onChange={(e) => setEditingCandidate({ ...editingCandidate, skills: e.target.value })} size="sm" />
              Skills Tags Input */}
              <label
                style={{
                  fontSize: "0.85rem",
                  marginBottom: "4px",
                  display: "block",
                }}
              >
                Skills
              </label>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "6px",
                  padding: "8px",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                  minHeight: "40px",
                  alignItems: "center",
                  marginBottom: "0.5rem",
                }}
              >
                {safeSkills.map((skill, idx) => (
                  <span
                    key={idx}
                    style={{
                      background: "#eef2ff",
                      color: "#1e40af",
                      padding: "4px 8px",
                      borderRadius: "999px",
                      fontSize: "12px",
                      fontWeight: 500,
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    {skill}
                    <span
                      onClick={() =>
                        setEditingCandidate({
                          ...editingCandidate,
                          skills: safeSkills.filter((s) => s !== skill),
                        })
                      }
                      style={{
                        cursor: "pointer",
                        fontWeight: "bold",
                        fontSize: "14px",
                        marginLeft: "2px",
                      }}
                    >
                      &times;
                    </span>
                  </span>
                ))
                }
                <input
                  id="skillInput"
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  // onKeyDown={(e) => {
                  //   const trimmed = skillInput.trim();

                  //   // Add skill on Enter or Space
                  //   if ((e.key === "Enter" || e.key === " ") && trimmed) {
                  //     e.preventDefault();
                  //     if (!editingCandidate.skills.includes(trimmed)) {
                  //       setEditingCandidate({
                  //         ...editingCandidate,
                  //         skills: [...editingCandidate.skills, trimmed],
                  //       });
                  //     }
                  //     setSkillInput("");
                  //   }

                  //   // Backspace removes last skill if input empty
                  //   if (
                  //     e.key === "Backspace" &&
                  //     !trimmed &&
                  //     editingCandidate.skills.length
                  //   ) {
                  //     e.preventDefault();
                  //     setEditingCandidate({
                  //       ...editingCandidate,
                  //       skills: editingCandidate.skills.slice(0, -1),
                  //     });
                  //   }
                  // }}
                  onKeyDown={(e) => {
                    const trimmed = skillInput.trim();
                    const currentSkills = safeSkills;

                    // Add skill
                    if ((e.key === "Enter") && trimmed) {
                      e.preventDefault();

                      if (!currentSkills.includes(trimmed)) {
                        setEditingCandidate({
                          ...editingCandidate,
                          skills: [...currentSkills, trimmed],
                        });
                      }

                      setSkillInput("");
                    }

                    // Remove last skill
                    if (e.key === "Backspace" && !trimmed && currentSkills.length) {
                      e.preventDefault();

                      setEditingCandidate({
                        ...editingCandidate,
                        skills: currentSkills.slice(0, -1),
                      });
                    }
                  }}
                  placeholder="Type skill + Enter"
                  style={{
                    border: "none",
                    outline: "none",
                    flex: 1,
                    minWidth: "100px",
                    fontSize: "0.85rem",
                    padding: "4px 2px",
                  }}
                />
              </div>


              <CFormInput className="mb-1" label="Additional Comments" value={editingCandidate.additional_comments || ''} onChange={(e) => setEditingCandidate({ ...editingCandidate, additional_comments: e.target.value })} size="sm" />

            </>
          )}
        </CModalBody>
        <CModalFooter>
          {/* <CButton
            //color="secondary"
            onClick={() => setEditingCandidate(null)}
            style={{ fontSize: buttonFontSize, padding: buttonPadding, background: "#FFF" }}

          >
            Cancel
          </CButton> */}
          <CButton
            onClick={() => setEditingCandidate(null)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
              fontSize: buttonFontSize,
              padding: buttonPadding,
              background: isHovered ? "#F6F6F6" : "#FFF",
              cursor: "pointer",
              transition: "background-color 0.15s ease",
            }}
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
              ...actionButtonLoadingStyle(saving),
            }}
          >
            {actionButtonText('save', saving, 'Save')}
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
          } disabled={creatingNote} style={{ fontSize: buttonFontSize, padding: buttonPadding, ...actionButtonLoadingStyle(creatingNote) }}>
            {actionButtonText('create', creatingNote)}
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
            ))
            }
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton
            color="primary"
            onClick={handleSaveSearch}
            disabled={savingSearch}
            style={{ fontSize: buttonFontSize, padding: buttonPadding, ...actionButtonLoadingStyle(savingSearch) }}
          >
            {actionButtonText('save', savingSearch, 'Save')}
          </CButton>
          <CButton color="secondary" onClick={() => setShowFrequencyModal(false)} style={{ fontSize: buttonFontSize, padding: buttonPadding }}>Cancel</CButton>
        </CModalFooter>
      </CModal >
    </>
  )
}

export default CandidateModals
