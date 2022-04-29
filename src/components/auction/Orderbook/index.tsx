import React from 'react'
import { useParams } from 'react-router-dom'

import { TokenAmount } from '@josojo/honeyswap-sdk'

import { useAuctionDetails } from '../../../hooks/useAuctionDetails'
import { LoadingBox } from '../../../pages/Auction'
import { DerivedAuctionInfo } from '../../../state/orderPlacement/hooks'
import { parseURL } from '../../../state/orderPlacement/reducer'
import { useOrderbookState } from '../../../state/orderbook/hooks'
import OrderBookChart, { OrderBookError } from '../OrderbookChart'
import { processOrderbookData } from '../OrderbookWidget'

interface OrderbookProps {
  derivedAuctionInfo: DerivedAuctionInfo
}

export const OrderBook: React.FC<OrderbookProps> = (props) => {
  const { derivedAuctionInfo } = props
  const {
    asks,
    auctionId: orderbookAuctionId,
    bids,
    chainId: orderbookChainId,
    error,
    userOrderPrice,
    userOrderVolume,
  } = useOrderbookState()

  const auctionIdentifier = parseURL(useParams())
  const { auctionDetails } = useAuctionDetails(auctionIdentifier)
  const { auctionId, chainId } = auctionIdentifier

  const { auctioningToken: baseToken, biddingToken: quoteToken } = derivedAuctionInfo

  const processedOrderbook = React.useMemo(() => {
    const data = { bids, asks }
    const minFundingThresholdAmount =
      auctionDetails && new TokenAmount(quoteToken, auctionDetails?.minFundingThreshold)

    return processOrderbookData({
      data,
      userOrder: {
        price: userOrderPrice,
        volume: userOrderVolume,
      },
      baseToken,
      quoteToken,
      minFundingThreshold: minFundingThresholdAmount,
    })
  }, [asks, baseToken, bids, quoteToken, userOrderPrice, userOrderVolume, auctionDetails])

  const isLoading = orderbookAuctionId != auctionId || chainId != orderbookChainId
  const hasError = error || !asks || asks.length === 0
  if (isLoading) {
    return <LoadingBox height={521} />
  }

  return (
    <div className="card ">
      <div className="card-body">
        <h2 className="card-title ">Orderbook graph</h2>
        {hasError && <OrderBookError error={error} />}
        {!hasError && (
          <OrderBookChart
            baseToken={baseToken}
            chainId={chainId}
            data={processedOrderbook}
            quoteToken={quoteToken}
          />
        )}
      </div>
    </div>
  )
}
