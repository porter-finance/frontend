import React, { Suspense } from 'react'
import styled from 'styled-components'

import ReactTooltip from 'react-tooltip'

import { CookiesBanner } from '../components/common/CookiesBanner'
import { TopDisclaimer } from '../components/common/TopDisclaimer'
import { Footer } from '../components/layout/Footer'
import { Header } from '../components/layout/Header'
import Routes from '../components/navigation/Routes/Routes'
import Popups from '../components/popups/Popups'
import { InnerContainer } from '../components/pureStyledComponents/InnerContainer'
import { MainScroll } from '../components/pureStyledComponents/MainScroll'
import { MainWrapper } from '../components/pureStyledComponents/MainWrapper'
import Web3ReactManager from '../components/web3/Web3ReactManager'
import useShowCookies from '../hooks/useShowCookies'
import useShowTopWarning from '../hooks/useShowTopWarning'

const Inner = styled(InnerContainer)`
  margin-top: -85px;

  @media (max-width: ${({ theme }) => theme.themeBreakPoints.md}) {
    margin-top: -120px;
  }
`

const App: React.FC = () => {
  const { setShowCookiesBanner, showCookiesBanner } = useShowCookies()
  const { showTopWarning } = useShowTopWarning()

  return (
    <Suspense fallback={null}>
      <MainWrapper>
        <MainScroll>
          <Header />
          <Popups />
          <ReactTooltip
            className="customTooltip"
            delayHide={250}
            delayShow={50}
            effect="solid"
            textColor="#fff"
          />
          {showTopWarning && <TopDisclaimer />}
          <Inner className="fullPage">
            <Web3ReactManager>
              <Routes />
            </Web3ReactManager>
          </Inner>
          <Footer />
        </MainScroll>
        <CookiesBanner
          isBannerVisible={showCookiesBanner}
          onHide={() => {
            setShowCookiesBanner(false)
          }}
        />
      </MainWrapper>
    </Suspense>
  )
}

export default App
