import { gql, useQuery } from '@apollo/client'
import { useWeb3React } from '@web3-react/core'

import { getLogger } from '../utils/logger'
import { BondInfo } from './useAllBondInfos'

const logger = getLogger('useBondsPortfolio')

const bondsQuery = (account: string | null | undefined) => gql`
  query BondList {
    bonds(first: 100, where: { owner: "${account || '0x00'}" }) {
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

export const useBondsPortfolio = (): Maybe<BondInfo[]> => {
  const { account } = useWeb3React()
  const { data, error } = useQuery(bondsQuery(account))

  if (error) {
    logger.error('Error getting useBondsPortfolio info', error)
  }

  return data?.bonds
}
