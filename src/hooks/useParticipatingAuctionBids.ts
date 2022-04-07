import { useParams } from 'react-router-dom'

import { gql, useQuery } from '@apollo/client'

import { RouteAuctionIdentifier, parseURL } from '../state/orderPlacement/reducer'
import { getLogger } from '../utils/logger'
import { useActiveWeb3React } from './index'

const logger = getLogger('useParticipatingAuctionBids')

export interface BidInfo {
  // Concatenation of Gnosis Auction ID, user ID, bid buy amount and bid sell amount
  id: string

  // Bid timestamp
  timestamp: number

  // Gnosis Auction ID
  auction: number

  // Object reference to Account
  account: {
    id: string
    userid: string
  }

  // Quantity of bonds
  size: string

  // Total amount of collateral paid by bidder
  payable: string

  // Encoding of user ID, bid buy amount and bid sell amount
  bytes: string

  // Transaction hash of bid creation
  createtx: string

  // Transaction hash of bid cancellation
  canceltx: string

  // Transaction hash of bid claim
  claimtx: string
}

const bidsQuery = gql`
  query BidList($account: String!, $auctionId: String!) {
    bids(first: 5, where: { account: { id: $account }, auction: $auctionId }) {
      id
      timestamp
    }
  }
`

export const useParticipatingAuctionBids = (): Maybe<BidInfo[]> => {
  const { auctionId } = parseURL(useParams<RouteAuctionIdentifier>())
  const { account } = useActiveWeb3React()

  const { data, error } = useQuery(bidsQuery, {
    variables: { auctionId, account: (account && account?.toLowerCase()) || '0x00' },
  })

  if (error) {
    logger.error('Error getting useParticipatingAuctionBids info', error)
  }

  return data?.bids
}
