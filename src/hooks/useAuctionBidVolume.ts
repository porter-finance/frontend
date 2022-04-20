import { useParams } from 'react-router-dom'

import { gql, useQuery } from '@apollo/client'

import { getLogger } from '../utils/logger'

const logger = getLogger('useAuctionBidVolume')

const bidQuery = gql`
  query TotalBidSize($auctionId: Int!) {
    bids(where: { auction: $auctionId }) {
      size
    }
  }
`
const accountBidsQuery = gql`
  query TotalBidSize($auctionId: Int!, $accountId: String!) {
    bids(where: { auction: $auctionId, account: $accountId }) {
      size
    }
  }
`

export const useAuctionBidVolume = (
  accountId?: string,
): Maybe<{ totalBidVolume: number; loading: boolean }> => {
  const { auctionId } = useParams()
  const { data, error, loading } = useQuery(accountId ? accountBidsQuery : bidQuery, {
    variables: { auctionId: Number(auctionId), accountId },
  })

  if (error) {
    logger.error('Error getting useAuctionBidVolume info', error)
  }

  const totalBidVolume =
    Array.isArray(data?.bids) &&
    data.bids.length &&
    data.bids.reduce((a, b) => Number(a.size) + Number(b.size))
  return { totalBidVolume, loading }
}
