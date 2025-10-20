import React, { useState, useEffect } from 'react'
import {
  CContainer, CRow, CCol, CCard, CCardBody, CTable,
  CTableHead, CTableRow, CTableHeaderCell, CTableBody,
  CTableDataCell, CButton, CFormInput, CFormSelect, CAlert
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilTrash, cilSearch, cilPencil, cilCheckAlt, cilX } from '@coreui/icons'
import { getUsersByRoleApi, deleteUserByEmailApi, updateUserApi } from '../../../api/api'

const AddRecruiter = () => {
  const [recruiters, setRecruiters] = useState([])
  const [filter, setFilter] = useState('')
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [alertColor, setAlertColor] = useState('success')
  const [editingEmail, setEditingEmail] = useState(null)
  const [editableUser, setEditableUser] = useState({})

  // Fetch recruiters
  const fetchRecruiters = async () => {
    try {
      const response = await getUsersByRoleApi('Recruiter')
      const usersArray = response.users || response.data || []
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

  const handleDelete = async (email, role) => {
    if (role !== 'Recruiter') {
      alert('Cannot delete user: Not a recruiter')
      return
    }
    if (!window.confirm(`Are you sure you want to delete recruiter: ${email}?`)) return

    try {
      await deleteUserByEmailApi(email)
      setAlertMessage(`Recruiter "${email}" deleted successfully`)
      setAlertColor('success')
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 3000)
      fetchRecruiters()
    } catch (err) {
      console.error('Delete failed:', err)
      setAlertMessage('Failed to delete recruiter. Check console for details.')
      setAlertColor('danger')
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 3000)
    }
  }

  const handleEdit = (user) => {
    setEditingEmail(user.email)
    setEditableUser({ ...user })
  }

  const handleCancel = () => {
    setEditingEmail(null)
    setEditableUser({})
  }

  const handleChange = (field, value) => {
    setEditableUser(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    try {
      if (!editableUser.email) throw new Error('Email missing!')
      const payload = {
        full_name: editableUser.name,
        role: editableUser.role,
        email: editableUser.email,
      }
      await updateUserApi(editableUser.email, payload)
      setAlertMessage(`Recruiter "${editableUser.email}" updated successfully`)
      setAlertColor('success')
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 3000)
      fetchRecruiters()
      setEditingEmail(null)
      setEditableUser({})
    } catch (err) {
      console.error('Update failed:', err)
      setAlertMessage('Failed to update recruiter. Check console for details.')
      setAlertColor('danger')
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 3000)
    }
  }

  const filteredRecruiters = recruiters.filter(r =>
    r.name.toLowerCase().includes(filter.toLowerCase()) ||
    r.email.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <CContainer style={{ fontFamily: 'Poppins, sans-serif' }}>
      <CRow className="justify-content-center mt-5">
        <CCol md={10}>
          {showAlert && <CAlert color={alertColor} className="text-center">{alertMessage}</CAlert>}
          <div className="mb-3" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CIcon icon={cilSearch} style={{ fontSize: '18px', color: '#326396ff' }} />
            <CFormInput
              placeholder="Search by name or email..."
              value={filter}
              onChange={e => setFilter(e.target.value)}
            />
          </div>
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
                    <CTableHeaderCell>Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {filteredRecruiters.map(r => (
                    <CTableRow key={r.email}>
                      <CTableDataCell>
                        {editingEmail === r.email
                          ? <CFormInput value={editableUser.name} onChange={e => handleChange('name', e.target.value)} />
                          : r.name}
                      </CTableDataCell>

                      <CTableDataCell>{r.email}</CTableDataCell>

                      <CTableDataCell>
                        {editingEmail === r.email
                          ? (
                            <CFormSelect value={editableUser.role} onChange={e => handleChange('role', e.target.value)}>
                              <option value="Recruiter">Recruiter</option>
                              <option value="Admin">Admin</option>
                              <option value="Client">Client</option>
                            </CFormSelect>
                          )
                          : r.role}
                      </CTableDataCell>

                      <CTableDataCell>{r.date}</CTableDataCell>

                      <CTableDataCell>
                        {editingEmail === r.email ? (
                          <>
                            <CButton color="success" size="sm" onClick={handleSave} className="me-2">
                              <CIcon icon={cilCheckAlt} />
                            </CButton>
                            <CButton color="secondary" size="sm" onClick={handleCancel}>
                              <CIcon icon={cilX} />
                            </CButton>
                          </>
                        ) : (
                          <>
                            <CButton color="info" size="sm" onClick={() => handleEdit(r)} className="me-2">
                              <CIcon icon={cilPencil} />
                            </CButton>
                            <CButton color="danger" size="sm" onClick={() => handleDelete(r.email, r.role)}>
                              <CIcon icon={cilTrash} />
                            </CButton>
                          </>
                        )}
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                  {filteredRecruiters.length === 0 && (
                    <CTableRow>
                      <CTableDataCell colSpan={5} className="text-center text-muted">
                        No recruiters found
                      </CTableDataCell>
                    </CTableRow>
                  )}
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
