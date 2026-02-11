import React, { useState, useEffect } from 'react';
import {
  CContainer,
  CCard,
  CCardBody,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CFormInput,
  CFormSelect,
  CBadge,
  CSpinner,
  CRow,
  CCol,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import {
  cilUser,
  cilBriefcase,
  cilPeople,
  cilLink,
  cilSearch,
} from '@coreui/icons';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { fetchActivityLogApi } from '../../../api/api';

const ActivityLog = () => {
  const [activities, setActivities] = useState([]);
  const [counts, setCounts] = useState({ logins: 0, jobs: 0, candidates: 0, linked: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const response = await fetchActivityLogApi();
      if (response.success) {
        setActivities(response.activities || []);
        setCounts(response.counts || { logins: 0, jobs: 0, candidates: 0, linked: 0 });
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'USER_LOGIN':
        return <CIcon icon={cilUser} style={{ color: '#10b981' }} />;
      case 'JOB_CREATED':
        return <CIcon icon={cilBriefcase} style={{ color: '#3b82f6' }} />;
      case 'CANDIDATE_ADDED':
        return <CIcon icon={cilPeople} style={{ color: '#8b5cf6' }} />;
      case 'CANDIDATE_LINKED':
        return <CIcon icon={cilLink} style={{ color: '#f59e0b' }} />;
      default:
        return <CIcon icon={cilUser} style={{ color: '#6b7280' }} />;
    }
  };

  const getActivityBadge = (type) => {
    const badges = {
      USER_LOGIN: { color: 'success', label: 'Login' },
      JOB_CREATED: { color: 'primary', label: 'Job Created' },
      CANDIDATE_ADDED: { color: 'info', label: 'Candidate Added' },
      CANDIDATE_LINKED: { color: 'warning', label: 'Candidate Linked' },
    };
    const badge = badges[type] || { color: 'secondary', label: type };
    return <CBadge color={badge.color} style={{ fontSize: '0.7rem' }}>{badge.label}</CBadge>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRoleText = (role) => {
    const colors = {
      Admin: '#7c3aed', // purple
      Recruiter: '#0d6efd', // primary blue
      Client: '#0dcaf0', // info cyan
    };
    return <span style={{ color: colors[role] || '#6b7280', fontWeight: 600, fontSize: '0.85rem' }}>{role}</span>;
  };

  // Filter activities
  const filteredActivities = activities.filter((activity) => {
    const matchesSearch =
      activity.description?.toLowerCase().includes(filter.toLowerCase()) ||
      activity.user?.toLowerCase().includes(filter.toLowerCase());
    const matchesType = typeFilter === 'ALL' || activity.type === typeFilter;
    return matchesSearch && matchesType;
  });

  // Pagination
  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);
  const paginatedActivities = filteredActivities.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return (
      <CContainer className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
        <CSpinner color="primary" />
        <span className="ms-2">Loading activities...</span>
      </CContainer>
    );
  }

  const widgetData = [
    { title: "Today's Logins", total: counts.logins, trend: 'up' },
    { title: 'Total Jobs', total: counts.jobs, trend: 'up' },
    { title: 'Total Candidates', total: counts.candidates, trend: 'up' },
    { title: 'Candidates Linked', total: counts.linked, trend: 'up' },
  ];

  return (
    <CContainer style={{ fontFamily: 'Inter, sans-serif', maxWidth: '1400px', padding: '1.5rem' }}>
      {/* Tiles matching app theme */}
      <CRow className="mb-4" xs={{ gutter: 3 }}>
        {widgetData.map((widget, index) => (
          <CCol key={index} xs={12} sm={6} md={4} xl={3}>
            <div
              style={{
                borderRadius: '0.25rem',
                border: '1px solid #d1d5db',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '140px',
                backgroundColor: '#fff',
                overflow: 'hidden',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0px)'}
            >
              <div style={{ padding: '0.8rem 1rem', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexWrap: 'wrap' }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>
                    {widget.total.toLocaleString()}
                  </div>
                  {widget.trend === 'up' ? (
                    <TrendingUp color="green" size={18} />
                  ) : (
                    <TrendingDown color="red" size={18} />
                  )}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#6B7280', fontFamily: 'Inter, sans-serif', marginTop: '2px' }}>
                  {widget.title}
                </div>
              </div>
              {/* Blue strip */}
              <div
                style={{
                  backgroundColor: '#2759a7',
                  color: '#fff',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.4rem 0.8rem',
                  fontWeight: 500,
                  fontSize: '0.8rem',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                <span>View More</span>
                <ArrowRight size={14} color="#fff" />
              </div>
            </div>
          </CCol>
        ))}
      </CRow>

      {/* Activity Table */}
      <CCard>
        <CCardBody style={{ padding: '1rem' }}>
          {/* Search bar inside container - centered and smaller */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
           {/* Search bar container */}
<div
  style={{
    position: 'relative',
    width: '100%',
    maxWidth: '300px', // max width for desktop
  }}
>
  <CFormInput
    placeholder="Search by user or description..."
    value={filter}
    onChange={(e) => { setFilter(e.target.value); setCurrentPage(1); }}
    style={{
      paddingLeft: '2.5rem', // leave space for icon
      fontSize: '0.8rem',
      paddingTop: '0.35rem',
      paddingBottom: '0.35rem',
      width: '100%', // makes input shrink properly on mobile
      boxSizing: 'border-box', // important to include padding in width
    }}
  />
  <CIcon
    icon={cilSearch}
    style={{
      position: 'absolute',
      left: window.innerWidth < 800 ? '0.9rem' : '0.9rem', // shift right on mobile
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#6b7280',
      fontSize: '14px',
      pointerEvents: 'none',
    }}
  />
</div>


            <CFormSelect
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
              style={{ width: '180px', fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
            >
              <option value="ALL">All Activities</option>
              <option value="USER_LOGIN">Logins Only</option>
              <option value="JOB_CREATED">Jobs Created</option>
              <option value="CANDIDATE_ADDED">Candidates Added</option>
              <option value="CANDIDATE_LINKED">Candidates Linked</option>
            </CFormSelect>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <CTable hover responsive style={{ marginBottom: 0, fontSize: '0.85rem', border: '1px solid #d1d5db', borderCollapse: 'collapse' }}>
              <CTableHead color="light" style={{ borderBottom: '2px solid #d1d5db' }}>
                <CTableRow>
                  <CTableHeaderCell style={{ width: '50px', border: '1px solid #d1d5db', padding: '0.75rem' }}></CTableHeaderCell>
                  <CTableHeaderCell style={{ border: '1px solid #d1d5db', padding: '0.75rem' }}>Activity Type</CTableHeaderCell>
                  <CTableHeaderCell style={{ border: '1px solid #d1d5db', padding: '0.75rem' }}>Description</CTableHeaderCell>
                  <CTableHeaderCell style={{ border: '1px solid #d1d5db', padding: '0.75rem' }}>User</CTableHeaderCell>
                  <CTableHeaderCell style={{ border: '1px solid #d1d5db', padding: '0.75rem' }}>Role</CTableHeaderCell>
                  <CTableHeaderCell style={{ border: '1px solid #d1d5db', padding: '0.75rem' }}>Date & Time</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {paginatedActivities.length === 0 ? (
                  <CTableRow>
                    <CTableDataCell colSpan={6} className="text-center text-muted py-4" style={{ border: '1px solid #d1d5db' }}>
                      No activities found.
                    </CTableDataCell>
                  </CTableRow>
                ) : (
                  paginatedActivities.map((activity, index) => (
                    <CTableRow key={activity.id || index}>
                      <CTableDataCell className="text-center" style={{ border: '1px solid #d1d5db', padding: '0.75rem' }}>
                        {getActivityIcon(activity.type)}
                      </CTableDataCell>
                      <CTableDataCell style={{ border: '1px solid #d1d5db', padding: '0.75rem' }}>{getActivityBadge(activity.type)}</CTableDataCell>
                      <CTableDataCell style={{ maxWidth: '350px', border: '1px solid #d1d5db', padding: '0.75rem' }}>
                        <div style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}>
                          {activity.description}
                        </div>
                        {activity.metadata?.company && (
                          <small className="text-muted d-block">Company: {activity.metadata.company}</small>
                        )}
                        {activity.metadata?.assignedRecruiter && (
                          <small className="text-muted d-block">Recruiter: {activity.metadata.assignedRecruiter}</small>
                        )}
                        {activity.metadata?.assignedClient && (
                          <small className="text-muted d-block">Client: {activity.metadata.assignedClient}</small>
                        )}
                        {activity.status && (
                          <CBadge
                            color={activity.status === 'Open' ? 'success' : activity.status === 'Closed' ? 'danger' : 'warning'}
                            style={{ fontSize: '0.65rem', marginTop: '4px' }}
                          >
                            {activity.status}
                          </CBadge>
                        )}
                      </CTableDataCell>
                      <CTableDataCell style={{ border: '1px solid #d1d5db', padding: '0.75rem' }}>{activity.user || '-'}</CTableDataCell>
                      <CTableDataCell style={{ border: '1px solid #d1d5db', padding: '0.75rem' }}>{getRoleText(activity.userRole)}</CTableDataCell>
                      <CTableDataCell style={{ whiteSpace: 'nowrap', border: '1px solid #d1d5db', padding: '0.75rem' }}>
                        {formatDate(activity.timestamp)}
                      </CTableDataCell>
                    </CTableRow>
                  ))
                )}
              </CTableBody>
            </CTable>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem', gap: '5px' }}>
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{
                  padding: '5px 10px',
                  border: '1px solid #ccc',
                  background: '#fff',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                }}
              >
                &lt;
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(currentPage - 2, totalPages - 4)) + i;
                if (pageNum > totalPages) return null;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    style={{
                      padding: '5px 10px',
                      border: '1px solid #ccc',
                      background: currentPage === pageNum ? '#1f3c88' : '#fff',
                      color: currentPage === pageNum ? '#fff' : '#000',
                      cursor: 'pointer',
                      fontWeight: currentPage === pageNum ? 'bold' : 'normal',
                    }}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                style={{
                  padding: '5px 10px',
                  border: '1px solid #ccc',
                  background: '#fff',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                }}
              >
                &gt;
              </button>
            </div>
          )}
        </CCardBody>
      </CCard>

      <div className="text-muted text-center mt-3" style={{ fontSize: '0.8rem' }}>
        Showing {paginatedActivities.length} of {filteredActivities.length} activities
      </div>
    </CContainer>
  );
};

export default ActivityLog;
