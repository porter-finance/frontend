import React, { Suspense } from 'react'
import styled from 'styled-components'

import ReactTooltip from 'react-tooltip'

import ChainWarning from '../components/ChainWarning'
import ScrollToTop from '../components/ScrollToTop'
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

const App: React.FC = () => (
  <Suspense fallback={null}>
    <MainWrapper>
      <ScrollToTop />
      <ChainWarning />
      <Header />
      <ReactTooltip
        className="customTooltip"
        delayHide={500}
        delayShow={50}
        delayUpdate={500}
        effect="solid"
        textColor="#fff"
      />
      <InnerApp className="fullPage">
        <Web3ReactManager>
          <Routes />
        </Web3ReactManager>
      </InnerApp>
      <Footer />
    </MainWrapper>
  </Suspense>
)

export default App
