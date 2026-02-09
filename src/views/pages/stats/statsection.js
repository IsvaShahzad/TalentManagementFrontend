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
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Label,
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
import './stats.css'
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
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [usersCount, setUsersCount] = useState(0)
  const [recruitersCount, setRecruitersCount] = useState(0)
  const [adminsCount, setAdminsCount] = useState(0)
  const [clientsCount, setClientsCount] = useState(0)
  const [activeSeries, setActiveSeries] = useState([]) // daily active users for last 30 days
  const [recentCandidates, setRecentCandidates] = useState([])

  // Activity Metrics state
  const [candidateFunnel, setCandidateFunnel] = useState([])
  const [jobMetrics, setJobMetrics] = useState({ created: 0, assigned: 0, open: 0, closed: 0, total: 0 })
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
          const totalJobs = jobs.length
          const openJobs = jobs.filter((j) => j.status === 'Open').length
          const closedJobs = jobs.filter((j) => j.status === 'Closed').length
          const assignedJobs = recentJobs.filter((j) => j.assigned_to).length
          setJobMetrics({
            created: recentJobs.length,
            assigned: assignedJobs,
            open: openJobs,
            closed: closedJobs,
            total: totalJobs,
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
      { name: 'Admin', value: adminsCount, fill: '#60a5fa' }, // light blue
      { name: 'Recruiter', value: recruitersCount, fill: '#0d6efd' }, // primary blue
      { name: 'User', value: clientsCount || usersCount, fill: '#0dcaf0' }, // info cyan
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

  const widgetData = [
    { title: 'Daily Active Users', total: activeSummary.avg7, subtitle: 'avg (last 7 days)', trend: 'up' },
    { title: 'Daily Active Users', total: activeSummary.avg30, subtitle: 'avg (last 30 days)', trend: 'up' },
    { title: 'Total Users', total: usersCount, subtitle: 'total', trend: 'up' },
    { title: 'Total Recruiters', total: recruitersCount, subtitle: 'total', trend: 'up' },
  ]

  return (
    <CRow>
      <CCol xs={12}>
        {loading ? (
          <div className="d-flex align-items-center gap-2">
            <CSpinner size="sm" />
            <span>Loading stats…</span>
          </div>
        ) : (
          <React.Fragment>
            {/* 4 Tiles with blue strip */}
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
                      <div style={{ fontSize: '0.7rem', color: '#9CA3AF', fontFamily: 'Inter, sans-serif' }}>
                        {widget.subtitle}
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

            {/* All boxes exist separately */}
            <CRow className="g-4">
              {/* Active users box - full width and square */}
              <CCol xs={12}>
                <CCard style={{ borderRadius: '0px', width: '100%', height: '400px' }}>
                  <CCardHeader>
                    <strong>Active users (daily) — last 30 days</strong>
                  </CCardHeader>
                  <CCardBody style={{ height: 'calc(100% - 60px)', padding: '1rem', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ flex: '1 1 auto', minHeight: 0 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={activeSeries} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" tick={{ fontSize: 12 }} minTickGap={24} />
                          <YAxis allowDecimals={false} />
                          <Tooltip cursor={false} contentStyle={{ backgroundColor: 'transparent', border: 'none', boxShadow: 'none' }} />
                          <Legend />
                          <Line type="monotone" dataKey="active" name="Daily active users" stroke="#3b91edff" strokeWidth={3} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    {/* <div className="mt-3 text-body-secondary" style={{ fontSize: '0.85rem', flexShrink: 0 }}>
                      <strong>Calculation:</strong> This chart shows the number of unique users who logged in each day over the last 30 days. 
                      Each day's count represents distinct users (based on user_id) who had at least one login event on that day. 
                      Data is sourced from login activity records.
                    </div> */}
                  </CCardBody>
                </CCard>
              </CCol>

              {/* Total Users vs Recruiters - Square */}
              <CCol md={6}>
                <CCard style={{ borderRadius: '0px', width: '100%', height: '400px' }}>
                  <CCardHeader>
                    <strong>Total Users vs Recruiters</strong>
                  </CCardHeader>
                  <CCardBody style={{ height: 'calc(100% - 60px)', padding: '1rem', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ flex: '1 1 auto', minHeight: 0 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis allowDecimals={false} />
                          <Tooltip cursor={false} contentStyle={{ backgroundColor: 'transparent', border: 'none', boxShadow: 'none' }} />
                          <Legend />
                          <Bar dataKey="total" name="Total" fill="#3b91edff" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-3 d-flex gap-3 flex-wrap" style={{ flexShrink: 0 }}>
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

              {/* Roles - Square */}
              <CCol md={6}>
                <CCard style={{ borderRadius: '0px', width: '100%', height: '500px' }}>
                  <CCardHeader>
                    <strong>Roles (Admin / Recruiter / User)</strong>
                  </CCardHeader>
                  <CCardBody style={{ height: 'calc(100% - 60px)', padding: '1rem', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ flex: '1 1 auto', minHeight: 0 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Tooltip cursor={false} contentStyle={{ backgroundColor: 'transparent', border: 'none', boxShadow: 'none' }} />
                          <Legend />
                          <Pie
                            data={rolePieData}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={3}
                            label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(1)}%)`}
                            labelLine={false}
                          >
                            {rolePieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CCardBody>
                </CCard>
              </CCol>

              {/* Candidate Status Conversion Funnel - Square */}
              <CCol md={6}>
                <CCard style={{ borderRadius: '0px', width: '100%', height: '500px' }}>
                  <CCardHeader>
                    <strong>Candidate Status Conversion Funnel</strong>
                  </CCardHeader>
                  <CCardBody style={{ height: 'calc(100% - 60px)', padding: '1rem' }}>
                    {candidateFunnel.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={candidateFunnel} layout="vertical" margin={{ top: 10, right: 30, left: 80, bottom: 10 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="name" type="category" />
                          <Tooltip cursor={false} contentStyle={{ backgroundColor: 'transparent', border: 'none', boxShadow: 'none' }} />
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

              {/* Job Metrics - Bigger box, tiles same size */}
              {/* <CCol md={6}>
                <CCard style={{ borderRadius: '0px', width: '100%', height: '500px' }}>
                  <CCardHeader>
                    <strong>Job Metrics (Last 30 days)</strong>
                  </CCardHeader>
                  <CCardBody style={{ height: 'calc(100% - 60px)', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CRow className="g-3" style={{ width: '100%', maxWidth: '100%' }}>
                      <CCol sm={6}>
                        <CCard style={{ backgroundColor: '#dbeafe', border: 'none', height: '140px' }}>
                          <CCardBody className="text-center d-flex flex-column justify-content-center" style={{ height: '100%', padding: '0.75rem' }}>
                            <div style={{ fontSize: 28, fontWeight: 700, color: '#1e40af' }}>{jobMetrics.created}</div>
                            <div style={{ fontSize: 12, color: '#1e40af', fontWeight: 600 }}>Jobs Created</div>
                            <div style={{ fontSize: 11, color: '#3b82f6', marginTop: '4px' }}>
                              {jobMetrics.total > 0 ? `${((jobMetrics.created / jobMetrics.total) * 100).toFixed(1)}% of total` : '0%'}
                            </div>
                            <div style={{ fontSize: 10, color: '#60a5fa', marginTop: '2px' }}>
                              Last 30 days
                            </div>
                          </CCardBody>
                        </CCard>
                      </CCol>
                      <CCol sm={6}>
                        <CCard style={{ backgroundColor: '#d1fae5', border: 'none', height: '140px' }}>
                          <CCardBody className="text-center d-flex flex-column justify-content-center" style={{ height: '100%', padding: '0.75rem' }}>
                            <div style={{ fontSize: 28, fontWeight: 700, color: '#047857' }}>{jobMetrics.assigned}</div>
                            <div style={{ fontSize: 12, color: '#047857', fontWeight: 600 }}>Jobs Assigned</div>
                            <div style={{ fontSize: 11, color: '#10b981', marginTop: '4px' }}>
                              {jobMetrics.created > 0 ? `${((jobMetrics.assigned / jobMetrics.created) * 100).toFixed(1)}% assigned` : '0%'}
                            </div>
                            <div style={{ fontSize: 10, color: '#34d399', marginTop: '2px' }}>
                              From new jobs
                            </div>
                          </CCardBody>
                        </CCard>
                      </CCol>
                      <CCol sm={6}>
                        <CCard style={{ backgroundColor: '#fef3c7', border: 'none', height: '140px' }}>
                          <CCardBody className="text-center d-flex flex-column justify-content-center" style={{ height: '100%', padding: '0.75rem' }}>
                            <div style={{ fontSize: 28, fontWeight: 700, color: '#92400e' }}>{jobMetrics.open}</div>
                            <div style={{ fontSize: 12, color: '#92400e', fontWeight: 600 }}>Open Jobs</div>
                            <div style={{ fontSize: 11, color: '#d97706', marginTop: '4px' }}>
                              {jobMetrics.total > 0 ? `${((jobMetrics.open / jobMetrics.total) * 100).toFixed(1)}% of total` : '0%'}
                            </div>
                            <div style={{ fontSize: 10, color: '#fbbf24', marginTop: '2px' }}>
                              Currently active
                            </div>
                          </CCardBody>
                        </CCard>
                      </CCol>
                      <CCol sm={6}>
                        <CCard style={{ backgroundColor: '#fee2e2', border: 'none', height: '140px' }}>
                          <CCardBody className="text-center d-flex flex-column justify-content-center" style={{ height: '100%', padding: '0.75rem' }}>
                            <div style={{ fontSize: 28, fontWeight: 700, color: '#991b1b' }}>{jobMetrics.closed}</div>
                            <div style={{ fontSize: 12, color: '#991b1b', fontWeight: 600 }}>Closed Jobs</div>
                            <div style={{ fontSize: 11, color: '#dc2626', marginTop: '4px' }}>
                              {jobMetrics.total > 0 ? `${((jobMetrics.closed / jobMetrics.total) * 100).toFixed(1)}% of total` : '0%'}
                            </div>
                            <div style={{ fontSize: 10, color: '#f87171', marginTop: '2px' }}>
                              All time
                            </div>
                          </CCardBody>
                        </CCard>
                      </CCol>
                    </CRow>
                  </CCardBody>
                </CCard>
              </CCol> */}
              <CCol md={6}>
                <CCard style={{ borderRadius: '0px', width: '100%', height: '500px' }}>
                  <CCardHeader>
                    <strong>Job Metrics (Last 30 days)</strong>
                  </CCardHeader>
                  <CCardBody
                    style={{
                      height: 'calc(100% - 60px)',
                      padding: '1rem',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    {/* Flex container for internal cards */}
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap', // allow wrap on medium screens
                        gap: '1rem',
                        width: '100%',
                        justifyContent: 'space-between',
                      }}
                    >
                      {[
                        {
                          value: jobMetrics.created,
                          title: 'Jobs Created',
                          color: '#1e40af',
                          bgColor: '#dbeafe',
                          subText: jobMetrics.total > 0 ? `${((jobMetrics.created / jobMetrics.total) * 100).toFixed(1)}% of total` : '0%',
                          smallText: 'Last 30 days',
                        },
                        {
                          value: jobMetrics.assigned,
                          title: 'Jobs Assigned',
                          color: '#047857',
                          bgColor: '#d1fae5',
                          subText: jobMetrics.created > 0 ? `${((jobMetrics.assigned / jobMetrics.created) * 100).toFixed(1)}% assigned` : '0%',
                          smallText: 'From new jobs',
                        },
                        {
                          value: jobMetrics.open,
                          title: 'Open Jobs',
                          color: '#92400e',
                          bgColor: '#fef3c7',
                          subText: jobMetrics.total > 0 ? `${((jobMetrics.open / jobMetrics.total) * 100).toFixed(1)}% of total` : '0%',
                          smallText: 'Currently active',
                        },
                        {
                          value: jobMetrics.closed,
                          title: 'Closed Jobs',
                          color: '#991b1b',
                          bgColor: '#fee2e2',
                          subText: jobMetrics.total > 0 ? `${((jobMetrics.closed / jobMetrics.total) * 100).toFixed(1)}% of total` : '0%',
                          smallText: 'All time',
                        },
                      ].map((card, idx) => (
                        <div
                          key={idx}
                          style={{
                            flex: '1 1 calc(25% - 0.75rem)', // default: 4 in a row
                            minWidth: '120px', // prevent overflow
                            maxWidth: 'calc(50% - 0.75rem)', // for medium screens
                          }}
                          className="job-metrics-card"
                        >
                          <CCard style={{ backgroundColor: card.bgColor, border: 'none', height: '140px' }}>
                            <CCardBody
                              className="text-center d-flex flex-column justify-content-center"
                              style={{ height: '100%', padding: '0.75rem' }}
                            >
                              <div style={{ fontSize: 28, fontWeight: 700, color: card.color }}>{card.value}</div>
                              <div style={{ fontSize: 12, color: card.color, fontWeight: 600 }}>{card.title}</div>
                              <div style={{ fontSize: 11, color: card.color, marginTop: '4px' }}>{card.subText}</div>
                              <div style={{ fontSize: 10, color: card.color, marginTop: '2px' }}>{card.smallText}</div>
                            </CCardBody>
                          </CCard>
                        </div>
                      ))}
                    </div>
                  </CCardBody>
                </CCard>
              </CCol>


              {/* Recruiter Metrics - Smaller */}
              <CCol md={6}>
                <CCard style={{ borderRadius: '0px', width: '100%', height: '350px' }}>
                  <CCardHeader>
                    <strong>Recruiter Activity (Last 30 days)</strong>
                  </CCardHeader>
                  <CCardBody style={{ height: 'calc(100% - 60px)', padding: '1rem', overflowY: 'auto' }}>
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

              {/* Recent Status Changes - Smaller */}
              <CCol md={6}>
                <CCard style={{ borderRadius: '0px', width: '100%', height: '350px' }}>
                  <CCardHeader>
                    <strong>Recent Status Changes</strong>
                  </CCardHeader>
                  <CCardBody style={{ height: 'calc(100% - 60px)', padding: '1rem', overflowY: 'auto' }}>
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
          </React.Fragment>
        )}
      </CCol>
    </CRow>
  )
}

export default StatsSection
