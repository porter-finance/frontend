import { gql, useQuery } from '@apollo/client'
import { useWeb3React } from '@web3-react/core'

import { AccountDetailsDocument, Bond } from '../generated/graphql'
import { getLogger } from '../utils/logger'

const logger = getLogger('useBondsPortfolio')

const bondsQuery = gql`
  query AccountDetails($account: ID!) {
    account(id: $account) {
      tokenBalances {
        amount
        bond {
          id
          state
          name
          symbol
          decimals
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
          clearingPrice
          auctions {
            end
          }
        }
      }
    }
  }
`

export interface TokenBalance {
  amount: number
  bond: Bond
}

export const useBondsPortfolio = () => {
  const { account } = useWeb3React()
  const { data, error, loading } = useQuery(AccountDetailsDocument, {
    variables: { account: (account && account?.toLowerCase()) || '0x00' },
  })

  if (error) {
    logger.error('Error getting useBondsPortfolio info', error)
  }
  const bonds = data?.account?.tokenBalances?.map(({ amount, bond }: TokenBalance) => ({
    ...bond,
    amount,
  }))

  return { data: bonds, loading }
}
