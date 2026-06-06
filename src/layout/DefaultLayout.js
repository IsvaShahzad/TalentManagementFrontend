import React from 'react'
import { AppContent, AppSidebar, AppFooter } from '../components/index'

const DefaultLayout = () => {
  return (
    <div className="layout-root">
      <AppSidebar />
      <div className="wrapper d-flex flex-column flex-grow-1 layout-main">
        <div className="body flex-grow-1">
          <AppContent />
        </div>
        <AppFooter />
      </div>
    </div>
  )
}

export default DefaultLayout
