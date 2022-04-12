import { useParams } from 'react-router-dom'

import { ApolloError, gql, useQuery } from '@apollo/client'

import { RouteAuctionIdentifier, parseURL } from '../state/orderPlacement/reducer'
import { getLogger } from '../utils/logger'
import { BidInfo } from './useParticipatingAuctionBids'

const logger = getLogger('useAuctionBids')

const bidsQuery = gql`
  query AuctionBidList($auctionId: String!) {
    bids(first: 100, where: { auction: $auctionId }) {
      id
      timestamp
    }
  }
`

export const useAuctionBids = (): Maybe<{
  bids: BidInfo[]
  error: ApolloError | undefined
}> => {
  const { auctionId } = parseURL(useParams<RouteAuctionIdentifier>())

  const { data, error } = useQuery(bidsQuery, {
    variables: { auctionId: `${auctionId}` },
  })

  if (error) {
    logger.error('Error getting useAuctionBids info', error)
  }

  return { bids: data?.bids, error }
}
