import React from 'react'
import styled from 'styled-components'

import { formatUnits } from '@ethersproject/units'

import { useAuction } from '../../../hooks/useAuction'
import { useAuctionDetails } from '../../../hooks/useAuctionDetails'
import { DerivedAuctionInfo } from '../../../state/orderPlacement/hooks'
import { AuctionIdentifier } from '../../../state/orderPlacement/reducer'
import { useOrderbookState } from '../../../state/orderbook/hooks'
import { getDisplay } from '../../../utils'
import { abbreviation } from '../../../utils/numeral'
import { calculateInterestRate } from '../../form/InterestRateInputPanel'
import { AuctionTimer } from '../AuctionTimer'
import { ExtraDetailsItem, Props as ExtraDetailsItemProps } from '../ExtraDetailsItem'
import { ActiveStatusPill } from '../OrderbookTable'

const TokenValue = styled.span`
  line-height: 1.2;
  display: flex;
  margin-bottom: 1px;
  margin-right: 0.25em;
  text-align: center;
  white-space: nowrap;
`

interface Props {
  auctionIdentifier: AuctionIdentifier
  derivedAuctionInfo: DerivedAuctionInfo
}

const AuctionDetails = (props: Props) => {
  const { auctionIdentifier, derivedAuctionInfo } = props

  const { data: graphInfo } = useAuction(auctionIdentifier?.auctionId)
  const { orderbookPrice: auctionCurrentPrice } = useOrderbookState()

  const biddingTokenDisplay = getDisplay(graphInfo?.bidding)

  let totalBidVolume = offeringSize = totalBidVolume = minimumFundingThreshold = minimumBidSize = currentBondAPR = maxBondAPR = '-'

  if (graphInfo) {
    offeringSize = `${abbreviation(
      formatUnits(graphInfo.offeringSize, graphInfo.bond.decimals),
    )} bonds`
    totalBidVolume = `${abbreviation(
      formatUnits(graphInfo.totalBidVolume, graphInfo.bidding.decimals),
    )} ${biddingTokenDisplay}`
    minimumFundingThreshold = `${abbreviation(
      formatUnits(graphInfo.minimumFundingThreshold, graphInfo.bidding.decimals),
    )} ${biddingTokenDisplay}`
    minimumBidSize = `${abbreviation(
      formatUnits(graphInfo.minimumBidSize, graphInfo.bidding.decimals),
    )} ${biddingTokenDisplay}`
    currentBondAPR = calculateInterestRate(
      auctionCurrentPrice,
      graphInfo.bond.maturityDate,
    ) as string
    maxBondAPR = calculateInterestRate(
      graphInfo.minimumBondPrice,
      graphInfo.bond.maturityDate,
    ) as string
  }

  const minimumBondPrice = (
    <TokenValue>
      {abbreviation(graphInfo?.minimumBondPrice)} {`${getDisplay(graphInfo?.bidding)}`}
    </TokenValue>
  )

  const currentBondPrice = (
    <TokenValue>
      {abbreviation(auctionCurrentPrice)} {`${getDisplay(graphInfo?.bidding)}`}
    </TokenValue>
  )

  const extraDetails: Array<ExtraDetailsItemProps> = [
    {
      title: 'Offering size',
      value: offeringSize,
      tooltip: 'Total number of bonds to be auctioned',
    },
    {
      title: 'Total bid volume',
      value: totalBidVolume,
      tooltip: 'Total bid volume',
    },
    {
      title: 'Minimum funding threshold',
      tooltip: 'Auction will not be executed, unless this minimum funding threshold is met',
      value: minimumFundingThreshold,
    },
    {
      title: 'Minimum bid size',
      value: minimumBidSize,
      tooltip: 'Each order must at least bid this amount',
    },
    {
      title: 'Current bond price',
      tooltip: `This will be the auction's Closing Price if no more bids are submitted or cancelled, OR it will be the auction's Clearing Price if the auction concludes without additional bids.`,
      value: currentBondPrice ? currentBondPrice : '-',
      bordered: 'blue',
    },
    {
      title: 'Current bond APR',
      value: currentBondAPR,
      tooltip: 'Tooltip',
    },
    {
      title: 'Minimum price',
      tooltip: 'Min price',
      value: minimumBondPrice ? minimumBondPrice : '-',
    },
    {
      title: 'Maximum APR',
      value: maxBondAPR,
      tooltip: 'Tooltip',
    },
  ]

  const hasEnded = new Date() > new Date(derivedAuctionInfo?.auctionEndDate * 1000)
  const statusLabel = hasEnded ? 'Ended' : 'Ongoing'

  return (
    <div className="card">
      <div className="card-body">
        <h2 className="card-title flex justify-between">
          <span>Auction information</span>
          <ActiveStatusPill disabled={hasEnded} title={statusLabel} />
        </h2>
        <AuctionTimer
          auctionState={derivedAuctionInfo?.auctionState}
          color="blue"
          endDate={graphInfo?.end}
          endText="End date"
          startDate={graphInfo?.start}
          startText="Start date"
          text="Ends in"
        />

        <div className="grid gap-x-12 gap-y-8 grid-cols-1 pt-12 md:grid-cols-4">
          {extraDetails.map((item, index) => (
            <ExtraDetailsItem key={index} {...item} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default AuctionDetails
