import { useWeb3React } from '@web3-react/core'
import useSWR from 'swr'

import { getLogger } from '../utils/logger'

const logger = getLogger('useTokenPrice')

const fetcher = (url: string) => fetch(url).then((r) => r.json())
const coinGekoBaseUrl = 'https://api.coingecko.com/api/v3'
const rocketpoolToken = '0xd33526068d116ce69f19a9ee46f0bd304f21a51f'

export const useTokenPrice = (tokenContractAddress: string): { data: any; loading: boolean } => {
  const { chainId } = useWeb3React()
  // The tokens used on the testnet will not exist so no price will be returned
  // this uses rocketpool token instead of the real tokens on any network
  // other than mainnet so we have pricing data
  const realOrTestToken = chainId === 1 ? tokenContractAddress : rocketpoolToken
  const { data, error } = useSWR(
    `${coinGekoBaseUrl}/simple/token_price/ethereum?vs_currencies=usd&contract_addresses=${realOrTestToken}`,
    fetcher,
    { refreshInterval: 60 * 1000 },
  )

  if (error) {
    logger.error('Error getting useTokenPrice info', error)
  }

  return {
    data: data?.[realOrTestToken]?.usd,
    loading: !error && !data,
  }
}

export const useHistoricTokenPrice = (
  tokenContractAddress: string,
  days: number,
): {
  data: [EpochTimeStamp, number]
  loading: boolean
} => {
  const { chainId } = useWeb3React()
  // The tokens used on the testnet will not exist so no price will be returned
  // this uses rocketpool token instead of the real tokens on any network
  // other than mainnet so we have pricing data
  const realOrTestToken = chainId === 1 ? tokenContractAddress : rocketpoolToken
  const url = `${coinGekoBaseUrl}/coins/ethereum/contract/${realOrTestToken}/market_chart/?vs_currency=usd&days=${days}&interval=daily`
  const { data, error } = useSWR(url, fetcher, { refreshInterval: 600 * 1000 })

  if (error) {
    logger.error('Error getting useHistoricTokenPrice info', error)
  }

  return {
    data: data?.prices,
    loading: !error && !data,
  }
}
