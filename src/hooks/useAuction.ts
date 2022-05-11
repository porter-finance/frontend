import { gql, useQuery } from '@apollo/client'

import { getLogger } from '../utils/logger'
import { BondInfo } from './useBond'

const logger = getLogger('useAuctions')

export interface Auction {
  id: string
  live: boolean
  start: number
  end: number
  orderCancellationEndDate: number
  clearingPrice: number
  bond: BondInfo
  bidding: {
    id: string
    decimals: number
    symbol: string
    name: string
  }
  bondsSold: number
  totalPaid: number
  offeringSize: number
  totalBidVolume: number
  minimumFundingThreshold: number
  minimumBidSize: number
  minimumBondPrice: number
}

const auctionQuery = gql`
  query Auction($auctionId: ID!) {
    auction(id: $auctionId) {
      id
      bond {
        id
        name
        symbol
        decimals
        owner
        maturityDate
        paymentToken {
          id
          symbol
        }
        collateralToken {
          id
          symbol
          name
        }
        collateralRatio
        convertibleRatio
        maxSupply
        type
      }
      bidding {
        name
        id
        symbol
        decimals
      }
      start
      end
      bondsSold
      totalPaid
      offeringSize
      totalBidVolume
      minimumFundingThreshold
      minimumBidSize
      minimumBondPrice
      live
      clearingPrice
    }
  }
`

interface AuctionResponse {
  data: Auction
  loading: boolean
}
export const useAuction = (auctionId?: number): AuctionResponse => {
  const { data, error, loading } = useQuery(auctionQuery, { variables: { auctionId } })

  if (error) {
    logger.error('Error getting useAuction info', error)
  }

  return { data: data?.auction, loading }
}

const auctionsQuery = gql`
  query AllAuctions {
    auctions(orderBy: end, orderDirection: desc, first: 100) {
      id
      offeringSize
      end
      live
      clearingPrice
      bond {
        paymentToken {
          id
          name
          symbol
          decimals
        }
        type
        id
        name
        symbol
        collateralToken {
          id
          name
          symbol
          decimals
        }
        maturityDate
      }
      bidding {
        id
        decimals
        symbol
        name
      }
    }
  }
`

interface AuctionsReponse {
  data: Auction[]
  loading: boolean
}
export const useAuctions = (): AuctionsReponse => {
  const { data, error, loading } = useQuery(auctionsQuery)

  if (error) {
    logger.error('Error getting useAuctions info', error)
  }

  return { data: data?.auctions, loading }
}
