import React, { useState, useEffect } from 'react'
import {
    CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell,
    CCard, CButton, CAlert, CFormInput
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilTrash, cilSearch } from '@coreui/icons'
import { deleteCandidateApi, updateCandidateApi } from '../../../api/api'

const DisplayCandidates = ({ candidates, refreshCandidates }) => {
    //console.log("candidates in displayCandidates", candidates) 
    const [filteredCandidates, setFilteredCandidates] = useState([])
    const [searchQuery, setSearchQuery] = useState('')
    const [showAlert, setShowAlert] = useState(false)
    const [alertMessage, setAlertMessage] = useState('')
    const [alertColor, setAlertColor] = useState('success')
    const [editingCandidate, setEditingCandidate] = useState(false)
    const [editableCandidate, setEditableCandidate] = useState({})
    const [deletingCandidate, setDeletingCandidate] = useState(null)

    const handleDelete = (candidate) => setDeletingCandidate(candidate)


    const handleConfirmDelete = async () => {
        console.log("candidates in DisplayCandidates:", candidates);
        if (!deletingCandidate) return
        try {
            console.log("displaaay id to delete", deletingCandidate.id)
            await deleteCandidateApi(deletingCandidate.id)
            setDeletingCandidate(null)
            refreshCandidates() // fetch latest candidates after delete 
        } catch (err) { console.error('Failed to delete candidate:', err) }
    }

    const handleCancelDelete = () => setDeletingCandidate(null)
    // 🔹 Alert helper
    const showCAlert = (message, color = 'success') => {
        setAlertMessage(message)
        setAlertColor(color)
        setShowAlert(true)
        setTimeout(() => setShowAlert(false), 3000)
    }

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
        const { id, fname, lname, email, phone, experience, position } = editableCandidate;

        const candidate_id = id
        if (!fname || !email) return showCAlert('First name and email are required', 'danger');

        console.log("id of candidate", candidate_id)
        try {
            await updateCandidateApi(candidate_id, {
                firstName: fname,
                lastName: lname,
                email,
                phone,
                experience_years: experience,
                position_applied: position,
            })

            setEditingCandidate(false)
            setEditableCandidate({})
            showCAlert('Candidate updated successfully')
            refreshCandidates()
        } catch (err) {
            console.error('Candidate update failed:', err)
            showCAlert('Failed to update candidate', 'danger')
        }
    }

    useEffect(() => {
        const query = searchQuery.toLowerCase()
        const filtered = candidates.filter(
            (c) =>
                c.firstName?.toLowerCase().includes(query) ||
                c.lastName?.toLowerCase().includes(query) ||
                c.email?.toLowerCase().includes(query) ||
                c.position_applied?.toLowerCase().includes(query)
        )
        setFilteredCandidates(filtered)
    }, [searchQuery, candidates])

    return (
        <>
            {/* Search bar */}
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

            {/* Table 
            <CTable responsive className="align-middle">
                <CTableHead>
                    <CTableRow style={{ backgroundColor: '#f8fafc' }}>
                        <CTableHeaderCell>First Name</CTableHeaderCell>
                        <CTableHeaderCell>Last Name</CTableHeaderCell>
                        <CTableHeaderCell>Email</CTableHeaderCell>
                        <CTableHeaderCell>Phone</CTableHeaderCell>
                        <CTableHeaderCell>Experience</CTableHeaderCell>
                        <CTableHeaderCell>Position</CTableHeaderCell>
                        <CTableHeaderCell>Resume</CTableHeaderCell>
                        <CTableHeaderCell className="text-center">Actions</CTableHeaderCell>
                    </CTableRow>
                </CTableHead>
                <CTableBody>
                    {filteredCandidates.length > 0 ? (
                        filteredCandidates.map((c) => (
                            <CTableRow key={c.candidate_id}>
                                <CTableDataCell>{c.firstName}</CTableDataCell>
                                <CTableDataCell>{c.lastName}</CTableDataCell>
                                <CTableDataCell>{c.email}</CTableDataCell>
                                <CTableDataCell>{c.phone}</CTableDataCell>
                                <CTableDataCell>{c.experience_years}</CTableDataCell>
                                <CTableDataCell>{c.position_applied}</CTableDataCell>
                                <CTableDataCell>
                                    {c.resume_url ? (
                                        <a href={c.resume_url} target="_blank" rel="noopener noreferrer">
                                            View Resume
                                        </a>
                                    ) : (
                                        'No Resume'
                                    )}
                                </CTableDataCell>
                                <CTableDataCell className="text-center">
                                    <CIcon icon={cilPencil} style={{ color: '#3b82f6', cursor: 'pointer', marginRight: '10px' }} onClick={() => handleEdit(c)} />
                                    <CIcon icon={cilTrash} style={{ color: '#ef4444', cursor: 'pointer' }} onClick={() => handleDelete(c)} />
                                </CTableDataCell>
                            </CTableRow>
                        ))
                    ) : (
                        <CTableRow>
                            <CTableDataCell colSpan="8" className="text-center text-muted">
                                No candidates found.
                            </CTableDataCell>
                        </CTableRow>
                    )}
                </CTableBody>
            </CTable>
*/}


            <CTable responsive className="align-middle" style={{ marginTop: '20px' }}>
                <CTableHead>
                    <CTableRow style={{ backgroundColor: '#f8fafc' }}>
                        <CTableHeaderCell>Name</CTableHeaderCell>
                        <CTableHeaderCell>Email</CTableHeaderCell>
                        <CTableHeaderCell>Phone</CTableHeaderCell>
                        <CTableHeaderCell>Experience</CTableHeaderCell>
                        <CTableHeaderCell>Position</CTableHeaderCell>
                        <CTableHeaderCell>Date Added</CTableHeaderCell>
                        <CTableHeaderCell className="text-center">Actions</CTableHeaderCell>
                    </CTableRow>
                </CTableHead>
                <CTableBody>
                    {candidates.length > 0 ? (candidates.map((c) => (
                        <CTableRow key={c.email} style={{ backgroundColor: '#ffffff', marginBottom: '10px' }}>
                            <CTableDataCell>{c.fname} {c.lname}</CTableDataCell>
                            <CTableDataCell>{c.email}</CTableDataCell>
                            <CTableDataCell>{c.phone}</CTableDataCell>

                            <CTableDataCell>{c.experience}</CTableDataCell>
                            <CTableDataCell>{c.position}</CTableDataCell>
                            <CTableDataCell>{c.date}</CTableDataCell>
                            <CTableDataCell> {c.resume_url ? (<a href={c.resume_url} target="_blank" rel="noopener noreferrer" style={{ color: '#326396', textDecoration: 'underline' }} > View Resume </a>) : ('No Resume')} </CTableDataCell>
                            <CTableDataCell className="text-center"> <CIcon icon={cilPencil} style={{ color: '#3b82f6', cursor: 'pointer', marginRight: '12px' }} onClick={() => handleEdit(c)} /> <CIcon icon={cilTrash} style={{ color: '#ef4444', cursor: 'pointer' }} onClick={() => handleDelete(c)} />
                            </CTableDataCell>
                        </CTableRow>))) : (
                        <CTableRow>
                            <CTableDataCell colSpan="7" className="text-center text-muted"> No candidates found. </CTableDataCell>
                        </CTableRow>)}
                </CTableBody>
            </CTable>

            {/* Edit Modal */}
            {editingCandidate && (
                <div className="overlay">
                    <CCard className="p-4 text-center" style={{ width: '400px' }}>
                        <h5>Edit Candidate</h5>
                        <CFormInput
                            label="First Name"
                            value={editableCandidate.firstName || ''}
                            onChange={(e) => setEditableCandidate({ ...editableCandidate, firstName: e.target.value })}
                            className="mb-2"
                        />
                        <CFormInput
                            label="Last Name"
                            value={editableCandidate.lastName || ''}
                            onChange={(e) => setEditableCandidate({ ...editableCandidate, lastName: e.target.value })}
                            className="mb-2"
                        />
                        <CFormInput
                            label="Email"
                            value={editableCandidate.email || ''}
                            onChange={(e) => setEditableCandidate({ ...editableCandidate, email: e.target.value })}
                            className="mb-2"
                        />
                        <CButton color="success" onClick={handleSave}>Save</CButton>
                        <CButton color="secondary" onClick={handleCancelEdit}>Cancel</CButton>

                    </CCard>
                </div>
            )}

            {/* Delete Confirmation */}
            {deletingCandidate && (
                <div className="overlay">
                    <CCard className="p-4 text-center" style={{ width: '400px' }}>
                        <h5>Confirm Delete</h5>
                        <p>Are you sure you want to delete <strong>{deletingCandidate.firstName}</strong>?</p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                            <CButton color="secondary" onClick={handleCancelDelete}>Cancel</CButton>
                            <CButton color="danger" onClick={handleConfirmDelete}>Delete</CButton>
                        </div>
                    </CCard>
                </div>
            )}

            {showAlert && <CAlert color={alertColor}>{alertMessage}</CAlert>}
        </>
    )
}

export default DisplayCandidates
