import React, { useState } from 'react'
import {
  CButton, CCard, CCardBody, CCol, CContainer, CFormInput,
  CRow, CAlert
} from '@coreui/react'
import { uploadCV } from '../../../api/api'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const CVUpload = ({ candidate, onUploadSuccess }) => {
  const [file, setFile] = useState(null)
  const [message, setMessage] = useState('')
  const [uploading, setUploading] = useState(false)

  const handleFileChange = (e) => setFile(e.target.files[0])

  const handleUpload = async () => {
    if (!file) return setMessage('Please select a file first.')

    const formData = new FormData()
    formData.append('file', file)
    if (candidate?.candidate_id) formData.append('candidate_id', candidate.candidate_id)

    try {
      setUploading(true)
      setMessage('Uploading... please wait.')

      const response = await uploadCV(formData)

      if (response?.message) {
        setMessage(response.message)
        toast.success(response.message)
        if (onUploadSuccess) onUploadSuccess(response)
      } else {
        setMessage('CV uploaded successfully!')
        toast.success('CV uploaded successfully!')
        if (onUploadSuccess) onUploadSuccess(response)
      }
    } catch (err) {
      console.error(err)
      setMessage('Error uploading CV.')
      toast.error('Error uploading CV.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <CContainer fluid style={{ fontFamily: 'Montserrat' }}>
      <ToastContainer position="top-right" autoClose={3000} />
      <CRow className="w-100 justify-content-center">
        <CCol style={{ width: '50%' }}>
          <CCard className="border-0 shadow-sm" style={{ borderRadius: '30px', marginTop: '50px' }}>
            <CCardBody className="p-5">
              <CFormInput
                type="file"
                onChange={handleFileChange}
                accept=".pdf"
                disabled={uploading}
                className="mb-4"
                style={{ height: '50px', lineHeight: '50px' }}
              />
              <CButton
                onClick={handleUpload}
                disabled={uploading}
                className="mt-3"
                style={{
                  width: '50%',
                  display: 'block',
                  margin: '0 auto',
                  background: 'linear-gradient(90deg, #5f8ed0ff 0%, #4a5dcaff 100%)',
                  color: '#fff',
                  borderRadius: '8px',
                  cursor: uploading ? 'not-allowed' : 'pointer',
                }}
              >
                {uploading ? 'Uploading...' : 'Upload CV'}
              </CButton>
              {message && <CAlert color={message.includes('Error') ? 'danger' : 'success'} className="mt-4 text-center">{message}</CAlert>}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  )
}

export default CVUpload
