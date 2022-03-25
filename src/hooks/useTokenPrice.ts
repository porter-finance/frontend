import { gql, useQuery } from '@apollo/client'

import { getLogger } from '../utils/logger'

const logger = getLogger('useTokenPrice')

const tokenPriceQuery = (tokenContractAddress: string) => gql`
  query Token {
    token @rest(type: "Bond", path: "${tokenContractAddress}") {
      price
    }
  }
`;



export const useBondDetails = (tokenContractAddress: string): Maybe<{ data: any; loading: boolean }> => {
    const { data, error, loading } = useQuery(tokenPriceQuery(tokenContractAddress))

    if (error) {
        logger.error('Error getting useBondDetails info', error)
    }
    console.log({ data })

    return { data, loading }
}
