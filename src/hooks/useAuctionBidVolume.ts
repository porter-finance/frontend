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

export const useAuctionBidVolume = (): Maybe<{ totalBidVolume: number; loading: boolean }> => {
  const { auctionId } = useParams()
  const { data, error, loading } = useQuery(bidQuery, {
    variables: { auctionId: Number(auctionId) },
  })

  if (error) {
    logger.error('Error getting useAuctionBidVolume info', error)
  }

  const totalBidVolume = data?.bids.reduce((a, b) => Number(a.size) + Number(b.size))
  return { totalBidVolume, loading }
}
