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


useEffect(() => {
  const query = searchQuery.toLowerCase().trim();

  // 🔹 Reset to all candidates if query is empty
  if (!query) {
    setFilteredCandidates(localCandidates);
    return;
  }

  // 🔹 Extract numeric experience like "8 years", "5 yrs"
  const expMatches = query.match(/\b(\d+)\s*(yrs?|years?|exp|experience)\b/g) || [];
  const expNumbers = expMatches.map(match => parseFloat(match));

  // 🔹 Remove only numbers for text search
  let queryText = query;
  expNumbers.forEach(num => {
    queryText = queryText.replace(new RegExp(`\\b${num}\\b`, 'g'), '');
  });

  const queryWords = queryText.split(/\s+/).filter(Boolean);

  // 🔹 Words that don't define a skill
  const softWords = [
    'developer', 'dev', 'experience', 'exp',
    'with', 'for', 'of', 'in', 'at', 'as', 'and', 'to', 'from',
    'on', 'by', 'the', 'a', 'an'
  ];

  // 🔹 Core skill/tech words like flutter, react, node
  const coreWords = queryWords.filter(w => !softWords.includes(w));

  const filtered = localCandidates.filter(c => {
    const name = (c.name || '').toLowerCase();
    const email = (c.email || '').toLowerCase();
    const position = (c.position || c.position_applied || '').toLowerCase();
    const location = (c.location || '').toLowerCase();
    const description = (c.profileSummary || '').toLowerCase();
    const experienceText = `${c.experience_years || 0} years experience`.toLowerCase();
    const experience = parseFloat(c.experience || c.experience_years || 0);

    const searchable = [name, email, position, location, description, experienceText].join(' ');

    // 🔹 Must match *all core words* if present
    const hasCoreMatch = coreWords.length
      ? coreWords.every(word => searchable.includes(word))
      : true;

    // 🔹 Experience must match only if core word exists OR if there are no core words
    const hasExperienceMatch = expNumbers.length
      ? expNumbers.some(num => experience >= num)
      : true;

    // 🔹 Apply combined logic
    // If core words exist → both core + experience must match
    // If no core words → experience or soft words can match
    if (coreWords.length > 0) {
      if (!hasCoreMatch || !hasExperienceMatch) return false;
    } else {
      if (!hasExperienceMatch) return false;
    }

    // 🔹 Optional soft word matching (developer, experience)
    // Only used if no core words exist
    if (coreWords.length === 0 && queryWords.some(word => softWords.includes(word))) {
      const softMatch = queryWords.some(word => {
        if (softWords.includes(word)) {
          const regex = new RegExp(`\\b${word}\\b`, 'i');
          return regex.test(searchable);
        }
        return false;
      });
      if (!softMatch) return false;
    }

    return true;
  });

  setFilteredCandidates(filtered);
}, [searchQuery, localCandidates, setFilteredCandidates]);




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
