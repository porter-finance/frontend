import React, { useState } from 'react'
import { createGlobalStyle } from 'styled-components'

import dayjs from 'dayjs'

import { ReactComponent as AuctionsIcon } from '../../assets/svg/auctions.svg'
import { ReactComponent as DividerIcon } from '../../assets/svg/divider.svg'
import { ReactComponent as OTCIcon } from '../../assets/svg/otc.svg'
import { ActiveStatusPill } from '../../components/auction/OrderbookTable'
import Table from '../../components/auctions/Table'
import { ErrorBoundaryWithFallback } from '../../components/common/ErrorAndReload'
import { calculateInterestRate } from '../../components/form/InterestRateInputPanel'
import TokenLogo from '../../components/token/TokenLogo'
import { useAuctions } from '../../hooks/useAuction'
import { useSetNoDefaultNetworkId } from '../../state/orderPlacement/hooks'
import { AllButton, AuctionButtonOutline, OTCButtonOutline } from '../Auction'
import { TABLE_FILTERS } from '../Portfolio'

const GlobalStyle = createGlobalStyle`
  .siteHeader {
    background: #404eed !important;
  }
`

const columns = [
  {
    Header: 'Offering',
    accessor: 'offering',
    align: 'flex-start',
    style: { height: '100%', justifyContent: 'center' },
    filter: 'searchInTags',
  },
  {
    Header: 'Current Price',
    accessor: 'currentPrice',
    align: 'flex-start',
    style: {},
    filter: 'searchInTags',
  },
  {
    Header: 'Value at maturity',
    accessor: 'maturityValue',
    tooltip:
      'This is the amount your bonds are redeemable for at the maturity date assuming a default does not occur.',
    align: 'flex-start',
    style: {},
    filter: 'searchInTags',
  },
  {
    Header: 'End Date',
    accessor: 'endDate',
    align: 'flex-start',
    style: {},
    filter: 'searchInTags',
  },
  {
    Header: 'Fixed APR',
    tooltip: 'This APR is calculated using the current price of the bond offering.',
    accessor: 'fixedAPR',
    align: 'flex-start',
    style: {},
    filter: 'searchInTags',
  },
  {
    Header: 'Status',
    accessor: 'status',
    align: 'flex-start',
    style: {},
    filter: 'searchInTags',
  },
]

const Offerings = () => {
  const { data: allAuctions, loading } = useAuctions()
  const [tableFilter, setTableFilter] = useState(TABLE_FILTERS.ALL)

  const tableData = []

  useSetNoDefaultNetworkId()

  allAuctions?.forEach((auction) => {
    tableData.push({
      id: auction.id,
      currentPrice: auction.clearingPrice ? auction.clearingPrice : '-',
      search: JSON.stringify(auction),
      auctionId: `#${auction.id}`,
      type: 'auction', // TODO: currently hardcoded since no OTC exists
      price: `1 ${auction?.bidding?.symbol}`,
      fixedAPR: calculateInterestRate({
        price: auction.clearingPrice,
        maturityDate: auction.bond.maturityDate,
        startDate: auction.end,
      }),
      status: auction.live ? (
        <ActiveStatusPill title="Ongoing" />
      ) : (
        <ActiveStatusPill disabled dot={false} title="Ended" />
      ),
      maturityValue: `1 ${auction?.bond.paymentToken.symbol}`,
      endDate: (
        <span className="uppercase">
          {dayjs(auction?.end * 1000)
            .utc()
            .tz()
            .format('ll')}
        </span>
      ),
      offering: (
        <div className="flex flex-row items-center space-x-4">
          <div className="flex">
            <TokenLogo
              size="41px"
              square
              token={{
                address: auction?.bond?.id,
                symbol: auction?.bond?.name,
              }}
            />
          </div>
          <div className="flex flex-col text-lg text-[#EEEFEB]">
            <div className="flex items-center space-x-2 capitalize">
              <span>{auction?.bond.name.toLowerCase()}</span>
              <AuctionsIcon width={15} />
            </div>
            <p className="text-sm text-[#9F9F9F] uppercase">{auction?.bond.symbol}</p>
          </div>
        </div>
      ),
      url: `/offerings/${auction.id}`,
    })
  })

  return (
    <>
      <GlobalStyle />
      <ErrorBoundaryWithFallback>
        <Table
          columns={columns}
          data={tableData.filter(({ type }) => (tableFilter ? type === tableFilter : true))}
          emptyDescription="There are no offerings at the moment"
          emptyLogo={
            <>
              <AuctionsIcon height={36} width={36} /> <OTCIcon height={36} width={36} />
            </>
          }
          legendIcons={
            <>
              <AllButton
                active={tableFilter === TABLE_FILTERS.ALL}
                onClick={() => setTableFilter(TABLE_FILTERS.ALL)}
              />
              <DividerIcon />
              <AuctionButtonOutline
                active={tableFilter === TABLE_FILTERS.AUCTION}
                onClick={() => setTableFilter(TABLE_FILTERS.AUCTION)}
                plural
              />
              <OTCButtonOutline
                active={tableFilter === TABLE_FILTERS.OTC}
                onClick={() => setTableFilter(TABLE_FILTERS.OTC)}
              />
            </>
          }
          loading={loading}
          name="offerings"
          title="Offerings"
        />
      </ErrorBoundaryWithFallback>
    </>
  )
}

export default Offerings
