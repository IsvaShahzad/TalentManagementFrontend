import React, { useState, useEffect } from 'react'
import {
    CContainer, CCard, CCardBody,
    CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell,
    CFormInput, CButton, CAlert, CModal, CModalHeader, CModalBody, CModalFooter, CFormSelect
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilTrash, cilPencil, cilSearch, cilCloudUpload, cilBook, cilCalendar } from '@coreui/icons'
import { deleteSearchApi, getAllSearches, updateSearchApi } from '../../../api/api'
import ActionMenu from './ActionMenu'
import Notes from './Notes'

const SavedSearch = ({ }) => {


    const [query, setQuery] = useState('')
    const [frequency, setFrequency] = useState('')
    const [createdAT, setCeatedAt] = useState('')
    const [createdBy, setCeatedBy] = useState('')
    //  const [location, setLocation] = useState('')
    // const [experience, setExperience] = useState('')
    //const [position, setPosition] = useState('')
    //const [resume, setResume] = useState(null)




    const [filteredSearches, setFilteredSearches] = useState([])
    const [searchQuery, setSearchQuery] = useState('')
    const [alerts, setAlerts] = useState([])
    const [editingSearch, setEditingSearch] = useState(null)
    const [deletingSearch, setDeletingSearch] = useState(null)
    const [searches, setSearches] = useState([])


    // 🔹 Show alert
    const showAlert = (message, color = 'success') => {
        const id = new Date().getTime()
        setAlerts(prev => [...prev, { id, message, color }])
        setTimeout(() => {
            setAlerts(prev => prev.filter(a => a.id !== id))
        }, 3000)
    }


    // Open delete modal
    const handleDelete = (search) => setDeletingSearch(search);

    // Confirm delete
    const handleConfirmDelete = async () => {
        if (!deletingSearch) return;
        try {
            await deleteSearchApi(deletingSearch.id); // make sure API expects savedsearch_id
            showAlert('Search deleted successfully', 'success');
            fetchSearches(); // refresh list after delete
        } catch (err) {
            console.error('Failed to delete search:', err);
            showAlert('Failed to delete search', 'danger');
        } finally {
            setDeletingSearch(null);
        }
    };

    // 🔹 Edit
    // const handleEdit = (Search) => setEditingSearch({ ...Search })
    const handleEdit = (search) => {
        setEditingSearch({ ...search });
        setFrequency(search.frequency || ''); // <-- initialize frequency
    }


    const handleSave = async () => {
        try {
            await updateSearchApi(editingSearch.id, {
                query: editingSearch.query || null,
                notify_frequency: frequency || null, // <-- use updated frequency
            })
            showAlert('Search updated successfully', 'success');
            fetchSearches(); // refresh list
            setEditingSearch(null);
        } catch (err) {
            console.error('Search update failed:', err);
            showAlert('Failed to update Search', 'danger');
        }
    }
    // 🔹 Search Filter
    useEffect(() => {
        const q = searchQuery.toLowerCase().trim();
        if (!q) {
            setFilteredSearches(searches);
            return;
        }

        const filtered = searches.filter(s => {
            const query = (s.query || '').toLowerCase()
            const frequency = (s.notify_frequency || '').toLowerCase()
            const createdAT = (new Date(s.createdAt).toLocaleString() || '')
            const createdBy = (s.createdBy || '').toLowerCase()

            console.log("filtered", filtered)
            setFilteredSearches(filtered)
        }, [searchQuery, searches])
    })

    {/* useEffect(() => {
        const q = searchQuery.toLowerCase().trim();
        if (!q) {
            setFilteredSearches(searches);
            return;
        }

        const filtered = searches.filter(s =>
            s.query.toLowerCase().includes(q) ||
            s.frequency.toLowerCase().includes(q) ||
            s.createdBy.toLowerCase().includes(q)
        )

        setFilteredSearches(filtered);
    }, [searchQuery, searches]);*/}

    //Fetch searches
    const fetchSearches = async () => {
        try {
            const response = await getAllSearches()
            console.log("searches", response)
            if (response && response.length > 0) {
                const formatted = response.map(c => ({
                    id: c.savedsearch_id,
                    query: c.query,
                    frequency: c.notify_frequency,
                    createdAT: new Date(c.created_at).toLocaleString(),
                    createdBy: c.user?.full_name || 'Unknown',


                }))
                setSearches(formatted)
                setFilteredSearches(formatted);
            } else {
                setSearches([])
                setFilteredSearches([]);
            }
        } catch (err) {
            console.error('Failed to fetch searches:', err)
            //  showAlert('Failed to fetch candidates', 'danger')
        }
    }

    useEffect(() => {
        fetchSearches()
    }, [])


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
                Saved Searches
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
                                position: 'relative',
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

                    </div>

                    {/* Search Table */}
                    <CCardBody style={{ padding: 0 }}>
                        <CTable>
                            <CTableBody>
                                {filteredSearches.length > 0 ? (
                                    filteredSearches.map((s) => (
                                        <CTableRow key={s.id}>
                                            <CTableDataCell>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                    <div><strong>Search:</strong> {s.query || '-'}</div>
                                                    <div><strong>Frequency:</strong> {s.frequency || '-'}</div>
                                                    <div><strong>Date Added:</strong> {s.createdAT || '-'}</div>
                                                    <div><strong>Saved By:</strong> {s.createdBy || '-'}</div>
                                                </div>
                                            </CTableDataCell>
                                            <CTableDataCell style={{ position: 'relative' }}>
                                                <ActionMenu
                                                    onEdit={() => handleEdit(s)}
                                                    onDelete={() => handleDelete(s)}
                                                />
                                            </CTableDataCell>
                                        </CTableRow>
                                    ))
                                ) : (
                                    <CTableRow>
                                        <CTableDataCell colSpan="2" className="text-center text-muted">
                                            No searches found.
                                        </CTableDataCell>
                                    </CTableRow>
                                )}
                            </CTableBody>
                        </CTable>
                    </CCardBody>

                    {/*
                    <div className='right-side'>
                        for notes on right
                        <Notes candidates={candidates} refreshCandidates={refreshCandidates} />
                    </div>*/}

                </CCardBody>
            </CCard>

            {/* Edit Modal */}
            <CModal visible={!!editingSearch} onClose={() => setEditingSearch(null)}>
                <CModalHeader closeButton>Edit Candidate</CModalHeader>
                <CModalBody>
                    {editingSearch && (
                        <>
                            <CFormInput className="mb-2" label="Query" value={editingSearch.query || ''} onChange={(e) => setEditingSearch({ ...editingSearch, query: e.target.value })} />
                            {/*<CFormInput className="mb-2" label="Frequency" value={editingSearch.frequency || ''} onChange={(e) => setEditingSearch({ ...editingSearch, frequency: e.target.value })} />*/}



                            <div
                                className="mb-4"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: '8px',
                                    height: '44px', // reduced height
                                    backgroundColor: '#fff',
                                }}
                            >
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '0 12px',
                                        fontFamily: 'Inter, sans-serif'
                                    }}>
                                    <CIcon icon={cilCalendar}
                                        style={{ color: '#326396ff', fontSize: '18px' }} />
                                    <div
                                        style={{
                                            width: '0.9px',
                                            height: '25px',
                                            backgroundColor: '#518ccbff',
                                            marginLeft: '8px',
                                            marginRight: '8px',
                                            fontFamily: 'Inter, sans-serif'
                                        }}
                                    ></div>
                                </div>
                                <CFormSelect
                                    value={frequency} // current selected frequency
                                    onChange={(e) => setFrequency(e.target.value)} // updates frequency state
                                    style={{
                                        border: 'none',
                                        outline: 'none',
                                        flex: 1,
                                        fontSize: '1rem',
                                        padding: '0 0.75rem',
                                        height: '100%',
                                        boxShadow: 'none',
                                        backgroundColor: '#fff',
                                        color: frequency ? '#4e596bff' : '#9ca3af',
                                        appearance: 'none',
                                        WebkitAppearance: 'none',
                                        MozAppearance: 'none',
                                        width: '50%',
                                        fontFamily: 'Inter, sans-serif'
                                    }}
                                >
                                    <option value="" disabled hidden>
                                        Save Search
                                    </option>
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="monthly">Monthly</option>
                                </CFormSelect>

                            </div>
                        </>
                    )}
                </CModalBody>
                <CModalFooter>
                    <CButton color="secondary" onClick={() => setEditingSearch(null)}>Cancel</CButton>
                    <CButton color="primary" onClick={handleSave}>Save</CButton>
                </CModalFooter>
            </CModal>

            {/* Delete Confirmation Modal */}
            <CModal visible={!!deletingSearch} onClose={() => setDeletingSearch(null)}>
                <CModalHeader closeButton>Confirm Delete</CModalHeader>
                <CModalBody>Are you sure you want to delete this search?</CModalBody>
                <CModalFooter>
                    <CButton color="secondary" onClick={() => setDeletingSearch(null)}>Cancel</CButton>
                    <CButton color="danger" onClick={handleConfirmDelete}>Delete</CButton>
                </CModalFooter>
            </CModal>


        </CContainer>
    )
}

export default SavedSearch
