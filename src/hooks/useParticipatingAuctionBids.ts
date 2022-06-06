import { useParams } from 'react-router-dom'

import { gql, useQuery } from '@apollo/client'

import { useAccountForSubgraph } from './useBond'

import { BidsForAccountDocument } from '@/generated/graphql'
import { RouteAuctionIdentifier, parseURL } from '@/state/orderPlacement/reducer'
import { getLogger } from '@/utils/logger'

const logger = getLogger('useParticipatingAuctionBids')

const bidsQuery = gql`
  query BidsForAccount($account: String!, $auctionId: Int!) {
    bids(
      orderBy: timestamp
      orderDirection: desc
      first: 100
      where: { account: $account, auction: $auctionId }
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

export const useParticipatingAuctionBids = (auctionId?: number) => {
  const { auctionId: urlAuctionId } = parseURL(useParams<RouteAuctionIdentifier>())
  const account = useAccountForSubgraph()

  const { data, error, loading } = useQuery(BidsForAccountDocument, {
    variables: {
      auctionId: Number(auctionId || urlAuctionId),
      account,
    },
  })

  if (error) {
    logger.error('Error getting useParticipatingAuctionBids info', error)
  }

  return { loading, bids: data?.bids, error }
}
