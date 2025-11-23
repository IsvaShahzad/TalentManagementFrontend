// CandidateSearchBar.jsx
import CIcon from '@coreui/icons-react'
import { cilSearch } from '@coreui/icons'
import { saveSearchApi, getAllSearches } from '../../../api/api'
import { CModal, CModalHeader, CModalBody, CModalFooter, CButton, CFormSelect } from '@coreui/react'
import React, { useState } from 'react'

const CandidateSearchBar = ({ searchQuery, setSearchQuery, userId, starred, setStarred, setSavedSearches, showCAlert }) => {
  const [showFrequencyModal, setShowFrequencyModal] = useState(false)
  const [selectedFrequency, setSelectedFrequency] = useState('daily')
  const [savingSearch, setSavingSearch] = useState(false)

  const handleStarClick = async () => {
    const newStarred = !starred 
    setStarred(newStarred)
    if (newStarred && searchQuery.trim() !== '') {
      setShowFrequencyModal(true)
    }
  }

  const handleSaveSearch = async () => {
    try {
      setSavingSearch(true)
      await saveSearchApi({
        user_id: userId,
        query: searchQuery,
        notify_frequency: selectedFrequency || 'none',
      })
      showCAlert('Search saved successfully', 'success')
      const searches = await getAllSearches(userId)
      setSavedSearches(searches)
    } catch (err) {
      console.error(err)
      showCAlert('Failed to save search', 'danger')
      setStarred(false)
    } finally {
      setSavingSearch(false)
      setShowFrequencyModal(false)
    }
  }

  return (
    <>
      {/* Search Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: '0.25rem',
          padding: '0.25rem 0.5rem', // smaller padding
          width: '100%',
          maxWidth: '400px', // smaller width
          fontSize: '0.75rem', // smaller font
          position: 'relative',
        }}
      >
        <CIcon icon={cilSearch} style={{ color: '#326396', marginRight: '6px', width: '14px', height: '14px' }} />
        <input
          type="text"
          placeholder="Search by name, email or position..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            border: 'none',
            outline: 'none',
            flex: 1,
            fontSize: '0.2rem', // smaller font
            padding: '2px 0',
          }}
        />
        <span
          onClick={handleStarClick}
          style={{
            cursor: 'pointer',
            color: starred ? 'gold' : 'gray',
            fontSize: '16px', // smaller star
            marginLeft: '6px',
          }}
        >
          {starred ? '★' : '☆'}
        </span>
      </div>

      {/* Frequency Selection Modal */}
      <CModal
        visible={showFrequencyModal}
        onClose={() => setShowFrequencyModal(false)}
        alignment="center"
      >
        <CModalHeader closeButton style={{ fontSize: '0.8rem', padding: '0.5rem 0.75rem' }}>Save Search</CModalHeader>
        <CModalBody style={{ fontSize: '0.75rem', padding: '0.5rem 0.75rem' }}>
          <p style={{ fontSize: '0.75rem', marginBottom: '0.5rem' }}>Select notification frequency:</p>
          <CFormSelect
            value={selectedFrequency}
            onChange={(e) => setSelectedFrequency(e.target.value)}
            style={{ fontSize: '0.75rem', padding: '0.25rem' }}
          >
            <option value="none">None</option>
            <option value="daily">Daily</option>
          </CFormSelect>
        </CModalBody>
        <CModalFooter style={{ padding: '0.25rem 0.75rem' }}>
          <CButton color="secondary" size="sm" onClick={() => setShowFrequencyModal(false)} style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>
            Cancel
          </CButton>
          <CButton color="primary" size="sm" onClick={handleSaveSearch} disabled={savingSearch} style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>
            {savingSearch ? 'Saving...' : 'Save'}
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default CandidateSearchBar
