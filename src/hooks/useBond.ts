import { gql, useQuery } from '@apollo/client'
import { useWeb3React } from '@web3-react/core'

import { getLogger } from '../utils/logger'
import { Auction } from './useAuction'

const logger = getLogger('useBond')

export interface BondInfo {
  id: string
  name: string
  symbol: string
  decimals: number
  owner: string
  type: string
  amount?: number
  state: 'active' | 'paidEarly' | 'defaulted' | 'paid'
  maturityDate: number
  createdAt: number
  paymentToken: Token
  collateralToken: Token
  collateralRatio: number
  convertibleRatio: number
  maxSupply: number
  tokenBalances: any
  clearingPrice?: number
  auctions: Auction[]
}

export interface Token {
  id: string
  name: string
  decimals: number
  symbol: string
}

const singleBondQuery = gql`
  query Bond($bondId: ID!, $accountId: String!) {
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
  data: BondInfo
  loading: boolean
}
export const useBond = (bondId: string): SingleBond => {
  const { account } = useWeb3React()

  const { data, error, loading } = useQuery(singleBondQuery, {
    variables: { bondId: bondId.toLowerCase(), accountId: account?.toLowerCase() || '0x00' },
  })

  if (error) {
    logger.error('Error getting useBond info', error)
  }

  const info = data?.bond
  return { data: info, loading }
}

interface AllBonds {
  data: BondInfo[]
  loading: boolean
}
export const useBonds = (): AllBonds => {
  const { data, error, loading } = useQuery(allBondsQuery)

  if (error) {
    logger.error('Error getting useAllBondInfo info', error)
  }
  return { data: data?.bonds, loading }
}
