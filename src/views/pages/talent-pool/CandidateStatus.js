import React, { useEffect, useState } from 'react'
import {
    CTable, CTableHead, CTableRow, CTableHeaderCell,
    CTableBody, CTableDataCell, CAlert, CCard, CButton, CFormInput
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSearch } from '@coreui/icons'
import { getCandidateStatusHistoryApi } from '../../../api/api'

const DisplayCandidateStatusHistory = () => {
    const [history, setHistory] = useState([])
    const [filtered, setFiltered] = useState([])
    const [searchQuery, setSearchQuery] = useState('')
    const [showAlert, setShowAlert] = useState(false)
    const [alertMessage, setAlertMessage] = useState('')
    const [alertColor, setAlertColor] = useState('success')

    const showCAlert = (message, color = 'success') => {
        setAlertMessage(message)
        setAlertColor(color)
        setShowAlert(true)
        setTimeout(() => setShowAlert(false), 3000)
    }

    const fetchHistory = async () => {
        try {

            const response = await getCandidateStatusHistoryApi()
            console.log("response data from backend", response)
            const historyData = response?.data?.data || []  // <-- safely access data array


            if (response && response.data) {
                const formatted = response.data.map((h) => ({
                    candidateId: h.candidateId,
                    candidateName: h.candidateName,
                    oldStatus: h.oldStatus,
                    newStatus: h.newStatus,
                    changedBy: h.changedBy,
                    changedAt: new Date(h.changedAt).toLocaleString(),
                }))
                setHistory(formatted)
                setFiltered(formatted)
            }
        } catch (err) {
            console.error('Failed to fetch candidate history in candidate status', err)
            showCAlert('Failed to fetch candidate history in candidate status', 'danger')
        }
    }

    useEffect(() => {
        fetchHistory()
    }, [])

    // Search filtering
  useEffect(() => {
    const query = searchQuery.toLowerCase()
    const filteredResults = history.filter(h =>
        (h.candidateId?.toString() || '').toLowerCase().includes(query) ||
        (h.oldStatus?.toLowerCase() || '').includes(query) ||
        (h.newStatus?.toLowerCase() || '').includes(query) ||
        (h.candidateName?.toLowerCase() || '').includes(query) ||
        (h.changedBy?.toLowerCase() || '').includes(query)
    )
    setFiltered(filteredResults)
}, [searchQuery, history])



    return (
        <>
            {showAlert && (
                <CAlert color={alertColor} dismissible>
                    {alertMessage}
                </CAlert>
            )}

            {/* === Search Filter === */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '1.5rem'
            }}>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '2px',
                        padding: '0.6rem 1rem',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                        width: '100%',
                        maxWidth: '600px',
                    }}
                >
                    <CIcon
                        icon={cilSearch}
                        style={{
                            color: '#326396ff',
                            fontSize: '1.2rem',
                            marginRight: '10px',
                        }}
                    />
                    <input
                        type="text"
                        placeholder="Search by candidate ID or status..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            border: 'none',
                            outline: 'none',
                            boxShadow: 'none',
                            fontSize: '1rem',
                            color: '#374151',
                            flex: 1,
                        }}
                    />
                </div>
            </div>

            {/* === Candidate Status History Table === */}
            <CTable
                responsive
                className="align-middle"
                style={{
                    borderCollapse: 'separate',
                    borderSpacing: '0 10px',
                    marginTop: '20px',
                }}
            >
                <CTableHead>
                    <CTableRow style={{ backgroundColor: '#f8fafc' }}>
                        <CTableHeaderCell style={{ fontWeight: 600 }}>Candidate ID</CTableHeaderCell>
                        <CTableHeaderCell style={{ fontWeight: 600 }}>Candidate Name</CTableHeaderCell>
                        <CTableHeaderCell style={{ fontWeight: 600 }}>Old Status</CTableHeaderCell>
                        <CTableHeaderCell style={{ fontWeight: 600 }}>New Status</CTableHeaderCell>
                        <CTableHeaderCell style={{ fontWeight: 600 }}>Changed By</CTableHeaderCell>
                        <CTableHeaderCell style={{ fontWeight: 600 }}>Changed At</CTableHeaderCell>
                    </CTableRow>
                </CTableHead>

                <CTableBody>
                    {filtered.length > 0 ? (
                        filtered.map((record, index) => (
                            <CTableRow key={index} style={{ backgroundColor: '#ffffff', boxShadow: '0 2px 6px rgba(0, 0, 0, 0.09)' }}>
                                <CTableDataCell>{record.candidateId}</CTableDataCell>
                                <CTableDataCell>{record.candidateName}</CTableDataCell>
                                <CTableDataCell>{record.oldStatus}</CTableDataCell>
                                <CTableDataCell>{record.newStatus}</CTableDataCell>
                                <CTableDataCell>{record.changedBy}</CTableDataCell>
                                <CTableDataCell>{record.changedAt}</CTableDataCell>
                            </CTableRow>
                        ))
                    ) : (
                        <CTableRow>
                            <CTableDataCell colSpan="6" className="text-center py-4 text-muted">
                                No candidate status history found.
                            </CTableDataCell>
                        </CTableRow>
                    )}
                </CTableBody>

            </CTable>
        </>
    )
}

export default DisplayCandidateStatusHistory
