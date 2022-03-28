import { gql, useQuery } from '@apollo/client'

import { getLogger } from '../utils/logger'

const logger = getLogger('useAllBondInfo')

export interface BondInfo {
  id: string
  name: string
  symbol: string
  owner: string
  maturityDate: number
  paymentToken: string
  collateralToken: string
  collateralRatio: number
  convertibleRatio: number
}

const bondsQuery = gql`
  query BondList {
    bonds(first: 100) {
      id
      name
      symbol
      owner
      maturityDate
      paymentToken
      collateralToken
      collateralRatio
      convertibleRatio
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
