import { useParams } from 'react-router-dom'

import { gql, useQuery } from '@apollo/client'

import { RouteAuctionIdentifier, parseURL } from '../state/orderPlacement/reducer'
import { getLogger } from '../utils/logger'
import { useActiveWeb3React } from './index'

import { BidsForAccountDocument } from '@/generated/graphql'

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
  const { account } = useActiveWeb3React()

  const { data, error, loading } = useQuery(BidsForAccountDocument, {
    variables: {
      auctionId: Number(auctionId || urlAuctionId),
      account: (account && account?.toLowerCase()) || '0x00',
    },
  })

  if (error) {
    logger.error('Error getting useParticipatingAuctionBids info', error)
  }

  return { loading, bids: data?.bids, error }
}
