import React, { useEffect } from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilSearch,
  cilSpreadsheet,
  cilCloudUpload,
  cilFile,
  cilCloudDownload,
} from '@coreui/icons'
import { downloadCandidateExcelTemplateApi, exportCandidatesCSVApi } from '../api/api'

const downloadExcelTemplate = async (showAlert) => {
  try {
    await downloadCandidateExcelTemplateApi()
  } catch (err) {
    console.error("FULL ERROR:", err)
    console.error("RESPONSE:", err.response)
    console.error("DATA:", err.response?.data)
    console.error("STATUS:", err.response?.status)

    showAlert?.(
      err.response?.data?.message ||
      err.message ||
      'Download failed',
      'danger',
    )
  }
}

const downloadCSV = async (showAlert) => {
  try {
    await exportCandidatesCSVApi()
  } catch (err) {
    console.error("CSV download error:", err)

    showAlert?.(
      err.response?.data?.message ||
      err.message ||
      "CSV export failed",
      "danger"
    )
  }
}

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
  showAlert,
}) => {

  useEffect(() => {
    const query = searchQuery.toLowerCase().trim()

    if (!query) {
      setFilteredCandidates(localCandidates)
      return
    }

    const expMatches = query.match(/\b(\d+)\s*(yrs?|years?|exp|experience)\b/g) || []
    const expNumbers = expMatches.map(match => parseFloat(match))

    let queryText = query
    expNumbers.forEach(num => {
      queryText = queryText.replace(new RegExp(`\\b${num}\\b`, 'g'), '')
    })

    const queryWords = queryText.split(/\s+/).filter(Boolean)

    const softWords = [
      'developer', 'dev', 'experience', 'exp',
      'with', 'for', 'of', 'in', 'at', 'as', 'and', 'to', 'from',
      'on', 'by', 'the', 'a', 'an'
    ]

    const coreWords = queryWords.filter(w => !softWords.includes(w))

    const filtered = localCandidates.filter(c => {
      const name = (c.name || '').toLowerCase()
      const email = (c.email || '').toLowerCase()
      const position = (c.position || c.position_applied || '').toLowerCase()
      const location = (c.location || '').toLowerCase()
      const description = (c.profileSummary || '').toLowerCase()
      const expStr = String(c.experience_years ?? c.experience ?? '')
      const experienceText = `${expStr} years experience`.toLowerCase()
      const experience =
        parseFloat(String(c.experience || c.experience_years || '').replace(/[^\d.-]/g, '')) || 0

      const searchable = [name, email, position, location, description, experienceText].join(' ')

      const hasCoreMatch = coreWords.length
        ? coreWords.every(word => searchable.includes(word))
        : true

      const hasExperienceMatch = expNumbers.length
        ? expNumbers.some(num => experience >= num)
        : true

      if (coreWords.length > 0) {
        if (!hasCoreMatch || !hasExperienceMatch) return false
      } else {
        if (!hasExperienceMatch) return false
      }

      if (coreWords.length === 0 && queryWords.some(word => softWords.includes(word))) {
        const softMatch = queryWords.some(word => {
          if (softWords.includes(word)) {
            const regex = new RegExp(`\\b${word}\\b`, 'i')
            return regex.test(searchable)
          }
          return false
        })
        if (!softMatch) return false
      }

      return true
    })

    setFilteredCandidates(filtered)
  }, [searchQuery, localCandidates, setFilteredCandidates])

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        marginBottom: '10px',
      }}
    >

      {/* LEFT (empty for spacing / future use) */}
      <div style={{ flex: 1 }} />

      {/* CENTER (SEARCH + UPLOAD) */}
      <div
        style={{
          flex: 2,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '1rem',
        }}
      >

        {/* SEARCH BOX */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: '0.5rem',
            padding: '0.3rem 0.6rem',
            width: '400px',
            gap: '0.3rem',
            fontSize: '0.75rem',
          }}
        >
          <CIcon icon={cilSearch} style={{ color: '#326396', fontSize: '16px' }} />

          <input
            type="text"
            placeholder="Search by name, email, position, or experience..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              border: 'none',
              outline: 'none',
              flex: 1,
              fontSize: '0.75rem',
            }}
          />

          <span
            onClick={() => {
              setStarred(!starred)
              setShowFrequencyModal(true)
            }}
            style={{
              cursor: 'pointer',
              color: starred ? '#fbbf24' : '#9ca3af',
              fontSize: '16px',
              userSelect: 'none',
            }}
          >
            {starred ? '★' : '☆'}
          </span>
        </div>

        {/* UPLOAD ICONS */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <CIcon
            icon={cilSpreadsheet}
            style={{ cursor: 'pointer', color: '#326396', fontSize: '20px' }}
            onClick={() => setShowXlsModal(true)}
            title="Upload Excel"
          />

          <CIcon
            icon={cilCloudUpload}
            style={{ cursor: 'pointer', color: '#326396', fontSize: '20px' }}
            onClick={() => setShowCvModal(true)}
            title="Upload CVs"
          />
        </div>

      </div>

      {/* RIGHT (DOWNLOADS) */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        <CIcon
          icon={cilFile}
          style={{ cursor: 'pointer', color: '#217346', fontSize: '20px' }}
          onClick={() => downloadExcelTemplate(showAlert)}
          title="Download Excel Template"
        />

        <CIcon
          icon={cilCloudDownload}
          style={{ cursor: 'pointer', color: '#2b6cb0', fontSize: '20px' }}
          onClick={() => downloadCSV(showAlert)}
          title="Export CSV"
        />
      </div>

    </div>
  )
}

export default SearchBarWithIcons