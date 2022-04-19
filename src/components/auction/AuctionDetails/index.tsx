import React, { useMemo } from 'react'
import styled from 'styled-components'

import { formatUnits } from '@ethersproject/units'
import { TokenAmount } from '@josojo/honeyswap-sdk'

import { useAuctionBidVolume } from '../../../hooks/useAuctionBidVolume'
import { useAuctionDetails } from '../../../hooks/useAuctionDetails'
import { DerivedAuctionInfo } from '../../../state/orderPlacement/hooks'
import { AuctionIdentifier } from '../../../state/orderPlacement/reducer'
import { useOrderbookState } from '../../../state/orderbook/hooks'
import { getTokenDisplay } from '../../../utils'
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
  const { chainId } = auctionIdentifier
  const { auctionDetails, graphInfo } = useAuctionDetails(auctionIdentifier)
  const { totalBidVolume } = useAuctionBidVolume()
  const { orderbookPrice: auctionCurrentPrice } = useOrderbookState()

  const biddingTokenDisplay = useMemo(
    () => getTokenDisplay(derivedAuctionInfo?.biddingToken, chainId),
    [derivedAuctionInfo?.biddingToken, chainId],
  )
  const auctioningTokenDisplay = useMemo(
    () => getTokenDisplay(derivedAuctionInfo?.auctioningToken, chainId),
    [derivedAuctionInfo?.auctioningToken, chainId],
  )
  const clearingPriceDisplay = useMemo(() => {
    const clearingPriceNumber = auctionCurrentPrice

    const priceSymbolStrings = `${getTokenDisplay(derivedAuctionInfo?.biddingToken, chainId)} per
    ${getTokenDisplay(derivedAuctionInfo?.auctioningToken, chainId)}
`

    return clearingPriceNumber ? (
      <TokenValue>
        {abbreviation(clearingPriceNumber)} {priceSymbolStrings}
      </TokenValue>
    ) : (
      '-'
    )
  }, [
    auctionCurrentPrice,
    derivedAuctionInfo?.auctioningToken,
    derivedAuctionInfo?.biddingToken,
    chainId,
  ])

  const initialPriceToDisplay = derivedAuctionInfo?.initialPrice

  const maxAPR = calculateInterestRate(
    initialPriceToDisplay?.toSignificant(2),
    derivedAuctionInfo?.auctionEndDate,
  )
  const currentAPR = calculateInterestRate(auctionCurrentPrice, derivedAuctionInfo?.auctionEndDate)

  const extraDetails: Array<ExtraDetailsItemProps> = React.useMemo(
    () => [
      {
        title: 'Offering size',
        value: `${
          graphInfo?.size
            ? abbreviation(formatUnits(graphInfo?.size, derivedAuctionInfo?.biddingToken?.decimals))
            : 0
        }`,
        tooltip: 'Total number of bonds to be auctioned',
      },
      {
        title: 'Total bid volume',
        value: `${
          totalBidVolume
            ? abbreviation(
                formatUnits(`${totalBidVolume}`, derivedAuctionInfo?.biddingToken?.decimals),
              )
            : 0
        } ${biddingTokenDisplay}`,
        tooltip: 'Total bid volume',
      },
      {
        title: 'Minimum funding threshold',
        tooltip: 'Auction will not be executed, unless this minimum funding threshold is met',
        value:
          auctionDetails == null || auctionDetails.minFundingThreshold == '0x0'
            ? '0'
            : `${abbreviation(
                new TokenAmount(
                  derivedAuctionInfo.biddingToken,
                  auctionDetails.minFundingThreshold,
                ).toSignificant(2),
              )} ${biddingTokenDisplay}`,
      },
      {
        title: 'Minimum bid size',
        value: auctionDetails
          ? `${formatUnits(
              auctionDetails?.minimumBiddingAmountPerOrder,
              derivedAuctionInfo?.biddingToken?.decimals,
            )} ${biddingTokenDisplay}`
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
        value: currentAPR,
        tooltip: 'Tooltip',
      },
      {
        title: 'Minimum price',
        tooltip: 'Min price',
        value: (
          <div className="flex items-center">
            <TokenValue>
              {initialPriceToDisplay
                ? abbreviation(initialPriceToDisplay?.toSignificant(2))
                : ' - '}
            </TokenValue>
            <TokenSymbol>
              {initialPriceToDisplay && auctioningTokenDisplay
                ? ` ${biddingTokenDisplay} per ${auctioningTokenDisplay}`
                : '-'}
            </TokenSymbol>
          </div>
        ),
      },
      {
        title: 'Maximum APR',
        value: maxAPR,
        tooltip: 'Tooltip',
      },
    ],
    [
      currentAPR,
      maxAPR,
      totalBidVolume,
      clearingPriceDisplay,
      graphInfo?.size,
      biddingTokenDisplay,
      initialPriceToDisplay,
      auctionDetails,
      derivedAuctionInfo,
      auctioningTokenDisplay,
    ],
  )

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
          endDate={derivedAuctionInfo?.auctionEndDate}
          endText="End date"
          startDate={derivedAuctionInfo?.auctionStartDate}
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
