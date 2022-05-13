import { useParams } from 'react-router-dom'

import { gql, useQuery } from '@apollo/client'

import { RouteAuctionIdentifier, parseURL } from '../state/orderPlacement/reducer'
import { getLogger } from '../utils/logger'

const logger = getLogger('useBondMaturityForAuction')

const bondsQuery = gql`
  query MaturityDateForAuction($auctionId: ID!) {
    auction(id: $auctionId) {
      end
      bond {
        maturityDate
      }
    }
  }
`

export const useBondMaturityForAuction = (): { maturityDate: number; auctionEndDate: number } => {
  const { auctionId } = parseURL(useParams<RouteAuctionIdentifier>())
  const { data, error } = useQuery(bondsQuery, {
    variables: { auctionId: `${auctionId}` },
  })

  if (error) {
    logger.error('Error getting useBondMaturityForAuction info', error)
  }

  return { maturityDate: data?.auction?.bond?.maturityDate, auctionEndDate: data?.auction?.end }
}
