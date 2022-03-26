import { gql, useQuery } from '@apollo/client'

import { getLogger } from '../utils/logger'

const logger = getLogger('useTokenPrice')

const tokenPriceQuery = gql`
  query Token {
    token(address: $tokenContractAddress)
      @rest(
        type: "Price"
        path: "/simple/token_price/ethereum?vs_currencies=usd&contract_addresses={args.address}"
      ) {
      usd
    }
  }
`

export const useTokenPrice = (
  tokenContractAddress: string,
): Maybe<{ data: any; loading: boolean }> => {
  const { data, error, loading } = useQuery(tokenPriceQuery, {
    variables: { tokenContractAddress },
  })

  if (error) {
    logger.error('Error getting useBondDetails info', error)
  }

  return { data, loading }
}
