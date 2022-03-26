import { useWeb3React } from '@web3-react/core'
import useSWR from 'swr'

import { getLogger } from '../utils/logger'

const logger = getLogger('useTokenPrice')

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export const useTokenPrice = (
  tokenContractAddress: string,
): Maybe<{ data: any; loading: boolean }> => {
  const { chainId } = useWeb3React()
  const rocketpoolToken = '0xd33526068d116ce69f19a9ee46f0bd304f21a51f'
  // The tokens used on the testnet will not exist so no price will be returned
  // this uses rocketpool token instead of the real tokens on any network
  // other than mainnet so we have pricing data
  const realOrTestToken = chainId === 1 ? tokenContractAddress : rocketpoolToken
  const { data, error } = useSWR(
    `https://api.coingecko.com/api/v3/simple/token_price/ethereum?vs_currencies=usd&contract_addresses=${realOrTestToken}`,
    fetcher,
    { refreshInterval: 5000 },
  )

  if (error) {
    logger.error('Error getting useBondDetails info', error)
  }
  console.log({ data })
  return {
    data: data?.[realOrTestToken]?.usd,
    loading: !error && !data,
  }
}
