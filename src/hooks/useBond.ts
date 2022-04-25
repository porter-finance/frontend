import { gql, useQuery } from '@apollo/client'

import { getLogger } from '../utils/logger'

const logger = getLogger('useBond')

export interface BondInfo {
  id: string
  name: string
  symbol: string
  decimals: number
  owner: string
  type: string
  amount?: number
  state: "active" | "paidEarly" | "defaulted" | "paid"
  maturityDate: number
  paymentToken: Token
  collateralToken: Token
  collateralRatio: number
  convertibleRatio: number
  maxSupply: number
  tokenBalances: any
}
export interface Token {
  id: string
  name: string
  decimals: number
  symbol: string
}

const singleBondQuery = gql`
  query Bond($bondID: ID!, $accountID: String!) {
    bond(id: $bondID) {
      id
      name
      symbol
      type
      owner
      maturityDate
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
      tokenBalances(where: { account: $accountID }) {
        amount
      }
      collateralRatio
      convertibleRatio
    }
  }
`
const allBondsQuery = gql`
  query BondList {
    bonds(first: 100) {
      id
      name
      symbol
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
export const useBond = (bondID: string, accountID = ''): SingleBond => {
  const { data, error, loading } = useQuery(singleBondQuery, {
    variables: { bondID: bondID.toLowerCase(), accountID: accountID.toLowerCase() },
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
