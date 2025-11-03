import React, { useState, useEffect } from 'react'
import {
    CContainer, CCard, CCardBody,
    CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell,
    CFormInput, CButton, CAlert, CModal, CModalHeader, CModalBody, CModalFooter,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilTrash, cilPencil, cilSearch, cilCloudUpload, cilBook } from '@coreui/icons'
import { deleteCandidateApi, updateCandidateByEmailApi } from '../../../api/api'

const Notes = ({ candidates, refreshCandidates }) => {
    const [filteredCandidates, setFilteredCandidates] = useState([])
    const [searchQuery, setSearchQuery] = useState('')
    const [alerts, setAlerts] = useState([])
    const [editingCandidate, setEditingCandidate] = useState(null)
    const [deletingCandidate, setDeletingCandidate] = useState(null)
    const [bulkFiles, setBulkFiles] = useState([])
    const [starred, setStarred] = useState(false)
    const [showFrequencyModal, setShowFrequencyModal] = useState(false)
    const [selectedFrequency, setSelectedFrequency] = useState('daily') // default value

    const [notesModalVisible, setNotesModalVisible] = useState(false)
    const [currentNotesCandidate, setCurrentNotesCandidate] = useState(null)
    const [notesText, setNotesText] = useState('')



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
                name: editingCandidate.name || null,
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

        // Extract all experience numbers in the query (e.g., "3 years", "2 yrs")
        const expMatches = query.match(/\b(\d+)\s*(yrs?|years?)\b/g) || []
        const expNumbers = expMatches.map(match => parseFloat(match))

        // Remove experience parts from query to leave pure text
        let queryText = query
        expMatches.forEach(match => {
            queryText = queryText.replace(match, '')
        })
        const queryWords = queryText.split(/\s+/).filter(Boolean)

        const filtered = candidates.filter(c => {
            const name = (c.name || '').toLowerCase()
            const email = (c.email || '').toLowerCase()
            const position = (c.position || c.position_applied || '').toLowerCase()
            const location = (c.location || '').toLowerCase()
            const experience = c.experience || c.experience_years || 0
            // ✅ Check experience: at least one number in query must match candidate's experience
            if (expNumbers.length && !expNumbers.some(num => experience >= num)) {
                return false
            }

            // ✅ Check remaining words
            return queryWords.every(word =>
                name.includes(word) ||
                email.includes(word) ||
                position.includes(word) ||
                location.includes(word)
            )



        })
        console.log("filtered", filtered)
        setFilteredCandidates(filtered)
    }, [searchQuery, candidates])




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
                Notes on Right
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
                                {['Search', 'AddedDate', 'Frequency', 'CreatedBy', 'Actions'].map(header => (
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
                                        {/*(c.name || '').toString().replace(/\s+/g, ' ').trim()*/}
                                        {(c.name || '')}
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
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
                                            <CIcon
                                                icon={cilPencil}
                                                style={{ color: '#3b82f6', cursor: 'pointer' }}
                                                onClick={() => handleEdit(c)}
                                            />
                                            <CIcon
                                                icon={cilTrash}
                                                style={{ color: '#ef4444', cursor: 'pointer' }}
                                                onClick={() => handleDelete(c)}
                                            />
                                            <CIcon
                                                icon={cilBook}
                                                style={{ color: c.notes ? '#326396' : '#444343ff', cursor: 'pointer' }}
                                                onClick={() => {
                                                    setCurrentNotesCandidate(c)
                                                    setNotesText(c.notes || '')
                                                    setNotesModalVisible(true)
                                                }}
                                            />
                                        </div>
                                    </CTableDataCell>

                                </CTableRow>
                            )) : (
                                <CTableRow>
                                    <CTableDataCell colSpan="10" className="text-center text-muted" style={{ border: 'none', padding: '1rem' }}>
                                        No searches found.
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
                            <CFormInput className="mb-2" label="Name" value={editingCandidate.name || ''} onChange={(e) => setEditingCandidate({ ...editingCandidate, name: e.target.value })} />
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

            {/* Notes Modal */}
            <CModal visible={notesModalVisible} onClose={() => setNotesModalVisible(false)}>
                <CModalHeader closeButton>Add Notes</CModalHeader>
                <CModalBody>
                    <p>Enter notes for {currentNotesCandidate?.name}:</p>
                    <textarea
                        value={notesText}
                        onChange={(e) => setNotesText(e.target.value)}
                        style={{
                            width: '100%',
                            minHeight: '100px',
                            border: '1px solid #d1d5db',
                            borderRadius: '0.5rem',
                            padding: '8px',
                            fontSize: '0.9rem',
                        }}
                    />
                </CModalBody>
                <CModalFooter>
                    <CButton color="secondary" onClick={() => setNotesModalVisible(false)}>Cancel</CButton>
                    <CButton
                        color="primary"
                        onClick={async () => {
                            try {
                                // TODO: Call your API to save notes
                                // e.g., await updateCandidateByEmailApi(currentNotesCandidate.email, { notes: notesText })

                                // Optionally update locally
                                setFilteredCandidates(prev =>
                                    prev.map(item =>
                                        item.email === currentNotesCandidate.email ? { ...item, notes: notesText } : item
                                    )
                                )

                                setNotesModalVisible(false)
                                setCurrentNotesCandidate(null)
                                setNotesText('')
                                showCAlert('Notes saved successfully', 'success')
                            } catch (err) {
                                console.error(err)
                                showCAlert('Failed to save notes', 'danger')
                            }
                        }}
                    >
                        Save
                    </CButton>
                </CModalFooter>
            </CModal>



        </CContainer>
    )
}

export default Notes
