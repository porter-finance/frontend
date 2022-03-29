import { gql, useQuery } from '@apollo/client'

import { getLogger } from '../utils/logger'
import { BondInfo } from './useAllBondInfos'

const logger = getLogger('useBondDetails')

const bondsQuery = (bondId: string) => gql`
  query Bond {
    bond(id: "${bondId}") {
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

export const useBondDetails = (bondId: string): Maybe<{ data: BondInfo; loading: boolean }> => {
  const { data, error, loading } = useQuery(bondsQuery(bondId.toLowerCase()))

  if (error) {
    logger.error('Error getting useBondDetails info', error)
  }

  const info = data?.bond
  return { data: info, loading }
}
