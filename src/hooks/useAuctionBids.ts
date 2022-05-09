import { useParams } from 'react-router-dom'

import { ApolloError, gql, useQuery } from '@apollo/client'

import { RouteAuctionIdentifier, parseURL } from '../state/orderPlacement/reducer'
import { getLogger } from '../utils/logger'
import { BidInfo } from './useParticipatingAuctionBids'

const logger = getLogger('useAuctionBids')

const bidsQuery = gql`
  query AuctionBidList($auctionId: Int!) {
    bids(
      orderBy: timestamp
      orderDirection: desc
      first: 100
      where: { auction: $auctionId, canceltx: null }
    ) {
      id
      timestamp
      canceltx
      claimtx
      createtx
      payable
      size
      bytes
      auction
    }
  }
`

export const useAuctionBids = (): Maybe<{
  bids: BidInfo[]
  loading: boolean
  error: ApolloError | undefined
}> => {
  const { auctionId } = parseURL(useParams<RouteAuctionIdentifier>())

  const { data, error, loading } = useQuery(bidsQuery, {
    variables: { auctionId: Number(auctionId) },
  })

  if (error) {
    logger.error('Error getting useAuctionBids info', error)
  }

  return { loading, bids: data?.bids, error }
}
