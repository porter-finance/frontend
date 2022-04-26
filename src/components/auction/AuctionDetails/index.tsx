import React from 'react'
import styled from 'styled-components'

import { formatUnits } from '@ethersproject/units'

import { useAuction } from '../../../hooks/useAuction'
import { useAuctionDetails } from '../../../hooks/useAuctionDetails'
import { DerivedAuctionInfo } from '../../../state/orderPlacement/hooks'
import { AuctionIdentifier } from '../../../state/orderPlacement/reducer'
import { getDisplay } from '../../../utils'
import { abbreviation } from '../../../utils/numeral'
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

const TokenSymbol = styled.span`
  display: flex;
  align-items: center;
  margin-bottom: 0;
  white-space: normal;

  .tokenLogo {
    display: inline-flex;
  }

  & > * {
    margin-right: 0;
  }

  @media (min-width: 768px) {
    white-space: nowrap;
    text-align: left;
  }
`

interface Props {
  auctionIdentifier: AuctionIdentifier
  derivedAuctionInfo: DerivedAuctionInfo
}

const AuctionDetails = (props: Props) => {
  const { auctionIdentifier, derivedAuctionInfo } = props

  const { auctionDetails } = useAuctionDetails(auctionIdentifier)
  const { data: graphInfo } = useAuction(auctionIdentifier?.auctionId)
  // TODO See how this value was calculated??
  // const { orderbookPrice: auctionCurrentPrice } = useOrderbookState()

  const biddingTokenDisplay = getDisplay(graphInfo?.bidding)
  // const auctioningTokenDisplay = getDisplay(graphInfo?.bond)

  const clearingPriceDisplay = (
    <TokenValue>
      {abbreviation(graphInfo?.minimumBondPrice)} {`${getDisplay(graphInfo?.bidding)}`}
    </TokenValue>
  )
  const minimumBondPrice = (
    <TokenValue>
      {abbreviation(graphInfo?.minimumBondPrice)} {`${getDisplay(graphInfo?.bidding)}`}
    </TokenValue>
  )
  const initialPriceToDisplay = derivedAuctionInfo?.initialPrice

  const extraDetails: Array<ExtraDetailsItemProps> = [
    {
      title: 'Offering size',
      value: `${
        graphInfo?.offeringSize
          ? abbreviation(formatUnits(graphInfo.offeringSize, graphInfo.bond.decimals))
          : 0
      } bonds`,
      tooltip: 'Total number of bonds to be auctioned',
    },
    {
      title: 'Total bid volume',
      value: `${
        graphInfo?.totalBidVolume
          ? abbreviation(formatUnits(`${graphInfo.totalBidVolume}`, graphInfo?.bidding?.decimals))
          : 0
      } ${biddingTokenDisplay}`,
      tooltip: 'Total bid volume',
    },
    {
      // TODO look at this closer
      title: 'Minimum funding threshold',
      tooltip: 'Auction will not be executed, unless this minimum funding threshold is met',
      value: `${
        graphInfo?.minimumFundingThreshold
          ? abbreviation(formatUnits(graphInfo.minimumFundingThreshold, graphInfo.bidding.decimals))
          : 0
      } ${biddingTokenDisplay}`,
    },
    {
      title: 'Minimum bid size',
      value: graphInfo
        ? `${formatUnits(
            graphInfo.minimumBidSize,
            graphInfo.bidding.decimals,
          )} ${biddingTokenDisplay} `
        : '-',
      tooltip: 'Each order must at least bid this amount',
    },
    {
      title: 'Current bond price',
      tooltip: `This will be the auction's Closing Price if no more bids are submitted or cancelled, OR it will be the auction's Clearing Price if the auction concludes without additional bids.`,
      value: clearingPriceDisplay ? clearingPriceDisplay : '-',
      bordered: 'blue',
    },
    {
      title: 'Current bond APR',
      value: '-',
      tooltip: 'Tooltip',
    },
    {
      title: 'Minimum price',
      tooltip: 'Min price',
      value: minimumBondPrice ? minimumBondPrice : '-',
    },
    {
      title: 'Maximum APR',
      value: '-',
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
