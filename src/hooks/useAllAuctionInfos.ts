import { gql, useQuery } from '@apollo/client'

import { getLogger } from '../utils/logger'

const logger = getLogger('useAllAuctionInfo')

export interface AuctionInfo {
  id: string
  size: number
  live: boolean
  end: number
  clearing: string
  bond: {
    type: string
    name: string
    collateralToken: string
    symbol: string
  }
  bidding: {
    id: string
    decimals: number
    symbol: string
    name: string
  }
}

const auctionsQuery = gql`
  query AllAuctions {
    auctions(first: 100) {
      id
      size
      end
      live
      clearing
      bond {
        type
        name
        symbol
        collateralToken
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

export const useAllAuctionInfo = (): Maybe<AuctionInfo[]> => {
  const { data, error } = useQuery(auctionsQuery)

  if (error) {
    logger.error('Error getting useAllAuctionInfo info', error)
  }

  return data?.auctions
}
