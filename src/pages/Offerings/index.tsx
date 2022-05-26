import React, { useState } from 'react'
import { createGlobalStyle } from 'styled-components'

import dayjs from 'dayjs'

import { AllButton, AuctionButtonOutline, OTCButtonOutline } from '../Auction'
import { TABLE_FILTERS } from '../Portfolio'
import { BondIcon } from '../Products'

import { ReactComponent as AuctionsIcon } from '@/assets/svg/auctions.svg'
import { ReactComponent as DividerIcon } from '@/assets/svg/divider.svg'
import { ReactComponent as OTCIcon } from '@/assets/svg/otc.svg'
import { TokenInfoWithLink } from '@/components/auction/AuctionDetails'
import { AuctionStatusPill } from '@/components/auction/OrderbookTable'
import Table from '@/components/auctions/Table'
import { ErrorBoundaryWithFallback } from '@/components/common/ErrorAndReload'
import TooltipElement from '@/components/common/Tooltip'
import { calculateInterestRate } from '@/components/form/InterestRateInputPanel'
import { Auction } from '@/generated/graphql'
import { useAuctions } from '@/hooks/useAuction'
import { useSetNoDefaultNetworkId } from '@/state/orderPlacement/hooks'
import { currentTimeInUTC } from '@/utils/tools'

export const getAuctionStates = (
  auction: Pick<Auction, 'end' | 'orderCancellationEndDate' | 'clearingPrice'>,
) => {
  const { clearingPrice, end, orderCancellationEndDate } = auction
  // open for orders
  const atStageOrderPlacement = currentTimeInUTC() <= end * 1000

  // cancellable (can be open for orders and cancellable.
  // This isn't an auction status rather an ability to cancel your bid or not.)
  const atStageOrderPlacementAndCancelation = currentTimeInUTC() <= orderCancellationEndDate

  // AKA settling (can be settled, but not yet done so)
  const atStageNeedsSettled = currentTimeInUTC() >= end * 1000

  // claiming (settled)
  const atStageFinished = !!clearingPrice

  const atStageEnded = currentTimeInUTC() >= end * 1000

  let status = 'Unknown'
  if (atStageEnded) status = 'ended'

  // Auction can be settled
  if (atStageNeedsSettled) status = 'settlement'

  // Orders can be claimed
  if (atStageFinished) status = 'claiming'

  // Orders can be placed
  if (atStageOrderPlacement) status = 'ongoing'

  return {
    atStageOrderPlacement,
    atStageOrderPlacementAndCancelation,
    atStageNeedsSettled,
    atStageFinished,
    atStageEnded,
    status,
  }
}

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
    Header: 'Minimum Price',
    tooltip: 'Minimum price a bond can be sold for. Bids below this price will not be accepted.',
    accessor: 'minimumPrice',
    align: 'flex-start',
    style: {},
    filter: 'searchInTags',
  },
  {
    Header: 'Maximum APR',
    tooltip:
      'Maximum APR the issuer is willing to pay. This is calculated using the minimum bond price.',
    accessor: 'maximumAPR',
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
      minimumPrice: (
        <TokenInfoWithLink auction={auction} value={auction.minimumBondPrice} withLink={false} />
      ),
      search: JSON.stringify(auction),
      auctionId: `#${auction.id}`,
      type: 'auction', // TODO: currently hardcoded since no OTC exists
      price: `1 ${auction?.bidding?.symbol}`,
      maximumAPR: calculateInterestRate({
        price: auction.minimumBondPrice,
        maturityDate: auction.bond.maturityDate,
        startDate: auction.end,
      }),
      status: <AuctionStatusPill auction={auction} />,
      maturityValue: `1 ${auction?.bond.paymentToken.symbol}`,
      endDate: (
        <span className="uppercase">
          {
            <TooltipElement
              left={dayjs(auction?.end * 1000)
                .utc()
                .tz()
                .format('ll')}
              tip={dayjs(auction?.end * 1000)
                .utc()
                .tz()
                .format('LLLL z ZZ (zzz)')}
            />
          }
        </span>
      ),
      offering: (
        <BondIcon
          auctionId={auction?.id}
          icon
          id={auction?.bond?.id}
          name={auction?.bond?.name}
          symbol={auction?.bond.symbol}
        />
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
