import React, { Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { CSpinner } from '@coreui/react'
import AppPage from './AppPage'

// routes config
import routes from '../routes'

const AppContent = () => {
  return (
    <AppPage>
      <Suspense fallback={<CSpinner color="primary" />}>
        <Routes>
          {routes.map((route, idx) => {
            return (
              route.element && (
                <Route
                  key={idx}
                  path={route.path}
                  exact={route.exact}
                  name={route.name}
                  element={<route.element />}
                />
              )
            )
          })}
          <Route path="/" element={<Navigate to="dashboard" replace />} />
          <Route path="/" element={<Navigate to="setting" replace />} />

        </Routes>
      </Suspense>
    </AppPage>
  )
}

export default React.memo(AppContent)
