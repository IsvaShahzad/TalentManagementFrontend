import React, { useState, useEffect } from 'react'
import {
  CContainer, CRow, CCol, CCard, CCardBody, CTable,
  CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell,
} from '@coreui/react'
import { getUsersByRoleApi } from '../../../api/api'

const AddRecruiter = () => {
  const [recruiters, setRecruiters] = useState([])

  // Fetch recruiters from API
  const fetchRecruiters = async () => {
    try {
      const response = await getUsersByRoleApi('Recruiter')
      console.log('Recruiters API response:', response) // check structure here

      const usersArray = response.users || response.data || []  // adapt to actual response
      const formatted = usersArray.map(r => ({
        name: r.full_name,
        email: r.email,
        role: r.role,
        date: new Date(r.createdAt).toLocaleString(),
      }))
      setRecruiters(formatted)
    } catch (err) {
      console.error('Failed to fetch recruiters:', err)
      setRecruiters([])
    }
  }

  useEffect(() => {
    fetchRecruiters()
  }, [])

  return (
    <CContainer style={{ fontFamily: 'Poppins, sans-serif' }}>
      <CRow className="justify-content-center mt-5">
        <CCol md={10}>
          <CCard className="mx-4 border-0 shadow-sm" style={{ borderRadius: '20px', background: '#ffffff' }}>
            <CCardBody className="p-4">
              <h4 className="mb-4 text-center">Recruiters</h4>
              <CTable responsive hover>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Name</CTableHeaderCell>
                    <CTableHeaderCell>Email</CTableHeaderCell>
                    <CTableHeaderCell>Role</CTableHeaderCell>
                    <CTableHeaderCell>Date Created</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {recruiters.map((r, index) => (
                    <CTableRow key={index}>
                      <CTableDataCell>{r.name}</CTableDataCell>
                      <CTableDataCell>{r.email}</CTableDataCell>
                      <CTableDataCell>{r.role}</CTableDataCell>
                      <CTableDataCell>{r.date}</CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  )
}

export default AddRecruiter
