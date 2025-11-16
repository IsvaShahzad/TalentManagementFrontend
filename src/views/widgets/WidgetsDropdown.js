import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import {
  CRow,
  CCol,
  CDropdown,
  CDropdownMenu,
  CDropdownItem,
  CDropdownToggle,
  CWidgetStatsA,
} from '@coreui/react'
import { getStyle } from '@coreui/utils'
import { CChartBar, CChartLine } from '@coreui/react-chartjs'
import CIcon from '@coreui/icons-react'
import { cilArrowBottom, cilArrowTop, cilOptions } from '@coreui/icons'
import './WidgetStyles.css'
import { total_Candidates, total_Recruiters, total_Users } from '../../api/api'
import { useNavigate } from 'react-router-dom'

const WidgetsDropdown = (props) => {


  const [totalUsers, setTotalUsers] = useState(0)
  const [totalRecs, setTotalRecs] = useState(0)
  const [totalCands, setTotalCands] = useState(0)

  const widgetChartRef1 = useRef(null)
  const widgetChartRef2 = useRef(null)
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.addEventListener('ColorSchemeChange', () => {
      if (widgetChartRef1.current) {
        setTimeout(() => {
          widgetChartRef1.current.data.datasets[0].pointBackgroundColor = getStyle('--cui-primary')
          widgetChartRef1.current.update()
        })
      }

      if (widgetChartRef2.current) {
        setTimeout(() => {
          widgetChartRef2.current.data.datasets[0].pointBackgroundColor = getStyle('--cui-info')
          widgetChartRef2.current.update()
        })
      }
    })
  }, [widgetChartRef1, widgetChartRef2])



  useEffect(() => {
    // Fetch total users from API
    const fetchTotalUsers = async () => {
      try {
        const response = await total_Users()
        setTotalUsers(response)
      } catch (error) {
        console.error('Error fetching total users:', error)
      }
    }
    const fetchTotalRecs = async () => {
      try {
        const response = await total_Recruiters()
        setTotalRecs(response)
      } catch (error) {
        console.error('Error fetching total users:', error)
      }
    }
    const fetchTotalCands = async () => {
      try {
        const response = await total_Candidates()
        setTotalCands(response)
      } catch (error) {
        console.error('Error fetching total users:', error)
      }
    }


    fetchTotalUsers()
    fetchTotalCands()
    fetchTotalRecs()
  }, [])
  return (
    <CRow className={props.className} xs={{ gutter: 4 }}>
      {/* Total Users */}
      <CCol sm={6} xl={4} xxl={3}>
        <CWidgetStatsA
          className="rounded-4 shadow-lg gradient-primary hover-elevate"
          value={
            <>
              {totalUsers.toLocaleString()}{' '}
              {/*  <span className="fs-6 fw-normal">
                (+5.2% <CIcon icon={cilArrowTop} />)
              </span>*/}
            </>
          }
          title="Total Users"

          action={
            <CDropdown alignment="end">
              <CDropdownToggle color="transparent" caret={false} className="text-white p-0">
                <CIcon icon={cilOptions} />
              </CDropdownToggle>
              <CDropdownMenu>
                <CDropdownItem onClick={() => navigate('/users')}>View All Users</CDropdownItem>

              </CDropdownMenu>
            </CDropdown>
          }

          chart={
            <CChartLine
              ref={widgetChartRef1}
              className="mt-3 mx-3"
              style={{ height: '70px' }}
              data={{
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
                datasets: [
                  {
                    label: 'User Growth',
                    backgroundColor: 'transparent',
                    borderColor: 'rgba(255,255,255,.55)',
                    pointBackgroundColor: getStyle('--cui-primary'),
                    data: [300, 420, 550, 670, 850, 980, 1254, totalUsers],
                  },
                ],
              }}
              options={{
                plugins: { legend: { display: false } },
                maintainAspectRatio: false,
                scales: { x: { display: false }, y: { display: false } },
                elements: { line: { borderWidth: 1, tension: 0.4 }, point: { radius: 3 } },
              }}
            />
          }
        />
      </CCol>

      {/* Active Jobs */}
      <CCol sm={6} xl={4} xxl={3}>
        <CWidgetStatsA
          className="rounded-4 shadow-lg gradient-info hover-elevate"
          value={
            <>
              87{' '}
              <span className="fs-6 fw-normal">
                (+12.1% <CIcon icon={cilArrowTop} />)
              </span>
            </>
          }
          title="Active Jobs"
          chart={
            <CChartLine
              ref={widgetChartRef2}
              className="mt-3 mx-3"
              style={{ height: '70px' }}
              data={{
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
                datasets: [
                  {
                    label: 'Active Jobs',
                    backgroundColor: 'transparent',
                    borderColor: 'rgba(255,255,255,.55)',
                    pointBackgroundColor: getStyle('--cui-info'),
                    data: [60, 70, 72, 75, 80, 83, 87],
                  },
                ],
              }}
              options={{
                plugins: { legend: { display: false } },
                maintainAspectRatio: false,
                scales: { x: { display: false }, y: { display: false } },
                elements: { line: { borderWidth: 1 }, point: { radius: 3 } },
              }}
            />
          }
        />
      </CCol>

      {/* Total Recruiters */}
      <CCol sm={6} xl={4} xxl={3}>
        <CWidgetStatsA
          className="rounded-4 shadow-lg gradient-warning hover-elevate"
          value={
            <>
              {totalRecs.toLocaleString()}{' '}
              {/* <span className="fs-6 fw-normal">
                (+8.3% <CIcon icon={cilArrowTop} />)
              </span>*/}
            </>
          }
          title="Total Recruiters"

          action={
            <CDropdown alignment="end">
              <CDropdownToggle color="transparent" caret={false} className="text-white p-0">
                <CIcon icon={cilOptions} />
              </CDropdownToggle>
              <CDropdownMenu>
                <CDropdownItem onClick={() => navigate('/recruiters')}>View All Recruiters</CDropdownItem>
                {/* <CDropdownItem>Export Report</CDropdownItem>* */}
              </CDropdownMenu>
            </CDropdown>
          }


          chart={
            <CChartLine
              className="mt-3"
              style={{ height: '70px' }}
              data={{
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
                datasets: [
                  {
                    label: 'Recruiters',
                    backgroundColor: 'rgba(255,255,255,.25)',
                    borderColor: 'rgba(255,255,255,.55)',
                    data: [20, 22, 25, 27, 29, 30, 32, totalRecs],
                    fill: true,
                  },
                ],
              }}
              options={{
                plugins: { legend: { display: false } },
                maintainAspectRatio: false,
                scales: { x: { display: false }, y: { display: false } },
                elements: { line: { borderWidth: 2, tension: 0.4 }, point: { radius: 0 } },
              }}
            />
          }
        />
      </CCol>

      {/* Placements Closed */}
      <CCol sm={6} xl={4} xxl={3}>
        <CWidgetStatsA
          className="rounded-4 shadow-lg gradient-danger hover-elevate"
          value={
            <>
              {totalCands.toLocaleString()}{' '}
              {/*  <span className="fs-6 fw-normal">
                (-3.6% <CIcon icon={cilArrowBottom} />)
              </span>*/}
            </>
          }
          title="Active Candidates"


          action={
            <CDropdown alignment="end">
              <CDropdownToggle color="transparent" caret={false} className="text-white p-0">
                <CIcon icon={cilOptions} />
              </CDropdownToggle>
              <CDropdownMenu>
                <CDropdownItem onClick={() => navigate('/candidates')}>View All Recruiters</CDropdownItem>

              </CDropdownMenu>
            </CDropdown>
          }

          chart={
            <CChartBar
              className="mt-3 mx-3"
              style={{ height: '70px' }}
              data={{
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
                datasets: [
                  {
                    label: 'Placements',
                    backgroundColor: 'rgba(255,255,255,.3)',
                    borderColor: 'rgba(255,255,255,.55)',
                    data: [40, 42, 50, 55, 60, 62, 58, totalCands],
                  },
                ],
              }}
              options={{
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { x: { display: false }, y: { display: false } },
              }}
            />
          }
        />
      </CCol>
    </CRow>
  )
}

WidgetsDropdown.propTypes = {
  className: PropTypes.string,
  withCharts: PropTypes.bool,
}

export default WidgetsDropdown
