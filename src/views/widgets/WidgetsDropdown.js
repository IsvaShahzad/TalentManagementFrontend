import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { CRow, CCol } from '@coreui/react'
import { total_Candidates, total_Recruiters, total_Users } from '../../api/api'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react'

const WidgetsDropdown = ({ className }) => {
  const [totalUsers, setTotalUsers] = useState(0)
  const [totalRecs, setTotalRecs] = useState(0)
  const [totalCands, setTotalCands] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const users = await total_Users()
        const recs = await total_Recruiters()
        const cands = await total_Candidates()
        setTotalUsers(users)
        setTotalRecs(recs)
        setTotalCands(cands)
      } catch (err) {
        console.error(err)
      }
    }
    fetchData()
  }, [])

  const widgetData = [
    { title: 'Total Users', total: totalUsers, trend: 'up', link: '/users' },
    { title: 'Active Jobs', total: 87, trend: 'down', link: '/jobs' },
    { title: 'Total Recruiters', total: totalRecs, trend: 'up', link: '/recruiters' },
    { title: 'Active Candidates', total: totalCands, trend: 'down', link: '/candidates' },
  ]

  return (
    <CRow className={className} xs={{ gutter: 3 }}>
      {widgetData.map((widget, index) => (
        <CCol key={index} xs={12} sm={6} md={4} xl={3}>
          <div
            style={{
              borderRadius: '0.25rem',
              border: '1px solid #d1d5db', // light grey border
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
            {/* Card content */}
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

            {/* View More strip */}
            <div
              onClick={() => navigate(widget.link)}
              style={{
                backgroundColor: '#2759a7',
                color: '#fff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.4rem 0.8rem',
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: '0.8rem',
                fontFamily: 'Inter, sans-serif',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1f477d'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#2759a7'}
            >
              <span>View More</span>
              <ArrowRight size={14} color="#fff" />
            </div>
          </div>
        </CCol>
      ))}
    </CRow>
  )
}

WidgetsDropdown.propTypes = {
  className: PropTypes.string,
}

export default WidgetsDropdown
