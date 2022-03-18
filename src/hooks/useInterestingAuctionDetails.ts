import { gql, useQuery } from '@apollo/client'

import { getLogger } from '../utils/logger'
import { AuctionInfo } from './useAllAuctionInfos'

const logger = getLogger('useInterestingAuctionInfo')

const auctionQuery = (closedAuctions: boolean | undefined) => gql`
  query AuctionList {
    auctions(first: 10, where: { live: ${closedAuctions || true} }) {
      id
      minimum
    }
  }
`

interface InterestingAuctionInfo {
  closedAuctions: boolean
}

export function useInterestingAuctionInfo(
  params?: Maybe<InterestingAuctionInfo>,
): Maybe<AuctionInfo[]> {
  const { data, error } = useQuery(auctionQuery(params?.closedAuctions))

  if (error) {
    logger.error('Error getting most interesting auction details info', error)
  }

  return data?.auctions
}
