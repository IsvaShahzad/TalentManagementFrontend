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
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import {
  cilUser,
  cilBriefcase,
  cilPeople,
  cilLink,
  cilSearch,
} from '@coreui/icons';
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

  const getRoleBadge = (role) => {
    const colors = {
      Admin: 'danger',
      Recruiter: 'primary',
      Client: 'success',
    };
    return <CBadge color={colors[role] || 'secondary'} style={{ fontSize: '0.65rem' }}>{role}</CBadge>;
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

  return (
    <CContainer style={{ fontFamily: 'Inter, sans-serif', maxWidth: '1400px', padding: '1.5rem' }}>
      <h2 style={{ fontWeight: 600, marginBottom: '1.5rem', color: '#1f3c88' }}>Activity Log</h2>

      {/* Summary Cards */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <CCard style={{ flex: '1', minWidth: '150px', borderLeft: '4px solid #10b981' }}>
          <CCardBody style={{ padding: '1rem' }}>
            <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Today's Logins</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#10b981' }}>
              {counts.logins}
            </div>
          </CCardBody>
        </CCard>
        <CCard style={{ flex: '1', minWidth: '150px', borderLeft: '4px solid #3b82f6' }}>
          <CCardBody style={{ padding: '1rem' }}>
            <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Total Jobs</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#3b82f6' }}>
              {counts.jobs}
            </div>
          </CCardBody>
        </CCard>
        <CCard style={{ flex: '1', minWidth: '150px', borderLeft: '4px solid #8b5cf6' }}>
          <CCardBody style={{ padding: '1rem' }}>
            <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Total Candidates</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#8b5cf6' }}>
              {counts.candidates}
            </div>
          </CCardBody>
        </CCard>
        <CCard style={{ flex: '1', minWidth: '150px', borderLeft: '4px solid #f59e0b' }}>
          <CCardBody style={{ padding: '1rem' }}>
            <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Candidates Linked</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#f59e0b' }}>
              {counts.linked}
            </div>
          </CCardBody>
        </CCard>
      </div>

      {/* Filters */}
      <CCard className="mb-3">
        <CCardBody style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: '1', minWidth: '250px' }}>
              <CFormInput
                placeholder="Search by user or description..."
                value={filter}
                onChange={(e) => { setFilter(e.target.value); setCurrentPage(1); }}
                style={{ paddingLeft: '2.2rem', fontSize: '0.85rem' }}
              />
              <CIcon
                icon={cilSearch}
                style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }}
              />
            </div>
            <CFormSelect
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
              style={{ width: '200px', fontSize: '0.85rem' }}
            >
              <option value="ALL">All Activities</option>
              <option value="USER_LOGIN">Logins Only</option>
              <option value="JOB_CREATED">Jobs Created</option>
              <option value="CANDIDATE_ADDED">Candidates Added</option>
              <option value="CANDIDATE_LINKED">Candidates Linked</option>
            </CFormSelect>
          </div>
        </CCardBody>
      </CCard>

      {/* Activity Table */}
      <CCard>
        <CCardBody style={{ padding: 0 }}>
          <div style={{ overflowX: 'auto' }}>
            <CTable hover responsive style={{ marginBottom: 0, fontSize: '0.85rem' }}>
              <CTableHead color="light">
                <CTableRow>
                  <CTableHeaderCell style={{ width: '50px' }}></CTableHeaderCell>
                  <CTableHeaderCell>Activity Type</CTableHeaderCell>
                  <CTableHeaderCell>Description</CTableHeaderCell>
                  <CTableHeaderCell>User</CTableHeaderCell>
                  <CTableHeaderCell>Role</CTableHeaderCell>
                  <CTableHeaderCell>Date & Time</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {paginatedActivities.length === 0 ? (
                  <CTableRow>
                    <CTableDataCell colSpan={6} className="text-center text-muted py-4">
                      No activities found.
                    </CTableDataCell>
                  </CTableRow>
                ) : (
                  paginatedActivities.map((activity, index) => (
                    <CTableRow key={activity.id || index}>
                      <CTableDataCell className="text-center">
                        {getActivityIcon(activity.type)}
                      </CTableDataCell>
                      <CTableDataCell>{getActivityBadge(activity.type)}</CTableDataCell>
                      <CTableDataCell style={{ maxWidth: '350px' }}>
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
                      <CTableDataCell>{activity.user || '-'}</CTableDataCell>
                      <CTableDataCell>{getRoleBadge(activity.userRole)}</CTableDataCell>
                      <CTableDataCell style={{ whiteSpace: 'nowrap' }}>
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
