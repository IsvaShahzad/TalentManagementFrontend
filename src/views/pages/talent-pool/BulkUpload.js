import React, { useState } from 'react'
import {
  CButton, CCard, CCardBody, CCol, CContainer, CFormInput,
  CRow, CAlert
} from '@coreui/react'
import { bulkUpload } from '../../../api/api'  // ✅ only this import
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const BulkUpload = () => {
  const [file, setFile] = useState(null)
  const [message, setMessage] = useState('')
  const [uploading, setUploading] = useState(false)

  const handleFileChange = (e) => {
    setFile(e.target.files[0])
  }

  const handleUpload = async () => {
    if (!file) return setMessage('Please select a file first.')

    const formData = new FormData()
    formData.append('file', file)

    try {
      setUploading(true)
      setMessage('Uploading... please wait.')

      // 🔹 Upload file to backend
      const response = await bulkUpload(formData)

      // Expect backend to send duplicates array like: { message, duplicates: [] }
      if (response?.duplicates && response.duplicates.length > 0) {
        toast.error(`Duplicate candidates found: ${response.duplicates.join(', ')}`)
        setMessage('Some candidates were skipped due to duplicates.')
      } else if (response?.message) {
        setMessage(response.message)
        toast.success(response.message)
      } else {
        setMessage('Upload completed successfully!')
        toast.success('Upload completed successfully!')
      }

    } catch (err) {
      console.error(err)
      setMessage('Error uploading file data.')
      toast.error('Error uploading file data.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <CContainer fluid style={{ fontFamily: 'Montserrat' }}>
      <ToastContainer position="top-right" autoClose={3000} />

      <CRow className="w-100 justify-content-center">
        <CCol style={{ width: '50%' }}>
          <CCard
            className="border-0 shadow-sm"
            style={{
              borderRadius: '30px',
              marginTop: '100px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <CCardBody className="p-5" style={{ flex: 1 }}>
              <div
                className="mb-4"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                }}
              >
                <CFormInput
                  style={{
                    height: '100%',
                    lineHeight: '50px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  type="file"
                  onChange={handleFileChange}
                  accept=".csv,.xlsx"
                  disabled={uploading}
                />
              </div>

              <CButton
                type="submit"
                className="mt-5 py-3"
                style={{
                  width: '50%',
                  display: 'block',
                  margin: '0 auto',
                  background: 'linear-gradient(90deg, #5f8ed0ff 0%, #4a5dcaff 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1.1rem',
                  fontWeight: 400,
                  color: 'white',
                  opacity: uploading ? 0.7 : 1,
                  cursor: uploading ? 'not-allowed' : 'pointer',
                }}
                onClick={handleUpload}
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Upload Candidates'}
              </CButton>

              {message && (
                <CAlert
                  color={message.includes('Error') ? 'danger' : 'success'}
                  className="mt-4 text-center"
                >
                  {message}
                </CAlert>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  )
}

export default BulkUpload
