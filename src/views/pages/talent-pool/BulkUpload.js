import React, { useState } from 'react'
import {
    CButton, CCard, CCardBody, CCol, CContainer, CForm, CFormInput,
    CRow, CAlert, CFormSelect
} from '@coreui/react'
import { bulkUpload } from '../../../api/api'

const BulkUpload = () => {
    const [file, setFile] = useState(null)
    const [message, setMessage] = useState('')

    const handleFileChange = (e) => {
        setFile(e.target.files[0])
    }

    const handleUpload = async () => {
        if (!file) return setMessage('Please select a file first.')

        const formData = new FormData()
        formData.append('file', file)
        try {
            const response = await bulkUpload(formData)
            setMessage(response.message)


        } catch (err) {
            console.error(err)
            setMessage('Error uploading file data.')
        }


    }

    return (
        <CContainer

            fluid
            // className="d-flex justify-content-center align-items-center"
            style={{
                fontFamily: 'Montserrat',
                // minHeight: '100vh',         // fills full viewport height
                // backgroundColor: '#f9fafb', // optional: light background

            }}
        >

            <CRow className=" w-100 justify-content-center"

            >
                <CCol style={{ width: '50%' }}>
                    <CCard
                        className="border-0 shadow-sm"
                        style={{
                            borderRadius: '30px',
                            marginTop: '100px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center', // centers content vertically

                        }}
                    >
                        <h1 style={{ fontWeight: 450, textAlign: 'center', marginBottom: '0.4rem', fontSize: '2.3rem', marginTop: '2-px' }}>Upload Candidates</h1>
                        <p className="text-body-secondary" style={{ textAlign: 'center', fontSize: '0.9rem' }}>Fo uploading candidates in bulk</p>

                        <CCardBody className="p-5" style={{ flex: 1 }} >
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
                                        lineHeight: '50px', // centers text vertically
                                        display: 'flex',
                                        alignItems: 'center',
                                        //   border: 'none',

                                    }}
                                    type="file"
                                    onChange={handleFileChange}
                                    accept=".csv,.xlsx"
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
                                }}
                                onClick={handleUpload}
                            >
                                Upload Candidates
                            </CButton>

                            {message && (
                                <CAlert color={message.includes('Error') ? 'danger' : 'success'} className="mt-4 text-center">
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
