import { useMemo } from 'react'

import { Contract } from '@ethersproject/contracts'
import IUniswapV2PairABI from '@uniswap/v2-core/build/IUniswapV2Pair.json'

import Bond_ABI from '../constants/abis/bond.json'
import BondFactory_ABI from '../constants/abis/bondFactory.json'
import ERC20_ABI from '../constants/abis/erc20.json'
import { MULTICALL_ABI, MULTICALL_NETWORKS } from '../constants/multicall'
import {
  V1_BOND_FACTORY_ADDRESS,
  V1_EXCHANGE_ABI,
  V1_FACTORY_ABI,
  V1_FACTORY_ADDRESS,
} from '../constants/v1'
import { ChainId, getContract } from '../utils'
import { getLogger } from '../utils/logger'
import { useActiveWeb3React } from './index'

const logger = getLogger('useContract')

// returns null on errors
export function useContract(address?: string, ABI?: any): Maybe<Contract> {
  const { signer } = useActiveWeb3React()

  return useMemo(() => {
    if (!address || !ABI || !signer) return null
    try {
      return getContract(address, ABI, signer)
    } catch (error) {
      logger.error('Failed to get contract', error)
      return null
    }
  }, [address, ABI, signer])
}

export function useV1FactoryContract(): Maybe<Contract> {
  const { chainId } = useActiveWeb3React()
  return useContract(chainId === 1 ? V1_FACTORY_ADDRESS : undefined, V1_FACTORY_ABI)
}

export function useV1ExchangeContract(address: string): Maybe<Contract> {
  return useContract(address, V1_EXCHANGE_ABI)
}

export function useTokenContract(tokenAddress?: string): Maybe<Contract> {
  return useContract(tokenAddress, ERC20_ABI)
}

export function useBondContract(bondAddress?: string): Maybe<Contract> {
  return useContract(bondAddress, Bond_ABI)
}

export function useBondFactoryContract(): Maybe<Contract> {
  const { chainId } = useActiveWeb3React()
  return useContract(V1_BOND_FACTORY_ADDRESS[chainId as ChainId], BondFactory_ABI)
}

export function usePairContract(pairAddress?: string): Maybe<Contract> {
  return useContract(pairAddress, IUniswapV2PairABI.abi)
}

export function useMulticallContract(): Maybe<Contract> {
  const { chainId } = useActiveWeb3React()
  return useContract(MULTICALL_NETWORKS[chainId as ChainId], MULTICALL_ABI)
}
