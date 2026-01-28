// import React, { useState } from 'react'
// import {
//   CButton, CCard, CCardBody, CCol, CContainer, CFormInput,
//   CRow, CAlert
// } from '@coreui/react'
// import { bulkUpload } from '../../../api/api'  // ✅ only this import
// import { toast, ToastContainer } from 'react-toastify'
// import 'react-toastify/dist/ReactToastify.css'

// const BulkUpload = () => {
//   const [file, setFile] = useState(null)
//   const [message, setMessage] = useState('')
//   const [uploading, setUploading] = useState(false)

//   const handleFileChange = (e) => {
//     setFile(e.target.files[0])
//   }

//   const handleUpload = async () => {
//     if (!file) return setMessage('Please select a file first.')

//     const formData = new FormData()
//     formData.append('file', file)

//     try {
//       setUploading(true)
//       setMessage('Uploading... please wait.')

//       // 🔹 Upload file to backend
//       const response = await bulkUpload(formData)

//       // Expect backend to send duplicates array like: { message, duplicates: [] }
//       if (response?.duplicates && response.duplicates.length > 0) {
//         toast.error(`Duplicate candidates found: ${response.duplicates.join(', ')}`)
//         setMessage('Some candidates were skipped due to duplicates.')
//       } else if (response?.message) {
//         setMessage(response.message)
//         toast.success(response.message)
//       } else {
//         setMessage('Upload completed successfully!')
//         toast.success('Upload completed successfully!')
//       }

//     } catch (err) {
//       console.error(err)
//       setMessage('Error uploading file data.')
//       toast.error('Error uploading file data.')
//     } finally {
//       setUploading(false)
//     }
//   }

//   return (
//     <CContainer fluid style={{ fontFamily: 'Montserrat' }}>
//       <ToastContainer position="top-right" autoClose={3000} />

//       <CRow className="w-100 justify-content-center">
//         <CCol style={{ width: '50%' }}>
//           <CCard
//             className="border-0 shadow-sm"
//             style={{
//               borderRadius: '30px',
//               marginTop: '100px',
//               display: 'flex',
//               flexDirection: 'column',
//               justifyContent: 'center',
//             }}
//           >
//             <CCardBody className="p-5" style={{ flex: 1 }}>
//               <div
//                 className="mb-4"
//                 style={{
//                   display: 'flex',
//                   alignItems: 'center',
//                   border: '1px solid #e2e8f0',
//                   borderRadius: '8px',
//                 }}
//               >
//                 <CFormInput
//                   style={{
//                     height: '100%',
//                     lineHeight: '50px',
//                     display: 'flex',
//                     alignItems: 'center',
//                   }}
//                   type="file"
//                   onChange={handleFileChange}
//                   accept=".csv,.xlsx"
//                   disabled={uploading}
//                 />
//               </div>

//               <CButton
//                 type="submit"
//                 className="mt-5 py-3"
//                 style={{
//                   width: '50%',
//                   display: 'block',
//                   margin: '0 auto',
//                   background: 'linear-gradient(90deg, #5f8ed0ff 0%, #4a5dcaff 100%)',
//                   border: 'none',
//                   borderRadius: '8px',
//                   fontSize: '1.1rem',
//                   fontWeight: 400,
//                   color: 'white',
//                   opacity: uploading ? 0.7 : 1,
//                   cursor: uploading ? 'not-allowed' : 'pointer',
//                 }}
//                 onClick={handleUpload}
//                 disabled={uploading}
//               >
//                 {uploading ? 'Uploading...' : 'Upload Candidates'}
//               </CButton>

//               {message && (
//                 <CAlert
//                   color={message.includes('Error') ? 'danger' : 'success'}
//                   className="mt-4 text-center"
//                 >
//                   {message}
//                 </CAlert>
//               )}
//             </CCardBody>
//           </CCard>
//         </CCol>
//       </CRow>
//     </CContainer>
//   )
// }

// export default BulkUpload


import React, { useState } from 'react'
import {
  CButton, CCard, CCardBody, CCol, CContainer, CRow, CAlert
} from '@coreui/react'
import { bulkUpload } from '../../../api/api'  
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const BulkUpload = () => {
  const [file, setFile] = useState(null)
  const [message, setMessage] = useState('')
  const [uploading, setUploading] = useState(false)
  const [userId] = useState(() => {
    try {
      const raw = localStorage.getItem('user')
      const u = raw ? JSON.parse(raw) : null
      return u?.user_id || ''
    } catch {
      return ''
    }
  })

  const handleFileChange = (e) => {
    setFile(e.target.files[0])
  }

  const handleUpload = async () => {
    if (!file) return setMessage('Please select a file first.')

    const formData = new FormData()
    formData.append('file', file)
    // IMPORTANT: backend bulkUploadFiles uses req.body.recruiterId || req.body.userId
    // Without this, recruiter uploads won't be linked in RecruiterCandidate table
    if (userId) formData.append('recruiterId', userId)

    try {
      setUploading(true)
      setMessage('Uploading... please wait.')

      const response = await bulkUpload(formData)

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
    <CContainer fluid style={{ fontFamily: 'Montserrat', fontSize: '0.85rem' }}>
      <ToastContainer position="top-right" autoClose={3000} />

      <CRow className="w-100 justify-content-center">
        <CCol style={{ width: '60%', maxWidth: '400px' }}>
          <CCard
            className="border-0 shadow-sm"
            style={{
              borderRadius: '20px',
              marginTop: '50px',
              padding: '1rem',
            }}
          >
            <CCardBody style={{ flex: 1, padding: '1rem' }}>

              {/* Modern File Upload Box */}
              <div
                className="mb-3"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  border: '1px solid #cbd5e1',
                  borderRadius: '12px',
                  padding: '0.5rem 1rem',
                  background: '#f8fafc',
                  boxShadow: '0px 2px 5px rgba(0,0,0,0.05)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
                onClick={() => document.getElementById('fileInput').click()}
              >
                <span style={{ color: file ? '#111827' : '#6b7280', fontSize: '0.85rem' }}>
                  {file ? file.name : 'Choose a file...'}
                </span>
                <CButton
                  style={{
                    background: 'linear-gradient(90deg, #5f8ed0 0%, #4a5dca 100%)',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    padding: '0.3rem 0.8rem',
                    color: 'white',
                    fontWeight: 500,
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    document.getElementById('fileInput').click()
                  }}
                >
                  Browse
                </CButton>
                <input
                  id="fileInput"
                  type="file"
                  accept=".csv,.xlsx"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                  disabled={uploading}
                />
              </div>

              {/* Upload Button */}
              <CButton
                type="submit"
                className="mt-3 py-2"
                style={{
                  width: '100%',
                  display: 'block',
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
                onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(90deg, #4a5dca 0%, #326396 100%)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(90deg, #5f8ed0 0%, #4a5dca 100%)'}
                onClick={handleUpload}
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Upload Candidates'}
              </CButton>

              {message && (
                <CAlert
                  color={message.includes('Error') ? 'danger' : 'success'}
                  className="mt-3 text-center"
                  style={{ fontSize: '0.8rem', padding: '0.5rem' }}
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
