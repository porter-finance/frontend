import { gql, useQuery } from '@apollo/client'

import { getLogger } from '../utils/logger'

const logger = getLogger('useBondDetails')

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
  isAuction: boolean
}

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
      isAuction
    }
  }
`

export const useBondDetails = (bondId: string): Maybe<{ data: BondInfo; loading: boolean }> => {
  const { data, error, loading } = useQuery(bondsQuery(bondId))

  if (error) {
    logger.error('Error getting useBondDetails info', error)
  }

  const info = data?.bond
  return { data: info, loading }
}
