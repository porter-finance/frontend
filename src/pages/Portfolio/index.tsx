import React from 'react'
import { createGlobalStyle } from 'styled-components'

import { ReactComponent as ConnectIcon } from '../../assets/svg/connect.svg'
import { ReactComponent as DividerIcon } from '../../assets/svg/divider.svg'
import { ReactComponent as WalletIcon } from '../../assets/svg/wallet.svg'
import Table from '../../components/auctions/Table'
import { useActiveWeb3React } from '../../hooks'
import { useBondsPortfolio } from '../../hooks/useBondsPortfolio'
import { useWalletModalToggle } from '../../state/application/hooks'
import { useSetNoDefaultNetworkId } from '../../state/orderPlacement/hooks'
import { ConvertButtonOutline, SimpleButtonOutline } from '../Auction'
import { columns, createTable } from '../Products'

const GlobalStyle = createGlobalStyle`
  .siteHeader {
    background: #262728;
  }
`

const Portfolio = () => {
  const { account } = useActiveWeb3React()
  const toggleWalletModal = useWalletModalToggle()

  const { data, loading } = useBondsPortfolio()
  const tableData = data ? createTable(data) : []

  const emptyActionText = account ? 'Go to offerings' : 'Connect wallet'
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
        emptyActionClick={toggleWalletModal}
        emptyActionText={emptyActionText}
        emptyDescription={emptyDescription}
        emptyLogo={emptyLogo}
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
