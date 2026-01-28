import React, { useEffect, useMemo, useState } from 'react'
import {
  CBadge,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CSpinner,
} from '@coreui/react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import {
  fetchLoginActivitiesApi,
  getAllCandidates,
  getAllJobs,
  getCandidateStatusHistoryApi,
  getRecruitersCountApi,
  getUsersByRoleApi,
  getUsersCountApi,
} from '../../../api/api'

const safeNum = (v) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

const formatWhen = (iso) => {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString()
}

const daysAgo = (n) => {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}

const toYmd = (d) => {
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

const lastNDays = (n) => {
  const out = []
  const today = new Date()
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    out.push(d)
  }
  return out
}

const StatsSection = () => {
  const [loading, setLoading] = useState(true)
  const [usersCount, setUsersCount] = useState(0)
  const [recruitersCount, setRecruitersCount] = useState(0)
  const [adminsCount, setAdminsCount] = useState(0)
  const [clientsCount, setClientsCount] = useState(0)
  const [activeSeries, setActiveSeries] = useState([]) // daily active users for last 30 days
  const [recentCandidates, setRecentCandidates] = useState([])

  // Activity Metrics state
  const [candidateFunnel, setCandidateFunnel] = useState([])
  const [jobMetrics, setJobMetrics] = useState({ created: 0, assigned: 0, open: 0, closed: 0 })
  const [recruiterMetrics, setRecruiterMetrics] = useState({ added: 0, recent: [] })
  const [statusChanges, setStatusChanges] = useState([])

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      try {
        const [
          usersRes,
          recRes,
          adminRes,
          recruiterRes,
          clientRes,
          loginsRes,
          candidatesRes,
        ] = await Promise.all([
          getUsersCountApi(),
          getRecruitersCountApi(),
          getUsersByRoleApi('Admin').catch(() => ({ users: [] })),
          getUsersByRoleApi('Recruiter').catch(() => ({ users: [] })),
          getUsersByRoleApi('Client').catch(() => ({ users: [] })),
          fetchLoginActivitiesApi(),
          getAllCandidates(),
        ])

        if (cancelled) return

        // Counts: backend may return {count} or raw number
        setUsersCount(safeNum(usersRes?.count ?? usersRes?.total ?? usersRes))
        setRecruitersCount(safeNum(recRes?.count ?? recRes?.total ?? recRes))
        setAdminsCount(Array.isArray(adminRes?.users) ? adminRes.users.length : 0)
        setClientsCount(Array.isArray(clientRes?.users) ? clientRes.users.length : 0)

        const logins = Array.isArray(loginsRes) ? loginsRes : []
        // Build daily active users (unique users per day) for last 30 days
        const windowDays = 30
        const cutoff = daysAgo(windowDays - 1) // include today
        const dayToUsers = new Map() // ymd -> Set(userId)

        logins.forEach((l) => {
          const t = new Date(l.occurredAt)
          if (Number.isNaN(t.getTime())) return
          if (t < cutoff) return
          const key = toYmd(t)
          if (!dayToUsers.has(key)) dayToUsers.set(key, new Set())
          dayToUsers.get(key).add(l.userId)
        })

        const series = lastNDays(windowDays).map((d) => {
          const key = toYmd(d)
          return {
            date: key,
            active: dayToUsers.get(key)?.size || 0,
          }
        })
        setActiveSeries(series)

        const candidatesArr = Array.isArray(candidatesRes)
          ? candidatesRes
          : Array.isArray(candidatesRes?.candidates)
            ? candidatesRes.candidates
            : []

        setRecentCandidates(
          candidatesArr
            .slice()
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 10),
        )

        // Build candidate status funnel
        const statusCounts = {}
        candidatesArr.forEach((c) => {
          const status = (c.candidate_status || 'sourced').toLowerCase()
          statusCounts[status] = (statusCounts[status] || 0) + 1
        })

        // Funnel order: Sourced → Shortlisted → Interviewing → Offered → Placed
        const funnelOrder = ['sourced', 'submitted', 'shortlisted', 'interviewing', 'offered', 'placed']
        const funnelData = funnelOrder
          .filter((s) => statusCounts[s] > 0)
          .map((status, idx) => ({
            name: status.charAt(0).toUpperCase() + status.slice(1),
            value: statusCounts[status] || 0,
            fill: ['#3b91edff', '#4379d1ff', '#75a9e9ff', '#22c55e', '#f59e0b', '#10b981'][idx % 6],
          }))
        setCandidateFunnel(funnelData)

        // Job metrics
        try {
          const jobsData = await getAllJobs()
          const jobs = Array.isArray(jobsData) ? jobsData : []
          const now = new Date()
          const thirtyDaysAgo = daysAgo(30)

          const recentJobs = jobs.filter((j) => new Date(j.created_at) >= thirtyDaysAgo)
          setJobMetrics({
            created: recentJobs.length,
            assigned: recentJobs.filter((j) => j.assigned_to).length,
            open: jobs.filter((j) => j.status === 'Open').length,
            closed: jobs.filter((j) => j.status === 'Closed').length,
          })
        } catch (e) {
          console.error('Job metrics error:', e)
        }

        // Recruiter metrics (recently added)
        const recruitersData = recruiterRes?.users || []
        const recentRecruiters = recruitersData.filter((r) => {
          const created = new Date(r.createdAt)
          return created >= daysAgo(30)
        })
        setRecruiterMetrics({
          added: recentRecruiters.length,
          recent: recentRecruiters.slice(0, 5),
        })

        // Status changes
        try {
          const historyRes = await getCandidateStatusHistoryApi()
          const historyData = historyRes?.data || historyRes || []
          if (Array.isArray(historyData)) {
            setStatusChanges(historyData.slice(0, 10))
          }
        } catch (e) {
          console.error('Status history error:', e)
        }

      } catch (e) {
        // Keep page usable even if one API fails
        console.error('StatsOverview load error:', e)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [])

  const chartData = useMemo(
    () => [
      { name: 'Users', total: usersCount },
      { name: 'Recruiters', total: recruitersCount },
    ],
    [usersCount, recruitersCount],
  )

  const rolePieData = useMemo(
    () => [
      { name: 'Admin', value: adminsCount },
      { name: 'Recruiter', value: recruitersCount },
      { name: 'User', value: clientsCount || usersCount },
    ].filter((x) => safeNum(x.value) > 0),
    [adminsCount, recruitersCount, clientsCount, usersCount],
  )

  const activeSummary = useMemo(() => {
    const now = new Date()
    const since7 = daysAgo(7)
    const since30 = daysAgo(30)
    const set7 = new Set()
    const set30 = new Set()
    // derive from series by scanning window
    // We don’t have userIds per day here, so compute unique-active approximations from login events isn't possible from series.
    // Keep simple: show max/avg using series, and keep “active last 7/30” as sums in chart context.
    const last7 = activeSeries.slice(-7)
    const last30 = activeSeries.slice(-30)
    const avg7 = last7.length ? Math.round(last7.reduce((s, x) => s + x.active, 0) / last7.length) : 0
    const avg30 = last30.length ? Math.round(last30.reduce((s, x) => s + x.active, 0) / last30.length) : 0
    const max7 = last7.length ? Math.max(...last7.map((x) => x.active)) : 0
    const max30 = last30.length ? Math.max(...last30.map((x) => x.active)) : 0
    return { avg7, avg30, max7, max30, since7, since30, now, set7, set30 }
  }, [activeSeries])

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Stats Overview</strong>
          </CCardHeader>
          <CCardBody>
            {loading ? (
              <div className="d-flex align-items-center gap-2">
                <CSpinner size="sm" />
                <span>Loading stats…</span>
              </div>
            ) : (
              <CRow className="g-4">
                <CCol xs={12}>
                  <CRow className="g-3">
                    <CCol sm={6} lg={3}>
                      <CCard className="h-100">
                        <CCardBody>
                          <div className="text-body-secondary">Daily active users</div>
                          <div style={{ fontSize: 28, fontWeight: 700 }}>{activeSummary.avg7}</div>
                          <div className="text-body-secondary">avg (last 7 days)</div>
                        </CCardBody>
                      </CCard>
                    </CCol>
                    <CCol sm={6} lg={3}>
                      <CCard className="h-100">
                        <CCardBody>
                          <div className="text-body-secondary">Daily active users</div>
                          <div style={{ fontSize: 28, fontWeight: 700 }}>{activeSummary.avg30}</div>
                          <div className="text-body-secondary">avg (last 30 days)</div>
                        </CCardBody>
                      </CCard>
                    </CCol>
                    <CCol sm={6} lg={3}>
                      <CCard className="h-100">
                        <CCardBody>
                          <div className="text-body-secondary">Users</div>
                          <div style={{ fontSize: 28, fontWeight: 700 }}>{usersCount}</div>
                          <div className="text-body-secondary">total</div>
                        </CCardBody>
                      </CCard>
                    </CCol>
                    <CCol sm={6} lg={3}>
                      <CCard className="h-100">
                        <CCardBody>
                          <div className="text-body-secondary">Recruiters</div>
                          <div style={{ fontSize: 28, fontWeight: 700 }}>{recruitersCount}</div>
                          <div className="text-body-secondary">total</div>
                        </CCardBody>
                      </CCard>
                    </CCol>
                  </CRow>
                </CCol>

                <CCol xs={12}>
                  <CCard className="h-100">
                    <CCardHeader>
                      <strong>Active users (daily) — last 30 days</strong>
                    </CCardHeader>
                    <CCardBody style={{ height: 320 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={activeSeries} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" tick={{ fontSize: 12 }} minTickGap={24} />
                          <YAxis allowDecimals={false} />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="active" name="Daily active users" stroke="#3b91edff" strokeWidth={3} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                      <div className="mt-2 text-body-secondary" style={{ fontSize: 12 }}>
                        Computed from `login` events (unique users per day).
                      </div>
                    </CCardBody>
                  </CCard>
                </CCol>

                <CCol md={6}>
                  <CCard className="h-100">
                    <CCardHeader>
                      <strong>Total Users vs Recruiters</strong>
                    </CCardHeader>
                    <CCardBody style={{ height: 320 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis allowDecimals={false} />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="total" name="Total" fill="#3b91edff" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                      <div className="mt-3 d-flex gap-3 flex-wrap">
                        <div>
                          <CBadge color="info">Users</CBadge> <strong className="ms-2">{usersCount}</strong>
                        </div>
                        <div>
                          <CBadge color="primary">Recruiters</CBadge>{' '}
                          <strong className="ms-2">{recruitersCount}</strong>
                        </div>
                      </div>
                    </CCardBody>
                  </CCard>
                </CCol>

                <CCol md={6}>
                  <CCard className="h-100">
                    <CCardHeader>
                      <strong>Roles (Admin / Recruiter / User)</strong>
                    </CCardHeader>
                    <CCardBody style={{ height: 320 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Tooltip />
                          <Legend />
                          <Pie
                            data={rolePieData}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={3}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="mt-2 d-flex gap-3 flex-wrap">
                        <div>
                          <CBadge color="dark">Admin</CBadge> <strong className="ms-2">{adminsCount}</strong>
                        </div>
                        <div>
                          <CBadge color="primary">Recruiter</CBadge> <strong className="ms-2">{recruitersCount}</strong>
                        </div>
                        <div>
                          <CBadge color="info">User</CBadge> <strong className="ms-2">{clientsCount || usersCount}</strong>
                        </div>
                      </div>
                    </CCardBody>
                  </CCard>
                </CCol>

                {/* Activity Metrics Section */}
                <CCol xs={12}>
                  <CCard className="mb-4">
                    <CCardHeader>
                      <strong>Activity Metrics</strong>
                    </CCardHeader>
                    <CCardBody>
                      <CRow className="g-4">
                        {/* Candidate Status Conversion Funnel */}
                        <CCol md={6}>
                          <CCard className="h-100">
                            <CCardHeader>
                              <strong>Candidate Status Conversion Funnel</strong>
                            </CCardHeader>
                            <CCardBody style={{ height: 320 }}>
                              {candidateFunnel.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                  <BarChart data={candidateFunnel} layout="vertical" margin={{ top: 10, right: 30, left: 80, bottom: 10 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" />
                                    <YAxis dataKey="name" type="category" />
                                    <Tooltip />
                                    <Bar dataKey="value" name="Candidates" radius={[0, 6, 6, 0]}>
                                      {candidateFunnel.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                      ))}
                                    </Bar>
                                  </BarChart>
                                </ResponsiveContainer>
                              ) : (
                                <div className="text-body-secondary text-center" style={{ paddingTop: 100 }}>
                                  No candidate data available
                                </div>
                              )}
                            </CCardBody>
                          </CCard>
                        </CCol>

                        {/* Job Metrics */}
                        <CCol md={6}>
                          <CCard className="h-100">
                            <CCardHeader>
                              <strong>Job Metrics (Last 30 days)</strong>
                            </CCardHeader>
                            <CCardBody>
                              <CRow className="g-3">
                                <CCol sm={6}>
                                  <CCard style={{ backgroundColor: '#dbeafe', border: 'none' }}>
                                    <CCardBody className="text-center">
                                      <div style={{ fontSize: 32, fontWeight: 700, color: '#1e40af' }}>{jobMetrics.created}</div>
                                      <div style={{ fontSize: 14, color: '#1e40af' }}>Jobs Created</div>
                                    </CCardBody>
                                  </CCard>
                                </CCol>
                                <CCol sm={6}>
                                  <CCard style={{ backgroundColor: '#d1fae5', border: 'none' }}>
                                    <CCardBody className="text-center">
                                      <div style={{ fontSize: 32, fontWeight: 700, color: '#047857' }}>{jobMetrics.assigned}</div>
                                      <div style={{ fontSize: 14, color: '#047857' }}>Jobs Assigned</div>
                                    </CCardBody>
                                  </CCard>
                                </CCol>
                                <CCol sm={6}>
                                  <CCard style={{ backgroundColor: '#fef3c7', border: 'none' }}>
                                    <CCardBody className="text-center">
                                      <div style={{ fontSize: 32, fontWeight: 700, color: '#92400e' }}>{jobMetrics.open}</div>
                                      <div style={{ fontSize: 14, color: '#92400e' }}>Open Jobs</div>
                                    </CCardBody>
                                  </CCard>
                                </CCol>
                                <CCol sm={6}>
                                  <CCard style={{ backgroundColor: '#fee2e2', border: 'none' }}>
                                    <CCardBody className="text-center">
                                      <div style={{ fontSize: 32, fontWeight: 700, color: '#991b1b' }}>{jobMetrics.closed}</div>
                                      <div style={{ fontSize: 14, color: '#991b1b' }}>Closed Jobs</div>
                                    </CCardBody>
                                  </CCard>
                                </CCol>
                              </CRow>
                            </CCardBody>
                          </CCard>
                        </CCol>

                        {/* Recruiter Metrics */}
                        <CCol md={6}>
                          <CCard className="h-100">
                            <CCardHeader>
                              <strong>Recruiter Activity (Last 30 days)</strong>
                            </CCardHeader>
                            <CCardBody>
                              <div className="mb-3">
                                <div style={{ fontSize: 14, color: '#666' }}>New Recruiters Added</div>
                                <div style={{ fontSize: 28, fontWeight: 700, color: '#be185d' }}>{recruiterMetrics.added}</div>
                              </div>
                              {recruiterMetrics.recent.length > 0 && (
                                <div>
                                  <div className="mb-2" style={{ fontSize: 14, fontWeight: 600 }}>Recently Added:</div>
                                  <div className="d-flex flex-column gap-2">
                                    {recruiterMetrics.recent.map((r, idx) => (
                                      <div key={idx} className="d-flex justify-content-between">
                                        <span>{r.full_name || r.email}</span>
                                        <span className="text-body-secondary" style={{ fontSize: 12 }}>
                                          {formatWhen(r.createdAt)}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </CCardBody>
                          </CCard>
                        </CCol>

                        {/* Candidate Status Changes */}
                        <CCol md={6}>
                          <CCard className="h-100">
                            <CCardHeader>
                              <strong>Recent Status Changes</strong>
                            </CCardHeader>
                            <CCardBody style={{ maxHeight: 300, overflowY: 'auto' }}>
                              {statusChanges.length === 0 ? (
                                <div className="text-body-secondary">No status changes recorded.</div>
                              ) : (
                                <div className="d-flex flex-column gap-2">
                                  {statusChanges.map((change, idx) => (
                                    <div
                                      key={idx}
                                      className="d-flex justify-content-between align-items-center"
                                      style={{ padding: '8px', backgroundColor: '#f9fafb', borderRadius: 4 }}
                                    >
                                      <div>
                                        <div style={{ fontSize: 13, fontWeight: 500 }}>{change.candidateName || 'Candidate'}</div>
                                        <div style={{ fontSize: 12, color: '#666' }}>
                                          <CBadge color="secondary" style={{ fontSize: 10 }}>{change.oldStatus || 'N/A'}</CBadge>
                                          <span className="mx-1">→</span>
                                          <CBadge color="primary" style={{ fontSize: 10 }}>{change.newStatus || 'N/A'}</CBadge>
                                        </div>
                                      </div>
                                      <div style={{ fontSize: 11, color: '#999' }}>{formatWhen(change.changedAt)}</div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </CCardBody>
                          </CCard>
                        </CCol>
                      </CRow>
                    </CCardBody>
                  </CCard>
                </CCol>

                <CCol xs={12}>
                  <CCard>
                    <CCardHeader>
                      <strong>Recent activity</strong>
                    </CCardHeader>
                    <CCardBody>
                      <CRow className="g-4">
                        <CCol md={12}>
                          <div className="mb-2">
                            <strong>Recently added candidates</strong>
                          </div>
                          {recentCandidates.length === 0 ? (
                            <div className="text-body-secondary">No candidates found.</div>
                          ) : (
                            <div className="d-flex flex-column gap-2">
                              {recentCandidates.map((c) => (
                                <div
                                  key={c.candidate_id || c.email || `${c.firstName}-${c.created_at}`}
                                  className="d-flex justify-content-between gap-3"
                                >
                                  <div className="text-truncate">
                                    <CBadge color="info">ADDED</CBadge>
                                    <span className="ms-2">
                                      {c.name || c.firstName || c.first_name || ''} {c.lastName || c.last_name || ''}
                                    </span>
                                    {c.email ? <span className="text-body-secondary ms-2">({c.email})</span> : null}
                                  </div>
                                  <div className="text-body-secondary text-nowrap">{formatWhen(c.created_at)}</div>
                                </div>
                              ))}
                            </div>
                          )}
                        </CCol>
                      </CRow>
                    </CCardBody>
                  </CCard>
                </CCol>
              </CRow>
            )}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default StatsSection
