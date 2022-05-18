import { gql, useQuery } from '@apollo/client'
import { useWeb3React } from '@web3-react/core'

import { AllBondsDocument, Bond, SingleBondDocument } from '../../src/generated/graphql'
import { getLogger } from '../utils/logger'

const logger = getLogger('useBond')

const singleBondQuery = gql`
  query SingleBond($bondId: ID!, $accountId: String!) {
    bond(id: $bondId) {
      id
      name
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

interface SingleBond {
  data: Bond
  loading: boolean
}
export const useBond = (bondId: string): SingleBond => {
  const { account } = useWeb3React()

  const { data, error, loading } = useQuery<SingleBond>(SingleBondDocument, {
    variables: { bondId: bondId.toLowerCase(), accountId: account?.toLowerCase() || '0x00' },
  })

  if (error) {
    logger.error('Error getting useBond info', error)
  }

  console.log(data)

  const info = data?.bond
  return { data: info, loading }
}

interface AllBonds {
  data: Bond[]
  loading: boolean
}
export const useBonds = (): AllBonds => {
  const { data, error, loading } = useQuery<AllBonds>(AllBondsDocument)

  console.log(data)

  if (error) {
    logger.error('Error getting useAllBondInfo info', error)
  }
  return { data: data?.data?.bonds, loading }
}
