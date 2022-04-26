import { useEffect, useState } from 'react'

import { additionalServiceApi } from '../api'
import { getLogger } from '../utils/logger'
import { Auction } from './useAuction'

const logger = getLogger('useInterestingAuctionInfo')

interface InterestingAuctionInfo {
  closedAuctions: boolean
}

export function useInterestingAuctionInfo(
  params?: Maybe<InterestingAuctionInfo>,
): Maybe<Auction[]> {
  const [auctionInfo, setMostInterestingAuctions] = useState<Maybe<Auction[]>>(null)

  useEffect(() => {
    let cancelled = false

    const fetchApiData = async (): Promise<void> => {
      try {
        if (!additionalServiceApi) {
          throw new Error('missing dependencies in useInterestingAuctionInfo callback')
        }
        const auctionInfo = await additionalServiceApi.getMostInterestingAuctionDetails(
          params?.closedAuctions,
        )
        if (cancelled) return
        setMostInterestingAuctions(auctionInfo)
      } catch (error) {
        if (cancelled) return
        setMostInterestingAuctions(null)
        logger.error('Error getting most interesting auction details info', error)
      }
    }
    fetchApiData()

    return (): void => {
      cancelled = true
    }
  }, [params?.closedAuctions])

  return auctionInfo
}
