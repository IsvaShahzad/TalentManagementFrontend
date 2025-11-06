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

  const [position, setPosition] = useState('');
  const [experience, setExperience] = useState('');
  const [notifyFrequency, setNotifyFrequency] = useState('none');



  const [filteredSearches, setFilteredSearches] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [alerts, setAlerts] = useState([])
  const [editingSearch, setEditingSearch] = useState(null)
  const [deletingSearch, setDeletingSearch] = useState(null)
  const [searches, setSearches] = useState([])
  const [userId, setUserId] = useState('')

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
    setFrequency(search.frequency || ''); // <-- initialize frequency\


  }


  const handleSave = async () => {
    try {
      console.log(position, experience)

      const filters = {
        position,
        experience: experience ? parseFloat(experience) : null,
      };
      const updatedQuery = `${filters.position || ''} for ${filters.experience ? filters.experience + ' years' : ''}`.trim();
      console.log("sending updated search", editingSearch.id, updatedQuery, frequency, // <-- use updated frequency
        filters)
      await updateSearchApi(editingSearch.id, {
        query: updatedQuery || editingSearch.query || null,
        notify_frequency: frequency || null, // <-- use updated frequency
        filters
      })
      showAlert('Search updated successfully', 'success');
      fetchSearches(); // refresh list
      setEditingSearch(null);
    } catch (err) {
      console.error('Search update failed:', err);
      showAlert('Failed to update Search', 'danger');
    }
  }



  //Fetch searches for particular user
  const fetchSearches = async () => {

    // Get the JSON string from localStorage
    const userObj = localStorage.getItem('user');

    // Parse the JSON string to an object
    const user = JSON.parse(userObj);

    // Access the user_id
    const userId = user.user_id;
    setUserId(userId)
    console.log("user id for getting searches for now logged in user", userId)


    try {
      const response = await getAllSearches(userId)
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
      console.error('Failed to fetch searches FE', err)
      showAlert('Failed to fetch searches', 'danger')
    }
  }

  useEffect(() => {
    fetchSearches(); // fetch initially

    // ✅ Optional: auto-refresh every 5 seconds
    const interval = setInterval(() => {
      fetchSearches();
    }, 5000);

    return () => clearInterval(interval); // cleanup on unmount
  }, []);



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


          </div>

          {/* Search Table */}
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
                {['Search', 'Frequency', 'Date Added', 'Saved By', 'Actions'].map(header => (
                  <CTableHeaderCell
                    key={header}
                    style={{ fontWeight: 600, border: 'none', fontSize: '1rem' }}
                  >
                    {header}
                  </CTableHeaderCell>
                ))}
              </CTableRow>
            </CTableHead>

            <CTableBody>
              {filteredSearches.length > 0 ? filteredSearches.map(s => (
                <CTableRow
                  key={s.id}
                  style={{
                    backgroundColor: '#fff',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.11)',
                    borderRadius: '0.5rem',
                  }}
                >
                  <CTableDataCell style={{ border: 'none', padding: '1rem' }}>
                    {s.query || '-'}
                  </CTableDataCell>

                  <CTableDataCell style={{ border: 'none', padding: '1rem', textAlign: 'center' }}>
                    <span
                      style={{
                        background: '#e3efff',
                        color: '#326396',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '0.85rem',
                      }}
                    >
                      {s.frequency || '-'}
                    </span>
                  </CTableDataCell>

                  <CTableDataCell style={{ border: 'none', padding: '1rem' }}>
                    {s.createdAT || '-'}
                  </CTableDataCell>

                  <CTableDataCell style={{ border: 'none', padding: '1rem' }}>
                    {s.createdBy || '-'}
                  </CTableDataCell>

                  <CTableDataCell style={{ border: 'none', padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
                      <CIcon
                        icon={cilPencil}
                        style={{ color: '#3b82f6', cursor: 'pointer' }}
                        onClick={() => handleEdit(s)}
                      />
                      <CIcon
                        icon={cilTrash}
                        style={{ color: '#ef4444', cursor: 'pointer' }}
                        onClick={() => handleDelete(s)}
                      />
                    </div>
                  </CTableDataCell>
                </CTableRow>
              )) : (
                <CTableRow>
                  <CTableDataCell colSpan="5" className="text-center text-muted" style={{ border: 'none', padding: '1rem' }}>
                    No searches found.
                  </CTableDataCell>
                </CTableRow>
              )}
            </CTableBody>
          </CTable>


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
              <CFormInput className="mb-2" label="Query" readOnly value={editingSearch.query || ''} onChange={(e) => setEditingSearch({ ...editingSearch, query: e.target.value })} />
              {/*<CFormInput className="mb-2" label="Frequency" value={editingSearch.frequency || ''} onChange={(e) => setEditingSearch({ ...editingSearch, frequency: e.target.value })} />*/}


              <CFormInput className="mb-2" label="Position"
                value={position}
                onChange={(e) => setPosition(e.target.value)} />
              <CFormInput className="mb-2" label="Experience(years)"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}

              />

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
