import { gql, useQuery } from '@apollo/client'

import { AllAuctionsDocument, SingleAuctionDocument } from '@/generated/graphql'
import { getLogger } from '@/utils/logger'

const logger = getLogger('useAuctions')

const auctionQuery = gql`
  query SingleAuction($auctionId: ID!) {
    auction(id: $auctionId) {
      id
      orderCancellationEndDate
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
        state
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

export const useAuction = (auctionId?: number) => {
  const { data, error, loading } = useQuery(SingleAuctionDocument, {
    variables: { auctionId: `${auctionId}` },
  })

  if (error) {
    logger.error('Error getting useAuction info', error)
  }

  return { data: data?.auction, loading }
}

const auctionsQuery = gql`
  query AllAuctions {
    auctions(orderBy: end, orderDirection: desc, first: 100) {
      id
      orderCancellationEndDate
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
        state
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

export const useAuctions = () => {
  const { data, error, loading } = useQuery(AllAuctionsDocument)

  if (error) {
    logger.error('Error getting useAuctions info', error)
  }

  return { data: data?.auctions, loading }
}
