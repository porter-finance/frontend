import React from 'react'

import { useBondsPortfolio } from '../../hooks/useBondsPortfolio'
import { BondOverviewCommon } from '../Bonds'

const Portfolio = () => {
  const allBonds = useBondsPortfolio()

  return <BondOverviewCommon allBonds={allBonds} title="Portfolio" />
}

export default Portfolio
