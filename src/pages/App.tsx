import React, { Suspense } from 'react'
import styled from 'styled-components'

import * as Sentry from '@sentry/react'
import { BrowserTracing } from '@sentry/tracing'
import ReactTooltip from 'react-tooltip'

import ScrollToTop from '../components/ScrollToTop'
import { TopDisclaimer } from '../components/common/TopDisclaimer'
import { Footer } from '../components/layout/Footer'
import { Header } from '../components/layout/Header'
import Routes from '../components/navigation/Routes/Routes'
import Popups from '../components/popups/Popups'
import { InnerContainer } from '../components/pureStyledComponents/InnerContainer'
import { MainWrapper } from '../components/pureStyledComponents/MainWrapper'
import Web3ReactManager from '../components/web3/Web3ReactManager'
import useShowTopWarning from '../hooks/useShowTopWarning'

export const InnerApp = styled(InnerContainer)`
  margin-top: -100px;

  @media (max-width: ${({ theme }) => theme.themeBreakPoints.md}) {
    margin-top: -130px;
  }
`

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [new BrowserTracing()],

  tracesSampleRate: 0.1,
})

const App: React.FC = () => {
  const { showTopWarning } = useShowTopWarning()

  return (
    <Suspense fallback={null}>
      <MainWrapper>
        <ScrollToTop />
        <Header />
        <Popups />
        <ReactTooltip
          className="customTooltip"
          delayHide={500}
          delayShow={50}
          delayUpdate={500}
          effect="solid"
          textColor="#fff"
        />
        {showTopWarning && <TopDisclaimer />}
        <InnerApp className="fullPage">
          <Web3ReactManager>
            <Routes />
          </Web3ReactManager>
        </InnerApp>
        <Footer />
      </MainWrapper>
    </Suspense>
  )
}

export default App
