import { gql, useQuery } from '@apollo/client'
import { useWeb3React } from '@web3-react/core'

import {
  AllBondsDocument,
  AllBondsQuery,
  SingleBondDocument,
  SingleBondQuery,
} from '../../src/generated/graphql'
import { getLogger } from '../utils/logger'
import useSafe from './useSafe'

const logger = getLogger('useBond')

const singleBondQuery = gql`
  query SingleBond($bondId: ID!, $accountId: String!) {
    bond(id: $bondId) {
      id
      name
      maxSupply
      amountUnpaid
      state
      symbol
      type
      owner
      maturityDate
      createdAt
      collateralRatio
      decimals
      paymentToken {
        id
        symbol
        name
        decimals
      }
      collateralToken {
        id
        symbol
        name
        decimals
      }
      tokenBalances(where: { account: $accountId }) {
        amount
      }
      auctions {
        end
      }
      collateralRatio
      convertibleRatio
      clearingPrice
    }
  }
`
const allBondsQuery = gql`
  query AllBonds {
    bonds(first: 100) {
      state
      amountUnpaid
      id
      createdAt
      name
      symbol
      decimals
      type
      owner
      maturityDate
      paymentToken {
        id
        symbol
        name
        decimals
      }
      collateralToken {
        id
        symbol
        name
        decimals
      }
      collateralRatio
      convertibleRatio
      maxSupply
    }
  }
`

export const useAccountForSubgraph = () => {
  const { account } = useWeb3React()
  const { safeAddress } = useSafe()

  return (
    (safeAddress && safeAddress?.toLowerCase()) || (account && account?.toLowerCase()) || '0x00'
  )
}

export const useBond = (bondId: string) => {
  const accountId = useAccountForSubgraph()

  const { data, error, loading } = useQuery<SingleBondQuery>(SingleBondDocument, {
    variables: { bondId: bondId.toLowerCase(), accountId },
  })

  if (error) {
    logger.error('Error getting useBond info', error)
  }

  const info = data?.bond
  return { data: info, loading }
}

export const useBonds = () => {
  const { data, error, loading } = useQuery<AllBondsQuery>(AllBondsDocument)

  if (error) {
    logger.error('Error getting useAllBondInfo info', error)
  }
  return { data: data?.bonds, loading }
}
