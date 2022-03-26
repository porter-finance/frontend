import React from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import styled from 'styled-components'

import ReactTooltip from 'react-tooltip'

import Auction from '../../../pages/Auction'
import Bond from '../../../pages/Bond'
import CreateBond from '../../../pages/Bond'
import BondsOverview from '../../../pages/Bonds'
import { Landing } from '../../../pages/Landing'
import { Licenses } from '../../../pages/Licenses'
import Overview from '../../../pages/Overview'
import Portfolio from '../../../pages/Portfolio'
import { Terms } from '../../../pages/Terms'
import DarkModeQueryParamReader from '../../../theme/DarkModeQueryParamReader'
import { CookiesBanner } from '../../common/CookiesBanner'
import { TopDisclaimer } from '../../common/TopDisclaimer'
import { Footer } from '../../layout/Footer'
import { Header } from '../../layout/Header'
import Popups from '../../popups/Popups'
import { BaseCard } from '../../pureStyledComponents/BaseCard'
import { InnerContainer } from '../../pureStyledComponents/InnerContainer'
import { MainScroll } from '../../pureStyledComponents/MainScroll'
import { MainWrapper } from '../../pureStyledComponents/MainWrapper'
import Web3ReactManager from '../../web3/Web3ReactManager'

const Inner = styled(InnerContainer)`
  padding-top: 22px;
`

const AppRoutes: React.FC = () => {
  const { pathname } = useLocation()
  const [showCookiesBanner, setShowCookiesBanner] = React.useState(false)
  const [showTopWarning, setShowTopWarning] = React.useState(false)

  const tokenSupport = (bothTokensSupported: boolean) => {
    setShowTopWarning(bothTokensSupported)
  }

  React.useEffect(() => {
    if (!pathname.includes('/auction')) {
      setShowTopWarning(false)
    }
  }, [pathname])

  return (
    <MainWrapper>
      <Header />
      <MainScroll>
        <Popups />
        <ReactTooltip
          arrowColor="#001429"
          backgroundColor="#001429"
          border
          borderColor="#174172"
          className="customTooltip"
          delayHide={250}
          delayShow={50}
          effect="solid"
          textColor="#fff"
        />
        {showTopWarning && <TopDisclaimer />}
        <span id="topAnchor" />
        <Inner>
          <DarkModeQueryParamReader />
          <Web3ReactManager>
            <Routes>
              <Route element={<Auction showTokenWarning={tokenSupport} />} path="/auction" />
              <Route
                element={<Auction showTokenWarning={tokenSupport} />}
                path="/auction/:auctionId/:chainId"
              />
              <Route element={<Overview />} path="/overview" />
              <Route element={<Bond />} path="/bond/:bondId" />
              <Route element={<CreateBond />} path="/bonds/create" />
              <Route element={<BondsOverview />} path="/bonds" />
              <Route element={<Portfolio />} path="/portfolio" />
              <Route element={<Landing />} path="/start" />
              <Route element={<Terms />} path="/terms-and-conditions" />
              <Route element={<Licenses />} path="/licenses" />
              <Route element={<Navigate to="/start" />} path="/" />
              <Route element={<BaseCard>Page not found Error 404</BaseCard>} path="*" />
            </Routes>
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
  )
}

export default AppRoutes
