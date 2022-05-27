import { useCallback, useEffect, useState } from 'react'

import { round } from 'lodash'
import { useDispatch, useSelector } from 'react-redux'

import { AppDispatch, AppState } from '..'
import { additionalServiceApi } from '../../api'
import { OrderBookData, PricePoint } from '../../api/AdditionalServicesApi'
import { CalculatorClearingPrice } from '../../components/auction/OrderbookWidget'
import { getLogger } from '../../utils/logger'
import { AuctionIdentifier } from '../orderPlacement/reducer'
import {
  appendBid,
  appendOrderbookData,
  pullOrderbookData,
  removeBid,
  resetOrderbookData,
  resetUserInterestRate,
  resetUserPrice,
  resetUserVolume,
} from './actions'

import { useActiveWeb3React } from '@/hooks'

const logger = getLogger('orderbook/hooks')

export function useOrderbookState(): AppState['orderbook'] {
  return useSelector<AppState, AppState['orderbook']>((state) => state.orderbook)
}

export interface CalculatedAuctionPrice {
  price: number
  priceReversed: number
}

export function useOrderbookActionHandlers(): {
  onNewBid: (order: PricePoint) => void
  onRemoveBid: (order: PricePoint) => void
  onPullOrderbookData: () => void
  onResetUserPrice: (price: number) => void
  onResetUserInterestRate: (interestRate: number) => void
  onResetUserVolume: (volume: number) => void
  onAppendOrderbookData: (
    auctionId: number,
    chainId: number,
    orderbook: OrderBookData,
    calculatedAuctionPrice: CalculatedAuctionPrice,
    error: Maybe<Error>,
  ) => void
  onResetOrderbookData: (
    auctionId: number,
    chainId: number,
    orderbook: OrderBookData,
    calculatedAuctionPrice: CalculatedAuctionPrice,
    error: Maybe<Error>,
  ) => void
} {
  const dispatch = useDispatch<AppDispatch>()

  const onNewBid = useCallback(
    (order: PricePoint) => {
      dispatch(appendBid({ order }))
    },
    [dispatch],
  )
  const onRemoveBid = useCallback(
    (order: PricePoint) => {
      dispatch(removeBid({ order }))
    },
    [dispatch],
  )
  const onPullOrderbookData = useCallback(() => {
    dispatch(pullOrderbookData())
  }, [dispatch])

  const onResetUserPrice = useCallback(
    (price: number) => {
      dispatch(resetUserPrice({ price }))
    },
    [dispatch],
  )

  const onResetUserInterestRate = useCallback(
    (interestRate: number) => {
      dispatch(resetUserInterestRate({ interestRate }))
    },
    [dispatch],
  )
  const onResetUserVolume = useCallback(
    (volume: number) => {
      dispatch(resetUserVolume({ volume }))
    },
    [dispatch],
  )
  const onResetOrderbookData = useCallback(
    (
      auctionId: number,
      chainId: number,
      orderbook: OrderBookData,
      calculatedAuctionPrice: CalculatedAuctionPrice,
      error: Maybe<Error>,
    ) => {
      dispatch(resetOrderbookData({ auctionId, chainId, orderbook, calculatedAuctionPrice, error }))
    },
    [dispatch],
  )

  const onAppendOrderbookData = useCallback(
    (
      auctionId: number,
      chainId: number,
      orderbook: OrderBookData,
      calculatedAuctionPrice: CalculatedAuctionPrice,
      error: Maybe<Error>,
    ) => {
      dispatch(
        appendOrderbookData({ auctionId, chainId, orderbook, calculatedAuctionPrice, error }),
      )
    },
    [dispatch],
  )

  return {
    onPullOrderbookData,
    onResetOrderbookData,
    onAppendOrderbookData,
    onNewBid,
    onRemoveBid,
    onResetUserPrice,
    onResetUserInterestRate,
    onResetUserVolume,
  }
}
export function useOrderbookDataCallback(auctionIdentifer: AuctionIdentifier) {
  const { auctionId } = auctionIdentifer
  const { chainId } = useActiveWeb3React()
  const { onAppendOrderbookData, onResetOrderbookData } = useOrderbookActionHandlers()
  const { shouldLoad } = useOrderbookState()

  const makeCall = useCallback(async () => {
    try {
      if (!chainId || !auctionId) {
        console.log('Missing chain / auction id', { chainId, auctionId })
        return
      }

      const rawData = await additionalServiceApi.getOrderBookData({
        networkId: chainId,
        auctionId,
      })
      const calcultatedAuctionPrice: CalculatedAuctionPrice = CalculatorClearingPrice.fromOrderbook(
        rawData.bids,
        rawData.asks[0],
      )

      onAppendOrderbookData(auctionId, chainId, rawData, calcultatedAuctionPrice, null)
      onResetOrderbookData(auctionId, chainId, rawData, calcultatedAuctionPrice, null)
    } catch (error) {
      logger.error('Error populating orderbook with data', error)
      onResetOrderbookData(
        auctionId,
        chainId,
        { bids: [], asks: [] },
        { price: 0, priceReversed: 0 },
        null,
      )
    }
  }, [chainId, auctionId, onResetOrderbookData, onAppendOrderbookData])

  useEffect(() => {
    makeCall()
  }, [chainId, auctionId, onResetOrderbookData, makeCall])

  useEffect(() => {
    if (shouldLoad) {
      makeCall()
    }
  }, [shouldLoad, makeCall])
}

const getClosestNumber = (numbers: string[], goal: number) => {
  return numbers.reduce(function (prev, curr) {
    return Math.abs(Number(curr) - goal) < Math.abs(Number(prev) - goal) ? curr : prev
  })
}

const exp = (n: number) => round(10 ** n, Math.abs(n))

const buildGranularityOptions = (digits: number) => {
  digits = digits > 0 ? Math.min(digits, 2) : Math.max(digits, -4)
  const middle = exp(digits)
  return [exp(digits + 2), exp(digits + 1), middle, exp(digits - 1), exp(digits - 2)].map((n) =>
    String(n),
  )
}

export const useGranularityOptions = (bids: PricePoint[]) => {
  const [granularityOptions, setGranularityOptions] = useState<string[]>([])
  const [granularity, setGranularity] = useState<string | null>(null)

  useEffect(() => {
    if (bids?.length > 1) {
      const sortedBids = [...bids].sort((a, b) => b.price - a.price)
      const len = sortedBids.length
      const mid = Math.ceil(len / 2)
      const medianDivTen =
        len % 2 == 0
          ? (sortedBids[mid].price + sortedBids[mid - 1].price) / 20
          : sortedBids[mid - 1].price / 10
      const digits =
        medianDivTen > 1
          ? Math.floor(Math.log10(Math.trunc(medianDivTen)) + 1)
          : Math.floor(Math.log10(medianDivTen))
      const granularityOptions = buildGranularityOptions(digits)
      const closest = getClosestNumber(granularityOptions, medianDivTen)
      setGranularity(closest)
      setGranularityOptions(granularityOptions)
    }
  }, [bids])

  return { granularityOptions, granularity, setGranularity }
}
