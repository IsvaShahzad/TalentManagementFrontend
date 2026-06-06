import React from 'react'
import { CContainer } from '@coreui/react'

/** Shared full-width page shell for dashboard and protected routes. */
const AppPage = ({ children, className = '' }) => (
  <CContainer fluid className={`main-content-container ${className}`.trim()}>
    {children}
  </CContainer>
)

export default React.memo(AppPage)
