import React, { useEffect, useState } from 'react'
import CIcon from '@coreui/icons-react'
import { cilSearch, cilSpreadsheet, cilCloudUpload } from '@coreui/icons'

const SearchBarWithIcons = ({
  searchQuery,
  setSearchQuery,
  starred,
  setStarred,
  setShowFrequencyModal,
  setShowXlsModal,
  setShowCvModal,
  uploadingExcel,
  uploadingCV,
  uploadProgress,
  localCandidates,
  setFilteredCandidates,
}) => {

  // 🔹 Search Filter
  useEffect(() => {
    const query = searchQuery.toLowerCase().trim()

    // Extract experience numbers from query (like "8 years", "5 yrs", etc.)
    const expMatches = query.match(/\b(\d+)\s*(yrs?|years?)\b/g) || []
    const expNumbers = expMatches.map(match => parseFloat(match))

    // Remove experience words from query so they don’t interfere with text search
    let queryText = query
    expMatches.forEach(match => {
      queryText = queryText.replace(match, '')
    })
    const queryWords = queryText.split(/\s+/).filter(Boolean)

    const filtered = localCandidates.filter(c => {
      const name = (c.name || '').toLowerCase()
      const email = (c.email || '').toLowerCase()
      const position = (c.position || c.position_applied || '').toLowerCase()
      const location = (c.location || '').toLowerCase()
      const experienceText = `${c.experience_years || 0} years`.toLowerCase()
      const experience = c.experience || c.experience_years || 0

      // Check experience numbers from query
      if (expNumbers.length && !expNumbers.some(num => experience >= num)) return false

      // Check other words
      return queryWords.every(word =>
        name.includes(word) ||
        email.includes(word) ||
        position.includes(word) ||
        location.includes(word) ||
        experienceText.includes(word)
      )
    })

    setFilteredCandidates(filtered)
  }, [searchQuery, localCandidates, setFilteredCandidates])

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '1rem',
        flexWrap: 'wrap',
      }}
    >
      {/* Search Bar with Star */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: '0.5rem',
          padding: '0.6rem 1rem',
          minWidth: '300px',
          maxWidth: '600px',
          gap: '0.5rem',
          flex: 1,
        }}
      >
        <CIcon icon={cilSearch} style={{ color: '#326396', marginRight: '10px' }} />
        <input
          type="text"
          placeholder="Search by name, email, position, or experience..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ border: 'none', outline: 'none', flex: 1, fontSize: '14px' }}
        />
        <span
          onClick={() => {
            setStarred(!starred)
            setShowFrequencyModal(true)
          }}
          style={{
            cursor: 'pointer',
            color: starred ? '#fbbf24' : '#9ca3af',
            fontSize: '20px',
            userSelect: 'none',
          }}
        >
          {starred ? '★' : '☆'}
        </span>
      </div>

      {/* Excel & CV Upload Icons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <CIcon
          icon={cilSpreadsheet}
          style={{ cursor: 'pointer', color: '#326396', fontSize: '24px' }}
          onClick={() => setShowXlsModal(true)}
          title="Upload Excel"
        />
        <CIcon
          icon={cilCloudUpload}
          style={{ cursor: 'pointer', color: '#326396', fontSize: '24px' }}
          onClick={() => setShowCvModal(true)}
          title="Upload CVs"
        />
        {(uploadingExcel || uploadingCV) && (
          <span style={{ color: '#326396', fontWeight: 500 }}>
            Uploading... {uploadProgress}%
          </span>
        )}
      </div>
    </div>
  )
}

export default SearchBarWithIcons
