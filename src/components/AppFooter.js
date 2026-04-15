import React from 'react'
import { CFooter } from '@coreui/react'

const AppFooter = () => {
  return (
    <CFooter className="px-4 py-2" style={{ fontSize: '0.95rem', color: '#6b7280' }}>
      <div>
      </div>
      <div className="ms-auto">
        <span>Powered by NetroxIT</span>
      </div>
    </CFooter>
  )
}

export default React.memo(AppFooter)
