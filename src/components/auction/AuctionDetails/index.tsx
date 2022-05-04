import React from 'react'
import styled from 'styled-components'

import { isBigNumberish } from '@ethersproject/bignumber/lib/bignumber'
import { formatUnits } from '@ethersproject/units'

import { useAuction } from '../../../hooks/useAuction'
import { AuctionState, DerivedAuctionInfo } from '../../../state/orderPlacement/hooks'
import { AuctionIdentifier } from '../../../state/orderPlacement/reducer'
import { useOrderbookState } from '../../../state/orderbook/hooks'
import { abbreviation } from '../../../utils/numeral'
import { calculateInterestRate } from '../../form/InterestRateInputPanel'
import TokenLink from '../../token/TokenLink'
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

  const settling = derivedAuctionInfo?.auctionState === AuctionState.NEEDS_SETTLED

  let totalBidVolume,
    offeringSize,
    minimumBondPrice,
    minimumFundingThreshold,
    minimumBidSize = {}

  let currentBondAPR,
    maxBondAPR = '-'

  if (graphInfo) {
    const TokenInfoWithLink = ({ value, withLink = true }) => (
      <TokenValue className="space-x-1">
        <span>
          {isBigNumberish(value)
            ? abbreviation(formatUnits(value, graphInfo?.bidding?.decimals))
            : Number(value).toLocaleString()}
        </span>
        <TokenLink token={graphInfo?.bidding} withLink={withLink} />
      </TokenValue>
    )

    offeringSize = {
      fullNumberHint: Number(
        formatUnits(graphInfo.offeringSize, graphInfo.bond.decimals),
      ).toLocaleString(),
      value: `${abbreviation(formatUnits(graphInfo.offeringSize, graphInfo.bond.decimals))} bonds`,
    }
    totalBidVolume = {
      fullNumberHint: Number(
        formatUnits(graphInfo.totalBidVolume, graphInfo.bidding.decimals),
      ).toLocaleString(),
      value: <TokenInfoWithLink value={graphInfo.totalBidVolume} withLink={false} />,
    }
    minimumFundingThreshold = {
      fullNumberHint: Number(
        formatUnits(graphInfo.minimumFundingThreshold, graphInfo.bidding.decimals),
      ).toLocaleString(),
      value: <TokenInfoWithLink value={graphInfo.minimumFundingThreshold} withLink={false} />,
    }
    minimumBondPrice = {
      fullNumberHint: graphInfo?.minimumBondPrice.toLocaleString(),
      value: <TokenInfoWithLink value={graphInfo.minimumBondPrice} />,
    }
    minimumBidSize = {
      fullNumberHint: Number(
        formatUnits(graphInfo.minimumBidSize, graphInfo.bidding.decimals),
      ).toLocaleString(),
      value: <TokenInfoWithLink value={graphInfo.minimumBidSize} />,
    }
    currentBondAPR = calculateInterestRate(
      auctionCurrentPrice,
      graphInfo.bond.maturityDate,
    ) as string
    maxBondAPR = calculateInterestRate(
      graphInfo.minimumBondPrice,
      graphInfo.bond.maturityDate,
    ) as string
  }

  const currentBondPrice = {
    fullNumberHint: auctionCurrentPrice.toLocaleString(),
    value: auctionCurrentPrice ? (
      <TokenValue className="space-x-1">
        <span>{auctionCurrentPrice.toLocaleString()}</span>
        <TokenLink token={graphInfo?.bidding} />
      </TokenValue>
    ) : (
      '-'
    ),
  }

  const extraDetails: Array<ExtraDetailsItemProps> = [
    {
      title: 'Offering size',
      value: '-',
      ...offeringSize,
      tooltip: 'Number of bonds being sold.',
    },
    {
      title: 'Total bid volume',
      value: '-',
      ...totalBidVolume,
      tooltip: 'Sum of all bid volume.',
    },
    {
      title: 'Min funding threshold',
      tooltip:
        'Minimum bid volume required for auction to close. If this value is not reached, all funds will be returned and no bonds will be sold.',
      value: '-',
      ...minimumFundingThreshold,
    },
    {
      title: 'Minimum bid size',
      value: '-',
      ...minimumBidSize,
      tooltip: 'Minimum size for a single bid. Bids below this size cannot be placed.',
    },
    {
      title: 'Current bond price',
      tooltip: `Current auction clearing price for a single bond. If the auction ended now, this would be the price set.`,
      value: '-',
      ...currentBondPrice,
      bordered: 'blue',
    },
    {
      title: 'Current bond APR',
      value: currentBondAPR,
      tooltip:
        'Current bond APR calculated from the current bond price. If the auction ended now, this is the return bond purchasers would receive assuming no default.',
      bordered: 'blue',
    },
    {
      title: 'Minimum bond price',
      tooltip: 'Minimum price a bond can be sold for. Bids below this price will not be accepted.',
      value: '-',
      ...minimumBondPrice,
    },
    {
      title: 'Maximum bond APR',
      value: maxBondAPR,
      tooltip:
        'Maximum APR the issuer is willing to pay. This is calculated using the minimum bond price.',
    },
  ]

  const hasEnded = new Date() > new Date(derivedAuctionInfo?.auctionEndDate * 1000)
  const statusLabel = settling ? 'Settling' : hasEnded ? 'Ended' : 'Ongoing'

  return (
    <div className="card">
      <div className="card-body">
        <h2 className="flex justify-between card-title">
          <span>Auction information</span>
          <ActiveStatusPill disabled={hasEnded || settling} title={statusLabel} />
        </h2>
        <AuctionTimer
          color="blue"
          endDate={graphInfo?.end}
          endText="End date"
          startDate={graphInfo?.start}
          startText="Start date"
          text="Ends in"
        />

        <div className="grid grid-cols-2 gap-x-12 gap-y-8 pt-12 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4">
          {extraDetails.map((item, index) => (
            <ExtraDetailsItem key={index} {...item} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default AuctionDetails
