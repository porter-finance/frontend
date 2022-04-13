import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

import Auction from '../../../pages/Auction'
import BondDetail from '../../../pages/BondDetail'
import CreateBond from '../../../pages/CreateBond'
import Offerings from '../../../pages/Offerings'
import Portfolio from '../../../pages/Portfolio'
import Products from '../../../pages/Products'
import { BaseCard } from '../../pureStyledComponents/BaseCard'

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route element={<Auction />} path="/offerings/:auctionId/:chainId" />
      <Route element={<Offerings />} path="/offerings" />
      <Route element={<Products />} path="/products" />
      <Route element={<CreateBond />} path="/offerings/create" />
      <Route element={<BondDetail />} path="/products/:bondId" />
      <Route element={<Portfolio />} path="/portfolio" />
      <Route element={<Navigate replace to="/offerings" />} path="/start" />
      <Route element={<Navigate replace to="/offerings" />} path="/auctions" />
      <Route element={<Navigate replace to="/offerings" />} path="/" />
      <Route element={<BaseCard>Page not found Error 404</BaseCard>} path="*" />
    </Routes>
  )
}

export default AppRoutes
