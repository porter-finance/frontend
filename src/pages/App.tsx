import React, { Suspense } from 'react'
import { BrowserRouter, HashRouter } from 'react-router-dom'

import Routes from '../components/navigation/Routes/Routes'
import { PUBLIC_URL } from '../constants/config'

const Router: React.ComponentType = PUBLIC_URL === '.' ? HashRouter : BrowserRouter

const App: React.FC = () => {
  return (
    <Suspense fallback={null}>
      <Router>
        <Routes />
      </Router>
    </Suspense>
  )
}

export default App
