import React, { useState } from 'react'
import { useParams } from 'react-router-dom'

import { TokenAmount } from '@josojo/honeyswap-sdk'

import { useActiveWeb3React } from '../../../hooks'
import { useAuctionDetails } from '../../../hooks/useAuctionDetails'
import { LoadingBox } from '../../../pages/Auction'
import { DerivedAuctionInfo } from '../../../state/orderPlacement/hooks'
import { parseURL } from '../../../state/orderPlacement/reducer'
import { useOrderbookState } from '../../../state/orderbook/hooks'
import OrderBookChart, { OrderBookError } from '../OrderbookChart'
import { OrderBookTable } from '../OrderbookTable'
import { processOrderbookData } from '../OrderbookWidget'

interface OrderbookGraphProps {
  derivedAuctionInfo: DerivedAuctionInfo
}

export const OrderBook: React.FC<OrderbookGraphProps> = (props) => {
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

  const [showOrderList, setShowOrderList] = useState(false)
  const { chainId } = useActiveWeb3React()
  const auctionIdentifier = parseURL(useParams())
  const { auctionDetails } = useAuctionDetails(auctionIdentifier)
  const { auctionId } = auctionIdentifier

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
    <div className="card">
      <div className="card-body">
        <div className="flex flex-wrap justify-between mb-5">
          <h2 className="card-title">Orderbook</h2>
          <div className="flex items-center">
            <div className="btn-group">
              <button
                className={`btn ${!showOrderList && 'btn-active'} w-[85px]`}
                onClick={() => showOrderList && setShowOrderList(false)}
              >
                Graph
              </button>
              <button
                className={`btn ${showOrderList && 'btn-active'} w-[85px]`}
                onClick={() => !showOrderList && setShowOrderList(true)}
              >
                List
              </button>
            </div>
          </div>
        </div>

        <div className={`swap ${!showOrderList ? 'swap-active' : ''}`}>
          <div className="swap-on">
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
          <div className="swap-off">
            <OrderBookTable derivedAuctionInfo={derivedAuctionInfo} />
          </div>
        </div>
      </div>
    </div>
  )
}
