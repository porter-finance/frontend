import { gql, useQuery } from '@apollo/client'

import { getLogger } from '../utils/logger'

const logger = getLogger('useAllBondInfo')

export interface BondInfo {
  id: string
  name: string
  symbol: string
  owner: string
  maturityDate: number
  borrowingToken: string
  collateralToken: string
  backingRatio: number
  convertibilityRatio: number
  isAuction: boolean
}

const bondsQuery = gql`
  query BondList {
    bonds(first: 100) {
      id
      name
      symbol
      owner
      maturityDate
      borrowingToken
      collateralToken
      backingRatio
      convertibilityRatio
      isAuction
    }
  }
`

export const useAllBondInfo = (): Maybe<BondInfo[]> => {
  const { data, error } = useQuery(bondsQuery)

  if (error) {
    logger.error('Error getting useAllBondInfo info', error)
  }

  return data?.bonds
}
