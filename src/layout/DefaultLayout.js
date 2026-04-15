import React from 'react'
import { AppContent, AppSidebar, AppFooter } from '../components/index'

const DefaultLayout = () => {

  return (
    <div>
      <AppSidebar />
      <div className="wrapper d-flex flex-column layout-main">
        <div className="body flex-grow-1">
          <AppContent />
        </div>
        <AppFooter />
      </div>
    </div>
  )
}

export default DefaultLayout
