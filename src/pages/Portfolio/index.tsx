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

const GlobalStyle = createGlobalStyle`
  .siteHeader {
    background: #262728;
  }
`

const columns = [
  {
    Header: 'Issuer',
    accessor: 'issuer',
    align: 'flex-start',
    show: true,
    style: { height: '100%', justifyContent: 'center' },
    filter: 'searchInTags',
  },
  {
    Header: 'Amount',
    accessor: 'amount',
    align: 'flex-start',
    show: true,
    style: {},
    filter: 'searchInTags',
  },
  {
    Header: 'Fixed APY',
    accessor: 'fixedAPY',
    align: 'flex-start',
    show: true,
    style: {},
    filter: 'searchInTags',
  },
  {
    Header: 'Maturity Date',
    accessor: 'maturityDate',
    align: 'flex-start',
    show: true,
    style: {},
    filter: 'searchInTags',
  },
  {
    Header: 'Value at Maturity',
    accessor: 'maturityValue',
    align: 'flex-start',
    show: true,
    style: {},
    filter: 'searchInTags',
  },
  {
    Header: 'Status',
    accessor: 'status',
    align: 'flex-start',
    show: true,
    style: {},
    filter: 'searchInTags',
  },
  {
    Header: '',
    accessor: 'url',
    align: '',
    show: false,
    style: {},
  },
]

const Portfolio = () => {
  const data = useBondsPortfolio()
  const tableData = []

  useSetNoDefaultNetworkId()

  data?.forEach((bond) => {
    tableData.push({
      id: bond.id,
      search: JSON.stringify(bond),
      issuer: (
        <div className="flex flex-row items-center space-x-4">
          <div className="flex">
            <TokenLogo
              size="30px"
              square
              token={{
                address: bond?.collateralToken,
                symbol: bond?.symbol,
              }}
            />
          </div>
          <div className="flex flex-col text-[#EEEFEB] text-lg">
            <div className="flex items-center space-x-2 capitalize">
              <span>{bond?.name.toLowerCase()} Bond</span>
              {bond?.type === 'convert' ? <ConvertIcon width={15} /> : <AuctionsIcon width={15} />}
            </div>
            <p className="text-[#9F9F9F] text-sm uppercase">{bond?.symbol}</p>
          </div>
        </div>
      ),
      // TODO: This shuold return how many this user owns tho NOT max supply
      amount: `${bond?.maxSupply ? abbreviation(formatUnits(bond?.maxSupply, 18)) : 0}`,
      // TODO: graphql should return payment token symbol
      maturityValue: `1 ${bond.paymentToken}`,
      // TODO: make this use auction.clearing
      fixedAPY: calculateInterestRate(10, bond.maturityDate),
      status:
        new Date() > new Date(bond.maturityDate * 1000) ? (
          <ActiveStatusPill disabled dot={false} title="Matured" />
        ) : (
          <ActiveStatusPill dot={false} title="Active" />
        ),
      maturityDate: (
        <span className="uppercase">
          {dayjs(bond.maturityDate * 1000)
            .utc()
            .format('DD MMM YYYY')}
        </span>
      ),

      url: `/products/${bond.id}`,
    })
  })

  const isLoading = React.useMemo(() => data === undefined || data === null, [data])

  return (
    <>
      <GlobalStyle />
      <Table
        columns={columns}
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
        loading={isLoading}
        title="Portfolio"
      />
    </>
  )
}

export default Portfolio
