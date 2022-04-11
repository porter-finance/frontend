import { useEffect, useState } from 'react'

import { gql, useQuery } from '@apollo/client'

import { additionalServiceApi } from '../api'
import { PricePoint } from '../api/AdditionalServicesApi'
import { AuctionIdentifier } from '../state/orderPlacement/reducer'
import { getLogger } from '../utils/logger'

const logger = getLogger('useAuctionDetails')

export interface AuctionInfoDetail {
  auctionId: number
  order: PricePoint
  symbolAuctioningToken: string
  symbolBiddingToken: string
  addressAuctioningToken: string
  addressBiddingToken: string
  decimalsAuctioningToken: string
  decimalsBiddingToken: string
  endTimeTimestamp: number
  startingTimestamp: number
  chainId: String
  minimumBiddingAmountPerOrder: string
  orderCancellationEndDate: number | undefined
  exactOrder: string
  isPrivateAuction: boolean
  isAtomicClosureAllowed: boolean
  currentBiddingAmount: string
  minFundingThreshold: string
  allowListManager: string
  allowListSigner: string
}

export interface AuctionGraphDetail {
  id: string
  isSellingPorterBond: string
  bond: {
    id: string
    name: string
    symbol: string
    owner: string
    maturityDate: string
    paymentToken: string
    collateralToken: string
    collateralRatio: string
    convertibleRatio: string
    maxSupply: number
    type: 'simple' | 'convert'
  }
  minimum: string
  size: string
  start: string
  end: string
  filled: string
  clearing: string
  live: boolean
}

const auctionsQuery = gql`
  query Auction($auctionID: String!) {
    auction(id: $auctionID) {
      id
      isSellingPorterBond
      bond {
        id
        name
        symbol
        owner
        maturityDate
        paymentToken
        collateralToken
        collateralRatio
        convertibleRatio
        maxSupply
        type
      }
      minimum
      size
      start
      end
      filled
      clearing
      live
    }
  }
`

export const useAuctionDetails = (
  auctionIdentifier: AuctionIdentifier,
): {
  auctionDetails: Maybe<AuctionInfoDetail>
  auctionInfoLoading: boolean
  graphInfo: Maybe<AuctionGraphDetail>
} => {
  const { auctionId, chainId } = auctionIdentifier
  const { data, error, loading } = useQuery(auctionsQuery, {
    variables: { auctionID: `${auctionId}` },
  })

  if (error) {
    logger.error('Error getting useBondDetails info', error)
  }

  const graphInfo = data?.auction

  const [auctionInfo, setAuctionInfo] = useState<Maybe<AuctionInfoDetail>>(null)
  const [auctionInfoLoading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    let cancelled = false
    const fetchApiData = async () => {
      try {
        if (!chainId || !auctionId) {
          return
        }
        if (!cancelled) {
          setLoading(true)
        }

        const params = {
          networkId: chainId,
          auctionId,
        }

        const auctionInfo = await additionalServiceApi.getAuctionDetails(params)
        if (!cancelled) {
          setLoading(false)
          setAuctionInfo(auctionInfo)
        }
      } catch (error) {
        if (!cancelled) {
          setLoading(false)
          setAuctionInfo(null)
          logger.error('Error getting auction details', error)
        }
      }
    }
    fetchApiData()

    return (): void => {
      cancelled = true
    }
  }, [setAuctionInfo, auctionId, chainId])

  return { auctionDetails: auctionInfo, auctionInfoLoading, graphInfo }
}
