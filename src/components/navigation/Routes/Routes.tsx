import React from 'react'
import { Route, Routes } from 'react-router-dom'

import Auction from '../../../pages/Auction'
import BondDetail from '../../../pages/BondDetail'
import BondsOverview from '../../../pages/Bonds'
import CreateBond from '../../../pages/CreateBond'
import { Landing } from '../../../pages/Landing'
import { Licenses } from '../../../pages/Licenses'
import Overview from '../../../pages/Overview'
import Portfolio from '../../../pages/Portfolio'
import { Terms } from '../../../pages/Terms'
import { BaseCard } from '../../pureStyledComponents/BaseCard'

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route element={<Auction />} path="/auctions/:auctionId/:chainId" />
      <Route element={<Overview />} path="/auctions" />
      <Route element={<BondsOverview />} path="/bonds" />
      <Route element={<CreateBond />} path="/bonds/create" />
      <Route element={<BondDetail />} path="/bonds/:bondId" />
      <Route element={<Portfolio />} path="/portfolio" />
      <Route element={<Landing />} path="/start" />
      <Route element={<Terms />} path="/terms-and-conditions" />
      <Route element={<Licenses />} path="/licenses" />
      <Route element={<Landing />} path="/" />
      <Route element={<BaseCard>Page not found Error 404</BaseCard>} path="*" />
    </Routes>
  )
}

export default AppRoutes
