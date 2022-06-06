import { gql, useQuery } from '@apollo/client'

import { useAccountForSubgraph } from './useBond'

import { AccountDetailsDocument, Bond } from '@/generated/graphql'
import { getLogger } from '@/utils/logger'

const logger = getLogger('useBondsPortfolio')

gql`
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
  const account = useAccountForSubgraph()

  const { data, error, loading } = useQuery(AccountDetailsDocument, {
    variables: { account },
  })

  if (error) {
    logger.error('Error getting useBondsPortfolio info', error)
  }
  const portfolio = []
  data?.account?.tokenBalances?.forEach(({ amount, bond }) => {
    portfolio.push({
      ...bond,
      tokenBalances: [{ amount }],
    })
  })

  return { data: portfolio, loading }
}
