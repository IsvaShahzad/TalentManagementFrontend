import React, { useEffect, useState } from 'react'
import {
    CTable, CTableHead, CTableRow, CTableHeaderCell,
    CTableBody, CTableDataCell, CAlert,
    CCard,
    CButton,
    CFormSelect,
    CFormInput
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilTrash } from '@coreui/icons'

import {
    createUserApi, getAllUsersApi, updateUserApi, deleteUserByEmailApi
} from '../../../api/api'


const DisplayUsersTable = () => {


    const [filtered, setFilteredUsers] = useState([])
    const [searchQuery, setSearchQuery] = useState('')
    const [showAlert, setShowAlert] = useState(false)
    const [alertMessage, setAlertMessage] = useState('')
    const [users, setUsers] = useState([])
    const [alertColor, setAlertColor] = useState('success')
    const [editingUser, setEditingUser] = useState(false)
    const [editableUser, setEditableUser] = useState({})
    const [deletingUser, setDeletingUser] = useState(null)
    const fetchUsers = async () => {
        try {
            const response = await getAllUsersApi()
            if (response && response.users) {
                const formattedUsers = response.users.map(u => ({
                    email: u.email,
                    full_name: u.full_name,
                    role: u.role,
                    password_hash: u.password_hash,
                    date: new Date(u.createdAt).toLocaleString(),
                    company: u.Client?.company || '-',
                }))
                setUsers(formattedUsers)
                setFilteredUsers(formattedUsers)
            }
        } catch (err) {
            console.error('Failed to fetch users:', err)
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [])

    const showCAlert = (message, color = 'success') => {
        setAlertMessage(message)
        setAlertColor(color)
        setShowAlert(true)
        setTimeout(() => setShowAlert(false), 3000)
    }

    const handleSave = async () => {


        if (!editableUser.full_name || !editableUser.email) {
            return showCAlert('Full Name and Email are required', 'danger')
        }
        if (editableUser.role === 'Client' && !editableUser.company) {
            return showCAlert('Company is required for Client role', 'danger')
        }
        try {
            if (!editableUser.email) throw new Error('Email missing!')
            const payload = {
                full_name: editableUser.full_name,
                role: editableUser.role,
                email: editableUser.email,
                company: editableUser.company,
            }
            await updateUserApi(editableUser.email, payload)
            await fetchUsers()
            setEditingUser(false)
            setEditableUser({})
            showCAlert('User updated successfully', 'success')
            setAlertColor('success')
            setShowAlert(true)
            setTimeout(() => setShowAlert(false), 3000)
        } catch (err) {
            console.error('Update failed:', err.response || err)
            showCAlert('Failed to update user', 'danger')
            setAlertColor('danger')
            setShowAlert(true)
            setTimeout(() => setShowAlert(false), 3000)
        }
    }

    const handleEdit = (user) => {
        setEditableUser({ ...user })
        setEditingUser(true)
    }
    const handleDelete = (user) => {
        setDeletingUser(user)
    }

    const handleConfirmDelete = async () => {
        try {
            await deleteUserByEmailApi(deletingUser.email)
            setAlertMessage(`User "${deletingUser.email}" deleted successfully`)
            setAlertColor('success')
            setShowAlert(true)
            setTimeout(() => setShowAlert(false), 3000)
            setDeletingUser(null)
            fetchUsers()
        } catch (err) {
            console.error('Delete failed:', err)
            setAlertMessage('Failed to delete user.')
            setAlertColor('danger')
            setShowAlert(true)
            setTimeout(() => setShowAlert(false), 3000)
        }
    }

    const handleCancelDelete = () => setDeletingUser(null)
    const handleCancelEdit = () => setEditingUser(false)

    useEffect(() => {
        const query = searchQuery.toLowerCase()
        const filtered = users.filter(
            user =>
                user.full_name.toLowerCase().includes(query) ||
                user.email.toLowerCase().includes(query) ||
                (user.company && user.company.toLowerCase().includes(query))
        )
        setFilteredUsers(filtered)
    }, [searchQuery, users])


    return (
        <>
            {/* === Search Filter === */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '1.5rem',
            }}>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '2px',
                        padding: '0.6rem 1rem',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                        width: '100%',
                        maxWidth: '600px',
                    }}
                >
                    <CIcon
                        icon={cilPencil}
                        style={{
                            color: '#326396ff',
                            fontSize: '1.2rem',
                            marginRight: '10px',
                        }}
                    />
                    <input
                        type="text"
                        placeholder="Search by name, email or company..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            border: 'none',
                            outline: 'none',
                            boxShadow: 'none',
                            fontSize: '1rem',
                            color: '#374151',
                            flex: 1,
                        }}
                    />
                </div>
            </div>

            {/* === Users Table === */}
            <CTable
                responsive
                className="align-middle"
                style={{
                    borderCollapse: 'separate',
                    borderSpacing: '0 10px',
                    marginTop: '20px'
                }}
            >
                <CTableHead>
                    <CTableRow style={{ backgroundColor: '#f8fafc' }}>
                        <CTableHeaderCell style={{ fontWeight: 600 }}>Name</CTableHeaderCell>
                        <CTableHeaderCell style={{ fontWeight: 600 }}>Email</CTableHeaderCell>
                        <CTableHeaderCell style={{ fontWeight: 600 }}>Password</CTableHeaderCell>
                        <CTableHeaderCell style={{ fontWeight: 600 }}>Role</CTableHeaderCell>
                        <CTableHeaderCell style={{ fontWeight: 600 }}>Date Created</CTableHeaderCell>
                        <CTableHeaderCell className="text-center" style={{ fontWeight: 600 }}>
                            Actions
                        </CTableHeaderCell>
                    </CTableRow>
                </CTableHead>

                <CTableBody>
                    {filtered.length > 0 ? (
                        filtered.map((user) => (
                            <CTableRow
                                key={user.email}
                                style={{
                                    backgroundColor: '#ffffff',
                                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.09)',
                                    borderRadius: '10px',
                                    overflow: 'hidden',
                                }}
                            >
                                <CTableDataCell style={{ padding: '1rem', border: 'none' }}>
                                    {user.full_name}
                                    {user.role === 'Client' && user.company && (
                                        <span style={{ color: '#64748b', fontSize: '0.9rem', marginLeft: '6px' }}>
                                            ({user.company})
                                        </span>
                                    )}
                                </CTableDataCell>
                                <CTableDataCell style={{ padding: '1rem', border: 'none' }}>
                                    {user.email}
                                </CTableDataCell>
                                <CTableDataCell
                                    style={{ padding: '1rem', border: 'none', fontFamily: 'monospace' }}
                                >
                                    {user.password_hash}
                                </CTableDataCell>
                                <CTableDataCell style={{ padding: '1rem', border: 'none' }}>
                                    {user.role}
                                </CTableDataCell>
                                <CTableDataCell style={{ padding: '1rem', border: 'none' }}>
                                    {user.date}
                                </CTableDataCell>
                                <CTableDataCell
                                    className="text-center"
                                    style={{ padding: '1rem', border: 'none' }}
                                >
                                    <CIcon
                                        icon={cilPencil}
                                        style={{ color: '#3b82f6', cursor: 'pointer', marginRight: '14px' }}
                                        onClick={() => handleEdit(user)}
                                    />
                                    <CIcon
                                        icon={cilTrash}
                                        style={{ color: '#ef4444', cursor: 'pointer' }}
                                        onClick={() => handleDelete(user)}
                                    />
                                </CTableDataCell>
                            </CTableRow>
                        ))
                    ) : (
                        <CTableRow>
                            <CTableDataCell colSpan="6" className="text-center py-4 text-muted">
                                No users found.
                            </CTableDataCell>
                        </CTableRow>
                    )}
                </CTableBody>
            </CTable>





            {/* Modal Overlay */}
            {(editingUser || deletingUser) &&
                (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 9999
                    }}>
                        {editingUser && (
                            <CCard
                                className="p-4 text-center"
                                style={{
                                    width: '500px',
                                    height: '450px',
                                    borderRadius: '0.25rem',
                                    fontFamily: 'Montserrat',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center'
                                }}
                            >
                                {/* Title */}
                                <h4 style={{ fontWeight: 600, fontSize: '1.5rem', marginBottom: '0.5rem' }}>Update Details</h4>

                                {/* Email */}
                                <p style={{ fontSize: '1rem', color: '#6c757d', marginBottom: '1.5rem' }}>{editableUser.email}</p>

                                {/* Name Field */}
                                <div className="text-start mb-3">
                                    <label style={{ fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.25rem', display: 'block' }}>Name</label>
                                    <CFormInput
                                        value={editableUser.full_name}
                                        onChange={e => setEditableUser({ ...editableUser, full_name: e.target.value })}

                                        style={{
                                            width: '100%',
                                            padding: '0.75rem 1rem',
                                            fontSize: '1rem',
                                            borderRadius: '0.25rem',
                                            border: '1px solid #d3d3d3',
                                            fontFamily: 'Montserrat'
                                        }}
                                    />
                                </div>

                                {/* Role Field */}
                                <div className="text-start mb-4">
                                    <label style={{ fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.25rem', display: 'block' }}>Role</label>
                                    <CFormSelect
                                        value={editableUser.role}
                                        onChange={e => setEditableUser({ ...editableUser, role: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem 1rem',
                                            fontSize: '1rem',
                                            borderRadius: '0.25rem',
                                            border: '1px solid #d3d3d3',
                                            fontFamily: 'Montserrat'
                                        }}
                                    >
                                        <option value="Recruiter">Recruiter</option>
                                        <option value="Admin">Admin</option>
                                        <option value="Client">Client</option>
                                    </CFormSelect>
                                </div>
                                {/* Show company field only if role is Client */}
                                {editableUser.role === 'Client' && (
                                    <input
                                        type="text"
                                        placeholder="Company"
                                        value={editableUser.company || ''}
                                        onChange={(e) =>
                                            setEditableUser({ ...editableUser, company: e.target.value })
                                        }
                                        style={{ width: '100%', padding: '0.5rem' }}
                                    />
                                )}

                                {/* Update Button */}

                                <div className="d-flex justify-content-center gap-3 mt-3">
                                    <CButton
                                        color="secondary"
                                        onClick={handleCancelEdit}
                                        size="lg"
                                        style={{
                                            borderRadius: '0.25rem',
                                            padding: '0.75rem 1.5rem',
                                            fontSize: '1rem',
                                            backgroundColor: '#6c757d',
                                            border: 'none'
                                        }}
                                    >
                                        Cancel
                                    </CButton>
                                    <CButton
                                        color="success"
                                        onClick={handleSave}
                                        size="lg"
                                        style={{ borderRadius: '0.25rem', padding: '0.9rem 9rem', fontSize: '1.1rem', fontFamily: 'Montserrat', color: 'white' }}
                                    >
                                        Update
                                    </CButton>
                                </div>
                            </CCard>
                        )}


                        {/* Delete Confirmation Modal */}
                        {deletingUser && (
                            <CCard
                                className="p-4 text-center"
                                style={{
                                    width: '450px',
                                    height: '280px',
                                    borderRadius: '0.25rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    fontFamily: 'Montserrat'
                                }}
                            >
                                <h5 style={{ fontWeight: 600, fontSize: '1.3rem', marginBottom: '1rem' }}>Confirm Delete</h5>
                                <p style={{ fontSize: '1rem', color: '#6c757d', marginBottom: '2rem' }}>
                                    Are you sure you want to delete <strong>{deletingUser.email}</strong>?
                                </p>
                                <div className="d-flex justify-content-center gap-3 mt-3">
                                    <CButton
                                        color="secondary"
                                        onClick={handleCancelEdit}
                                        size="lg"
                                        style={{
                                            borderRadius: '0.25rem',
                                            padding: '0.75rem 1.5rem',
                                            fontSize: '1rem',
                                            backgroundColor: '#6c757d',
                                            border: 'none'
                                        }}
                                    >
                                        Cancel

                                    </CButton>
                                    <CButton
                                        onClick={handleConfirmDelete}
                                        size="lg"
                                        style={{
                                            borderRadius: '0.25rem',
                                            padding: '0.75rem 1.5rem',
                                            fontSize: '1rem',
                                            backgroundColor: '#d62828', // strong red
                                            border: 'none',
                                            color: 'white',
                                            transition: 'background-color 0.2s ease'
                                        }}
                                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#b71c1c')} // darker red on hover
                                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#d62828')}
                                    >
                                        Delete
                                    </CButton>
                                </div>
                            </CCard>
                        )}


                    </div>
                )}
        </>
    )
}

export default DisplayUsersTable
