import { getLogger } from '../utils/logger'
import useSWR from 'swr'

const logger = getLogger('useTokenPrice')

const fetcher = (url: string) => fetch(url).then(r => r.json())

export const useTokenPrice = (
    tokenContractAddress: string,
): Maybe<{ data: any; loading: boolean }> => {
    const { data, error } = useSWR(`https://api.coingecko.com/api/v3/simple/token_price/ethereum?vs_currencies=usd&contract_addresses=${tokenContractAddress}`, fetcher)

    if (error) {
        logger.error('Error getting useBondDetails info', error)
    }

    return {
        data: data?.usd,
        loading: !error && !data,
    }
}
