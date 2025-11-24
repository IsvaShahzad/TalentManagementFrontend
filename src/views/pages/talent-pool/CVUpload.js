import React, { useState } from 'react'
import { CFormInput, CButton, CAlert } from '@coreui/react'

const CVUpload = ({ onUpload, uploadProgress, selectedFiles, setSelectedFiles }) => {

  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')


  const handleFileChange = (e) => {

    const files = e.target.files
    if (setSelectedFiles) setSelectedFiles(files)
    // setUploading(true)
    setMessage('Uploading... please wait.')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', position: 'relative' }}>
      <CFormInput
        type="file"
        multiple
        accept=".pdf"
        onChange={handleFileChange}
        disabled={uploading}
      />

      {selectedFiles && selectedFiles.length > 0 && (
        <p style={{ fontSize: '0.75rem', margin: 0 }}>
          {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected
        </p>
      )}



      <CButton
        type="button"
        className="mt-3 py-2"
        style={{
          width: '100%',
          background: 'linear-gradient(90deg, #5f8ed0 0%, #4a5dca 100%)',
          border: 'none',
          borderRadius: '12px',
          fontSize: '0.9rem',
          fontWeight: 500,
          color: 'white',
          opacity: uploading ? 0.7 : 1,
          cursor: uploading ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s ease',
        }}
        disabled={uploading}
        onClick={() => onUpload && selectedFiles && onUpload(selectedFiles)}
        onMouseEnter={(e) =>
          (e.currentTarget.style.background = 'linear-gradient(90deg, #4a5dca 0%, #326396 100%)')
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.background = 'linear-gradient(90deg, #5f8ed0 0%, #4a5dca 100%)')
        }
      >
        {uploading ? 'Uploading...' : 'Upload Candidates'}
      </CButton>

      <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>
        Select one or more PDF CVs to upload
      </p>


      {message && (
        <CAlert
          color={message.includes('Error') ? 'danger' : 'success'}
          className="mt-3 text-center"
          style={{ fontSize: '0.8rem', padding: '0.5rem' }}
        >
          {message}
        </CAlert>)}


    </div>
  )
}

export default CVUpload
