// CandidateSearchBar.jsx
import CIcon from '@coreui/icons-react'
import { cilSearch } from '@coreui/icons'
import { saveSearchApi, getAllSearches } from '../../../api/api'
import { CModal, CModalHeader, CModalBody, CModalFooter, CButton, CFormSelect } from '@coreui/react'
import React, { useState, useEffect } from 'react'


// useEffect(() => {
//   if (!searchQuery || searchQuery.trim() === '') {
//     setFilteredCandidates(candidates)
//   } else {
//     const lowerQuery = searchQuery.toLowerCase()
//     const filtered = candidates.filter(c =>
//       c.name?.toLowerCase().includes(lowerQuery) ||
//       c.email?.toLowerCase().includes(lowerQuery) ||
//       (Array.isArray(c.position_applied) &&
//         c.position_applied.some(pos => pos.toLowerCase().includes(lowerQuery)))
//     )
//     setFilteredCandidates(filtered)
//   }
// }, [searchQuery, candidates, setFilteredCandidates])




const CandidateSearchBar = ({ searchQuery, setSearchQuery, userId, starred, setStarred, setSavedSearches, showCAlert }) => {
  const [showFrequencyModal, setShowFrequencyModal] = useState(false)
  const [selectedFrequency, setSelectedFrequency] = useState('daily')
  const [savingSearch, setSavingSearch] = useState(false)

  const handleStarClick = async () => {
    const newStarred = !starred 
    setStarred(newStarred)

    if (newStarred && searchQuery.trim() !== '') {
      // Open frequency selection modal
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

      // Refresh saved searches
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
      <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '0.6rem 1rem', width: '100%', maxWidth: '600px', position: 'relative' }}>
        <CIcon icon={cilSearch} style={{ color: '#326396', marginRight: '10px' }} />
        <input
          type="text"
          placeholder="Search by name, email or position..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ border: 'none', outline: 'none', flex: 1 }}
        />
        <span
          onClick={handleStarClick}
          style={{ cursor: 'pointer', color: starred ? 'gold' : 'gray', fontSize: '20px' }}
        >
          {starred ? '★' : '☆'}
        </span>
      </div>

      {/* Frequency Selection Modal */}
      <CModal visible={showFrequencyModal} onClose={() => setShowFrequencyModal(false)}>
        <CModalHeader closeButton>Save Search</CModalHeader>
        <CModalBody>
          <p>Select notification frequency for this search:</p>
          <CFormSelect
            value={selectedFrequency}
            onChange={(e) => setSelectedFrequency(e.target.value)}
          >
            <option value="none">None</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
          </CFormSelect>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowFrequencyModal(false)}>Cancel</CButton>
          <CButton color="primary" onClick={handleSaveSearch} disabled={savingSearch}>
            {savingSearch ? 'Saving...' : 'Save'}
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default CandidateSearchBar
