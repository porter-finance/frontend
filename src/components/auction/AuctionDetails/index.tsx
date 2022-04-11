import React, { useMemo } from 'react'
import styled from 'styled-components'

import { TokenAmount } from '@josojo/honeyswap-sdk'

import { useAuctionDetails } from '../../../hooks/useAuctionDetails'
import {
  DerivedAuctionInfo,
  useOrderPlacementState,
  useSwapActionHandlers,
} from '../../../state/orderPlacement/hooks'
import { AuctionIdentifier } from '../../../state/orderPlacement/reducer'
import { useOrderbookState } from '../../../state/orderbook/hooks'
import { getTokenDisplay } from '../../../utils'
import { abbreviation } from '../../../utils/numeral'
import { showChartsInverted } from '../../../utils/prices'
import { AuctionTimer } from '../AuctionTimer'
import { ExtraDetailsItem, Props as ExtraDetailsItemProps } from '../ExtraDetailsItem'

const Timer = styled(AuctionTimer)``

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

  const { showPriceInverted } = useOrderPlacementState()
  const { orderbookPrice: auctionCurrentPrice, orderbookPriceReversed: auctionPriceReversed } =
    useOrderbookState()
  const { onInvertPrices } = useSwapActionHandlers()

  // Start with inverted prices, if orderbook is also show inverted,
  // i.e. if the baseToken/auctioningToken is a stable token
  React.useEffect(() => {
    if (derivedAuctionInfo?.auctioningToken != null && !showPriceInverted) {
      if (showChartsInverted(derivedAuctionInfo?.auctioningToken)) {
        onInvertPrices()
      }
    }
  }, [showPriceInverted, derivedAuctionInfo?.auctioningToken, onInvertPrices])

  const biddingTokenDisplay = useMemo(
    () => getTokenDisplay(derivedAuctionInfo?.biddingToken, chainId),
    [derivedAuctionInfo?.biddingToken, chainId],
  )
  const auctioningTokenDisplay = useMemo(
    () => getTokenDisplay(derivedAuctionInfo?.auctioningToken, chainId),
    [derivedAuctionInfo?.auctioningToken, chainId],
  )
  const clearingPriceDisplay = useMemo(() => {
    const clearingPriceNumber = showPriceInverted ? auctionPriceReversed : auctionCurrentPrice

    const priceSymbolStrings = showPriceInverted
      ? `${getTokenDisplay(derivedAuctionInfo?.auctioningToken, chainId)} per
    ${getTokenDisplay(derivedAuctionInfo?.biddingToken, chainId)}`
      : `${getTokenDisplay(derivedAuctionInfo?.biddingToken, chainId)} per
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
    showPriceInverted,
    auctionPriceReversed,
    auctionCurrentPrice,
    derivedAuctionInfo?.auctioningToken,
    derivedAuctionInfo?.biddingToken,
    chainId,
  ])

  const initialPriceToDisplay = derivedAuctionInfo?.initialPrice

  const extraDetails: Array<ExtraDetailsItemProps> = React.useMemo(
    () => [
      {
        title: 'Offering size',
        value: graphInfo?.size,
        tooltip: 'Total number of bonds to be auctioned',
      },
      {
        title: 'Total bid volume',
        value: `${abbreviation(
          derivedAuctionInfo?.initialAuctionOrder?.sellAmount.toSignificant(4),
        )}`,
        tooltip: 'Total amount of tokens available to be bought in the auction.',
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
              )} ${getTokenDisplay(derivedAuctionInfo?.biddingToken, chainId)}`,
      },
      {
        title: 'Minimum bid size',
        value: auctionDetails
          ? `${abbreviation(
              new TokenAmount(
                derivedAuctionInfo?.biddingToken,
                auctionDetails.minimumBiddingAmountPerOrder,
              ).toSignificant(2),
            )} ${getTokenDisplay(derivedAuctionInfo?.biddingToken, chainId)}`
          : '-',
        tooltip: 'Each order must at least bid this amount',
      },
      {
        bordered: true,
        title: 'Current auction interest rate/price',
        tooltip: `This will be the auction's Closing Price if no more bids are submitted or cancelled, OR it will be the auction's Clearing Price if the auction concludes without additional bids.`,
        value: clearingPriceDisplay ? clearingPriceDisplay : '-',
      },
      {
        bordered: true,
        title: 'Max interest rate/Min price',
        tooltip: 'Minimum bidding price the auctioneer defined for participation.',
        value: (
          <div className="flex items-center">
            <TokenValue>
              {initialPriceToDisplay
                ? showPriceInverted
                  ? initialPriceToDisplay?.invert().toSignificant(5)
                  : abbreviation(initialPriceToDisplay?.toSignificant(2))
                : ' - '}
            </TokenValue>
            <TokenSymbol>
              {initialPriceToDisplay && auctioningTokenDisplay
                ? showPriceInverted
                  ? ` ${auctioningTokenDisplay} per ${biddingTokenDisplay}`
                  : ` ${biddingTokenDisplay} per ${auctioningTokenDisplay}`
                : '-'}
            </TokenSymbol>
          </div>
        ),
      },
    ],
    [
      clearingPriceDisplay,
      graphInfo?.size,
      biddingTokenDisplay,
      initialPriceToDisplay,
      showPriceInverted,
      auctionDetails,
      chainId,
      derivedAuctionInfo,
      auctioningTokenDisplay,
    ],
  )

  return (
    <div className="card">
      <div className="card-body">
        <h2 className="card-title">Auction information</h2>
        <Timer derivedAuctionInfo={derivedAuctionInfo} />

        <div className="grid gap-x-12 gap-y-8 grid-cols-1 pt-12 md:grid-cols-3">
          {extraDetails.map((item, index) => (
            <ExtraDetailsItem key={index} {...item} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default AuctionDetails
