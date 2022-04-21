import { gql, useQuery } from '@apollo/client'

import { getLogger } from '../utils/logger'
import { BondInfo } from './useAllBondInfos'

const logger = getLogger('useBondDetails')

const bondsQuery = gql`
  query Bond($bondID: ID!) {
    bond(id: $bondID) {
      id
      name
      symbol
      type
      owner
      maturityDate
      paymentToken
      collateralToken
      collateralRatio
      convertibleRatio
    }
  }
`

export const useBondDetails = (bondId: string): Maybe<{ bond: BondInfo; loading: boolean }> => {
  const { data, error, loading } = useQuery(bondsQuery, {
    variables: { bondID: bondId.toLowerCase() },
  })

  if (error) {
    logger.error('Error getting useBondDetails info', error)
  }

  return { bond: data?.bond, loading }
}
