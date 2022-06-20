import { gql, useQuery } from '@apollo/client'

import { TokenAllowListDocument } from '@/generated/graphql'
import { getLogger } from '@/utils/logger'

const logger = getLogger('useTokenAllowList')

export const useTokenAllowList = () => {
  const { data, error, loading } = useQuery(TokenAllowListDocument)

  if (error) {
    logger.error('Error getting useTokenAllowList info', error)
  }
  const allowedTokens = data?.bondFactories?.flatMap(({ tokenAllowList }) => tokenAllowList)
  return { data: allowedTokens, error, loading }
}

const tokenAllowListQuery = gql`
  query TokenAllowList {
    bondFactories(first: 100) {
      id
      tokenAllowList
    }
  }
`
