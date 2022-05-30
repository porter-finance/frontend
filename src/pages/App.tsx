import React, { Suspense } from 'react'
import styled from 'styled-components'

import * as Sentry from '@sentry/react'
import { BrowserTracing } from '@sentry/tracing'

import ChainWarning from '../components/ChainWarning'
import ScrollToTop from '../components/ScrollToTop'
import TermsModal from '../components/TermsModal'
import { ErrorBoundaryWithFallback } from '../components/common/ErrorAndReload'
import { Footer } from '../components/layout/Footer'
import { Header } from '../components/layout/Header'
import Routes from '../components/navigation/Routes/Routes'
import { InnerContainer } from '../components/pureStyledComponents/InnerContainer'
import { MainWrapper } from '../components/pureStyledComponents/MainWrapper'
import Web3ReactManager from '../components/web3/Web3ReactManager'

export const InnerApp = styled(InnerContainer)`
  margin-top: -100px;

  @media (max-width: ${({ theme }) => theme.themeBreakPoints.md}) {
    margin-top: -130px;
  }
`
Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  integrations: [new BrowserTracing()],

  tracesSampleRate: 1,
})

const App: React.FC = () => (
  <Suspense fallback={null}>
    <MainWrapper>
      <ScrollToTop />
      <ChainWarning />
      <TermsModal />
      <Header />
      <ErrorBoundaryWithFallback>
        <InnerApp className="fullPage">
          <Web3ReactManager>
            <Routes />
          </Web3ReactManager>
        </InnerApp>
      </ErrorBoundaryWithFallback>
      <Footer />
    </MainWrapper>
  </Suspense>
)

export default App
