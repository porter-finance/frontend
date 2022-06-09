import { Web3Provider } from '@ethersproject/providers'
import { useWeb3React as useWeb3ReactCore } from '@web3-react/core'
import { useAccount, useBlockNumber, useNetwork, useProvider, useSigner } from 'wagmi'

import { getLogger } from '../utils/logger'

const logger = getLogger('hooks/index')

export function useActiveWeb3React() {
  const { data } = useAccount()
  const { activeChain, error, switchNetwork } = useNetwork()
  const provider = useProvider()
  const { data: blockNumber } = useBlockNumber()
  const { data: signer } = useSigner()

  // TODO remove this
  const context = useWeb3ReactCore<Web3Provider>()

  return {
    account: data?.address,
    active: !!activeChain,
    chainId: activeChain?.id,
    switchNetwork,
    provider,
    error,
    blockNumber,
    library: provider,
    signer,
    // TODO: replace these
    connector: context?.connector,
    activate: context?.activate,
    deactivate: context?.deactivate,
  }
}
