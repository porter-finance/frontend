import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

import SelectProduct from '@/components/ProductCreate/SelectProduct'
import SetupProduct from '@/components/ProductCreate/SetupProduct'
import { BaseCard } from '@/components/pureStyledComponents/BaseCard'
import Auction from '@/pages/Auction'
import BondDetail from '@/pages/BondDetail'
import Bonds from '@/pages/Bonds'
import CreateBond from '@/pages/CreateBond'
import Offerings from '@/pages/Offerings'
import Portfolio from '@/pages/Portfolio'

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route element={<Auction />} path="/offerings/:auctionId" />
      <Route element={<Offerings />} path="/offerings" />
      <Route element={<Bonds />} path="/bonds" />
      <Route element={<CreateBond />} path="/offerings/create" />
      <Route element={<SelectProduct />} path="/bonds/create" />
      <Route element={<SetupProduct />} path="/bonds/create/convertible" />
      <Route element={<SetupProduct />} path="/bonds/create/simple" />
      <Route element={<BondDetail />} path="/bonds/:bondId" />
      <Route element={<Portfolio />} path="/portfolio" />
      <Route element={<Navigate replace to="/offerings" />} path="/start" />
      <Route element={<Navigate replace to="/offerings" />} path="/auctions" />
      <Route element={<Navigate replace to="/offerings" />} path="/" />
      <Route element={<BaseCard>Page not found Error 404</BaseCard>} path="*" />
    </Routes>
  )
}

export default AppRoutes
