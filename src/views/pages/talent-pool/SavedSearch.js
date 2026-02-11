// export default SavedSearch
import React, { useState, useEffect } from 'react'
import { Trash, TimerReset } from 'lucide-react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from 'recharts'
import {
  CContainer, CCard, CCardBody,
  CButton, CAlert, CModal, CModalHeader, CModalBody, CModalFooter,
  CFormInput, CFormSelect
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilTrash, cilCalendar, cilSearch } from '@coreui/icons'
import { deleteSearchApi, getAllSearches, updateSearchApi } from '../../../api/api'
import './TableScrollbar.css'
const SavedSearch = () => {
  const [searches, setSearches] = useState([])
  const [editingSearch, setEditingSearch] = useState(null)
  const [deletingSearch, setDeletingSearch] = useState(null)
  const [frequency, setFrequency] = useState('')
  const [position, setPosition] = useState('')
  const [experience, setExperience] = useState('')
  const [alerts, setAlerts] = useState([])
  const [userId, setUserId] = useState('')
  const [deletingId, setDeletingId] = useState(null)

  const showAlert = (message, color = 'success') => {
    const id = new Date().getTime()
    setAlerts(prev => [...prev, { id, message, color }])
    setTimeout(() => setAlerts(prev => prev.filter(a => a.id !== id)), 3000)
  }

  const fetchSearches = async () => {
    const userObj = localStorage.getItem('user')
    const user = JSON.parse(userObj)
    setUserId(user.user_id)

    try {
      const response = await getAllSearches(user.user_id)
      const formatted = response.map(c => ({
        id: c.savedsearch_id,
        query: c.query,
        frequency: c.notify_frequency,
        createdAT: new Date(c.created_at).toLocaleString(),
        createdBy: c.user?.full_name || 'Unknown',
      }))
      setSearches(formatted)
    } catch (err) {
      console.error(err)
      showAlert('Failed to fetch searches', 'danger')
    }
  }


  // Derive stats for "Searches made per day and saved"
  const statsData = React.useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const dayCounts = {
      Mon: 0,
      Tue: 0,
      Wed: 0,
      Thu: 0,
      Fri: 0,
      Sat: 0,
      Sun: 0,
    }

    searches.forEach((s) => {
      if (!s.createdAT) return
      const created = new Date(s.createdAT)
      if (Number.isNaN(created.getTime())) return
      const dayName = days[created.getDay()] // "Sun"..."Sat"
      if (dayCounts[dayName] !== undefined) dayCounts[dayName] += 1
    })

    const ordered = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const base = ordered.map((d, idx) => {
      const searches = dayCounts[d]
      // Simple smoothed trend so line + dots look nicer,
      // still fully derived from real "searches" values
      const prev = idx > 0 ? dayCounts[ordered[idx - 1]] : searches
      const next = idx < ordered.length - 1 ? dayCounts[ordered[idx + 1]] : searches
      const trend = Math.round((prev + searches + next) / 3)
      return { day: d, searches, trend }
    })
    return base
  }, [searches])




  useEffect(() => {
    fetchSearches()
    const interval = setInterval(fetchSearches, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleEdit = (s) => {
    setEditingSearch({ ...s })
    setFrequency(s.frequency || '')
  }

  const handleSave = async () => {
    try {
      const filters = {
        position,
        experience: experience ? parseFloat(experience) : null,
      }
      const updatedQuery = `${filters.position || ''} for ${filters.experience ? filters.experience + ' years' : ''}`.trim()

      await updateSearchApi(editingSearch.id, {
        query: updatedQuery || editingSearch.query || null,
        notify_frequency: frequency || null,
        filters
      })
      showAlert('Search updated successfully', 'success')
      fetchSearches()
      setEditingSearch(null)
    } catch (err) {
      console.error(err)
      showAlert('Failed to update Search', 'danger')
    }
  }

  const handleDelete = async (s) => {
    // show inline loader for this row while deleting
    setDeletingId(s.id)
    setDeletingSearch(s)
    await handleConfirmDelete()
    setDeletingId(null)
  }
  const handleConfirmDelete = async () => {
    if (!deletingSearch) return
    try {
      await deleteSearchApi(deletingSearch.id)
      showAlert('Search deleted successfully', 'success')
      fetchSearches()
    } catch (err) {
      console.error(err)
      showAlert('Failed to delete search', 'danger')
    } finally {
      setDeletingSearch(null)
    }
  }

  return (
    <CContainer style={{ fontFamily: 'Inter, sans-serif', marginTop: '2rem', maxWidth: '95vw' }}>
      {/* Alerts */}
      <div style={{ position: 'fixed', top: '10px', right: '10px', zIndex: 9999 }}>
        {alerts.map(a => (
          <CAlert
            key={a.id}
            color={a.color}
            dismissible
            style={{ fontSize: '16px', padding: '10px 16px', lineHeight: '1.4' }}
          >
            {a.message}
          </CAlert>
        ))}
      </div>



      {/* Two cards side by side */}
    <div className="saved-search-layout" style={{ gap: '1rem' }}>
  {/* Card 1: Saved Searches */}
  <CCard
    style={{
      flex: '0 0 450px',
      maxWidth: '100%',
      borderRadius: '1px',
      padding: '1.5rem',
      background: '#fff',
      display: 'flex',
      flexDirection: 'column',
      minHeight: '500px',
    }}
  >
    <h5 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Saved Searches</h5>
    <div
      style={{
        flex: 1,
        overflowY: 'auto', // vertical scroll
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        paddingRight: '4px',
      }}
      className="table-scroll"
    >
      {searches.length > 0 ? searches.map((s, idx) => (
        <div
          key={s.id}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.75rem 1rem',
            borderRadius: '1px',
            border: '1px solid #dde6f0ff',
            background: idx % 2 === 0 ? '#e0f2fe' : '#dbeafe',
            fontSize: '0.85rem',
          }}
        >
          {/* Search info */}
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{s.query}</div>
            <div style={{ fontSize: '0.75rem', color: '#555', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <div>Saved by {s.createdBy} • {s.createdAT}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <TimerReset size={12} color="#0B3D91" />
                <span>Frequency: {s.frequency || '-'}</span>
              </div>
            </div>
          </div>

          {/* Delete button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Trash
              size={14}
              color="red"
              style={{
                cursor: deletingId && deletingId !== s.id ? 'default' : 'pointer',
                opacity: deletingId === s.id ? 0.5 : 1,
                pointerEvents: deletingId && deletingId !== s.id ? 'none' : 'auto',
              }}
              onClick={() => !deletingId && handleDelete(s)}
            />
            {deletingId === s.id && <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Deleting…</span>}
          </div>
        </div>
      )) : (
        <div style={{ textAlign: 'center', padding: '0.75rem', color: '#555', fontSize: '0.8rem' }}>
          No saved searches found.
        </div>
      )}
    </div>
  </CCard>

  {/* Card 2: Statistics */}
<CCard
  className="stats-chart-card"
  style={{
    flex: 1,
    borderRadius: '1px',
    padding: '1rem 1.5rem',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '500px',
  }}
>
  <h5 style={{ marginBottom: '1rem' }}>Statistics</h5>

  <div className="stats-chart-container" style={{ 
    width: '100%', 
    overflowX: 'auto',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  }}>
    <BarChart 
      width={600}
      height={360}
      data={statsData} 
      margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
    >
      <CartesianGrid stroke="#e5e5e5" strokeDasharray="1 1" />
      <XAxis dataKey="day" tick={{ fill: "#555", fontSize: 12 }} />
      <YAxis tick={{ fill: "#555", fontSize: 12 }} allowDecimals={false} />
      <Tooltip cursor={false} />
      <Bar
        dataKey="searches"
        name="Saved searches"
        barSize={20} 
        radius={[4, 4, 0, 0]}
        fill="#3f71c2ff"
        onMouseEnter={(data, index, e) => e.target.setAttribute('fill', '#6690d6ff')}
        onMouseLeave={(data, index, e) => e.target.setAttribute('fill', '#3f71c2ff')}
      />
      <Line
        type="monotone"
        dataKey="trend"
        name="Search trend"
        stroke="#0B3D91"
        strokeWidth={2}
        dot={{ r: 4, fill: '#0B3D91', stroke: '#fff', strokeWidth: 1.5 }}
        activeDot={{ r: 6, fill: '#0B3D91' }}
      />
    </BarChart>
  </div>
</CCard>
</div>







      {/* Modals (Edit/Delete) remain same as previous example */}
      <CModal visible={!!editingSearch} onClose={() => setEditingSearch(null)}>
        <CModalHeader closeButton>Edit Search</CModalHeader>
        <CModalBody>
          {editingSearch && (
            <>
              <CFormInput className="mb-2" label="Query" value={editingSearch.query} readOnly />
              <CFormInput className="mb-2" label="Position" value={position} onChange={e => setPosition(e.target.value)} />
              <CFormInput className="mb-2" label="Experience (years)" value={experience} onChange={e => setExperience(e.target.value)} />
              <div className="mb-3" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CIcon icon={cilCalendar} />
                <CFormSelect value={frequency} onChange={e => setFrequency(e.target.value)}>
                  <option value="" disabled hidden>Frequency</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </CFormSelect>
              </div>
            </>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setEditingSearch(null)}>Cancel</CButton>
          <CButton color="primary" onClick={handleSave}>Save</CButton>
        </CModalFooter>
      </CModal>

      <CModal visible={!!deletingSearch} onClose={() => setDeletingSearch(null)} size="md">
        <CModalHeader closeButton style={{ fontSize: '16px' }}>
          Confirm Delete
        </CModalHeader>
        <CModalBody style={{ fontSize: '14px' }}>
          Are you sure you want to delete this search?
        </CModalBody>
        <CModalFooter>
          <CButton
            color="secondary"
            onClick={() => setDeletingSearch(null)}
            style={{ fontSize: '14px', padding: '6px 12px' }}
          >
            Cancel
          </CButton>
          <CButton
            color="danger"
            onClick={handleConfirmDelete}
            style={{ fontSize: '14px', padding: '6px 12px', color: '#fff' }}
          >
            Delete
          </CButton>
        </CModalFooter>
      </CModal>



    </CContainer>
  )
}

export default SavedSearch
