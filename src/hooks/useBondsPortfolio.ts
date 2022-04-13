import { gql, useQuery } from '@apollo/client'
import { useWeb3React } from '@web3-react/core'

import { getLogger } from '../utils/logger'
import { BondInfo } from './useAllBondInfos'

const logger = getLogger('useBondsPortfolio')

const bondsQuery = gql`
  query BondList($account: Bytes!) {
    bonds(first: 100, where: { owner: $account }) {
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
      maxSupply
    }
  }
`

export const useBondsPortfolio = (): Maybe<BondInfo[]> => {
  const { account } = useWeb3React()
  const { data, error } = useQuery(bondsQuery, {
    variables: { account: (account && account?.toLowerCase()) || '0x00' },
  })

  if (error) {
    logger.error('Error getting useBondsPortfolio info', error)
  }

  return data?.bonds
}
