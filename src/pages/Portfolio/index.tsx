import React from 'react'
import { createGlobalStyle } from 'styled-components'

import { formatUnits } from '@ethersproject/units'
import dayjs from 'dayjs'

import { ReactComponent as AuctionsIcon } from '../../assets/svg/auctions.svg'
import { ReactComponent as ConvertIcon } from '../../assets/svg/convert.svg'
import { ReactComponent as DividerIcon } from '../../assets/svg/divider.svg'
import { ReactComponent as WalletIcon } from '../../assets/svg/wallet.svg'
import { ActiveStatusPill } from '../../components/auction/OrderbookTable'
import Table from '../../components/auctions/Table'
import { calculateInterestRate } from '../../components/form/InterestRateInputPanel'
import TokenLogo from '../../components/token/TokenLogo'
import { useBondsPortfolio } from '../../hooks/useBondsPortfolio'
import { useSetNoDefaultNetworkId } from '../../state/orderPlacement/hooks'
import { abbreviation } from '../../utils/numeral'
import { ConvertButtonOutline, SimpleButtonOutline } from '../Auction'
import { columns, createTable } from '../Products'

const GlobalStyle = createGlobalStyle`
  .siteHeader {
    background: #262728;
  }
`

const Portfolio = () => {
  const { data, loading } = useBondsPortfolio()
  const tableData = data ? createTable(data) : []

  useSetNoDefaultNetworkId()

  return (
    <>
      <GlobalStyle />
      <Table
        columns={columns(true)}
        data={tableData}
        emptyActionText="Go to offerings"
        emptyDescription="Your portfolio is empty"
        emptyLogo={<WalletIcon height={49.5} width={51} />}
        legendIcons={
          <>
            <div className="rounded-full bg-white px-5 py-1.5 text-black text-xs uppercase">
              All
            </div>
            <DividerIcon />
            <ConvertButtonOutline />
            <SimpleButtonOutline />
          </>
        }
        loading={loading}
        title="Portfolio"
      />
    </>
  )
}

export default Portfolio
