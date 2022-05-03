import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createGlobalStyle } from 'styled-components'

import { ReactComponent as ConnectIcon } from '../../assets/svg/connect.svg'
import { ReactComponent as DividerIcon } from '../../assets/svg/divider.svg'
import { ReactComponent as WalletIcon } from '../../assets/svg/wallet.svg'
import Table from '../../components/auctions/Table'
import { useActiveWeb3React } from '../../hooks'
import { useBondsPortfolio } from '../../hooks/useBondsPortfolio'
import { useWalletModalToggle } from '../../state/application/hooks'
import { useSetNoDefaultNetworkId } from '../../state/orderPlacement/hooks'
import { AllButton, ConvertButtonOutline, SimpleButtonOutline } from '../Auction'
import { columns, createTable } from '../Products'

const GlobalStyle = createGlobalStyle`
  .siteHeader {
    background: #262728;
  }
`

export enum TABLE_FILTERS {
  ALL = '',
  CONVERT = 'convert',
  SIMPLE = 'simple',
  AUCTION = 'auction',
  OTC = 'otc',
}

const Portfolio = () => {
  const { account } = useActiveWeb3React()
  const toggleWalletModal = useWalletModalToggle()
  const navigate = useNavigate()
  const [tableFilter, setTableFilter] = useState<TABLE_FILTERS>(TABLE_FILTERS.ALL)

  const { data, loading } = useBondsPortfolio()
  const tableData = data
    ? createTable(data).filter(({ type }) => (tableFilter ? type === tableFilter : true))
    : []

  const emptyActionText = account ? 'Go to offerings' : 'Connect wallet'
  const emptyActionClick = account ? () => navigate('/offerings') : toggleWalletModal
  const emptyDescription = account
    ? 'Your portfolio is empty'
    : 'Connect your wallet to view your portfolio'
  const emptyLogo = account ? (
    <WalletIcon height={49.5} width={51} />
  ) : (
    <ConnectIcon height={49.5} width={51} />
  )

  useSetNoDefaultNetworkId()

  return (
    <>
      <GlobalStyle />
      <Table
        columns={columns(true)}
        data={tableData}
        emptyActionClick={emptyActionClick}
        emptyActionText={emptyActionText}
        emptyDescription={emptyDescription}
        emptyLogo={emptyLogo}
        legendIcons={
          <>
            <AllButton
              active={tableFilter === TABLE_FILTERS.ALL}
              onClick={() => setTableFilter(TABLE_FILTERS.ALL)}
            />
            <DividerIcon />
            <ConvertButtonOutline
              active={tableFilter === TABLE_FILTERS.CONVERT}
              onClick={() => setTableFilter(TABLE_FILTERS.CONVERT)}
            />
            <SimpleButtonOutline
              active={tableFilter === TABLE_FILTERS.SIMPLE}
              onClick={() => setTableFilter(TABLE_FILTERS.SIMPLE)}
            />
          </>
        }
        loading={loading}
        name="products"
        title="Portfolio"
      />
    </>
  )
}

export default Portfolio
