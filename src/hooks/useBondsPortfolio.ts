import { gql, useQuery } from '@apollo/client'
import { useWeb3React } from '@web3-react/core'
import { Token } from 'graphql'

import { getLogger } from '../utils/logger'
import { BondInfo } from './useBond'

const logger = getLogger('useBondsPortfolio')

const bondsQuery = gql`
  query BondList($account: ID!) {
    account(id: $account) {
      tokenBalances {
        amount
        bond {
          id
          name
          symbol
          type
          owner
          maturityDate
          paymentToken {
            id
            symbol
          }
          collateralToken {
            id
            symbol
          }
          collateralRatio
          convertibleRatio
          maxSupply
        }
      }
    }
  }
`

export interface TokenBalance {
  amount: number
  bond: BondInfo
}

interface Portfolio {
  data: BondInfo[]
  loading: boolean
}
export const useBondsPortfolio = (): Portfolio => {
  const { account } = useWeb3React()
  const { data, error, loading } = useQuery(bondsQuery, {
    variables: { account: (account && account?.toLowerCase()) || '0x00' },
  })

  if (error) {
    logger.error('Error getting useBondsPortfolio info', error)
  }
  console.log({ data })
  const bonds = data?.account?.tokenBalances?.map(({ amount, bond }: TokenBalance) => ({
    ...bond,
    amount,
  }))

  return { data: bonds, loading }
}
