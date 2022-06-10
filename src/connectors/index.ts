import { NetworkConnector } from '@web3-react/network-connector'
import { chain } from 'wagmi'

import { ChainId, NETWORK_CONFIGS } from './../utils/index'

const urls: string[] = []

// TOOD Try to use reduce to improve types
const rpcs: any = {}

const chainIds = Object.keys(NETWORK_CONFIGS).map(Number)
chainIds.forEach((chainId: ChainId) => {
  if (NETWORK_CONFIGS[chainId].rpc) {
    urls[chainId] = NETWORK_CONFIGS[chainId].rpc
    rpcs[chainId] = NETWORK_CONFIGS[chainId].rpc
  }
})

export const isRinkeby = !window.location.href.includes('app.porter')
export const requiredChain = isRinkeby ? chain.rinkeby : chain.mainnet

export const network = new NetworkConnector({ urls, defaultChainId: requiredChain.id })
